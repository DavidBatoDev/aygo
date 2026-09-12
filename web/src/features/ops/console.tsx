import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Boxes, CalendarDays, Check, ChevronRight, CircleHelp, ClipboardList, Command, Factory, LayoutDashboard, Layers, Package, Palette, RotateCcw, Search, Sparkles, Tent, type LucideIcon } from 'lucide-react'
import { Catalogue, Inventory } from './catalogue'
import { Calendar, DayDrawer } from './calendar'
import { Events, EventDrawer, NewEvent } from './events'
import { Orders, OrderDrawer, NewOrder } from './orders'
import { Overview } from './overview'
import { AdjustStock, NewProduct, ProductDrawer } from './product-drawers'
import { Equipment, Suppliers, SupplierDrawer } from './resources'
import { day, fmt, stockRows, stockState, type Sheet, type View } from './model'
import { useOps } from './store'
import { Button, Drawer, Empty, SearchBox, Tag, Toast } from './ui'
import './ops.css'

export const paths = { overview: '/', catalogue: '/catalogue', inventory: '/inventory', orders: '/orders', events: '/events', equipment: '/equipment', suppliers: '/suppliers', calendar: '/calendar' } as const
const navigation: { view: View; label: string; icon: LucideIcon; group?: string }[] = [
  { view: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { view: 'catalogue', label: 'Catalogue', icon: Layers },
  { view: 'inventory', label: 'Inventory', icon: Boxes },
  { view: 'orders', label: 'Orders', icon: ClipboardList },
  { view: 'events', label: 'Events', icon: Tent, group: 'Plan & deliver' },
  { view: 'equipment', label: 'Equipment', icon: Package },
  { view: 'suppliers', label: 'Suppliers', icon: Factory },
  { view: 'calendar', label: 'Calendar', icon: CalendarDays },
]

export function OpsConsole({ view = 'overview' }: { view?: View }) {
  const { data, open, sheet, toast } = useOps()
  const navigate = useNavigate()
  const go = (target: View) => { void navigate({ to: paths[target] }); window.scrollTo({ top: 0 }) }
  const counts: Partial<Record<View, number>> = { inventory: stockRows(data.products).filter(r => stockState(r.v) !== 'ok').length, orders: data.orders.filter(o => o.status !== 'Delivered').length, events: data.events.filter(e => e.end >= day()).length }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open({ type: 'search' }) } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])
  useEffect(() => { document.title = `${navigation.find(n => n.view === view)!.label} · Aygo workspace` }, [view])
  return <div className="ops ops-app">
    <a className="ops-skip-link" href="#workspace">Skip to workspace</a>
    <aside className="ops-rail"><Link to="/" className="ops-logo" aria-label="Aygo overview"><img className="full-logo" src="/aygo-wordmark.svg" alt="Aygo" /><img className="icon-logo" src="/aygo-icon.svg" alt="Aygo" /><span>workspace</span></Link>
      <button className="ops-workspace-switch" onClick={() => open({ type: 'help' })}><span className="ops-workspace-mark"><img src="/aygo-icon.svg" alt="" /></span><span><strong>Aygo Philippines</strong><small>Operations console</small></span><ChevronRight size={14} /></button>
      <nav aria-label="Main navigation">{navigation.map(({ view: target, label, icon: Icon, group }) => <div key={target}>{group && <p className="ops-nav-group">{group}</p>}<Link to={paths[target]} className={`ops-nav-item ${view === target ? 'active' : ''}`} aria-label={label} aria-description={counts[target] ? `${counts[target]} active items` : undefined} aria-current={view === target ? 'page' : undefined} title={label}><Icon size={19} strokeWidth={1.65} /><span>{label}</span>{counts[target] !== undefined && counts[target]! > 0 && <small>{counts[target]}</small>}</Link></div>)}</nav>
      <div className="ops-rail-bottom"><div className="ops-demo-card"><span><Sparkles size={17} />A little good, every day.</span><p>Your next great client experience starts right here.</p><button onClick={() => open({ type: 'new-order' })}>Make it happen<ArrowRight size={14} /></button></div><button className="ops-nav-item" title="Demo guide" onClick={() => open({ type: 'help' })}><CircleHelp size={19} /><span>Demo guide</span></button><Link className="ops-nav-item" title="Brand kit" to="/brand-kit"><Palette size={19} /><span>Brand kit</span></Link><button className="ops-nav-item" title="Reset demo" onClick={() => open({ type: 'reset' })}><RotateCcw size={18} /><span>Reset demo</span></button><div className="ops-rail-profile"><span className="ops-user-avatar">MS</span><span><strong>Mia Santos</strong><small>Aygo team · Demo</small></span><span className="ops-online-dot" /></div></div>
    </aside>
    <div className="ops-workspace"><header className="ops-topbar"><div className="ops-breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>{navigation.find(n => n.view === view)!.label}</strong></div><div className="ops-topbar-actions"><button className="ops-global-search" onClick={() => open({ type: 'search' })}><Search size={16} /><span>Find anything…</span><kbd><Command size={10} />K</kbd></button><span className="ops-topbar-date">{fmt(day(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span><Tag tone="blue" dot={false}>Demo mode</Tag><span className="ops-user-avatar small">MS</span></div></header>
      <main id="workspace" className="ops-content">
        {view === 'overview' && <Overview go={go} />}
        {view === 'catalogue' && <Catalogue />}
        {view === 'inventory' && <Inventory />}
        {view === 'orders' && <Orders />}
        {view === 'events' && <Events />}
        {view === 'equipment' && <Equipment />}
        {view === 'suppliers' && <Suppliers />}
        {view === 'calendar' && <Calendar />}
      </main>
    </div>
    {sheet && <SheetContent key={sheet.type + ('id' in sheet ? sheet.id : '')} sheet={sheet} />}
    {toast && !sheet && <Toast key={toast.id} message={toast.message} />}
  </div>
}

