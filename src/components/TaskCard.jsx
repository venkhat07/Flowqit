import { Calendar, Clock, Trash2, Edit2, Sparkles, AlertTriangle, Flame, Target, ArrowDown, CheckCircle } from 'lucide-react';
import { isOverdue, isUrgent, getDaysLabel } from '../services/aiService';

const PRIORITY_CLASS = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
const STATUS_CLASS    = { 'Todo': 'badge-todo', 'In Progress': 'badge-progress', 'Done': 'badge-done' };
const PRIORITY_ICONS = {
  High: <Flame size={13} style={{ marginRight: 4 }} />,
  Medium: <Target size={13} style={{ marginRight: 4 }} />,
  Low: <ArrowDown size={13} style={{ marginRight: 4 }} />
};

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus, compact = false }) {
  const urgent  = isUrgent(task);
  const overdue = isOverdue(task.deadline);
  const dayLabel = task.deadline ? getDaysLabel(task.deadline) : null;
  const ai = task.aiAnalysis;

  const priorityLabel = ai?.priority ?? task.priority;
  const priorityClass = priorityLabel ? `${priorityLabel.toLowerCase()}-priority` : '';

  return (
    <div
      className={`task-card fade-in-up ${priorityClass}${urgent && task.status !== 'Done' ? ' urgent' : ''}${task.status === 'Done' ? ' done' : ''}`}
      id={`task-card-${task.id}`}
    >
      {/* Header */}
      <div className="task-card-header">
        {urgent && task.status !== 'Done' && (
          <AlertTriangle size={18} color="var(--high)" style={{ flexShrink: 0, marginTop: 2 }} />
        )}
        <span className="task-card-title">{task.title}</span>
        <div className="task-card-actions">
          {onToggleStatus && (
            <button 
              className="btn-icon" 
              onClick={() => onToggleStatus(task.id, task.status)} 
              title={task.status === 'Done' ? 'Mark as pending' : 'Mark as completed'}
              style={{ color: task.status === 'Done' ? 'var(--done-clr)' : 'var(--text-muted)' }}
            >
              <CheckCircle size={16} />
            </button>
          )}
          {onEdit && (
            <button className="btn-icon" onClick={() => onEdit(task)} title="Edit task" id={`edit-task-${task.id}`}>
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button className="btn-icon" onClick={() => onDelete(task.id)} title="Delete task"
              id={`delete-task-${task.id}`}
              style={{ color: 'var(--high)' }}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="task-card-badges">
        {ai ? (
          <span className={`badge ${PRIORITY_CLASS[priorityLabel] ?? 'badge-medium'}`}>
            {PRIORITY_ICONS[priorityLabel]}
            {priorityLabel}
          </span>
        ) : (
          <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', animation: 'pulse-glow 2s infinite' }}>
            <Sparkles size={12} style={{ marginRight: 4 }} /> Analyzing...
          </span>
        )}
        <span className={`badge ${STATUS_CLASS[task.status] ?? 'badge-todo'}`}>
          {task.status}
        </span>
      </div>

      {/* Description */}
      {!compact && task.description && (
        <p className="task-card-desc">
          {task.description.length > 120
            ? task.description.slice(0, 120) + '…'
            : task.description}
        </p>
      )}

      {/* Meta */}
      <div className="task-card-meta">
        {task.deadline && (
          <span className={`task-card-meta-item${overdue && task.status !== 'Done' ? ' overdue' : ''}`}>
            <Calendar size={14} />
            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {dayLabel && (
              <span style={{ marginLeft: 4, fontWeight: 600 }}>· {dayLabel}</span>
            )}
          </span>
        )}
        {ai?.estimatedTime && (
          <span className="task-card-meta-item">
            <Clock size={14} />
            {ai.estimatedTime}
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      {!compact && ai?.suggestion && task.status !== 'Done' && (
        <div className="task-card-ai">
          <Sparkles size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{ai.suggestion}</span>
        </div>
      )}
    </div>
  );
}
