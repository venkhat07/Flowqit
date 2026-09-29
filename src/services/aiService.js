// ─── AI Service (client-side simulation, API-ready) ──────────────────────────
// Replace analyzeTask() body with a real fetch() call when backend is ready.

const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'asap', 'immediately', 'critical', 'deadline', 'important',
  'emergency', 'priority', 'must', 'required', 'due', 'today',
];

const LOW_PRIORITY_KEYWORDS = [
  'someday', 'eventually', 'low', 'minor', 'optional', 'whenever',
  'future', 'backlog', 'later', 'nice to have',
];

/**
 * Estimates how many days until the deadline.
 * Returns null if no deadline.
 */
function daysUntilDeadline(deadline) {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

/**
 * Derives priority from deadline proximity + keyword scanning.
 */
function derivePriority(task) {
  const text = `${task.title} ${task.description}`.toLowerCase();

  const hasHighKw = HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw));
  const hasLowKw = LOW_PRIORITY_KEYWORDS.some((kw) => text.includes(kw));

  const days = daysUntilDeadline(task.deadline);

  if (days !== null) {
    if (days < 0) return 'High';   // overdue
    if (days <= 2) return 'High';
    if (days <= 7) return hasLowKw ? 'Medium' : 'Medium';
    if (days > 14 && hasLowKw) return 'Low';
  }

  if (hasHighKw) return 'High';
  if (hasLowKw) return 'Low';
  return 'Medium';
}

/**
 * Estimates time to complete based on description length & priority.
 */
function estimateTime(task, priority) {
  const wordCount = (task.description || '').split(/\s+/).filter(Boolean).length;

  let base = 30; // minutes
  if (wordCount > 50) base = 90;
  else if (wordCount > 20) base = 60;
  else if (wordCount > 5) base = 45;

  if (priority === 'High') base = Math.max(base, 60);
  if (priority === 'Low') base = Math.min(base, 45);

  if (base >= 60) {
    const h = Math.floor(base / 60);
    const m = base % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${base}m`;
}

const SUGGESTIONS_HIGH = [
  'Start immediately — this task needs your full attention today.',
  'Block focused time now. Eliminate distractions for this one.',
  'This is your top priority. Do it before anything else.',
  'Consider breaking this into smaller steps to make progress faster.',
  'Tackle this first thing in the morning for peak focus.',
];

const SUGGESTIONS_MEDIUM = [
  'Schedule a dedicated time block for this in the next few days.',
  'Make steady progress — small daily steps add up quickly.',
  'Review the requirements and create a clear action plan.',
  'Pair this with a low-energy task for balance.',
  'Set a personal deadline 2 days before the official one.',
];

const SUGGESTIONS_LOW = [
  'Batch this with similar low-effort tasks for efficiency.',
  'Work on this during downtime or when energy is low.',
  'Great task to delegate or automate if possible.',
  'Schedule for end-of-week review.',
  'This can wait — focus on high-impact work first.',
];

function getSuggestion(task, priority) {
  const pool =
    priority === 'High' ? SUGGESTIONS_HIGH :
    priority === 'Low'  ? SUGGESTIONS_LOW  :
    SUGGESTIONS_MEDIUM;

  // Deterministic seed from task id for consistency
  const seed = (task.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
}

/**
 * Call Gemini API using a fetch request.
 */
async function callGeminiAPI(task, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are an AI task analysis assistant for a productivity app. 
Please analyze the following task:
Title: "${task.title}"
Description: "${task.description || 'No description'}"
Deadline: "${task.deadline || 'No deadline'}"

Return ONLY a valid JSON object strictly matching this schema, with no markdown formatting, no backticks, and no extra text:
{
  "priority": "High" | "Medium" | "Low",
  "estimatedTime": "e.g., 30m, 1h 15m, 2h",
  "suggestion": "A short, actionable suggestion on how to approach this task"
}

Be realistic with estimatedTime and suggestion based on the task complexity.
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Invalid response from Gemini API');
  }

  // Attempt to parse JSON cleanly, stripping potential markdown blocks
  const cleanJsonStr = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJsonStr);

  if (!parsed.priority || !parsed.estimatedTime || !parsed.suggestion) {
    throw new Error('Parsed Gemini output is missing required fields');
  }

  return {
    priority: parsed.priority,
    estimatedTime: parsed.estimatedTime,
    suggestion: parsed.suggestion
  };
}

/**
 * Main AI analysis function.
 * @param {Object} task - task object
 * @returns {{ priority: string, estimatedTime: string, suggestion: string }}
 */
export async function analyzeTask(task) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Try calling Gemini
      const result = await callGeminiAPI(task, apiKey);
      return result;
    } catch (err) {
      console.warn('Gemini API failed, falling back to local simulation:', err);
      // Fallback intentionally drops through to local simulation
    }
  }

  // Simulate network latency for local simulation
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  const priority = derivePriority(task);
  const estimatedTime = estimateTime(task, priority);
  const suggestion = getSuggestion(task, priority);

  return { priority, estimatedTime, suggestion };
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  return daysUntilDeadline(deadline) < 0;
}

export function isUrgent(task) {
  return (
    task.aiAnalysis?.priority === 'High' ||
    isOverdue(task.deadline)
  );
}

export function getDaysLabel(deadline) {
  const days = daysUntilDeadline(deadline);
  if (days === null) return null;
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d left`;
}
