import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_SETTINGS,
  SEED_CERTIFICATIONS,
  SEED_COURSES,
  SEED_INTERNSHIPS,
  SEED_JOBS,
  SEED_LINKEDIN_HEADLINE,
  SEED_LINKEDIN_PROFILE_SUMMARY,
  SEED_LINKEDIN_WORK_HISTORY,
  SPRING_BOOT_DIAGNOSTICS,
  UserProfile,
  UserSettings,
  WorkExperienceItem
} from './src/data/seedData.ts';
import {
  disconnectLinkedInProfile,
  filterJobsBySkill,
  importLinkedInProfileData,
  matchOfflineCareerAssistant
} from './src/utils/jobnovaLogic.ts';
import {
  evaluateMockSessionOffline,
  MockInterviewSession
} from './src/utils/mockInterviewLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory state mirroring H2 database initialized from data.sql
let jobsStore = [...SEED_JOBS];
let internshipsStore = [...SEED_INTERNSHIPS];
let coursesStore = [...SEED_COURSES];
let certificationsStore = [...SEED_CERTIFICATIONS];
let currentUser: UserProfile | null = { ...DEFAULT_USER_PROFILE };
let currentSettings: UserSettings = { ...DEFAULT_USER_SETTINGS };

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. JobController (/api/jobs, /api/jobs/search)
  app.get('/api/jobs', (_req, res) => {
    res.json(jobsStore);
  });

  app.get('/api/jobs/search', (req, res) => {
    const skill = typeof req.query.skill === 'string' ? req.query.skill : '';
    const location = typeof req.query.location === 'string' ? req.query.location : 'ALL';
    res.json(filterJobsBySkill(jobsStore, skill, location));
  });

  // 2. InternshipController (/api/internships)
  app.get('/api/internships', (_req, res) => {
    res.json(internshipsStore);
  });

  // 3. LearningController (/api/courses)
  app.get('/api/courses', (_req, res) => {
    res.json(coursesStore);
  });

  // 4. CertificationController (/api/certifications) — Fixed from self-injecting bug!
  app.get('/api/certifications', (_req, res) => {
    res.json(certificationsStore);
  });

  // 5. UserController (/user and /api/user/me)
  app.get(['/user', '/api/user/me'], (_req, res) => {
    if (!currentUser) {
      res.json({ authenticated: false });
      return;
    }
    res.json({
      authenticated: true,
      sub: currentUser.oauthId,
      login: currentUser.email.split('@')[0],
      ...currentUser,
      settings: currentSettings
    });
  });

  app.put('/api/user/me', (req, res) => {
    if (req.body.user) {
      currentUser = {
        ...(currentUser || DEFAULT_USER_PROFILE),
        ...req.body.user
      };
    }
    if (req.body.settings) {
      currentSettings = {
        ...currentSettings,
        ...req.body.settings
      };
    }
    res.json({
      authenticated: Boolean(currentUser),
      user: currentUser,
      settings: currentSettings
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const provider = req.body?.provider || 'Google';
    if (provider === 'GitHub') {
      currentUser = {
        ...DEFAULT_USER_PROFILE,
        provider: 'GitHub',
        oauthId: 'github-student-dev',
        name: req.body?.name || 'Harish Ragavendran (@harish-dev)',
        email: req.body?.email || 'harishragavendran56@gmail.com'
      };
    } else {
      currentUser = {
        ...DEFAULT_USER_PROFILE,
        provider: 'Google',
        oauthId: 'google-oauth2-student-101',
        name: req.body?.name || 'Harish Ragavendran',
        email: req.body?.email || 'harishragavendran56@gmail.com'
      };
    }
    res.json({ authenticated: true, user: currentUser });
  });

  app.post('/api/auth/logout', (_req, res) => {
    currentUser = null;
    res.json({ authenticated: false });
  });

  // LinkedIn OAuth 3P Integration Endpoints
  app.get('/api/auth/linkedin/url', (req, res) => {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    const callbackUrl = `${proto}://${host}/auth/linkedin/callback`;

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (clientId && clientId !== 'MY_LINKEDIN_CLIENT_ID' && clientId.trim() !== '') {
      const scope = encodeURIComponent('openid profile email');
      const state = `linkedin_state_${Date.now()}`;
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${scope}&state=${state}`;
      res.json({ authUrl, callbackUrl, provider: 'LinkedIn', configured: true });
    } else {
      // Self-contained simulated provider callback for instant local and cloud testing
      const simUrl = `/auth/linkedin/callback?code=mock_linkedin_auth_code_${Date.now()}`;
      res.json({ authUrl: simUrl, callbackUrl, provider: 'LinkedIn', configured: false });
    }
  });

  app.get(['/auth/linkedin/callback', '/auth/linkedin/callback/'], (req, res) => {
    const code = req.query.code || 'demo_linkedin_code';
    const payload = {
      type: 'LINKEDIN_AUTH_SUCCESS',
      provider: 'LinkedIn',
      code: String(code),
      profile: {
        headline: SEED_LINKEDIN_HEADLINE,
        summary: SEED_LINKEDIN_PROFILE_SUMMARY,
        workHistory: SEED_LINKEDIN_WORK_HISTORY,
        skills: ['docker', 'kubernetes', 'rest-api', 'agile', 'git'],
        linkedInProfileUrl: 'https://linkedin.com/in/harish-ragavendran'
      }
    };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>LinkedIn Authorization · JobNova</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
    .card { background: white; padding: 2rem 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 420px; }
    .badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #0A66C2; color: white; border-radius: 10px; margin-bottom: 1rem; font-weight: bold; font-size: 24px; }
    h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; }
    p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin: 0 0 1.25rem; }
    .spinner { display: inline-block; width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #0A66C2; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">in</div>
    <h2>Connecting LinkedIn to JobNova</h2>
    <p>Authorizing account and importing work experience, headline, and professional summary...</p>
    <div class="spinner"></div>
  </div>
  <script>
    (function() {
      const authData = ${JSON.stringify(payload)};
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(authData, '*');
          setTimeout(function() {
            window.close();
          }, 350);
          return;
        }
      } catch (e) {
        console.warn('postMessage to opener failed:', e);
      }
      // Fallback if not inside popup window
      setTimeout(function() {
        window.location.href = '/?linkedin_connected=true';
      }, 600);
    })();
  </script>
</body>
</html>`);
  });

  app.post('/api/auth/linkedin/import', (req, res) => {
    const importPayload = req.body || {};
    const headline = importPayload.headline || SEED_LINKEDIN_HEADLINE;
    const summary = importPayload.summary || SEED_LINKEDIN_PROFILE_SUMMARY;
    const workHistory = importPayload.workHistory || SEED_LINKEDIN_WORK_HISTORY;
    const skills = importPayload.skills || ['docker', 'kubernetes', 'rest-api'];
    const linkedInProfileUrl = importPayload.linkedInProfileUrl || 'https://linkedin.com/in/harish-ragavendran';

    const baseProfile = currentUser || DEFAULT_USER_PROFILE;
    currentUser = importLinkedInProfileData(baseProfile, {
      headline,
      summary,
      workHistory,
      skills,
      linkedInProfileUrl
    });

    res.json({
      authenticated: true,
      success: true,
      message: 'LinkedIn work history and professional summary imported successfully!',
      user: currentUser
    });
  });

  app.post('/api/auth/linkedin/disconnect', (req, res) => {
    if (currentUser) {
      const retainHistory = req.body?.retainWorkHistory !== false;
      currentUser = disconnectLinkedInProfile(currentUser, retainHistory);
    }
    res.json({
      authenticated: Boolean(currentUser),
      success: true,
      message: 'LinkedIn account disconnected.',
      user: currentUser
    });
  });

  // 6. GeminiController (/api/ai/ask)
  app.post('/api/ai/ask', async (req, res) => {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      res.status(400).json({ response: 'Please enter a career question to get started.' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction:
              'You are the JobNova Career Assistant for university students and freshers in India. Give practical, structured, concise advice (using 4-5 bullet points) on resumes, software engineering interviews, LinkedIn profiles, Java/Spring Boot, Python/AI, soft skills, internships, and certifications available on JobNova.'
          }
        });
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2200)
        );
        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const text = response?.text?.trim();
        if (text) {
          res.json({ response: text, source: 'gemini' });
          return;
        }
      } catch (err) {
        console.warn('Gemini API fallback to local Career Knowledge Base:', err instanceof Error ? err.message : err);
      }
    }

    const fallbackText = matchOfflineCareerAssistant(prompt);
    res.json({ response: fallbackText, source: 'knowledge-base' });
  });

  // 7. Spring Boot Project Diagnostics endpoint
  app.get('/api/diagnostics', (_req, res) => {
    res.json({
      projectName: 'JOBNOVA (Spring Boot 3.5.7)',
      fixedZipUrl: '/JOBNOVA-Fixed-SpringBoot.zip',
      diagnostics: SPRING_BOOT_DIAGNOSTICS
    });
  });

  // 8. Gemini Mock Interview Evaluator endpoint
  app.post('/api/mock-interview/evaluate', async (req, res) => {
    const session = req.body?.session as MockInterviewSession;
    if (!session || !Array.isArray(session.questions)) {
      res.status(400).json({ error: 'Valid mock interview session object required.' });
      return;
    }

    const ai = getGeminiClient();
    if (ai) {
      try {
        const interviewPrompt = `Role: ${session.jobTitle} at ${session.company}
Difficulty Level: ${session.proficiencyTier}
Tech Stack Requirements: ${session.roleSkills.join(', ')}

Here are the questions asked and the candidate's saved responses:
${session.questions
  .map(
    (q, i) =>
      `Question ${i + 1} (${q.category} · Focus: ${q.skillFocus}):\n"${q.question}"\nKey Concepts Expected: ${q.keyPoints.join(', ')}\nCandidate Response:\n"${session.answers[q.id] || '(No response provided)'}"\n`
  )
  .join('\n---\n')}

Provide an objective engineering evaluation. Return ONLY a valid JSON object matching this schema without any markdown wraps:
{
  "overallScore": <number between 0 and 100>,
  "verdict": "<Strong Hire | Hire | Borderline / Needs Review | Not Yet Ready>",
  "readinessSummary": "<concise paragraph analyzing the candidate's overall readiness for this role>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "keyAreasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "questionEvaluations": [
    {
      "questionId": "<matching question id>",
      "score": <number between 0 and 100>,
      "rating": "<Exceptional | Strong | Adequate | Needs Improvement>",
      "feedback": "<constructive feedback on candidate's answer>",
      "matchedConcepts": ["<concept covered>"],
      "missingConcepts": ["<concept missed>"],
      "suggestedImprovement": "<actionable advice to elevate answer>"
    }
  ]
}`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: interviewPrompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction:
              'You are a senior engineering hiring manager conducting technical interview assessments for software engineer candidates in India. Grade objectively, constructively, and concisely. Output valid JSON only.'
          }
        });

        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000)
        );
        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const text = response?.text?.trim();

        if (text) {
          const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          if (typeof parsed.overallScore === 'number' && Array.isArray(parsed.questionEvaluations)) {
            res.json({
              evaluation: {
                ...parsed,
                evaluatedAt: new Date().toISOString(),
                evaluatorSource: 'gemini'
              }
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini API mock interview evaluation fallback:', err instanceof Error ? err.message : err);
      }
    }

    // Seamless offline fallback
    const offlineEvaluation = evaluateMockSessionOffline(session);
    res.json({ evaluation: offlineEvaluation });
  });

  // Mount Vite in dev or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JobNova Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
