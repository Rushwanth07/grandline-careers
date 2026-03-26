const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const admin = require('firebase-admin');
require('dotenv').config();
const { validateCareerGuidancePayload, generateCareerGuidance } = require('./agents/careerGuidance');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
};

const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
);

if (hasFirebaseCredentials && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error.message);
  }
} else if (!hasFirebaseCredentials) {
  console.warn('Firebase credentials are missing; authenticated profile routes will be unavailable.');
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const sendUnexpectedError = (res, error, message = 'Internal server error') => {
  console.error(error);
  res.status(500).json({ error: message });
};

const normalizeStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const validateProfileUpdate = (payload) => {
  const errors = [];
  const updates = {};

  const hasDisplayName = Object.prototype.hasOwnProperty.call(payload, 'displayName');
  const hasHakiLevel = Object.prototype.hasOwnProperty.call(payload, 'hakiLevel');
  const hasDevilFruit = Object.prototype.hasOwnProperty.call(payload, 'devilFruit');
  const hasEducationLevel = Object.prototype.hasOwnProperty.call(payload, 'educationLevel');
  const hasCurrentStatus = Object.prototype.hasOwnProperty.call(payload, 'currentStatus');
  const hasTargetRole = Object.prototype.hasOwnProperty.call(payload, 'targetRole');
  const hasLearningStyle = Object.prototype.hasOwnProperty.call(payload, 'learningStyle');
  const hasShortTermGoal = Object.prototype.hasOwnProperty.call(payload, 'shortTermGoal');
  const hasCurrentSkills = Object.prototype.hasOwnProperty.call(payload, 'currentSkills');
  const hasInterests = Object.prototype.hasOwnProperty.call(payload, 'interests');
  const hasOnboardingCompleted = Object.prototype.hasOwnProperty.call(payload, 'onboardingCompleted');

  if (
    !hasDisplayName &&
    !hasHakiLevel &&
    !hasDevilFruit &&
    !hasEducationLevel &&
    !hasCurrentStatus &&
    !hasTargetRole &&
    !hasLearningStyle &&
    !hasShortTermGoal &&
    !hasCurrentSkills &&
    !hasInterests &&
    !hasOnboardingCompleted
  ) {
    errors.push('At least one profile field is required.');
  }

  if (hasDisplayName) {
    if (typeof payload.displayName !== 'string') {
      errors.push('displayName must be a string.');
    } else {
      const value = payload.displayName.trim();
      if (value.length < 2 || value.length > 80) {
        errors.push('displayName must be between 2 and 80 characters.');
      } else {
        updates.displayName = value;
      }
    }
  }

  if (hasHakiLevel) {
    const value = payload.hakiLevel;
    if (typeof value !== 'string' && typeof value !== 'number') {
      errors.push('hakiLevel must be a string or number.');
    } else if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (trimmedValue.length < 1 || trimmedValue.length > 50) {
        errors.push('hakiLevel string must be between 1 and 50 characters.');
      } else {
        updates.hakiLevel = trimmedValue;
      }
    } else if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push('hakiLevel number must be between 0 and 100.');
    } else {
      updates.hakiLevel = value;
    }
  }

  if (hasDevilFruit) {
    if (typeof payload.devilFruit !== 'string') {
      errors.push('devilFruit must be a string.');
    } else {
      const value = payload.devilFruit.trim();
      if (value.length < 1 || value.length > 80) {
        errors.push('devilFruit must be between 1 and 80 characters.');
      } else {
        updates.devilFruit = value;
      }
    }
  }

  if (hasEducationLevel) {
    if (typeof payload.educationLevel !== 'string') {
      errors.push('educationLevel must be a string.');
    } else {
      const value = payload.educationLevel.trim();
      if (value.length < 2 || value.length > 80) {
        errors.push('educationLevel must be between 2 and 80 characters.');
      } else {
        updates.educationLevel = value;
      }
    }
  }

  if (hasCurrentStatus) {
    if (typeof payload.currentStatus !== 'string') {
      errors.push('currentStatus must be a string.');
    } else {
      const value = payload.currentStatus.trim();
      if (value.length < 2 || value.length > 80) {
        errors.push('currentStatus must be between 2 and 80 characters.');
      } else {
        updates.currentStatus = value;
      }
    }
  }

  if (hasTargetRole) {
    if (typeof payload.targetRole !== 'string') {
      errors.push('targetRole must be a string.');
    } else {
      const value = payload.targetRole.trim();
      if (value.length < 2 || value.length > 120) {
        errors.push('targetRole must be between 2 and 120 characters.');
      } else {
        updates.targetRole = value;
      }
    }
  }

  if (hasLearningStyle) {
    if (typeof payload.learningStyle !== 'string') {
      errors.push('learningStyle must be a string.');
    } else {
      const value = payload.learningStyle.trim();
      if (value.length < 2 || value.length > 80) {
        errors.push('learningStyle must be between 2 and 80 characters.');
      } else {
        updates.learningStyle = value;
      }
    }
  }

  if (hasShortTermGoal) {
    if (typeof payload.shortTermGoal !== 'string') {
      errors.push('shortTermGoal must be a string.');
    } else {
      const value = payload.shortTermGoal.trim();
      if (value.length < 10 || value.length > 240) {
        errors.push('shortTermGoal must be between 10 and 240 characters.');
      } else {
        updates.shortTermGoal = value;
      }
    }
  }

  if (hasCurrentSkills) {
    const value = normalizeStringList(payload.currentSkills);
    if (value.length === 0 || value.length > 25) {
      errors.push('currentSkills must include between 1 and 25 items.');
    } else if (value.some((item) => item.length > 60)) {
      errors.push('Each currentSkills entry must be 60 characters or less.');
    } else {
      updates.currentSkills = value;
    }
  }

  if (hasInterests) {
    const value = normalizeStringList(payload.interests);
    if (value.length === 0 || value.length > 25) {
      errors.push('interests must include between 1 and 25 items.');
    } else if (value.some((item) => item.length > 60)) {
      errors.push('Each interests entry must be 60 characters or less.');
    } else {
      updates.interests = value;
    }
  }

  if (hasOnboardingCompleted) {
    if (typeof payload.onboardingCompleted !== 'boolean') {
      errors.push('onboardingCompleted must be a boolean.');
    } else {
      updates.onboardingCompleted = payload.onboardingCompleted;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    updates,
  };
};

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Welcome to the GrandLine Careers API',
    status: 'Running',
    firebase: admin.apps.length > 0 ? 'Connected' : 'Not configured',
  });
});

