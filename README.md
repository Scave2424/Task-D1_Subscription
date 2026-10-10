# P4 Login and Registration

## Introduction

This project extends the DEV@Deakin homepage by adding Login and Sign Up pages using React and Firebase. It builds on the previous homepage task and introduces user authentication and storing user profile information.

## Features

- **Homepage:** Displays the personal introduction, projects, featured articles, and featured tutorials.
- **Navigation:** Provides shared navigation and a footer across pages.
- **User Registration:** Allows users to register with their name, email, password, and password confirmation.
- **User Login:** Allows registered users to log in using their email and password.
- **Google Sign-In:** Provides an alternative option to register or log in using a Google account.
- **Form Validation:** Checks required fields, password length, and password confirmation.
- **Firebase Authentication:** Handles account creation and email/password authentication.
- **Cloud Firestore:** Stores user profile information in the `users` collection.

## Technologies Used

- React
- JavaScript
- React Router
- Firebase Authentication
- Cloud Firestore
- CSS
- Vite
- bcryptjs

## Project Structure

```text
Login&Registration/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── NavFooter.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── firebase.js
├── .env.example
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── package.json
└── README.md
```

## Setup and Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a Firebase project and register a web app. Enable Email/Password and Google sign-in under Authentication, and configure Cloud Firestore.

Create a `.env` file in the project root using the Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the example values with your actual Firebase configuration. Keep `.env` private and do not upload it to GitHub.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL displayed in the terminal to view the website.

## Application Routes

- `/` : Homepage
- `/login` : Login page
- `/signup` : Sign Up page

## GitHub Repository

Repository: https://github.com/Scave2424/Task-P4_Login-Registration

