import { ArrowRight, CalendarDays, CircleAlert, ClipboardList, PackageCheck, Plus, Truck, Users } from 'lucide-react'
import { day, daysOut, entriesOn, fmt, free, gearStatus, heldStage, number, orderStages, orderTotal, peso, stockRows, stockState, variantLabel, type View } from './model'
import { useOps } from './store'
import { Button, Empty, Metric, Panel, SectionTitle, StockBar, Swatch, Tag, TextLink } from './ui'

export function Overview({ go }: { go: (view: View) => void }) {
  const { data, open } = useOps()
  const active = data.orders.filter(o => o.status !== 'Delivered')
  const rows = stockRows(data.products)
  const risk = rows.filter(r => stockState(r.v) !== 'ok')
  const upcoming = data.events.filter(e => e.end >= day()).sort((a, b) => a.start.localeCompare(b.start))
  return <>
    <SectionTitle title="A good day to make things happen." description="Your orders, your stock, your week. All in one place.">
      <Button variant="secondary" onClick={() => go('calendar')}><CalendarDays size={16} />View calendar</Button>
      <Button onClick={() => open({ type: 'new-order' })}><Plus size={17} />New order</Button>
    </SectionTitle>

    <Panel title="The week ahead" description={`${fmt(day())} – ${fmt(day(6), { day: 'numeric', month: 'short', year: 'numeric' })}`} action={<Tag tone="blue" dot={false}><span className="ops-live-dot" />Live workspace</Tag>} flush>
      <div className="ops-dispatch">{Array.from({ length: 7 }, (_, i) => {
        const date = day(i)
        const entries = entriesOn(data, date).filter(e => !e.done)
        return <div className={`ops-dispatch-day ${i === 0 ? 'today' : ''}`} key={date}>
          <button className="ops-day-label" onClick={() => open({ type: 'day', id: date })}><span>{i === 0 ? 'Today' : fmt(date, { weekday: 'short' })}</span><strong>{fmt(date, { day: '2-digit' })}</strong></button>
          <div className="ops-dispatch-items">{entries.slice(0, 3).map(entry => <button key={entry.id} className={`ops-agenda-chip tone-${entry.tone}`} title={entry.title} onClick={() => open(entry.sheet ?? { type: 'day', id: date })}><span className="ops-status-dot" /><span>{entry.title}</span></button>)}{!entries.length && <span className="ops-clear">A little breathing room</span>}{entries.length > 3 && <button className="ops-more" onClick={() => open({ type: 'day', id: date })}>+{entries.length - 3} more</button>}</div>
        </div>
      })}</div>
    </Panel>

    <div className="ops-metrics">
      <Metric title="Orders in play" value={number(active.length)} detail={<>{peso(active.reduce((sum, o) => sum + orderTotal(o), 0))} in the pipeline</>} icon={<ClipboardList size={19} />} blue />
      <Metric title="Pieces promised" value={number(rows.reduce((sum, r) => sum + r.v.committed, 0))} detail={<>Across {data.orders.filter(o => heldStage(o.status)).length} approved orders</>} icon={<PackageCheck size={19} />} />
      <Metric title="Stock needs attention" value={number(risk.length)} detail={<span className="text-warning">{risk.filter(r => stockState(r.v) === 'out').length} out of stock · {risk.filter(r => stockState(r.v) === 'low').length} below reorder</span>} icon={<CircleAlert size={19} />} />
      <Metric title="Gear out today" value={number(data.equipment.filter(eq => gearStatus(eq, data.events).label === 'Out on site').length)} detail={<>Of {data.equipment.length} items in your equipment pool</>} icon={<Truck size={19} />} />
    </div>

    <div className="ops-overview-split">
      <Panel title="A little attention goes a long way" description="Your lowest free-stock rows, first." action={<TextLink onClick={() => go('inventory')}>View inventory</TextLink>} flush>
        <div className="ops-risk-list">{risk.slice(0, 7).map(({ p, v }) => <button key={v.id} className="ops-risk-row" onClick={() => { go('inventory'); open({ type: 'stock', id: v.id }) }}>
          <Swatch hex={v.hex} label={v.color} /><span className="ops-risk-name"><strong>{p.name}</strong><small>{variantLabel(v)}</small></span><span className="ops-risk-level"><StockBar v={v} /><small>Reorder at {v.reorder}</small></span><span className={`ops-risk-qty stock-text-${stockState(v)}`}><strong>{free(v)}</strong><small>free</small></span><ArrowRight size={15} className="text-ink-400" />
        </button>)}{!risk.length && <Empty title="Everything is above its reorder point">Your warehouse is in a good place.</Empty>}</div>
        <div className="ops-panel-note"><CircleAlert size={14} />Free stock = on hand − held. It’s what you can promise.</div>
      </Panel>

      <Panel title="Next on the ground" description="The people, places, and plans coming together." action={<TextLink onClick={() => go('events')}>All events</TextLink>} flush>
        {upcoming[0] && <button className="ops-event-spotlight" onClick={() => open({ type: 'event', id: upcoming[0].id })}><div><Tag tone="blue" dot={false}>On the calendar</Tag><h3>{upcoming[0].name}</h3><p>{upcoming[0].client}</p><span><CalendarDays size={14} />{fmt(upcoming[0].start)} – {fmt(upcoming[0].end)}</span></div><img src="/equipment/booth.webp" alt="Branded event booth" /></button>}
        <div className="ops-upcoming-list">{upcoming.slice(1, 4).map(e => <button key={e.id} onClick={() => open({ type: 'event', id: e.id })}><span className="ops-date-tile"><small>{fmt(e.start, { month: 'short' })}</small><strong>{fmt(e.start, { day: '2-digit' })}</strong></span><span className="min-w-0 flex-1"><strong>{e.name}</strong><small>{e.venue}</small></span><span className="ops-pax"><Users size={13} />{e.pax}</span></button>)}</div>
      </Panel>
    </div>

    <Panel title="Good things in motion" description="Every order, from the first hello to the final handoff." action={<TextLink onClick={() => go('orders')}>All orders</TextLink>} flush>
      <div className="ops-pipeline">{orderStages.slice(0, 5).map((stage, index) => {
        const orders = active.filter(o => o.status === stage)
        return <div className="ops-pipeline-column" key={stage}><div className="ops-pipeline-title"><span className={`ops-stage-dot stage-${index}`} /><h3>{stage}</h3><span>{orders.length}</span></div>{orders.map(o => <button className="ops-order-card" key={o.id} onClick={() => open({ type: 'order', id: o.id })}><div><span className="ops-code">{o.code}</span><ArrowRight size={14} /></div><h4>{o.client}</h4><strong>{peso(orderTotal(o))}</strong><footer><span className="flex -space-x-1">{o.lines.slice(0, 3).map((l, i) => { const v = data.products.find(p => p.id === l.pid)!.variants.find(v => v.id === l.vid)!; return <Swatch key={i} hex={v.hex} label={v.color} small /> })}</span><span className={daysOut(o.due) <= 3 ? 'text-danger' : ''}>{fmt(o.due)}</span></footer></button>)}{!orders.length && <div className="ops-pipeline-empty">Nothing here. Yet.</div>}</div>
      })}</div>
    </Panel>
    <div className="ops-workspace-foot"><span><span className="ops-live-dot" />All figures calculated from your demo workspace</span><span>Made for good work. Made with Aygo.</span></div>
  </>
}
