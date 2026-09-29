-- =====================================================================
-- Police FIR Management System - Production MySQL Relational Database Schema
-- Standard: MySQL 8.0+ / InnoDB / utf8mb4
-- =====================================================================

CREATE DATABASE IF NOT EXISTS police_fir_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE police_fir_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    role ENUM('ADMIN', 'POLICE', 'CITIZEN') NOT NULL DEFAULT 'CITIZEN',
    address TEXT,
    city VARCHAR(64) DEFAULT 'Bangalore',
    state VARCHAR(64) DEFAULT 'Karnataka',
    pin_code VARCHAR(16),
    date_of_birth DATE,
    gender VARCHAR(16),
    status ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. POLICE OFFICERS TABLE
CREATE TABLE IF NOT EXISTS police_officers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    officer_id VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    badge_number VARCHAR(64) NOT NULL UNIQUE,
    rank_designation ENUM('Inspector', 'Sub-Inspector', 'Assistant Sub-Inspector', 'Head Constable', 'Constable') NOT NULL,
    police_station VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    joining_date DATE NOT NULL,
    status ENUM('Active', 'On Leave', 'Transferred', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_officer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_officer_station (police_station),
    INDEX idx_officer_badge (badge_number)
) ENGINE=InnoDB;

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(32) NOT NULL UNIQUE,
    citizen_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    incident_date DATE NOT NULL,
    incident_time VARCHAR(32) NOT NULL,
    incident_location VARCHAR(255) NOT NULL,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(64) NOT NULL,
    suspect_details TEXT,
    witness_details TEXT,
    supporting_document_url VARCHAR(255),
    status ENUM('Submitted', 'Under Verification', 'Approved', 'Rejected', 'FIR Registered', 'Case Closed') DEFAULT 'Submitted',
    assigned_officer_id BIGINT,
    verification_remarks TEXT,
    fir_number VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_citizen FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_officer FOREIGN KEY (assigned_officer_id) REFERENCES police_officers(id) ON DELETE SET NULL,
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_citizen (citizen_id)
) ENGINE=InnoDB;

-- 4. FIRST INFORMATION REPORTS (FIR) TABLE
CREATE TABLE IF NOT EXISTS firs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fir_number VARCHAR(32) NOT NULL UNIQUE,
    complaint_id BIGINT UNIQUE,
    citizen_id BIGINT NOT NULL,
    police_station VARCHAR(128) NOT NULL,
    registration_date DATETIME NOT NULL,
    incident_date DATE NOT NULL,
    incident_time VARCHAR(32),
    incident_location VARCHAR(255) NOT NULL,
    offence_type VARCHAR(128) NOT NULL,
    act_and_sections VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    investigating_officer_id BIGINT NOT NULL,
    status ENUM('FIR Registered', 'Investigation', 'Under Review', 'Rework', 'Case Closed') DEFAULT 'FIR Registered',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fir_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    CONSTRAINT fk_fir_citizen FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fir_io FOREIGN KEY (investigating_officer_id) REFERENCES police_officers(id),
    INDEX idx_fir_station (police_station),
    INDEX idx_fir_status (status)
) ENGINE=InnoDB;

-- 5. INVESTIGATIONS TABLE
CREATE TABLE IF NOT EXISTS investigations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    investigation_id VARCHAR(32) NOT NULL UNIQUE,
    fir_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    status ENUM('Initiated', 'In Progress', 'Witness Interrogated', 'Forensic Analysis', 'Charge Sheet Prepared', 'Completed') DEFAULT 'Initiated',
    findings TEXT,
    completion_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_fir FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_officer FOREIGN KEY (officer_id) REFERENCES police_officers(id)
) ENGINE=InnoDB;

-- 6. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evidence_id VARCHAR(32) NOT NULL UNIQUE,
    fir_id BIGINT NOT NULL,
    evidence_type ENUM('Document', 'Image', 'Video', 'Physical Weapon', 'Forensic Report', 'Digital Audio/Call Record', 'Other') NOT NULL,
    description TEXT NOT NULL,
    collected_date DATE NOT NULL,
    collected_location VARCHAR(255) NOT NULL,
    collected_by VARCHAR(128) NOT NULL,
    file_path VARCHAR(255),
    is_citizen_visible BOOLEAN DEFAULT FALSE,
    chain_of_custody_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ev_fir FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. CASE STATUS AUDIT HISTORY TABLE
CREATE TABLE IF NOT EXISTS case_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fir_id BIGINT NOT NULL,
    previous_status VARCHAR(64) NOT NULL,
    new_status VARCHAR(64) NOT NULL,
    updated_by VARCHAR(128) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_csh_fir FOREIGN KEY (fir_id) REFERENCES firs(id) ON DELETE CASCADE,
    INDEX idx_history_fir (fir_id)
) ENGINE=InnoDB;

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    target_role VARCHAR(32),
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB;
