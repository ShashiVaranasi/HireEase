import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HRDashboard from './components/HRDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import InterviewerDashboard from './components/InterviewerDashboard';
import { AuthProvider, useAuth } from './utils/auth';
import './styles.css';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role))
    return <div className="access-denied">Access denied</div>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/hr"
            element={
              <PrivateRoute roles={['hr']}>
                <HRDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/candidate"
            element={
              <PrivateRoute roles={['candidate']}>
                <CandidateDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/interviewer"
            element={
              <PrivateRoute roles={['interviewer']}>
                <InterviewerDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
