import { useState, useEffect } from 'react';
import { X, Sparkles, Loader } from 'lucide-react';
import { analyzeTask } from '../services/aiService';

const EMPTY = {
  title: '',
  description: '',
  deadline: '',
  priority: 'Medium',
  status: 'Todo',
};

const PRIORITY_CLASS = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

export default function TaskModal({ task, onSave, onClose }) {
  const isEdit = !!task;
  const [form, setForm] = useState(isEdit ? { ...task } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(isEdit ? task.aiAnalysis : null);

  // Sync if task prop changes
  useEffect(() => {
    if (task) { setForm({ ...task }); setAiResult(task.aiAnalysis); }
  }, [task]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.deadline && new Date(form.deadline) < new Date('2000-01-01')) e.deadline = 'Invalid date';
    return e;
  }

  async function handleAnalyze() {
    if (!form.title.trim()) {
      setErrors({ title: 'Please add a title before analyzing' });
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeTask({ ...form, id: task?.id ?? 'preview' });
      setAiResult(result);
      setForm((f) => ({ ...f, priority: result.priority }));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({ ...form, aiAnalysis: aiResult });
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={handleBackdrop} id="task-modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Task' : 'New Task'}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} id="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                className="form-input"
                placeholder="e.g. Design new dashboard mockup"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
              />
              {errors.title && (
                <span style={{ fontSize: 12, color: 'var(--high)' }}>{errors.title}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Describe what needs to be done…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            {/* Deadline + Status row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-deadline">Deadline</label>
                <input
                  id="task-deadline"
                  type="date"
                  className="form-input"
                  value={form.deadline}
                  onChange={(e) => set('deadline', e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
                {errors.deadline && (
                  <span style={{ fontSize: 12, color: 'var(--high)' }}>{errors.deadline}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            </div>

            {/* Priority row */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['High', 'Medium', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    id={`priority-${p.toLowerCase()}`}
                    className={`badge ${PRIORITY_CLASS[p]}`}
                    onClick={() => set('priority', p)}
                    style={{
                      cursor: 'pointer',
                      padding: '6px 16px',
                      fontSize: 13,
                      opacity: form.priority === p ? 1 : 0.4,
                      transform: form.priority === p ? 'scale(1.06)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      border: form.priority === p ? undefined : '1px solid transparent',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Analyze */}
            <button
              type="button"
              id="ai-analyze-btn"
              className="btn btn-ghost"
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{ alignSelf: 'flex-start' }}
            >
              {analyzing
                ? <><Loader size={15} className="spinner" /> Analyzing…</>
                : <><Sparkles size={15} /> Analyze with AI</>
              }
            </button>

            {/* AI Result */}
            {aiResult && (
              <div className="ai-result-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Sparkles size={14} color="var(--accent-light)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>AI Analysis</span>
                </div>
                <div className="ai-result-row">
                  <span className="ai-result-label">Priority</span>
                  <span className={`badge ${PRIORITY_CLASS[aiResult.priority]}`}>{aiResult.priority}</span>
                </div>
                <div className="ai-result-row">
                  <span className="ai-result-label">Estimated time</span>
                  <span className="ai-result-value">{aiResult.estimatedTime}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <span className="ai-suggestion-text">💡 {aiResult.suggestion}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="modal-save-btn">
              {isEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
