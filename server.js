const path = require('path');
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

// Health Route
app.get('/api/health', (req, res) => {
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

// Mock career data based on the One Piece theme
const careers = [
    { id: 1, role: "Shipwright Tech", icon: "🛠️", crew: "Franky", description: "Build the future of engineering.", skills: "Varying, Cybernetics", devilFruit: "None" },
    { id: 2, role: "Navigator Finance", icon: "🧭", crew: "Nami", description: "Master the waves of the market.", skills: "Clima-Tact, Cartography", devilFruit: "None" },
    { id: 3, role: "Doctor & Medic", icon: "🌸", crew: "Chopper", description: "Heal the world with cutting-edge tech.", skills: "Medicine, Rumble Ball", devilFruit: "Hito Hito no Mi" },
    { id: 4, role: "Historian & Design", icon: "📖", crew: "Robin", description: "Uncover the secrets of creative design.", skills: "Archaeology, Espionage", devilFruit: "Hana Hana no Mi" },
    { id: 5, role: "Education & Research", icon: "🧠", crew: "Vegapunk", description: "Push science and knowledge to the limits.", skills: "Innovation, Physics", devilFruit: "Nomi Nomi no Mi" },
    { id: 6, role: "Business & Strategy", icon: "🏴", crew: "Crocodile", description: "Negotiate and build empires.", skills: "Logistics, Strategy", devilFruit: "Suna Suna no Mi" },
    { id: 7, role: "Engineering", icon: "⭐", crew: "Usopp", description: "Invent gadgets with Sogeking precision.", skills: "Sniping, Crafting", devilFruit: "None" },
    { id: 8, role: "Marketing & Media", icon: "💀", crew: "Brook", description: "Captivate audiences with performance.", skills: "Music, Fencing", devilFruit: "Yomi Yomi no Mi" }
];

// Career Endpoints (Protected by API Key)
app.get('/api/careers', apiKeyMiddleware, (req, res) => {
    res.json(careers);
});

// Search Endpoint (Protected by API Key)
app.get('/api/search', apiKeyMiddleware, (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    const filteredResults = careers.filter(c =>
        c.role.toLowerCase().includes(query) ||
        c.crew.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.skills.toLowerCase().includes(query) ||
        c.devilFruit.toLowerCase().includes(query)
    );
    res.json(filteredResults);
});

// Single Career Details Endpoint (Protected by API Key)
app.get('/api/careers/:id', apiKeyMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const career = careers.find(c => c.id === id);
    if (!career) {
        return res.status(404).json({ error: "Career path not found" });
    }

    // Add detailed roadmaps per career to give users actionable steps
    const roadmaps = {
        1: [
            { title: "Learn the Basics", task: "Master HTML, CSS, and basic JavaScript. Understand how the web works." },
            { title: "Master a Framework", task: "Learn React, Vue, or Angular to build complex interfaces." },
            { title: "Backend Architecture", task: "Understand Node.js, databases, and API construction." },
            { title: "Shipwright Certification", task: "Contribute to open source projects and build a portfolio." }
        ],
        2: [
            { title: "Data Fundamentals", task: "Learn Excel, SQL, and basic statistical analysis." },
            { title: "Financial Modeling", task: "Understand market trends and learn Python for data science." },
            { title: "Navigation Tools", task: "Master BI tools like Tableau or PowerBI." },
            { title: "Chart the Course", task: "Analyze complex datasets and present findings to stakeholders." }
        ],
        3: [
            { title: "Anatomy of Code", task: "Understand system architecture and debug complex systems." },
            { title: "Rumble Ball Scaling", task: "Learn cloud infrastructure (AWS/GCP) to scale applications." },
            { title: "Preventative Care", task: "Master testing frameworks and CI/CD pipelines." },
            { title: "The Cure", task: "Lead incident response and maintain high system availability." }
        ],
        4: [
            { title: "Decipher the Poneglyphs", task: "Learn UX research methodologies and user psychology." },
            { title: "Hana Hana Prototyping", task: "Master Figma and interaction design." },
            { title: "Visual Storytelling", task: "Understand color theory, typography, and layout." },
            { title: "The True History", task: "Create comprehensive design systems used by entire organizations." }
        ],
        5: [
            { title: "Read the Manuals", task: "Read academic papers and understand core algorithms." },
            { title: "Lab Experiments", task: "Build proofs of concept using new technologies." },
            { title: "Publish Findings", task: "Write technical blogs and speak at conferences." },
            { title: "Push Boundaries", task: "Develop new tools or frameworks for the community." }
        ],
        6: [
            { title: "Understand the Market", task: "Analyze competitors and identify user needs." },
            { title: "Build the Syndicate", task: "Learn cross-functional leadership and agile management." },
            { title: "Execute the Plan", task: "Manage product backlogs, sprints, and roadmaps." },
            { title: "Utopia", task: "Launch successful products that solve real problems." }
        ],
        7: [
            { title: "Sniper Training", task: "Master low-level languages like C/C++ or Rust." },
            { title: "Build Gadgets", task: "Understand IoT devices and embedded systems." },
            { title: "Pop Greens", task: "Develop specialized tools for automation." },
            { title: "Sogeking", task: "Become a crucial problem solver for edge-case technical issues." }
        ],
        8: [
            { title: "Learn the Chords", task: "Understand marketing channels: SEO, Social, Email." },
            { title: "Write the Lyrics", task: "Master copywriting and content strategy." },
            { title: "The Performance", task: "Run campaigns and analyze conversion metrics." },
            { title: "Soul King", task: "Build a brand that resonates with a global audience." }
        ]
    };

    res.json({ ...career, roadmaps: roadmaps[id] || [] });
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

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get(/^.*$/, (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke in the GrandLine! 🏮');
});

app.listen(PORT, () => {
    console.log(`🚀 Ship is sailing on port ${PORT}`);
});
