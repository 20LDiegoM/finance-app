'use client'

import { crc, usd } from '@/lib/utils'
import type { FinanceData } from '@/hooks/useFinanceData'
import type { Bucket } from '@/lib/types'

const IDEAL = [
  {
    key: 'gastos' as const, label: 'Necesidades', pct: 50,
    barClass: 'bar-teal', textColor: 'text-app-teal', bgColor: 'bg-app-teal/10',
    borderColor: 'border-app-teal/30', dotColor: 'bg-app-teal',
  },
  {
    key: 'ocio' as const, label: 'Ocio & Lifestyle', pct: 30,
    barClass: 'bar-amber', textColor: 'text-app-amber', bgColor: 'bg-app-amber/10',
    borderColor: 'border-app-amber/30', dotColor: 'bg-app-amber',
  },
  {
    key: 'ahorros' as const, label: 'Ahorros', pct: 20,
    barClass: 'bar-blue', textColor: 'text-app-blue', bgColor: 'bg-app-blue/10',
    borderColor: 'border-app-blue/30', dotColor: 'bg-app-blue',
  },
]

const TYPE_BAR_CLASSES = [
  'bar-teal', 'bar-amber', 'bar-gold', 'bar-red',
  'bar-blue', 'bar-teal', 'bar-amber', 'bar-gold',
]

const TYPE_DOTS = [
  'bg-app-teal', 'bg-app-amber', 'bg-app-gold', 'bg-app-red',
  'bg-app-blue', 'bg-app-teal', 'bg-app-amber', 'bg-app-gold',
]

