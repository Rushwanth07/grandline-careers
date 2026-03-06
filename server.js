const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Firebase Admin Setup
// Note: In production, you'd use a service account JSON or environment variables
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('⚓ Firebase Admin initialized successfully!');
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
    }
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic API Key Middleware for public routes
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(403).json({ error: 'Invalid API Key' });
    }
};

// Welcome Route
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the GrandLine Careers API! 🌊",
        status: "Running",
        crew: "Straw Hat Backend"
    });
});

// Auth Verification Middleware
const authenticateUser = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).json({ error: 'No Haki detected (Unauthorized)' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid Haki level (Forbidden)' });
    }
};

// Career Endpoints (Protected by API Key)
app.get('/api/careers', apiKeyMiddleware, (req, res) => {
    // Mock career data based on the One Piece theme
    const careers = [
        { id: 1, role: "Shipwright Tech", icon: "🛠️", crew: "Franky", description: "Build the future of engineering." },
        { id: 2, role: "Navigator Finance", icon: "🧭", crew: "Nami", description: "Master the waves of the market." },
        { id: 3, role: "Doctor & Medic", icon: "🌸", crew: "Chopper", description: "Heal the world with cutting-edge tech." },
        { id: 4, role: "Historian & Design", icon: "📖", crew: "Robin", description: "Uncover the secrets of creative design." }
    ];
    res.json(careers);
});

// User Profile (Protected)
app.get('/api/profile', authenticateUser, async (req, res) => {
    try {
        const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: "Pirate profile not found" });
        }
        res.json(userDoc.data());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile (Protected)
app.post('/api/profile', authenticateUser, async (req, res) => {
    try {
        const { displayName, hakiLevel, devilFruit } = req.body;
        await admin.firestore().collection('users').doc(req.user.uid).set({
            displayName,
            hakiLevel,
            devilFruit,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true, message: "Profile updated! You're ready to set sail!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke in the GrandLine! 🏮');
});

app.listen(PORT, () => {
    console.log(`🚀 Ship is sailing on port ${PORT}`);
});
