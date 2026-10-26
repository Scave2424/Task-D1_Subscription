require("dotenv").config({ path: __dirname + "/.env" });

const cors = require("cors");
const express = require("express");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const app = express();
const PORT = 3000;

if (!process.env.JWT_SECRET || !process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error("Firebase credentials and JWT_SECRET must be configured.");
}

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
    credential: admin.cert(serviceAccount)
});

const db = getFirestore();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

// Creates a signed JWT for the authenticated user.
function createToken(user) {
    return jwt.sign(
        {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || ""
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// Checks the JWT supplied by the frontend.
function getAuthenticatedUser(req) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return null;
    }

    try {
        return jwt.verify(
            authorization.substring(7),
            process.env.JWT_SECRET
        );
    } catch {
        return null;
    }
}

// Registers a new user through the backend.
app.post("/register", async (req, res) => {
    const { displayName, email, password } = req.body;

    if (
        !displayName ||
        !email ||
        !password ||
        !displayName.trim().includes(" ") ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        password.trim() === "" ||
        password.length < 6
    ) {
        return res.status(400).json({
            message: "Enter a full name, valid email and password of at least 6 characters."
        });
    }

    let user;

    try {
        const normalizedEmail = email.trim().toLowerCase();

        user = await getAuth().createUser({
            displayName: displayName.trim(),
            email: normalizedEmail,
            password
        });

        const passwordHash = await bcrypt.hash(password, 10);

        await db.collection("users").doc(user.uid).set({
            displayName: displayName.trim(),
            email: normalizedEmail,
            passwordHash,
            plan: "Free"
        });

        return res.status(201).json({
            message: "Registration successful. Please log in."
        });
    } catch (error) {
        if (user) {
            await getAuth().deleteUser(user.uid).catch(() => { });
        }

        if (error.code === "auth/email-already-exists") {
            return res.status(409).json({
                message: "This email already has an account. Please log in."
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Could not complete registration."
        });
    }
});

// Logs in an existing email and password user.
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await getAuth().getUserByEmail(normalizedEmail);
        const userDoc = await db.collection("users").doc(user.uid).get();

        if (!userDoc.exists) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const userDetails = userDoc.data();

        if (
            !userDetails.passwordHash ||
            userDetails.email !== normalizedEmail ||
            !(await bcrypt.compare(password, userDetails.passwordHash))
        ) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const token = createToken(user);

        return res.json({
            message: "Login successful.",
            token,
            user: {
                uid: user.uid,
                displayName: userDetails.displayName || "",
                email: userDetails.email,
                plan: userDetails.plan || "Free"
            }
        });
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Unable to log in."
        });
    }
});

// Exchanges a Firebase Google sign-in token for a D1 session JWT.
app.post("/google-session", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({
            message: "Google sign-in token is required."
        });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const user = await getAuth().getUser(decodedToken.uid);
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({
                displayName: user.displayName || "",
                email: user.email,
                plan: "Free"
            });
        } else {
            const userDetails = userDoc.data();
            const updates = {};

            if (!userDetails.displayName && user.displayName) {
                updates.displayName = user.displayName;
            }

            if (!userDetails.email && user.email) {
                updates.email = user.email;
            }

            if (!userDetails.plan) {
                updates.plan = "Free";
            }

            if (Object.keys(updates).length > 0) {
                await userRef.update(updates);
            }
        }

        const userDetails = (await userRef.get()).data();
        const token = createToken(user);

        return res.json({
            message: "Google session created.",
            token,
            user: {
                uid: user.uid,
                displayName: userDetails.displayName || "",
                email: userDetails.email,
                plan: userDetails.plan || "Free"
            }
        });
    } catch (error) {
        console.error("Google session error:", error.message);

        return res.status(401).json({
            message: "Google sign-in could not be verified."
        });
    }
});

// Upgrades the authenticated user's Firestore plan.
app.post("/upgrade", async (req, res) => {
    const user = getAuthenticatedUser(req);

    if (!user) {
        return res.status(401).json({
            message: "Please log in before upgrading."
        });
    }

    try {
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({
                message: "User profile could not be found."
            });
        }

        if (userDoc.data().plan === "Paid") {
            return res.status(400).json({
                message: "You are already on the Paid plan."
            });
        }

        await userRef.update({
            plan: "Paid"
        });

        return res.json({
            message: "Your plan has been upgraded to Paid.",
            plan: "Paid"
        });
    } catch (error) {
        console.error("Upgrade error:", error.message);

        return res.status(500).json({
            message: "Could not upgrade your plan."
        });
    }
});

// Handle newsletter subscriptions.
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required."
        });
    }

    try {
        const message = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: "Welcome to DEV@Deakin!",
            text: "Welcome to DEV@Deakin! Thanks for subscribing to our Daily Insider.",
            html: "<h2>Welcome to DEV@Deakin!</h2><p>Thanks for subscribing to our Daily Insider.</p>"
        };

        const result = await sgMail.send(message);

        console.log("SendGrid status:", result[0].statusCode);

        return res.status(202).json({
            message: "Welcome email sent successfully!"
        });
    } catch (error) {
        console.error("SendGrid error:", error.response?.body || error.message);

        return res.status(500).json({
            message: "Unable to send welcome email."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});