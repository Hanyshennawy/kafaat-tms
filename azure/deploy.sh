#!/bin/bash

# UAE MOE Talent Management System - Azure Deployment Script
# This script deploys the application to Azure using Bicep templates

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}UAE MOE Talent Management System${NC}"
echo -e "${GREEN}Azure Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI is not installed.${NC}"
    echo "Please install Azure CLI from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
echo "Checking Azure login status..."
az account show &> /dev/null || {
    echo -e "${YELLOW}Not logged in to Azure. Please login:${NC}"
    az login
}

# Get parameters
echo ""
echo "Please provide the following information:"
echo ""

read -p "Environment (dev/staging/production): " ENVIRONMENT
read -p "Resource Group Name: " RESOURCE_GROUP
read -p "Location (e.g., uaenorth, eastus): " LOCATION
read -p "Database Admin Username: " DB_ADMIN_USERNAME
read -sp "Database Admin Password: " DB_ADMIN_PASSWORD
echo ""
read -p "TrusTell API Key (optional, press Enter to skip): " TRUSTELL_API_KEY
read -sp "TrusTell API Secret (optional, press Enter to skip): " TRUSTELL_API_SECRET
echo ""

# Create resource group if it doesn't exist
echo ""
echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Deploy infrastructure
echo ""
echo -e "${YELLOW}Deploying Azure infrastructure...${NC}"
echo "This may take 10-15 minutes..."

DEPLOYMENT_NAME="tms-deployment-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$(dirname "$0")/main.bicep" \
  --parameters \
    environment="$ENVIRONMENT" \
    location="$LOCATION" \
    dbAdminUsername="$DB_ADMIN_USERNAME" \
    dbAdminPassword="$DB_ADMIN_PASSWORD" \
    trustellApiKey="$TRUSTELL_API_KEY" \
    trustellApiSecret="$TRUSTELL_API_SECRET"

# Get outputs
echo ""
echo "Retrieving deployment outputs..."

WEB_APP_NAME=$(az deployment group show \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.outputs.webAppName.value \
  --output tsv)

WEB_APP_URL=$(az deployment group show \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.outputs.webAppUrl.value \
  --output tsv)

DB_SERVER_FQDN=$(az deployment group show \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.outputs.dbServerFqdn.value \
  --output tsv)

# Build application
echo ""
echo -e "${YELLOW}Building application...${NC}"
cd "$(dirname "$0")/.."
pnpm install
pnpm build

# Deploy application code
echo ""
echo -e "${YELLOW}Deploying application code...${NC}"
az webapp deployment source config-zip \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEB_APP_NAME" \
  --src "$(pwd)/dist.zip"

# Run database migrations
echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
echo "Please run the following command manually after deployment:"
echo "pnpm db:push"

# Display success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application URL: $WEB_APP_URL"
echo "Web App Name: $WEB_APP_NAME"
echo "Database Server: $DB_SERVER_FQDN"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure custom domain (if needed)"
echo "2. Set up SSL certificate"
echo "3. Configure OAuth redirect URLs"
echo "4. Run database migrations"
echo "5. Create initial admin user"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
