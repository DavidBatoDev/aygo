import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../lib/api'

const palette = [
  { name: 'Aygo blue', hex: '#003CF5', token: 'brand-600', style: 'bg-brand-600 text-white', usage: 'Our signature. Primary actions & identity.' },
  { name: 'Midnight', hex: '#0C1425', token: 'ink-950', style: 'bg-ink-950 text-white', usage: 'Grounded contrast. Headlines & dark surfaces.' },
  { name: 'Fresh lime', hex: '#C5F76B', token: 'lime-400', style: 'bg-lime-400 text-lime-950', usage: 'A little energy. Highlights & special moments.' },
  { name: 'Cloud', hex: '#F7F8FA', token: 'canvas', style: 'bg-canvas text-content', usage: 'Room to breathe. The everyday backdrop.' },
] as const

const blueScale = [
  ['50', 'bg-brand-50'], ['100', 'bg-brand-100'], ['200', 'bg-brand-200'],
  ['300', 'bg-brand-300'], ['400', 'bg-brand-400'], ['500', 'bg-brand-500'],
  ['600', 'bg-brand-600'], ['700', 'bg-brand-700'], ['800', 'bg-brand-800'],
  ['900', 'bg-brand-900'], ['950', 'bg-brand-950'],
] as const

export function HomePage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth })

  return (
    <>
      <a href="#main" className="brand-button brand-button-primary fixed top-4 left-4 z-50 -translate-y-24 focus:translate-y-0">Skip to content</a>
      <header className="border-b border-border bg-surface">
        <div className="brand-container flex min-h-24 flex-wrap items-center justify-between gap-4 py-4">
          <a href="#main" aria-label="Aygo brand kit home"><img src="/aygo-wordmark.svg" alt="Aygo" width="110" height="40" /></a>
          <nav aria-label="Brand kit sections" className="flex gap-5 text-sm font-medium text-muted sm:gap-8">
            <a href="#identity" className="hover:text-brand-600">Identity</a>
            <a href="#colors" className="hover:text-brand-600">Colors</a>
            <a href="#components" className="hover:text-brand-600">UI kit</a>
          </nav>
        </div>
      </header>

      <main id="main" className="brand-container space-y-20 py-10 sm:space-y-24 sm:py-14">
        <section aria-labelledby="intro-heading" className="grid overflow-hidden rounded-panel bg-brand-600 text-white lg:grid-cols-[1.4fr_1fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <span className="brand-badge border border-white/30 text-white">AYGO / BRAND SYSTEM 01</span>
            <h1 id="intro-heading" className="mt-8 font-display text-display">Good finds.<br />Great feeling.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/85">A bold little bag. A world of possibility. Meet the building blocks of a brighter shopping experience.</p>
            <a href="#components" className="brand-button brand-button-accent mt-8">Explore the kit <span aria-hidden="true">↗</span></a>
          </div>
          <div aria-hidden="true" className="relative flex min-h-72 items-center justify-center overflow-hidden bg-brand-700/35 p-12">
            <div className="absolute size-72 rounded-full border border-white/20 sm:size-96" />
            <div className="absolute size-52 rounded-full border border-white/20 sm:size-72" />
            <div className="relative flex size-52 -rotate-6 items-center justify-center rounded-[2.75rem] bg-white shadow-brand sm:size-64">
              <img src="/aygo-icon.svg" alt="" className="h-36 sm:h-44" />
            </div>
            <span className="absolute right-6 bottom-6 rotate-6 rounded-full bg-lime-400 px-5 py-3 text-sm font-bold text-lime-950 sm:right-10 sm:bottom-10">Bring the good.</span>
          </div>
        </section>

        <section id="identity" aria-labelledby="identity-heading" className="scroll-mt-8">
          <SectionHeading number="01" title="Small mark. Big personality." id="identity-heading" description="Confident, friendly, unmistakably Aygo. Give the mark space and let the blue do the talking." />
          <div className="grid gap-5 md:grid-cols-3">
            <LogoCard title="The wordmark" subtitle="Your everyday signature" src="/aygo-wordmark.svg" className="w-64 max-w-full" />
            <LogoCard title="The full lockup" subtitle="For moments with more room" src="/aygo-stacked.svg" className="h-44" />
            <LogoCard title="The bag" subtitle="Small spaces. Same energy." src="/aygo-icon.svg" className="h-32" />
          </div>
          <p className="mt-4 text-sm text-muted">Keep clear space of at least one dot-width around each logo. Use the blue mark on white or a light neutral; keep its original proportions.</p>
        </section>

        <section id="colors" aria-labelledby="colors-heading" className="scroll-mt-8">
          <SectionHeading number="02" title="Blue at heart." id="colors-heading" description="Electric blue leads. Clean neutrals create space. A touch of lime makes the good stuff pop." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {palette.map((color) => (
              <article key={color.token} className="overflow-hidden rounded-card border border-border bg-surface">
                <div className={`flex h-40 flex-col justify-between p-6 ${color.style}`}>
                  <h3 className="text-title">{color.name}</h3>
                  <span className="font-mono text-sm">{color.hex}</span>
                </div>
                <div className="p-5"><code className="text-xs text-brand-700">{color.token}</code><p className="mt-2 text-sm leading-relaxed text-muted">{color.usage}</p></div>
              </article>
            ))}
          </div>
          <div className="brand-card mt-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">The full blue spectrum</h3><code className="text-xs text-muted">bg-brand-50 → bg-brand-950</code></div>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
              {blueScale.map(([step, style]) => <div key={step}><div className={`h-16 rounded-lg ${style}`} /><p className="mt-2 text-center font-mono text-xs text-muted">{step}</p></div>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="type-heading">
          <SectionHeading number="03" title="Say it with a smile." id="type-heading" description="Big, tightly set headlines. Clear, comfortable body copy. Always helpful, never complicated." />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="brand-card flex flex-col justify-between gap-8">
              <p className="brand-eyebrow">Display / bold & approachable</p>
              <p className="font-display text-heading">Your next<br /><span className="text-brand-600">favorite thing.</span></p>
              <p className="break-words text-2xl font-semibold tracking-tight text-ink-600">Aa Bb Cc Dd Ee Ff Gg<br />0123456789 &@!?+</p>
              <code className="text-xs text-muted">font-display text-heading</code>
            </div>
            <div className="brand-card space-y-6">
              <div><p className="brand-eyebrow mb-2">Heading</p><p className="text-title">A little everyday delight.</p></div>
              <div><p className="brand-eyebrow mb-2">Body / 16px · relaxed</p><p className="text-base leading-relaxed text-muted">Discover something you love. We keep the details simple, the choices exciting, and the next step clear.</p></div>
              <div><p className="brand-eyebrow mb-2">Label / 11px · uppercase</p><p className="brand-eyebrow text-brand-700">Picked just for you</p></div>
              <div className="border-t border-border pt-5"><p className="text-sm font-semibold">Our voice</p><p className="mt-2 text-sm leading-relaxed text-muted">Warm. Direct. Optimistic. Say “Find your favorite” rather than “Initiate product discovery.”</p></div>
            </div>
          </div>
        </section>

        <section id="components" aria-labelledby="components-heading" className="scroll-mt-8">
          <SectionHeading number="04" title="Made to click." id="components-heading" description="Soft corners, clear hierarchy, and room to tap. Familiar building blocks with a little Aygo character." />
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <div className="brand-card space-y-8">
              <div><h3 className="brand-eyebrow mb-4">Actions</h3><div className="flex flex-wrap gap-3">
                <a href="/aygo-wordmark.svg" download className="brand-button brand-button-primary">Download logo <span aria-hidden="true">↓</span></a>
                <a href="#identity" className="brand-button brand-button-secondary">View assets</a>
                <button type="button" disabled className="brand-button brand-button-primary">Disabled</button>
              </div></div>
              <div><h3 className="brand-eyebrow mb-4">Status & feedback</h3><div className="flex flex-wrap gap-2">
                <span className="brand-badge brand-badge-neutral">Draft</span>
                <span className="brand-badge brand-badge-success">✓ In stock</span>
                <span className="brand-badge brand-badge-warning">Low stock</span>
                <span className="brand-badge brand-badge-danger">Sold out</span>
              </div></div>
              <div><h3 className="brand-eyebrow mb-4">Inputs</h3><label htmlFor="sample-name" className="mb-2 block text-sm font-semibold">Your name</label><input id="sample-name" className="brand-input" placeholder="Alex Morgan" autoComplete="off" aria-describedby="sample-help" /><p id="sample-help" className="mt-2 text-xs text-muted">A sample field. Try tabbing here to see the focus style.</p></div>
            </div>
            <div className="space-y-5">
              <div className="rounded-card bg-ink-950 p-8 text-white">
                <span className="brand-badge bg-lime-400 text-lime-950">A fresh perspective</span>
                <h3 className="mt-6 font-display text-heading">Less noise.<br />More good.</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-200">Use dark surfaces for a moment of contrast. Keep lime as a highlight and give every element room to breathe.</p>
                <a href="#colors" className="brand-button brand-button-accent mt-6">Find your colors <span aria-hidden="true">↗</span></a>
              </div>
              <div className="brand-card">
                <h3 className="brand-eyebrow mb-3">Live connection / system feedback</h3>
                <div role="status" className="text-sm">
                  {health.isPending && <p className="text-muted">Connecting to the API…</p>}
                  {health.isError && <p className="text-danger">API unavailable. Make sure the server is running.</p>}
                  {health.isSuccess && <p className="text-success">API online · {health.data.service}</p>}
                </div>
                <button type="button" onClick={() => void health.refetch()} disabled={health.isFetching} className="brand-button brand-button-secondary mt-5">Check connection</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border"><div className="brand-container flex flex-wrap items-center justify-between gap-4 py-8"><img src="/aygo-wordmark.svg" alt="Aygo" width="77" height="28" /><p className="text-xs text-muted">One identity. Endless possibilities. / Brand kit v1.0</p></div></footer>
    </>
  )
}

function SectionHeading({ number, title, description, id }: { number: string; title: string; description: string; id: string }) {
  return <div className="mb-8 max-w-2xl"><p className="brand-eyebrow mb-3 text-brand-700">The brand / {number}</p><h2 id={id} className="font-display text-heading">{title}</h2><p className="mt-4 leading-relaxed text-muted">{description}</p></div>
}

function LogoCard({ title, subtitle, src, className }: { title: string; subtitle: string; src: string; className: string }) {
  return <article className="brand-card"><div className="flex h-52 items-center justify-center"><img src={src} alt={title} className={className} /></div><div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5"><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted">{subtitle}</p></div><a href={src} download className="rounded-lg bg-brand-50 px-3 py-2 font-mono text-xs font-semibold text-brand-700 hover:bg-brand-100" aria-label={`Download ${title} as SVG`}>SVG ↓</a></div></article>
}
