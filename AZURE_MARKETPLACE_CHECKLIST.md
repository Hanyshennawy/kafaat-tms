# Kafaat TMS - Azure Marketplace SaaS Offer Checklist

## Overview

This document provides a comprehensive checklist for publishing the Kafaat Talent Management System as a transactable SaaS offer in Azure Marketplace.

---

## Prerequisites

### Partner Center Account
- [ ] Microsoft Partner Network (MPN) membership active
- [ ] Partner Center account created and verified
- [ ] Publisher profile completed
- [ ] Banking and tax information submitted
- [ ] Legal agreements accepted

### Azure Resources
- [ ] Azure subscription for hosting (production)
- [ ] Azure AD tenant for app registrations
- [ ] Key Vault for secrets management
- [ ] Application Insights configured

---

## Technical Requirements

### 1. Landing Page ✅
**Endpoint:** `https://your-domain.com/api/marketplace/landing`

The landing page receives customers after they purchase your offer.

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Accept marketplace token via query param | ✅ | `req.query.token` |
| Resolve subscription using SaaS Fulfillment API | ✅ | `marketplaceService.resolveSubscription()` |
| Create tenant/account | ✅ | `tenantService.createTenant()` |
| Activate subscription | ✅ | `marketplaceService.activateSubscription()` |
| Redirect to application | ✅ | Redirects to `/onboarding` |

### 2. Webhook Endpoint ✅
**Endpoint:** `https://your-domain.com/api/marketplace/webhook`

Receives lifecycle notifications from Azure Marketplace.

| Event | Status | Implementation |
|-------|--------|----------------|
| ChangePlan | ✅ | Updates tenant plan |
| ChangeQuantity | ✅ | Updates seat count |
| Suspend | ✅ | Suspends tenant |
| Reinstate | ✅ | Reactivates tenant |
| Unsubscribe | ✅ | Cancels tenant |
| Renew | ✅ | Logs renewal |

### 3. Health Check Endpoint ✅
**Endpoint:** `https://your-domain.com/health`

| Requirement | Status |
|------------|--------|
| Returns 200 OK when healthy | ✅ |
| JSON response with status | ✅ |
| Version information | ✅ |

### 4. Azure AD SSO ✅
**Endpoints:**
- Login: `/api/auth/azure/login`
- Callback: `/api/auth/azure/callback`
- Logout: `/api/auth/azure/logout`

| Requirement | Status |
|------------|--------|
| Multi-tenant Azure AD support | ✅ |
| User provisioning | ✅ |
| Session management | ✅ |

### 5. Usage Metering ✅
**Implementation:** `server/marketplace/azure-marketplace.ts`

| Dimension | Status | Description |
|-----------|--------|-------------|
| active_users | ✅ | Monthly active users |
| storage_gb | ✅ | Storage consumption |
| api_calls | ✅ | API request count |
| ai_requests | ✅ | AI service calls |
| license_verifications | ✅ | Blockchain verifications |

---

## SaaS Offer Configuration

### Offer Details
```
Publisher ID: [Your Publisher ID]
Offer ID: kafaat-tms
Offer Name: Kafaat Talent Management System
Categories: 
  - Human Resources
  - Education
  - Government
```

### Plans Configuration

#### Plan 1: Starter
```yaml
Plan ID: starter
Display Name: Starter
Price: 500 AED/month
Features:
  - Up to 50 users
  - 3 modules (Career, Performance, Engagement)
  - Email support
  - 10 GB storage
```

#### Plan 2: Professional
```yaml
Plan ID: professional
Display Name: Professional
Price: 2,000 AED/month
Features:
  - Up to 250 users
  - 7 modules (All core modules)
  - Priority support
  - 100 GB storage
  - AI features
```

#### Plan 3: Enterprise
```yaml
Plan ID: enterprise
Display Name: Enterprise
Price: 5,000 AED/month
Features:
  - Unlimited users
  - All 10 modules
  - Dedicated support
  - Unlimited storage
  - Custom integrations
  - Blockchain verification
```

---

## Technical Configuration

