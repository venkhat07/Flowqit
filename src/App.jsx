import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

function App() {
  return (
    <TaskProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
          </main>
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App;
