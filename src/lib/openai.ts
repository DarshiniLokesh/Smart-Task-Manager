import OpenAI from 'openai';
import { ITask, Priority, PrioritizedTaskRecommendation, AiBreakdownResponse, AiPrioritizeResponse } from '@/types/task';

const openAiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const openai = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

/**
 * Call Google Gemini 1.5 Flash API directly via HTTP fetch (Free Tier available at aistudio.google.com)
 */
async function callGeminiApi(prompt: string): Promise<string | null> {
  if (!geminiApiKey) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('Google Gemini API call error:', err);
    return null;
  }
}

/**
 * Smart rule-based breakdown generator when no AI API key is configured.
 */
function fallbackSubtaskBreakdown(title: string, description?: string): AiBreakdownResponse {
  const lower = (title + ' ' + (description || '')).toLowerCase();
  let subtasks: string[] = [];
  let suggestedTags: string[] = ['task'];
  let suggestedPriority: Priority = 'medium';

  if (lower.includes('website') || lower.includes('app') || lower.includes('launch') || lower.includes('build')) {
    subtasks = [
      'Define project requirements & wireframes',
      'Set up project repository and UI design tokens',
      'Develop core features & API integrations',
      'Perform responsive UI testing and bug fixes',
      'Deploy to production and announce launch',
    ];
    suggestedTags = ['engineering', 'launch', 'web'];
    suggestedPriority = 'high';
  } else if (lower.includes('auth') || lower.includes('login') || lower.includes('user')) {
    subtasks = [
      'Design user authentication database schema',
      'Implement JWT / OAuth API endpoints',
      'Create login & signup UI pages with validation',
      'Set up secure session token storage and middleware',
      'Write end-to-end authentication tests',
    ];
    suggestedTags = ['backend', 'security', 'auth'];
    suggestedPriority = 'urgent';
  } else if (lower.includes('market') || lower.includes('campaign') || lower.includes('blog')) {
    subtasks = [
      'Conduct target market research & keyword analysis',
      'Draft promotional content & social media graphics',
      'Configure email campaign sequence & tracking links',
      'Review campaign analytics and refine positioning',
    ];
    suggestedTags = ['marketing', 'growth'];
    suggestedPriority = 'medium';
  } else if (lower.includes('bug') || lower.includes('fix') || lower.includes('refactor')) {
    subtasks = [
      'Reproduce issue and inspect error trace logs',
      'Identify root cause in component state / API layer',
      'Implement code patch and write unit test case',
      'Verify fix in staging environment',
    ];
    suggestedTags = ['maintenance', 'bugfix'];
    suggestedPriority = 'high';
  } else {
    subtasks = [
      `Define clear milestone goals for ${title}`,
      `Gather required resources & documentation`,
      `Execute initial core task workflow`,
      `Review output and perform quality assurance`,
      `Finalize implementation and log documentation`,
    ];
    suggestedTags = ['general'];
    suggestedPriority = 'medium';
  }

  return { subtasks, suggestedTags, suggestedPriority };
}

export async function generateSubtasksBreakdown(
  title: string,
  description?: string
): Promise<AiBreakdownResponse> {
  const prompt = `You are an expert project manager AI assistant. Break down the following task into 4 to 6 concise, highly actionable subtasks.
Task Title: "${title}"
${description ? `Description: "${description}"` : ''}

Respond STRICTLY in JSON format matching this JSON schema:
{
  "subtasks": ["string"],
  "suggestedTags": ["string"],
  "suggestedPriority": "low" | "medium" | "high" | "urgent"
}`;

  // Strategy 1: Try OpenAI GPT-4o-mini
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You respond only in valid JSON format.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as AiBreakdownResponse;
        return {
          subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['ai-generated'],
          suggestedPriority: ['low', 'medium', 'high', 'urgent'].includes(parsed.suggestedPriority as string)
            ? parsed.suggestedPriority
            : 'medium',
        };
      }
    } catch (error) {
      console.warn('OpenAI API call failed, trying Gemini or fallback:', error);
    }
  }

  // Strategy 2: Try Google Gemini API
  if (geminiApiKey) {
    const geminiResult = await callGeminiApi(prompt);
    if (geminiResult) {
      try {
        const parsed = JSON.parse(geminiResult) as AiBreakdownResponse;
        return {
          subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
          suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['gemini-ai'],
          suggestedPriority: ['low', 'medium', 'high', 'urgent'].includes(parsed.suggestedPriority as string)
            ? parsed.suggestedPriority
            : 'medium',
        };
      } catch (err) {
        console.warn('Gemini JSON parse failed:', err);
      }
    }
  }

  // Strategy 3: Rule-based fallback engine
  return fallbackSubtaskBreakdown(title, description);
}

