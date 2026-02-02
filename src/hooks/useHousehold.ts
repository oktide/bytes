import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUserHouseholds,
  getHouseholdMembers,
  getHouseholdInvitations,
  getPendingInvitationsForUser,
  updateHousehold,
  removeHouseholdMember,
  createInvitation,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
} from '../lib/api'
import { useAuth } from './useAuth'

export function useHousehold() {
  const queryClient = useQueryClient()
  const { user, activeHousehold, switchHousehold, refreshProfile } = useAuth()

  const householdsQuery = useQuery({
    queryKey: ['households', user?.id],
    queryFn: getUserHouseholds,
    enabled: !!user,
  })

  const membersQuery = useQuery({
    queryKey: ['householdMembers', activeHousehold?.id],
    queryFn: () => getHouseholdMembers(activeHousehold!.id),
    enabled: !!activeHousehold,
  })

  const invitationsQuery = useQuery({
    queryKey: ['householdInvitations', activeHousehold?.id],
    queryFn: () => getHouseholdInvitations(activeHousehold!.id),
    enabled: !!activeHousehold,
    retry: false,
  })

  const pendingInvitationsQuery = useQuery({
    queryKey: ['pendingInvitations', user?.id],
    queryFn: getPendingInvitationsForUser,
    enabled: !!user,
    retry: false,
  })

  const updateHouseholdMutation = useMutation({
    mutationFn: ({ householdId, updates }: { householdId: string; updates: { name?: string } }) =>
      updateHousehold(householdId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] })
      refreshProfile()
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ householdId, userId }: { householdId: string; userId: string }) =>
      removeHouseholdMember(householdId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] })
    },
  })

  const inviteMemberMutation = useMutation({
    mutationFn: ({
      householdId,
      email,
      invitedBy,
    }: {
      householdId: string
      email: string
      invitedBy: string
    }) => createInvitation(householdId, email, invitedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdInvitations'] })
    },
  })

  const acceptInvitationMutation = useMutation({
    mutationFn: ({ invitationId, userId }: { invitationId: string; userId: string }) =>
      acceptInvitation(invitationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] })
      queryClient.invalidateQueries({ queryKey: ['households'] })
    },
  })

  const declineInvitationMutation = useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvitations'] })
    },
  })

  const cancelInvitationMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdInvitations'] })
    },
  })

  return {
    // Data
    households: householdsQuery.data || [],
    members: membersQuery.data || [],
    invitations: invitationsQuery.data || [],
    pendingInvitations: pendingInvitationsQuery.data || [],
    activeHousehold,

    // Loading states
    isLoadingHouseholds: householdsQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,
    isLoadingInvitations: invitationsQuery.isLoading,

    // Actions
    switchHousehold,
    updateHousehold: (householdId: string, updates: { name?: string; family_size?: number; weekly_budget?: number }) =>
      updateHouseholdMutation.mutateAsync({ householdId, updates }),
    removeMember: (householdId: string, userId: string) =>
      removeMemberMutation.mutateAsync({ householdId, userId }),
    inviteMember: (householdId: string, email: string, invitedBy: string) =>
      inviteMemberMutation.mutateAsync({ householdId, email, invitedBy }),
    acceptInvitation: (invitationId: string, userId: string) =>
      acceptInvitationMutation.mutateAsync({ invitationId, userId }),
    declineInvitation: (invitationId: string) => declineInvitationMutation.mutateAsync(invitationId),
    cancelInvitation: (invitationId: string) => cancelInvitationMutation.mutateAsync(invitationId),

    // Mutation states
    isUpdating: updateHouseholdMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isInviting: inviteMemberMutation.isPending,
  }
}
