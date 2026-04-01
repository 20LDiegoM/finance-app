'use client'

import { useState } from 'react'
import { periodLabel } from '@/lib/utils'
import { useFinanceData } from '@/hooks/useFinanceData'
import type { Tab } from '@/lib/types'
import TabPresupuesto from './components/TabPresupuesto'
import TabGastos from './components/TabGastos'
import TabPagos from './components/TabPagos'
import TabSettings from './components/TabSettings'
import TabProfile from './components/TabProfile'
import Toast from './components/Toast'

const IconGastos = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
)

const IconPresupuesto = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 3.055A9.001 9.001 0 1 0 20.945 13H11V3.055Z" />
    <path d="M20.488 9H15V3.512A9.025 9.025 0 0 1 20.488 9Z" />
  </svg>
)

const IconPagos = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
)

const IconSettings = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const IconProfile = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
)

const TABS: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'gastos',      label: 'Gastos',      Icon: IconGastos },
  { id: 'presupuesto', label: 'Presupuesto', Icon: IconPresupuesto },
  { id: 'pagos',       label: 'Pagos',       Icon: IconPagos },
  { id: 'settings',   label: 'Ajustes',     Icon: IconSettings },
  { id: 'profile',    label: 'Perfil',      Icon: IconProfile },
]

export default function Home() {
  const data = useFinanceData()
  const [tab, setTab] = useState<Tab>('gastos')

  if (data.loading) {
    return (
      <div className="app-shell items-center justify-center bg-app-bg flex">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            {/* KOLŌN mark */}
            <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="27" fill="var(--c-gold-dim)" stroke="var(--c-gold)" strokeWidth="1" strokeOpacity="0.35"/>
              <rect x="26.5" y="13" width="3" height="30" rx="1.5" fill="var(--c-gold)"/>
              <rect x="16" y="22" width="24" height="2.5" rx="1.25" fill="var(--c-gold)"/>
              <rect x="16" y="31.5" width="24" height="2.5" rx="1.25" fill="var(--c-gold)" opacity="0.55"/>
            </svg>
            {/* Spinner ring */}
            <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14 absolute inset-0 animate-spin" style={{animationDuration:'1.4s'}}>
              <circle cx="28" cy="28" r="27" stroke="var(--c-gold)" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray="48 122" strokeDashoffset="0"/>
            </svg>
          </div>
          <span className="text-[10px] text-app-text-3 tracking-[0.2em] uppercase font-medium">KOLŌN</span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell bg-app-bg">
      {/* Header */}
      <header className="shrink-0 z-30 bg-app-bg/90 backdrop-blur-md border-b border-app-border">
        <div className="mx-auto max-w-lg px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            {/* KOLŌN mark — small */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-gold/10 border border-app-gold/25 shrink-0">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="2" width="2.2" height="16" rx="1.1" fill="var(--c-gold)"/>
                <rect x="4" y="6.5" width="12" height="1.9" rx="0.95" fill="var(--c-gold)"/>
                <rect x="4" y="11.5" width="12" height="1.9" rx="0.95" fill="var(--c-gold)" opacity="0.55"/>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-extrabold text-app-text uppercase"
                style={{ letterSpacing: '0.12em' }}
              >
                KOLŌN
              </span>
              <span className="rounded-full border border-app-border bg-app-surface px-2 py-0.5 text-[10px] font-medium text-app-text-2 uppercase tracking-wider">
                {periodLabel(data.period)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setTab('profile')}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
              tab === 'profile'
                ? 'bg-app-gold/10 border-app-gold/30 text-app-gold'
                : 'bg-app-surface-2 border-app-border text-app-text-2 hover:border-app-border-2 hover:text-app-text'
            }`}
          >
            <span className="text-xs font-semibold">
              {(data.displayName || data.user?.email || '?')[0].toUpperCase()}
            </span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="app-scroll pb-24">
        <div className="mx-auto max-w-lg px-4 py-5">
          {tab === 'gastos'      && <TabGastos data={data} />}
          {tab === 'presupuesto' && <TabPresupuesto data={data} />}
          {tab === 'pagos'       && <TabPagos data={data} />}
          {tab === 'settings'    && <TabSettings data={data} />}
          {tab === 'profile'     && <TabProfile data={data} />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app-surface/95 backdrop-blur-xl border-t border-app-border safe-bottom">
        <div className="mx-auto max-w-lg flex items-center">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-all"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-app-gold" />
                )}
                <span className={`transition-colors ${active ? 'text-app-gold' : 'text-app-text-3 hover:text-app-text-2'}`}>
                  <Icon active={active} />
                </span>
                <span className={`text-[10px] font-medium tracking-wide transition-colors ${active ? 'text-app-gold' : 'text-app-text-3'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <Toast data={data} />
    </div>
  )
}
