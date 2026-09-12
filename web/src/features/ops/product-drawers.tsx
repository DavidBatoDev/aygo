import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Minus, Plus } from 'lucide-react'
import { adjustStock, categories, free, inks, methods, number, peso, reasons, stockRows, stockState, uid, variantLabel, type Product } from './model'
import { useOps } from './store'
import { Button, Drawer, Field, InfoGrid, ProductImage, Row, StockBar, StockTag, Swatch, Table, Tag } from './ui'

export function ProductDrawer({ id }: { id: string }) {
  const { data, open, commit } = useOps()
  const p = data.products.find(p => p.id === id)!
  const supplier = data.suppliers.find(s => s.id === p.supplierId)!
  const [color, setColor] = useState('Black')
  const [size, setSize] = useState('')
  const duplicate = p.variants.some(v => v.color === color && (v.size ?? '').toLowerCase() === size.trim().toLowerCase())
  const addVariant = () => {
    if (duplicate) return
    const variant = { id: uid(), color, hex: inks[color], size: size.trim().toUpperCase() || null, qty: 0, committed: 0, reorder: 24 }
    commit(d => ({ ...d, products: d.products.map(item => item.id === id ? { ...item, variants: [...item.variants, variant] } : item) }), 'Add a colour — stock row created')
  }
  return <Drawer title={p.name} subtitle={`${p.sku} · ${p.category}`} onClose={() => open(null)} wide>
    <div className="ops-product-detail"><ProductImage src={p.image} name={p.name} large /><div><Tag tone="blue" dot={false}>{p.category}</Tag><h3>{peso(p.price)}<small> / piece</small></h3><p>Cost {peso(p.cost)} · <strong>{Math.round((p.price - p.cost) / p.price * 100)}% margin</strong></p><div className="mt-4 flex flex-wrap gap-1.5">{p.methods.map(m => <Tag key={m} dot={false}>{m}</Tag>)}</div></div></div>
    <InfoGrid items={[{ label: 'Minimum order', value: `${p.moq} pieces` }, { label: 'Free to sell', value: `${number(p.variants.reduce((s, v) => s + free(v), 0))} pieces` }, { label: 'Supplier', value: <button className="ops-text-link" onClick={() => open({ type: 'supplier', id: supplier.id })}>{supplier.name}<ArrowUpRight size={13} /></button> }, { label: 'Lead time', value: `${supplier.lead} days` }]} />
    <p className="ops-note">{p.note}</p>
    <div className="ops-subheading"><h3>Stock by colour</h3><span>{p.variants.length} rows</span></div>
    <div className="ops-nested-table"><Table headers={['Variant', 'Level', 'On hand', 'Held', 'Free', 'Quick adjust']}>{p.variants.map(v => <Row key={v.id}><td><button aria-label={`Adjust ${variantLabel(v)} stock`} className="flex items-center gap-2 text-left" onClick={() => open({ type: 'stock', id: v.id })}><Swatch hex={v.hex} label={v.color} small />{variantLabel(v)}</button></td><td><StockBar v={v} /></td><td>{v.qty}</td><td>{v.committed}</td><td className={`stock-text-${stockState(v)}`}>{free(v)}</td><td><div className="ops-quick-adjust"><button aria-label={`Deduct 10 ${variantLabel(v)}`} disabled={v.qty < 10} onClick={() => commit(d => adjustStock(d, v.id, -10, 'Counted and correcting'), 'Deduct 10 from stock')}><Minus size={12} />10</button><button aria-label={`Add 10 ${variantLabel(v)}`} onClick={() => commit(d => adjustStock(d, v.id, 10, 'Counted and correcting'), 'Add 10 to stock')}><Plus size={12} />10</button></div></td></Row>)}</Table></div>
    <small className="ops-muted block mt-2">Quick adjustments use the reason “Counted and correcting”.</small>
    <div className="ops-form-section"><h3>Add a colour</h3><p>New rows start at zero stock, with a reorder point of 24.</p><div className="ops-form-grid"><Field label="Colour"><select className="ops-input" value={color} onChange={e => setColor(e.target.value)}>{Object.keys(inks).map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Size (optional)"><input className="ops-input" value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. M" maxLength={12} /></Field></div>{duplicate && <p className="ops-muted text-xs">This colour and size already exists.</p>}<Button onClick={addVariant} disabled={duplicate}><Plus size={15} />Add a colour</Button></div>
  </Drawer>
}

export function AdjustStock({ id }: { id: string }) {
  const { data, commit, open } = useOps()
  const { p, v } = stockRows(data.products).find(r => r.v.id === id)!
  const [mode, setMode] = useState(1)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState(reasons[0])
  const [reorder, setReorder] = useState(String(v.reorder))
  const delta = Number(quantity) * mode
  const valid = Number.isInteger(delta) && delta !== 0 && Number(quantity) > 0 && v.qty + delta >= 0
  const save = () => { if (!valid) return; commit(d => adjustStock(d, id, delta, reason), mode === 1 ? 'Add to stock' : 'Deduct from stock'); setQuantity('') }
  return <Drawer title="Adjust stock" subtitle={`${p.name} · ${p.sku}`} onClose={() => open(null)} footer={<><span className="ops-muted text-xs">Held stock is managed by order stages.</span><Button disabled={!valid} onClick={save}>{mode === 1 ? 'Add to stock' : 'Deduct from stock'}</Button></>}>
    <div className="ops-stock-hero"><span className="ops-large-swatch" style={{ background: v.hex }} /><div><p>{variantLabel(v)}</p><h3>{number(free(v))}<small>free pieces</small></h3><span>{v.qty} on hand · {v.committed} held</span></div><StockTag v={v} /></div>
    <div className="ops-form-section"><h3>Record a stock movement</h3><div className="ops-segment full"><button aria-pressed={mode === 1} onClick={() => { setMode(1); setReason('Stock received') }}><ArrowDownLeft size={16} />Received</button><button aria-pressed={mode === -1} onClick={() => { setMode(-1); setReason('Damaged or rejected') }}><ArrowUpRight size={16} />Deduct</button></div><div className="ops-form-grid"><Field label="Quantity"><input className="ops-input" type="number" min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" /></Field><Field label="Reason"><select className="ops-input" value={reason} onChange={e => setReason(e.target.value)}>{reasons.map(r => <option key={r}>{r}</option>)}</select></Field></div>{quantity && <div className={`ops-callout ${v.qty + delta < 0 ? 'tone-red' : 'tone-blue'}`}>{v.qty + delta < 0 ? 'On hand cannot go below zero. Reduce the deduction quantity.' : `On hand goes from ${v.qty} to ${v.qty + delta}. Held stays at ${v.committed}.`}</div>}</div>
    <div className="ops-form-section"><h3>Reorder point</h3><p>The free-stock level at which this variant needs attention.</p><div className="flex items-end gap-3"><Field label="Minimum free stock"><input className="ops-input" type="number" min="0" step="1" value={reorder} onChange={e => setReorder(e.target.value)} /></Field><Button variant="secondary" disabled={reorder === '' || !Number.isInteger(Number(reorder)) || Number(reorder) < 0 || Number(reorder) === v.reorder} onClick={() => commit(d => ({ ...d, products: d.products.map(product => ({ ...product, variants: product.variants.map(variant => variant.id === id ? { ...variant, reorder: Number(reorder) } : variant) })) }), 'Save reorder point')}>Save reorder point</Button></div></div>
    {data.adjustments.some(a => a.vid === id) && <div className="ops-form-section"><h3>Recent adjustments</h3>{data.adjustments.filter(a => a.vid === id).slice(0, 5).map(a => <div className="ops-adjustment-log" key={a.id}><span>{a.reason}<small>{new Date(a.at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</small></span><strong className={a.delta > 0 ? 'text-success' : 'text-danger'}>{a.delta > 0 ? '+' : ''}{a.delta}</strong></div>)}</div>}
  </Drawer>
}

export function NewProduct() {
  const { data, commit, open } = useOps()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState<Product['category']>('Apparel')
  const [supplier, setSupplier] = useState(data.suppliers[0].id)
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [moq, setMoq] = useState('50')
  const [colors, setColors] = useState<string[]>(['Black'])
  const [branding, setBranding] = useState<string[]>(['DTF'])
  const [sized, setSized] = useState(true)
  const [note, setNote] = useState('')
  const duplicate = data.products.some(p => p.sku.toLowerCase() === sku.trim().toLowerCase())
  const count = colors.length * (category === 'Apparel' && sized ? 5 : 1)
  const valid = name.trim() && sku.trim() && !duplicate && Number(price) > 0 && Number.isFinite(Number(price)) && Number(cost) >= 0 && Number.isInteger(Number(moq)) && Number(moq) > 0 && colors.length > 0
  const save = () => {
    if (!valid) return
    const product: Product = { id: uid(), name: name.trim(), sku: sku.trim().toUpperCase(), category, supplierId: supplier, price: Number(price), cost: cost === '' ? Math.round(Number(price) * .62 * 100) / 100 : Number(cost), moq: Number(moq), methods: branding, note, active: true, image: '', variants: colors.flatMap(color => (category === 'Apparel' && sized ? ['S', 'M', 'L', 'XL', '2XL'] : [null]).map(size => ({ id: uid(), color, hex: inks[color], size, qty: 0, committed: 0, reorder: 24 }))) }
    commit(d => ({ ...d, products: [...d.products, product] }), 'Add product')
    open({ type: 'product', id: product.id })
  }
  const toggle = (list: string[], item: string) => list.includes(item) ? list.filter(x => x !== item) : [...list, item]
  return <Drawer title="Add a product" subtitle="Make room for your next good find." onClose={() => open(null)} footer={<><span className="ops-muted">{count} stock rows will be created</span><Button disabled={!valid} onClick={save}>Add product</Button></>}>
    <div className="ops-form-section first"><div className="ops-form-grid"><Field label="Product name"><input className="ops-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium canvas tote" /></Field><Field label="SKU"><input className="ops-input" value={sku} onChange={e => setSku(e.target.value)} placeholder="BAG-CANVAS-02" aria-invalid={duplicate} /></Field><Field label="Category"><select className="ops-input" value={category} onChange={e => setCategory(e.target.value as Product['category'])}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Supplier"><select className="ops-input" value={supplier} onChange={e => setSupplier(e.target.value)}>{data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field><Field label="Sell price (PHP)"><input className="ops-input" type="number" min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></Field><Field label="Unit cost (PHP)" hint="Defaults to 62% of sell price if left blank."><input className="ops-input" type="number" min="0" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="Optional" /></Field><Field label="Minimum order (pieces)"><input className="ops-input" type="number" min="1" step="1" value={moq} onChange={e => setMoq(e.target.value)} /></Field></div>{duplicate && <p className="text-danger text-sm">This SKU is already in your catalogue.</p>}</div>
    <div className="ops-form-section"><h3>Branding methods</h3><div className="ops-toggle-grid">{methods.map(m => <button className={branding.includes(m) ? 'selected' : ''} aria-pressed={branding.includes(m)} key={m} onClick={() => setBranding(toggle(branding, m))}>{m}</button>)}</div></div>
    <div className="ops-form-section"><h3>Available colours</h3><div className="ops-toggle-grid">{Object.entries(inks).map(([color, hex]) => <button key={color} className={colors.includes(color) ? 'selected' : ''} aria-pressed={colors.includes(color)} onClick={() => setColors(toggle(colors, color))}><Swatch hex={hex} label={color} small />{color}</button>)}</div>{category === 'Apparel' && <label className="ops-checkbox-row mt-4"><input type="checkbox" checked={sized} onChange={e => setSized(e.target.checked)} /><span>Split each colour into S, M, L, XL, and 2XL</span></label>}<div className="ops-callout tone-blue">{count} rows · Zero opening stock · Reorder point of 24 per row</div></div>
    <Field label="Product notes"><textarea className="ops-input" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Materials, specifications, or anything worth knowing…" /></Field>
  </Drawer>
}
