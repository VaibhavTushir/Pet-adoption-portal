
---

# 🐾 Pawsitive Match: Pet Adoption Portal

A full-stack web application that bridges the gap between animal shelters and loving adopters.  
**Find, adopt, and give a new life to pets—all in a few clicks!**

---

## ✨ Features

- 🔐 **Secure Authentication:** Email/password (Passport.js)
- 🏠 **Role-Based Access:**  
  - **Clients:** Register, browse pets, request adoptions, track requests  
  - **Shelters:** Manage pet listings, review and process adoption requests
- 🐕 **Pet Management:** Add, edit, and update pet profiles with images and details
- 📋 **Adoption Workflow:** Request, approve, and finalize adoptions
- 📝 **Audit Logging:** All key actions are automatically tracked
- 📱 **Responsive UI:** Clean, mobile-friendly design with Tailwind CSS
- 🔎 **Search & Filter:** Quickly find pets by species, breed, or status

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, Passport.js, Axios
- **Frontend:** EJS, Tailwind CSS, HTML, CSS
- **Database:** PostgreSQL
- **Session Management:** express-session
- **Security:** bcrypt for password hashing
- **Diagrams:** dbdiagram.io, draw.io

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/pawsitive-match.git
cd pawsitive-match
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```ini
PORT=3000
PG_USER=your_db_username
PG_PASSWORD=your_db_password
PG_HOST=your_db_host
PG_DATABASE=your_db_name
PG_PORT=your_db_port
SESSION_SECRET=your_secret_key
SALT_ROUNDS=10
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$examplehashedpasswordstring
```
> Replace `ADMIN_PASSWORD_HASH` with your actual bcrypt hash (10 rounds) for the admin password.

### 4. Set Up the Database
- Create a PostgreSQL database (e.g., `pet_adoption`)
- Run the SQL scripts in `/db` to set up tables, triggers, and sample data

### 5. Start the Application
```bash
npm start
```
Visit **http://localhost:3000** in your browser.


---

## 📑 Project Structure

```
/backend        # Node.js/Express backend code
/frontend       # EJS templates, Tailwind CSS, static assets
/db             # SQL scripts for schema, triggers, sample data
/public         # Images and static files
```

---

## 🗃️ Database Highlights

- Normalized schema: client, shelter, pet, adoption, action_log
- Primary, foreign, and candidate keys
- Triggers for audit logging
- Optimized indexes for query speed
- Complex queries for dashboards and workflows

---

## 🌟 Future Enhancements

- 🚀 **Deployment:** Dockerize the app for easy deployment; set up CI/CD pipelines
- ☁️ **Cloud Hosting:** Deploy on platforms like Heroku, AWS, or Azure
- 🧩 **API Documentation:** Add Swagger/OpenAPI docs for backend endpoints
- 🔒 **Enhanced Security:** Implement rate limiting, helmet.js, and 2FA
- 🖼️ **Pet Galleries:** Support multiple images per pet
- 📊 **Analytics:** Add dashboards for adoption trends and shelter performance
- 🔔 **Notifications:** Email/SMS updates for adoption status
- 🌙 **Dark Mode:** For night-time browsing
- 📱 **Mobile App:** Build a companion mobile app for adopters and shelters

---

## 🤝 Contributing

Have suggestions or want to help?  
Fork the repo, make your improvements, and open a pull request!  
All contributions are welcome. 🐾

---

## 📝 License

This project is for academic use only.

---

## 👤 Author

**Vaibhav**  
Delhi Technological University

---

**Adopt, don’t shop! Give a pet a loving home today. 🐶🐱**

---