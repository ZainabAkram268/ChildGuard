-- backend/src/database/schema.sql
-- ChildGuard Database Schema (SQLite)
-- Full DDL with tables, triggers, views, and indexes
-- Aligned with use cases and sequence diagrams

PRAGMA foreign_keys = ON;

-- ============================================
-- CORE USER & AUTH TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'sponsor', 'volunteer', 'admin', 'case_reporter')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- ROLE-SPECIFIC EXTENSION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS parents (
    parent_id TEXT PRIMARY KEY,
    phone TEXT,
    address TEXT,
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsors (
    sponsor_id TEXT PRIMARY KEY,
    phone TEXT,
    preferences TEXT, -- JSON: {"age": "5-10", "location": "Lahore"}
    FOREIGN KEY (sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id TEXT PRIMARY KEY,
    phone TEXT,
    availability TEXT, -- JSON: {"days": ["Mon"], "time": "evening"}
    area TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
ALTER TABLE volunteers ADD COLUMN volunteer_status TEXT DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS admins (
    admin_id TEXT PRIMARY KEY,
    phone TEXT,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_reporters (
    reporter_id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE, -- NULL if anonymous
    phone TEXT,
    is_anonymous INTEGER DEFAULT 0 CHECK (is_anonymous IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================
-- FAMILY & CHILD TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS families (
    family_id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    income REAL NOT NULL CHECK (income >= 0),
    address TEXT NOT NULL,
    number_of_children INTEGER DEFAULT 0 CHECK (number_of_children >= 0),
    proof_documents TEXT, -- JSON array of URLs
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    support_status TEXT DEFAULT 'none' CHECK (support_status IN ('none', 'shortlisted', 'sponsored')),
    enrollment_date TEXT,
    verified_by TEXT, -- volunteer_id
    assigned_sponsor_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_sponsor_id) REFERENCES sponsors(sponsor_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_families_verification ON families(verification_status);
CREATE INDEX IF NOT EXISTS idx_families_support ON families(support_status);
CREATE INDEX IF NOT EXISTS idx_families_parent ON families(parent_id);

CREATE TABLE IF NOT EXISTS child_profiles (
    child_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    grade TEXT,
    school TEXT,
    photo_url TEXT,
    story TEXT,
    needs TEXT, -- JSON: {"fees": 5000, "books": true}
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_family ON child_profiles(family_id);

-- ============================================
-- APPLICATION & SUPPORT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
    application_id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    sponsor_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_verification', 'verified', 'rejected', 'sponsored')),
    applied_at TEXT DEFAULT (datetime('now')),
    verified_at TEXT,
    rejected_reason TEXT,
    FOREIGN KEY (child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE,
    FOREIGN KEY (sponsor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_child ON applications(child_id);

CREATE TABLE IF NOT EXISTS fee_challans (
    challan_id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    challan_url TEXT,
    paid_proof_url TEXT,
    paid_at TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsor_shortlisted_families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sponsor_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    shortlisted_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sponsor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    UNIQUE(sponsor_id, family_id)
);

-- ============================================
-- REPORTING & VERIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
    report_id TEXT PRIMARY KEY,
    reporter_id TEXT,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    child_name TEXT,
    child_age INTEGER,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_verification', 'verified', 'action_taken', 'rejected')),
    reported_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (reporter_id) REFERENCES case_reporters(reporter_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

CREATE TABLE IF NOT EXISTS verification_visits (
    visit_id TEXT PRIMARY KEY,
    volunteer_id TEXT NOT NULL,
    target_id TEXT NOT NULL, -- application_id or report_id
    target_type TEXT NOT NULL CHECK (target_type IN ('application', 'report')),
    visit_date TEXT,
    findings TEXT,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'completed', 'cancelled')),
    assigned_at TEXT DEFAULT (datetime('now')),
    accepted_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_visits_status ON verification_visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_volunteer ON verification_visits(volunteer_id);

-- ============================================
-- CONTENT & NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS awareness_contents (
    content_id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('article', 'video', 'guide')),
    published_at TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    is_read INTEGER DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

CREATE TABLE IF NOT EXISTS progress_reports (
    report_id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    report_date TEXT NOT NULL,
    grades TEXT,
    attendance REAL CHECK (attendance >= 0 AND attendance <= 100),
    comments TEXT,
    document_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(child_id) ON DELETE CASCADE
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE TRIGGER IF NOT EXISTS trigger_update_users
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_update_families
AFTER UPDATE ON families
FOR EACH ROW
BEGIN
    UPDATE families SET updated_at = datetime('now') WHERE family_id = NEW.family_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_update_child_profiles
AFTER UPDATE ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE child_profiles SET updated_at = datetime('now') WHERE child_id = NEW.child_id;
END;

-- Update family child count
CREATE TRIGGER IF NOT EXISTS trigger_increment_child_count
AFTER INSERT ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children + 1,
        updated_at = datetime('now')
    WHERE family_id = NEW.family_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_decrement_child_count
AFTER DELETE ON child_profiles
FOR EACH ROW
BEGIN
    UPDATE families 
    SET number_of_children = number_of_children - 1,
        updated_at = datetime('now')
    WHERE family_id = OLD.family_id;
END;

-- Notify on application status change
CREATE TRIGGER IF NOT EXISTS trigger_notify_application_status
AFTER UPDATE OF status ON applications
FOR EACH ROW WHEN NEW.status != OLD.status
BEGIN
    INSERT INTO notifications (notification_id, user_id, message, type, created_at)
    SELECT 
        'NOT' || substr('000000' || (strftime('%s','now') * 1000 + (RANDOM() % 1000)), -12),
        f.parent_id,
        'Your sponsorship application is now: ' || NEW.status,
        'application_update',
        datetime('now')
    FROM families f
    JOIN child_profiles cp ON f.family_id = cp.family_id
    WHERE cp.child_id = NEW.child_id;
END;

-- Notify sponsor when sponsored
CREATE TRIGGER IF NOT EXISTS trigger_notify_sponsorship
AFTER UPDATE OF status ON applications
FOR EACH ROW WHEN NEW.status = 'sponsored' AND NEW.sponsor_id IS NOT NULL
BEGIN
    INSERT INTO notifications (notification_id, user_id, message, type, created_at)
    VALUES (
        'NOT' || substr('000000' || (strftime('%s','now') * 1000 + (RANDOM() % 1000)), -12),
        NEW.sponsor_id,
        'You have successfully sponsored a child!',
        'sponsorship',
        datetime('now')
    );
END;

-- Notify volunteer on visit assignment
CREATE TRIGGER IF NOT EXISTS trigger_notify_visit
AFTER INSERT ON verification_visits
BEGIN
    INSERT INTO notifications (notification_id, user_id, message, type, created_at)
    SELECT 
        'NOT' || substr('000000' || (strftime('%s','now') * 1000 + (RANDOM() % 1000)), -12),
        v.volunteer_id,
        'New verification visit assigned: ' || NEW.target_type,
        'visit_assignment',
        datetime('now')
    FROM volunteers v
    WHERE v.volunteer_id = NEW.volunteer_id;
END;

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW IF NOT EXISTS view_available_families AS
SELECT 
    f.family_id,
    f.parent_id,
    u.username AS parent_name,
    f.address,
    f.income,
    f.number_of_children,
    f.verification_status,
    f.support_status
FROM families f
JOIN users u ON f.parent_id = u.user_id
WHERE f.verification_status = 'verified' 
  AND f.support_status = 'none';

CREATE VIEW IF NOT EXISTS view_active_volunteers AS
SELECT 
    v.volunteer_id,
    u.username,
    u.email,
    v.phone,
    v.area,
    v.status
FROM volunteers v
JOIN users u ON v.volunteer_id = u.user_id
WHERE v.status = 'approved';

-- ============================================
-- DATA (for easy testing)
-- ============================================

-- -----------------------------------------------------------------
-- 1. USERS + ROLE-SPECIFIC TABLES
-- -----------------------------------------------------------------

-- Admin (password: admin123)
INSERT INTO users (user_id, username, email, password_hash, role)
VALUES (
  'ADM001',
  'admin',
  'admin@childguard.org',
  '$2b$10$8z1z2z3z4z5z6z7z8z9z0u1u2u3u4u5u6u7u8u9u0u1u2u3u4u5u6u7u', -- bcrypt hash of "admin123"
  'admin'
);
INSERT INTO admins (admin_id, phone) VALUES ('ADM001', '0300-1112223');

-- Parents (password: test123)
INSERT INTO users (user_id, username, email, password_hash, role)
VALUES
('PAR001', 'ali_khan',      'ali@example.com',      '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'parent'),
('PAR002', 'sara_ahmed',    'sara@example.com',     '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'parent'),
('PAR003', 'khan_family',   'khan@example.com',     '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'parent');

INSERT INTO parents (parent_id, phone, address) VALUES
('PAR001', '0300-1234567', 'House 12, Street 5, Lahore'),
('PAR002', '0300-9876543', 'Apartment 3B, Gulberg, Lahore'),
('PAR003', '0300-5556667', 'Village Road, Faisalabad');

-- Sponsors (password: test123)
INSERT INTO users (user_id, username, email, password_hash, role)
VALUES
('SPR001', 'sponsor_a',   'sponsor.a@example.com', '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'sponsor'),
('SPR002', 'sponsor_b',   'sponsor.b@example.com', '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'sponsor'),
('SPR003', 'sponsor_c',   'sponsor.c@example.com', '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'sponsor');

INSERT INTO sponsors (sponsor_id, phone, preferences) VALUES
('SPR001', '0333-1112223', '{"age":"5-10","location":"Lahore"}'),
('SPR002', '0333-3334444', '{"age":"11-15","location":"Faisalabad"}'),
('SPR003', '0333-5556666', NULL);

-- Volunteers (password: test123)
INSERT INTO users (user_id, username, email, password_hash, role)
VALUES
('VOL001', 'vol_ahmed',  'vol.ahmed@example.com', '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'volunteer'),
('VOL002', 'vol_sana',   'vol.sana@example.com',  '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'volunteer'),
('VOL003', 'vol_omar',   'vol.omar@example.com',  '$2b$10$J9kL9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL9kL9kOuJ9kL9kL9kL9kL', 'volunteer');

INSERT INTO volunteers (volunteer_id, user_id, phone, availability, area, status) VALUES
('VOL001', 'VOL001', '0300-2223334', '{"days":["Mon","Wed"]}', 'Lahore', 'approved'),
('VOL002', 'VOL002', '0300-4445556', '{"days":["Sat"]}', 'Lahore', 'pending'),
('VOL003', 'VOL003', '0300-6667778', NULL, 'Faisalabad', 'rejected');

-- Case Reporters (one linked, one anonymous)
INSERT INTO case_reporters (reporter_id, user_id, phone, is_anonymous) VALUES
('REP001', 'PAR001', '0300-1234567', 0),   -- linked to parent
('REP002', NULL,     '0300-9998887', 1);   -- anonymous

-- -----------------------------------------------------------------
-- 2. FAMILIES + CHILDREN
-- -----------------------------------------------------------------

INSERT INTO families (family_id, parent_id, income, address, verification_status, support_status)
VALUES
('FAM001', 'PAR001', 15000, 'House 12, Street 5, Lahore',      'verified', 'none'),
('FAM002', 'PAR002', 12000, 'Apartment 3B, Gulberg, Lahore',   'verified', 'shortlisted'),
('FAM003', 'PAR003', 18000, 'Village Road, Faisalabad',        'pending',  'none');

INSERT INTO child_profiles (child_id, family_id, name, age, gender, grade, school, needs)
VALUES
('CHD001', 'FAM001', 'Ayesha Khan',  8, 'female', '3', 'Govt Primary School', '{"fees":5000,"books":true}'),
('CHD002', 'FAM001', 'Bilal Khan',   6, 'male',   '1', 'Govt Primary School', NULL),
('CHD003', 'FAM002', 'Fatima Ahmed',10, 'female', '5', 'Bright Future Academy', '{"fees":8000,"uniform":true}'),
('CHD004', 'FAM003', 'Omar Khan',   12, 'male',   '7', 'Village School', NULL);

-- -----------------------------------------------------------------
-- 3. APPLICATIONS + FEE CHALLANS
-- -----------------------------------------------------------------

INSERT INTO applications (application_id, child_id, sponsor_id, status)
VALUES
('APP001', 'CHD001', 'SPR001', 'under_verification'),
('APP002', 'CHD003', 'SPR002', 'verified'),
('APP003', 'CHD004', NULL,      'pending');

INSERT INTO fee_challans (challan_id, application_id, amount, challan_url, paid_proof_url, paid_at)
VALUES
('CHL001', 'APP001', 5000, 'https://bank.example/challan1.pdf', NULL, NULL),
('CHL002', 'APP002', 8000, 'https://bank.example/challan2.pdf', 'https://proof.example/2.jpg', '2025-11-01');

-- -----------------------------------------------------------------
-- 4. CHILD-LABOR REPORTS
-- -----------------------------------------------------------------

INSERT INTO reports (report_id, reporter_id, location, description, child_name, child_age, photo_url, status)
VALUES
('RPT001', 'REP001', 'Factory Street, Lahore', 'Child working 10 hrs/day', 'Ahmed', 9, 'https://img.example/r1.jpg', 'under_verification'),
('RPT002', 'REP002', 'Brick Kiln, Faisalabad', 'Anonymous report', NULL, NULL, NULL, 'pending');

-- -----------------------------------------------------------------
-- 5. VERIFICATION VISITS
-- -----------------------------------------------------------------

INSERT INTO verification_visits (visit_id, volunteer_id, target_id, target_type, visit_date, status)
VALUES
('VIS001', 'VOL001', 'APP001', 'application', '2025-11-20', 'assigned'),
('VIS002', 'VOL001', 'RPT001', 'report',      '2025-11-22', 'assigned');

-- -----------------------------------------------------------------
-- 6. PROGRESS REPORTS
-- -----------------------------------------------------------------

INSERT INTO progress_reports (report_id, child_id, report_date, grades, attendance, comments)
VALUES
('PRG001', 'CHD001', '2025-10-01', 'A', 95, 'Excellent performance'),
('PRG002', 'CHD001', '2025-11-01', 'A-', 92, 'Consistent effort'),
('PRG003', 'CHD003', '2025-11-01', 'B+', 88, 'Needs more focus on math');

-- -----------------------------------------------------------------
-- 7. AWARENESS CONTENT
-- -----------------------------------------------------------------

INSERT INTO awareness_contents (content_id, admin_id, title, content, type, published_at, status)
VALUES
('CNT001', 'ADM001', 'Child Labor Laws in Pakistan', 'Detailed guide...', 'article', '2025-11-01', 'published'),
('CNT002', 'ADM001', 'How to Spot Child Labor', 'Video tutorial link...', 'video', '2025-11-05', 'published');

-- -----------------------------------------------------------------
-- 8. NOTIFICATIONS (some generated by triggers, some manual)
-- -----------------------------------------------------------------

INSERT INTO notifications (notification_id, user_id, message, type, is_read, created_at)
VALUES
('NOT001', 'PAR001', 'Your sponsorship application for Ayesha is under verification.', 'application_update', 0, '2025-11-10 10:00:00'),
('NOT002', 'VOL001', 'New verification visit assigned: application APP001', 'visit_assignment', 0, '2025-11-10 10:05:00'),
('NOT003', 'SPR001', 'You have successfully sponsored Ayesha Khan!', 'sponsorship', 0, '2025-11-15 14:00:00'),
('NOT004', 'PAR002', 'Your family has been shortlisted by a sponsor.', 'application_update', 1, '2025-11-08 09:00:00');

-- User can be 'suspended' even if volunteer_status is 'approved'
UPDATE users SET status = 'suspended' WHERE user_id = 'VOL001';
-- -----------------------------------------------------------------
-- END 
-- -----------------------------------------------------------------