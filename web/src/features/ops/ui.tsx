import { cloneElement, isValidElement, useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Box, Check, ChevronRight, Search, X } from 'lucide-react'
import { free, number, stockState, type Product, type Tone, type Variant } from './model'
import { useOps } from './store'

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; children: ReactNode }) {
  return <button type="button" className={`ops-button ops-button-${variant} ${className}`} {...props}>{children}</button>
}
export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" title={label} aria-label={label} className="ops-icon-button" {...props}>{children}</button>
}
export function Tag({ tone = 'neutral', children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return <span className={`ops-tag tone-${tone}`}>{dot && <span className="ops-status-dot" />}{children}</span>
}
export function Swatch({ hex, label, small = false }: { hex: string; label: string; small?: boolean }) {
  return <span className={`ops-swatch ${small ? 'small' : ''}`} style={{ background: hex }} title={label} aria-label={label} role="img" />
}
export function Swatches({ product }: { product: Product }) {
  return <span className="flex items-center gap-1.5">{[...new Map(product.variants.map(v => [v.color, v])).values()].slice(0, 6).map(v => <Swatch key={v.color} hex={v.hex} label={v.color} small />)}</span>
}
export function StockBar({ v }: { v: Variant }) {
  return <div className={`ops-stock-bar stock-${stockState(v)}`} aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, free(v) / Math.max(1, v.reorder * 2.5) * 100))}%` }} /></div>
}
export function StockTag({ v }: { v: Variant }) {
  const state = stockState(v)
  return <Tag tone={state === 'out' ? 'red' : state === 'low' ? 'amber' : 'green'}>{state === 'out' ? 'Out of stock' : state === 'low' ? 'Reorder' : 'Healthy'}</Tag>
}
export function ProductImage({ src, name, large = false }: { src: string; name: string; large?: boolean }) {
  return <div className={`ops-product-image ${large ? 'large' : ''}`}>{src ? <img src={src} alt={name} loading="lazy" /> : <Box size={large ? 44 : 22} strokeWidth={1.3} />}</div>
}
export function Panel({ title, description, action, children, className = '', flush = false }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
  return <section className={`ops-panel ${className}`}>{title && <div className="ops-panel-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>}<div className={flush ? '' : 'ops-panel-body'}>{children}</div></section>
}
export function SectionTitle({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="ops-page-heading"><div><h1>{title}</h1><p>{description}</p></div><div className="flex flex-wrap items-center gap-2">{children}</div></div>
}
export function Empty({ title = 'Nothing here yet', children }: { title?: string; children?: ReactNode }) {
  return <div className="ops-empty"><span><Box size={24} strokeWidth={1.4} /></span><h3>{title}</h3><p>{children ?? 'Try a different search or adjust your filters.'}</p></div>
}
export function SearchBox({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="ops-search"><Search size={17} /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={14} /></button>}</div>
}
export function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] | { value: string; label: string }[] }) {
  return <select className="ops-input ops-filter" aria-label={label} value={value} onChange={e => onChange(e.target.value)}><option value="">{label}</option>{options.map(o => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select>
}
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  const id = useId()
  return <div className="ops-field"><label htmlFor={id}>{label}</label>{isValidElement(children) ? cloneElement(children as ReactElement<{ id: string; 'aria-describedby'?: string }>, { id, 'aria-describedby': hint ? `${id}-hint` : undefined }) : children}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>
}
export function Table({ headers, children, empty = false }: { headers: string[]; children: ReactNode; empty?: boolean }) {
  return <div className="ops-table-scroll"><table className="ops-table"><thead><tr>{headers.map((h, i) => <th key={`${h}-${i}`} scope="col">{h}</th>)}</tr></thead><tbody>{children}</tbody></table>{empty && <Empty title="No matching records" />}</div>
}
export function Row({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <tr className={onClick ? 'clickable' : ''} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={e => { if (onClick && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick() } }}>{children}</tr>
}
export function Drawer({ title, subtitle, children, footer, onClose, wide = false }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; onClose: () => void; wide?: boolean }) {
  const { toast } = useOps()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const dialog = ref.current
    dialog?.showModal()
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = original; previous?.focus() }
  }, [])
  return createPortal(<dialog ref={ref} className={`ops ops-drawer ${wide ? 'wide' : ''}`} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="ops-drawer-shell"><header><div><p className="ops-kicker">Aygo workspace</p><h2 id={titleId}>{title}</h2>{subtitle && <p className="ops-muted">{subtitle}</p>}</div><IconButton label="Close drawer" onClick={onClose}><X size={20} /></IconButton></header><div className="ops-drawer-body">{children}</div>{footer && <footer>{footer}</footer>}{toast && <Toast key={toast.id} message={toast.message} />}</div></dialog>, document.body)
}
export function Metric({ title, value, detail, icon, blue = false }: { title: string; value: string; detail: ReactNode; icon: ReactNode; blue?: boolean }) {
  return <div className={`ops-metric ${blue ? 'featured' : ''}`}><div className="flex items-center justify-between"><span>{title}</span><span className="ops-metric-icon">{icon}</span></div><strong>{value}</strong><div className="ops-metric-detail">{detail}</div></div>
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="ops-text-link" onClick={onClick}>{children}<ArrowUpRight size={14} /></button>
}
export function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return <dl className="ops-info-grid">{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
}
export function Stat({ label, value }: { label: string; value: number }) { return <div><span className="ops-muted text-xs">{label}</span><strong className="block text-xl">{number(value)}</strong></div> }
export function RowEnd() { return <ChevronRight size={16} className="text-ink-400" /> }
export function Toast({ message }: { message: string }) { return <div className="ops-toast" role="status"><span><Check size={16} /></span>{message}</div> }
