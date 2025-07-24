// At the very top, load environment variables
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware Setup ---
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// --- Database Connection ---
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database!'))
    .catch(err => console.error('Error connecting to PostgreSQL database:', err));

// --- Helper Functions ---
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }
};

// --- Authentication Routes ---
app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ loggedIn: true, user: req.session.user });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});


// --- Client Routes ---
app.post('/api/client/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO clients (full_name, email, password_hash) VALUES ($1, $2, $3)';
        await pool.query(query, [name, email, hashedPassword]);
        res.status(201).json({ message: 'Client registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

app.post('/api/client/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM clients WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
            req.session.user = { id: user.client_id, name: user.full_name, type: 'client' };
            res.status(200).json({ message: 'Login successful!', user: req.session.user });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// NEW: Endpoint to get adoption history for a client
app.get('/api/client/history', isAuthenticated, async (req, res) => {
    if (req.session.user.type !== 'client') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const clientId = req.session.user.id;
    try {
        const query = `
            SELECT 
                a.request_date,
                p.name AS pet_name,
                s.shelter_name,
                a.status
            FROM adoption a
            JOIN pets p ON a.pet_id = p.pet_id
            JOIN shelters s ON p.shelter_id = s.shelter_id
            WHERE a.client_id = $1
            ORDER BY a.request_date DESC
        `;
        const { rows } = await pool.query(query, [clientId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching adoption history.' });
    }
});


// --- Shelter Routes ---
app.post('/api/shelter/register', async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO shelters (shelter_name, email, password_hash, location) VALUES ($1, $2, $3, $4)';
        await pool.query(query, [name, email, hashedPassword, address]);
        res.status(201).json({ message: 'Shelter registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

app.post('/api/shelter/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM shelters WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const shelter = rows[0];
        const isMatch = await bcrypt.compare(password, shelter.password_hash);
        if (isMatch) {
            req.session.user = { id: shelter.shelter_id, name: shelter.shelter_name, type: 'shelter' };
            res.status(200).json({ message: 'Login successful!', user: req.session.user });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- Admin Routes ---
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (isMatch) {
            req.session.user = { id: 1, name: 'Admin', type: 'admin' };
            res.status(200).json({ message: 'Login successful!', user: req.session.user });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- Data Fetching Routes ---
app.get('/api/pets', isAuthenticated, async (req, res) => {
    try {
        const query = `
            SELECT 
                p.pet_id, 
                p.name AS pet_name, 
                p.species AS pet_type, 
                p.breed AS pet_breed, 
                p.age AS pet_age,
                p.pet_image, 
                s.shelter_name 
            FROM pets p 
            JOIN shelters s ON p.shelter_id = s.shelter_id 
            WHERE p.status = 'Available'`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching pets.' });
    }
});

app.get('/api/shelter/pets', isAuthenticated, async (req, res) => {
    if (req.session.user.type !== 'shelter') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const shelterId = req.session.user.id;
    try {
        const query = `
            SELECT 
                pet_id, 
                name AS pet_name, 
                species AS pet_type, 
                breed AS pet_breed, 
                age AS pet_age, 
                status AS adoption_status 
            FROM pets 
            WHERE shelter_id = $1`;
        const { rows } = await pool.query(query, [shelterId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching shelter pets.' });
    }
});

app.post('/api/pets/add', isAuthenticated, async (req, res) => {
    if (req.session.user.type !== 'shelter') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, type, breed, age } = req.body;
    const shelterId = req.session.user.id;
    try {
        const query = `
            INSERT INTO pets (name, species, breed, age, shelter_id, status) 
            VALUES ($1, $2, $3, $4, $5, 'Available')`;
        await pool.query(query, [name, type, breed, age, shelterId]);
        res.status(201).json({ message: 'Pet added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding pet.' });
    }
});

app.post('/api/pets/adopt', isAuthenticated, async (req, res) => {
    if (req.session.user.type !== 'client') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { pet_id } = req.body;
    const clientId = req.session.user.id;
    try {
        const adoptionQuery = `
            INSERT INTO adoption (pet_id, client_id, status) 
            VALUES ($1, $2, 'Pending')`;
        await pool.query(adoptionQuery, [pet_id, clientId]);

        const petUpdateQuery = `UPDATE pets SET status = 'Pending Adoption' WHERE pet_id = $1`;
        await pool.query(petUpdateQuery, [pet_id]);

        res.status(200).json({ message: 'Adoption request submitted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing adoption request.' });
    }
});

app.get('/api/admin/dashboard', isAuthenticated, async (req, res) => {
    if (req.session.user.type !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const clientsQuery = `
            SELECT 
                client_id, 
                full_name AS client_name, 
                email AS client_email 
            FROM clients`;
        const sheltersQuery = `
            SELECT 
                shelter_id, 
                shelter_name, 
                email AS shelter_email, 
                location AS shelter_address 
            FROM shelters`;
        const clientsResult = await pool.query(clientsQuery);
        const sheltersResult = await pool.query(sheltersQuery);
        res.json({ clients: clientsResult.rows, shelters: sheltersResult.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
});


// --- Server Start ---
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
