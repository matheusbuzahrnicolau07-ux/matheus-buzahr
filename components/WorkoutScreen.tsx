import React, { useState, useEffect } from 'react';
import { User, WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { SparklesIcon, DumbbellIcon, ChevronLeftIcon, CheckCircleIcon, CircleIcon } from './Icons';

interface WorkoutScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onNavigateToSettings: () => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ user, onUpdateUser, onNavigateToSettings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('workout_progress');
    if (saved) setCompletedExercises(new Set(JSON.parse(saved)));
  }, []);

  const toggleExercise = (dayIdx: number, exIdx: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const key = `${dayIdx}-${exIdx}`;
    const newSet = new Set(completedExercises);
    if (newSet.has(key)) newSet.delete(key); else newSet.add(key);
    setCompletedExercises(newSet);
    localStorage.setItem('workout_progress', JSON.stringify(Array.from(newSet)));
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateWorkoutPlan(user);
      onUpdateUser({ ...user, workoutPlan: plan });
      setCompletedExercises(new Set());
      localStorage.removeItem('workout_progress');
    } catch (err) {
      setError("Não foi possível gerar o treino. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!user.workoutPlan) {
    return (
      <div className="flex flex-col h-full p-6 pb-32 animate-in fade-in duration-500">
        <h2 className="text-3xl font-extrabold text-white mb-6">Treino Inteligente</h2>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
             <div className="w-28 h-28 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 relative z-10 shadow-2xl">
                <DumbbellIcon className="w-12 h-12 text-emerald-500" />
             </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-3">Rotina Personalizada</h3>
            <p className="text-zinc-400 max-w-xs mx-auto text-sm leading-relaxed">
              Nossa IA analisa seus objetivos e cria uma ficha completa com exercícios, séries e repetições.
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm p-5 rounded-2xl border border-zinc-800 w-full max-w-xs text-left space-y-3">
             {[
                { l: 'Objetivo', v: user.workoutGoal },
                { l: 'Nível', v: user.experienceLevel },
                { l: 'Frequência', v: `${user.daysPerWeek}x / semana` }
             ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">{item.l}</span>
                    <span className="text-white capitalize font-bold bg-zinc-800 px-2 py-0.5 rounded-md">{item.v?.replace('_', ' ')}</span>
                 </div>
             ))}
          </div>
          
          <button onClick={onNavigateToSettings} className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400">
             Configurar Perfil
          </button>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full max-w-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-5 rounded-[2rem] shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:shadow-emerald-500/30"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 <SparklesIcon className="w-5 h-5" />
                 Gerar Treino
               </>
            )}
          </button>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  const { workoutPlan } = user;

  if (activeDayIndex !== null) {
      const day = workoutPlan.days[activeDayIndex];
      const completedCount = day.exercises.filter((_, idx) => completedExercises.has(`${activeDayIndex}-${idx}`)).length;
      const progress = (completedCount / day.exercises.length) * 100;

      return (
        <div className="flex flex-col h-full p-6 pb-32 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8 sticky top-0 bg-transparent z-10">
                <button onClick={() => setActiveDayIndex(null)} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white active:scale-95 transition-transform">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-white leading-tight line-clamp-1">{day.dayName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                 {day.exercises.map((exercise, idx) => {
                    const isDone = completedExercises.has(`${activeDayIndex}-${idx}`);
                    return (
                        <div key={idx} className={`rounded-[2rem] p-5 border transition-all duration-300 ${isDone ? 'bg-zinc-900/40 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className={`font-bold text-lg transition-colors ${isDone ? 'text-zinc-500 line-through' : 'text-white'}`}>{exercise.name}</h4>
                                    {exercise.tips && <p className="text-xs text-zinc-500 mt-1 font-medium text-emerald-400/80">{exercise.tips}</p>}
                                </div>
                                <button onClick={(e) => toggleExercise(activeDayIndex, idx, e)} className={`ml-3 active:scale-90 transition-transform ${isDone ? 'text-emerald-500' : 'text-zinc-700 hover:text-emerald-500'}`}>
                                    {isDone ? <CheckCircleIcon className="w-8 h-8" /> : <CircleIcon className="w-8 h-8" />}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {[{l:'SETS',v:exercise.sets},{l:'REPS',v:exercise.reps},{l:'REST',v:exercise.rest}].map((tag, i) => (
                                    <div key={i} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 flex-1 justify-center ${isDone ? 'bg-zinc-950/50 border-zinc-800 text-zinc-500' : 'bg-zinc-950 border-zinc-800 text-zinc-300'}`}>
                                        <span className="text-zinc-600">{tag.l}</span>
                                        <span>{tag.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-full p-6 pb-32 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
       <div className="flex justify-between items-end mb-8">
           <div>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Rotina Atual</p>
               <h2 className="text-3xl font-extrabold text-white leading-tight">Meus Treinos</h2>
           </div>
           <button onClick={handleGeneratePlan} disabled={loading} className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2">
               {loading ? <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4" />}
               Novo Plano
           </button>
       </div>

       <div className="space-y-4">
          {workoutPlan.days.map((day, index) => {
             const completedCount = day.exercises.filter((_, idx) => completedExercises.has(`${index}-${idx}`)).length;
             const totalCount = day.exercises.length;
             const isDayComplete = completedCount === totalCount && totalCount > 0;

             return (
                 <button key={index} onClick={() => setActiveDayIndex(index)} className={`w-full p-6 rounded-[2rem] border text-left transition-all active:scale-[0.98] group relative overflow-hidden ${isDayComplete ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-xl ${isDayComplete ? 'text-emerald-400' : 'text-white'}`}>{day.dayName}</h3>
                                {isDayComplete && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                            </div>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">{day.focus}</p>
                            <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${completedCount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-950 text-zinc-500'}`}>
                                {completedCount}/{totalCount} Exercícios
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors border border-zinc-800">
                            <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                        </div>
                    </div>
                 </button>
             );
          })}
       </div>
    </div>
  );
};

export default WorkoutScreen;