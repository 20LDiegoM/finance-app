'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Timing constants ─────────────────────────────────────────
const INTRO_EXIT_MS  = 2600   // cuando empieza a salir
const INTRO_DONE_MS  = 3150   // cuando se remueve y aparece el form

export default function Login() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // 'in' → animaciones jugando | 'out' → saliendo | 'done' → form visible
  const [introPhase, setIntroPhase] = useState('in')

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase('out'),  INTRO_EXIT_MS)
    const t2 = setTimeout(() => setIntroPhase('done'), INTRO_DONE_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const skipIntro = () => setIntroPhase('done')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) { setError(error.message); setLoading(false); return }
      setResetSent(true)
      setLoading(false)
      return
    }

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (isSignUp) {
      setSuccess(true)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 relative overflow-hidden">

      {/* ── Intro splash overlay ─────────────────────────────── */}
      {introPhase !== 'done' && (
        <div
          onClick={skipIntro}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg cursor-pointer select-none${introPhase === 'out' ? ' intro-exit' : ''}`}
        >
          {/* Ambient glow behind mark */}
          <div
            className="intro-glow absolute rounded-full pointer-events-none"
            style={{
              width: 260, height: 260,
              background: 'radial-gradient(circle, rgba(200,168,75,0.14) 0%, transparent 70%)',
            }}
          />

          {/* KOLŌN animated mark ─ 96×96 */}
          <div className="relative z-10">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              style={{ width: 96, height: 96 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circle — draws itself */}
              <circle
                className="intro-circle"
                cx="32" cy="32" r="31"
                fill="var(--c-gold-dim)"
                stroke="var(--c-gold)"
                strokeWidth="1.4"
                strokeOpacity="0.5"
              />
              {/* Vertical bar */}
              <rect
                className="intro-bar-v"
                x="30.5" y="15" width="3" height="34" rx="1.5"
                fill="var(--c-gold)"
              />
              {/* Top horizontal */}
              <rect
                className="intro-bar-h1"
                x="18" y="25.5" width="28" height="3" rx="1.5"
                fill="var(--c-gold)"
              />
              {/* Bottom horizontal */}
              <rect
                className="intro-bar-h2"
                x="18" y="35.5" width="28" height="3" rx="1.5"
                fill="var(--c-gold)"
                opacity="0.55"
              />
            </svg>
          </div>

          {/* KOLŌN wordmark */}
          <div
            className="intro-word relative z-10 mt-7 font-extrabold text-app-text uppercase"
            style={{ fontSize: '1.5rem' }}
          >
            KOLŌN
          </div>

          {/* Tagline */}
          <p className="intro-tagline relative z-10 mt-3 text-xs text-app-text-2 tracking-widest">
            Tu dinero, bajo control
          </p>

          {/* Skip hint */}
          <p className="intro-hint absolute bottom-12 text-[10px] text-app-text-3 tracking-widest uppercase">
            Toca para continuar
          </p>
        </div>
      )}

      {/* ── Login form (se revela al terminar intro) ─────────── */}
      {introPhase === 'done' && (
        <div
          className="w-full max-w-sm relative"
          style={{ animation: 'fade-in 0.45s ease-out both' }}
        >
          {/* Background radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(200,168,75,0.07) 0%, transparent 70%)' }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-transparent via-app-gold/20 to-transparent" />

          {/* Logo (estático una vez que el form aparece) */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-5">
              <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="31" fill="var(--c-gold-dim)" stroke="var(--c-gold)" strokeWidth="1.2" strokeOpacity="0.4"/>
                <rect x="30.5" y="15" width="3" height="34" rx="1.5" fill="var(--c-gold)"/>
                <rect x="18" y="25.5" width="28" height="3" rx="1.5" fill="var(--c-gold)"/>
                <rect x="18" y="35.5" width="28" height="3" rx="1.5" fill="var(--c-gold)" opacity="0.55"/>
              </svg>
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ boxShadow: '0 0 36px rgba(200,168,75,0.15)' }}
              />
            </div>
            <h1
              className="text-2xl font-extrabold text-app-text uppercase"
              style={{ letterSpacing: '0.16em' }}
            >
              KOLŌN
            </h1>
            <p className="text-xs text-app-text-2 mt-2 tracking-wider">
              {(success || resetSent)
                ? 'Revisa tu correo'
                : isForgot
                  ? 'Recupera tu acceso'
                  : isSignUp
                    ? 'Crea tu cuenta'
                    : 'Tu dinero, bajo control'}
            </p>
          </div>

          {(success || resetSent) ? (
            <div className="rounded-2xl border border-app-teal/30 bg-app-teal/10 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-app-teal/10 border border-app-teal/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-app-teal text-lg">{resetSent ? '✉' : '✓'}</span>
              </div>
              <p className="text-sm font-medium text-app-teal">
                {resetSent ? 'Correo enviado' : 'Cuenta creada'}
              </p>
              <p className="text-xs text-app-text-2 mt-1">
                {resetSent
                  ? 'Revisa tu correo para restablecer tu contraseña'
                  : 'Revisa tu correo para confirmar tu cuenta'}
              </p>
              <button
                onClick={() => { setSuccess(false); setResetSent(false); setIsSignUp(false); setIsForgot(false); setError(null) }}
                className="mt-4 text-xs text-app-gold hover:text-app-text transition-colors"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl border border-app-border bg-app-surface p-5 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[11px] font-medium text-app-text-2 uppercase tracking-widest mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-field"
                  />
                </div>

                {!isForgot && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-[11px] font-medium text-app-text-2 uppercase tracking-widest">
                        Contraseña
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => { setIsForgot(true); setError(null) }}
                          className="text-[11px] text-app-gold hover:text-app-text transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field"
                      style={{ letterSpacing: password ? '0.2em' : undefined }}
                    />
                  </div>
                )}

                {error && (
                  <p className="rounded-xl bg-app-red/10 border border-app-red/20 px-3 py-2.5 text-xs text-app-red">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-app-gold py-3.5 text-sm font-semibold text-app-bg transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 rounded-full border-2 border-app-bg/40 border-t-app-bg animate-spin" />
                )}
                {loading ? 'Cargando...' : isForgot ? 'Enviar enlace' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          {!(success || resetSent) && (
            <p className="mt-6 text-center text-xs text-app-text-3">
              {isForgot ? (
                <button
                  onClick={() => { setIsForgot(false); setError(null) }}
                  className="text-app-gold hover:text-app-text transition-colors font-medium"
                >
                  Volver al login
                </button>
              ) : (
                <>
                  {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                  <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                    className="text-app-gold hover:text-app-text transition-colors font-medium"
                  >
                    {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}

    </div>
  )
}
