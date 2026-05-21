import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Fast path: read cached session from localStorage — no network round-trip.
    // This eliminates the spinner on repeat visits.
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false, initialized: true })

    // Live updates (token refresh, sign-out from another tab, OAuth redirect).
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
        return
      }
      if (newSession?.user && newSession.user.id !== get().user?.id) {
        set({ user: newSession.user })
        await get().fetchProfile(newSession.user.id)
      }
    })
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('id,full_name,email,role,avatar_url,created_at')
      .eq('id', userId)
      .single()
    if (data) set({ user: data, profile: data })
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  isAdmin: () => {
    const role = get().profile?.role
    return role === 'admin' || role === 'super_admin'
  },

  isSuperAdmin: () => get().profile?.role === 'super_admin',
}))
