// ================== Imports & Config ==================
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import ejs from "ejs";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ================== Middleware ==================
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ================== Database Connection ==================
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// ================== Passport Strategies ==================

// Admin login (by email)
passport.use(
  "admin-local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      // console.log('Login attempt:', email, password);
      if (email === process.env.ADMIN_EMAIL) {
        try {
          const match = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
          );
          // console.log('Password match:', match);
          if (match) {
            return done(null, { admin_id: 1, email: email });
          }
        } catch (err) {
          console.error("Bcrypt error:", err);
          return done(err);
        }
      }
      return done(null, false, { message: "Invalid credentials" });
    }
  )
);

// Client login (by email)
passport.use(
  "client-local",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const result = await db.query("SELECT * FROM client WHERE email = $1", [
          email,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const isValid = await bcrypt.compare(password, user.password_hash);
          if (isValid) return done(null, user);
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, false, { message: "No user found with that email." });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Shelter login (by shelter_name)
passport.use(
  "shelter-local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        // Query the shelter by email
        const result = await db.query(
          "SELECT * FROM shelter WHERE email = $1",
          [email]
        );
        if (result.rows.length === 0) {
          return done(null, false, {
            message: "No shelter found with that email.",
          });
        }
        const shelter = result.rows[0];

        // Compare password
        const isValid = await bcrypt.compare(password, shelter.password_hash);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }

        // Success: return the shelter object
        return done(null, shelter);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ================== Passport Serialization ==================

// Store only id and type in session
passport.serializeUser((user, done) => {
  if (user.admin_id) {
    done(null, { id: user.admin_id, type: "admin" });
  } else if (user.client_id) {
    done(null, { id: user.client_id, type: "client" });
  } else if (user.shelter_id) {
    done(null, { id: user.shelter_id, type: "shelter" });
  } else {
    done(new Error("Unknown user type during serialization"));
  }
});

// Fetch user from correct table using id and type
passport.deserializeUser(async (user, done) => {
  try {
    if (user.type === "admin") {
      // No DB lookup needed, just return the dummy admin object
      return done(null, { admin_id: 1, email: process.env.ADMIN_EMAIL });
    } else if (user.type === "client") {
      const result = await db.query(
        "SELECT * FROM client WHERE client_id = $1",
        [user.id]
      );
      if (result.rows.length > 0) return done(null, result.rows[0]);
      else return done(null, false);
    } else if (user.type === "shelter") {
      const result = await db.query(
        "SELECT * FROM shelter WHERE shelter_id = $1",
        [user.id]
      );
      if (result.rows.length > 0) return done(null, result.rows[0]);
      else return done(null, false);
    } else {
      return done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

// ================== Action Logging Helper ==================
async function logAction(table, recordId, actionType) {
  try {
    await db.query(
      "INSERT INTO action_log (table_name, record_id, action_type) VALUES ($1, $2, $3)",
      [table, recordId, actionType]
    );
  } catch (err) {
    console.error("Failed to log action:", err.message);
  }
}

// ================== Middleware for Route Protection ==================
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin_id) return next();
  res.redirect("/admin/login");
}

function ensureClient(req, res, next) {
  if (req.isAuthenticated() && req.user.client_id) return next();
  res.redirect("/client/login");
}

function ensureShelter(req, res, next) {
  if (req.isAuthenticated() && req.user.shelter_id) return next();
  res.redirect("/shelter/login");
}

// ================== Auth & Home Routes ==================

// Home page
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    // Redirect to the correct dashboard based on user type
    if (req.user.admin_id) {
      return res.redirect("/admin/dashboard");
    } else if (req.user.client_id) {
      return res.redirect("/client/dashboard");
    } else if (req.user.shelter_id) {
      return res.redirect("/shelter/dashboard");
    }
  }
  // If not logged in, render the home page
  res.render("home");
});

// Client auth pages
app.get("/client/login", (req, res) => {
  res.render("client-login");
});
app.get("/client/register", (req, res) => {
  res.render("client-register");
});

// Shelter auth pages
app.get("/shelter/login", (req, res) => {
  res.render("shelter-login");
});
app.get("/shelter/register", (req, res) => {
  res.render("shelter-register");
});

// Admin auth pages
app.get("/admin/login", (req, res) => {
  res.render("admin-login");
});

// ================== Registration & Login ==================

// Admin login
app.post("/admin/login", (req, res, next) => {
  passport.authenticate("admin-local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/admin/login");
    req.logIn(user, (err) => {
      if (err) return next(err);
      // Log admin login
      logAction("admin", user.admin_id, "LOGIN");
      res.redirect("/admin/dashboard");
    });
  })(req, res, next);
});

