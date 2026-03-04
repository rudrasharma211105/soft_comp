import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    History,
    UserCircle,
    LogOut,
    Settings,
    BarChart3,
    HeartPulse,
    Menu,
    X
} from 'lucide-react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [prediction, setPrediction] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Prediction History', icon: History, path: '/history' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ name: 'Admin Analytics', icon: BarChart3, path: '/admin' });
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 md:relative ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'} bg-blue-900 text-white transition-all duration-300 ease-in-out flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center space-x-2">
                            <HeartPulse className="w-8 h-8 text-blue-400" />
                            <span className="font-bold text-lg">SmartHealth</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-blue-800 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-300 hover:bg-blue-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={24} />
                            {isSidebarOpen && <span>{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <div className="flex items-center space-x-3 p-3 text-blue-300">
                        <UserCircle size={24} />
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">{user?.name}</span>
                                <span className="text-xs capitalize">{user?.role}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors mt-2"
                    >
                        <LogOut size={24} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full md:w-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">
                            Welcome back, {user?.name}
                        </h1>
                    </div>
                </header>

                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Prediction Form</h2>
                                <PredictionForm onPredict={setPrediction} />
                            </section>

                            <section>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Prediction Results</h2>
                                {prediction ? (
                                    <PredictionResult result={prediction} />
                                ) : (
                                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <BarChart3 className="text-gray-300" size={32} />
                                        </div>
                                        <p className="text-gray-500">Enter your data and click predict to see your health risk analysis.</p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
