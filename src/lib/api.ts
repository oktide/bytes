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
  household_id: string | null
  created_by: string | null
  plan: MealPlan
}

export interface GenerateMealPlanParams {
  familySize: number
  weeklyBudget: number
  dietaryNotes?: string
  likedMeals?: string[]
  dislikedMeals?: string[]
}

export interface Household {
  id: string
  name: string
  family_size: number
  weekly_budget: number
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface HouseholdInvitation {
  id: string
  household_id: string
  email: string
  invited_by: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  expires_at: string
}

export interface MealPreference {
  id: string
  household_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  meal_description: string
  preference: 'liked' | 'disliked'
  created_by: string | null
  created_at: string
}

export async function generateMealPlan(params: GenerateMealPlanParams): Promise<MealPlan> {
  const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
    body: {
      familySize: params.familySize,
      weeklyBudget: params.weeklyBudget,
      dietaryNotes: params.dietaryNotes,
      likedMeals: params.likedMeals,
      dislikedMeals: params.dislikedMeals,
    },
  })

  if (error) {
    throw new Error(error.message || 'Failed to generate meal plan')
  }

  return data as MealPlan
}

export async function saveMealPlan(
  plan: MealPlan,
  householdId: string,
  userId: string
): Promise<SavedMealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      family_size: plan.familySize,
      weekly_budget: plan.weeklyBudget,
      plan: plan,
      household_id: householdId,
      created_by: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to save meal plan')
  }

  return data as SavedMealPlan
}

export async function loadHistory(householdId: string): Promise<SavedMealPlan[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('household_id', householdId)
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

// Household API functions

export async function getUserHouseholds(): Promise<Household[]> {
  const { data, error } = await supabase
    .from('household_members')
    .select('household:households(*)')
    .order('joined_at', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Failed to load households')
  }

  return (data || []).map((item) => item.household as unknown as Household)
}

export async function getHousehold(householdId: string): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('id', householdId)
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to load household')
  }

  return data as Household
}

export async function updateHousehold(
  householdId: string,
  updates: { name?: string; family_size?: number; weekly_budget?: number }
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update(updates)
    .eq('id', householdId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update household')
  }

  return data as Household
}

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data, error } = await supabase
    .from('household_members')
    .select(`
      *,
      profile:profiles(display_name, avatar_url)
    `)
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Failed to load household members')
  }

  return (data || []) as HouseholdMember[]
}

export async function removeHouseholdMember(
  householdId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message || 'Failed to remove member')
  }
}

// Invitation API functions

export async function getHouseholdInvitations(householdId: string): Promise<HouseholdInvitation[]> {
  const { data, error } = await supabase
    .from('household_invitations')
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load invitations')
  }

  return (data || []) as HouseholdInvitation[]
}

export async function getPendingInvitationsForUser(): Promise<
  (HouseholdInvitation & { household: Household })[]
> {
  const { data, error } = await supabase
    .from('household_invitations')
    .select('*, household:households(*)')
    .eq('status', 'pending')

  if (error) {
    throw new Error(error.message || 'Failed to load invitations')
  }

  return (data || []) as (HouseholdInvitation & { household: Household })[]
}

export async function createInvitation(
  householdId: string,
  email: string,
  invitedBy: string
): Promise<HouseholdInvitation> {
  const { data, error } = await supabase
    .from('household_invitations')
    .insert({
      household_id: householdId,
      email: email.toLowerCase(),
      invited_by: invitedBy,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create invitation')
  }

  return data as HouseholdInvitation
}

export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  // Get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('household_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (fetchError || !invitation) {
    throw new Error('Invitation not found')
  }

  // Add user to household
  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: invitation.household_id,
    user_id: userId,
    role: 'member',
  })

  if (memberError) {
    throw new Error(memberError.message || 'Failed to join household')
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('household_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)

  if (updateError) {
    throw new Error(updateError.message || 'Failed to update invitation')
  }
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('household_invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId)

  if (error) {
    throw new Error(error.message || 'Failed to decline invitation')
  }
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('household_invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    throw new Error(error.message || 'Failed to cancel invitation')
  }
}

// Meal Preferences API functions

export async function getMealPreferences(householdId: string): Promise<MealPreference[]> {
  const { data, error } = await supabase
    .from('meal_preferences')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Failed to load meal preferences')
  }

  return (data || []) as MealPreference[]
}

export async function addMealPreference(
  householdId: string,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  mealDescription: string,
  preference: 'liked' | 'disliked',
  createdBy: string
): Promise<MealPreference> {
  const { data, error } = await supabase
    .from('meal_preferences')
    .upsert(
      {
        household_id: householdId,
        meal_type: mealType,
        meal_description: mealDescription,
        preference: preference,
        created_by: createdBy,
      },
      { onConflict: 'household_id,meal_type,meal_description' }
    )
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to add meal preference')
  }

  return data as MealPreference
}

export async function removeMealPreference(preferenceId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_preferences')
    .delete()
    .eq('id', preferenceId)

  if (error) {
    throw new Error(error.message || 'Failed to remove meal preference')
  }
}
