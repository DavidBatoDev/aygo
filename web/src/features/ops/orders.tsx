import { useState } from 'react'
import { ArrowLeft, ArrowRight, CircleAlert, Plus, Trash2 } from 'lucide-react'
import { channels, day, daysOut, fmt, free, number, orderStages, orderTotal, orderUnits, peso, relative, shortages, stageTone, transition, uid, variantLabel, type Order, type OrderLine } from './model'
import { useOps } from './store'
import { Button, Drawer, Empty, Field, Filter, IconButton, InfoGrid, Panel, ProductImage, Row, RowEnd, SearchBox, SectionTitle, Swatch, Table, Tag } from './ui'

export function Orders() {
  const { data, open } = useOps()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const filtered = data.orders.filter(o => `${o.client} ${o.code}`.toLowerCase().includes(search.toLowerCase()) && (!stage || o.status === stage))
  return <>
    <SectionTitle title="From first hello to handoff." description="Keep every promise moving. Your merchandise orders, at a glance."><Button onClick={() => open({ type: 'new-order' })}><Plus size={17} />New order</Button></SectionTitle>
    <div className="ops-order-stage-summary">{orderStages.map(s => <button aria-pressed={stage === s} key={s} onClick={() => setStage(stage === s ? '' : s)}><Tag tone={stageTone(s)}>{s}</Tag><strong>{data.orders.filter(o => o.status === s).length}</strong><span>{peso(data.orders.filter(o => o.status === s).reduce((sum, o) => sum + orderTotal(o), 0))}</span></button>)}</div>
    <Panel flush><div className="ops-toolbar inset"><SearchBox value={search} onChange={setSearch} placeholder="Search client or order code…" /><Filter label="All stages" value={stage} onChange={setStage} options={orderStages} /><span className="ops-result-count">{filtered.length} orders · <strong>{peso(filtered.reduce((s, o) => s + orderTotal(o), 0))}</strong></span></div><Table headers={['Client / order', 'Stage', 'Pieces', 'Order value', 'Needed by', 'Source', '']} empty={!filtered.length}>{filtered.map(o => <Row key={o.id} onClick={() => open({ type: 'order', id: o.id })}><td><div className="ops-client-cell"><span className="ops-client-avatar">{o.client.split(' ').map(s => s[0]).slice(0, 2).join('')}</span><div><strong>{o.client}</strong><small>{o.code} · {o.lines.length} {o.lines.length === 1 ? 'line' : 'lines'}</small></div></div></td><td><Tag tone={stageTone(o.status)}>{o.status}</Tag></td><td>{number(orderUnits(o))}</td><td><strong>{peso(orderTotal(o))}</strong></td><td><span>{fmt(o.due)}</span><small className={o.status !== 'Delivered' && daysOut(o.due) <= 3 ? 'text-danger' : ''}>{o.status === 'Delivered' ? 'Delivered' : relative(o.due)}</small></td><td>{o.channel}</td><td><RowEnd /></td></Row>)}</Table><div className="ops-table-footer"><span>Quotes keep stock free. Approval creates a hold.</span><span>All values in Philippine pesos</span></div></Panel>
  </>
}

