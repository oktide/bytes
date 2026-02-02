import { createContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  active_household_id: string | null
  created_at: string
}

export interface Household {
  id: string
  name: string
  family_size: number
  weekly_budget: number
  created_at: string
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  activeHousehold: Household | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  switchHousehold: (householdId: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeHousehold, setActiveHousehold] = useState<Household | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data as Profile
  }

  const fetchHousehold = async (householdId: string) => {
    const { data, error } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single()

    if (error) {
      console.error('Error fetching household:', error)
      return null
    }
    return data as Household
  }

  const loadUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      setActiveHousehold(null)
      return
    }

    const userProfile = await fetchProfile(currentUser.id)
    setProfile(userProfile)

    if (userProfile?.active_household_id) {
      const household = await fetchHousehold(userProfile.active_household_id)
      setActiveHousehold(household)
    } else {
      setActiveHousehold(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      loadUserData(session?.user ?? null).finally(() => setIsLoading(false))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      loadUserData(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
    setActiveHousehold(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user)
    }
  }

  const switchHousehold = async (householdId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ active_household_id: householdId })
      .eq('id', user.id)

    if (error) throw error

    const household = await fetchHousehold(householdId)
    setActiveHousehold(household)

    if (profile) {
      setProfile({ ...profile, active_household_id: householdId })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        activeHousehold,
        isLoading,
        signInWithGoogle,
        signInWithMagicLink,
        signOut,
        refreshProfile,
        switchHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
