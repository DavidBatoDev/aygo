import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, Plus, Trash2, Users } from 'lucide-react'
import { conflicts, crewRoles, day, eventStages, fmt, number, orderTotal, peso, relative, stageTone, uid, type OpsEvent } from './model'
import { useOps } from './store'
import { Button, Drawer, Field, Filter, IconButton, InfoGrid, Panel, Row, RowEnd, SearchBox, SectionTitle, Table, Tag } from './ui'

export function Events() {
  const { data, open } = useOps()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const upcoming = data.events.filter(e => e.end >= day())
  const filtered = data.events.filter(e => `${e.name} ${e.client} ${e.venue}`.toLowerCase().includes(search.toLowerCase()) && (!stage || e.status === stage)).sort((a, b) => a.start.localeCompare(b.start))
  return <>
    <SectionTitle title="Bring the experience to life." description="The venues, the people, the gear. Every detail, together."><Button onClick={() => open({ type: 'new-event' })}><Plus size={17} />New event</Button></SectionTitle>
    <div className="ops-event-banner"><div><span className="ops-kicker">From planning to showtime</span><h2>Big moments. Well handled.</h2><div className="flex flex-wrap gap-5 mt-5"><span><CalendarDays size={16} />{upcoming.length} upcoming events</span><span><Users size={16} />{number(upcoming.reduce((s, e) => s + e.pax, 0))} expected guests</span></div></div><img src="/equipment/photobooth.webp" alt="Event photo booth setup" /></div>
    <Panel flush><div className="ops-toolbar inset"><SearchBox value={search} onChange={setSearch} placeholder="Search events, clients or venues…" /><Filter label="All event stages" value={stage} onChange={setStage} options={eventStages} /><span className="ops-result-count">{filtered.length} events</span></div><Table headers={['Event / client', 'Load-in → load-out', 'Stage', 'Pax', 'Gear', 'Crew', '']} empty={!filtered.length}>{filtered.map(e => <Row key={e.id} onClick={() => open({ type: 'event', id: e.id })}><td><strong>{e.name}</strong><small>{e.client}</small><small className="flex items-center gap-1 mt-1"><MapPin size={11} />{e.venue}</small></td><td>{fmt(e.start)} – {fmt(e.end)}<small>{e.start <= day() && e.end >= day() ? 'Happening today' : relative(e.start)}</small></td><td><Tag tone={stageTone(e.status)}>{e.status}</Tag></td><td>{number(e.pax)}</td><td>{e.equipment.length} items</td><td>{e.crew.length ? <span className="ops-crew-stack">{e.crew.slice(0, 3).map((c, i) => <span key={i} title={`${c.name} · ${c.role}`}>{c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>)}<small>{e.crew.length} assigned</small></span> : <Tag tone="amber">Unassigned</Tag>}</td><td><RowEnd /></td></Row>)}</Table></Panel>
  </>
}

export function EventDrawer({ id }: { id: string }) {
  const { data, commit, open } = useOps()
  const event = data.events.find(e => e.id === id)!
  const [name, setName] = useState('')
  const [role, setRole] = useState(crewRoles[0])
  const update = (changes: Partial<OpsEvent>, message: string) => commit(d => ({ ...d, events: d.events.map(e => e.id === id ? { ...e, ...changes } : e) }), message)
  const order = data.orders.find(o => o.id === event.orderId)
  const stage = eventStages.indexOf(event.status)
  return <Drawer title={event.name} subtitle={event.client} onClose={() => open(null)} wide footer={<><div>{stage > 0 && <Button variant="secondary" onClick={() => update({ status: eventStages[stage - 1] }, `Move to ${eventStages[stage - 1].toLowerCase()}`)}><ArrowLeft size={15} />Back to {eventStages[stage - 1].toLowerCase()}</Button>}</div>{stage < eventStages.length - 1 && <Button onClick={() => update({ status: eventStages[stage + 1] }, `Move to ${eventStages[stage + 1].toLowerCase()}`)}>Move to {eventStages[stage + 1].toLowerCase()}<ArrowRight size={15} /></Button>}</>}>
    <div className="flex items-center justify-between"><Tag tone={stageTone(event.status)}>{event.status}</Tag><span className="ops-muted text-sm">{number(event.pax)} expected guests</span></div>
    <InfoGrid items={[{ label: 'Venue', value: event.venue }, { label: 'Load-in / load-out', value: `${fmt(event.start)} – ${fmt(event.end)}` }]} />
    <Field label="Linked merchandise order"><select className="ops-input" value={event.orderId ?? ''} onChange={e => update({ orderId: e.target.value || null }, 'Update linked order')}><option value="">No linked order</option>{data.orders.map(o => <option value={o.id} key={o.id}>{o.code} · {o.client}</option>)}</select></Field>
    {order && <button className="ops-linked-record" onClick={() => open({ type: 'order', id: order.id })}><span><strong>{order.code} · {order.client}</strong><small>{order.status} · {peso(orderTotal(order))}</small></span><ArrowRight size={17} /></button>}
    <div className="ops-form-section"><div className="ops-subheading"><h3>The right gear for the job</h3><span>{event.equipment.length} assigned</span></div><p>Assignments are soft bookings. Conflicts are flagged so the team can coordinate a handover.</p>
      <div className="ops-gear-checklist">{data.equipment.map(eq => { const clashes = conflicts(eq.id, event, data.events); return <label key={eq.id} className={`ops-gear-check ${eq.maintenance ? 'maintenance' : ''}`}><input type="checkbox" checked={event.equipment.includes(eq.id)} onChange={() => update({ equipment: event.equipment.includes(eq.id) ? event.equipment.filter(x => x !== eq.id) : [...event.equipment, eq.id] }, event.equipment.includes(eq.id) ? 'Unassign gear' : 'Assign gear')} /><span className="flex-1"><strong>{eq.name}</strong><small>{eq.code} · {eq.base}</small>{eq.maintenance && <Tag tone="amber">In maintenance</Tag>}{clashes.map(clash => <span key={clash.id} className="ops-gear-clash">Overlaps {clash.client} · {fmt(clash.start)}–{fmt(clash.end)}</span>)}</span><span className="text-sm font-medium">{peso(eq.rate)}<small className="ops-muted block text-right">/ day</small></span></label> })}</div>
      <div className="ops-total-row"><span>Assigned gear / day</span><strong>{peso(data.equipment.filter(eq => event.equipment.includes(eq.id)).reduce((sum, eq) => sum + eq.rate, 0))}</strong></div><small className="ops-muted">Per-day subtotal. Multi-day pricing is not applied in this demo.</small>
    </div>
    <div className="ops-form-section"><h3>Good people make it happen</h3>{!event.crew.length && <div className="ops-callout tone-amber">No crew assigned yet. Add a lead to get the team started.</div>}<div className="ops-crew-list">{event.crew.map((c, i) => <div key={i}><span className="ops-client-avatar">{c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span><span className="flex-1"><strong>{c.name}</strong><small>{c.role}</small></span><IconButton label={`Remove ${c.name}`} onClick={() => update({ crew: event.crew.filter((_, index) => i !== index) }, 'Remove crew member')}><Trash2 size={15} /></IconButton></div>)}</div>
      <div className="ops-form-grid"><Field label="Person"><input className="ops-input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></Field><Field label="Role"><select className="ops-input" value={role} onChange={e => setRole(e.target.value)}>{crewRoles.map(r => <option key={r}>{r}</option>)}</select></Field></div><Button variant="secondary" disabled={!name.trim()} onClick={() => { update({ crew: [...event.crew, { role, name: name.trim() }] }, 'Add crew member'); setName('') }}><Plus size={15} />Add crew member</Button>
    </div>
    {event.notes && <div className="ops-form-section"><h3>Event notes</h3><p className="whitespace-pre-wrap">{event.notes}</p></div>}
  </Drawer>
}

export function NewEvent() {
  const { open, commit } = useOps()
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [venue, setVenue] = useState('')
  const [pax, setPax] = useState('100')
  const [start, setStart] = useState(day(7))
  const [end, setEnd] = useState(day(7))
  const [notes, setNotes] = useState('')
  const valid = name.trim() && client.trim() && venue.trim() && start && end && end >= start && pax !== '' && Number.isInteger(Number(pax)) && Number(pax) >= 0
  const save = () => {
    if (!valid) return
    const event: OpsEvent = { id: uid(), name: name.trim(), client: client.trim(), venue: venue.trim(), pax: Number(pax), start, end, status: 'Quoted', notes, equipment: [], crew: [], orderId: null }
    commit(d => ({ ...d, events: [...d.events, event] }), 'Create event')
    open({ type: 'event', id: event.id })
  }
  return <Drawer title="Make a moment happen." subtitle="Start with the essentials. Build the experience from there." onClose={() => open(null)} footer={<><span className="ops-muted text-xs">New events start at Quoted.</span><Button disabled={!valid} onClick={save}>Create event<ArrowRight size={15} /></Button></>}>
    <div className="ops-form-grid"><Field label="Event name"><input className="ops-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Partner connect 2026" /></Field><Field label="Client / company"><input className="ops-input" value={client} onChange={e => setClient(e.target.value)} placeholder="Company name" /></Field><Field label="Venue"><input className="ops-input" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Venue and city" /></Field><Field label="Expected pax"><input className="ops-input" type="number" min="0" step="1" value={pax} onChange={e => setPax(e.target.value)} /></Field><Field label="Load-in date"><input className="ops-input" type="date" value={start} onChange={e => setStart(e.target.value)} /></Field><Field label="Load-out date"><input className="ops-input" type="date" min={start} value={end} onChange={e => setEnd(e.target.value)} /></Field></div>{end < start && <p className="ops-inline-warning">Load-out must be on or after load-in.</p>}<Field label="Event notes"><textarea className="ops-input" rows={5} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Load-in instructions, programme details, or client requests…" /></Field><div className="ops-callout tone-blue">Once created, you can link a merch order, assign gear, and bring your crew together.</div>
  </Drawer>
}
