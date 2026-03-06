#!/usr/bin/env node

const baseArg = process.argv.find((arg) => arg.startsWith('--base='));
const baseUrl = (baseArg ? baseArg.split('=')[1] : process.env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const checks = [
  {
    name: 'health',
    path: '/api/health',
    method: 'GET',
    validate: async (response, body) => {
      if (!response.ok) throw new Error(`Expected 200, got ${response.status}`);
      if (body.status !== 'Running') throw new Error(`Unexpected health status: ${body.status}`);
    },
  },
  {
    name: 'careers',
    path: '/api/careers',
    method: 'GET',
    validate: async (response, body) => {
      if (!response.ok) throw new Error(`Expected 200, got ${response.status}`);
      if (!Array.isArray(body) || body.length === 0) throw new Error('Careers payload is empty or invalid');
    },
  },
  {
    name: 'search',
    path: '/api/search?q=engineer',
    method: 'GET',
    validate: async (response, body) => {
      if (!response.ok) throw new Error(`Expected 200, got ${response.status}`);
      if (!Array.isArray(body)) throw new Error('Search payload is not an array');
    },
  },
  {
    name: 'career guidance',
    path: '/api/agents/career-guidance',
    method: 'POST',
    body: {
      currentSkills: 'JavaScript, communication, problem solving',
      interests: 'technology, web',
      goal: 'Become job-ready in 3 months',
      targetRole: 'Shipwright Tech',
    },
    validate: async (response, body) => {
      if (!response.ok) throw new Error(`Expected 200, got ${response.status}`);
      if (!body.profileAgent || !body.roadmapAgent || !body.gapAgent) {
        throw new Error('Guidance payload missing required agent sections');
      }
    },
  },
  {
    name: 'profile unauthorized',
    path: '/api/profile',
    method: 'GET',
    validate: async (response) => {
      if (response.status !== 401) {
        throw new Error(`Expected 401 without token, got ${response.status}`);
      }
    },
  },
];

const run = async () => {
  console.log(`Running smoke checks against ${baseUrl}`);

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    const response = await fetch(url, {
      method: check.method,
      headers: check.body ? { 'Content-Type': 'application/json' } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
    });

    let body;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    await check.validate(response, body);
    console.log(`PASS ${check.name}`);
  }

  console.log('All smoke checks passed.');
};

run().catch((error) => {
  console.error(`FAIL ${error.message}`);
  process.exit(1);
});