### Required App Settings
```bash
# Azure AD
AZURE_AD_CLIENT_ID=<app-registration-client-id>
AZURE_AD_CLIENT_SECRET=<store-in-key-vault>
AZURE_AD_TENANT_ID=common
AZURE_AD_REDIRECT_URI=https://your-domain.com/api/auth/azure/callback

# Marketplace
AZURE_MARKETPLACE_PUBLISHER_ID=<your-publisher-id>
AZURE_MARKETPLACE_OFFER_ID=kafaat-tms
AZURE_MARKETPLACE_TENANT_ID=<your-azure-tenant-id>
AZURE_MARKETPLACE_CLIENT_ID=<marketplace-app-client-id>
AZURE_MARKETPLACE_CLIENT_SECRET=<store-in-key-vault>

# Database
DATABASE_URL=<azure-mysql-connection-string>

# Security
JWT_SECRET=<store-in-key-vault>
```

### Azure App Registration

1. **SaaS Application Registration**
   - Name: Kafaat TMS SaaS
   - Supported account types: Accounts in any organizational directory (Multi-tenant)
   - Redirect URI: `https://your-domain.com/api/auth/azure/callback`

2. **API Permissions**
   - `User.Read` (Delegated)
   - `openid` (Delegated)
   - `profile` (Delegated)
   - `email` (Delegated)

3. **Certificates & Secrets**
   - Create client secret
   - Store in Azure Key Vault

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Custom domain configured
- [ ] Key Vault secrets populated

### Deployment
```bash
# Deploy infrastructure
cd azure
az deployment group create \
  --name "kafaat-tms-$(date +%Y%m%d)" \
  --resource-group kafaat-tms-rg \
  --template-file main.bicep \
  --parameters \
    environment=production \
    location=uaenorth \
    dbAdminUsername=kafaatadmin \
    dbAdminPassword='<secure-password>' \
    azureAdClientId='<client-id>' \
    azureAdClientSecret='<client-secret>' \
    marketplacePublisherId='<publisher-id>' \
    marketplaceOfferId='kafaat-tms'
```

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Landing page accessible
- [ ] Webhook endpoint accessible
- [ ] Azure AD SSO working
- [ ] Database connectivity verified

---

## Partner Center Submission

### Technical Configuration Tab
```
Landing page URL: https://your-domain.com/api/marketplace/landing
Connection webhook: https://your-domain.com/api/marketplace/webhook
Azure Active Directory tenant ID: <your-tenant-id>
Azure Active Directory application ID: <your-app-id>
```

### Marketing Content
- [ ] Offer description (min 200 characters)
- [ ] Short description (max 256 characters)
- [ ] Search keywords
- [ ] Privacy policy URL
- [ ] Terms of use URL
- [ ] Support URL
- [ ] Screenshots (min 1, max 5)
- [ ] Logos (48x48, 90x90, 216x216, optional 255x115)

### Review & Publish
- [ ] Preview offer in staging
- [ ] Test purchase flow
- [ ] Validate landing page
- [ ] Test webhook notifications
- [ ] Submit for certification

---

## TDRA Compliance Notes

⚠️ **Important:** This system is designed to support TDRA-aligned operation but does not constitute legal certification. Organizations must:

1. Obtain formal legal advice regarding TDRA requirements
2. Apply for appropriate ICT service licenses if required
3. Ensure data processing agreements are in place
4. Conduct privacy impact assessments
5. Implement appropriate security controls

### Data Residency
- Primary region: UAE North (Dubai)
- Backup region: UAE Central (Abu Dhabi)
- All customer data stored in UAE regions

### Compliance Features Implemented
- [x] Consent management
- [x] Data subject access requests
- [x] Audit logging
- [x] Data retention policies
- [x] Encryption at rest and in transit
- [x] Role-based access control

---

## Support & Contacts

- **Technical Support:** support@kafaat.ae
- **Sales:** sales@kafaat.ae
- **Documentation:** https://docs.kafaat.ae
- **Status Page:** https://status.kafaat.ae

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-10 | Initial SaaS transformation |
