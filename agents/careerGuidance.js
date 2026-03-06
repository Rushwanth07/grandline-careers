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

  return {
    timestamp: new Date().toISOString(),
    profileAgent: {
      summary: `${input.name}, your current strength profile maps best to ${primary.role}. Keep building practical projects weekly to convert skill growth into opportunities.`,
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
