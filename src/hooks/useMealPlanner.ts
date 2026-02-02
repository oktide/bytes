import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  generateMealPlan,
  saveMealPlan,
  loadHistory,
  deleteMealPlan,
  MealPlan,
} from '../lib/api'
import { useAuth } from './useAuth'
import { useMealPreferences } from './useMealPreferences'

export function useMealPlanner() {
  const queryClient = useQueryClient()
  const { user, activeHousehold } = useAuth()
  const { likedMeals, dislikedMeals } = useMealPreferences()
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null)

  const historyQuery = useQuery({
    queryKey: ['mealPlanHistory', activeHousehold?.id],
    queryFn: () => loadHistory(activeHousehold!.id),
    enabled: !!activeHousehold,
  })

  const generateMutation = useMutation({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      setCurrentPlan(data)
    },
  })

  const saveMutation = useMutation({
    mutationFn: (plan: MealPlan) => {
      if (!activeHousehold || !user) {
        throw new Error('Must be logged in to save meal plans')
      }
      return saveMealPlan(plan, activeHousehold.id, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanHistory', activeHousehold?.id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanHistory', activeHousehold?.id] })
    },
  })

  const generate = (params: { familySize: number; weeklyBudget: number; dietaryNotes?: string }) => {
    generateMutation.mutate({
      ...params,
      likedMeals: likedMeals.length > 0 ? likedMeals : undefined,
      dislikedMeals: dislikedMeals.length > 0 ? dislikedMeals : undefined,
    })
  }

  const save = () => {
    if (currentPlan) {
      saveMutation.mutate(currentPlan)
    }
  }

  const loadPlan = (plan: MealPlan) => {
    setCurrentPlan(plan)
  }

  const clearPlan = () => {
    setCurrentPlan(null)
  }

  const removePlan = (id: string) => {
    deleteMutation.mutate(id)
  }

  return {
    currentPlan,
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    isGenerating: generateMutation.isPending,
    isSaving: saveMutation.isPending,
    generateError: generateMutation.error,
    saveError: saveMutation.error,
    generate,
    save,
    loadPlan,
    clearPlan,
    removePlan,
  }
}