// Client registration
app.post("/client/register", async (req, res) => {
  const { full_name, email, password, phone_number, address } = req.body;
  try {
    const existing = await db.query("SELECT * FROM client WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .render("client-register", { error: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO client (full_name, email, password_hash, phone_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING client_id",
      [full_name, email, hashedPassword, phone_number, address]
    );
    // Log client registration (business event, triggers will also log INSERT)
    await logAction("client", result.rows[0].client_id, "REGISTER");
    res.redirect("/client/login");
  } catch (err) {
    res
      .status(500)
      .render("client-register", {
        error: "Registration failed: " + err.message,
      });
  }
});

// Client login
app.post("/client/login", (req, res, next) => {
  passport.authenticate("client-local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/client/login");
    req.logIn(user, async (err) => {
      if (err) return next(err);
      await logAction("client", user.client_id, "LOGIN");
      res.redirect("/client/dashboard");
    });
  })(req, res, next);
});

// Shelter registration
app.post("/shelter/register", async (req, res) => {
  const { shelter_name, email, password, location, contact_number } = req.body;
  try {
    const existing = await db.query(
      "SELECT * FROM shelter WHERE shelter_name = $1",
      [shelter_name]
    );
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .render("shelter-register", {
          error: "Shelter name already registered.",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO shelter (shelter_name, email, password_hash, location, contact_number) VALUES ($1, $2, $3, $4, $5) RETURNING shelter_id",
      [shelter_name, email, hashedPassword, location, contact_number]
    );
    // Log shelter registration (business event, triggers will also log INSERT)
    await logAction("shelter", result.rows[0].shelter_id, "REGISTER");
    res.redirect("/shelter/login");
  } catch (err) {
    res
      .status(500)
      .render("shelter-register", {
        error: "Registration failed: " + err.message,
      });
  }
});

// Shelter login
app.post("/shelter/login", (req, res, next) => {
  passport.authenticate("shelter-local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/shelter/login");
    req.logIn(user, async (err) => {
      if (err) return next(err);
      await logAction("shelter", user.shelter_id, "LOGIN");
      res.redirect("/shelter/dashboard");
    });
  })(req, res, next);
});

// Logout route (for all user types)
app.post("/logout", async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.admin_id) {
      await logAction("admin", req.user.admin_id, "LOGOUT");
    } else if (req.user.client_id) {
      await logAction("client", req.user.client_id, "LOGOUT");
    } else if (req.user.shelter_id) {
      await logAction("shelter", req.user.shelter_id, "LOGOUT");
    }
  }
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

// ================== Client Dashboard & Adoption Routes ==================

// Client dashboard: shows available pets and client's adoption requests
app.get("/client/dashboard", ensureClient, async (req, res) => {
  try {
    const search = req.query.search || "";
    let petsQuery = `
      SELECT pet.*, shelter.shelter_name, shelter.location AS shelter_address
      FROM pet
      JOIN shelter ON pet.shelter_id = shelter.shelter_id
      WHERE pet.status = 'Available'
    `;
    let queryParams = [];
    if (search) {
      petsQuery += ` AND (LOWER(pet.name) LIKE $1 OR LOWER(pet.species) LIKE $1 OR LOWER(pet.breed) LIKE $1)`;
      queryParams.push(`%${search.toLowerCase()}%`);
    }
    petsQuery += " ORDER BY pet.arrival_date DESC";
    const petsResult = await db.query(petsQuery, queryParams);

    // Fetch this client's adoption requests with pet and shelter info
    const adoptionsResult = await db.query(
      `SELECT a.*, p.name AS pet_name, p.species, p.breed, p.pet_image, p.description, 
              p.age, p.gender, s.shelter_name, s.location AS shelter_address, 
              a.status, a.visit_date, a.approval_date, a.shelter_response
       FROM adoption a
       JOIN pet p ON a.pet_id = p.pet_id
       JOIN shelter s ON p.shelter_id = s.shelter_id
       WHERE a.client_id = $1
       ORDER BY a.request_date DESC`,
      [req.user.client_id]
    );

    // List of pet_ids already requested by this client
    const requestedPetIds = adoptionsResult.rows.map((row) => row.pet_id);

    res.render("client-dashboard", {
      user: req.user,
      pets: petsResult.rows,
      adoptions: adoptionsResult.rows,
      requestedPetIds,
      search,
    });
  } catch (err) {
    res.status(500).send("Error loading dashboard: " + err.message);
  }
});

