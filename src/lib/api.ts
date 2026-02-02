import { supabase } from './supabase'

export interface MealDay {
  day: string
  breakfast: string
  lunch: string
  dinner: string
  dinnerCost: string
}

export interface GroceryItem {
  item: string
  price: string
}

export interface MealPlan {
  familySize: number
  weeklyBudget: number
  estimatedWeeklyTotal: string
  days: MealDay[]
  groceries: Record<string, GroceryItem[]>
}

export interface SavedMealPlan {
  id: string
  created_at: string
  family_size: number
  weekly_budget: number
  plan: MealPlan
}

export interface GenerateMealPlanParams {
  familySize: number
  weeklyBudget: number
  dietaryNotes?: string
}

export async function generateMealPlan(params: GenerateMealPlanParams): Promise<MealPlan> {
  const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
    body: params,
  })

  if (error) {
    throw new Error(error.message || 'Failed to generate meal plan')
  }

  return data as MealPlan
}

export async function saveMealPlan(plan: MealPlan): Promise<SavedMealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      family_size: plan.familySize,
      weekly_budget: plan.weeklyBudget,
      plan: plan,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to save meal plan')
  }

  return data as SavedMealPlan
}

export async function loadHistory(): Promise<SavedMealPlan[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load history')
  }

  return (data || []) as SavedMealPlan[]
}

export async function deleteMealPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message || 'Failed to delete meal plan')
  }
}
