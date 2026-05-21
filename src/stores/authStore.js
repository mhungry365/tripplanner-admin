import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null, profile: null })
      }
      if (!get().initialized) {
        set({ loading: false, initialized: true })
      }
    })
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
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
