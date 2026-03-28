"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { TrendingUp, Calendar, Zap, Plus, RefreshCw, Layers, Edit, X, LogOut, User as UserIcon } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Set up interceptor for auth headers
axios.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('runrate_token') : null;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function Dashboard() {
    const [goal, setGoal] = useState<any>(null);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Forms state
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);

    const [title, setTitle] = useState('DSA Grind');
    const [totalQuestions, setTotalQuestions] = useState(450);
    const [totalDays, setTotalDays] = useState(70);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [questionsSolved, setQuestionsSolved] = useState(0);
    const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Auth state
    const [token, setToken] = useState<string | null>(null);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    useEffect(() => {
        // Hydrate token on mount
        const storedToken = localStorage.getItem('runrate_token');
        const storedUser = localStorage.getItem('runrate_user');
        if (storedToken) {
            setToken(storedToken);
            setCurrentUser(storedUser);
            fetchGoals();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/goals`);
            if (res.data.length > 0) {
                const latestGoal = res.data[0];
                fetchGoalDetails(latestGoal._id);
            } else {
                setLoading(false);
                setShowGoalForm(true);
            }
        } catch (error: any) {
            console.error(error);
            setLoading(false);
            if (error.response?.status === 401) handleLogout();
        }
    };

    const fetchGoalDetails = async (id: string) => {
        try {
            const [goalRes, heatmapRes] = await Promise.all([
                axios.get(`${API_URL}/goals/${id}`),
                axios.get(`${API_URL}/progress/goals/${id}/heatmap`)
            ]);
            setGoal(goalRes.data);
            setHeatmapData(heatmapRes.data);
            setShowGoalForm(false);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/goals`, {
                title,
                totalQuestions,
                totalDays,
                startDate
            });
            fetchGoalDetails(res.data._id);
        } catch (error) {
            console.error("Error creating goal", error);
            setLoading(false);
        }
    };

    const handleUpdateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal) return;
        try {
            setLoading(true);
            await axios.put(`${API_URL}/goals/${goal._id}`, {
                title,
                totalQuestions,
                totalDays,
                startDate
            });
            setIsEditingGoal(false);
            fetchGoalDetails(goal._id);
        } catch (error) {
            console.error("Error updating goal", error);
            setLoading(false);
        }
    };

    const handleAddProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal) return;
        try {
            setLoading(true);
            await axios.post(`${API_URL}/progress/goals/${goal._id}`, {
                date: logDate,
                questionsSolved: Number(questionsSolved)
            });
            setQuestionsSolved(0);
            setLogDate(format(new Date(), 'yyyy-MM-dd'));
            setShowLogModal(false);
            fetchGoalDetails(goal._id);
        } catch (error) {
            console.error("Error adding progress", error);
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        try {
            setLoading(true);
            const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
            const res = await axios.post(`${API_URL}${endpoint}`, {
                username: authUsername,
                password: authPassword
            });

            const { token, username } = res.data;
            localStorage.setItem('runrate_token', token);
            localStorage.setItem('runrate_user', username);

            setToken(token);
            setCurrentUser(username);
            setAuthUsername('');
            setAuthPassword('');

            fetchGoals(); // load goals for user
        } catch (error: any) {
            console.error(error);
            setLoading(false);
            setAuthError(error.response?.data?.message || 'Authentication failed. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('runrate_token');
        localStorage.removeItem('runrate_user');
        setToken(null);
        setCurrentUser(null);
        setGoal(null);
        setHeatmapData([]);
        setShowGoalForm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin text-brand-400">
                    <RefreshCw size={40} />
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center font-sans">
                <div className="w-full max-w-sm p-8 rounded-3xl glass-panel relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400 rounded-full blur-[90px] opacity-20 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-500/20 overflow-hidden">
                            <img src="/Favicon1.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">RunRate</h2>
                        <p className="text-neutral-400 text-sm">Join the match. Track your grind.</p>
                    </div>

                    {authError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-neutral-400 uppercase tracking-wider">Username</label>
                            <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required
                                className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                                placeholder="e.g. abhishek123" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 text-neutral-400 uppercase tracking-wider">Password</label>
                            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required
                                className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                                placeholder="••••••••" />
                        </div>

                        <button type="submit"
                            className="w-full bg-brand-500 hover:bg-brand-400 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(30,185,101,0.3)] mt-2">
                            {authMode === 'login' ? 'Enter Pitch' : 'Create Squad'}
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                            className="text-sm font-medium text-neutral-500 hover:text-brand-400 transition-colors">
                            {authMode === 'login' ? "Don't have an account? Sign up" : "Already playing? Log in"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showGoalForm || !goal || isEditingGoal) {
        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400 rounded-full blur-[90px] opacity-20 pointer-events-none"></div>

                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <img src="/Favicon1.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover" /> {isEditingGoal ? 'Edit Your Goal' : 'Set Your Target'}
                    </h2>
                    <p className="text-neutral-400 mb-8">{isEditingGoal ? 'Adjust your target runs and overs.' : 'Start your run chase. Create a roadmap.'}</p>

                    <form onSubmit={isEditingGoal ? handleUpdateGoal : handleCreateGoal} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-300">Goal Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-neutral-300">Target Runs</label>
                                <input type="number" value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} required
                                    className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-neutral-300">Total Overs (Days)</label>
                                <input type="number" value={totalDays} onChange={(e) => setTotalDays(Number(e.target.value))} required
                                    className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-300">Match Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                                className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-all text-neutral-200" style={{ colorScheme: 'dark' }} />
                        </div>
                        <div className="flex gap-4">
                            {isEditingGoal && (
                                <button type="button" onClick={() => setIsEditingGoal(false)}
                                    className="w-1/3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3.5 rounded-xl transition-all">
                                    Cancel
                                </button>
                            )}
                            <button type="submit"
                                className={`${isEditingGoal ? 'w-2/3' : 'w-full'} bg-brand-500 hover:bg-brand-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(30,185,101,0.3)] hover:shadow-[0_0_30px_rgba(63,213,131,0.5)] transform hover:-translate-y-1`}>
                                {isEditingGoal ? 'Save Changes' : 'Start Chase 🏏'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    const { stats } = goal;

    return (
        <div className="h-screen flex flex-col bg-[#050505] text-neutral-100 p-4 md:p-6 font-sans selection:bg-brand-500 selection:text-black overflow-hidden relative">

            {/* Log Score Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-sm p-6 rounded-3xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors bg-black/40 p-1.5 rounded-full">
                            <X size={16} />
                        </button>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="text-brand-400" size={24} /> Log Today
                        </h3>
                        <form onSubmit={handleAddProgress} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-2 text-neutral-400 uppercase tracking-wide text-center">Date</label>
                                    <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required max={format(new Date(), 'yyyy-MM-dd')}
                                        className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-500 font-bold text-sm text-center transition-all shadow-inner text-neutral-200" style={{ colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-2 text-neutral-400 uppercase tracking-wide text-center">Score</label>
                                    <input type="number" value={questionsSolved} onChange={(e) => setQuestionsSolved(Number(e.target.value))} min="0" required autoFocus
                                        className="w-full bg-black/50 border border-neutral-700 rounded-xl px-5 py-4 focus:outline-none focus:border-brand-500 font-bold text-2xl text-center transition-all shadow-inner" />
                                </div>
                            </div>
                            <button type="submit"
                                className="w-full bg-brand-500 hover:bg-brand-400 text-black font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(30,185,101,0.4)]">
                                Save Innings
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="max-w-6xl w-full mx-auto mb-4 flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                        {goal.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                        <span className="flex items-center gap-1 bg-brand-500/10 text-brand-400 px-2.5 py-1 rounded-full border border-brand-500/20">
                            <img src="/Favicon1.jpg" alt="Icon" className="w-3 h-3 rounded-full object-cover" /> Target: {goal.totalQuestions}
                        </span>
                        <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-neutral-400">
                            <Calendar size={12} /> {stats.daysPassed} / {goal.totalDays} Days
                        </span>
                        {currentUser && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-neutral-500 ml-1">
                                <UserIcon size={12} /> {currentUser}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={handleLogout} className="text-red-500/70 hover:text-red-400 transition-colors bg-black border border-red-500/10 p-2 rounded-full flex items-center gap-1.5" title="Log Out">
                        <LogOut size={14} />
                    </button>
                    <button onClick={() => {
                        setTitle(goal.title);
                        setTotalQuestions(goal.totalQuestions);
                        setTotalDays(goal.totalDays);
                        setStartDate(format(new Date(goal.startDate), 'yyyy-MM-dd'));
                        setIsEditingGoal(true);
                    }} className="text-neutral-500 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 p-2 md:px-3 rounded-full flex items-center gap-1.5" title="Edit Goal">
                        <Edit size={14} /> <span className="hidden md:inline text-xs font-semibold">Settings</span>
                    </button>
                    <button onClick={() => setShowLogModal(true)}
                        className="bg-brand-500 hover:bg-brand-400 text-black px-3 md:px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all shadow-[0_0_15px_rgba(30,185,101,0.4)] flex items-center gap-1.5 transform hover:-translate-y-0.5">
                        <Plus size={16} /> Log Score
                    </button>
                </div>
            </div>

            <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col gap-4 min-h-0">

                {/* SECTION 1: Cricket Scoreboard Widget */}
                <div className="glass-panel px-5 md:px-6 py-4 md:py-5 rounded-3xl relative overflow-hidden flex-shrink-0 border border-white/5">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/10 blur-3xl rounded-full transition-all pointer-events-none"></div>

                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-5 flex items-center gap-2">
                        <Zap className="text-brand-400" size={20} fill="currentColor" /> Live Score
                    </h3>

                    <div className="grid grid-cols-3 flex-nowrap gap-2 md:gap-6 mb-4 md:mb-6">
                        {/* Score */}
                        <div className="bg-black/50 rounded-2xl p-3 md:p-4 border border-white/5 flex flex-col justify-center">
                            <p className="text-neutral-500 text-[10px] md:text-xs font-semibold mb-1 uppercase tracking-wider truncate">Score</p>
                            <div className="text-xl md:text-4xl font-black flex items-baseline">
                                {stats.totalSolved}<span className="text-neutral-600 text-sm md:text-2xl mx-1">/</span><span className="text-neutral-400 text-sm md:text-2xl">{goal.totalQuestions}</span>
                            </div>
                            <p className="text-[9px] md:text-[11px] text-brand-400/80 mt-1 font-medium">Balls played: {stats.daysPassed}</p>
                        </div>

                        {/* CRR */}
                        <div className="bg-black/50 rounded-2xl p-3 md:p-4 border border-white/5 flex flex-col justify-center">
                            <p className="text-neutral-500 text-[10px] md:text-xs font-semibold mb-1 uppercase tracking-wider truncate">Curr RR</p>
                            <p className="text-xl md:text-3xl font-bold text-white flex items-center gap-1 md:gap-2">
                                {stats.crr}
                                {Number(stats.crr) >= Number(stats.rrr) ?
                                    <TrendingUp size={16} className="text-brand-400 flex-shrink-0" /> :
                                    <TrendingUp size={16} className="text-red-400 rotate-180 flex-shrink-0" />}
                            </p>
                            <p className="text-[9px] md:text-[11px] text-brand-400/80 mt-1 font-medium">{stats.remainingQuestions} runs needed</p>
                        </div>

                        {/* RRR */}
                        <div className="bg-black/50 rounded-2xl p-3 md:p-4 border border-white/5 flex flex-col justify-center">
                            <p className="text-neutral-500 text-[10px] md:text-xs font-semibold mb-1 uppercase tracking-wider truncate">Req RR</p>
                            <p className="text-xl md:text-3xl font-bold text-white flex items-center gap-1 md:gap-2">
                                {stats.rrr}
                            </p>
                            <p className="text-[9px] md:text-[11px] text-brand-400/80 mt-1 font-medium">Balls left: {stats.remainingDays}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-[10px] md:text-xs font-medium text-neutral-400 mb-1.5 md:mb-2">
                            <span>Journey Progress</span>
                            <span>{Math.round((stats.totalSolved / goal.totalQuestions) * 100)}%</span>
                        </div>
                        <div className="h-1.5 md:h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_rgba(30,185,101,0.5)] transition-all duration-1000"
                                style={{ width: `${Math.min(100, (stats.totalSolved / goal.totalQuestions) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Heatmap Widget */}
                <div className="glass-panel p-5 md:p-6 rounded-3xl flex flex-col flex-1 min-h-0 border border-white/5">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className="text-md md:text-lg font-bold flex items-center gap-2">
                            <Layers className="text-brand-400" size={18} /> Consistency Map
                        </h3>
                    </div>

                    <div className="flex-grow flex justify-start bg-black/40 rounded-2xl p-4 md:p-6 border border-white/5 w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
                        <div className="h-full mx-auto flex-shrink-0 flex items-center min-w-min" style={{ height: '100%', minHeight: '120px' }}>
                            <CalendarHeatmap
                                startDate={subDays(new Date(goal.startDate), 1)}
                                endDate={addDays(new Date(goal.endDate), 1)}
                                values={heatmapData}
                                classForValue={(value: any) => {
                                    if (!value || value.count === 0) return 'color-empty';
                                    if (value.count < 3) return 'color-github-1';
                                    if (value.count < 5) return 'color-github-2';
                                    if (value.count < 8) return 'color-github-3';
                                    return 'color-github-4';
                                }}
                                tooltipDataAttrs={(value: any) => {
                                    if (!value || !value.date) return { 'data-tooltip': '' };
                                    return {
                                        'data-tooltip': `${value.count} questions on ${value.date}`,
                                    };
                                }}
                                showWeekdayLabels={true}
                            />
                        </div>
                    </div>

                    <div className="mt-3 md:mt-4 flex justify-end items-center gap-1 md:gap-2 text-[10px] md:text-xs text-neutral-500 font-medium flex-shrink-0">
                        <span>Less</span>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-[#1a1a1a]"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-brand-900"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-brand-700"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-brand-500"></div>
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm bg-brand-300"></div>
                        <span>More</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