// Client requests adoption for a pet (business event)
app.post("/adoption/request", ensureClient, async (req, res) => {
  const { pet_id, client_reason } = req.body;
  try {
    const existing = await db.query(
      "SELECT * FROM adoption WHERE client_id = $1 AND pet_id = $2",
      [req.user.client_id, pet_id]
    );
    if (existing.rows.length > 0) {
      return res.redirect("/client/dashboard");
    }
    const result = await db.query(
      `INSERT INTO adoption (pet_id, client_id, request_date, status, client_reason)
       VALUES ($1, $2, CURRENT_DATE, 'Pending', $3) RETURNING adoption_id`,
      [pet_id, req.user.client_id, client_reason]
    );
    // Log adoption request (business event)
    await logAction("adoption", result.rows[0].adoption_id, "REQUEST");
    res.redirect("/client/dashboard");
  } catch (err) {
    res.status(500).send("Failed to request adoption: " + err.message);
  }
});

// Client cancels a pending adoption request (business event)
app.post("/adoption/cancel", ensureClient, async (req, res) => {
  const { adoption_id } = req.body;
  try {
    const adoption = await db.query(
      "SELECT * FROM adoption WHERE adoption_id = $1 AND client_id = $2 AND status = $3",
      [adoption_id, req.user.client_id, "Pending"]
    );
    if (adoption.rows.length === 0) {
      return res.redirect("/client/dashboard");
    }
    await db.query("UPDATE adoption SET status = $1 WHERE adoption_id = $2", [
      "Cancelled",
      adoption_id,
    ]);
    // Log cancel event (business event)
    await logAction("adoption", adoption_id, "CANCEL");
    res.redirect("/client/dashboard");
  } catch (err) {
    res.status(500).send("Failed to cancel adoption request: " + err.message);
  }
});

// ================== Shelter Dashboard & Pet/Adoption Management ==================

// Shelter dashboard: shows all pets and adoption requests for this shelter
app.get("/shelter/dashboard", ensureShelter, async (req, res) => {
  try {
    const petsResult = await db.query(
      "SELECT * FROM pet WHERE shelter_id = $1 ORDER BY arrival_date DESC",
      [req.user.shelter_id]
    );
    const adoptionsResult = await db.query(
      `SELECT a.*, c.full_name, c.email, c.phone_number, p.name AS pet_name, p.pet_image
       FROM adoption a
       JOIN client c ON a.client_id = c.client_id
       JOIN pet p ON a.pet_id = p.pet_id
       WHERE p.shelter_id = $1
       ORDER BY a.request_date DESC`,
      [req.user.shelter_id]
    );
    res.render("shelter-dashboard", {
      user: req.user,
      pets: petsResult.rows,
      adoptions: adoptionsResult.rows,
    });
  } catch (err) {
    res.status(500).send("Error loading shelter dashboard: " + err.message);
  }
});

// Shelter adds a new pet (triggers will log INSERT; no app log needed)
app.post("/pet/add", ensureShelter, async (req, res) => {
  const { name, species, breed, age, gender, description, pet_image } =
    req.body;
  try {
    await db.query(
      `INSERT INTO pet (shelter_id, name, species, breed, age, gender, description, arrival_date, status, pet_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'Available', $8)`,
      [
        req.user.shelter_id,
        name,
        species,
        breed,
        age,
        gender,
        description,
        pet_image,
      ]
    );
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to add pet: " + err.message);
  }
});