export function OrderDrawer({ id }: { id: string }) {
  const { data, open, commit } = useOps()
  const order = data.orders.find(o => o.id === id)!
  const index = orderStages.indexOf(order.status)
  const short = shortages(data.products, order)
  const next = orderStages[index + 1]
  const prev = orderStages[index - 1]
  const explanations = [
    'Moving to Quoted records that your price has been sent. Stock stays free until the client approves.',
    `Moving to Approved will hold ${number(orderUnits(order))} pieces for this order. Short lines can still be approved and will remain flagged for restocking.`,
    'Moving to In production keeps this order’s stock held while branding gets under way.',
    'Moving to Ready keeps your stock held and tells the team this order is packed for handoff.',
    'Moving to Delivered releases the hold and deducts the pieces from on-hand stock. Any shortage remains visible here until delivery.',
    'This order has left the warehouse. Moving back to Ready restores the actual delivery deduction and re-holds the ordered pieces.',
  ]
  const move = (stage: Order['status']) => commit(d => transition(d, id, stage), `Move to ${stage.toLowerCase()}`)
  return <Drawer title={order.code} subtitle={order.client} onClose={() => open(null)} wide footer={<><div>{prev && <Button variant="secondary" onClick={() => move(prev)}><ArrowLeft size={15} />Back to {prev.toLowerCase()}</Button>}</div>{next && <Button onClick={() => move(next)}>Move to {next.toLowerCase()}<ArrowRight size={15} /></Button>}</>}>
    <div className="flex flex-wrap items-center justify-between gap-3"><Tag tone={stageTone(order.status)}>{order.status}</Tag><span className="text-sm ops-muted">Needed {fmt(order.due)} · {order.status === 'Delivered' ? 'Delivered' : relative(order.due)}</span></div>
    <ol className="ops-stepper">{orderStages.map((s, i) => <li key={s} className={i <= index ? 'reached' : ''}><span>{i + 1}</span><small>{s}</small></li>)}</ol>
    {short.length > 0 && <div className="ops-callout tone-amber"><strong className="flex items-center gap-2"><CircleAlert size={17} />A little restocking is needed</strong><ul>{short.map(({ p, v, deficit }) => <li key={v.id}><button onClick={() => open({ type: 'stock', id: v.id })}>{p.name} · {variantLabel(v)} — short {number(deficit)} pieces <ArrowRight size={12} /></button></li>)}</ul></div>}
    <div className="ops-subheading"><h3>Order details</h3><span>{order.lines.length} lines · {number(orderUnits(order))} pieces</span></div>
    <div className="ops-nested-table"><Table headers={['Product / variant', 'Qty', 'Unit price', 'Amount']}>{order.lines.map((l, i) => { const p = data.products.find(p => p.id === l.pid)!; const v = p.variants.find(v => v.id === l.vid)!; return <Row key={i}><td><strong>{p.name}</strong><small className="flex items-center gap-2"><Swatch hex={v.hex} label={v.color} small />{variantLabel(v)} · {l.method}</small></td><td>{number(l.qty)}</td><td>{peso(l.price)}</td><td><strong>{peso(l.qty * l.price)}</strong></td></Row> })}</Table><div className="ops-total-row"><span>Order total</span><strong>{peso(orderTotal(order))}</strong></div></div>
    <InfoGrid items={[{ label: 'Contact', value: order.contact || 'Not provided' }, { label: 'Source', value: order.channel }, { label: 'Created', value: fmt(order.created) }, { label: 'Total pieces', value: number(orderUnits(order)) }]} />
    {order.notes && <div className="ops-form-section"><h3>Notes from the team</h3><p className="whitespace-pre-wrap">{order.notes}</p></div>}
    <div className="ops-callout tone-blue"><strong>What happens next</strong><p>{explanations[index]}</p></div>
  </Drawer>
}

