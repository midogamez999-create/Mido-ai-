import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Gift,
  Target,
  Smile,
  AlertCircle,
  HelpCircle,
  Tag,
  RefreshCw,
  Wallet,
  PieChart,
  CalendarCheck,
  CheckSquare,
  Square,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  X,
  Flame,
  Zap,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

export interface LifeEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: 'birthday' | 'holiday' | 'exam' | 'goal' | 'anniversary' | 'custom';
  emoji: string;
  notes?: string;
}

export interface MoneyTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  weekId: string; // e.g. 2026-W35
}

export interface LifeHabit {
  id: string;
  title: string;
  completedDays: string[]; // array of dates YYYY-MM-DD
  emoji: string;
}

export const OrganisationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'calendar' | 'money' | 'habits'>('all');
  
  // Life Events & Named Days
  const [events, setEvents] = useState<LifeEvent[]>(() => {
    try {
      const saved = localStorage.getItem('mido_org_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: '1', name: "Mido's Special Birthday 🎉", date: '2026-09-15', category: 'birthday', emoji: '🎂', notes: 'Big party & celebrate with friends' },
      { id: '2', name: 'Launch New AI Project 🚀', date: '2026-09-01', category: 'goal', emoji: '💻', notes: 'Deploy all features and share link' },
      { id: '3', name: 'Real Madrid Matchday ⚽', date: '2026-09-12', category: 'custom', emoji: '🏆', notes: 'Champions League clash' },
    ];
  });

  // Money & Budget Tracker
  const [currentBalance, setCurrentBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mido_org_balance');
      if (saved) return Number(saved);
    } catch (e) {
      console.error(e);
    }
    return 1450;
  });

  const [transactions, setTransactions] = useState<MoneyTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('mido_org_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: '1', type: 'income', amount: 500, category: 'Weekly Allowance / Work', description: 'Weekly payment arrived', date: today, weekId: 'Current Week' },
      { id: '2', type: 'expense', amount: 35, category: 'Food & Drinks', description: 'Lunch & coffee with squad', date: today, weekId: 'Current Week' },
      { id: '3', type: 'expense', amount: 45, category: 'Tech & Subscriptions', description: 'Cloud server hosting', date: today, weekId: 'Current Week' },
    ];
  });

  // Daily Habits / Life Organizer
  const [habits, setHabits] = useState<LifeHabit[]>(() => {
    try {
      const saved = localStorage.getItem('mido_org_habits');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: '1', title: 'Code & Build App Studio', completedDays: [today], emoji: '💻' },
      { id: '2', title: 'Work out & Pushups', completedDays: [today], emoji: '💪' },
      { id: '3', title: 'Drink 2L Water', completedDays: [], emoji: '💧' },
      { id: '4', title: 'Review Weekly Budget', completedDays: [today], emoji: '💰' },
    ];
  });

  // Modal / Form state for Events
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventCategory, setNewEventCategory] = useState<LifeEvent['category']>('custom');
  const [newEventEmoji, setNewEventEmoji] = useState('🌟');
  const [newEventNotes, setNewEventNotes] = useState('');

  // Modal / Form state for Transactions
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food & Snacks');
  const [txDescription, setTxDescription] = useState('');

  // Form state for Habits
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('mido_org_events', JSON.stringify(events));
    } catch (e) {
      console.error(e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('mido_org_balance', currentBalance.toString());
      localStorage.setItem('mido_org_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [currentBalance, transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('mido_org_habits', JSON.stringify(habits));
    } catch (e) {
      console.error(e);
    }
  }, [habits]);

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const thisWeekExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayDateStr = new Date().toISOString().split('T')[0];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;
    soundFx.playClick();
    const newEv: LifeEvent = {
      id: Date.now().toString(),
      name: newEventName.trim(),
      date: newEventDate,
      category: newEventCategory,
      emoji: newEventEmoji || '📅',
      notes: newEventNotes.trim(),
    };
    setEvents([newEv, ...events]);
    setNewEventName('');
    setNewEventNotes('');
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    soundFx.playClick();
    setEvents(events.filter((ev) => ev.id !== id));
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(txAmount);
    if (isNaN(num) || num <= 0) return;
    soundFx.playClick();
    const newTx: MoneyTransaction = {
      id: Date.now().toString(),
      type: txType,
      amount: num,
      category: txCategory,
      description: txDescription.trim() || (txType === 'income' ? 'Income added' : 'Expense recorded'),
      date: new Date().toISOString().split('T')[0],
      weekId: 'Current Week',
    };
    setTransactions([newTx, ...transactions]);
    if (txType === 'income') {
      setCurrentBalance((prev) => prev + num);
    } else {
      setCurrentBalance((prev) => Math.max(0, prev - num));
    }
    setTxAmount('');
    setTxDescription('');
    setIsAddingTransaction(false);
  };

  const handleDeleteTransaction = (id: string) => {
    soundFx.playClick();
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    if (tx.type === 'income') {
      setCurrentBalance((prev) => Math.max(0, prev - tx.amount));
    } else {
      setCurrentBalance((prev) => prev + tx.amount);
    }
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleToggleHabit = (habitId: string) => {
    soundFx.playClick();
    setHabits(
      habits.map((h) => {
        if (h.id !== habitId) return h;
        const isDoneToday = h.completedDays.includes(todayDateStr);
        return {
          ...h,
          completedDays: isDoneToday
            ? h.completedDays.filter((d) => d !== todayDateStr)
            : [...h.completedDays, todayDateStr],
        };
      })
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    soundFx.playClick();
    const newH: LifeHabit = {
      id: Date.now().toString(),
      title: newHabitTitle.trim(),
      completedDays: [],
      emoji: '🎯',
    };
    setHabits([...habits, newH]);
    setNewHabitTitle('');
  };

  const handleDeleteHabit = (id: string) => {
    soundFx.playClick();
    setHabits(habits.filter((h) => h.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto pb-24 md:pb-12">
      {/* Top Banner & Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Organisation Suite</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    LIFE PLANNER 2026
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Organize your whole life: custom named calendar days, birthday reminders, money &amp; weekly spendings!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Life Hub', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'calendar', label: 'Named Days & Calendar', icon: <Calendar className="w-3.5 h-3.5 text-pink-400" /> },
              { id: 'money', label: 'Money & Weekly Spendings', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
              { id: 'habits', label: 'Daily Life Habits', icon: <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area (Scrollable on mobile) */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Money */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="absolute right-3 -bottom-3 text-emerald-500/10 pointer-events-none">
              <Wallet className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money Available</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">${currentBalance.toLocaleString()}</div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setTxType('income');
                  setIsAddingTransaction(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Money
              </button>
              <button
                onClick={() => {
                  setTxType('expense');
                  setIsAddingTransaction(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-bold text-rose-300 transition-all flex items-center gap-1"
              >
                <TrendingDown className="w-3 h-3" /> Record Spend
              </button>
            </div>
          </div>

          {/* Card 2: Spent This Week */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Spent This Week</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400">${thisWeekExpense.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Recorded across {transactions.filter((t) => t.type === 'expense').length} expenses</div>
          </div>

          {/* Card 3: Named Days & Events */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Special Named Days</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">{events.length} Days</div>
            <button
              onClick={() => setIsAddingEvent(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-[11px] font-bold text-purple-300 transition-all inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Name a New Day
            </button>
          </div>

          {/* Card 4: Daily Habits Score */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Life Habits</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300">
              {habits.filter((h) => h.completedDays.includes(todayDateStr)).length} / {habits.length}
            </div>
            <div className="text-[11px] text-cyan-400 font-semibold">Today's completed goals</div>
          </div>
        </div>

        {/* SECTION 1: CALENDAR & NAMED DAYS (What you want to name a day like birthday or anything) */}
        {(activeTab === 'all' || activeTab === 'calendar') && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  <span>Named Days &amp; Life Calendar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                    CUSTOM DAY NAMER
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Name any day whatever you want (Birthday, Exam, Travel, Real Madrid Matchday, Big Goal)</p>
              </div>

              <button
                onClick={() => setIsAddingEvent(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Name A New Day
              </button>
            </div>

            {/* List of Named Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ev.emoji}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-white group-hover:text-pink-300 transition-colors">{ev.name}</h4>
                          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">{ev.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete Named Day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {ev.notes && (
                      <p className="mt-2 text-xs text-slate-400 italic bg-black/20 p-2 rounded-xl">
                        "{ev.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: MONEY & WEEKLY SPENDINGS */}
        {(activeTab === 'all' || activeTab === 'money') && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Money &amp; Weekly Spending Tracker</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    FINANCE SUITE
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Track how much money you have, what you get weekly, and what you spent on this week</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTxType('income');
                    setIsAddingTransaction(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Income
                </button>
                <button
                  onClick={() => {
                    setTxType('expense');
                    setIsAddingTransaction(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all"
                >
                  <TrendingDown className="w-3.5 h-3.5" /> Record Expense
                </button>
              </div>
            </div>

            {/* Transactions Log */}
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No transactions recorded yet. Tap "+ Add Income" or "Record Expense".</div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{tx.description}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-normal">
                            {tx.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{tx.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`text-sm font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: DAILY HABITS & LIFE ORGANISATION TOOLS */}
        {(activeTab === 'all' || activeTab === 'habits') && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                  <span>Daily Life Goals &amp; Habits Tracker</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    LIFE CHECKLIST
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Organize your everyday habits, check them off as you go each day!</p>
              </div>

              <form onSubmit={handleAddHabit} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New goal / habit (e.g. Drink 2L water)..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 w-48 sm:w-60"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Habit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((habit) => {
                const isCompletedToday = habit.completedDays.includes(todayDateStr);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                      isCompletedToday
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          isCompletedToday ? 'bg-cyan-500 text-black font-black' : 'border border-slate-600'
                        }`}
                      >
                        {isCompletedToday && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCompletedToday ? 'line-through text-slate-400' : 'text-white'}`}>
                          {habit.title}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Completed {habit.completedDays.length} times
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHabit(habit.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD NAMED DAY */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-pink-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-400" />
                <h3 className="text-base font-extrabold text-white">Name a Custom Day</h3>
              </div>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">What do you want to call this day?</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday, Real Madrid Final, Exam Day..."
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                  >
                    <option value="birthday">Birthday 🎂</option>
                    <option value="holiday">Holiday 🏖️</option>
                    <option value="exam">Exam / Study 📚</option>
                    <option value="goal">Big Goal 🚀</option>
                    <option value="anniversary">Anniversary 💍</option>
                    <option value="custom">Special Day 🌟</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Emoji Icon</label>
                <div className="flex gap-2">
                  {['🎂', '🎉', '⚽', '🏆', '💻', '🚀', '🏖️', '❤️', '🌟', '📚'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewEventEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                        newEventEmoji === em ? 'bg-pink-500/30 border border-pink-400 scale-110' : 'bg-black/30 border border-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notes / Plan (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Invite friends, prepare presentation..."
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all"
                >
                  Save Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TRANSACTION / SPEND */}
      {isAddingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">
                  {txType === 'income' ? 'Add Income / Money' : 'Record What You Spent'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddingTransaction(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="flex rounded-2xl bg-black/50 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Spend / Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Income / Received
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 50"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">What did you spend on / receive from?</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch with friends, weekly payment, shoes..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="Food & Snacks">Food &amp; Snacks 🍔</option>
                  <option value="Tech & Subscriptions">Tech &amp; Subscriptions 💻</option>
                  <option value="Entertainment & Gaming">Entertainment &amp; Gaming 🎮</option>
                  <option value="Shopping & Clothes">Shopping &amp; Clothes 🛍️</option>
                  <option value="Weekly Allowance / Work">Weekly Allowance / Work 💵</option>
                  <option value="Other">Other 🌟</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTransaction(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg transition-all ${
                    txType === 'income' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