const authenticateUser = async (req, res, next) => {
  if (!admin.apps.length) {
    return res.status(503).json({ error: 'Authentication service unavailable' });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden' });
  }
};

const careers = [
  { id: 1, role: 'Shipwright Tech', icon: '\u2692\ufe0f', crew: 'Franky', description: 'Build the future of engineering.', skills: 'Varying, Cybernetics', devilFruit: 'None' },
  { id: 2, role: 'Navigator Finance', icon: '\ud83e\udded', crew: 'Nami', description: 'Master the waves of the market.', skills: 'Clima-Tact, Cartography', devilFruit: 'None' },
  { id: 3, role: 'Doctor & Medic', icon: '\ud83c\udf38', crew: 'Chopper', description: 'Heal the world with cutting-edge tech.', skills: 'Medicine, Rumble Ball', devilFruit: 'Hito Hito no Mi' },
  { id: 4, role: 'Historian & Design', icon: '\ud83d\udcd6', crew: 'Robin', description: 'Uncover the secrets of creative design.', skills: 'Archaeology, Espionage', devilFruit: 'Hana Hana no Mi' },
  { id: 5, role: 'Education & Research', icon: '\ud83e\udde0', crew: 'Vegapunk', description: 'Push science and knowledge to the limits.', skills: 'Innovation, Physics', devilFruit: 'Nomi Nomi no Mi' },
  { id: 6, role: 'Business & Strategy', icon: '\ud83c\udff4', crew: 'Crocodile', description: 'Negotiate and build empires.', skills: 'Logistics, Strategy', devilFruit: 'Suna Suna no Mi' },
  { id: 7, role: 'Engineering', icon: '\u2b50', crew: 'Usopp', description: 'Invent gadgets with Sogeking precision.', skills: 'Sniping, Crafting', devilFruit: 'None' },
  { id: 8, role: 'Marketing & Media', icon: '\ud83d\udc80', crew: 'Brook', description: 'Captivate audiences with performance.', skills: 'Music, Fencing', devilFruit: 'Yomi Yomi no Mi' },
];

app.get('/api/careers', (req, res) => {
  res.json(careers);
});

app.get('/api/search', (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  const filteredResults = careers.filter((career) =>
    career.role.toLowerCase().includes(query) ||
    career.crew.toLowerCase().includes(query) ||
    career.description.toLowerCase().includes(query) ||
    career.skills.toLowerCase().includes(query) ||
    career.devilFruit.toLowerCase().includes(query),
  );

  res.json(filteredResults);
});

