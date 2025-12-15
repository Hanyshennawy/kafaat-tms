// UAE MOE Talent Management System - Azure Infrastructure
// Multi-tenant SaaS Configuration for Azure Marketplace
// TDRA-aligned deployment with UAE data residency

@description('Environment name (dev, staging, production)')
@allowed([
  'dev'
  'staging'
  'production'
])
param environment string = 'production'

@description('Location for all resources - UAE regions preferred for TDRA compliance')
@allowed([
  'uaenorth'
  'uaecentral'
  'qatarcentral'
])
param location string = 'uaenorth'

@description('Application name prefix')
param appName string = 'kafaat-tms'

@description('Database administrator username')
@secure()
param dbAdminUsername string

@description('Database administrator password')
@secure()
param dbAdminPassword string

@description('TrusTell API Key for blockchain verification')
@secure()
param trustellApiKey string = ''

@description('TrusTell API Secret for blockchain verification')
@secure()
param trustellApiSecret string = ''

@description('Azure AD Client ID for SSO')
@secure()
param azureAdClientId string = ''

@description('Azure AD Client Secret for SSO')
@secure()
param azureAdClientSecret string = ''

@description('Azure Marketplace Publisher ID')
param marketplacePublisherId string = ''

@description('Azure Marketplace Offer ID')
param marketplaceOfferId string = ''

// Variables
var uniqueSuffix = uniqueString(resourceGroup().id)
var appServicePlanName = '${appName}-asp-${environment}-${uniqueSuffix}'
var webAppName = '${appName}-app-${environment}-${uniqueSuffix}'
var dbServerName = '${appName}-db-${environment}-${uniqueSuffix}'
var dbName = 'talent_management'
var storageAccountName = '${replace(appName, '-', '')}st${environment}${take(uniqueSuffix, 6)}'
var appInsightsName = '${appName}-ai-${environment}-${uniqueSuffix}'
var keyVaultName = '${appName}-kv-${environment}-${take(uniqueSuffix, 6)}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: environment == 'production' ? 'P1v3' : 'B2'
    tier: environment == 'production' ? 'PremiumV3' : 'Basic'
    capacity: environment == 'production' ? 2 : 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        {
          name: 'NODE_ENV'
          value: environment
        }
        {
          name: 'DATABASE_URL'
          value: 'mysql://${dbAdminUsername}:${dbAdminPassword}@${dbServer.properties.fullyQualifiedDomainName}:3306/${dbName}?ssl=true'
        }
        {
          name: 'JWT_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/jwt-secret/)'
        }
        {
          name: 'TRUSTELL_API_URL'
          value: 'https://api.trustell.ae/v1'
        }
        {
          name: 'TRUSTELL_API_KEY'
          value: trustellApiKey
        }
        {
          name: 'TRUSTELL_API_SECRET'
          value: trustellApiSecret
        }
        // Azure AD SSO Configuration
        {
          name: 'AZURE_AD_CLIENT_ID'
          value: azureAdClientId
        }
        {
          name: 'AZURE_AD_CLIENT_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/azure-ad-client-secret/)'
        }
        {
          name: 'AZURE_AD_TENANT_ID'
          value: 'common'
        }
        {
          name: 'AZURE_AD_REDIRECT_URI'
          value: 'https://${webAppName}.azurewebsites.net/api/auth/azure/callback'
        }
        // Azure Marketplace Configuration
        {
          name: 'AZURE_MARKETPLACE_PUBLISHER_ID'
          value: marketplacePublisherId
        }
        {
          name: 'AZURE_MARKETPLACE_OFFER_ID'
          value: marketplaceOfferId
        }
        {
          name: 'AZURE_MARKETPLACE_TENANT_ID'
          value: subscription().tenantId
        }
        {
          name: 'AZURE_MARKETPLACE_CLIENT_ID'
          value: azureAdClientId
        }
        {
          name: 'AZURE_MARKETPLACE_CLIENT_SECRET'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/marketplace-client-secret/)'
        }
        // TDRA Compliance - Data Region
        {
          name: 'DATA_REGION'
          value: location
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'STORAGE_ACCOUNT_KEY'
          value: storageAccount.listKeys().keys[0].value
        }
      ]
    }
  }
}

// MySQL Database Server
resource dbServer 'Microsoft.DBforMySQL/flexibleServers@2021-12-01-preview' = {
  name: dbServerName
  location: location
  sku: {
    name: environment == 'production' ? 'Standard_D4ds_v4' : 'Standard_B2s'
    tier: environment == 'production' ? 'GeneralPurpose' : 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminUsername
    administratorLoginPassword: dbAdminPassword
    version: '8.0.21'
    storage: {
      storageSizeGB: environment == 'production' ? 128 : 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: environment == 'production' ? 35 : 7
      geoRedundantBackup: environment == 'production' ? 'Enabled' : 'Disabled'
    }
    highAvailability: environment == 'production' ? {
      mode: 'ZoneRedundant'
    } : null
  }
}

// MySQL Database
resource database 'Microsoft.DBforMySQL/flexibleServers/databases@2021-12-01-preview' = {
  parent: dbServer
  name: dbName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

// Firewall rule to allow Azure services
resource dbFirewallRule 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2021-12-01-preview' = {
  parent: dbServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: environment == 'production' ? 'Standard_ZRS' : 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// Blob Service
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
}

// Containers
resource documentsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: blobService
  name: 'documents'
  properties: {
    publicAccess: 'None'
  }
}

resource certificatesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: blobService
  name: 'certificates'
  properties: {
    publicAccess: 'None'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: environment == 'production' ? 90 : 30
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enableRbacAuthorization: true
    accessPolicies: []
  }
}

// Store Azure AD Client Secret in Key Vault
resource marketplaceClientSecret 'Microsoft.KeyVault/vaults/secrets@2022-07-01' = if (!empty(azureAdClientSecret)) {
  parent: keyVault
  name: 'marketplace-client-secret'
  properties: {
    value: azureAdClientSecret
  }
}

// Grant Web App access to Key Vault
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2022-07-01' = {
  parent: keyVault
  name: 'add'
  properties: {
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: webApp.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppName string = webApp.name
output dbServerFqdn string = dbServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output keyVaultName string = keyVault.name
