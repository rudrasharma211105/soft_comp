import React, { useEffect, useState } from 'react';
import { adminService } from '../services/api';
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
    Users,
    Search,
    Activity,
    PieChart as PieChartIcon
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, usersRes] = await Promise.all([
                adminService.getAnalytics(),
                adminService.getAllUsers()
            ]);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
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
        { name: 'Admin Analytics', icon: BarChart3, path: '/admin' },
    ];

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    const getPieData = () => {
        if (!analytics?.risk_distribution) return [];
        return Object.entries(analytics.risk_distribution).map(([name, value]) => ({
            name,
            value
        }));
    };

    const getStats = [
        { label: 'Total Users', value: analytics?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Predictions', value: analytics?.total_predictions || 0, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Avg Risk Score', value: analytics?.average_risk_score || 0, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

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
                    <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard & Analytics</h1>
                </header>

                <main className="p-8 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {getStats.map((stat) => (
                                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                                        <div className={`p-4 rounded-lg ${stat.bg}`}>
                                            <stat.icon className={stat.color} size={28} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                        <PieChartIcon className="mr-2 text-blue-500" size={20} />
                                        Risk Distribution
                                    </h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={getPieData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {getPieData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                        <Users className="mr-2 text-blue-500" size={20} />
                                        Recent Users
                                    </h3>
                                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                        {users.slice(0, 10).map((u) => (
                                            <div key={u.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-gray-100 p-2 rounded-full">
                                                        <UserCircle size={20} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-tight ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
