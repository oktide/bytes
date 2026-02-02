import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  generateMealPlan,
  saveMealPlan,
  loadHistory,
  deleteMealPlan,
  MealPlan,
  GenerateMealPlanParams,
} from '../lib/api'

export function useMealPlanner() {
  const queryClient = useQueryClient()
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null)

  const historyQuery = useQuery({
    queryKey: ['mealPlanHistory'],
    queryFn: loadHistory,
  })

  const generateMutation = useMutation({
    mutationFn: generateMealPlan,
    onSuccess: (data) => {
      setCurrentPlan(data)
    },
  })

  const saveMutation = useMutation({
    mutationFn: saveMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanHistory'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanHistory'] })
    },
  })

  const generate = (params: GenerateMealPlanParams) => {
    generateMutation.mutate(params)
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
