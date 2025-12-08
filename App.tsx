import React, { useState, useEffect, useRef } from 'react';
import { User, NutritionData, AnalysisRecord, AppView, UserGoals } from './types';
import { analyzeFoodImage } from './services/geminiService';
import AnalysisResult from './components/AnalysisResult';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import WorkoutScreen from './components/WorkoutScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { CameraIcon, HistoryIcon, LeafIcon, ChevronLeftIcon, HomeIcon, PlusIcon, ChartBarIcon, FireIcon, SettingsIcon, BarbellIcon } from './components/Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Weekly calendar data helpers
const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const getCurrentWeekStatus = (history: AnalysisRecord[]) => {
    const today = new Date().getDay();
    const status = Array(7).fill(false);
    status[today] = true;
    status[(today - 1 + 7) % 7] = true; 
    return status;
};

// Default Goals
const DEFAULT_GOALS: UserGoals = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65
};

function App() {
  // State
  const [view, setView] = useState<AppView>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<NutritionData | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const savedUser = localStorage.getItem('nutrivision_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.goals) parsedUser.goals = DEFAULT_GOALS;
      if (!parsedUser.workoutGoal) parsedUser.workoutGoal = 'hypertrophy';
      if (!parsedUser.experienceLevel) parsedUser.experienceLevel = 'beginner';
      if (!parsedUser.daysPerWeek) parsedUser.daysPerWeek = 3;
      setUser(parsedUser);
      setView('home');
    }

    const savedHistory = localStorage.getItem('nutrivision_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
        setHistory([]); // Start empty for new users
    }
  }, []);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      name: 'Usuário',
      email: 'usuario@exemplo.com',
      joinedAt: Date.now(),
      goals: DEFAULT_GOALS,
      workoutGoal: 'hypertrophy',
      experienceLevel: 'beginner',
      daysPerWeek: 3,
      workoutLocation: 'gym'
    };
    setUser(newUser);
    setView('onboarding'); 
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nutrivision_user', JSON.stringify(updatedUser));
    setView('home');
  };

  const handleUpdateProfile = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('nutrivision_user', JSON.stringify(updatedUser));
      if (view === 'settings') setView('home');
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setView('camera'); 

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCurrentImage(base64);
      try {
        const result = await analyzeFoodImage(base64);
        setCurrentAnalysis(result);
        setView('result');
      } catch (err: any) {
        setError("Não foi possível identificar o alimento. Tente uma foto mais clara.");
        setTimeout(() => setError(null), 4000);
        setView('home');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAnalysis = (data: NutritionData) => {
    if (!currentImage || !user) return;
    const newRecord: AnalysisRecord = {
      ...data,
      id: Date.now().toString(),
      imageUrl: currentImage,
      timestamp: Date.now(),
      userId: user.id
    };
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('nutrivision_history', JSON.stringify(updatedHistory));
    setCurrentImage(null);
    setCurrentAnalysis(null);
    setView('home');
  };

  const handleSelectHistoryItem = (item: AnalysisRecord) => {
    setCurrentImage(item.imageUrl);
    setCurrentAnalysis(item);
    setView('result');
  };

  // Calculate Today's Stats
  const getTodayStats = () => {
    const today = new Date().setHours(0,0,0,0);
    const todayMeals = history.filter(item => new Date(item.timestamp).setHours(0,0,0,0) === today);
    const totalCals = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
    const totalProtein = todayMeals.reduce((acc, curr) => acc + curr.protein, 0);
    const totalCarbs = todayMeals.reduce((acc, curr) => acc + curr.carbs, 0);
    const totalFat = todayMeals.reduce((acc, curr) => acc + curr.fat, 0);
    const goals = user?.goals || DEFAULT_GOALS;
    const remaining = Math.max(0, goals.calories - totalCals);
    return { totalCals, totalProtein, totalCarbs, totalFat, remaining, todayMeals, goals };
  };

  const { totalCals, totalProtein, totalCarbs, totalFat, remaining, todayMeals, goals } = getTodayStats();
  const weekStatus = getCurrentWeekStatus(history);
  
  const homeChartData = [
      { name: 'Consumed', value: totalCals },
      { name: 'Remaining', value: remaining }
  ];
  
  const progressData = [
      { day: 'Seg', weight: 68.2 },
      { day: 'Ter', weight: 68.0 },
      { day: 'Qua', weight: 67.8 },
      { day: 'Qui', weight: 67.5 },
      { day: 'Sex', weight: 67.2 },
      { day: 'Sab', weight: 67.4 },
      { day: 'Dom', weight: 66.8 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800/95 backdrop-blur-md border border-zinc-700 p-3 rounded-2xl shadow-2xl shadow-black/50">
          <p className="text-zinc-400 text-xs font-medium mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
             <p className="text-white font-bold text-xl">{payload[0].value}</p>
             <span className="text-xs font-medium text-emerald-400">kg</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render Logic
  if (view === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-white text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
             <div className="w-24 h-24 bg-white/5 p-6 rounded-[2rem] mb-10 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
                 <LeafIcon className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">NutriVision</h1>
            <p className="text-xl text-zinc-400 mb-12 font-medium max-w-xs mx-auto">Transforme seu corpo com o poder da inteligência artificial.</p>
            <button 
            onClick={() => setView('login')}
            className="w-full max-w-xs bg-white text-black font-extrabold text-lg py-5 rounded-[2rem] hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
            Começar Agora
            </button>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen flex flex-col p-8 justify-center animate-in fade-in duration-500">
         <button onClick={() => setView('welcome')} className="absolute top-8 left-8 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 active:scale-95 transition-transform">
             <ChevronLeftIcon className="w-5 h-5" />
         </button>
        <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Criar Conta</h2>
        <p className="text-zinc-500 mb-10 text-lg">Seus dados são usados apenas para personalizar sua dieta.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-zinc-900/50 p-1 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 transition-colors">
                 <input type="text" className="w-full p-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-medium" placeholder="Nome" required />
            </div>
            <div className="bg-zinc-900/50 p-1 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 transition-colors">
                <input type="email" className="w-full p-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-medium" placeholder="Email" required />
            </div>
            <div className="bg-zinc-900/50 p-1 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 transition-colors">
                <input type="password" className="w-full p-4 bg-transparent text-white focus:outline-none placeholder-zinc-600 font-medium" placeholder="Senha" required />
            </div>
            
            <button type="submit" className="w-full bg-white text-black font-bold py-5 rounded-[2rem] shadow-xl shadow-white/5 mt-6 active:scale-[0.98] transition-all text-lg hover:bg-zinc-200">
                Criar Conta
            </button>
        </form>
         <button onClick={() => handleLogin({ preventDefault: () => {} } as any)} className="mt-8 text-zinc-500 font-semibold text-sm text-center w-full hover:text-white transition-colors">
            Continuar como convidado
        </button>
      </div>
    );
  }

  if (view === 'onboarding' && user) {
      return (
          <OnboardingScreen 
            user={user}
            onComplete={handleOnboardingComplete}
          />
      )
  }

  if (view === 'camera' && isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="relative w-72 h-72 border border-zinc-800/50 rounded-[2.5rem] flex items-center justify-center overflow-hidden mb-8 bg-zinc-900/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
            <div className="w-full h-1.5 bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
            <LeafIcon className="w-20 h-20 text-zinc-600" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Analisando...</h2>
        <p className="text-zinc-500 text-center max-w-xs">Nossa IA está identificando ingredientes e calculando macros.</p>
        <style>{`@keyframes scan { 0% { top: 0%; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
      </div>
    );
  }

  if (view === 'result' && currentAnalysis && currentImage) {
    return (
      <AnalysisResult 
        data={currentAnalysis}
        imageUrl={currentImage}
        onSave={handleSaveAnalysis}
        onCancel={() => setView('home')}
      />
    );
  }

  // Improved Bottom Nav with Glassmorphism
  // Changed max-w-xs to max-w-sm for better spacing on larger phones
  const BottomNav = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm z-50">
        <nav className="glass bg-zinc-900/80 text-white py-3 px-5 rounded-[2rem] shadow-2xl flex items-center justify-between relative">
            <button onClick={() => setView('home')} className={`p-2 transition-all active:scale-90 ${view === 'home' ? 'text-white bg-zinc-800 rounded-full' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <HomeIcon className="w-6 h-6" />
            </button>
            
            <button onClick={() => setView('workouts')} className={`p-2 transition-all active:scale-90 ${view === 'workouts' ? 'text-white bg-zinc-800 rounded-full' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <BarbellIcon className="w-6 h-6" />
            </button>

            <div className="w-12"></div> {/* Spacer */}

            <button onClick={() => setView('progress')} className={`p-2 transition-all active:scale-90 ${view === 'progress' ? 'text-white bg-zinc-800 rounded-full' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <ChartBarIcon className="w-6 h-6" />
            </button>

            <button onClick={() => setView('history')} className={`p-2 transition-all active:scale-90 ${view === 'history' ? 'text-white bg-zinc-800 rounded-full' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <HistoryIcon className="w-6 h-6" />
            </button>
        </nav>

        {/* Floating Action Button */}
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] hover:shadow-white/50 active:scale-95 transition-all"
        >
            <PlusIcon className="w-7 h-7" />
        </button>
    </div>
  );

  if (view === 'history') {
    return (
      <>
        <HistoryScreen 
            history={history}
            onBack={() => setView('home')}
            onSelect={handleSelectHistoryItem}
        />
        <BottomNav />
        <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
      </>
    );
  }

  if (view === 'workouts') {
      if (!user) { setView('login'); return null; }
      return (
          <>
            <WorkoutScreen 
                user={user}
                onUpdateUser={handleUpdateProfile}
                onNavigateToSettings={() => setView('settings')}
            />
            <BottomNav />
             <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          </>
      )
  }

  if (view === 'progress') {
      return (
        <div className="min-h-screen flex flex-col pb-32 no-scrollbar p-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-extrabold text-white mb-6">Seu Progresso</h2>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-800 mb-6 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-white text-lg">Peso Corporal</h3>
                        <p className="text-zinc-500 text-sm font-medium">Últimos 7 dias</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-400">-1.4 kg</span>
                    </div>
                </div>
                
                <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12, fontWeight: 500}} dy={15} />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Area type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" animationDuration={2000} />
                        </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                 <div className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-800 flex flex-col items-center text-center">
                     <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 text-2xl">🔥</div>
                     <p className="text-4xl font-black text-white tracking-tighter">12</p>
                     <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Dias Seguidos</p>
                 </div>
            </div>
            
            <BottomNav />
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
        </div>
      );
  }

  if (view === 'settings') {
    if (!user) { setView('login'); return null; }
    return (
      <ProfileScreen 
        user={user}
        onSave={handleUpdateProfile}
        onBack={() => setView('home')}
        onLogout={() => {
            localStorage.removeItem('nutrivision_user');
            setUser(null);
            setView('welcome');
        }}
        onClearHistory={() => {
            setHistory([]);
            localStorage.removeItem('nutrivision_history');
        }}
      />
    );
  }

  // Home View
  return (
    <div className="min-h-screen flex flex-col pb-32 no-scrollbar animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 z-20">
        <div>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
             {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">Hoje</h1>
        </div>
        <div className="flex gap-4 items-center">
            {/* Streak Widget */}
            <div className="flex gap-1.5 items-center bg-zinc-900/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-800">
                {WEEK_DAYS.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                        <span className={`text-[9px] font-bold mb-1 ${idx === new Date().getDay() ? 'text-white' : 'text-zinc-600'}`}>{day}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${weekStatus[idx] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`}></div>
                    </div>
                ))}
            </div>
            <button onClick={() => setView('settings')} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-800 hover:text-white transition-colors active:scale-95">
                <SettingsIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Dashboard Card */}
      <div className="px-6 mb-8">
         <div className="bg-zinc-900/80 backdrop-blur-md text-white rounded-[2.5rem] p-6 border border-zinc-800 relative overflow-hidden shadow-2xl">
             <div className="flex justify-between items-center gap-6">
                {/* Ring Chart */}
                <div className="h-36 w-36 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={homeChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={68} dataKey="value" startAngle={90} endAngle={-270} stroke="none" cornerRadius={10} paddingAngle={5}>
                                <Cell fill="#10B981" />
                                <Cell fill="#27272a" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <FireIcon className="w-5 h-5 text-zinc-500 mb-1" />
                        <span className="text-2xl font-black tracking-tighter">{remaining}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Restantes</span>
                    </div>
                </div>

                {/* Macro Bars */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    {[{l:'Proteína', v:totalProtein, t:goals.protein, c:'amber'}, {l:'Carbo', v:totalCarbs, t:goals.carbs, c:'emerald'}, {l:'Gordura', v:totalFat, t:goals.fat, c:'blue'}].map((m) => (
                         <div key={m.l}>
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-zinc-400">{m.l}</span>
                                <span className="text-white">{Math.round(m.v)} / {m.t}g</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                                <div className={`h-full bg-${m.c}-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, (m.v / m.t) * 100)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      </div>

      {/* Meals Section */}
      <div className="px-6 flex-1">
        {error && (
            <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-500/20 text-center">
                {error}
            </div>
        )}

        {todayMeals.length > 0 && (
            <>
                <div className="flex justify-between items-end mb-4 px-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Refeições</h3>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{Math.round(totalCals)} kcal hoje</span>
                </div>

                <div className="space-y-3">
                    {todayMeals.slice().reverse().map(item => (
                        <div key={item.id} onClick={() => handleSelectHistoryItem(item)} className="bg-zinc-900/60 backdrop-blur-sm p-3 rounded-[2rem] border border-zinc-800/50 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer hover:bg-zinc-800/80">
                            <div className="w-16 h-16 rounded-[1.2rem] bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700/30">
                                <img 
                                    src={item.imageUrl} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/18181b/52525b?text=Food'; }}
                                />
                            </div>
                            <div className="flex-1 py-1 min-w-0">
                                <h4 className="font-bold text-white text-base truncate mb-1">{item.foodName}</h4>
                                <div className="flex gap-3 text-xs font-bold text-zinc-500">
                                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                                        <FireIcon className="w-3 h-3" />
                                        {Math.round(item.calories)} kcal
                                    </span>
                                </div>
                            </div>
                            <div className="pr-3 text-zinc-600">
                                 <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>

      <BottomNav />
      <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
    </div>
  );
}

export default App;