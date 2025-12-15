-- ============================================================================
-- KAFAAT 1.0 - MULTI-TENANT SAAS MIGRATION
-- This migration adds multi-tenancy support for Azure Marketplace SaaS
-- ============================================================================

-- ============================================================================
-- TENANTS TABLE
-- Central tenant registry for all organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  azure_tenant_id VARCHAR(255) UNIQUE,
  domain VARCHAR(255),
  logo_url VARCHAR(512),
  settings JSON,
  
  -- TDRA Compliance
  data_region VARCHAR(50) NOT NULL DEFAULT 'ae-north-1',
  gdpr_compliant BOOLEAN NOT NULL DEFAULT TRUE,
  tdra_compliant BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Status
  status ENUM('active', 'suspended', 'pending', 'cancelled') NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenants_azure_tenant_id (azure_tenant_id),
  INDEX idx_tenants_slug (slug),
  INDEX idx_tenants_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TENANT USERS TABLE
-- Maps users to tenants with roles
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  azure_user_id VARCHAR(255),
  role ENUM('owner', 'admin', 'member', 'viewer') NOT NULL DEFAULT 'member',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Status
  status ENUM('active', 'invited', 'suspended') NOT NULL DEFAULT 'active',
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_tenant_user (tenant_id, user_id),
  INDEX idx_tenant_users_tenant_id (tenant_id),
  INDEX idx_tenant_users_user_id (user_id),
  INDEX idx_tenant_users_azure_user_id (azure_user_id),
  
  CONSTRAINT fk_tenant_users_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- Azure Marketplace subscription management
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  
  -- Azure Marketplace Identifiers
  marketplace_subscription_id VARCHAR(255) UNIQUE,
  marketplace_offer_id VARCHAR(255),
  marketplace_plan_id VARCHAR(255),
  marketplace_publisher_id VARCHAR(255),
  
  -- Plan Details
  plan_name VARCHAR(100) NOT NULL,
  plan_type ENUM('free', 'basic', 'standard', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
  
  -- Billing
  billing_term ENUM('monthly', 'annual') NOT NULL DEFAULT 'monthly',
  seat_count INT NOT NULL DEFAULT 1,
  price_per_seat DECIMAL(10, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'AED',
  
  -- Status & Lifecycle
  status ENUM('active', 'suspended', 'pending', 'cancelled', 'unsubscribed') NOT NULL DEFAULT 'pending',
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Azure SaaS State
  saas_subscription_status VARCHAR(50),
  beneficiary_email VARCHAR(255),
  beneficiary_tenant_id VARCHAR(255),
  purchaser_email VARCHAR(255),
  purchaser_tenant_id VARCHAR(255),
  
  -- Activation
  is_activated BOOLEAN NOT NULL DEFAULT FALSE,
  activated_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_subscriptions_tenant_id (tenant_id),
  INDEX idx_subscriptions_marketplace_id (marketplace_subscription_id),
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_plan_type (plan_type),
  
  CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- USAGE RECORDS TABLE
-- Metered billing for Azure Marketplace
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  subscription_id INT NOT NULL,
  
  -- Metering Dimensions (Azure Marketplace)
  dimension VARCHAR(100) NOT NULL,
  quantity DECIMAL(18, 4) NOT NULL,
  effective_start_time TIMESTAMP NOT NULL,
  
  -- Azure Metering API Response
  usage_event_id VARCHAR(255),
  metering_status ENUM('pending', 'reported', 'accepted', 'rejected', 'duplicate') NOT NULL DEFAULT 'pending',
  metering_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reported_at TIMESTAMP,
  
  INDEX idx_usage_records_tenant_id (tenant_id),
  INDEX idx_usage_records_subscription_id (subscription_id),
  INDEX idx_usage_records_dimension (dimension),
  INDEX idx_usage_records_metering_status (metering_status),
  INDEX idx_usage_records_effective_start_time (effective_start_time),
  
  CONSTRAINT fk_usage_records_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT fk_usage_records_subscription FOREIGN KEY (subscription_id) 
    REFERENCES subscriptions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TENANT AUDIT LOGS TABLE
-- TDRA-compliant audit logging for tenants
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT,
  
  -- Action Details
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  
  -- Request Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Change Details
  old_values JSON,
  new_values JSON,
  metadata JSON,
  
  -- TDRA Compliance Fields
  data_classification ENUM('public', 'internal', 'confidential', 'restricted') DEFAULT 'internal',
  retention_until TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_audit_logs_tenant_id (tenant_id),
  INDEX idx_tenant_audit_logs_user_id (user_id),
  INDEX idx_tenant_audit_logs_action (action),
  INDEX idx_tenant_audit_logs_resource_type (resource_type),
  INDEX idx_tenant_audit_logs_created_at (created_at),
  
  CONSTRAINT fk_tenant_audit_logs_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CONSENT RECORDS TABLE
-- TDRA/GDPR consent management
-- ============================================================================
CREATE TABLE IF NOT EXISTS consent_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  
  -- Consent Details
  consent_type VARCHAR(100) NOT NULL,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Validity
  valid_until TIMESTAMP,
  revoked_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_consent_records_tenant_id (tenant_id),
  INDEX idx_consent_records_user_id (user_id),
  INDEX idx_consent_records_consent_type (consent_type),
  INDEX idx_consent_records_granted (granted),
  
  CONSTRAINT fk_consent_records_tenant FOREIGN KEY (tenant_id) 
    REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MARKETPLACE WEBHOOKS LOG TABLE
-- Log all webhook events from Azure Marketplace
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_webhooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Webhook Details
  action VARCHAR(100) NOT NULL,
  subscription_id VARCHAR(255) NOT NULL,
  
  -- Request
  request_body JSON,
  request_headers JSON,
  
  -- Response
  response_status INT,
  response_body JSON,
  
  -- Processing
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMP,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_marketplace_webhooks_action (action),
  INDEX idx_marketplace_webhooks_subscription_id (subscription_id),
  INDEX idx_marketplace_webhooks_processed (processed),
  INDEX idx_marketplace_webhooks_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ADD TENANT_ID TO EXISTING TABLES (Optional - for full multi-tenancy)
-- Uncomment and run these if you want to retrofit existing tables
-- ============================================================================

-- ALTER TABLE users ADD COLUMN tenant_id INT AFTER id;
-- ALTER TABLE users ADD INDEX idx_users_tenant_id (tenant_id);
-- ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ALTER TABLE employees ADD COLUMN tenant_id INT AFTER id;
-- ALTER TABLE employees ADD INDEX idx_employees_tenant_id (tenant_id);
-- ALTER TABLE employees ADD CONSTRAINT fk_employees_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- ============================================================================
-- SEED DATA - DEFAULT PLANS
-- ============================================================================
-- These are referenced by the catalog service

-- INSERT INTO tenants (name, slug, status, data_region) VALUES 
--   ('System', 'system', 'active', 'ae-north-1');

-- ============================================================================
-- STORED PROCEDURES FOR TENANT OPERATIONS
-- ============================================================================

DELIMITER //

-- Procedure to get tenant statistics
CREATE PROCEDURE IF NOT EXISTS get_tenant_statistics(IN p_tenant_id INT)
BEGIN
  SELECT 
    t.id,
    t.name,
    t.status,
    s.plan_name,
    s.seat_count,
    s.status as subscription_status,
    (SELECT COUNT(*) FROM tenant_users WHERE tenant_id = p_tenant_id) as user_count,
    (SELECT COUNT(*) FROM tenant_audit_logs WHERE tenant_id = p_tenant_id) as audit_count
  FROM tenants t
  LEFT JOIN subscriptions s ON s.tenant_id = t.id AND s.status = 'active'
  WHERE t.id = p_tenant_id;
END //

-- Procedure to report usage to Azure Marketplace
CREATE PROCEDURE IF NOT EXISTS record_usage(
  IN p_tenant_id INT,
  IN p_subscription_id INT,
  IN p_dimension VARCHAR(100),
  IN p_quantity DECIMAL(18, 4)
)
BEGIN
  INSERT INTO usage_records (tenant_id, subscription_id, dimension, quantity, effective_start_time)
  VALUES (p_tenant_id, p_subscription_id, p_dimension, p_quantity, NOW());
END //

DELIMITER ;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  t.slug,
  s.plan_name,
  s.plan_type,
  s.seat_count,
  s.status as subscription_status,
  s.current_period_end,
  s.marketplace_subscription_id
FROM tenants t
INNER JOIN subscriptions s ON s.tenant_id = t.id
WHERE s.status = 'active';

CREATE OR REPLACE VIEW v_usage_summary AS
SELECT 
  tenant_id,
  dimension,
  DATE(effective_start_time) as usage_date,
  SUM(quantity) as total_quantity,
  COUNT(*) as event_count
FROM usage_records
GROUP BY tenant_id, dimension, DATE(effective_start_time);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
