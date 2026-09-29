import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, ListFilter, AlertCircle, CheckCircle2, ListTodo } from 'lucide-react';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('Priority'); // Priority, Deadline
  
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => filterStatus === 'All' || t.status === filterStatus)
      .filter(t => {
        if (filterPriority === 'All') return true;
        const p = t.aiAnalysis?.priority ?? t.priority;
        return p === filterPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'Deadline') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        } else {
          // Priority sort
          const pOrder = { High: 0, Medium: 1, Low: 2 };
          const pa = pOrder[a.aiAnalysis?.priority ?? a.priority] ?? 1;
          const pb = pOrder[b.aiAnalysis?.priority ?? b.priority] ?? 1;
          if (pa !== pb) return pa - pb;
          // Tie break on deadline
          if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
          return 0;
        }
      });
  }, [tasks, filterStatus, filterPriority, sortBy]);

  const openNew = () => { setEditingTask(null); setIsModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const close = () => { setIsModalOpen(false); setEditingTask(null); };

  const handleSave = (taskData) => {
    if (editingTask) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }
    close();
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Manager</h1>
          <p className="page-subtitle">Organize, prioritize, and crush your goals.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew} id="add-task-btn">
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="filter-bar">
        <ListFilter size={16} color="var(--text-muted)" />
        
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Todo', 'In Progress', 'Done'].map(s => (
            <button
              key={s}
              className={`filter-chip ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

        <div style={{ display: 'flex', gap: 6 }}>
           {['All', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={`p-${p}`}
              className={`filter-chip ${filterPriority === p ? 'active' : ''}`}
              onClick={() => setFilterPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <select 
          className="filter-select" 
          style={{ marginLeft: 'auto' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Priority">Sort by Priority (AI)</option>
          <option value="Deadline">Sort by Deadline</option>
        </select>
      </div>

      <div className="tasks-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, i) => (
            <div key={task.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in-up">
              <TaskCard 
                task={task} 
                onEdit={openEdit} 
                onDelete={deleteTask} 
                onToggleStatus={(id, status) => {
                  const t = tasks.find(x => x.id === id);
                  if (t) updateTask({ ...t, status: status === 'Done' ? 'Todo' : 'Done' });
                }}
              />
            </div>
          ))
        ) : (
          <div className="card empty-state fade-in-up" style={{ marginTop: 20 }}>
            {filterStatus === 'Done' ? <CheckCircle2 size={48} /> : 
             filterPriority === 'High' ? <AlertCircle size={48} /> : 
             <ListTodo size={48} />}
            <h3>No tasks found</h3>
            <p>Adjust your filters or add a new task to get started.</p>
            <button className="btn btn-ghost mt-16" onClick={() => { setFilterStatus('All'); setFilterPriority('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal 
          task={editingTask} 
          onSave={handleSave} 
          onClose={close} 
        />
      )}
    </div>
  );
}
