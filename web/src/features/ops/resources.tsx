import { useState } from 'react'
import { ArrowUpRight, Mail, MapPin, Phone, Wrench } from 'lucide-react'
import { day, fmt, gearStatus, peso, relative, stockState } from './model'
import { useOps } from './store'
import { Button, Drawer, Filter, InfoGrid, Panel, ProductImage, Row, RowEnd, SearchBox, SectionTitle, Swatches, Table, Tag } from './ui'

export function Equipment() {
  const { data, open, commit } = useOps()
  const [kind, setKind] = useState('')
  const [date, setDate] = useState(day())
  const filtered = data.equipment.filter(eq => !kind || eq.kind === kind)
  return <>
    <SectionTitle title="Ready for the next big thing." description="Your equipment pool. Know what’s available and where everything is."><Tag tone="green">{data.equipment.filter(eq => gearStatus(eq, data.events, date).label === 'Available').length} available</Tag></SectionTitle>
    <Panel flush><div className="ops-toolbar inset"><Filter label="All equipment kinds" value={kind} onChange={setKind} options={['Display', 'Activation', 'Booth', 'Rigging', 'Tech']} /><label className="flex items-center gap-2 text-sm text-muted">Availability on<input aria-label="Availability date" className="ops-input" type="date" value={date} onChange={e => setDate(e.target.value || day())} /></label><span className="ops-result-count">{filtered.length} equipment items</span></div>
      <Table headers={['Equipment', 'Kind', 'Availability', 'Next / current job', 'Day rate', 'Condition', 'Maintenance']} empty={!filtered.length}>{filtered.map(eq => {
        const status = gearStatus(eq, data.events, date)
        const next = status.event ?? data.events.filter(e => e.equipment.includes(eq.id) && e.end >= date && e.status !== 'Wrapped').sort((a, b) => a.start.localeCompare(b.start))[0]
        return <Row key={eq.id}><td><div className="ops-product-cell"><ProductImage src={eq.image} name={eq.name} /><div><strong>{eq.name}</strong><small>{eq.code} · {eq.base}</small></div></div></td><td>{eq.kind}</td><td><Tag tone={status.tone}>{status.label}</Tag></td><td>{next ? <button className="ops-record-link" onClick={() => open({ type: 'event', id: next.id })}><strong>{next.client}<ArrowUpRight size={12} /></strong><small>{fmt(next.start)} – {fmt(next.end)} · {relative(next.start)}</small></button> : <span className="ops-muted">No upcoming booking</span>}</td><td>{peso(eq.rate)}</td><td>{eq.condition}</td><td><Button variant="ghost" className="compact" onClick={() => commit(d => ({ ...d, equipment: d.equipment.map(item => item.id === eq.id ? { ...item, maintenance: !item.maintenance } : item) }), eq.maintenance ? 'Return to pool' : 'Send to maintenance')}><Wrench size={14} />{eq.maintenance ? 'Return to pool' : 'Send to maintenance'}</Button></td></Row>
      })}</Table><div className="ops-table-footer"><span>Availability is calculated from event assignments.</span><span>Maintenance takes priority over bookings.</span></div></Panel>
  </>
}

export function Suppliers() {
  const { data, open } = useOps()
  const [search, setSearch] = useState('')
  const filtered = data.suppliers.filter(s => `${s.name} ${s.city} ${s.covers.join(' ')}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <SectionTitle title="Good work takes good partners." description="The people behind your products. Know who to call and when."><Tag tone="blue">{data.suppliers.length} supply partners</Tag></SectionTitle>
    <Panel flush><div className="ops-toolbar inset"><SearchBox value={search} onChange={setSearch} placeholder="Search supplier, city or category…" /><span className="ops-result-count">{filtered.length} suppliers</span></div><Table headers={['Supplier / contact', 'Location', 'Makes', 'Products', 'Lead time', 'Payment terms', '']} empty={!filtered.length}>{filtered.map(s => {
      const products = data.products.filter(p => p.supplierId === s.id)
      const low = products.filter(p => p.variants.some(v => stockState(v) !== 'ok')).length
      return <Row key={s.id} onClick={() => open({ type: 'supplier', id: s.id })}><td><div className="ops-client-cell"><span className="ops-supplier-avatar">{s.name.split(' ').filter(w => w !== '&').map(w => w[0]).slice(0, 2).join('')}</span><div><strong>{s.name}</strong><small>{s.contact}</small><small>{s.phone}</small></div></div></td><td>{s.city}</td><td>{s.covers.map(c => <Tag key={c} dot={false}>{c}</Tag>)}</td><td><strong>{products.length} products</strong>{low > 0 && <small className="text-warning">{low} to reorder</small>}</td><td><strong>{s.lead} days</strong></td><td>{s.terms}</td><td><RowEnd /></td></Row>
    })}</Table></Panel>
    <p className="ops-footnote">Supplier contacts and commercial terms are illustrative demo records, except JJT’s published catalogue contact details.</p>
  </>
}

export function SupplierDrawer({ id }: { id: string }) {
  const { data, open } = useOps()
  const supplier = data.suppliers.find(s => s.id === id)!
  const products = data.products.filter(p => p.supplierId === id)
  const low = products.filter(p => p.variants.some(v => stockState(v) !== 'ok'))
  return <Drawer title={supplier.name} subtitle="Your supply partner" onClose={() => open(null)} wide>
    <div className="ops-contact-block"><p><MapPin size={17} />{supplier.city}</p><p><Phone size={17} /><a href={`tel:${supplier.phone.replace(/\s/g, '')}`}>{supplier.phone}</a></p><p><Mail size={17} /><a href={`mailto:${supplier.email}`}>{supplier.email}</a></p></div>
    <InfoGrid items={[{ label: 'Your contact', value: supplier.contact }, { label: 'Lead time', value: `${supplier.lead} days` }, { label: 'Payment terms', value: supplier.terms }, { label: 'Categories', value: supplier.covers.join(', ') }]} />
    {low.length > 0 && <div className="ops-callout tone-amber"><strong>{low.length} products need a restock conversation.</strong><p>The marked products below have colour or size rows at risk.</p></div>}
    <div className="ops-subheading"><h3>What they make</h3><span>{products.length} products</span></div><div className="ops-nested-table"><Table headers={['Product', 'Colours', 'Unit cost', 'MOQ', 'Stock']}>{products.map(p => <Row key={p.id} onClick={() => open({ type: 'product', id: p.id })}><td><div className="ops-product-cell"><ProductImage src={p.image} name={p.name} /><div><strong>{p.name}</strong><small>{p.sku}</small></div></div></td><td><Swatches product={p} /></td><td>{peso(p.cost)}</td><td>{p.moq}</td><td>{p.variants.some(v => stockState(v) !== 'ok') ? <Tag tone="amber">Reorder</Tag> : <Tag tone="green">Healthy</Tag>}</td></Row>)}</Table></div>
  </Drawer>
}