// Shelter approves an adoption request and puts pet on HOLD (business events)
app.post("/adoption/approve", ensureShelter, async (req, res) => {
  const { adoption_id, shelter_response, visit_date } = req.body;
  try {
    // Get the pet_id for this adoption request
    const adoptionRes = await db.query(
      "SELECT pet_id FROM adoption WHERE adoption_id = $1",
      [adoption_id]
    );
    if (adoptionRes.rows.length === 0) {
      return res.status(404).send("Adoption request not found.");
    }
    const pet_id = adoptionRes.rows[0].pet_id;

    // Approve the adoption request
    await db.query(
      `UPDATE adoption 
       SET status = 'Approved', approval_date = CURRENT_DATE, shelter_response = $1, visit_date = $2
       WHERE adoption_id = $3`,
      [shelter_response, visit_date, adoption_id]
    );

    // Set the pet's status to "HOLD"
    await db.query(`UPDATE pet SET status = 'HOLD' WHERE pet_id = $1`, [
      pet_id,
    ]);

    // Log business events
    await logAction("adoption", adoption_id, "APPROVE");
    await logAction("pet", pet_id, "HOLD");
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to approve adoption: " + err.message);
  }
});

// Shelter rejects an adoption request (business event)
app.post("/adoption/reject", ensureShelter, async (req, res) => {
  const { adoption_id, shelter_response } = req.body;
  try {
    await db.query(
      `UPDATE adoption SET status = 'Rejected', shelter_response = $1
       WHERE adoption_id = $2`,
      [shelter_response, adoption_id]
    );
    await logAction("adoption", adoption_id, "REJECT");
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to reject adoption: " + err.message);
  }
});

// Shelter marks a pet as adopted (business event)
app.post("/pet/mark-adopted", ensureShelter, async (req, res) => {
  const { pet_id } = req.body;
  try {
    await db.query(
      `UPDATE pet SET status = 'Adopted' WHERE pet_id = $1 AND shelter_id = $2`,
      [pet_id, req.user.shelter_id]
    );
    await logAction("pet", pet_id, "ADOPTED");
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to mark pet as adopted: " + err.message);
  }
});

// Shelter deletes a pet (triggers will log DELETE; no app log needed)
app.post("/pet/delete", ensureShelter, async (req, res) => {
  const { pet_id } = req.body;
  try {
    await db.query(`DELETE FROM pet WHERE pet_id = $1 AND shelter_id = $2`, [
      pet_id,
      req.user.shelter_id,
    ]);
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to delete pet: " + err.message);
  }
});

// Shelter marks an adoption as completed (business event)
app.post("/adoption/finalize", ensureShelter, async (req, res) => {
  const { adoption_id, pet_id, final_status } = req.body;
  let { visit_date } = req.body;
  if (visit_date) {
    visit_date = visit_date.slice(0, 10); // Ensures only 'YYYY-MM-DD'
  }
  try {
    if (final_status === "Adopted") {
      await db.query(
        `UPDATE adoption SET status = 'Completed', approval_date = $1 WHERE adoption_id = $2`,
        [visit_date, adoption_id]
      );
      await db.query(
        `UPDATE pet SET status = 'Adopted' WHERE pet_id = $1`,
        [pet_id]
      );
      await logAction("adoption", adoption_id, "COMPLETE");
      await logAction("pet", pet_id, "ADOPTED");
    } else if (final_status === "Available") {
      await db.query(
        `UPDATE adoption SET status = 'Rejected' WHERE adoption_id = $1`,
        [adoption_id]
      );
      await db.query(
        `UPDATE pet SET status = 'Available' WHERE pet_id = $1`,
        [pet_id]
      );
      await logAction("adoption", adoption_id, "REJECT");
      await logAction("pet", pet_id, "AVAILABLE");
    }
    res.redirect("/shelter/dashboard");
  } catch (err) {
    res.status(500).send("Failed to finalize adoption: " + err.message);
  }
});




// ================== Admin Dashboard & Action Log ==================

// Admin dashboard: view action log
app.get("/admin/dashboard", ensureAdmin, async (req, res) => {
  try {
    const logs = await db.query(
      "SELECT * FROM action_log ORDER BY timestamp DESC LIMIT 100"
    );
    res.render("admin-dashboard", { user: req.user, logs: logs.rows });
  } catch (err) {
    res.status(500).send("Failed to retrieve action logs: " + err.message);
  }
});
// ================== Error Handling ==================
app.use((err, req, res, next) => {
  res.status(500).render("error", { error: err });
});
app.use((req, res) => {
  res.status(404).render("error", { error: { message: "Page Not Found" } });
});

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
