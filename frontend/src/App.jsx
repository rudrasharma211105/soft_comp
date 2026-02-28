import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    console.log('ProtectedRoute state:', { user, loading });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading application...</span>
        </div>
    );

    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/history" element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