export function NewOrder() {
  const { data, open, commit } = useOps()
  const [client, setClient] = useState('')
  const [contact, setContact] = useState('')
  const [due, setDue] = useState(day(7))
  const [channel, setChannel] = useState(channels[0])
  const [notes, setNotes] = useState('')
  const [pid, setPid] = useState(data.products[0].id)
  const product = data.products.find(p => p.id === pid)!
  const [vid, setVid] = useState(product.variants[0].id)
  const [qty, setQty] = useState('100')
  const [price, setPrice] = useState(String(product.price))
  const [method, setMethod] = useState(product.methods[0] ?? 'Unbranded')
  const [lines, setLines] = useState<OrderLine[]>([])
  const v = product.variants.find(v => v.id === vid)!
  const remaining = free(v) - lines.filter(l => l.vid === vid).reduce((sum, l) => sum + l.qty, 0)
  const canAdd = Number.isInteger(Number(qty)) && Number(qty) > 0 && price !== '' && Number(price) >= 0 && Number.isFinite(Number(price))
  const changeProduct = (id: string) => { const p = data.products.find(p => p.id === id)!; setPid(id); setVid(p.variants[0].id); setPrice(String(p.price)); setMethod(p.methods[0] ?? 'Unbranded') }
  const save = () => {
    if (!client.trim() || !due || !lines.length) return
    const code = `AY-${Math.max(2600, ...data.orders.map(o => Number(o.code.replace('AY-', '')))) + 1}`
    const order: Order = { id: uid(), code, client: client.trim(), contact: contact.trim(), due, channel, notes, lines, status: 'Inquiry', created: day() }
    commit(d => ({ ...d, orders: [order, ...d.orders] }), 'Create order')
    open({ type: 'order', id: order.id })
  }
  return <Drawer title="A new promise starts here." subtitle="Build an order. We’ll take care of the numbers." onClose={() => open(null)} wide footer={<><div><small className="ops-muted">Order total</small><strong className="block text-xl">{peso(orderTotal({ lines }))}</strong></div><Button type="submit" form="create-order" disabled={!client.trim() || !due || !lines.length}>Create order<ArrowRight size={15} /></Button></>}>
    <form id="create-order" onSubmit={e => { e.preventDefault(); save() }}><div className="ops-form-grid"><Field label="Client / company"><input required className="ops-input" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Acme Philippines" /></Field><Field label="Contact email"><input className="ops-input" type="email" value={contact} onChange={e => setContact(e.target.value)} placeholder="name@company.com" /></Field><Field label="Needed by"><input required className="ops-input" type="date" value={due} onChange={e => setDue(e.target.value)} /></Field><Field label="Source"><select className="ops-input" value={channel} onChange={e => setChannel(e.target.value)}>{channels.map(c => <option key={c}>{c}</option>)}</select></Field></div></form>
    <div className="ops-form-section"><h3>Find the right things</h3><div className="ops-line-builder"><div className="ops-form-grid"><Field label="Product"><select className="ops-input" value={pid} onChange={e => changeProduct(e.target.value)}>{data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Colour / size"><select className="ops-input" value={vid} onChange={e => setVid(e.target.value)}>{product.variants.map(v => <option key={v.id} value={v.id}>{variantLabel(v)} — {free(v)} free</option>)}</select></Field><Field label="Quantity"><input className="ops-input" type="number" min="1" step="1" value={qty} onChange={e => setQty(e.target.value)} /></Field><Field label="Unit price (PHP)"><input className="ops-input" type="number" min="0" step=".01" value={price} onChange={e => setPrice(e.target.value)} /></Field><Field label="Branding"><select className="ops-input" value={method} onChange={e => setMethod(e.target.value)}>{(product.methods.length ? product.methods : ['Unbranded']).map(m => <option key={m}>{m}</option>)}</select></Field></div>
      {Number(qty) > 0 && Number(qty) < product.moq && <p className="ops-inline-warning"><CircleAlert size={14} />Below the {product.moq}-piece minimum order. You can still add this line.</p>}
      {Number(qty) > remaining && <p className="ops-inline-warning"><CircleAlert size={14} />Only {remaining} free after draft lines; {Number(qty) - remaining} would need restocking.</p>}
      <Button variant="secondary" disabled={!canAdd} onClick={() => setLines([...lines, { pid, vid, qty: Number(qty), price: Number(price), method }])}><Plus size={15} />Add line</Button></div></div>
    <div className="ops-subheading"><h3>In this order</h3><span>{lines.length} lines</span></div>
    {!lines.length ? <Empty title="Start with a good find">Choose a product above and add your first line.</Empty> : <div className="ops-draft-lines">{lines.map((l, i) => { const p = data.products.find(p => p.id === l.pid)!; const v = p.variants.find(v => v.id === l.vid)!; return <div key={i}><ProductImage src={p.image} name={p.name} /><span className="flex-1"><strong>{p.name}</strong><small><Swatch hex={v.hex} label={v.color} small />{variantLabel(v)} · {l.qty} × {peso(l.price)} · {l.method}</small></span><strong>{peso(l.qty * l.price)}</strong><IconButton label={`Remove line ${i + 1}`} onClick={() => setLines(lines.filter((_, n) => n !== i))}><Trash2 size={15} /></IconButton></div> })}</div>}
    <Field label="Order notes"><textarea className="ops-input" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Artwork, delivery instructions, or client preferences…" /></Field>
    <p className="ops-note">New orders start at Inquiry. Stock is only held when you move to Approved.</p>
  </Drawer>
}