function SheetContent({ sheet }: { sheet: Sheet }) {
  switch (sheet.type) {
    case 'product': return <ProductDrawer id={sheet.id} />
    case 'stock': return <AdjustStock id={sheet.id} />
    case 'new-product': return <NewProduct />
    case 'order': return <OrderDrawer id={sheet.id} />
    case 'new-order': return <NewOrder />
    case 'event': return <EventDrawer id={sheet.id} />
    case 'new-event': return <NewEvent />
    case 'supplier': return <SupplierDrawer id={sheet.id} />
    case 'day': return <DayDrawer date={sheet.id} />
    case 'help': return <DemoGuide />
    case 'reset': return <ResetDemo />
    case 'search': return <GlobalSearch />
  }
}

function DemoGuide() {
  const { open } = useOps()
  const steps: { title: string; detail: string; sheet: Sheet }[] = [
    { title: 'Meet your operations workspace', detail: 'Start with AY-2607. Its navy polos are short by 24 pieces during production.', sheet: { type: 'order', id: 'o1' } },
    { title: 'Keep a client promise', detail: 'Open the short stock row, receive 24 pieces, and watch the warning clear.', sheet: { type: 'stock', id: 'app-polo-navy-L'.toLowerCase() } },
    { title: 'Turn a conversation into an order', detail: 'Build a multi-line order, then move it from Inquiry to Quoted to Approved.', sheet: { type: 'new-order' } },
    { title: 'Bring the right gear and crew', detail: 'The FSI summit and Innovators’ Day share an LED wall. See the overlap and assign crew.', sheet: { type: 'event', id: 'e1' } },
    { title: 'Leave the next step on the calendar', detail: 'Create a follow-up, mark it done, and reopen it.', sheet: { type: 'day', id: day() } },
  ]
  return <Drawer title="A workspace worth walking through." subtitle="Your five-minute demo guide." onClose={() => open(null)}><div className="ops-callout tone-blue"><strong>You’re in a live, interactive demo.</strong><p>Changes are shared across screens for this session. Refreshing the page or using Reset demo restores the starting data.</p></div><div className="ops-guide-steps">{steps.map((step, i) => <button key={step.title} onClick={() => open(step.sheet)}><span>{i + 1}</span><div><h3>{step.title}</h3><p>{step.detail}</p></div><ArrowRight size={17} /></button>)}</div><p className="ops-note">Products and equipment are inspired by the JJT catalogue. Prices, clients, inventory, and bookings are sample data for this presentation.</p></Drawer>
}
function ResetDemo() {
  const { open, reset } = useOps()
  return <Drawer title="Ready for a fresh walkthrough?" subtitle="Reset your demo workspace." onClose={() => open(null)} footer={<><Button variant="secondary" onClick={() => open(null)}>Keep exploring</Button><Button onClick={reset}><RotateCcw size={15} />Reset demo</Button></>}><div className="ops-callout tone-blue">This restores the starting products, stock, orders, events, and agenda. Changes made during this demo session will be cleared.</div><div className="ops-reset-checklist">{['33 products and 163 stock rows', 'Six orders and three shortage stories', 'Five events and 13 equipment items', 'A fresh calendar, relative to today'].map(item => <p key={item}><Check size={16} />{item}</p>)}</div></Drawer>
}
function GlobalSearch() {
  const { data, open } = useOps()
  const [query, setQuery] = useState('')
  const all: { title: string; detail: string; sheet: Sheet }[] = [
    ...data.products.map(p => ({ title: p.name, detail: `${p.sku} · Product`, sheet: { type: 'product' as const, id: p.id } })),
    ...data.orders.map(o => ({ title: `${o.code} · ${o.client}`, detail: `${o.status} · Order`, sheet: { type: 'order' as const, id: o.id } })),
    ...data.events.map(e => ({ title: e.name, detail: `${e.client} · Event`, sheet: { type: 'event' as const, id: e.id } })),
    ...data.suppliers.map(s => ({ title: s.name, detail: `${s.city} · Supplier`, sheet: { type: 'supplier' as const, id: s.id } })),
  ]
  const results = query.trim() ? all.filter(r => `${r.title} ${r.detail}`.toLowerCase().includes(query.toLowerCase())).slice(0, 15) : all.filter(r => r.sheet.type === 'order').slice(0, 5)
  return <Drawer title="Find your next step." subtitle="Search products, orders, events, and suppliers." onClose={() => open(null)}><SearchBox value={query} onChange={setQuery} placeholder="Try a client, product, or order code…" /><p className="ops-muted text-xs mt-4 mb-2">{query ? 'Matching records' : 'Start with an order'}</p><div className="ops-search-results">{results.map((r, i) => <button key={i} onClick={() => open(r.sheet)}><span><strong>{r.title}</strong><small>{r.detail}</small></span><ArrowRight size={16} /></button>)}</div>{!results.length && <Empty title="No matching records">Try a different client name, product, or code.</Empty>}</Drawer>
}
