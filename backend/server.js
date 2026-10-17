require("dotenv").config();

const cors = require("cors");
const express = require("express");
const sgMail = require("@sendgrid/mail");

const app = express();
const PORT = 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));

const subscribers = [];

// Handle newsletter subscriptions
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required."
        });
    }

    try {
        subscribers.push(email);

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