import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import { CheckCircle2, ListTodo, AlertCircle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { tasks, stats, recommended, updateTask } = useTasks();
  const navigate = useNavigate();

  // Get top 4 recent pending tasks for quick view
  const recentPending = tasks
    .filter(t => t.status !== 'Done')
    .slice(0, 4);

  return (
    <div className="fade-in-up">
      {/* Greeting */}
      <div className="dashboard-greeting">
        <h1>Welcome back, <span>Flowqit User</span></h1>
        <p>Here's what's happening with your tasks today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-32" style={{ marginBottom: 32 }}>
        <StatCard
          icon={<ListTodo size={22} />}
          iconBg="var(--todo-bg)"
          iconColor="var(--todo-clr)"
          value={stats.total}
          label="Total Tasks"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          iconBg="var(--done-bg)"
          iconColor="var(--done-clr)"
          value={stats.completed}
          label="Completed"
          trend="up"
          trendLabel={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% done`}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          iconBg="var(--progress-bg)"
          iconColor="var(--progress-clr)"
          value={stats.pending}
          label="Pending"
        />
        <StatCard
          icon={<AlertCircle size={22} />}
          iconBg="var(--high-bg)"
          iconColor="var(--high)"
          value={stats.overdue}
          label="Overdue"
          accent={stats.overdue > 0 ? 'rgba(239,68,68,0.4)' : undefined}
          trend={stats.overdue > 0 ? 'down' : 'neutral'}
          trendLabel={stats.overdue > 0 ? 'Needs attention' : 'All good'}
        />
      </div>

      <div className="grid-2">
        {/* Recommended Task Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles size={18} color="var(--accent-light)" />
              AI Recommendation
            </h2>
          </div>
          
          {recommended ? (
            <div className="recommend-card fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="recommend-label">
                <Sparkles size={14} /> Suggested Focus
              </div>
              <h3 className="recommend-title">{recommended.title}</h3>
              <p className="recommend-desc">
                {recommended.aiAnalysis?.suggestion ? (
                  <>
                    <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>AI Insight:</span> {recommended.aiAnalysis.suggestion}
                  </>
                ) : (
                  recommended.description || 'No description provided.'
                )}
              </p>
              
              <div className="recommend-meta">
                 <span className={`badge ${recommended.aiAnalysis?.priority === 'High' ? 'badge-high' : recommended.aiAnalysis?.priority === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                    {recommended.aiAnalysis?.priority || recommended.priority} Priority
                 </span>
                 {recommended.aiAnalysis?.estimatedTime && (
                   <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                     ⏱ {recommended.aiAnalysis.estimatedTime}
                   </span>
                 )}
              </div>
              
              <button 
                className="btn btn-primary mt-24"
                onClick={() => navigate('/tasks')}
              >
                Go to Task <ArrowRight size={16} />
              </button>
            </div>
          ) : (
             <div className="card empty-state fade-in-up" style={{ animationDelay: '0.1s' }}>
               <CheckCircle2 size={40} color="var(--low)" />
               <h3>You're all caught up!</h3>
               <p>No pending tasks found. Enjoy your free time or add a new task.</p>
             </div>
          )}
        </div>

        {/* Recent Tasks Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/tasks')} style={{ padding: '6px 12px', fontSize: 12 }}>
              View All
            </button>
          </div>
          
          <div className="tasks-list">
            {recentPending.length > 0 ? (
              recentPending.map((task, i) => (
                <div key={task.id} style={{ animationDelay: `${0.15 + (i * 0.05)}s` }} className="fade-in-up">
                  <TaskCard 
                    task={task} 
                    compact 
                    onToggleStatus={(id, status) => {
                      const t = tasks.find(x => x.id === id);
                      if (t) updateTask({ ...t, status: status === 'Done' ? 'Todo' : 'Done' });
                    }}
                  />
                </div>
              ))
            ) : (
               <div className="card empty-state fade-in-up" style={{ animationDelay: '0.15s' }}>
                 <ListTodo size={40} />
                 <h3>No recent tasks</h3>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
