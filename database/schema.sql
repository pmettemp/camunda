-- Policy Management System Database Schema
-- MySQL/MariaDB compatible

-- Create database
CREATE DATABASE IF NOT EXISTS policy_management;
USE policy_management;

-- Users table for authentication and user management
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('author', 'reviewer', 'admin', 'legal-team', 'compliance-team', 'department-manager', 'senior-manager') NOT NULL DEFAULT 'author',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_department (department)
);

-- Policies table - main policy storage
CREATE TABLE policies (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('HR', 'IT', 'Finance', 'Legal', 'Compliance', 'Operations', 'Security') NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    risk_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Low',
    requires_legal_review BOOLEAN DEFAULT FALSE,
    requires_compliance_review BOOLEAN DEFAULT FALSE,
    stakeholders JSON, -- Array of email addresses
    tags JSON, -- Array of tags
    author_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(200) NOT NULL,
    status ENUM('draft', 'under_review', 'approved', 'rejected', 'published', 'archived', 'expired') NOT NULL DEFAULT 'draft',
    version INT NOT NULL DEFAULT 1,
    content_word_count INT DEFAULT 0,
    process_instance_id VARCHAR(100), -- Camunda process instance ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_policies_category (category),
    INDEX idx_policies_status (status),
    INDEX idx_policies_author (author_id),
    INDEX idx_policies_risk_level (risk_level),
    INDEX idx_policies_effective_date (effective_date),
    INDEX idx_policies_expiry_date (expiry_date),
    INDEX idx_policies_process_instance (process_instance_id),
    INDEX idx_policies_created_at (created_at)
);

-- Policy versions table - track policy changes over time
CREATE TABLE policy_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    version_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    changes_summary TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_by_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_policy_version (policy_id, version_number),
    INDEX idx_policy_versions_policy_id (policy_id),
    INDEX idx_policy_versions_created_at (created_at)
);

-- Audit logs table - comprehensive audit trail
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- created, updated, approved, rejected, published, etc.
    user_id VARCHAR(50),
    user_name VARCHAR(200),
    details JSON, -- Additional context data
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_policy_id (policy_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_created_at (created_at)
);

-- Policy reviews table - track review decisions and comments
CREATE TABLE policy_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    reviewer_id VARCHAR(50) NOT NULL,
    reviewer_name VARCHAR(200) NOT NULL,
    reviewer_type VARCHAR(50), -- Legal, Compliance, Department Manager, etc.
    decision ENUM('approved', 'rejected', 'needs_changes') NOT NULL,
    comments TEXT,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    task_id VARCHAR(100), -- Camunda task ID
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_policy_reviews_policy_id (policy_id),
    INDEX idx_policy_reviews_reviewer_id (reviewer_id),
    INDEX idx_policy_reviews_decision (decision),
    INDEX idx_policy_reviews_reviewed_at (reviewed_at)
);

-- Policy attachments table - store file attachments
CREATE TABLE policy_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    uploaded_by_name VARCHAR(200) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_policy_attachments_policy_id (policy_id),
    INDEX idx_policy_attachments_uploaded_at (uploaded_at)
);

-- Policy notifications table - track notification history
CREATE TABLE policy_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    notification_type ENUM('created', 'approved', 'rejected', 'published', 'expiring', 'expired') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(200),
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    INDEX idx_policy_notifications_policy_id (policy_id),
    INDEX idx_policy_notifications_type (notification_type),
    INDEX idx_policy_notifications_recipient (recipient_email),
    INDEX idx_policy_notifications_sent_at (sent_at)
);

-- Policy categories configuration table
CREATE TABLE policy_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    default_reviewers JSON, -- Array of user IDs or roles
    auto_approval_rules JSON, -- Configuration for auto-approval
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default policy categories
INSERT INTO policy_categories (name, description, default_reviewers, auto_approval_rules) VALUES
('HR', 'Human Resources policies', '["hr-manager"]', '{"maxRiskLevel": "Low", "maxWordCount": 500}'),
('IT', 'Information Technology policies', '["it-manager"]', '{"maxRiskLevel": "Low", "maxWordCount": 300}'),
('Finance', 'Financial policies and procedures', '["finance-manager", "legal-team"]', '{"maxRiskLevel": "Medium", "requiresLegalReview": false}'),
('Legal', 'Legal and regulatory policies', '["legal-team"]', '{"autoApprove": false}'),
('Compliance', 'Compliance and regulatory policies', '["compliance-team"]', '{"autoApprove": false}'),
('Operations', 'Operational policies and procedures', '["operations-manager"]', '{"maxRiskLevel": "Medium", "maxWordCount": 800}'),
('Security', 'Security policies and procedures', '["security-manager", "legal-team"]', '{"autoApprove": false}');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('notification_enabled', 'true', 'Enable email notifications'),
('auto_approval_enabled', 'true', 'Enable automatic policy approval'),
('policy_expiry_warning_days', '30', 'Days before expiry to send warning notifications'),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('default_policy_validity_days', '365', 'Default policy validity period in days');

-- Create default admin user (password: admin123 - change in production!)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department) VALUES
('admin', 'admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin', 'IT');

-- Create sample users for testing
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department) VALUES
('user123', 'testuser', 'user@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'User', 'author', 'HR'),
('legal-team', 'legalreviewer', 'legal@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Legal', 'Reviewer', 'legal-team', 'Legal'),
('compliance-team', 'compliancereviewer', 'compliance@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Compliance', 'Reviewer', 'compliance-team', 'Compliance'),
('department-manager', 'deptmanager', 'manager@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Department', 'Manager', 'department-manager', 'Operations'),
('senior-manager', 'seniormanager', 'senior@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Senior', 'Manager', 'senior-manager', 'Executive');

-- Create indexes for better performance
CREATE INDEX idx_policies_composite_status_category ON policies(status, category);
CREATE INDEX idx_policies_composite_author_status ON policies(author_id, status);
CREATE INDEX idx_audit_logs_composite_policy_action ON audit_logs(policy_id, action);
CREATE INDEX idx_policy_reviews_composite_policy_decision ON policy_reviews(policy_id, decision);
