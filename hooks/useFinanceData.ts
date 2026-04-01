'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentPeriod } from '@/lib/utils'
import type { Bucket, Theme, ExpenseType, Category, Account, ExpenseRow, Income, UserSettings, ExpensesByType, ExpensesByAccount } from '@/lib/types'

const DEFAULT_TYPES = ['Fijo', 'Casa', 'Ocio']

type Toast = { message: string; type: 'success' | 'error' | 'info' } | null

export function useFinanceData() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const period = getCurrentPeriod()

  const [income, setIncome] = useState<Income | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [types, setTypes] = useState<ExpenseType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [syncCount, setSyncCount] = useState<number | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const rate = settings?.exchange_rate || 507

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const seedDefaultTypes = useCallback(async (userId: string) => {
    const rows = DEFAULT_TYPES.map((name, i) => ({ user_id: userId, name, sort_order: i }))
    const { data } = await supabase.from('expense_types').insert(rows).select()
    return data || []
  }, [])

  const loadData = useCallback(async (userId: string) => {
    const [incomeRes, typesRes, catsRes, accRes, expRes, settingsRes] = await Promise.all([
      supabase.from('income').select('*').eq('user_id', userId).eq('period', period).maybeSingle(),
      supabase.from('expense_types').select('*').eq('user_id', userId).order('sort_order'),
      supabase.from('categories').select('*').eq('user_id', userId).order('name'),
      supabase.from('accounts').select('*').eq('user_id', userId).order('name'),
      supabase.from('expenses').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    ])

    if (incomeRes.data) setIncome(incomeRes.data)

    if (settingsRes.data) {
      setSettings(settingsRes.data)
    } else {
      const { data: newSettings } = await supabase.from('user_settings')
        .insert([{ user_id: userId, exchange_rate: 507, theme: 'dark' }]).select().single()
      if (newSettings) setSettings(newSettings)
    }

    let loadedTypes = typesRes.data || []
    if (loadedTypes.length === 0) loadedTypes = await seedDefaultTypes(userId)
    setTypes(loadedTypes)

    setCategories(catsRes.data || [])
    setAccounts(accRes.data || [])
    setExpenses(expRes.data || [])
  }, [period, seedDefaultTypes])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      loadData(data.user.id).then(() => setLoading(false))
    })
  }, [router, loadData])

  // --- Income ---
  const saveIncome = async (amount: number) => {
    if (!user) return
    if (income) {
      await supabase.from('income').update({ amount }).eq('id', income.id)
      setIncome({ ...income, amount })
    } else {
      const { data } = await supabase.from('income').insert([{ user_id: user.id, amount, period }]).select().single()
      if (data) setIncome(data)
    }
    showToast('Ingreso guardado')
  }

  // --- Exchange rate sync ---
  const syncRate = async (newRate: number) => {
    if (!user) return
    setSyncCount(null)
    await supabase.rpc('sync_exchange_rate', { new_rate: newRate })
    setSettings(prev => prev ? { ...prev, exchange_rate: newRate } : prev)

    const { data: updated } = await supabase
      .from('expenses').select('*').eq('user_id', user.id).order('created_at')
    if (updated) {
      setExpenses(updated)
      const synced = updated.filter(e => e.currency === 'USD').length
      setSyncCount(synced)
      setTimeout(() => setSyncCount(null), 3000)
    }
    showToast('Tipo de cambio sincronizado')
  }

  // --- Resolve category (shared between add/edit) ---
  const resolveCategory = async (categoryId: string | null, categoryName: string) => {
    if (categoryId) return categoryId
    if (!categoryName.trim()) return null

    const existing = categories.find(c => c.name.toLowerCase() === categoryName.trim().toLowerCase())
    if (existing) return existing.id

    const { data: newCat } = await supabase.from('categories')
      .insert([{ user_id: user!.id, name: categoryName.trim() }]).select().single()
    if (newCat) {
      setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
      return newCat.id
    }
    return null
  }

  // --- Expenses ---
  type ExpenseInput = {
    name: string
    amount: number
    currency: 'CRC' | 'USD'
    type_id: string
    category_id: string | null
    category_name: string
    account_id: string | null
  }

  const addExpense = async (data: ExpenseInput) => {
    if (!user) return false
    const categoryId = await resolveCategory(data.category_id, data.category_name)
    const amountCrc = data.currency === 'USD' ? Math.round(data.amount * rate * 100) / 100 : data.amount

    const { data: row, error } = await supabase.from('expenses').insert([{
      user_id: user.id, type_id: data.type_id, category_id: categoryId,
      account_id: data.account_id,
      name: data.name, amount: data.amount, currency: data.currency, amount_crc: amountCrc,
    }]).select().single()

    if (error) { showToast('Error al guardar: ' + error.message, 'error'); return false }
    if (row) setExpenses(prev => [...prev, row])
    showToast(`"${data.name}" agregado`)
    return true
  }

  const editExpense = async (id: string, data: ExpenseInput) => {
    if (!user) return false
    const categoryId = await resolveCategory(data.category_id, data.category_name)
    const amountCrc = data.currency === 'USD' ? Math.round(data.amount * rate * 100) / 100 : data.amount

    const { data: row, error } = await supabase.from('expenses').update({
      type_id: data.type_id, category_id: categoryId,
      account_id: data.account_id,
      name: data.name, amount: data.amount, currency: data.currency, amount_crc: amountCrc,
    }).eq('id', id).select().single()

    if (error) { showToast('Error al actualizar: ' + error.message, 'error'); return false }
    if (row) setExpenses(prev => prev.map(e => e.id === id ? row : e))
    showToast(`"${data.name}" actualizado`)
    return true
  }

  const deleteExpense = async (id: string) => {
    const exp = expenses.find(e => e.id === id)
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
    showToast(`"${exp?.name}" eliminado`)
  }

  // --- Types ---
  const addType = async (name: string) => {
    if (!user) return
    const { data, error } = await supabase.from('expense_types').insert([{
      user_id: user.id, name: name.trim(), sort_order: types.length,
    }]).select().single()
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    if (data) setTypes(prev => [...prev, data])
    showToast(`Tipo "${name}" creado`)
  }

  const editType = async (id: string, name: string) => {
    if (!user) return
    const { error } = await supabase.from('expense_types').update({ name: name.trim() }).eq('id', id)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    setTypes(prev => prev.map(t => t.id === id ? { ...t, name: name.trim() } : t))
    showToast(`Tipo actualizado`)
  }

  const setTypeBucket = async (id: string, bucket: Bucket) => {
    const { error } = await supabase.from('expense_types').update({ bucket }).eq('id', id)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    setTypes(prev => prev.map(t => t.id === id ? { ...t, bucket } : t))
  }

  const deleteType = async (id: string) => {
    if (expenses.some(e => e.type_id === id)) {
      showToast('No se puede eliminar un tipo con gastos asociados', 'error')
      return
    }
    const t = types.find(t => t.id === id)
    await supabase.from('expense_types').delete().eq('id', id)
    setTypes(prev => prev.filter(t => t.id !== id))
    showToast(`Tipo "${t?.name}" eliminado`)
  }

  // --- Categories ---
  const addCategory = async (name: string) => {
    if (!user) return
    const { data, error } = await supabase.from('categories')
      .insert([{ user_id: user.id, name: name.trim() }]).select().single()
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    if (data) setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    showToast(`Categoría "${name}" creada`)
  }

  const editCategory = async (id: string, name: string) => {
    if (!user) return
    const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', id)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: name.trim() } : c).sort((a, b) => a.name.localeCompare(b.name)))
    showToast('Categoría actualizada')
  }

  const deleteCategory = async (id: string) => {
    if (expenses.some(e => e.category_id === id)) {
      showToast('No se puede eliminar una categoría en uso', 'error')
      return
    }
    const c = categories.find(c => c.id === id)
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
    showToast(`Categoría "${c?.name}" eliminada`)
  }

  // --- Accounts ---
  const addAccount = async (name: string, accountNumber: string) => {
    if (!user) return
    const { data, error } = await supabase.from('accounts')
      .insert([{ user_id: user.id, name: name.trim(), account_number: accountNumber.trim() || null }])
      .select().single()
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    if (data) setAccounts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    showToast(`Cuenta "${name}" creada`)
  }

  const editAccount = async (id: string, name: string, accountNumber: string) => {
    if (!user) return
    const { error } = await supabase.from('accounts').update({
      name: name.trim(), account_number: accountNumber.trim() || null,
    }).eq('id', id)
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, name: name.trim(), account_number: accountNumber.trim() || null } : a).sort((a, b) => a.name.localeCompare(b.name)))
    showToast('Cuenta actualizada')
  }

  const deleteAccount = async (id: string) => {
    if (expenses.some(e => e.account_id === id)) {
      showToast('No se puede eliminar una cuenta con gastos asociados', 'error')
      return
    }
    const a = accounts.find(a => a.id === id)
    await supabase.from('accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    showToast(`Cuenta "${a?.name}" eliminada`)
  }

  // --- Profile ---
  const theme: Theme = settings?.theme || 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = async (t: Theme) => {
    if (!user || !settings) return
    setSettings(prev => prev ? { ...prev, theme: t } : prev)
    document.documentElement.setAttribute('data-theme', t)
    await supabase.from('user_settings').update({ theme: t }).eq('id', settings.id)
    showToast(`Tema ${t === 'dark' ? 'oscuro' : 'claro'} aplicado`)
  }

  const displayName = user?.user_metadata?.display_name || ''

  const updateDisplayName = async (name: string) => {
    const { error } = await supabase.auth.updateUser({ data: { display_name: name.trim() } })
    if (error) { showToast('Error: ' + error.message, 'error'); return }
    setUser((prev: any) => prev ? { ...prev, user_metadata: { ...prev.user_metadata, display_name: name.trim() } } : prev)
    showToast('Nombre actualizado')
  }

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { showToast('Error: ' + error.message, 'error'); return false }
    showToast('Contraseña actualizada')
    return true
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // --- Derived ---
  const totalIncome = income?.amount || 0
  const expensesByType: ExpensesByType[] = types.map(t => {
    const items = expenses.filter(e => e.type_id === t.id)
    const totalCrc = items.reduce((s, e) => s + Number(e.amount_crc), 0)
    return { type: t, items, totalCrc }
  })
  const expensesByAccount: ExpensesByAccount[] = accounts.map(a => {
    const items = expenses.filter(e => e.account_id === a.id)
    const totalCrc = items.reduce((s, e) => s + Number(e.amount_crc), 0)
    return { account: a, items, totalCrc }
  })
  const unassignedExpenses = expenses.filter(e => !e.account_id)
  const unassignedTotalCrc = unassignedExpenses.reduce((s, e) => s + Number(e.amount_crc), 0)

  const totalExpensesCrc = expenses.reduce((s, e) => s + Number(e.amount_crc), 0)
  const remainingCrc = totalIncome - totalExpensesCrc
  const pct = (v: number) => totalIncome ? ((v / totalIncome) * 100).toFixed(1) : '0.0'

  const bucketTotals = (() => {
    const gastoTypes = types.filter(t => t.bucket === 'gastos')
    const ocioTypes = types.filter(t => t.bucket === 'ocio')
    const ahorroTypes = types.filter(t => t.bucket === 'ahorros')
    const gastosCrc = expenses.filter(e => gastoTypes.some(t => t.id === e.type_id)).reduce((s, e) => s + Number(e.amount_crc), 0)
    const ocioCrc = expenses.filter(e => ocioTypes.some(t => t.id === e.type_id)).reduce((s, e) => s + Number(e.amount_crc), 0)
    const ahorrosCrc = expenses.filter(e => ahorroTypes.some(t => t.id === e.type_id)).reduce((s, e) => s + Number(e.amount_crc), 0)
    return {
      gastos: { types: gastoTypes, totalCrc: gastosCrc },
      ocio: { types: ocioTypes, totalCrc: ocioCrc },
      ahorros: { types: ahorroTypes, totalCrc: ahorrosCrc },
    }
  })()
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name || ''
  const accountName = (id: string | null) => accounts.find(a => a.id === id)?.name || ''

  return {
    user, loading, period, rate, syncCount, toast, showToast,
    theme, setTheme, displayName, updateDisplayName, changePassword,
    income, totalIncome, saveIncome,
    settings, syncRate,
    types, addType, editType, setTypeBucket, deleteType, bucketTotals,
    categories, addCategory, editCategory, deleteCategory,
    accounts, addAccount, editAccount, deleteAccount,
    expenses, addExpense, editExpense, deleteExpense,
    expensesByType, expensesByAccount, unassignedExpenses, unassignedTotalCrc,
    totalExpensesCrc, remainingCrc, pct, catName, accountName,
    handleLogout,
  }
}

export type FinanceData = ReturnType<typeof useFinanceData>
