import React, { useState } from 'react';
import { User, UserGoals, WorkoutGoal, ExperienceLevel, WorkoutLocation } from '../types';
import { ChevronLeftIcon, SaveIcon } from './Icons';

interface ProfileScreenProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onBack: () => void;
  onLogout: () => void;
  onClearHistory: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onSave, onBack, onLogout, onClearHistory }) => {
  const [formData, setFormData] = useState<User>({
    ...user,
    goals: user.goals || {
      calories: 2200,
      protein: 150,
      carbs: 250,
      fat: 70
    },
    // Ensure workout fields exist
    workoutGoal: user.workoutGoal || 'hypertrophy',
    experienceLevel: user.experienceLevel || 'beginner',
    workoutLocation: user.workoutLocation || 'gym',
    daysPerWeek: user.daysPerWeek || 3
  });

  // Local state for button confirmation
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

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

  const handleSave = () => {
    onSave(formData);
  };

  const handleLogoutClick = () => {
    if (confirmLogout) {
      onLogout();
    } else {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000); // Reset after 3s
    }
  };

  const handleClearHistoryClick = () => {
    if (confirmClear) {
      onClearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000); // Reset after 3s
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-6 text-white pb-24 animate-in fade-in slide-in-from-right-10 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Meu Perfil</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
        >
          <SaveIcon className="w-4 h-4" />
          Salvar
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-emerald-500/20">
             {formData.name.charAt(0).toUpperCase()}
          </div>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-transparent text-center text-2xl font-bold border-b border-transparent hover:border-zinc-700 focus:border-emerald-500 focus:outline-none w-full max-w-[200px]"
          />
          <p className="text-zinc-500 text-sm">{formData.email}</p>
        </div>

        {/* Physical Stats Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Dados Corporais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800">
              <label className="text-xs text-zinc-500 font-medium block mb-1">Peso (kg)</label>
              <input 
                type="number" 
                value={formData.weight || ''}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-zinc-700"
                placeholder="70"
              />
            </div>
            <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800">
              <label className="text-xs text-zinc-500 font-medium block mb-1">Altura (cm)</label>
              <input 
                type="number" 
                value={formData.height || ''}
                onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-zinc-700"
                placeholder="175"
              />
            </div>
            <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800">
              <label className="text-xs text-zinc-500 font-medium block mb-1">Idade</label>
              <input 
                type="number" 
                value={formData.age || ''}
                onChange={(e) => handleChange('age', parseFloat(e.target.value))}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-zinc-700"
                placeholder="25"
              />
            </div>
            <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800">
              <label className="text-xs text-zinc-500 font-medium block mb-1">Gênero</label>
              <select 
                value={formData.gender || 'male'}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-white focus:outline-none -ml-1 appearance-none"
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
          </div>
        </section>

        {/* Workout Personalization */}
        <section className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Personalização de Treino</h3>
            
            <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 space-y-4">
                <div>
                    <label className="text-xs text-zinc-500 font-medium block mb-2">Objetivo Principal</label>
                    <select 
                        value={formData.workoutGoal} 
                        onChange={(e) => handleChange('workoutGoal', e.target.value)}
                        className="w-full bg-zinc-950 p-3 rounded-xl text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                    >
                        <option value="hypertrophy">Hipertrofia (Ganhar Massa)</option>
                        <option value="weight_loss">Emagrecimento</option>
                        <option value="strength">Força Pura</option>
                        <option value="endurance">Resistência</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500 font-medium block mb-2">Nível</label>
                        <select 
                            value={formData.experienceLevel} 
                            onChange={(e) => handleChange('experienceLevel', e.target.value)}
                            className="w-full bg-zinc-950 p-3 rounded-xl text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="beginner">Iniciante</option>
                            <option value="intermediate">Intermediário</option>
                            <option value="advanced">Avançado</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-zinc-500 font-medium block mb-2">Local</label>
                        <select 
                            value={formData.workoutLocation} 
                            onChange={(e) => handleChange('workoutLocation', e.target.value)}
                            className="w-full bg-zinc-950 p-3 rounded-xl text-white border border-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="gym">Academia</option>
                            <option value="home_equipment">Casa (Equip.)</option>
                            <option value="home_bodyweight">Casa (Peso)</option>
                        </select>
                    </div>
                </div>

                <div>
                     <label className="text-xs text-zinc-500 font-medium block mb-2">Dias por Semana: <span className="text-white font-bold">{formData.daysPerWeek}</span></label>
                     <input 
                        type="range" 
                        min="2" 
                        max="6" 
                        step="1"
                        value={formData.daysPerWeek}
                        onChange={(e) => handleChange('daysPerWeek', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-xs text-zinc-500 mt-1">
                         <span>2 dias</span>
                         <span>6 dias</span>
                     </div>
                </div>
            </div>
        </section>

        {/* Nutrition Goals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Metas Nutricionais</h3>
            <span className="text-xs text-emerald-500 font-medium">Diário</span>
          </div>
          
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800/50">
            {/* Calories */}
            <div className="p-4 flex justify-between items-center group hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">🔥</div>
                <span className="font-medium text-zinc-200">Calorias</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input 
                  type="number" 
                  value={formData.goals?.calories}
                  onChange={(e) => handleGoalChange('calories', e.target.value)}
                  className="w-16 bg-transparent text-right font-bold text-white focus:outline-none border-b border-transparent focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">kcal</span>
              </div>
            </div>

            {/* Protein */}
            <div className="p-4 flex justify-between items-center group hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">🥩</div>
                <span className="font-medium text-zinc-200">Proteína</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <input 
                  type="number" 
                  value={formData.goals?.protein}
                  onChange={(e) => handleGoalChange('protein', e.target.value)}
                  className="w-12 bg-transparent text-right font-bold text-white focus:outline-none border-b border-transparent focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">g</span>
              </div>
            </div>

            {/* Carbs */}
            <div className="p-4 flex justify-between items-center group hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">🍚</div>
                <span className="font-medium text-zinc-200">Carboidratos</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <input 
                  type="number" 
                  value={formData.goals?.carbs}
                  onChange={(e) => handleGoalChange('carbs', e.target.value)}
                  className="w-12 bg-transparent text-right font-bold text-white focus:outline-none border-b border-transparent focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">g</span>
              </div>
            </div>

             {/* Fat */}
             <div className="p-4 flex justify-between items-center group hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">🥑</div>
                <span className="font-medium text-zinc-200">Gorduras</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <input 
                  type="number" 
                  value={formData.goals?.fat}
                  onChange={(e) => handleGoalChange('fat', e.target.value)}
                  className="w-12 bg-transparent text-right font-bold text-white focus:outline-none border-b border-transparent focus:border-zinc-500"
                />
                <span className="text-xs text-zinc-500">g</span>
              </div>
            </div>

          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-3 pt-6">
          <button 
            type="button"
            onClick={handleClearHistoryClick}
            className={`w-full p-4 border rounded-3xl text-left font-medium transition-all flex justify-between items-center active:scale-[0.98] ${
              confirmClear 
              ? 'bg-red-500 border-red-500 text-white' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {confirmClear ? "Toque novamente para confirmar" : "Limpar Histórico de Refeições"}
          </button>
          
          <button 
            type="button"
            onClick={handleLogoutClick}
            className={`w-full p-4 border rounded-3xl text-left font-bold transition-all flex justify-between items-center active:scale-[0.98] ${
              confirmLogout
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
            }`}
          >
             {confirmLogout ? "Tem certeza? Toque para sair" : "Sair da Conta"}
          </button>
        </section>

        <div className="text-center text-zinc-700 text-xs py-4">
            ID: {user.id} • v1.3.1
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;