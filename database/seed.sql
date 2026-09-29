-- =====================================================================
-- Police FIR Management System - Seed / Initial Demonstration Data
-- =====================================================================

USE police_fir_db;

-- Users (BCrypt hashed passwords for 'citizen123', 'police123', 'admin123')
INSERT INTO users (id, full_name, email, password_hash, phone, role, address, city, state, pin_code, date_of_birth, gender, status)
VALUES
(1, 'Harshitha Sharma', 'citizen@example.com', '$2a$10$wO3mYvR8iN5s6c6gGvX5x.ZqM3zF7p6xQ3K9q.P8L1kM8aN3yB5w6', '+91 98765 43210', 'CITIZEN', 'Flat 402, Royal Palms Residency, 12th Main Road', 'Bangalore', 'Karnataka', '560034', '1998-05-14', 'Female', 'ACTIVE'),
(2, 'Inspector Rajesh Kumar', 'police@example.com', '$2a$10$wO3mYvR8iN5s6c6gGvX5x.ZqM3zF7p6xQ3K9q.P8L1kM8aN3yB5w6', '+91 98450 11223', 'POLICE', 'Police Quarters Block C', 'Bangalore', 'Karnataka', '560001', '1982-08-22', 'Male', 'ACTIVE'),
(3, 'Commissioner Vikram Rathore', 'admin@example.com', '$2a$10$wO3mYvR8iN5s6c6gGvX5x.ZqM3zF7p6xQ3K9q.P8L1kM8aN3yB5w6', '+91 94480 99887', 'ADMIN', 'Metropolitan Police HQ Officers Enclave', 'Bangalore', 'Karnataka', '560001', '1975-03-10', 'Male', 'ACTIVE');

-- Police Officers
INSERT INTO police_officers (id, user_id, officer_id, full_name, badge_number, rank_designation, police_station, department, phone, email, joining_date, status)
VALUES
(1, 2, 'OFF-101', 'Inspector Rajesh Kumar', 'POL-IND-8821', 'Inspector', 'Central Metropolitan Station - Sector 4', 'Crime Branch & General Investigation', '+91 98450 11223', 'police@example.com', '2016-04-12', 'Active'),
(2, NULL, 'OFF-102', 'Sub-Inspector Priya Sen', 'POL-IND-9042', 'Sub-Inspector', 'Cyber Crime Police Station - South Wing', 'Cyber Forensics & Digital Investigation', '+91 98765 99881', 'priya.sen@police.gov.in', '2019-08-20', 'Active'),
(3, NULL, 'OFF-103', 'Inspector Vikram Malhotra', 'POL-IND-7714', 'Inspector', 'Central Metropolitan Station - Sector 4', 'Special Investigation Team (SIT)', '+91 94451 22334', 'vikram.m@police.gov.in', '2014-11-05', 'Active'),
(4, NULL, 'OFF-104', 'Sub-Inspector Anil Deshmukh', 'POL-IND-8552', 'Sub-Inspector', 'East Sub-Divisional Station', 'Anti-Theft & Property Crimes Squad', '+91 98112 33445', 'anil.deshmukh@police.gov.in', '2020-02-14', 'Active'),
(5, NULL, 'OFF-105', 'Head Constable Ramesh Yadav', 'POL-IND-6210', 'Head Constable', 'Central Metropolitan Station - Sector 4', 'Evidence & Records Custody', '+91 99001 55667', 'ramesh.yadav@police.gov.in', '2011-03-01', 'Active');

-- Complaints
INSERT INTO complaints (id, complaint_id, citizen_id, title, description, category, incident_date, incident_time, incident_location, city, state, suspect_details, witness_details, status, assigned_officer_id, verification_remarks, fir_number)
VALUES
(1, 'CMP-2026-0814', 1, 'Theft of Royal Enfield Motorcycle from Apartment Basement Parking', 'Two-wheeler motorcycle (KA-01-MJ-4491, Matte Black Royal Enfield Classic 350) parked in Basement 2 of Royal Palms Residency was stolen by two masked individuals at 02:40 AM.', 'Vehicle Theft', '2026-09-21', '02:40 AM', 'Basement Parking -2, Royal Palms Residency, 12th Main Road', 'Bangalore', 'Karnataka', 'Two males in dark hoodies and full-face helmets', 'Building Guard Suresh Kumar', 'FIR Registered', 1, 'Verified from CCTV feeds and owner registration documents.', 'FIR-2026-0042'),
(2, 'CMP-2026-0815', 1, 'Unauthorized Online Banking Transactions via Phishing Link', 'Received SMS claiming electricity bill overdue with link. Cloned gateway debited ₹48,500 to merchant handle.', 'Cybercrime', '2026-09-24', '04:15 PM', 'Online Banking Portal', 'Bangalore', 'Karnataka', 'Sender ID: VK-POWRBL', 'Self', 'Under Verification', 2, 'Cyber cell tracing payment gateway beneficiary merchant.', NULL);

-- FIRs
INSERT INTO firs (id, fir_number, complaint_id, citizen_id, police_station, registration_date, incident_date, incident_time, incident_location, offence_type, act_and_sections, description, investigating_officer_id, status, remarks)
VALUES
(1, 'FIR-2026-0042', 1, 1, 'Central Metropolitan Station - Sector 4', '2026-09-22 11:00:00', '2026-09-21', '02:40 AM', 'Basement Parking -2, Royal Palms Residency, 12th Main Road', 'Theft of Motor Vehicle', 'Section 379 IPC / Section 303(2) BNS', 'Cognizable FIR registered for theft of Royal Enfield Classic 350.', 1, 'Investigation', 'Crime scene visited. Forensic fingerprint lift attempted.');

-- Investigations
INSERT INTO investigations (id, investigation_id, fir_id, officer_id, start_date, status, findings, completion_date, remarks)
VALUES
(1, 'INV-2026-042', 1, 1, '2026-09-22', 'In Progress', 'Theft was premeditated. Electronic bypass frequency tool used to unlock ignition in under 90 seconds. Toll plaza ANPR cameras alerted.', NULL, 'Interstate border checkpoints notified.');

-- Evidence
INSERT INTO evidence (id, evidence_id, fir_id, evidence_type, description, collected_date, collected_location, collected_by, file_path, is_citizen_visible, chain_of_custody_remarks)
VALUES
(1, 'EVD-2026-104', 1, 'Video', 'Basement CCTV camera extract showing vehicle breach', '2026-09-22', 'Royal Palms Residency Control Room', 'Inspector Rajesh Kumar', 'CCTV_Basement_0240AM.mp4', TRUE, 'SHA-256 hash verified repository'),
(2, 'EVD-2026-105', 1, 'Document', 'Vehicle Registration Certificate and Purchase Invoice', '2026-09-22', 'Central Station Desk', 'Head Constable Ramesh Yadav', 'RC_Insurance_Doc.pdf', TRUE, 'Sealed in Envelope #22-A, Locker 4');

-- Notifications
INSERT INTO notifications (id, user_id, target_role, title, message, type, is_read, reference_id)
VALUES
(1, 1, NULL, 'FIR Registered Successfully', 'Your complaint CMP-2026-0814 has been approved and registered as FIR-2026-0042.', 'FIR', FALSE, 'FIR-2026-0042'),
(2, NULL, 'POLICE', 'New Complaint Submitted for Verification', 'New complaint received from Harshitha Sharma.', 'COMPLAINT', FALSE, 'CMP-2026-0814');
