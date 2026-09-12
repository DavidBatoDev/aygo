import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Plus, RotateCcw } from 'lucide-react'
import { day, entriesOn, entryTypes, fmt, iso, uid, type Agenda } from './model'
import { useOps } from './store'
import { Button, Drawer, Empty, Field, IconButton, SectionTitle, Tag } from './ui'

export function Calendar() {
  const { data, open } = useOps()
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  first.setDate(first.getDate() - first.getDay())
  const dates = Array.from({ length: 42 }, (_, i) => { const d = new Date(first); d.setDate(d.getDate() + i); return d })
  const shift = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  return <>
    <SectionTitle title="Make space for what’s next." description="Sales conversations, deliveries, and event days. One shared rhythm."><Button onClick={() => open({ type: 'day', id: day() })}><Plus size={17} />Add agenda entry</Button></SectionTitle>
    <section className="ops-panel"><div className="ops-calendar-toolbar"><div className="flex items-center gap-3"><h2>{month.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</h2><IconButton label="Previous month" onClick={() => shift(-1)}><ArrowLeft size={17} /></IconButton><IconButton label="Next month" onClick={() => shift(1)}><ArrowRight size={17} /></IconButton><Button variant="secondary" className="compact" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</Button></div><div className="ops-calendar-legend">{Object.values(entryTypes).map(t => <span key={t.label} className={`tone-${t.tone}`}><span className="ops-status-dot" />{t.label}</span>)}</div></div>
      <div className="ops-calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="ops-calendar-grid">{dates.map(date => { const value = iso(date); const entries = entriesOn(data, value); return <button key={value} className={`ops-calendar-cell ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${value === day() ? 'today' : ''}`} onClick={() => open({ type: 'day', id: value })} aria-label={`${fmt(value, { weekday: 'long', day: 'numeric', month: 'long' })}, ${entries.length} entries`}><span className="ops-calendar-number">{date.getDate()}{value === day() && <small>Today</small>}</span><span className="ops-calendar-entries">{entries.slice(0, 3).map(e => <span key={e.id} className={`ops-agenda-chip tone-${e.tone} ${e.done ? 'done' : ''}`}><span className="ops-status-dot" /><span>{e.title}</span></span>)}{entries.length > 3 && <span className="ops-more">+{entries.length - 3} more</span>}</span></button> })}</div>
    </section>
  </>
}

export function DayDrawer({ date }: { date: string }) {
  const { data, open, commit } = useOps()
  const [type, setType] = useState<Agenda['type']>('sale')
  const [who, setWho] = useState('Mia')
  const [title, setTitle] = useState('')
  const entries = entriesOn(data, date)
  const save = () => {
    if (!title.trim() || !who.trim()) return
    commit(d => ({ ...d, agenda: [...d.agenda, { id: uid(), date, type, who: who.trim(), title: title.trim(), done: false }] }), 'Add agenda entry')
    setTitle('')
  }
  return <Drawer title={fmt(date, { weekday: 'long', month: 'long', day: 'numeric' })} subtitle={`${entries.length} things on the calendar`} onClose={() => open(null)}>
    <div className="ops-day-entries">{entries.map(entry => <div className={`ops-day-entry tone-${entry.tone}`} key={entry.id}><div className="flex-1"><Tag tone={entry.tone} dot={false}>{entryTypes[entry.type].label}</Tag><h3 className={entry.done ? 'line-through opacity-60' : ''}>{entry.title}</h3><p>{entry.detail}</p></div>{entry.sheet ? <IconButton label={`Open ${entry.title}`} onClick={() => open(entry.sheet!)}><ArrowRight size={17} /></IconButton> : <Button variant="ghost" className="compact" onClick={() => commit(d => ({ ...d, agenda: d.agenda.map(a => a.id === entry.id ? { ...a, done: !a.done } : a) }), entry.done ? 'Reopen agenda entry' : 'Mark agenda entry done')}>{entry.done ? <RotateCcw size={14} /> : <Check size={14} />}{entry.done ? 'Reopen' : 'Done'}</Button>}</div>)}{!entries.length && <Empty title="A little room to plan">Add a conversation or follow-up below.</Empty>}</div>
    <div className="ops-form-section"><h3>Add something to the day</h3><div className="ops-form-grid"><Field label="Type"><select className="ops-input" value={type} onChange={e => setType(e.target.value as Agenda['type'])}>{(['sale', 'meeting', 'email'] as const).map(t => <option key={t} value={t}>{entryTypes[t].label}</option>)}</select></Field><Field label="Owner"><input className="ops-input" value={who} onChange={e => setWho(e.target.value)} placeholder="Person responsible" /></Field></div><Field label="What’s happening?"><input className="ops-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Follow up on the welcome kit quote" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save() } }} /></Field><Button onClick={save} disabled={!title.trim() || !who.trim()}><Plus size={15} />Add agenda entry</Button></div>
    <p className="ops-note">Order deliveries and event days come from their records. Open the linked record to see the details.</p>
  </Drawer>
}
