import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import KanbanWorkflow from './components/KanbanWorkflow';
import AnalyticsView from './components/AnalyticsView';
import ScheduleView from './components/ScheduleView';
import MediaLibraryView from './components/MediaLibraryView';
import SettingsView from './components/SettingsView';
import ScriptEditorDashboard from './components/ScriptEditorDashboard';

// A simple PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        >
          {/* Default child route */}
          <Route index element={<Navigate to="scripts" replace />} />
          
          <Route path="scripts" element={<ScriptEditorDashboard />} />
          <Route path="kanban" element={<KanbanWorkflow />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="schedule" element={<ScheduleView />} />
          <Route path="media" element={<MediaLibraryView />} />
          <Route path="settings" element={<SettingsView />} />
          
          {/* Catch-all for inside dashboard */}
          <Route path="*" element={<Navigate to="scripts" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
