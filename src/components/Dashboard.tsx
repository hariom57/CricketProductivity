"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Target, TrendingUp, Calendar, Zap, Plus, RefreshCw, Layers } from 'lucide-react';
import { addDays, format, subDays } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [goal, setGoal] = useState<any>(null);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Forms state
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [title, setTitle] = useState('DSA Grind');
    const [totalQuestions, setTotalQuestions] = useState(450);
    const [totalDays, setTotalDays] = useState(70);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const [questionsSolved, setQuestionsSolved] = useState(0);
    const [topics, setTopics] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await axios.get(`${API_URL}/goals`);
            if (res.data.length > 0) {
                const latestGoal = res.data[0];
                fetchGoalDetails(latestGoal._id);
            } else {
                setLoading(false);
                setShowGoalForm(true);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
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

    const handleAddProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal) return;
        try {
            setLoading(true);
            await axios.post(`${API_URL}/progress/goals/${goal._id}`, {
                date: new Date().toISOString(), // today
                questionsSolved: Number(questionsSolved),
                topics: topics.split(',').map(t => t.trim())
            });
            setQuestionsSolved(0);
            setTopics('');
            fetchGoalDetails(goal._id);
        } catch (error) {
            console.error("Error adding progress", error);
            setLoading(false);
        }
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

    if (showGoalForm || !goal) {
        return (
            <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400 rounded-full blur-[90px] opacity-20 pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Target className="text-brand-400" /> Set Your Target
                    </h2>
                    <p className="text-neutral-400 mb-8">Start your run chase. Create a roadmap.</p>
                    
                    <form onSubmit={handleCreateGoal} className="space-y-5 relative z-10">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-300">Goal Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                className="w-full bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-neutral-300">Target Runs (Questions)</label>
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
                        <button type="submit" 
                            className="w-full bg-brand-500 hover:bg-brand-400 text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(30,185,101,0.3)] hover:shadow-[0_0_30px_rgba(63,213,131,0.5)] transform hover:-translate-y-1">
                            Start Chase 🏏
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const { stats } = goal;

    return (
        <div className="min-h-screen bg-[#050505] text-neutral-100 p-4 md:p-8 pb-20 font-sans selection:bg-brand-500 selection:text-black">
            {/* Header Section */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                        {goal.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1.5 bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full border border-brand-500/20">
                            <Target size={14} /> Target: {goal.totalQuestions}
                        </span>
                        <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-neutral-400">
                            <Calendar size={14} /> {stats.daysPassed} / {goal.totalDays} Days
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Scoreboard & Form */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Cricket Scoreboard Widget */}
                    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500/20 blur-3xl rounded-full transition-all group-hover:bg-brand-400/30"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="text-brand-400" size={24} fill="currentColor" /> Live Score
                        </h3>
                        
                        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                            <div>
                                <p className="text-neutral-500 text-sm font-medium mb-1 uppercase tracking-wider">Score</p>
                                <div className="text-5xl font-black">
                                    {stats.totalSolved}<span className="text-neutral-600 text-3xl">/</span><span className="text-neutral-400 text-3xl">{goal.totalQuestions}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                <p className="text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">Current RR</p>
                                <p className="text-2xl font-bold text-white flex items-center gap-2">
                                    {stats.crr}
                                    {Number(stats.crr) >= Number(stats.rrr) ? 
                                        <TrendingUp size={16} className="text-brand-400" /> : 
                                        <TrendingUp size={16} className="text-red-400 rotate-180" />}
                                </p>
                            </div>
                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                <p className="text-neutral-500 text-xs font-semibold mb-1 uppercase tracking-wider">Required RR</p>
                                <p className="text-2xl font-bold text-white flex items-center gap-2">
                                    {stats.rrr}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-medium text-neutral-400 mb-2">
                                <span>Progress</span>
                                <span>{Math.round((stats.totalSolved / goal.totalQuestions) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_rgba(30,185,101,0.5)] transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (stats.totalSolved / goal.totalQuestions) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Add Progress Widget */}
                    <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="text-brand-400" size={20} /> Log Today
                        </h3>
                        <form onSubmit={handleAddProgress} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5 text-neutral-400 uppercase tracking-wide">Questions Solved</label>
                                <input type="number" value={questionsSolved} onChange={(e) => setQuestionsSolved(Number(e.target.value))} min="0" required
                                    className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 font-bold text-lg transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5 text-neutral-400 uppercase tracking-wide">Topics (comma separated)</label>
                                <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="e.g. Arrays, Graph, DP"
                                    className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-all" />
                            </div>
                            <button type="submit" 
                                className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]">
                                Save Innings
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Map & Graph */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Heatmap Widget */}
                    <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Layers className="text-brand-400" size={20} /> Consistency Map
                            </h3>
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center bg-black/30 rounded-2xl p-6 border border-white/5 w-full overflow-x-auto">
                            <div className="min-w-[600px] w-full">
                                <CalendarHeatmap
                                    startDate={subDays(new Date(), 100)}
                                    endDate={addDays(new Date(), 10)}
                                    values={heatmapData}
                                    classForValue={(value) => {
                                        if (!value || value.count === 0) return 'color-empty';
                                        if (value.count < 3) return 'color-github-1';
                                        if (value.count < 5) return 'color-github-2';
                                        if (value.count < 8) return 'color-github-3';
                                        return 'color-github-4';
                                    }}
                                    tooltipDataAttrs={(value: any) => {
                                        if(!value || !value.date) return { 'data-tooltip': '' };
                                        return {
                                            'data-tooltip': `${value.count} questions on ${value.date}`,
                                        };
                                    }}
                                    showWeekdayLabels={true}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end items-center gap-2 text-xs text-neutral-500 font-medium">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-[#1a1a1a]"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-900"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-700"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-500"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-300"></div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
