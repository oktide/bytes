import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMealPreferences,
  addMealPreference,
  removeMealPreference,
  MealPreference,
} from '../lib/api'
import { useAuth } from './useAuth'

export function useMealPreferences() {
  const queryClient = useQueryClient()
  const { user, activeHousehold } = useAuth()

  const preferencesQuery = useQuery({
    queryKey: ['mealPreferences', activeHousehold?.id],
    queryFn: () => getMealPreferences(activeHousehold!.id),
    enabled: !!activeHousehold,
  })

  const addPreferenceMutation = useMutation({
    mutationFn: ({
      mealType,
      mealDescription,
      preference,
    }: {
      mealType: 'breakfast' | 'lunch' | 'dinner'
      mealDescription: string
      preference: 'liked' | 'disliked'
    }) =>
      addMealPreference(
        activeHousehold!.id,
        mealType,
        mealDescription,
        preference,
        user!.id
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPreferences', activeHousehold?.id] })
    },
  })

  const removePreferenceMutation = useMutation({
    mutationFn: removeMealPreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPreferences', activeHousehold?.id] })
    },
  })

  const preferences = preferencesQuery.data || []

  const likedMeals = preferences
    .filter((p) => p.preference === 'liked')
    .map((p) => p.meal_description)

  const dislikedMeals = preferences
    .filter((p) => p.preference === 'disliked')
    .map((p) => p.meal_description)

  const getPreferenceForMeal = (
    mealType: 'breakfast' | 'lunch' | 'dinner',
    mealDescription: string
  ): MealPreference | undefined => {
    return preferences.find(
      (p) => p.meal_type === mealType && p.meal_description === mealDescription
    )
  }

  return {
    preferences,
    likedMeals,
    dislikedMeals,
    isLoading: preferencesQuery.isLoading,

    addPreference: (
      mealType: 'breakfast' | 'lunch' | 'dinner',
      mealDescription: string,
      preference: 'liked' | 'disliked'
    ) => addPreferenceMutation.mutateAsync({ mealType, mealDescription, preference }),

    removePreference: (preferenceId: string) => removePreferenceMutation.mutateAsync(preferenceId),

    getPreferenceForMeal,

    isAddingPreference: addPreferenceMutation.isPending,
    isRemovingPreference: removePreferenceMutation.isPending,
  }
}
