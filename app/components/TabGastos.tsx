'use client'

import { useState, useRef, useEffect } from 'react'
import { crc, usd, INPUT_CLASS } from '@/lib/utils'
import type { FinanceData } from '@/hooks/useFinanceData'
import type { ExpenseRow } from '@/lib/types'

function Spinner() {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
  )
}

function expDisplay(e: ExpenseRow, rate: number) {
  const amt = Number(e.amount)
  if (e.currency === 'USD') return { primary: usd(amt), secondary: crc(Number(e.amount_crc)) }
  return { primary: crc(amt), secondary: usd(amt / rate) }
}

const EditIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.3 7.225a.25.25 0 0 0-.064.108l-.558 2.04a.25.25 0 0 0 .3.3l2.04-.558a.25.25 0 0 0 .108-.064l4.713-4.712a1.75 1.75 0 0 0 0-2.475l-.35-.35ZM3.5 3.5A1.5 1.5 0 0 0 2 5v7.5A1.5 1.5 0 0 0 3.5 14H11a1.5 1.5 0 0 0 1.5-1.5V9a.75.75 0 0 0-1.5 0v3.5h-7.5V5H7a.75.75 0 0 0 0-1.5H3.5Z" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
  </svg>
)

export default function TabGastos({ data }: { data: FinanceData }) {
  const { types, categories, accounts, rate, expensesByType, totalExpensesCrc, addExpense, editExpense, deleteExpense, catName, accountName } = data

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [typeId, setTypeId] = useState(types[0]?.id || '')
  const [currency, setCurrency] = useState<'CRC' | 'USD'>('CRC')
  const [catInput, setCatInput] = useState('')
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const catRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredCats = catInput
    ? categories.filter(c => c.name.toLowerCase().includes(catInput.toLowerCase()))
    : categories

  const resetForm = () => {
    setName(''); setAmount(''); setCatInput(''); setSelectedCatId(null)
    setCurrency('CRC'); setTypeId(types[0]?.id || ''); setAccountId(null); setEditingId(null)
  }

  const startEdit = (e: ExpenseRow) => {
    setEditingId(e.id)
    setName(e.name)
    setAmount(String(e.amount))
    setCurrency(e.currency as 'CRC' | 'USD')
    setTypeId(e.type_id)
    setAccountId(e.account_id)
    if (e.category_id) {
      const cat = categories.find(c => c.id === e.category_id)
      setCatInput(cat?.name || '')
      setSelectedCatId(e.category_id)
    } else {
      setCatInput('')
      setSelectedCatId(null)
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async () => {
    if (!name || !amount) return
    setSaving(true)
    const payload = {
      name, amount: parseFloat(amount), currency, type_id: typeId,
      category_id: selectedCatId, category_name: catInput, account_id: accountId,
    }
    const ok = editingId
      ? await editExpense(editingId, payload)
      : await addExpense(payload)
    if (ok) resetForm()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteExpense(id)
    setDeletingId(null)
    if (editingId === id) resetForm()
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Form */}
      <section ref={formRef} className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-app-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-app-text">
            {editingId ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-app-text-2 hover:text-app-text transition-colors">
              Cancelar
            </button>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Descripción</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej: Supermercado, Netflix, Gym..."
              className={INPUT_CLASS}
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Monto</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-app-text-2 font-fin">
                  {currency === 'CRC' ? '₡' : '$'}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className={`${INPUT_CLASS} has-prefix font-fin`}
                />
              </div>
            </div>
            <div ref={catRef} className="relative">
              <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Categoría</label>
              <input
                value={catInput}
                onChange={e => { setCatInput(e.target.value); setSelectedCatId(null); setShowCatDropdown(true) }}
                onFocus={() => setShowCatDropdown(true)}
                placeholder="Escribir o elegir..."
                className={INPUT_CLASS}
              />
              {showCatDropdown && filteredCats.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-40 overflow-auto rounded-xl border border-app-border bg-app-surface-2 py-1 shadow-2xl animate-slide-up">
                  {filteredCats.map(c => (
                    <li key={c.id}>
                      <button
                        onClick={() => { setCatInput(c.name); setSelectedCatId(c.id); setShowCatDropdown(false) }}
                        className="w-full text-left px-3 py-2 text-sm text-app-text hover:bg-app-border transition-colors"
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Moneda — toggle de 2 opciones fijas, ok en media columna */}
          <div>
            <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Moneda</label>
            <div className="flex rounded-xl border border-app-border bg-app-surface-2 p-0.5">
              {(['CRC', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    currency === c
                      ? 'bg-app-gold text-app-bg shadow-sm'
                      : 'text-app-text-2 hover:text-app-text'
                  }`}
                >
                  {c === 'CRC' ? '₡ CRC' : '$ USD'}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo — ancho completo con pills que se envuelven */}
          <div>
            <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Tipo</label>
            <div className="flex flex-wrap gap-1.5">
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeId(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                    typeId === t.id
                      ? 'border-app-gold bg-app-gold text-app-bg'
                      : 'border-app-border bg-app-surface-2 text-app-text-2 hover:border-app-border-2 hover:text-app-text'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts */}
          {accounts.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium text-app-text-2 uppercase tracking-wider mb-1.5">Cuenta</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setAccountId(null)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                    !accountId
                      ? 'border-app-gold bg-app-gold/10 text-app-gold'
                      : 'border-app-border bg-app-surface-2 text-app-text-2 hover:border-app-border-2 hover:text-app-text'
                  }`}
                >
                  Sin cuenta
                </button>
                {accounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAccountId(a.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                      accountId === a.id
                        ? 'border-app-gold bg-app-gold/10 text-app-gold'
                        : 'border-app-border bg-app-surface-2 text-app-text-2 hover:border-app-border-2 hover:text-app-text'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!name || !amount || saving}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
              editingId
                ? 'bg-app-blue text-white hover:opacity-90'
                : 'bg-app-gold text-app-bg hover:opacity-90'
            }`}
          >
            {saving && <Spinner />}
            {saving
              ? (editingId ? 'Guardando...' : 'Agregando...')
              : (editingId ? 'Guardar cambios' : 'Agregar gasto')
            }
          </button>
        </div>
      </section>

      {/* Expense list */}
      <section className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
        {expensesByType.map(({ type, items, totalCrc }, idx) => {
          const isOpen = !collapsed[type.id]
          const toggle = () => setCollapsed(prev => ({ ...prev, [type.id]: !prev[type.id] }))

          return (
            <div key={type.id}>
              {idx > 0 && <div className="mx-4 border-t border-app-border" />}

              {/* Type header — clickable */}
              <button
                onClick={toggle}
                className="w-full px-4 pt-4 pb-2 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className={`w-3 h-3 text-app-text-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                  <span className="w-1.5 h-1.5 rounded-full bg-app-gold shrink-0" />
                  <h3 className="text-xs font-semibold text-app-text uppercase tracking-wider">{type.name}</h3>
                  {!isOpen && (
                    <span className="text-[10px] text-app-text-3 font-fin ml-1">{items.length}</span>
                  )}
                </div>
                <div className="text-right font-fin">
                  <span className="text-sm font-medium text-app-text">{crc(totalCrc)}</span>
                  <span className="ml-2 text-xs text-app-text-2">{usd(totalCrc / rate)}</span>
                </div>
              </button>

              {isOpen && (
                <>
                  <div className="px-4 pb-1 flex justify-end">
                    <span className="text-[11px] text-app-text-3 font-fin">Quincenal: {crc(totalCrc / 2)}</span>
                  </div>

                  {items.length > 0 ? (
                    <ul className="px-2 pb-2 space-y-0.5">
                      {items.map(e => {
                        const d = expDisplay(e, rate)
                        const isEditing = editingId === e.id
                        const isDeleting = deletingId === e.id
                        return (
                          <li
                            key={e.id}
                            className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                              isEditing
                                ? 'bg-app-blue/10 border border-app-blue/30'
                                : 'hover:bg-app-surface-2'
                            }`}
                          >
                            <div className="min-w-0 flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-app-text">{e.name}</span>
                              {e.category_id && catName(e.category_id) && (
                                <span className="rounded-full bg-app-border px-2 py-0.5 text-[10px] text-app-text-2">
                                  {catName(e.category_id)}
                                </span>
                              )}
                              {e.account_id && accountName(e.account_id) && (
                                <span className="rounded-full bg-app-gold/10 border border-app-gold/20 px-2 py-0.5 text-[10px] text-app-gold">
                                  {accountName(e.account_id)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <div className="text-right font-fin">
                                <span className="text-sm text-app-text">{d.primary}</span>
                                <span className="ml-1.5 text-[11px] text-app-text-3 hidden sm:inline">{d.secondary}</span>
                              </div>
                              {isDeleting ? (
                                <div className="w-7 h-7 flex items-center justify-center">
                                  <Spinner />
                                </div>
                              ) : (
                                <div className="flex items-center gap-0.5 ml-1">
                                  <button
                                    onClick={() => startEdit(e)}
                                    className="flex items-center justify-center w-7 h-7 rounded-lg text-app-text-3 hover:text-app-blue hover:bg-app-blue/10 transition-all"
                                  >
                                    <EditIcon />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(e.id)}
                                    className="flex items-center justify-center w-7 h-7 rounded-lg text-app-text-3 hover:text-app-red hover:bg-app-red/10 transition-all"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-center py-4 text-[11px] text-app-text-3 uppercase tracking-wider">Sin gastos</p>
                  )}
                </>
              )}
            </div>
          )
        })}

        {/* Total footer */}
        <div className="border-t border-app-border bg-app-surface-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-app-text-2 uppercase tracking-wider">Total mensual</span>
            <div className="text-right font-fin">
              <span className="text-base font-semibold text-app-text">{crc(totalExpensesCrc)}</span>
              <span className="ml-2 text-xs text-app-text-2">{usd(totalExpensesCrc / rate)}</span>
            </div>
          </div>
          <div className="flex items-center justify-end mt-0.5">
            <span className="text-[11px] text-app-text-3 font-fin">Quincenal: {crc(totalExpensesCrc / 2)} · {usd(totalExpensesCrc / 2 / rate)}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
