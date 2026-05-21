import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [view, setView] = useState('login') // 'login' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(false)
      setError('Something went wrong, please try again.')
    }, 10000)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      clearTimeout(timeout)

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Role check happens in the dashboard/ProtectedRoute
      window.location.href = '/dashboard'
    } catch (err) {
      clearTimeout(timeout)
      setError('Something went wrong, please try again.')
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Enter your email address'); return }
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://tripplanner-admin.vercel.app/reset-password',
    })
    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    toast.success('Password reset email sent — check your inbox')
    setView('login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TripPlanner</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {view === 'login' ? (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Sign in</h2>
              <p className="text-slate-400 text-sm mb-6">Admin access only</p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <button
                onClick={() => { setView('forgot'); setError('') }}
                className="w-full text-center text-xs text-orange-500 hover:text-orange-600 font-medium mt-4 transition-colors"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setView('login'); setError('') }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-4 transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Reset password</h2>
              <p className="text-slate-400 text-sm mb-6">We'll email you a reset link</p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    required
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Restricted to administrators only
          </p>
        </div>
      </div>
    </div>
  )
}
