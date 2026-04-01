'use client'

import type { FinanceData } from '@/hooks/useFinanceData'

export default function Toast({ data }: { data: FinanceData }) {
  const { toast } = data
  if (!toast) return null

  const styles = {
    success: 'bg-app-teal/10 border-app-teal/30 text-app-teal',
    error:   'bg-app-red/10 border-app-red/30 text-app-red',
    info:    'bg-app-surface border-app-border-2 text-app-text',
  }

  const icons = {
    success: '✓',
    error:   '✕',
    info:    '·',
  }

  const style = styles[toast.type as keyof typeof styles] ?? styles.info
  const icon  = icons[toast.type as keyof typeof icons] ?? icons.info

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <div className={`animate-slide-up flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl pointer-events-auto backdrop-blur-sm ${style}`}>
        <span className="text-base leading-none">{icon}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
