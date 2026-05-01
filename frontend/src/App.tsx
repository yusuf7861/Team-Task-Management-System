import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';

const RoleBasedDashboard = () => {
  let user: any = {};
  try {
    const userStr = localStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : {};
  } catch (e) {}
  
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <MemberDashboard />;
};
import Projects from './pages/Projects';
import Kanban from './pages/Kanban';
import TaskDetails from './pages/TaskDetails';
import Team from './pages/Team';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<SidebarLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<RoleBasedDashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Kanban />} />
            <Route path="tasks/:id" element={<TaskDetails />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Route>

        {/* Legacy redirect */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
        <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
        <Route path="/team" element={<Navigate to="/app/team" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
