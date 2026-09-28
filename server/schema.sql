-- AIPC Event Management Platform - PostgreSQL Relational Database Schema
-- Primary Source of Truth Schema Definition

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    edition VARCHAR(64) NOT NULL,
    year INT NOT NULL,
    theme VARCHAR(255),
    theme_scripture TEXT,
    theme_blurb TEXT,
    tagline VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    check_in_time VARCHAR(32),
    close_time VARCHAR(32),
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_city VARCHAR(128),
    venue_map_url TEXT,
    organiser VARCHAR(255),
    organiser_url TEXT,
    organiser_blurb TEXT,
    description TEXT,
    audience VARCHAR(255),
    language_notice VARCHAR(255),
    eligibility_notice VARCHAR(255),
    status VARCHAR(32) DEFAULT 'current',
    hero_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_categories (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    tax_percent NUMERIC(5, 2) DEFAULT 0,
    tax_note VARCHAR(255),
    valid_from DATE,
    valid_until DATE,
    sharing_type VARCHAR(32),
    max_guests INT,
    active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS crm_contacts (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    full_name VARCHAR(256) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(64),
    whatsapp VARCHAR(64),
    age INT,
    gender VARCHAR(32),
    country VARCHAR(128) DEFAULT 'India',
    state VARCHAR(128),
    city VARCHAR(128),
    address TEXT,
    church_name VARCHAR(255),
    church_denomination VARCHAR(128),
    role VARCHAR(128),
    organisation VARCHAR(255),
    designation VARCHAR(128),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    contact_type VARCHAR(64) DEFAULT 'delegate',
    lifecycle VARCHAR(64) DEFAULT 'attendee',
    lead_source VARCHAR(128),
    owner VARCHAR(128),
    tags TEXT[],
    consent BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(128),
    country VARCHAR(128),
    city VARCHAR(128),
    address TEXT,
    gst_vat VARCHAR(64),
    status VARCHAR(32) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(64) PRIMARY KEY,
    reference VARCHAR(64) NOT NULL UNIQUE,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    contact_id VARCHAR(64) REFERENCES crm_contacts(id) ON DELETE SET NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    age INT,
    organisation VARCHAR(255),
    designation VARCHAR(128),
    city VARCHAR(128),
    state VARCHAR(128),
    country VARCHAR(128) DEFAULT 'India',
    category_id VARCHAR(64) REFERENCES registration_categories(id),
    add_ons TEXT[],
    amount NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(32) DEFAULT 'unpaid',
    status VARCHAR(32) DEFAULT 'submitted',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendees (
    id VARCHAR(64) PRIMARY KEY,
    registration_id VARCHAR(64) REFERENCES registrations(id) ON DELETE CASCADE,
    contact_id VARCHAR(64) REFERENCES crm_contacts(id) ON DELETE SET NULL,
    reference VARCHAR(64) NOT NULL,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    organisation VARCHAR(255),
    designation VARCHAR(128),
    city VARCHAR(128),
    state VARCHAR(128),
    country VARCHAR(128),
    category_id VARCHAR(64),
    payment_status VARCHAR(32) DEFAULT 'unpaid',
    check_in_status VARCHAR(32) DEFAULT 'not-arrived',
    checked_in_at TIMESTAMP WITH TIME ZONE,
    badge_status VARCHAR(32) DEFAULT 'not-generated',
    rooming_status VARCHAR(32) DEFAULT 'unassigned',
    room_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_participations (
    id VARCHAR(64) PRIMARY KEY,
    contact_id VARCHAR(64) REFERENCES crm_contacts(id) ON DELETE CASCADE,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    event_year INT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    registration_id VARCHAR(64) REFERENCES registrations(id) ON DELETE CASCADE,
    reference VARCHAR(64) NOT NULL,
    role VARCHAR(128),
    category_name VARCHAR(128),
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    payment_status VARCHAR(32) DEFAULT 'unpaid',
    attended BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historical_resources (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) REFERENCES events(id) ON DELETE CASCADE,
    event_year INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    file_type VARCHAR(32),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size VARCHAR(32),
    visibility VARCHAR(32) DEFAULT 'PUBLIC',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_jobs (
    id VARCHAR(64) PRIMARY KEY,
    target VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(128),
    user_email VARCHAR(255),
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_reference ON registrations(reference);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON crm_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_event_participations_contact ON event_participations(contact_id);
CREATE INDEX IF NOT EXISTS idx_historical_resources_year ON historical_resources(event_year);
