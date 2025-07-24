# 🐾 Pawsitive Match - Pet Adoption Portal

**Pawsitive Match** is a modern, full-stack web application designed to connect potential pet adopters with animals in need from various shelters. It provides a seamless, interactive experience for users looking for a new companion and a powerful dashboard for shelters to manage their pets and adoption requests.

This project has been completely refactored from a classic server-side rendered application to a **decoupled, API-first architecture** featuring a **React Single Page Application (SPA)** and a **Node.js (Express) REST API** backend.

---

## 📋 Table of Contents

1.  [Key Features](#-key-features)
2.  [Technology Stack](#-technology-stack)
3.  [Architecture](#-architecture)
4.  [Setup and Installation](#️-setup-and-installation)
5.  [Running the Application](#️-running-the-application)
6.  [API Endpoints](#-api-endpoints)
7.  [Future Enhancements](#-future-enhancements)
8. [Contributing](#-contributing)
9. [Author](#-author)

---

## ✨ Key Features

* **Three User Roles with Dedicated Dashboards:**
    * **Clients:** Can register, log in, browse available pets, submit adoption requests, and view their request history.
    * **Shelters:** Can register their organization, log in, add new pets (including image uploads), and manage incoming adoption requests (approve/reject).
    * **Admins:** Have a global overview of all registered clients and shelters in the system.
* **Decoupled & Modern Architecture:** A robust Node.js/Express backend serves data via a RESTful API, while an interactive React frontend provides a fast, responsive user experience.
* **Secure Authentication & Authorization:** User registration and login are handled securely with password hashing (bcrypt) and session management. Protected routes ensure users can only access pages appropriate for their role.
* **Complete Adoption Workflow:** A comprehensive system for tracking pets and the status of adoption requests (`Pending`, `Approved`, `Rejected`).
* **Dynamic Image Uploads:** Shelters can easily upload images for the pets they list, which are stored and served by the backend.

---

## 🚀 Technology Stack

### Backend

| Technology           | Description                                |
| -------------------- | ------------------------------------------ |
| **Node.js** | JavaScript Runtime Environment             |
| **Express.js** | Web Application Framework                  |
| **PostgreSQL** | Relational Database                        |
| **pg** | Node.js PostgreSQL Client                  |
| **bcrypt** | Password Hashing                           |
| **express-session** | Session Management                         |
| **CORS** | Cross-Origin Resource Sharing              |
| **Multer** | File Upload Handling                       |
| **dotenv** | Environment Variable Management            |

### Frontend

| Technology        | Description                           |
| ----------------- | ------------------------------------- |
| **React.js** | JavaScript Library for UIs            |
| **React Router** | Declarative Routing for React         |
| **Axios** | Promise-based HTTP Client             |
| **Tailwind CSS** | Utility-First CSS Framework           |

---

## 🏛️ Architecture

The application follows a decoupled, two-tier architecture:

1.  **Frontend (Client-Side):** A React Single Page Application that handles all user interface logic and rendering. It communicates with the backend via API calls to fetch and send data, providing a dynamic and fluid user experience without page reloads.

2.  **Backend (Server-Side):** A Node.js/Express REST API that is responsible for business logic, database interactions, authentication, and serving static assets (like images). It is completely stateless from the client's perspective, only responding to HTTP requests with JSON data.

---

## ⚙️ Setup and Installation

To run this project locally, you will need to set up both the backend and the frontend.

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or later)
* [PostgreSQL](https://www.postgresql.org/download/)

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    * Make sure your PostgreSQL server is running.
    * Create a new database named `pet_adoption`.
    * Run the `schema.sql` file (located in the root of the original project files) against your `pet_adoption` database to create the necessary tables. You can use a tool like pgAdmin for this.

4.  **Create the environment file:**
    * In the `backend` directory, create a file named `.env`.
    * Copy the contents of your original `.env` file into it. It should look like this:
        ```env
        PG_USER="your_postgres_user"
        PG_HOST="localhost"
        PG_DATABASE="pet_adoption"
        PG_PASSWORD="your_postgres_password"
        PG_PORT="5432"
        SESSION_SECRET="a_very_strong_and_long_secret_key"
        PORT="3001" # Important: Use 3001 to avoid conflict with React

        ADMIN_EMAIL="admin@example.com"
        ADMIN_PASSWORD_HASH="your_bcrypt_hash_for_the_admin_password"
        ```

### 2. Frontend Setup

1.  **Open a new terminal window.**

2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

---

## ▶️ Running the Application

You must have both the backend and frontend servers running simultaneously.

1.  **Start the Backend Server:**
    * In your backend terminal (`/backend` directory), run:
        ```bash
        npm run dev
        ```
    * The API server should now be running on `http://localhost:3001`.

2.  **Start the Frontend Server:**
    * In your frontend terminal (`/frontend` directory), run:
        ```bash
        npm start
        ```
    * Your browser should automatically open to `http://localhost:3000`, where you can use the application.

---

## 🌐 API Endpoints

A brief overview of the main API endpoints available from the backend.

| Method | Endpoint                      | Description                               |
| :----- | :---------------------------- | :---------------------------------------- |
| `GET`  | `/api/auth/status`            | Check current user login status.          |
| `POST` | `/api/auth/logout`            | Log out the current user.                 |
| `POST` | `/api/client/register`        | Register a new client.                    |
| `POST` | `/api/client/login`           | Log in a client.                          |
| `GET`  | `/api/client/history`         | Get adoption history for the logged-in client. |
| `POST` | `/api/shelter/register`       | Register a new shelter.                   |
| `POST` | `/api/shelter/login`          | Log in a shelter.                         |
| `GET`  | `/api/shelter/requests`       | Get adoption requests for a shelter.      |
| `POST` | `/api/shelter/requests/update`| Update the status of an adoption request. |
| `GET`  | `/api/pets`                   | Get all available pets for adoption.      |
| `POST` | `/api/pets/add`               | Add a new pet (shelter role).             |
| `POST` | `/api/pets/adopt`             | Submit an adoption request (client role). |

---

## 🌟 Future Enhancements

-   🚀 **Deployment:** Dockerize the application for easy, consistent deployment and set up a CI/CD pipeline with GitHub Actions.
-   🧩 **API Documentation:** Integrate Swagger or OpenAPI for interactive API documentation.
-   🖼️ **Pet Galleries:** Allow shelters to upload multiple images per pet.
-   📊 **Advanced Dashboards:** Add charts and analytics for adoption trends and shelter performance.
-   🔔 **Notifications:** Implement email or in-app notifications for adoption status updates.
-   🔍 **Advanced Search & Filtering:** Add more complex filtering options for pets (e.g., by age, gender, location).
-   🌙 **Dark Mode:** Add a theme toggle for a better user experience in low-light environments.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 👤 Author

**Vaibhav**
* Delhi Technological University

---

**Adopt, don’t shop! Give a pet a loving home today. 🐶🐱**
