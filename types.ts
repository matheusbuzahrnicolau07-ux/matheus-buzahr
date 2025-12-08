
export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type WorkoutGoal = 'hypertrophy' | 'weight_loss' | 'strength' | 'endurance' | 'mobility';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutLocation = 'gym' | 'home_equipment' | 'home_bodyweight';

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  tips?: string;
}

export interface WorkoutDay {
  dayName: string; // ex: "Treino A - Peito e Tríceps"
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  title: string;
  description: string;
  days: WorkoutDay[];
  generatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  weight?: number; // kg
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  goals?: UserGoals;
  
  // Workout Specifics
  workoutGoal?: WorkoutGoal;
  experienceLevel?: ExperienceLevel;
  workoutLocation?: WorkoutLocation;
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
}

export type AppView = 'welcome' | 'login' | 'onboarding' | 'home' | 'camera' | 'result' | 'history' | 'progress' | 'settings' | 'workouts';

export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}
