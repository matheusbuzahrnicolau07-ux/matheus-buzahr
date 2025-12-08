import React, { useState } from 'react';
import { User, WorkoutGoal, ExperienceLevel, UserGoals } from '../types';
import { ChevronLeftIcon, FireIcon, DumbbellIcon, ChartBarIcon } from './Icons';

interface OnboardingScreenProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<User>({
    ...user,
    weight: user.weight || 70,
    height: user.height || 170,
    age: user.age || 25,
    gender: user.gender || 'male',
    workoutGoal: 'hypertrophy',
    experienceLevel: 'beginner',
    workoutLocation: 'gym',
    daysPerWeek: 3,
    goals: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 60
    }
  });

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (field: keyof UserGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      goals: {
        ...prev.goals!,
        [field]: numValue
      }
    }));
  };

  const calculateMacros = () => {
      const weight = formData.weight || 70;
      const goal = formData.workoutGoal;
      
      let factor = 29;
      if (goal === 'weight_loss') factor = 24; // Deficit
      else if (goal === 'hypertrophy') factor = 32; // Surplus
      else if (goal === 'strength') factor = 30; // Slight Surplus
      else factor = 28; // Maintenance

      const calories = Math.round(weight * factor);
      const protein = Math.round(weight * 2.0); 
      const fat = Math.round(weight * 0.9);
      const remainingCals = calories - (protein * 4) - (fat * 9);
      const carbs = Math.max(50, Math.round(remainingCals / 4));

      return { calories, protein, carbs, fat };
  };

  const nextStep = () => {
    if (step === 2) {
        const calculatedGoals = calculateMacros();
        setFormData(prev => ({
            ...prev,
            goals: calculatedGoals
        }));
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);
  const handleSubmit = () => onComplete(formData);

  // Helper component for Selectable Cards
  const SelectCard = ({ selected, onClick, label, icon, subLabel }: any) => (
    <button
        onClick={onClick}
        className={`w-full p-4 rounded-3xl border text-left transition-all duration-300 active:scale-[0.98] ${
            selected 
            ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' 
            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
        }`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selected ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                {icon}
            </div>
            <div>
                <p className={`font-bold text-lg ${selected ? 'text-white' : 'text-zinc-200'}`}>{label}</p>
                {subLabel && <p className="text-xs text-zinc-500 mt-0.5">{subLabel}</p>}
            </div>
             <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-700'}`}>
                {selected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
            </div>
        </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col p-6 text-white pb-10">
      
      {/* Header / Progress */}
      <div className="flex items-center justify-between mt-4 mb-8">
          {step > 1 ? (
               <button onClick={prevStep} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 active:scale-95 transition-transform">
                  <ChevronLeftIcon className="w-5 h-5" />
               </button>
          ) : (
              <div className="w-10" />
          )}
          <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-800'}`} />
              ))}
          </div>
          <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {step === 1 && (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Sobre Você</h2>
                    <p className="text-zinc-400 leading-relaxed">Precisamos de alguns dados para calibrar o algoritmo para o seu corpo.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2">Peso (kg)</label>
                        <input 
                            type="number" 
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                            className="w-full bg-transparent text-4xl font-extrabold text-white focus:outline-none"
                            placeholder="0"
                            autoFocus
                        />
                    </div>
                    <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2">Altura (cm)</label>
                        <input 
                            type="number" 
                            value={formData.height}
                            onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                            className="w-full bg-transparent text-4xl font-extrabold text-white focus:outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="bg-zinc-900 p-5 rounded-[2rem] border border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-2">Idade</label>
                    <input 
                        type="number" 
                        value={formData.age}
                        onChange={(e) => handleChange('age', parseFloat(e.target.value))}
                        className="w-full bg-transparent text-4xl font-extrabold text-white focus:outline-none"
                        placeholder="0"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleChange('gender', 'male')}
                        className={`p-5 rounded-3xl border font-bold text-lg transition-all active:scale-[0.98] ${
                            formData.gender === 'male' 
                            ? 'bg-emerald-500 text-black border-emerald-500' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                    >
                        Masculino
                    </button>
                    <button
                        onClick={() => handleChange('gender', 'female')}
                        className={`p-5 rounded-3xl border font-bold text-lg transition-all active:scale-[0.98] ${
                            formData.gender === 'female' 
                            ? 'bg-emerald-500 text-black border-emerald-500' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                    >
                        Feminino
                    </button>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Seu Objetivo</h2>
                    <p className="text-zinc-400">Isso definirá sua estratégia de treino e nutrição.</p>
                </div>

                <div className="space-y-3">
                    <SelectCard 
                        selected={formData.workoutGoal === 'hypertrophy'}
                        onClick={() => handleChange('workoutGoal', 'hypertrophy')}
                        label="Ganhar Massa"
                        subLabel="Foco em hipertrofia e volume"
                        icon={<DumbbellIcon className="w-6 h-6" />}
                    />
                    <SelectCard 
                        selected={formData.workoutGoal === 'weight_loss'}
                        onClick={() => handleChange('workoutGoal', 'weight_loss')}
                        label="Perder Gordura"
                        subLabel="Déficit calórico e definição"
                        icon={<FireIcon className="w-6 h-6" />}
                    />
                    <SelectCard 
                        selected={formData.workoutGoal === 'strength'}
                        onClick={() => handleChange('workoutGoal', 'strength')}
                        label="Ganhar Força"
                        subLabel="Foco em cargas e progressão"
                        icon={<ChartBarIcon className="w-6 h-6" />}
                    />
                </div>

                <div className="pt-4">
                     <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-3 ml-2">Nível de Experiência</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                            <button
                                key={level}
                                onClick={() => handleChange('experienceLevel', level)}
                                className={`p-3 rounded-2xl border text-sm font-bold capitalize transition-all active:scale-95 ${
                                    formData.experienceLevel === level
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                                }`}
                            >
                                {level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Interm.' : 'Avançado'}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-6">
                 <div className="text-center mb-2">
                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Plano Gerado</h2>
                    <p className="text-zinc-400">Sua meta nutricional diária sugerida.</p>
                </div>

                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-[2.5rem] border border-zinc-700/50 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                    <div className="w-20 h-20 rounded-full bg-zinc-950 flex items-center justify-center mb-4 border border-zinc-800 shadow-inner">
                        <FireIcon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <label className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-2">Meta Calórica</label>
                    <div className="flex items-baseline gap-1 relative z-10">
                        <input 
                            type="number"
                            value={formData.goals?.calories}
                            onChange={(e) => handleGoalChange('calories', e.target.value)}
                            className="bg-transparent text-6xl font-black text-white text-center w-48 focus:outline-none border-b border-transparent focus:border-zinc-700"
                        />
                        <span className="text-zinc-500 font-bold text-lg">kcal</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2">Macronutrientes</h3>
                    
                    {/* Macro Cards */}
                    {[
                        { key: 'protein', label: 'Proteína', icon: '🥩', color: 'amber' },
                        { key: 'carbs', label: 'Carbo', icon: '🍚', color: 'emerald' },
                        { key: 'fat', label: 'Gordura', icon: '🥑', color: 'blue' }
                    ].map((macro) => (
                         <div key={macro.key} className="bg-zinc-900/80 p-4 rounded-3xl border border-zinc-800/50 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{macro.icon}</span>
                                <div>
                                    <span className="font-bold text-white block">{macro.label}</span>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <input 
                                    type="number" 
                                    value={(formData.goals as any)[macro.key]}
                                    onChange={(e) => handleGoalChange(macro.key as any, e.target.value)}
                                    className="w-16 bg-transparent text-right font-bold text-xl text-white focus:outline-none"
                                />
                                <span className="text-xs text-zinc-500 font-bold">g</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex-1"></div>
        
        <button 
            onClick={step === 3 ? handleSubmit : nextStep}
            className="w-full bg-white text-black font-extrabold text-lg py-5 rounded-[2rem] shadow-xl shadow-white/10 active:scale-[0.98] transition-all mt-8 mb-4 hover:bg-zinc-100"
        >
            {step === 3 ? 'Finalizar e Começar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;