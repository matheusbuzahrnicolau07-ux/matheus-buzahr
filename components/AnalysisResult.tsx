import React, { useState, useEffect } from 'react';
import { NutritionData } from '../types';
import { SaveIcon, ChevronLeftIcon, FireIcon, PencilIcon, SparklesIcon } from './Icons';

interface AnalysisResultProps {
  data: NutritionData;
  imageUrl: string;
  onSave: (data: NutritionData) => void;
  onCancel: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, imageUrl, onSave, onCancel }) => {
  const [editableData, setEditableData] = useState<NutritionData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [portionMultiplier, setPortionMultiplier] = useState(1);

  // Update editable data when multiplier changes
  useEffect(() => {
    if (portionMultiplier !== 1) {
      setEditableData(prev => ({
        ...prev,
        weightGrams: Math.round(data.weightGrams * portionMultiplier),
        calories: Math.round(data.calories * portionMultiplier),
        carbs: Math.round(data.carbs * portionMultiplier),
        protein: Math.round(data.protein * portionMultiplier),
        fat: Math.round(data.fat * portionMultiplier),
      }));
    } else {
        // Reset to original if 1x
        setEditableData(prev => ({
            ...prev,
            weightGrams: data.weightGrams,
            calories: data.calories,
            carbs: data.carbs,
            protein: data.protein,
            fat: data.fat,
        }));
    }
  }, [portionMultiplier, data]);

  const handleInputChange = (field: keyof NutritionData, value: string) => {
    const numValue = field === 'foodName' ? value : parseFloat(value) || 0;
    setEditableData(prev => ({ ...prev, [field]: numValue }));
    // If manual edit happens, we reset multiplier visual state to avoid confusion, 
    // although technically we are editing the base. For simplicity, just let user edit.
  };

  const handleSave = () => {
    onSave(editableData);
  };

  const portions = [0.5, 1, 1.5, 2];

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-y-auto pb-24 no-scrollbar">
       
      {/* Header Image Area */}
      <div className="relative h-72 w-full shrink-0">
        <img src={imageUrl} alt="Food" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-zinc-950"></div>
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 no-print">
            <button 
                onClick={onCancel} 
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
                 <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                    <SparklesIcon className="w-5 h-5 text-emerald-400" />
                 </button>
            </div>
        </div>
      </div>

      {/* Content Body - Overlapping Image */}
      <div className="px-5 -mt-12 relative z-20 space-y-6">
        
        {/* Title and Edit Row */}
        <div>
            <div className="flex justify-between items-start">
                 {isEditing ? (
                    <input
                      type="text"
                      value={editableData.foodName as string}
                      onChange={(e) => handleInputChange('foodName', e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold border-b border-zinc-700 focus:border-white focus:outline-none text-white"
                      placeholder="Nome do alimento"
                    />
                 ) : (
                    <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">{editableData.foodName}</h1>
                 )}
                 <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="flex items-center gap-2 bg-zinc-800 rounded-full px-4 py-2 text-sm font-medium text-white border border-zinc-700 ml-4 shrink-0"
                 >
                    {isEditing ? 'Cancelar' : (
                        <>
                            {editableData.weightGrams}g
                            <PencilIcon className="w-3 h-3" />
                        </>
                    )}
                 </button>
            </div>
            <div className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
                 <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 {editableData.confidence < 70 && (
                     <span className="text-orange-400 text-xs flex items-center gap-1">• Baixa confiança</span>
                 )}
            </div>
        </div>

        {/* Portion Control - NEW FEATURE */}
        <div className="bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 pl-2">Porção:</span>
            <div className="flex gap-1">
                {portions.map((p) => (
                    <button
                        key={p}
                        onClick={() => setPortionMultiplier(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            portionMultiplier === p 
                            ? 'bg-white text-black shadow-lg' 
                            : 'text-zinc-400 hover:bg-zinc-800'
                        }`}
                    >
                        {p}x
                    </button>
                ))}
            </div>
        </div>

        {/* Calories Main Display */}
        <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
             <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                 <FireIcon className="w-6 h-6 text-orange-500" />
             </div>
             <div>
                 <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-0.5">Calorias</p>
                 <div className="flex items-baseline gap-1">
                      {isEditing ? (
                         <input
                             type="number"
                             value={editableData.calories}
                             onChange={(e) => handleInputChange('calories', e.target.value)}
                             className="w-24 bg-transparent text-4xl font-extrabold text-white border-b border-zinc-700 focus:outline-none"
                         />
                      ) : (
                         <span className="text-4xl font-extrabold text-white">{Math.round(editableData.calories)}</span>
                      )}
                 </div>
             </div>
        </div>

        {/* Macros Row */}
        <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className="text-2xl">🥩</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                     <span className="text-xs font-semibold text-zinc-400">Proteína</span>
                </div>
                <div className="flex items-baseline gap-1">
                    {isEditing ? (
                         <input
                             type="number"
                             value={editableData.protein}
                             onChange={(e) => handleInputChange('protein', e.target.value)}
                             className="w-12 bg-transparent text-xl font-bold text-white border-b border-zinc-700 focus:outline-none"
                         />
                    ) : (
                        <span className="text-2xl font-bold text-white">{Math.round(editableData.protein)}</span>
                    )}
                    <span className="text-xs text-zinc-500 font-medium">g</span>
                </div>
            </div>

            {/* Carbs */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className="text-2xl">🍚</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     <span className="text-xs font-semibold text-zinc-400">Carbo</span>
                </div>
                <div className="flex items-baseline gap-1">
                    {isEditing ? (
                         <input
                             type="number"
                             value={editableData.carbs}
                             onChange={(e) => handleInputChange('carbs', e.target.value)}
                             className="w-12 bg-transparent text-xl font-bold text-white border-b border-zinc-700 focus:outline-none"
                         />
                    ) : (
                        <span className="text-2xl font-bold text-white">{Math.round(editableData.carbs)}</span>
                    )}
                    <span className="text-xs text-zinc-500 font-medium">g</span>
                </div>
            </div>

            {/* Fat */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className="text-2xl">🥑</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                     <span className="text-xs font-semibold text-zinc-400">Gordura</span>
                </div>
                <div className="flex items-baseline gap-1">
                    {isEditing ? (
                         <input
                             type="number"
                             value={editableData.fat}
                             onChange={(e) => handleInputChange('fat', e.target.value)}
                             className="w-12 bg-transparent text-xl font-bold text-white border-b border-zinc-700 focus:outline-none"
                         />
                    ) : (
                        <span className="text-2xl font-bold text-white">{Math.round(editableData.fat)}</span>
                    )}
                    <span className="text-xs text-zinc-500 font-medium">g</span>
                </div>
            </div>
        </div>

        {/* Health Score */}
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                     <span className="text-lg">💖</span>
                 </div>
                 <span className="font-semibold text-zinc-200">Health Score</span>
            </div>
            <div className="flex flex-col items-end">
                 <span className="text-xl font-bold text-white">{editableData.healthScore || '-'}/10</span>
                 <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                     <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" 
                        style={{ width: `${(editableData.healthScore || 0) * 10}%` }}
                     ></div>
                 </div>
            </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-3">
            <h3 className="font-bold text-white text-lg">Ingredientes</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                 {editableData.ingredients && editableData.ingredients.length > 0 ? (
                     editableData.ingredients.map((ing, i) => (
                        <div key={i} className="min-w-[100px] bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
                             <img 
                                src={`https://tse2.mm.bing.net/th?q=${encodeURIComponent(ing)}&w=120&h=120&c=7&rs=1&p=0`} 
                                alt={ing} 
                                className="w-12 h-12 rounded-full object-cover mb-2 bg-zinc-800"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://placehold.co/100x100/27272a/a1a1aa?text=${ing.substring(0, 1).toUpperCase()}`;
                                }}
                             />
                             <span className="text-xs font-medium text-zinc-300 line-clamp-2">{ing}</span>
                        </div>
                     ))
                 ) : (
                    <div className="text-zinc-500 text-sm italic">Nenhum ingrediente listado.</div>
                 )}
            </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 z-50 no-print">
            <div className="max-w-md mx-auto flex gap-3">
                 <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex-1 py-4 px-4 bg-white text-black rounded-full font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-4 h-4" />
                    Corrigir
                </button>
                <button
                    onClick={handleSave}
                    className="flex-[2] py-4 px-4 bg-black border border-zinc-800 text-white rounded-full font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <SaveIcon className="w-5 h-5" />
                    Concluir
                </button>
            </div>
      </div>
    </div>
  );
};

export default AnalysisResult;