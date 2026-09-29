import { createContext, useContext, useReducer, useEffect } from 'react';
import { analyzeTask } from '../services/aiService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STORAGE_KEY = 'flowqit_tasks';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ─── Default seed tasks ───────────────────────────────────────────────────────
function seedTasks() {
  const now = new Date();
  const d = (offset) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };
  return [
    {
      id: uuid(),
      title: 'Design new landing page mockup',
      description: 'Create wireframes and high-fidelity mockups for the redesigned marketing landing page. Focus on conversion and modern aesthetics.',
      deadline: d(2),
      priority: 'High',
      status: 'In Progress',
      aiAnalysis: {
        priority: 'High',
        estimatedTime: '3h',
        suggestion: 'Block focused time now. Eliminate distractions for this one.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Fix authentication bug in API',
      description: 'Users are being logged out unexpectedly. Investigate JWT token expiry logic and session management.',
      deadline: d(1),
      priority: 'High',
      status: 'Todo',
      aiAnalysis: {
        priority: 'High',
        estimatedTime: '2h',
        suggestion: 'Start immediately — this task needs your full attention today.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Write Q2 performance report',
      description: 'Compile metrics from all departments, summarize key achievements and areas for improvement for the quarterly review.',
      deadline: d(5),
      priority: 'Medium',
      status: 'Todo',
      aiAnalysis: {
        priority: 'Medium',
        estimatedTime: '1h 30m',
        suggestion: 'Schedule a dedicated time block for this in the next few days.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Update npm dependencies',
      description: 'Run npm audit and update outdated packages to their latest stable versions.',
      deadline: d(10),
      priority: 'Low',
      status: 'Todo',
      aiAnalysis: {
        priority: 'Low',
        estimatedTime: '45m',
        suggestion: 'Batch this with similar low-effort tasks for efficiency.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Onboarding call with new client',
      description: 'Welcome the new enterprise client, walk through the product features and answer questions.',
      deadline: d(3),
      priority: 'Medium',
      status: 'Todo',
      aiAnalysis: {
        priority: 'Medium',
        estimatedTime: '1h',
        suggestion: 'Review the requirements and create a clear action plan.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment to staging environment.',
      deadline: d(7),
      priority: 'Medium',
      status: 'Done',
      aiAnalysis: {
        priority: 'Medium',
        estimatedTime: '2h',
        suggestion: 'Make steady progress — small daily steps add up quickly.',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: uuid(),
      title: 'Explore AI integrations research',
      description: 'Research potential AI APIs and tools that could enhance our product roadmap for next year.',
      deadline: d(20),
      priority: 'Low',
      status: 'Todo',
      aiAnalysis: {
        priority: 'Low',
        estimatedTime: '45m',
        suggestion: 'Schedule for end-of-week review.',
      },
      createdAt: new Date().toISOString(),
    },
  ];
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTasks = [action.task, ...state];
      saveToStorage(newTasks);
      return newTasks;
    }
    case 'UPDATE_TASK': {
      const updated = state.map((t) =>
        t.id === action.task.id ? action.task : t
      );
      saveToStorage(updated);
      return updated;
    }
    case 'DELETE_TASK': {
      const filtered = state.filter((t) => t.id !== action.id);
      saveToStorage(filtered);
      return filtered;
    }
    case 'UPDATE_AI': {
      const updated = state.map((t) =>
        t.id === action.id ? { ...t, aiAnalysis: action.aiAnalysis } : t
      );
      saveToStorage(updated);
      return updated;
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(
    reducer,
    null,
    () => loadFromStorage() ?? seedTasks()
  );

  const addTask = (data) => {
    const task = {
      id: uuid(),
      ...data,
      aiAnalysis: null,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', task });

    // Auto-analyze after adding
    analyzeTask(task).then((aiAnalysis) => {
      dispatch({ type: 'UPDATE_AI', id: task.id, aiAnalysis });
    });

    return task;
  };

  const updateTask = (data) => {
    dispatch({ type: 'UPDATE_TASK', task: data });
    // Re-analyze when task is updated
    analyzeTask(data).then((aiAnalysis) => {
      dispatch({ type: 'UPDATE_AI', id: data.id, aiAnalysis });
    });
  };

  const deleteTask = (id) => dispatch({ type: 'DELETE_TASK', id });

  // Derived stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Done').length,
    pending: tasks.filter((t) => t.status !== 'Done').length,
    overdue: tasks.filter((t) => {
      if (!t.deadline || t.status === 'Done') return false;
      return new Date(t.deadline) < new Date().setHours(0, 0, 0, 0);
    }).length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
  };

  // Best recommended task (highest priority, not done, nearest deadline)
  const recommended = tasks
    .filter((t) => t.status !== 'Done')
    .sort((a, b) => {
      const pOrder = { High: 0, Medium: 1, Low: 2 };
      const pa = pOrder[a.aiAnalysis?.priority ?? a.priority] ?? 1;
      const pb = pOrder[b.aiAnalysis?.priority ?? b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      return 0;
    })[0] ?? null;

  return (
    <TaskContext.Provider value={{ tasks, stats, recommended, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider');
  return ctx;
}
