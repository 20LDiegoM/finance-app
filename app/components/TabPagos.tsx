'use client'

import { crc, usd } from '@/lib/utils'
import type { FinanceData } from '@/hooks/useFinanceData'

export default function TabPagos({ data }: { data: FinanceData }) {
  const { rate, expensesByAccount, unassignedExpenses, unassignedTotalCrc, totalExpensesCrc } = data

  const empty = expensesByAccount.length === 0 && unassignedExpenses.length === 0

  return (
    <div className="space-y-4 animate-fade-in">

      {empty ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-10 text-center">
          <div className="w-12 h-12 rounded-full border border-app-border-2 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-app-text-3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <p className="text-sm text-app-text-2">No hay gastos registrados</p>
          <p className="text-xs text-app-text-3 mt-1">Crea cuentas en Ajustes y asígnalas a tus gastos</p>
        </div>
      ) : (
        <>
          {/* Account cards */}
          {expensesByAccount.map(({ account, items, totalCrc }) => (
            <div key={account.id} className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
              {/* Card header with accent */}
              <div className="h-1 bg-gradient-to-r from-app-gold to-app-amber opacity-60" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-app-text">{account.name}</h3>
                    {account.account_number && (
                      <p className="font-fin text-[11px] text-app-text-3 mt-0.5">{account.account_number}</p>
                    )}
                    <p className="text-[11px] text-app-text-3 mt-1">
                      {items.length} gasto{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-2xl font-semibold text-app-text leading-none">{crc(totalCrc)}</p>
                    <p className="font-fin text-xs text-app-text-3 mt-1">{usd(totalCrc / rate)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-app-border">
                  <span className="text-[11px] text-app-text-3 uppercase tracking-wider">Quincenal</span>
                  <span className="font-fin text-xs text-app-text-2">{crc(totalCrc / 2)} · {usd(totalCrc / 2 / rate)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Unassigned */}
          {unassignedExpenses.length > 0 && (
            <div className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
              <div className="h-1 bg-app-border-2" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-app-text-2">Sin cuenta asignada</h3>
                    <p className="text-[11px] text-app-text-3 mt-1">
                      {unassignedExpenses.length} gasto{unassignedExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-fin text-lg font-medium text-app-text-2">{crc(unassignedTotalCrc)}</p>
                    <p className="font-fin text-xs text-app-text-3 mt-0.5">{usd(unassignedTotalCrc / rate)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-app-border">
                  <span className="text-[11px] text-app-text-3 uppercase tracking-wider">Quincenal</span>
                  <span className="font-fin text-xs text-app-text-2">{crc(unassignedTotalCrc / 2)} · {usd(unassignedTotalCrc / 2 / rate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-app-text-2 uppercase tracking-wider">Total mensual</span>
              <div className="text-right">
                <span className="font-display text-2xl font-semibold text-app-text">{crc(totalExpensesCrc)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-fin text-[11px] text-app-text-3">{usd(totalExpensesCrc / rate)}</span>
              <span className="font-fin text-[11px] text-app-text-3">Quincenal: {crc(totalExpensesCrc / 2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
