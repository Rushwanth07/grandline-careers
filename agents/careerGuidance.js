const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const splitListInput = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item || '').split(/[,\n]/))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(value || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const dedupe = (list) => Array.from(new Set(list));

const ROLE_LIBRARY = {
  'Shipwright Tech': {
    baselineSkills: ['html', 'css', 'javascript', 'react', 'node.js', 'api design', 'git'],
    quickWins: ['Build a responsive portfolio website', 'Create one REST API with Node.js', 'Ship one project to production'],
    resources: ['Frontend Mentor', 'JavaScript.info', 'Node.js docs'],
  },
  'Navigator Finance': {
    baselineSkills: ['excel', 'sql', 'statistics', 'financial modeling', 'python', 'tableau'],
    quickWins: ['Build a budget dashboard', 'Analyze a public financial dataset', 'Publish one case-study deck'],
    resources: ['Khan Academy Finance', 'Mode SQL tutorials', 'Tableau Public'],
  },
  'Doctor & Medic': {
    baselineSkills: ['debugging', 'incident response', 'observability', 'testing', 'cloud basics', 'automation'],
    quickWins: ['Create a monitoring checklist', 'Write integration tests for one module', 'Document a postmortem template'],
    resources: ['SRE Workbook', 'Testing Library docs', 'AWS Well-Architected'],
  },
  'Historian & Design': {
    baselineSkills: ['ux research', 'wireframing', 'figma', 'design systems', 'typography', 'accessibility'],
    quickWins: ['Redesign one screen with accessibility checks', 'Create a 5-screen Figma flow', 'Build a mini design system'],
    resources: ['Nielsen Norman Group', 'Refactoring UI', 'WCAG quick reference'],
  },
  'Education & Research': {
    baselineSkills: ['critical thinking', 'research methods', 'technical writing', 'experimentation', 'data interpretation'],
    quickWins: ['Summarize 3 papers weekly', 'Run one small experiment and report findings', 'Publish one technical explainer'],
    resources: ['arXiv', 'Papers with Code', 'Google Research Blog'],
  },
  'Business & Strategy': {
    baselineSkills: ['market research', 'product thinking', 'stakeholder communication', 'roadmapping', 'metrics'],
    quickWins: ['Define one product KPI dashboard', 'Write one PRD', 'Run one user interview sprint'],
    resources: ['Lenny\'s Newsletter', 'Product School', 'AARRR metrics guide'],
  },
  Engineering: {
    baselineSkills: ['c++', 'python', 'data structures', 'algorithms', 'system design', 'problem solving'],
    quickWins: ['Solve 30 coding problems', 'Build one systems project', 'Practice 5 mock interviews'],
    resources: ['LeetCode', 'System Design Primer', 'NeetCode'],
  },
  'Marketing & Media': {
    baselineSkills: ['copywriting', 'seo', 'social strategy', 'analytics', 'campaign planning'],
    quickWins: ['Launch one 14-day content sprint', 'Write 5 high-conversion posts', 'Analyze campaign CTR and retention'],
    resources: ['HubSpot Academy', 'Google Analytics Academy', 'Copyhackers'],
  },
};

const parseCareerSkills = (skills) =>
  String(skills || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const scoreRoleFit = (career, profileTokens, targetRole) => {
  const library = ROLE_LIBRARY[career.role] || { baselineSkills: [], quickWins: [], resources: [] };
  const required = dedupe([...parseCareerSkills(career.skills), ...library.baselineSkills]);

  let score = 20;
  const matched = [];
  for (const skill of required) {
    const normalizedSkill = normalizeText(skill);
    const found = profileTokens.some((token) => token.includes(normalizedSkill) || normalizedSkill.includes(token));
    if (found) {
      score += 8;
      matched.push(skill);
    }
  }

  if (targetRole && normalizeText(targetRole) === normalizeText(career.role)) {
    score += 18;
  }

  const missingSkills = required.filter((skill) => !matched.includes(skill)).slice(0, 8);
  const fitScore = Math.min(98, score);

  const rationale = matched.length
    ? `Strong overlap on ${matched.slice(0, 3).join(', ')}.`
    : 'Good long-term potential with focused training.';

  return {
    id: career.id,
    role: career.role,
    crew: career.crew,
    fitScore,
    rationale,
    matchedSkills: matched,
    missingSkills,
    quickWins: library.quickWins,
    resources: library.resources,
  };
};

const buildMilestones = (primaryRole, missingSkills, quickWins, resources) => {
  const topMissing = missingSkills.slice(0, 4);
  return [
    {
      timeline: 'Weeks 1-4',
      focus: `Foundation sprint for ${primaryRole}`,
      actionItems: [
        `Focus on core skills: ${topMissing.slice(0, 2).join(', ') || 'fundamentals'}`,
        quickWins[0] || 'Complete one guided hands-on project',
        'Track daily learning for 45-60 minutes',
      ],
    },
    {
      timeline: 'Weeks 5-8',
      focus: 'Portfolio and proof of work',
      actionItems: [
        `Practice remaining gaps: ${topMissing.slice(2).join(', ') || 'advanced topics'}`,
        quickWins[1] || 'Publish one project case study',
        'Request peer feedback and iterate twice',
      ],
    },
    {
      timeline: 'Weeks 9-12',
      focus: 'Interview and opportunity readiness',
      actionItems: [
        quickWins[2] || 'Prepare one capstone project demo',
        `Use resources: ${(resources || []).slice(0, 2).join(', ') || 'official documentation'}`,
        'Apply to 5-10 aligned roles or internships each week',
      ],
    },
  ];
};

const HAKI_DIMENSIONS = {
  'Observation Haki': {
    explanation: 'How well you read opportunities, understand patterns, and identify what to improve next.',
    keywords: [
      'analysis',
      'analytics',
      'attention',
      'communication',
      'critical thinking',
      'customer',
      'data',
      'debugging',
      'design',
      'problem solving',
      'research',
      'sql',
      'strategy',
      'testing',
      'ux',
      'writing',
    ],
  },
  'Armament Haki': {
    explanation: 'How strong your execution layer is when you need to build, ship, and prove your work.',
    keywords: [
      'api',
      'automation',
      'c++',
      'cloud',
      'css',
      'figma',
      'git',
      'html',
      'javascript',
      'node',
      'node.js',
      'python',
      'react',
      'system design',
      'tableau',
      'wireframing',
    ],
  },
  "Conqueror's Haki": {
    explanation: 'How clearly you lead your own direction with goals, consistency, confidence, and visible output.',
    keywords: [
      'ambition',
      'branding',
      'growth',
      'internship',
      'interview',
      'leadership',
      'management',
      'market research',
      'metrics',
      'planning',
      'portfolio',
      'presentation',
      'product',
      'roadmap',
      'stakeholder communication',
      'vision',
    ],
  },
};

const HAKI_LEVELS = [
  { min: 0, max: 34, level: 'Rookie', rewardTitle: 'Training Scroll Unlocked', rewardMessage: 'You are early in the journey. Your reward is a focused starter plan that removes confusion and gives you a clean first target.' },
  { min: 35, max: 49, level: 'Deck Cadet', rewardTitle: 'Consistency Badge', rewardMessage: 'You have the basics in place. Your reward is a structured weekly routine to turn scattered effort into visible progress.' },
  { min: 50, max: 64, level: 'Rising Pirate', rewardTitle: 'Momentum Chest', rewardMessage: 'Your direction is becoming clearer. Your reward is a stronger mission set designed to convert effort into portfolio evidence.' },
  { min: 65, max: 79, level: 'Elite Pirate', rewardTitle: 'Advanced Haki Crest', rewardMessage: 'You are building real strength. Your reward is a higher-value challenge set to accelerate role readiness.' },
  { min: 80, max: 100, level: 'Emperor Candidate', rewardTitle: 'Captain Merit Reward', rewardMessage: 'You have a strong base. Your reward is a leadership-level progression plan focused on opportunities, interviews, and standout proof of work.' },
];

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const countKeywordMatches = (tokens, keywords) =>
  keywords.reduce((count, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    const found = tokens.some((token) => token.includes(normalizedKeyword) || normalizedKeyword.includes(token));
    return found ? count + 1 : count;
  }, 0);

const getHakiLevelMeta = (score) =>
  HAKI_LEVELS.find((item) => score >= item.min && score <= item.max) || HAKI_LEVELS[0];

const buildHakiProgress = (input, profileTokens, primary, missingSkills, riskFlags) => {
  const currentSkillCount = input.currentSkills.length;
  const targetClarityBonus = input.targetRole ? 8 : 0;
  const goalBonus = input.goal ? 6 : 0;
  const weaknessPenalty = missingSkills.length >= 5 ? 8 : missingSkills.length >= 3 ? 4 : 0;

  const hakiTypes = Object.entries(HAKI_DIMENSIONS).map(([name, config]) => {
    const keywordMatches = countKeywordMatches(profileTokens, config.keywords);
    const fitBonus = Math.round(primary.fitScore * 0.12);
    const skillBonus = Math.min(18, currentSkillCount * 3);

    const score = clampScore(24 + keywordMatches * 11 + fitBonus + skillBonus + targetClarityBonus + goalBonus - weaknessPenalty);
    const status = score >= 75 ? 'Strong' : score >= 55 ? 'Growing' : 'Needs training';

    const trainingSteps = missingSkills.slice(0, 3).map((skill, index) => {
      if (name === 'Observation Haki') {
        return index === 0
          ? `Study ${skill} through one guided resource and write down what you learn.`
          : `Practice ${skill} in a small exercise, then review what went wrong.`;
      }

      if (name === 'Armament Haki') {
        return index === 0
          ? `Build one small output that proves your ${skill} ability.`
          : `Repeat ${skill} in a project task until it feels routine.`;
      }

      return index === 0
        ? `Connect ${skill} to your target role and define one measurable result for this week.`
        : `Turn ${skill} into visible proof by adding it to a project, case study, or portfolio entry.`;
    });

    return {
      name,
      score,
      status,
      explanation: config.explanation,
      trainingSteps: trainingSteps.length > 0 ? trainingSteps : ['Keep following the roadmap and add one visible proof-of-work item this week.'],
    };
  });

  const overallScore = clampScore(hakiTypes.reduce((total, type) => total + type.score, 0) / hakiTypes.length);
  const levelMeta = getHakiLevelMeta(overallScore);
  const performanceBand = overallScore < 45 ? 'low' : overallScore < 70 ? 'medium' : 'high';
  const xp = overallScore * 12;
  const nextLevelTarget = Math.min(100, levelMeta.max + 1);
  const nextLevelXp = nextLevelTarget * 12;

  const missions = [
    `Complete ${primary.quickWins[0] || 'one guided project'} this week.`,
    `Close one priority gap: ${missingSkills[0] || 'core fundamentals'}.`,
    input.targetRole
      ? `Write one short note on how this week moved you toward ${input.targetRole}.`
      : 'Write one short note on how this week improved your career direction.',
  ];

  const boosterPlan =
    performanceBand === 'low'
      ? {
          title: 'Recovery Training Arc',
          reason: `Your current profile is missing several core skills for ${primary.role}. The priority is stability before speed.`,
          actions: [
            `Spend 5 focused sessions on ${missingSkills[0] || 'your weakest foundational skill'}.`,
            primary.quickWins[0] || 'Finish one simple project that proves your basics.',
            'Use a daily check-in: what I learned, what I built, what I will repeat tomorrow.',
            'Ask for feedback once per week and fix one issue immediately.',
          ],
        }
      : performanceBand === 'medium'
        ? {
            title: 'Momentum Boost Arc',
            reason: 'You have a workable base. The next jump comes from consistency and visible output.',
            actions: [
              primary.quickWins[0] || 'Finish one high-signal project task.',
              `Strengthen ${missingSkills[0] || 'one missing skill'} with deliberate practice.`,
              'Convert your weekly work into one portfolio bullet or public proof.',
            ],
          }
        : {
            title: 'Advance Mission Arc',
            reason: 'Your base is strong enough to aim at higher-value execution and opportunity capture.',
            actions: [
              primary.quickWins[1] || 'Ship an advanced case study or proof of work.',
              'Practice interview, presentation, or stakeholder communication once this week.',
              'Apply your strongest skill in a harder project or real-world challenge.',
            ],
          };

  return {
    overallScore,
    level: levelMeta.level,
    progressLabel:
      performanceBand === 'low'
        ? 'Low performance detected. Boost mode is active.'
        : performanceBand === 'medium'
          ? 'Stable growth detected. Keep stacking visible work.'
          : 'High momentum detected. Push into stronger opportunities.',
    xp,
    nextLevelXp,
    rewardTitle: levelMeta.rewardTitle,
    rewardMessage: levelMeta.rewardMessage,
    performanceBand,
    activeMissions: missions,
    hakiTypes,
    boosterPlan,
  };
};

const validateCareerGuidancePayload = (payload) => {
  const errors = [];

  const currentSkills = splitListInput(payload.currentSkills);
  const interests = splitListInput(payload.interests);

  if (currentSkills.length === 0) {
    errors.push('currentSkills must include at least one skill.');
  }

  if (currentSkills.length > 40) {
    errors.push('currentSkills can include at most 40 entries.');
  }

  if (interests.length > 40) {
    errors.push('interests can include at most 40 entries.');
  }

  if (payload.goal && String(payload.goal).length > 300) {
    errors.push('goal can include at most 300 characters.');
  }

  if (payload.targetRole && String(payload.targetRole).length > 120) {
    errors.push('targetRole can include at most 120 characters.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized: {
      name: String(payload.name || '').trim() || 'Future Pirate',
      currentSkills,
      interests,
      goal: String(payload.goal || '').trim(),
      targetRole: String(payload.targetRole || '').trim(),
    },
  };
};

const generateCareerGuidance = (input, careers) => {
  const profileTokens = dedupe(
    [...input.currentSkills, ...input.interests, input.goal, input.targetRole]
      .flatMap((item) => splitListInput(item))
      .map((item) => normalizeText(item))
      .filter(Boolean),
  );

  const rankedRoles = careers
    .map((career) => scoreRoleFit(career, profileTokens, input.targetRole))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3);

  const primary = rankedRoles[0];
  const strengths = primary.matchedSkills.slice(0, 5);
  const missingSkills = primary.missingSkills.slice(0, 6);
  const milestones = buildMilestones(primary.role, missingSkills, primary.quickWins, primary.resources);

  const riskFlags = [];
  if (input.currentSkills.length < 3) {
    riskFlags.push('Skill input is narrow; add more concrete skills for sharper guidance.');
  }
  if (!input.goal) {
    riskFlags.push('Goal is not defined; set a 3-6 month target for better direction.');
  }

  const hakiProgressAgent = buildHakiProgress(input, profileTokens, primary, missingSkills, riskFlags);

  return {
    timestamp: new Date().toISOString(),
    profileAgent: {
      summary: input.targetRole
        ? `${input.name}, your target role is ${input.targetRole}. Based on your current profile, the closest match right now is ${primary.role}. Focus on closing the skill gaps below so you can move steadily toward the career you want to become.`
        : `${input.name}, your current strength profile maps best to ${primary.role}. Keep building practical projects weekly to convert skill growth into opportunities.`,
      strengths,
      riskFlags,
    },
    opportunityAgent: {
      targetRole: primary.role,
      rankedRoles: rankedRoles.map((item) => ({
        id: item.id,
        role: item.role,
        crew: item.crew,
        fitScore: item.fitScore,
        rationale: item.rationale,
      })),
    },
    gapAgent: {
      primaryRole: primary.role,
      missingSkills,
      quickWins: primary.quickWins.slice(0, 3),
    },
    hakiProgressAgent,
    roadmapAgent: {
      horizon: '12-week growth sprint',
      milestones,
      learningResources: primary.resources.slice(0, 3),
    },
    coachAgent: {
      weeklyPlan: [
        'Mon-Fri: 60 minutes skill practice',
        'Sat: 2-3 hours project execution',
        'Sun: portfolio update + next-week planning',
      ],
      motivation: 'Small daily consistency beats occasional intensity. Keep shipping visible work.',
    },
  };
};

module.exports = {
  validateCareerGuidancePayload,
  generateCareerGuidance,
};