export default function TabPresupuesto({ data }: { data: FinanceData }) {
  const { totalIncome, rate, types, expensesByType, totalExpensesCrc, remainingCrc, pct, bucketTotals, setTypeBucket } = data
  const hasIncome = totalIncome > 0
  const savingsPct = hasIncome ? Math.max(0, (remainingCrc / totalIncome) * 100) : 0

  const bucketData = [
    { ...IDEAL[0], totalCrc: bucketTotals.gastos.totalCrc, types: bucketTotals.gastos.types },
    { ...IDEAL[1], totalCrc: bucketTotals.ocio.totalCrc,   types: bucketTotals.ocio.types },
    { ...IDEAL[2], totalCrc: bucketTotals.ahorros.totalCrc, types: bucketTotals.ahorros.types },
  ]

  const unassigned = types.filter(t => !t.bucket)

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Income hero card */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, var(--c-gold) 0%, transparent 60%)' }} />
        <p className="text-[11px] font-medium text-app-text-2 uppercase tracking-widest mb-1">Salario Neto</p>
        <p className="font-display text-4xl font-semibold text-app-text leading-none">
          {crc(totalIncome)}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-fin text-xs text-app-text-2">{usd(totalIncome / rate)}</span>
          <div className="text-right">
            <p className="text-[11px] text-app-text-3 uppercase tracking-wider">Quincenal</p>
            <p className="font-fin text-sm font-medium text-app-text-2">{crc(totalIncome / 2)}</p>
          </div>
        </div>
        {!hasIncome && (
          <p className="mt-3 text-xs text-app-amber bg-app-amber/10 border border-app-amber/20 rounded-lg px-3 py-2">
            Configura tu salario en Ajustes para ver el presupuesto
          </p>
        )}
      </section>

      {/* 50/30/20 Rule — Ideal */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-app-text">Regla 50 · 30 · 20</h2>
            <p className="text-[11px] text-app-text-2 mt-0.5">Distribución ideal del ingreso</p>
          </div>
          <span className="text-[10px] text-app-text-3 uppercase tracking-wider border border-app-border rounded-full px-2 py-0.5">Ideal</span>
        </div>

        {hasIncome && (
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-4">
            {IDEAL.map(i => (
              <div key={i.key} className={`${i.dotColor} rounded-full transition-all duration-700`} style={{ width: `${i.pct}%` }} />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {IDEAL.map(i => (
            <div key={i.key} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${i.dotColor}`} />
                <span className="text-sm text-app-text">{i.label}</span>
                <span className={`text-[11px] font-medium ${i.textColor}`}>{i.pct}%</span>
              </div>
              <div className="text-right font-fin">
                <span className="text-sm text-app-text">{crc(totalIncome * (i.pct / 100))}</span>
                <span className="ml-2 text-[11px] text-app-text-3">{crc(totalIncome * (i.pct / 100) / 2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 50/30/20 — Reality */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-app-text">Tu Realidad</h2>
            <p className="text-[11px] text-app-text-2 mt-0.5">Gastos agrupados en la regla</p>
          </div>
          <span className="text-[10px] text-app-text-3 uppercase tracking-wider border border-app-border rounded-full px-2 py-0.5">Real</span>
        </div>

        {hasIncome && (
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-4 bg-app-border">
            {bucketData.map(b => {
              const w = totalIncome > 0 ? (Math.max(0, b.totalCrc) / totalIncome) * 100 : 0
              return w > 0 ? (
                <div key={b.key} className={`${b.dotColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(w, 100)}%` }} />
              ) : null
            })}
          </div>
        )}

        <div className="space-y-3">
          {bucketData.map(b => {
            const idealVal = totalIncome * (b.pct / 100)
            const actualPct = hasIncome ? (b.totalCrc / totalIncome) * 100 : 0
            const isOver = b.totalCrc > idealVal && b.key !== 'ahorros'
            const isAhorros = b.key === 'ahorros'
            const isGood = isAhorros ? b.totalCrc >= idealVal : !isOver

            return (
              <div key={b.key} className={`rounded-xl border p-3.5 ${b.bgColor} ${b.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${b.dotColor}`} />
                    <span className={`text-sm font-semibold ${b.textColor}`}>{b.label}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                      isGood ? 'bg-app-teal/10 text-app-teal' : 'bg-app-red/10 text-app-red'
                    }`}>
                      {actualPct.toFixed(1)}% <span className="opacity-60">/ {b.pct}%</span>
                    </span>
                  </div>
                  <span className={`font-fin text-sm font-semibold ${b.textColor}`}>{crc(b.totalCrc)}</span>
                </div>

                {hasIncome && (
                  <div className="relative h-1.5 rounded-full bg-app-surface mb-2.5 overflow-hidden">
                    <div
                      className={`absolute h-full rounded-full transition-all duration-700 ${isGood ? b.barClass : 'bar-red'}`}
                      style={{ width: `${Math.min(Math.abs(actualPct), 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-px bg-app-text-2/40"
                      style={{ left: `${b.pct}%` }}
                    />
                  </div>
                )}

                <div className="flex justify-between font-fin text-[11px] text-app-text-2/60 mb-2.5">
                  <span>Quincenal: {crc(b.totalCrc / 2)}</span>
                  <span>{usd(b.totalCrc / rate)}</span>
                </div>

                {b.types.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {b.types.map(t => (
                      <span key={t.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium bg-app-surface ${b.textColor}`}>
                        {t.name}
                        <button onClick={() => setTypeBucket(t.id, null)} className="opacity-50 hover:opacity-100 transition-opacity ml-0.5 text-xs">×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-app-text-3 italic">Sin tipos asignados</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Total percentage */}
        {hasIncome && (() => {
          const totalBucketPct = bucketData.reduce((s, b) => s + (b.totalCrc / totalIncome) * 100, 0)
          return (
            <div className="border-t border-app-border mt-3 pt-3 flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-app-text-2 uppercase tracking-wider">Total asignado</span>
              <span className={`font-fin text-xs font-semibold ${Math.abs(totalBucketPct - 100) < 0.2 ? 'text-app-teal' : 'text-app-text-2'}`}>
                {totalBucketPct.toFixed(1)}%
              </span>
            </div>
          )
        })()}

        {/* Unassigned types */}
        {unassigned.length > 0 && (
          <div className="mt-4 pt-4 border-t border-app-border">
            <p className="text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-3">Asignar tipos:</p>
            <div className="space-y-2">
              {unassigned.map(t => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-app-text">{t.name}</span>
                  <div className="flex gap-1">
                    {(['gastos', 'ocio', 'ahorros'] as Bucket[]).map(b => (
                      <button
                        key={b}
                        onClick={() => setTypeBucket(t.id, b)}
                        className="rounded-lg border border-app-border bg-app-surface-2 px-2.5 py-1 text-[11px] font-medium text-app-text-2 hover:border-app-border-2 hover:text-app-text transition-all capitalize"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Breakdown by type */}
      <section className="rounded-2xl border border-app-border bg-app-surface p-4">
        <h2 className="text-sm font-semibold text-app-text mb-1">Desglose por tipo</h2>
        <p className="text-[11px] text-app-text-2 mb-4">Distribución real del ingreso</p>

        {hasIncome && (
          <div className="flex h-2 rounded-full overflow-hidden gap-px mb-4 bg-app-border">
            {expensesByType.map(({ type, totalCrc }, idx) => {
              const w = totalIncome > 0 ? (totalCrc / totalIncome) * 100 : 0
              return (
                <div key={type.id} className={`${TYPE_BAR_CLASSES[idx % TYPE_BAR_CLASSES.length]} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(w, 100)}%` }} />
              )
            })}
            {savingsPct > 0 && (
              <div className="bar-blue rounded-full" style={{ width: `${savingsPct}%` }} />
            )}
          </div>
        )}

        <div className="space-y-1">
          {expensesByType.map(({ type, totalCrc }, idx) => (
            <div key={type.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-app-surface-2 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${TYPE_DOTS[idx % TYPE_DOTS.length]}`} />
                <span className="text-sm text-app-text">{type.name}</span>
                <span className="text-[11px] text-app-text-3 font-fin">{pct(totalCrc)}%</span>
              </div>
              <div className="text-right font-fin">
                <span className="text-sm text-app-text">{crc(totalCrc)}</span>
                <span className="ml-2 text-[11px] text-app-text-3 hidden sm:inline">{usd(totalCrc / rate)}</span>
              </div>
            </div>
          ))}

          {/* Remaining row */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-app-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0 bg-app-blue" />
              <span className="text-sm font-medium text-app-text">Disponible</span>
              <span className="text-[11px] text-app-text-3 font-fin">
                {hasIncome ? ((remainingCrc / totalIncome) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="text-right font-fin">
              <span className={`text-sm font-medium ${remainingCrc >= 0 ? 'text-app-teal' : 'text-app-red'}`}>
                {crc(remainingCrc)}
              </span>
              <span className="ml-2 text-[11px] text-app-text-3 hidden sm:inline">{usd(remainingCrc / rate)}</span>
            </div>
          </div>
        </div>

        {/* Total percentage */}
        {hasIncome && (() => {
          const typesTotalPct = expensesByType.reduce((s, { totalCrc }) => s + (totalCrc / totalIncome) * 100, 0)
            + (remainingCrc / totalIncome) * 100
          return (
            <div className="border-t border-app-border mt-2 pt-3 flex items-center justify-between px-3">
              <span className="text-xs font-semibold text-app-text-2 uppercase tracking-wider">Total</span>
              <div className="flex items-center gap-3">
                <span className={`font-fin text-xs font-semibold ${Math.abs(typesTotalPct - 100) < 0.2 ? 'text-app-teal' : 'text-app-text-2'}`}>
                  {typesTotalPct.toFixed(1)}%
                </span>
                <div className="text-right font-fin">
                  <span className="text-base font-semibold text-app-text">{crc(totalIncome)}</span>
                  <span className="ml-2 text-[11px] text-app-text-3 hidden sm:inline">{usd(totalIncome / rate)}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </section>
    </div>
  )
}