app.get('/api/careers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const career = careers.find((item) => item.id === id);
  if (!career) {
    return res.status(404).json({ error: 'Career path not found' });
  }

  const roadmaps = {
    1: [
      { title: 'Learn the Basics', task: 'Master HTML, CSS, and basic JavaScript. Understand how the web works.' },
      { title: 'Master a Framework', task: 'Learn React, Vue, or Angular to build complex interfaces.' },
      { title: 'Backend Architecture', task: 'Understand Node.js, databases, and API construction.' },
      { title: 'Shipwright Certification', task: 'Contribute to open source projects and build a portfolio.' },
    ],
    2: [
      { title: 'Data Fundamentals', task: 'Learn Excel, SQL, and basic statistical analysis.' },
      { title: 'Financial Modeling', task: 'Understand market trends and learn Python for data science.' },
      { title: 'Navigation Tools', task: 'Master BI tools like Tableau or PowerBI.' },
      { title: 'Chart the Course', task: 'Analyze complex datasets and present findings to stakeholders.' },
    ],
    3: [
      { title: 'Anatomy of Code', task: 'Understand system architecture and debug complex systems.' },
      { title: 'Rumble Ball Scaling', task: 'Learn cloud infrastructure (AWS/GCP) to scale applications.' },
      { title: 'Preventative Care', task: 'Master testing frameworks and CI/CD pipelines.' },
      { title: 'The Cure', task: 'Lead incident response and maintain high system availability.' },
    ],
    4: [
      { title: 'Decipher the Poneglyphs', task: 'Learn UX research methodologies and user psychology.' },
      { title: 'Hana Hana Prototyping', task: 'Master Figma and interaction design.' },
      { title: 'Visual Storytelling', task: 'Understand color theory, typography, and layout.' },
      { title: 'The True History', task: 'Create comprehensive design systems used by entire organizations.' },
    ],
    5: [
      { title: 'Read the Manuals', task: 'Read academic papers and understand core algorithms.' },
      { title: 'Lab Experiments', task: 'Build proofs of concept using new technologies.' },
      { title: 'Publish Findings', task: 'Write technical blogs and speak at conferences.' },
      { title: 'Push Boundaries', task: 'Develop new tools or frameworks for the community.' },
    ],
    6: [
      { title: 'Understand the Market', task: 'Analyze competitors and identify user needs.' },
      { title: 'Build the Syndicate', task: 'Learn cross-functional leadership and agile management.' },
      { title: 'Execute the Plan', task: 'Manage product backlogs, sprints, and roadmaps.' },
      { title: 'Utopia', task: 'Launch successful products that solve real problems.' },
    ],
    7: [
      { title: 'Sniper Training', task: 'Master low-level languages like C/C++ or Rust.' },
      { title: 'Build Gadgets', task: 'Understand IoT devices and embedded systems.' },
      { title: 'Pop Greens', task: 'Develop specialized tools for automation.' },
      { title: 'Sogeking', task: 'Become a crucial problem solver for edge-case technical issues.' },
    ],
    8: [
      { title: 'Learn the Chords', task: 'Understand marketing channels: SEO, Social, Email.' },
      { title: 'Write the Lyrics', task: 'Master copywriting and content strategy.' },
      { title: 'The Performance', task: 'Run campaigns and analyze conversion metrics.' },
      { title: 'Soul King', task: 'Build a brand that resonates with a global audience.' },
    ],
  };

  return res.json({ ...career, roadmaps: roadmaps[id] || [] });
});

app.post('/api/agents/career-guidance', (req, res) => {
  const validation = validateCareerGuidancePayload(req.body || {});
  if (!validation.isValid) {
    return res.status(400).json({ error: 'Invalid guidance payload', details: validation.errors });
  }

  try {
    const guidance = generateCareerGuidance(validation.normalized, careers);
    return res.json(guidance);
  } catch (error) {
    return sendUnexpectedError(res, error, 'Failed to generate career guidance');
  }
});

app.get('/api/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Pirate profile not found' });
    }

    return res.json(userDoc.data());
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

app.post('/api/profile', authenticateUser, async (req, res) => {
  try {
    const validation = validateProfileUpdate(req.body || {});
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Invalid profile payload', details: validation.errors });
    }

    const profilePayload = {
      ...validation.updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .set(profilePayload, { merge: true });

    return res.json({
      success: true,
      message: "Profile updated! You're ready to set sail!",
      profile: {
        ...validation.updates,
        uid: req.user.uid,
      },
    });
  } catch (error) {
    return sendUnexpectedError(res, error);
  }
});

const frontendDistPath = path.join(__dirname, 'frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.get(/^.*$/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  return res.status(200).json({ message: 'GrandLine Careers API is running' });
});

app.use((err, req, res, next) => {
  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  console.error(err.stack);
  return res.status(500).json({ error: 'Something broke in the GrandLine!' });
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Ship is sailing on port ${PORT}`);
  });
}
