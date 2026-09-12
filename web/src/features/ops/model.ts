export const categories = ['Apparel', 'Bags & Totes', 'Drinkware', 'Eco Line', 'Tech & Gadgets', 'Event Print', 'Rain Gear & Care'] as const
export const orderStages = ['Inquiry', 'Quoted', 'Approved', 'In production', 'Ready', 'Delivered'] as const
export const eventStages = ['Quoted', 'Confirmed', 'On site', 'Wrapped'] as const
export const methods = ['Silkscreen', 'DTF', 'Sublimation', 'Embroidery', 'Laser', 'UV print', 'Pad print', 'Foil', 'Full-colour', 'Sticker', 'Flexo']
export const channels = ['Website enquiry', 'Account manager', 'Referral', 'Repeat client', 'Walk-in']
export const crewRoles = ['Event lead', 'Host', 'Tech crew', 'Booth staff', 'Registration', 'Photographer']
export const reasons = ['Stock received', 'Counted and correcting', 'Damaged or rejected', 'Sample pulled', 'Returned to supplier']
export const inks: Record<string, string> = { Black: '#24262c', White: '#ffffff', Navy: '#233553', Royal: '#245bd4', Red: '#d34845', Forest: '#2e604b', Beige: '#d4bda0', Grey: '#92999f', Maroon: '#773944', Yellow: '#eed16a', Bamboo: '#caa575', Kraft: '#b8946e', Sky: '#9ac6e5', Violet: '#8e74b6', Pink: '#e8abc3', Silver: '#bbc2ca', Clear: '#edf4f6', Olive: '#73785a' }
export type View = 'overview' | 'catalogue' | 'inventory' | 'orders' | 'events' | 'equipment' | 'suppliers' | 'calendar'
export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'neutral'
export interface Variant { id: string; color: string; hex: string; size: string | null; qty: number; committed: number; reorder: number }
export interface Product { id: string; sku: string; name: string; category: typeof categories[number]; supplierId: string; price: number; cost: number; moq: number; methods: string[]; variants: Variant[]; note: string; image: string; active: boolean }
export interface OrderLine { pid: string; vid: string; qty: number; price: number; method: string }
export interface Order { id: string; code: string; client: string; contact: string; status: typeof orderStages[number]; created: string; due: string; channel: string; lines: OrderLine[]; notes: string; deliveredDeltas?: Record<string, number> }
export interface OpsEvent { id: string; name: string; client: string; venue: string; start: string; end: string; status: typeof eventStages[number]; pax: number; equipment: string[]; crew: { role: string; name: string }[]; orderId: string | null; notes: string }
export interface Equipment { id: string; code: string; name: string; kind: string; rate: number; condition: string; base: string; maintenance: boolean; image: string }
export interface Supplier { id: string; name: string; city: string; contact: string; phone: string; email: string; lead: number; terms: string; covers: string[] }
export interface Agenda { id: string; date: string; type: 'sale' | 'meeting' | 'email'; title: string; who: string; done: boolean }
export interface Adjustment { id: string; vid: string; delta: number; reason: string; at: string }
export interface DemoData { products: Product[]; orders: Order[]; events: OpsEvent[]; equipment: Equipment[]; suppliers: Supplier[]; agenda: Agenda[]; adjustments: Adjustment[] }
export type Sheet = { type: 'product' | 'stock' | 'order' | 'event' | 'supplier' | 'day'; id: string } | { type: 'new-product' | 'new-order' | 'new-event' | 'help' | 'reset' | 'search' }

export const uid = () => crypto.randomUUID()
export function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function day(offset = 0) { const date = new Date(); date.setDate(date.getDate() + offset); return iso(date) }
export function parseDate(date: string) { return new Date(`${date}T12:00:00`) }
export function fmt(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) { return parseDate(date).toLocaleDateString('en-PH', options) }
export function daysOut(date: string) { const parts = (value: string) => value.split('-').map(Number); const [y, m, d] = parts(date); const [ty, tm, td] = parts(day()); return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000) }
export function relative(date: string) { const days = daysOut(date); return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days < 0 ? `${-days} days overdue` : `In ${days} days` }
export const peso = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: value % 1 ? 2 : 0 }).format(value)
export const number = (value: number) => value.toLocaleString('en-PH')
export const free = (v: Variant) => v.qty - v.committed
export const stockState = (v: Variant) => free(v) <= 0 ? 'out' : free(v) < v.reorder ? 'low' : 'ok'
export const variantLabel = (v: Variant) => `${v.color}${v.size ? ` / ${v.size}` : ''}`
export const orderTotal = (o: Pick<Order, 'lines'>) => o.lines.reduce((sum, l) => sum + l.qty * l.price, 0)
export const orderUnits = (o: Order) => o.lines.reduce((sum, l) => sum + l.qty, 0)
export const heldStage = (status: Order['status']) => ['Approved', 'In production', 'Ready'].includes(status)
export const stockRows = (products: Product[]) => products.flatMap(p => p.variants.map(v => ({ p, v }))).sort((a, b) => free(a.v) - free(b.v))
export const overlaps = (as: string, ae: string, bs: string, be: string) => as <= be && bs <= ae
export function stageTone(status: string): Tone { return ({ Inquiry: 'neutral', Quoted: 'purple', Approved: 'blue', 'In production': 'blue', Ready: 'green', Delivered: 'neutral', Confirmed: 'blue', 'On site': 'amber', Wrapped: 'neutral' } as Record<string, Tone>)[status] ?? 'neutral' }

