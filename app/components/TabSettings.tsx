'use client'

import { useState } from 'react'
import { crc, usd, INPUT_CLASS } from '@/lib/utils'
import type { FinanceData } from '@/hooks/useFinanceData'

function Spinner() {
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
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

function SectionCard({ title, subtitle, badge, children }: {
  title: string; subtitle?: string; badge?: string; children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-app-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-app-text">{title}</h2>
          {subtitle && <p className="text-[11px] text-app-text-2 mt-0.5">{subtitle}</p>}
        </div>
        {badge && <span className="text-[10px] text-app-text-3 border border-app-border rounded-full px-2 py-0.5 font-fin">{badge}</span>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function IconBtn({ onClick, className, children }: { onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${className}`}
    >
      {children}
    </button>
  )
}

export default function TabSettings({ data }: { data: FinanceData }) {
  const {
    income, totalIncome, saveIncome, rate, syncRate, syncCount,
    types, addType, editType, deleteType,
    categories, addCategory, editCategory, deleteCategory,
    accounts, addAccount, editAccount, deleteAccount, expenses,
  } = data

  const [incomeCurrency, setIncomeCurrency] = useState<'CRC' | 'USD'>('CRC')
  const [incomeInput, setIncomeInput] = useState(income ? String(income.amount) : '')
  const [savingIncome, setSavingIncome] = useState(false)
  const [rateInput, setRateInput] = useState(String(rate))
  const [savingRate, setSavingRate] = useState(false)

  // Types
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [savingType, setSavingType] = useState(false)
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null)
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [editTypeName, setEditTypeName] = useState('')
  const [savingEditType, setSavingEditType] = useState(false)

  // Categories
  const [showCatForm, setShowCatForm] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [savingEditCat, setSavingEditCat] = useState(false)

  // Accounts
  const [showAccForm, setShowAccForm] = useState(false)
  const [newAccName, setNewAccName] = useState('')
  const [newAccNumber, setNewAccNumber] = useState('')
  const [savingAcc, setSavingAcc] = useState(false)
  const [deletingAccId, setDeletingAccId] = useState<string | null>(null)
  const [editingAccId, setEditingAccId] = useState<string | null>(null)
  const [editAccName, setEditAccName] = useState('')
  const [editAccNumber, setEditAccNumber] = useState('')
  const [savingEditAcc, setSavingEditAcc] = useState(false)

  const handleSaveIncome = async () => {
    if (!incomeInput) return
    setSavingIncome(true)
    const raw = parseFloat(incomeInput)
    const amountCrc = incomeCurrency === 'USD' ? Math.round(raw * rate * 100) / 100 : raw
    await saveIncome(amountCrc)
    setIncomeInput(String(amountCrc))
    setIncomeCurrency('CRC')
    setSavingIncome(false)
  }

  const handleSyncRate = async () => {
    if (!rateInput) return
    setSavingRate(true)
    await syncRate(parseFloat(rateInput))
    setSavingRate(false)
  }

  const handleAddType = async () => {
    if (!newTypeName.trim()) return
    setSavingType(true)
    await addType(newTypeName)
    setNewTypeName(''); setShowTypeForm(false); setSavingType(false)
  }
  const handleEditType = async () => {
    if (!editingTypeId || !editTypeName.trim()) return
    setSavingEditType(true)
    await editType(editingTypeId, editTypeName)
    setEditingTypeId(null); setSavingEditType(false)
  }
  const handleDeleteType = async (id: string) => {
    setDeletingTypeId(id); await deleteType(id); setDeletingTypeId(null)
  }

  const handleAddCat = async () => {
    if (!newCatName.trim()) return
    setSavingCat(true)
    await addCategory(newCatName)
    setNewCatName(''); setShowCatForm(false); setSavingCat(false)
  }
  const handleEditCat = async () => {
    if (!editingCatId || !editCatName.trim()) return
    setSavingEditCat(true)
    await editCategory(editingCatId, editCatName)
    setEditingCatId(null); setSavingEditCat(false)
  }
  const handleDeleteCat = async (id: string) => {
    setDeletingCatId(id); await deleteCategory(id); setDeletingCatId(null)
  }

  const handleAddAcc = async () => {
    if (!newAccName.trim()) return
    setSavingAcc(true)
    await addAccount(newAccName, newAccNumber)
    setNewAccName(''); setNewAccNumber(''); setShowAccForm(false); setSavingAcc(false)
  }
  const handleEditAcc = async () => {
    if (!editingAccId || !editAccName.trim()) return
    setSavingEditAcc(true)
    await editAccount(editingAccId, editAccName, editAccNumber)
    setEditingAccId(null); setSavingEditAcc(false)
  }
  const handleDeleteAcc = async (id: string) => {
    setDeletingAccId(id); await deleteAccount(id); setDeletingAccId(null)
  }

  const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-app-border-2 py-2.5 text-xs font-medium text-app-text-3 hover:border-app-gold hover:text-app-gold transition-all"
    >
      + {label}
    </button>
  )

  const SubmitBtn = ({ onClick, disabled, loading, label, loadingLabel, variant = 'gold' }: {
    onClick: () => void; disabled: boolean; loading: boolean; label: string; loadingLabel: string; variant?: 'gold' | 'blue'
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-40 ${
        variant === 'gold' ? 'bg-app-gold text-app-bg hover:opacity-90' : 'bg-app-blue text-white hover:opacity-90'
      }`}
    >
      {loading && <Spinner />}
      {loading ? loadingLabel : label}
    </button>
  )

  const CancelBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="rounded-xl px-4 py-2 text-xs font-medium text-app-text-2 hover:text-app-text border border-app-border hover:border-app-border-2 transition-all">
      Cancelar
    </button>
  )

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Salario */}
      <SectionCard title="Salario Neto" subtitle="Ingreso mensual — se guarda en colones" badge={income ? usd(totalIncome / rate) : undefined}>
        <div className="flex rounded-xl border border-app-border p-0.5 bg-app-bg mb-3">
          {(['CRC', 'USD'] as const).map(c => (
            <button
              key={c}
              onClick={() => setIncomeCurrency(c)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                incomeCurrency === c
                  ? 'bg-app-surface-2 text-app-text shadow-sm border border-app-border-2'
                  : 'text-app-text-3 hover:text-app-text-2 border border-transparent'
              }`}
            >
              {c === 'CRC' ? '₡ Colones' : '$ Dólares'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-app-text-2 font-fin">
              {incomeCurrency === 'CRC' ? '₡' : '$'}
            </span>
            <input
              type="number"
              value={incomeInput}
              onChange={e => setIncomeInput(e.target.value)}
              placeholder="0"
              className={`${INPUT_CLASS} has-prefix font-fin`}
            />
          </div>
          <SubmitBtn
            onClick={handleSaveIncome}
            disabled={!incomeInput}
            loading={savingIncome}
            label={income ? 'Actualizar' : 'Guardar'}
            loadingLabel="Guardando..."
          />
        </div>
        {incomeCurrency === 'USD' && incomeInput && (
          <p className="mt-2 text-[11px] text-app-text-3 font-fin">
            ≈ {crc(parseFloat(incomeInput || '0') * rate)} al tipo de cambio actual
          </p>
        )}
      </SectionCard>

      {/* Tipo de cambio */}
      <SectionCard title="Tipo de cambio" subtitle="Al guardar se recalculan gastos en USD" badge={`1 USD = ${crc(rate)}`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-app-text-2 font-fin">₡</span>
            <input
              type="number"
              value={rateInput}
              onChange={e => setRateInput(e.target.value)}
              placeholder="507"
              className={`${INPUT_CLASS} has-prefix font-fin`}
            />
          </div>
          <SubmitBtn
            onClick={handleSyncRate}
            disabled={!rateInput}
            loading={savingRate}
            label="Sincronizar"
            loadingLabel="Sincronizando..."
          />
        </div>
        {syncCount !== null && (
          <p className="mt-3 rounded-xl bg-app-teal/10 border border-app-teal/20 px-3 py-2 text-xs text-app-teal">
            Tipo de cambio actualizado — {syncCount} gasto{syncCount !== 1 ? 's' : ''} recalculado{syncCount !== 1 ? 's' : ''}
          </p>
        )}
      </SectionCard>

      {/* Cuentas */}
      <SectionCard title="Cuentas" subtitle="Cuentas de pago para segmentar gastos" badge={`${accounts.length}`}>
        {accounts.length > 0 && (
          <ul className="space-y-0.5 mb-3">
            {accounts.map(a => {
              const count = expenses.filter(e => e.account_id === a.id).length
              const isEditing = editingAccId === a.id
              const isDeleting = deletingAccId === a.id

              if (isEditing) return (
                <li key={a.id} className="rounded-xl bg-app-blue/10 border border-app-blue/30 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editAccName} onChange={e => setEditAccName(e.target.value)}
                      placeholder="Nombre" className={INPUT_CLASS}
                      onKeyDown={e => e.key === 'Enter' && handleEditAcc()} autoFocus />
                    <input value={editAccNumber} onChange={e => setEditAccNumber(e.target.value)}
                      placeholder="Nro. cuenta" className={INPUT_CLASS}
                      onKeyDown={e => e.key === 'Enter' && handleEditAcc()} />
                  </div>
                  <div className="flex gap-2">
                    <SubmitBtn onClick={handleEditAcc} disabled={!editAccName.trim()} loading={savingEditAcc} label="Guardar" loadingLabel="Guardando..." variant="blue" />
                    <CancelBtn onClick={() => setEditingAccId(null)} />
                  </div>
                </li>
              )

              return (
                <li key={a.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-app-surface-2 transition-colors">
                  <div>
                    <span className="text-sm text-app-text">{a.name}</span>
                    {a.account_number && <span className="ml-2 font-fin text-[11px] text-app-text-3">{a.account_number}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-app-text-3 mr-1">{count} {count === 1 ? 'gasto' : 'gastos'}</span>
                    {isDeleting ? <Spinner /> : (
                      <>
                        <IconBtn onClick={() => { setEditingAccId(a.id); setEditAccName(a.name); setEditAccNumber(a.account_number || '') }}
                          className="text-app-text-3 hover:text-app-blue hover:bg-app-blue/10">
                          <EditIcon />
                        </IconBtn>
                        <IconBtn onClick={() => handleDeleteAcc(a.id)} className="text-app-text-3 hover:text-app-red hover:bg-app-red/10">
                          <TrashIcon />
                        </IconBtn>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {showAccForm ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={newAccName} onChange={e => setNewAccName(e.target.value)}
                placeholder="Nombre (ej: Casa, Personal)" className={INPUT_CLASS}
                onKeyDown={e => e.key === 'Enter' && handleAddAcc()} autoFocus />
              <input value={newAccNumber} onChange={e => setNewAccNumber(e.target.value)}
                placeholder="Nro. cuenta (opcional)" className={INPUT_CLASS}
                onKeyDown={e => e.key === 'Enter' && handleAddAcc()} />
            </div>
            <div className="flex gap-2">
              <SubmitBtn onClick={handleAddAcc} disabled={!newAccName.trim()} loading={savingAcc} label="Agregar" loadingLabel="Creando..." />
              <CancelBtn onClick={() => { setShowAccForm(false); setNewAccName(''); setNewAccNumber('') }} />
            </div>
          </div>
        ) : (
          <AddBtn onClick={() => setShowAccForm(true)} label="Agregar cuenta" />
        )}
      </SectionCard>

      {/* Tipos de gasto */}
      <SectionCard title="Tipos de gasto" subtitle="Agrupa tus gastos por tipo" badge={`${types.length}`}>
        {types.length > 0 && (
          <ul className="space-y-0.5 mb-3">
            {types.map((t, i) => {
              const count = expenses.filter(e => e.type_id === t.id).length
              const isEditing = editingTypeId === t.id
              const isDeleting = deletingTypeId === t.id

              if (isEditing) return (
                <li key={t.id} className="rounded-xl bg-app-blue/10 border border-app-blue/30 p-3">
                  <div className="flex gap-2">
                    <input value={editTypeName} onChange={e => setEditTypeName(e.target.value)}
                      placeholder="Nombre" className={`${INPUT_CLASS} flex-1`}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditType(); if (e.key === 'Escape') setEditingTypeId(null) }} autoFocus />
                    <SubmitBtn onClick={handleEditType} disabled={!editTypeName.trim()} loading={savingEditType} label="Guardar" loadingLabel="..." variant="blue" />
                    <CancelBtn onClick={() => setEditingTypeId(null)} />
                  </div>
                </li>
              )

              return (
                <li key={t.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-app-surface-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-app-border text-[10px] font-fin text-app-text-3">{i + 1}</span>
                    <span className="text-sm text-app-text">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-app-text-3 mr-1">{count} {count === 1 ? 'gasto' : 'gastos'}</span>
                    {isDeleting ? <Spinner /> : (
                      <>
                        <IconBtn onClick={() => { setEditingTypeId(t.id); setEditTypeName(t.name) }}
                          className="text-app-text-3 hover:text-app-blue hover:bg-app-blue/10">
                          <EditIcon />
                        </IconBtn>
                        <IconBtn onClick={() => handleDeleteType(t.id)} className="text-app-text-3 hover:text-app-red hover:bg-app-red/10">
                          <TrashIcon />
                        </IconBtn>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {showTypeForm ? (
          <div className="flex gap-2">
            <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
              placeholder="Nombre del tipo" className={`${INPUT_CLASS} flex-1`}
              onKeyDown={e => e.key === 'Enter' && handleAddType()} autoFocus />
            <SubmitBtn onClick={handleAddType} disabled={!newTypeName.trim()} loading={savingType} label="Agregar" loadingLabel="Creando..." />
            <CancelBtn onClick={() => { setShowTypeForm(false); setNewTypeName('') }} />
          </div>
        ) : (
          <AddBtn onClick={() => setShowTypeForm(true)} label="Agregar tipo" />
        )}
      </SectionCard>

      {/* Categorías */}
      <SectionCard title="Categorías" subtitle="Etiquetas reutilizables para clasificar gastos" badge={`${categories.length}`}>
        {categories.length > 0 && (
          <ul className="space-y-0.5 mb-3">
            {categories.map(c => {
              const count = expenses.filter(e => e.category_id === c.id).length
              const isEditing = editingCatId === c.id
              const isDeleting = deletingCatId === c.id

              if (isEditing) return (
                <li key={c.id} className="rounded-xl bg-app-blue/10 border border-app-blue/30 p-3">
                  <div className="flex gap-2">
                    <input value={editCatName} onChange={e => setEditCatName(e.target.value)}
                      placeholder="Nombre" className={`${INPUT_CLASS} flex-1`}
                      onKeyDown={e => { if (e.key === 'Enter') handleEditCat(); if (e.key === 'Escape') setEditingCatId(null) }} autoFocus />
                    <SubmitBtn onClick={handleEditCat} disabled={!editCatName.trim()} loading={savingEditCat} label="Guardar" loadingLabel="..." variant="blue" />
                    <CancelBtn onClick={() => setEditingCatId(null)} />
                  </div>
                </li>
              )

              return (
                <li key={c.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-app-surface-2 transition-colors">
                  <span className="text-sm text-app-text">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-app-text-3 mr-1">{count} {count === 1 ? 'gasto' : 'gastos'}</span>
                    {isDeleting ? <Spinner /> : (
                      <>
                        <IconBtn onClick={() => { setEditingCatId(c.id); setEditCatName(c.name) }}
                          className="text-app-text-3 hover:text-app-blue hover:bg-app-blue/10">
                          <EditIcon />
                        </IconBtn>
                        <IconBtn onClick={() => handleDeleteCat(c.id)} className="text-app-text-3 hover:text-app-red hover:bg-app-red/10">
                          <TrashIcon />
                        </IconBtn>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {showCatForm ? (
          <div className="flex gap-2">
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
              placeholder="Nombre de la categoría" className={`${INPUT_CLASS} flex-1`}
              onKeyDown={e => e.key === 'Enter' && handleAddCat()} autoFocus />
            <SubmitBtn onClick={handleAddCat} disabled={!newCatName.trim()} loading={savingCat} label="Agregar" loadingLabel="Creando..." />
            <CancelBtn onClick={() => { setShowCatForm(false); setNewCatName('') }} />
          </div>
        ) : (
          <AddBtn onClick={() => setShowCatForm(true)} label="Agregar categoría" />
        )}
      </SectionCard>

    </div>
  )
}
