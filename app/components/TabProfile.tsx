'use client'

import { useState } from 'react'
import { INPUT_CLASS } from '@/lib/utils'
import type { FinanceData } from '@/hooks/useFinanceData'
import type { Theme } from '@/lib/types'

function Spinner() {
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
}

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-app-border">
        <h2 className="text-sm font-semibold text-app-text">{title}</h2>
        {subtitle && <p className="text-[11px] text-app-text-2 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export default function TabProfile({ data }: { data: FinanceData }) {
  const { user, displayName, updateDisplayName, changePassword, theme, setTheme, handleLogout } = data

  const [nameInput, setNameInput] = useState(displayName)
  const [savingName, setSavingName] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState('')

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    await updateDisplayName(nameInput)
    setSavingName(false)
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (newPw.length < 6) { setPwError('Mínimo 6 caracteres'); return }
    if (newPw !== confirmPw) { setPwError('Las contraseñas no coinciden'); return }
    setSavingPw(true)
    const ok = await changePassword(newPw)
    if (ok) { setCurrentPw(''); setNewPw(''); setConfirmPw('') }
    setSavingPw(false)
  }

  return (
    <div className="space-y-4">

      {/* Avatar + email */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-app-gold/10 border border-app-gold/25 shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="2" width="2.2" height="16" rx="1.1" fill="var(--c-gold)"/>
              <rect x="4" y="6.5" width="12" height="1.9" rx="0.95" fill="var(--c-gold)"/>
              <rect x="4" y="11.5" width="12" height="1.9" rx="0.95" fill="var(--c-gold)" opacity="0.55"/>
            </svg>
          </div>
          <div className="min-w-0">
            {displayName && (
              <p className="text-base font-semibold text-app-text truncate">{displayName}</p>
            )}
            <p className="text-sm text-app-text-2 truncate">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Display name */}
      <SectionCard title="Nombre" subtitle="Nombre para mostrar en la app">
        <div className="flex gap-2">
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Tu nombre"
            className={INPUT_CLASS}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
          />
          <button
            onClick={handleSaveName}
            disabled={savingName || !nameInput.trim() || nameInput.trim() === displayName}
            className="shrink-0 rounded-xl border border-app-gold/30 bg-app-gold/10 px-4 py-2.5 text-sm font-medium text-app-gold transition-all hover:bg-app-gold/20 disabled:opacity-30 flex items-center gap-2"
          >
            {savingName && <Spinner />}
            Guardar
          </button>
        </div>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Contraseña" subtitle="Cambiar tu contraseña de acceso">
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-app-text-2 mb-1.5 uppercase tracking-wider">Nueva contraseña</label>
            <input
              type="password"
              value={newPw}
              onChange={e => { setNewPw(e.target.value); setPwError('') }}
              placeholder="Mínimo 6 caracteres"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-app-text-2 mb-1.5 uppercase tracking-wider">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
              placeholder="Repetir contraseña"
              className={INPUT_CLASS}
              onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
            />
          </div>
          {pwError && (
            <p className="text-xs text-app-red">{pwError}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={savingPw || !newPw || !confirmPw}
            className="w-full rounded-xl border border-app-gold/30 bg-app-gold/10 px-4 py-2.5 text-sm font-medium text-app-gold transition-all hover:bg-app-gold/20 disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {savingPw && <Spinner />}
            Cambiar contraseña
          </button>
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard title="Apariencia" subtitle="Tema visual de la aplicación">
        <div className="flex rounded-xl border border-app-border p-1 bg-app-bg">
          {([
            { id: 'light' as Theme, label: 'Claro', icon: (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM5.05 5.05a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM15.657 4.343a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 11a1 1 0 1 0 0-2H1a1 1 0 1 0 0 2h1ZM18 11h1a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2ZM5.05 14.95a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414ZM16.364 14.243a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" clipRule="evenodd" />
              </svg>
            )},
            { id: 'dark' as Theme, label: 'Oscuro', icon: (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clipRule="evenodd" />
              </svg>
            )},
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                theme === t.id
                  ? 'bg-app-surface-2 text-app-text shadow-sm border border-app-border-2'
                  : 'text-app-text-3 hover:text-app-text-2 border border-transparent'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border border-app-red/20 bg-app-red/5 px-4 py-3 text-sm font-medium text-app-red transition-all hover:bg-app-red/10"
      >
        Cerrar sesión
      </button>

    </div>
  )
}
