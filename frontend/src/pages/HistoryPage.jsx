import React, { useEffect, useState } from 'react';
import { healthService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    HeartPulse,
    LayoutDashboard,
    History as HistoryIcon,
    BarChart3,
    UserCircle,
    LogOut,
    Menu,
    X,
    Calendar,
    ChevronRight,
    BrainCircuit
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import FuzzyVisualizer from '../components/FuzzyVisualizer';

const HistoryPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await healthService.getHistory();
            setHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Prediction History', icon: HistoryIcon, path: '/history' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ name: 'Admin Analytics', icon: BarChart3, path: '/admin' });
    }

    const getRiskColor = (level) => {
        switch (level) {
            case 'LOW': return 'text-green-600 bg-green-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            case 'HIGH': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Reusing same sidebar logic for consistency */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white transition-all duration-300 ease-in-out flex flex-col`}>
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
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-medium text-white truncate w-32">{user?.name}</span>
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
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Prediction History</h1>
                </header>

                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                                <HistoryIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No predictions yet</h3>
                                <p className="mt-1 text-gray-500">Go to the dashboard to run your first health risk assessment.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-bold"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sleep</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exercise</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Calendar size={16} className="mr-2 text-gray-400" />
                                                        {new Date(record.timestamp).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.bmi}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.heart_rate} bpm</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.sleep_hours} hrs</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.exercise_level} hrs/wk</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(record.risk_level)}`}>
                                                        {record.risk_level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {record.risk_score}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => setSelectedRecord(record)}
                                                        className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-100"
                                                    >
                                                        <BrainCircuit size={16} className="mr-1.5" />
                                                        Visualize
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {selectedRecord && (
                <FuzzyVisualizer
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </div>
    );
};

export default HistoryPage;
