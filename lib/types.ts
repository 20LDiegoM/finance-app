export type Bucket = 'gastos' | 'ocio' | 'ahorros' | null

export type ExpenseType = {
  id: string
  name: string
  sort_order: number
  bucket: Bucket
}

export type Category = {
  id: string
  name: string
}

export type Account = {
  id: string
  name: string
  account_number: string | null
}

export type ExpenseRow = {
  id: string
  name: string
  amount: number
  type_id: string
  category_id: string | null
  account_id: string | null
  currency: string
  amount_crc: number
}

export type Income = {
  id: string
  amount: number
  period: string
}

export type UserSettings = {
  id: string
  exchange_rate: number
  theme: Theme
}

export type Tab = 'presupuesto' | 'gastos' | 'pagos' | 'settings' | 'profile'

export type Theme = 'light' | 'dark'

export type ExpensesByType = {
  type: ExpenseType
  items: ExpenseRow[]
  totalCrc: number
}

export type ExpensesByAccount = {
  account: Account
  items: ExpenseRow[]
  totalCrc: number
}
