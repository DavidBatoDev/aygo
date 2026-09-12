import { useState } from 'react'
import { LayoutGrid, List, Plus, SlidersHorizontal } from 'lucide-react'
import { categories, free, number, peso, stockRows, stockState, variantLabel } from './model'
import { useOps } from './store'
import { Button, Empty, Filter, Panel, ProductImage, Row, RowEnd, SearchBox, SectionTitle, StockBar, StockTag, Swatch, Swatches, Table, Tag } from './ui'

export function Catalogue() {
  const { data, open } = useOps()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [supplier, setSupplier] = useState('')
  const [grid, setGrid] = useState(true)
  const filtered = data.products.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category) && (!supplier || p.supplierId === supplier))
  return <>
    <SectionTitle title="Good finds start here." description="Your merchandise library. Every product, every colour, every possibility."><Button onClick={() => open({ type: 'new-product' })}><Plus size={17} />Add product</Button></SectionTitle>
    <div className="ops-catalogue-banner"><div><span className="ops-kicker">The Aygo collection</span><h2>Small details. Lasting impressions.</h2><p>{data.products.length} customizable products · {categories.length} categories · Ready for your next big idea.</p></div><div aria-hidden="true"><img src="/products/tote.webp" alt="" /><img src="/products/bamboo.webp" alt="" /><img src="/products/notebook.webp" alt="" /></div></div>
    <div className="ops-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search products or SKU…" /><Filter label="All categories" value={category} onChange={setCategory} options={categories} /><Filter label="All suppliers" value={supplier} onChange={setSupplier} options={data.suppliers.map(s => ({ value: s.id, label: s.name }))} /><span className="ops-result-count">{filtered.length} products</span><div className="ops-segment"><button aria-label="Grid view" aria-pressed={grid} onClick={() => setGrid(true)}><LayoutGrid size={16} /></button><button aria-label="List view" aria-pressed={!grid} onClick={() => setGrid(false)}><List size={16} /></button></div></div>
    {grid ? <div className="ops-product-grid">{filtered.map(p => {
      const low = p.variants.filter(v => stockState(v) !== 'ok').length
      return <button className="ops-product-card" key={p.id} onClick={() => open({ type: 'product', id: p.id })}><div className="ops-product-visual"><ProductImage src={p.image} name={p.name} large /><span className="ops-product-category">{p.category}</span></div><div className="ops-product-card-body"><span className="ops-code">{p.sku}</span><h3>{p.name}</h3><div className="ops-product-color-row"><Swatches product={p} /><span>{new Set(p.variants.map(v => v.color)).size} colours</span></div><div className="ops-product-card-footer"><div><strong>{peso(p.price)}</strong><span> / piece</span></div><span className="text-xs text-muted">{number(p.variants.reduce((s, v) => s + free(v), 0))} free</span></div>{low > 0 && <div className="ops-product-stock-note"><span className="ops-status-dot" />{low} stock {low === 1 ? 'row needs' : 'rows need'} attention</div>}</div></button>
    })}</div> : <Panel flush><Table headers={['Product', 'Category', 'Colours', 'Available', 'Sell price', 'Supplier', '']} empty={!filtered.length}>{filtered.map(p => <Row key={p.id} onClick={() => open({ type: 'product', id: p.id })}><td><div className="ops-product-cell"><ProductImage src={p.image} name={p.name} /><div><strong>{p.name}</strong><small>{p.sku}</small></div></div></td><td>{p.category}</td><td><Swatches product={p} /></td><td><strong>{number(p.variants.reduce((s, v) => s + free(v), 0))}</strong>{p.variants.some(v => stockState(v) !== 'ok') && <small className="text-warning">{p.variants.filter(v => stockState(v) !== 'ok').length} low</small>}</td><td>{peso(p.price)}</td><td>{data.suppliers.find(s => s.id === p.supplierId)?.name}</td><td><RowEnd /></td></Row>)}</Table></Panel>}
    {grid && !filtered.length && <Empty title="No products found">Try another product name, category, or supplier.</Empty>}
  </>
}

export function Inventory() {
  const { data, open } = useOps()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [health, setHealth] = useState('')
  const all = stockRows(data.products)
  const filtered = all.filter(({ p, v }) => `${p.name} ${p.sku} ${variantLabel(v)}`.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category) && (!health || (health === 'attention' ? stockState(v) !== 'ok' : stockState(v) === health)))
  return <>
    <SectionTitle title="Know what you can promise." description="Colour-by-colour stock visibility. The most important rows come first."><Tag tone="blue">{all.length} stock rows</Tag></SectionTitle>
    <div className="ops-stock-summary"><div><span>On hand</span><strong>{number(all.reduce((s, r) => s + r.v.qty, 0))}</strong><small>Physical pieces in the warehouse</small></div><div><span>Held for orders</span><strong>{number(all.reduce((s, r) => s + r.v.committed, 0))}</strong><small>Already promised to a client</small></div><div><span>Free to sell</span><strong className="text-brand-600">{number(all.reduce((s, r) => s + free(r.v), 0))}</strong><small>Your on hand, less your holds</small></div><div><span>Needs attention</span><strong className="text-warning">{all.filter(r => stockState(r.v) !== 'ok').length}</strong><small>Below reorder or out of stock</small></div></div>
    <Panel flush><div className="ops-toolbar inset"><SearchBox value={search} onChange={setSearch} placeholder="Search product, SKU or colour…" /><Filter label="All categories" value={category} onChange={setCategory} options={categories} /><Filter label="All stock states" value={health} onChange={setHealth} options={[{ value: 'attention', label: 'Needs attention' }, { value: 'low', label: 'Below reorder' }, { value: 'out', label: 'Out of stock' }, { value: 'ok', label: 'Healthy' }]} /><span className="ops-result-count">{filtered.length} rows</span></div>
      <Table headers={['Colour / size', 'Product', 'Stock level', 'On hand', 'Held', 'Free', 'Reorder point', 'Status', '']} empty={!filtered.length}>{filtered.map(({ p, v }) => <Row key={v.id} onClick={() => open({ type: 'stock', id: v.id })}><td><div className="flex items-center gap-3"><Swatch hex={v.hex} label={v.color} /><strong>{variantLabel(v)}</strong></div></td><td><strong>{p.name}</strong><small>{p.sku}</small></td><td><StockBar v={v} /></td><td>{number(v.qty)}</td><td className="text-muted">{number(v.committed)}</td><td><strong className={`stock-text-${stockState(v)}`}>{number(free(v))}</strong></td><td>{v.reorder}</td><td><StockTag v={v} /></td><td><SlidersHorizontal size={15} className="text-ink-400" /></td></Row>)}</Table>
      <div className="ops-table-footer"><span>Sorted by free stock, lowest first</span><span>Click a row to adjust stock or reorder point</span></div>
    </Panel>
  </>
}