export function shortages(products: Product[], order: Order) {
  if (order.status === 'Delivered') return []
  const grouped = new Map<string, number>()
  order.lines.forEach(l => grouped.set(l.vid, (grouped.get(l.vid) ?? 0) + l.qty))
  return [...grouped].flatMap(([vid, qty]) => {
    const row = stockRows(products).find(r => r.v.id === vid)
    if (!row) return []
    const available = heldStage(order.status) ? row.v.qty : free(row.v)
    return available < qty ? [{ ...row, deficit: qty - available }] : []
  })
}

/** Atomic, adjacent, idempotent stage movement. Track actual deductions to undo clamped delivery exactly. */
export function transition(data: DemoData, id: string, next: Order['status']): DemoData {
  const order = data.orders.find(o => o.id === id)
  if (!order) throw new Error('Order not found')
  if (order.status === next) return data
  if (Math.abs(orderStages.indexOf(next) - orderStages.indexOf(order.status)) !== 1) throw new Error('Move one stage at a time')
  const quantities = new Map<string, number>()
  order.lines.forEach(l => quantities.set(l.vid, (quantities.get(l.vid) ?? 0) + l.qty))
  const deductions: Record<string, number> = {}
  const products = data.products.map(p => ({ ...p, variants: p.variants.map(v => {
    const qty = quantities.get(v.id)
    if (!qty) return v
    let onHand = v.qty
    let committed = v.committed + (heldStage(next) ? qty : 0) - (heldStage(order.status) ? qty : 0)
    if (next === 'Delivered') { deductions[v.id] = Math.min(v.qty, qty); onHand -= deductions[v.id] }
    if (order.status === 'Delivered') onHand += order.deliveredDeltas?.[v.id] ?? qty
    committed = Math.max(0, committed)
    return { ...v, qty: Math.max(0, onHand), committed }
  }) }))
  return { ...data, products, orders: data.orders.map(o => o.id === id ? { ...o, status: next, deliveredDeltas: next === 'Delivered' ? deductions : undefined } : o) }
}

export function adjustStock(data: DemoData, vid: string, delta: number, reason: string): DemoData {
  const row = stockRows(data.products).find(r => r.v.id === vid)
  if (!row || !Number.isInteger(delta) || delta === 0 || !reasons.includes(reason)) throw new Error('Enter a whole quantity and a reason')
  if (row.v.qty + delta < 0) throw new Error('On hand cannot go below zero')
  return { ...data, products: data.products.map(p => ({ ...p, variants: p.variants.map(v => v.id === vid ? { ...v, qty: v.qty + delta } : v) })), adjustments: [{ id: uid(), vid, delta, reason, at: new Date().toISOString() }, ...data.adjustments] }
}

export function gearStatus(eq: Equipment, events: OpsEvent[], date = day()): { label: string; tone: Tone; event?: OpsEvent } {
  if (eq.maintenance) return { label: 'In maintenance', tone: 'amber' }
  const bookings = events.filter(e => e.equipment.includes(eq.id) && e.status !== 'Wrapped').sort((a, b) => a.start.localeCompare(b.start))
  const current = bookings.find(e => e.status !== 'Quoted' && e.start <= date && e.end >= date)
  if (current) return { label: 'Out on site', tone: 'red', event: current }
  const quoted = bookings.find(e => e.end >= date && e.status === 'Quoted')
  if (quoted) return { label: 'Held for quote', tone: 'purple', event: quoted }
  const future = bookings.find(e => e.start > date)
  if (future) return { label: 'Reserved', tone: 'blue', event: future }
  return { label: 'Available', tone: 'green' }
}
export function conflicts(eqId: string, event: OpsEvent, events: OpsEvent[]) { return events.filter(e => e.id !== event.id && e.status !== 'Wrapped' && e.equipment.includes(eqId) && overlaps(event.start, event.end, e.start, e.end)) }
export interface CalendarEntry { id: string; title: string; detail: string; type: 'sale' | 'meeting' | 'email' | 'delivery' | 'event'; tone: Tone; done: boolean; sheet?: Sheet }
export const entryTypes = { sale: { label: 'Sales call', tone: 'green' }, meeting: { label: 'Meeting', tone: 'blue' }, email: { label: 'Follow-up', tone: 'purple' }, delivery: { label: 'Delivery', tone: 'amber' }, event: { label: 'Event', tone: 'red' } } as const
export function entriesOn(data: DemoData, date: string): CalendarEntry[] {
  return [
    ...data.orders.filter(o => o.due === date && o.status !== 'Delivered').map(o => ({ id: o.id, title: o.client, detail: `${o.code} · ${orderUnits(o)} pieces`, type: 'delivery' as const, tone: 'amber' as const, done: false, sheet: { type: 'order' as const, id: o.id } })),
    ...data.events.filter(e => e.start <= date && e.end >= date).map(e => ({ id: e.id, title: e.name, detail: e.venue, type: 'event' as const, tone: 'red' as const, done: false, sheet: { type: 'event' as const, id: e.id } })),
    ...data.agenda.filter(a => a.date === date).map(a => ({ id: a.id, title: a.title, detail: a.who, type: a.type, tone: entryTypes[a.type].tone, done: a.done })),
  ]
}
