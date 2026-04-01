export function crc(n: number) {
  return '₡' + n.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function usd(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function getCurrentPeriod() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function periodLabel(p: string) {
  const [y, m] = p.split('-')
  const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${names[parseInt(m) - 1]} ${y}`
}

export const INPUT_CLASS = 'input-field'
