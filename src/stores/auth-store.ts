import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, UserRole } from '@/types/database'
import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from '@/lib/supabase'
import { DEMO_PROFILE } from './demo-data'

interface AuthState {
  profile: Profile | null
  loading: boolean
  demoMode: boolean
  initialized: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: {
    email: string
    password: string
    full_name: string
    phone: string
    city: string
    company_name?: string
  }) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  enterDemo: () => void
  setRoleLocal: (role: UserRole) => void
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      loading: false,
      demoMode: !isSupabaseConfigured,
      initialized: false,

      init: async () => {
        if (get().initialized) return
        if (!isSupabaseConfigured) {
          set({ demoMode: true, profile: DEMO_PROFILE, initialized: true, loading: false })
          return
        }
        set({ loading: true })
        try {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user) {
            const profile = await fetchProfile(data.session.user.id)
            set({ profile, demoMode: false })
          }
          supabase.auth.onAuthStateChange((_event, session) => {
            void (async () => {
              if (!session?.user) {
                set({ profile: null })
                return
              }
              const profile = await fetchProfile(session.user.id)
              set({ profile, demoMode: false })
            })()
          })
        } finally {
          set({ initialized: true, loading: false })
        }
      },

      signIn: async (email, password) => {
        set({ loading: true })
        try {
          if (!isSupabaseConfigured) {
            set({ profile: { ...DEMO_PROFILE, email }, demoMode: true })
            return
          }
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          const { data } = await supabase.auth.getUser()
          if (data.user) {
            const profile = await fetchProfile(data.user.id)
            set({ profile, demoMode: false })
          }
        } catch (e) {
          throw new Error(getSupabaseErrorMessage(e))
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (payload) => {
        set({ loading: true })
        try {
          if (!isSupabaseConfigured) {
            set({
              profile: {
                ...DEMO_PROFILE,
                email: payload.email,
                full_name: payload.full_name,
                phone: payload.phone,
                city: payload.city,
                company_name: payload.company_name ?? null,
              },
              demoMode: true,
            })
            return
          }
          const { error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              data: {
                full_name: payload.full_name,
                phone: payload.phone,
                city: payload.city,
                company_name: payload.company_name ?? null,
                role: 'electrician',
              },
            },
          })
          if (error) throw error
        } catch (e) {
          throw new Error(getSupabaseErrorMessage(e))
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email) => {
        if (!isSupabaseConfigured) return
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw new Error(getSupabaseErrorMessage(error))
      },

      signOut: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut()
        set({ profile: null, demoMode: !isSupabaseConfigured })
        if (!isSupabaseConfigured) set({ profile: DEMO_PROFILE, demoMode: true })
      },

      enterDemo: () => set({ profile: DEMO_PROFILE, demoMode: true }),

      setRoleLocal: (role) => {
        const profile = get().profile
        if (profile) set({ profile: { ...profile, role } })
      },
    }),
    {
      name: 'simchi-auth',
      partialize: (s) => ({ demoMode: s.demoMode, profile: s.demoMode ? s.profile : null }),
    },
  ),
)
