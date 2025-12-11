
export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // ml
}

// Simplified Goal Structure for Nutrition Focus
export type WeightGoal = 'lose_weight' | 'maintain' | 'gain_muscle';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  tips?: string;
}

export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  days: WorkoutDay[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  
  // Body Stats
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: ActivityLevel;
  
  // Goals
  goals?: UserGoals;
  weightGoal?: WeightGoal;

  // Workout
  workoutGoal?: string;
  experienceLevel?: string;
  daysPerWeek?: number;
  workoutPlan?: WorkoutPlan;
}

export interface NutritionData {
  foodName: string;
  weightGrams: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  confidence: number; // 0-100
  healthScore?: number; // 0-10
  ingredients?: string[];
  insights?: string[];
}

export interface AnalysisRecord extends NutritionData {
  id: string;
  imageUrl: string;
  timestamp: number;
  userId: string;
  mealType?: MealType;
}

export type AppView = 'welcome' | 'login' | 'onboarding' | 'home' | 'camera' | 'result' | 'history' | 'progress' | 'settings' | 'workout';

export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}
