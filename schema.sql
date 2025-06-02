/* =========================================================
   PET ADOPTION PORTAL - DATABASE SCHEMA, TRIGGERS & QUERIES
   ========================================================= */

/* ==================== TABLES ==================== */

-- CLIENT TABLE
CREATE TABLE client (
    client_id      SERIAL PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(20),
    address        VARCHAR(255)
);

-- SHELTER TABLE
CREATE TABLE shelter (
    shelter_id      SERIAL PRIMARY KEY,
    shelter_name    VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    location        VARCHAR(255),
    contact_number  VARCHAR(20)
);

-- PET TABLE
CREATE TABLE pet (
    pet_id        SERIAL PRIMARY KEY,
    shelter_id    INTEGER REFERENCES shelter(shelter_id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    species       VARCHAR(50),
    breed         VARCHAR(100),
    age           INTEGER,
    gender        VARCHAR(10),
    description   TEXT,
    arrival_date  DATE,
    status        VARCHAR(20),
    pet_image     VARCHAR(255)
);

-- ADOPTION TABLE
CREATE TABLE adoption (
    adoption_id      SERIAL PRIMARY KEY,
    pet_id           INTEGER REFERENCES pet(pet_id) ON DELETE CASCADE,
    client_id        INTEGER REFERENCES client(client_id) ON DELETE CASCADE,
    request_date     DATE,
    visit_date       DATE,
    status           VARCHAR(20),
    client_reason    TEXT,
    shelter_response TEXT,
    approval_date    DATE
);

-- ACTION LOG TABLE
CREATE TABLE action_log (
    log_id      SERIAL PRIMARY KEY,
    table_name  VARCHAR(50),
    record_id   INTEGER,
    action_type VARCHAR(50),
    timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ==================== INDEXES ==================== */

CREATE INDEX idx_pet_shelter_id      ON pet(shelter_id);
CREATE INDEX idx_adoption_pet_id     ON adoption(pet_id);
CREATE INDEX idx_adoption_client_id  ON adoption(client_id);

/* ==================== TRIGGERS & FUNCTIONS ==================== */

-- PET TABLE TRIGGER
CREATE OR REPLACE FUNCTION log_pet_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('pet', NEW.pet_id, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('pet', NEW.pet_id, 'UPDATE');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('pet', OLD.pet_id, 'DELETE');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pet_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON pet
FOR EACH ROW EXECUTE FUNCTION log_pet_changes();

-- ADOPTION TABLE TRIGGER
CREATE OR REPLACE FUNCTION log_adoption_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('adoption', NEW.adoption_id, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('adoption', NEW.adoption_id, 'UPDATE');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('adoption', OLD.adoption_id, 'DELETE');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER adoption_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON adoption
FOR EACH ROW EXECUTE FUNCTION log_adoption_changes();

-- CLIENT TABLE TRIGGER
CREATE OR REPLACE FUNCTION log_client_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('client', NEW.client_id, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('client', NEW.client_id, 'UPDATE');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('client', OLD.client_id, 'DELETE');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON client
FOR EACH ROW EXECUTE FUNCTION log_client_changes();

-- SHELTER TABLE TRIGGER
CREATE OR REPLACE FUNCTION log_shelter_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('shelter', NEW.shelter_id, 'INSERT');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('shelter', NEW.shelter_id, 'UPDATE');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO action_log (table_name, record_id, action_type)
        VALUES ('shelter', OLD.shelter_id, 'DELETE');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shelter_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON shelter
FOR EACH ROW EXECUTE FUNCTION log_shelter_changes();

/* =========================================================
   SQL COMMANDS USED IN BACKEND (index.js)
   ========================================================= */

-- CLIENT
SELECT * FROM client WHERE email = $1;
SELECT * FROM client WHERE client_id = $1;
INSERT INTO client (full_name, email, password_hash, phone_number, address)
VALUES ($1, $2, $3, $4, $5) RETURNING client_id;

-- SHELTER
SELECT * FROM shelter WHERE shelter_name = $1;
SELECT * FROM shelter WHERE shelter_id = $1;
INSERT INTO shelter (shelter_name, email, password_hash, location, contact_number)
VALUES ($1, $2, $3, $4, $5) RETURNING shelter_id;

-- PET
SELECT pet.*, shelter.shelter_name, shelter.location AS shelter_address
FROM pet
JOIN shelter ON pet.shelter_id = shelter.shelter_id
WHERE pet.status = 'Available';

SELECT * FROM pet WHERE shelter_id = $1 ORDER BY arrival_date DESC;

INSERT INTO pet (shelter_id, name, species, breed, age, gender, description, arrival_date, status, pet_image)
VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'Available', $8) RETURNING pet_id;

UPDATE pet SET status = 'HOLD' WHERE pet_id = $1;
UPDATE pet SET status = 'Adopted' WHERE pet_id = $1 AND shelter_id = $2;
DELETE FROM pet WHERE pet_id = $1 AND shelter_id = $2;

-- ADOPTION
SELECT a.*, p.name AS pet_name, p.species, p.breed, p.pet_image, p.description, p.age, p.gender, s.shelter_name, s.location AS shelter_address, a.status, a.visit_date, a.approval_date, a.shelter_response
FROM adoption a
JOIN pet p ON a.pet_id = p.pet_id
JOIN shelter s ON p.shelter_id = s.shelter_id
WHERE a.client_id = $1
ORDER BY a.request_date DESC;

SELECT * FROM adoption WHERE client_id = $1 AND pet_id = $2;
INSERT INTO adoption (pet_id, client_id, request_date, status, client_reason)
VALUES ($1, $2, CURRENT_DATE, 'Pending', $3) RETURNING adoption_id;

SELECT * FROM adoption WHERE adoption_id = $1 AND client_id = $2 AND status = $3;
UPDATE adoption SET status = $1 WHERE adoption_id = $2;

SELECT pet_id FROM adoption WHERE adoption_id = $1;
UPDATE adoption SET status = 'Approved', approval_date = CURRENT_DATE, shelter_response = $1, visit_date = $2 WHERE adoption_id = $3;
UPDATE adoption SET status = 'Rejected', shelter_response = $1 WHERE adoption_id = $2;
UPDATE adoption SET status = 'Completed' WHERE adoption_id = $1;

-- JOINED ADOPTION REQUESTS (for shelter dashboard)
SELECT a.*, c.full_name, c.email, c.phone_number, p.name AS pet_name, p.pet_image
FROM adoption a
JOIN client c ON a.client_id = c.client_id
JOIN pet p ON a.pet_id = p.pet_id
WHERE p.shelter_id = $1
ORDER BY a.request_date DESC;

-- ACTION LOG
INSERT INTO action_log (table_name, record_id, action_type) VALUES ($1, $2, $3);
SELECT * FROM action_log ORDER BY timestamp DESC LIMIT 100;

/* ==================== ALSO USED WITH "?" PLACEHOLDERS ==================== */

INSERT INTO client (full_name, email, password_hash, phone_number, address)
VALUES (?, ?, ?, ?, ?);
INSERT INTO shelter (shelter_name, email, password_hash, location, contact_number)
VALUES (?, ?, ?, ?, ?);
SELECT * FROM client WHERE email = ?;
SELECT * FROM shelter WHERE email = ?;
INSERT INTO pet (shelter_id, name, species, breed, age, gender, description, arrival_date, status, pet_image)
VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Available', ?);
DELETE FROM pet WHERE pet_id = ? AND shelter_id = ?;
UPDATE pet SET status = 'Adopted' WHERE pet_id = ?;
INSERT INTO adoption (pet_id, client_id, request_date, status, client_reason)
VALUES (?, ?, CURRENT_DATE, 'Pending', ?);
UPDATE adoption SET status = 'Approved', approval_date = CURRENT_DATE, shelter_response = ?, visit_date = ?
WHERE adoption_id = ?;
UPDATE pet SET status = 'HOLD' WHERE pet_id = ?;
UPDATE adoption SET status = 'Completed', approval_date = ? WHERE adoption_id = ?;
UPDATE pet SET status = 'Adopted' WHERE pet_id = ?;
INSERT INTO action_log (table_name, record_id, action_type)
VALUES (?, ?, ?);
SELECT pet.*, shelter.shelter_name, shelter.location AS shelter_address
FROM pet
JOIN shelter ON pet.shelter_id = shelter.shelter_id
WHERE pet.status = 'Available'
ORDER BY pet.arrival_date DESC;
SELECT a.*, p.name AS pet_name, p.species, p.breed, p.pet_image, p.description, 
       p.age, p.gender, s.shelter_name, s.location AS shelter_address, 
       a.status, a.visit_date, a.approval_date, a.shelter_response
FROM adoption a
JOIN pet p ON a.pet_id = p.pet_id
JOIN shelter s ON p.shelter_id = s.shelter_id
WHERE a.client_id = ?
ORDER BY a.request_date DESC;
SELECT * FROM pet WHERE shelter_id = ? ORDER BY arrival_date DESC;
SELECT a.*, c.full_name, c.email, c.phone_number, p.name AS pet_name, p.pet_image
FROM adoption a
JOIN client c ON a.client_id = c.client_id
JOIN pet p ON a.pet_id = p.pet_id
WHERE p.shelter_id = ?
ORDER BY a.request_date DESC;
SELECT * FROM action_log ORDER BY timestamp DESC LIMIT 100;

/* ==================== END OF FILE ==================== */