/**
 * Heuristic scoring algorithm when AI key is missing or fails.
 */
function scoreTasksHeuristically(tasks: ITask[]): AiPrioritizeResponse {
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  if (activeTasks.length === 0) {
    return {
      recommendations: [],
      summary: 'All tasks are completed! Great job.',
    };
  }

  const priorityWeight: Record<Priority, number> = {
    urgent: 40,
    high: 30,
    medium: 20,
    low: 10,
  };

  const now = new Date();

  const scored = activeTasks.map((task) => {
    let score = priorityWeight[task.priority] || 20;
    let reasonParts: string[] = [];

    // Due date urgency calculation
    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 0) {
        score += 50; // Overdue
        reasonParts.push(`Overdue by ${Math.abs(Math.round(diffHours / 24))} days!`);
      } else if (diffHours <= 24) {
        score += 35; // Due within 24h
        reasonParts.push('Due within 24 hours.');
      } else if (diffHours <= 72) {
        score += 20; // Due in 3 days
        reasonParts.push('Due within 3 days.');
      }
    }

    // Status boost: In Progress tasks get a boost to maintain momentum
    if (task.status === 'in_progress') {
      score += 15;
      reasonParts.push('Currently in progress (maintain momentum).');
    }

    // Subtask progress
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      const total = task.subtasks.length;
      const pct = (completedCount / total) * 100;
      if (pct > 0 && pct < 100) {
        score += 10;
        reasonParts.push(`${completedCount}/${total} subtasks done.`);
      }
    }

    if (reasonParts.length === 0) {
      reasonParts.push(`${task.priority.toUpperCase()} priority item ready for action.`);
    }

    return {
      taskId: task._id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      urgencyScore: score,
      reason: reasonParts.join(' '),
    };
  });

  // Sort descending by urgency score
  scored.sort((a, b) => b.urgencyScore - a.urgencyScore);

  const topRecommendations = scored.slice(0, 5);
  const urgentCount = scored.filter((s) => s.priority === 'urgent' || s.urgencyScore > 60).length;

  return {
    recommendations: topRecommendations,
    summary: `Analyzed ${activeTasks.length} active tasks. Identified ${urgentCount} high-priority/urgent focus areas for immediate action.`,
  };
}

export async function generateTaskPrioritization(tasks: ITask[]): Promise<AiPrioritizeResponse> {
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  if (activeTasks.length === 0) {
    return {
      recommendations: [],
      summary: 'No active tasks found to prioritize.',
    };
  }

  const taskSummaryList = activeTasks.map((t) => ({
    id: t._id,
    title: t.title,
    description: t.description || '',
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate || 'None',
    subtasksCompleted: `${t.subtasks?.filter((s) => s.completed).length || 0}/${t.subtasks?.length || 0}`,
  }));

  const prompt = `Analyze the following list of active tasks and select the top 5 most important tasks to focus on next.
Consider:
1. Urgency & Due Dates (overdue & upcoming tasks take top priority)
2. Priority levels (Urgent > High > Medium > Low)
3. Current status (In Progress items maintain momentum)

Tasks List:
${JSON.stringify(taskSummaryList, null, 2)}

Respond STRICTLY in JSON format matching this JSON schema:
{
  "summary": "Overall 1-2 sentence tactical recommendation summary",
  "recommendations": [
    {
      "taskId": "string",
      "title": "string",
      "priority": "low" | "medium" | "high" | "urgent",
      "status": "todo" | "in_progress" | "done",
      "dueDate": "string or undefined",
      "urgencyScore": number (1-100),
      "reason": "Single clear sentence explaining why this specific task should be prioritized next."
    }
  ]
}`;

  // Strategy 1: OpenAI
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You respond only in valid JSON format.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as AiPrioritizeResponse;
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('OpenAI API prioritize failed:', error);
    }
  }

  // Strategy 2: Google Gemini
  if (geminiApiKey) {
    const geminiResult = await callGeminiApi(prompt);
    if (geminiResult) {
      try {
        const parsed = JSON.parse(geminiResult) as AiPrioritizeResponse;
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed;
        }
      } catch (err) {
        console.warn('Gemini prioritize JSON parse error:', err);
      }
    }
  }

  // Strategy 3: Heuristic scoring
  return scoreTasksHeuristically(tasks);
}
