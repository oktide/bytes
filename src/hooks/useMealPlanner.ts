import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  generateMealPlan,
  getMealPlanForWeek,
  saveMealPlanForWeek,
  loadHistory,
  MealPlan,
} from '../lib/api'
import { useAuth } from './useAuth'
import { useMealPreferences } from './useMealPreferences'
import {
  getWeekStartDate,
  getNextWeek,
  getPreviousWeek,
  isCurrentWeek as checkIsCurrentWeek,
  toWeekString,
  parseWeekString,
} from '../lib/dateUtils'

export function useMealPlanner() {
  const queryClient = useQueryClient()
  const { user, activeHousehold } = useAuth()
  const { likedMeals, dislikedMeals } = useMealPreferences()

  const [selectedWeek, setSelectedWeek] = useState<Date>(() => getWeekStartDate())

  const weekString = toWeekString(selectedWeek)
  const householdId = activeHousehold?.id

  const weekPlanQuery = useQuery({
    queryKey: ['mealPlan', householdId, weekString],
    queryFn: () => getMealPlanForWeek(householdId!, weekString),
    enabled: !!householdId,
  })

  const historyQuery = useQuery({
    queryKey: ['mealPlanHistory', householdId],
    queryFn: () => loadHistory(householdId!),
    enabled: !!householdId,
  })

  const saveMutation = useMutation({
    mutationFn: (plan: MealPlan) => {
      if (!householdId || !user) {
        throw new Error('Must be logged in to save meal plans')
      }
      return saveMealPlanForWeek(plan, householdId, user.id, weekString)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlan', householdId, weekString] })
      queryClient.invalidateQueries({ queryKey: ['mealPlanHistory', householdId] })
    },
  })

  const generateMutation = useMutation({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      // Auto-save the generated plan for the selected week
      saveMutation.mutate(data)
    },
  })

  const generate = useCallback((params: { familySize: number; weeklyBudget: number; dietaryNotes?: string }) => {
    generateMutation.mutate({
      ...params,
      likedMeals: likedMeals.length > 0 ? likedMeals : undefined,
      dislikedMeals: dislikedMeals.length > 0 ? dislikedMeals : undefined,
    })
  }, [generateMutation, likedMeals, dislikedMeals])

  const navigateToNextWeek = useCallback(() => {
    setSelectedWeek(prev => getNextWeek(prev))
  }, [])

  const navigateToPreviousWeek = useCallback(() => {
    setSelectedWeek(prev => getPreviousWeek(prev))
  }, [])

  const navigateToCurrentWeek = useCallback(() => {
    setSelectedWeek(getWeekStartDate())
  }, [])

  const navigateToWeek = useCallback((weekStartDate: string) => {
    setSelectedWeek(parseWeekString(weekStartDate))
  }, [])

  // Derive current plan from query data
  const currentPlan = weekPlanQuery.data?.plan ?? null
  const isCurrentWeek = checkIsCurrentWeek(selectedWeek)
  const hasExistingPlan = !!weekPlanQuery.data

  return {
    currentPlan,
    selectedWeek,
    isCurrentWeek,
    hasExistingPlan,
    history: historyQuery.data || [],
    isLoading: weekPlanQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending,
    generateError: generateMutation.error,
    saveError: saveMutation.error,
    generate,
    navigateToNextWeek,
    navigateToPreviousWeek,
    navigateToCurrentWeek,
    navigateToWeek,
  }
}
