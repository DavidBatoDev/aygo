import { day, heldStage, inks, type DemoData, type Order, type Product, type Supplier } from './model'

export function hash(value: string) { let h = 2166136261; for (const char of value) h = Math.imul(h ^ char.charCodeAt(0), 16777619); return h >>> 0 }
const sizes = ['S', 'M', 'L', 'XL', '2XL']
type ProductSeed = [string, string, Product['category'], number, string[], boolean, string, string]
const catalogue: ProductSeed[] = [
  ['Cotton t-shirt', 'APP-TEE-CTN', 'Apparel', 220, ['Black', 'White', 'Navy', 'Beige'], true, 's1', 'tee'],
  ['Dri-fit t-shirt', 'APP-TEE-DRI', 'Apparel', 260, ['Royal', 'White', 'Red', 'Black'], true, 's1', 'tee'],
  ['Polo shirt', 'APP-POLO', 'Apparel', 390, ['Navy', 'White', 'Black', 'Forest'], true, 's1', 'polo'],
  ['Fleece hoodie', 'APP-HOOD', 'Apparel', 780, ['Black', 'Grey'], true, 's1', 'hoodie'],
  ['Baseball cap', 'APP-CAP', 'Apparel', 145, ['Black', 'Navy', 'Red', 'White', 'Beige'], false, 's1', 'cap'],
  ['Canvas tote bag', 'BAG-CANVAS', 'Bags & Totes', 125, ['Beige', 'Black', 'Grey', 'Navy'], false, 's2', 'tote'],
  ['Rope handle tote', 'BAG-ROPE', 'Bags & Totes', 180, ['Beige', 'Navy', 'Black'], false, 's2', 'rope'],
  ['Non-woven ecobag', 'BAG-ECO', 'Bags & Totes', 55, ['White', 'Black', 'Royal', 'Red'], false, 's2', 'eco'],
  ['Drawstring bag', 'BAG-DRAW', 'Bags & Totes', 85, ['Black', 'Royal', 'Red'], false, 's2', 'drawstring'],
  ['Laptop bag', 'BAG-LAPTOP', 'Bags & Totes', 680, ['Black', 'Grey', 'Navy'], false, 's2', 'laptop'],
  ['Canvas zipper pouch', 'BAG-POUCH', 'Bags & Totes', 65, ['Beige', 'Black', 'Navy'], false, 's2', 'pouch'],
  ['Japanese travel tumbler', 'DRK-JPN-350', 'Drinkware', 285, ['White', 'Black', 'Royal', 'Olive', 'Beige'], false, 's3', 'travel'],
  ['Thermos tumbler', 'DRK-THERM-800', 'Drinkware', 420, ['Navy', 'Silver', 'Red', 'Black'], false, 's3', 'thermos'],
  ['Double-wall egg mug', 'DRK-EGG-360', 'Drinkware', 245, ['Forest', 'White', 'Royal', 'Red', 'Black', 'Beige'], false, 's3', 'egg'],
  ['Vacuum tumbler 500ml', 'DRK-VAC-500', 'Drinkware', 320, ['Navy', 'Black', 'Pink', 'Silver', 'White'], false, 's3', 'vacuum'],
  ['Coffee mug 350ml', 'DRK-COF-350', 'Drinkware', 195, ['Black', 'Sky', 'Beige'], false, 's3', 'coffee'],
  ['Magic mug', 'DRK-MAGIC', 'Drinkware', 165, ['Black'], false, 's3', 'magic'],
  ['Frosted / clear mug', 'DRK-CLEAR', 'Drinkware', 135, ['White', 'Clear'], false, 's3', 'clear'],
  ['Bamboo tumbler', 'ECO-BAMBOO', 'Eco Line', 340, ['Bamboo'], false, 's4', 'bamboo'],
  ['Bamboo cutlery set', 'ECO-CUTLERY', 'Eco Line', 145, ['Bamboo'], false, 's4', 'cutlery'],
  ['Glass lunch box', 'ECO-LUNCH', 'Eco Line', 360, ['Bamboo'], false, 's4', 'lunch'],
  ['Corrugated gift box', 'ECO-BOX', 'Eco Line', 85, ['Kraft', 'White'], false, 's4', 'box'],
  ['Power bank 10,000mAh', 'TEC-POWER', 'Tech & Gadgets', 590, ['White', 'Black', 'Navy'], false, 's5', 'powerbank'],
  ['Wireless charging pad', 'TEC-CHARGE', 'Tech & Gadgets', 380, ['White', 'Black'], false, 's5', 'charger'],
  ['Cable organizer kit', 'TEC-CABLE', 'Tech & Gadgets', 295, ['White', 'Black'], false, 's5', 'cable'],
  ['Rubber mouse pad', 'TEC-MOUSE', 'Tech & Gadgets', 65, ['Black', 'White'], false, 's5', 'mousepad'],
  ['Mini handheld fan', 'TEC-FAN', 'Tech & Gadgets', 240, ['White', 'Sky', 'Pink', 'Royal'], false, 's5', 'fan'],
  ['Full-colour lanyard', 'EVT-LANYARD', 'Event Print', 48, ['Royal', 'Black', 'Red', 'Forest', 'White'], false, 's6', 'lanyard'],
  ['Button pin', 'EVT-PIN', 'Event Print', 25, ['White', 'Silver'], false, 's6', 'pin'],
  ['A5 magnetic notebook', 'EVT-NOTE-A5', 'Event Print', 195, ['Navy', 'Red', 'Black'], false, 's6', 'notebook'],
  ['Metal pen', 'EVT-PEN', 'Event Print', 45, ['Black', 'White', 'Royal', 'Red', 'Silver', 'Grey'], false, 's6', 'pen'],
  ['Automatic folding umbrella', 'RNC-AUTO', 'Rain Gear & Care', 295, ['Navy', 'Black', 'Red', 'Forest', 'White'], false, 's7', 'umbrella'],
  ['Golf umbrella', 'RNC-GOLF', 'Rain Gear & Care', 380, ['Navy', 'Maroon', 'Black'], false, 's7', 'golf'],
]
const suppliers: Supplier[] = [
  { id: 's1', name: 'Thread & Co. Apparel', city: 'Taytay, Rizal', contact: 'Patricia Santos', phone: '+63 917 555 0101', email: 'patricia@threadco.example', lead: 10, terms: '50% down, balance on delivery', covers: ['Apparel'] },
  { id: 's2', name: 'Manila Bag Works', city: 'Marikina City', contact: 'Marco Reyes', phone: '+63 917 555 0102', email: 'marco@manilabags.example', lead: 7, terms: 'Net 15', covers: ['Bags & Totes'] },
  { id: 's3', name: 'Everyday Drinkware', city: 'Valenzuela City', contact: 'Bea Lim', phone: '+63 917 555 0103', email: 'bea@everyday.example', lead: 5, terms: 'Cash on delivery', covers: ['Drinkware'] },
  { id: 's4', name: 'Rooted Eco Supply', city: 'Quezon City', contact: 'Nico Cruz', phone: '+63 917 555 0104', email: 'nico@rooted.example', lead: 12, terms: '50% down, balance on delivery', covers: ['Eco Line'] },
  { id: 's5', name: 'Connect Tech Trading', city: 'Makati City', contact: 'Jamie Tan', phone: '+63 917 555 0105', email: 'jamie@connect.example', lead: 7, terms: 'Net 30', covers: ['Tech & Gadgets'] },
  { id: 's6', name: 'JJT Digital Innovative', city: 'Parañaque City', contact: 'JJT sales team', phone: '+63 917 143 5890', email: 'sales.jtdigital@gmail.com', lead: 5, terms: '50% down, balance on pickup', covers: ['Event Print'] },
  { id: 's7', name: 'Allweather Essentials', city: 'Pasig City', contact: 'Alex Garcia', phone: '+63 917 555 0107', email: 'alex@allweather.example', lead: 8, terms: 'Cash on delivery', covers: ['Rain Gear & Care'] },
]

export function createSeed(): DemoData {
  const products: Product[] = catalogue.map(([name, sku, category, price, colors, sized, supplierId, image], i) => ({
    id: `p${i + 1}`, name, sku, category, price, cost: Math.round(price * .62), moq: category === 'Apparel' ? 50 : 100, supplierId,
    methods: category === 'Apparel' ? ['DTF', 'Embroidery', 'Silkscreen'] : category === 'Drinkware' || category === 'Eco Line' ? ['Laser', 'UV print'] : ['Silkscreen', 'Full-colour'],
    image: `/products/${image}.webp`, note: category === 'Apparel' ? 'Custom branding available. Confirm artwork and size breakdown before production.' : 'Customizable with your client’s branding. Sample approval recommended.', active: true,
    variants: colors.flatMap(color => (sized ? sizes : [null]).map(size => {
      const id = `${sku}-${color}${size ? `-${size}` : ''}`.toLowerCase()
      const h = hash(id)
      return { id, color, hex: inks[color], size, qty: h % 6 === 0 ? 8 + h % 25 : 65 + h % 190, committed: 0, reorder: 40 }
    })),
  }))
  const line = (pid: string, color: string, qty: number, size: string | null = null, price?: number) => {
    const p = products.find(p => p.id === pid)!
    return { pid, vid: p.variants.find(v => v.color === color && v.size === size)!.id, qty, price: price ?? p.price, method: p.methods[0] }
  }
  const orders: Order[] = [
    { id: 'o1', code: 'AY-2607', client: 'eCloudvalley', contact: 'events@ecloudvalley.example', status: 'In production', created: day(-12), due: day(2), channel: 'Account manager', lines: [line('p3', 'Navy', 80, 'L'), line('p6', 'Beige', 200), line('p28', 'Royal', 200)], notes: 'FSI executive summit kits. Navy polo embroidery approved. Deliver all items together.' },
    { id: 'o2', code: 'AY-2612', client: 'Okta Philippines', contact: 'marketing@okta.example', status: 'Quoted', created: day(-5), due: day(9), channel: 'Referral', lines: [line('p13', 'Navy', 150), line('p30', 'Navy', 150), line('p31', 'Black', 150)], notes: 'Partner roadshow. Client reviewing tumbler colour and gift packaging.' },
    { id: 'o3', code: 'AY-2615', client: 'OutSystems', contact: 'team@outsystems.example', status: 'Approved', created: day(-4), due: day(6), channel: 'Repeat client', lines: [line('p5', 'Black', 400), line('p2', 'Royal', 300, 'M'), line('p28', 'Black', 400)], notes: 'Innovators’ Day team merchandise. Flag cap replenishment with purchasing.' },
    { id: 'o4', code: 'AY-2618', client: 'Globe Business', contact: 'partners@globe.example', status: 'Ready', created: day(-9), due: day(0), channel: 'Account manager', lines: [line('p7', 'Beige', 120), line('p12', 'White', 120)], notes: 'Packed in cartons of 20. Pickup from Parañaque at 2 pm.' },
    { id: 'o5', code: 'AY-2620', client: 'Canva Philippines', contact: 'people@canva.example', status: 'Inquiry', created: day(-1), due: day(16), channel: 'Website enquiry', lines: [line('p1', 'White', 500, 'M'), line('p19', 'Bamboo', 300)], notes: 'Exploring welcome kits for the new Manila team. Send initial quote this week.' },
    { id: 'o6', code: 'AY-2601', client: 'UnionBank', contact: 'brand@unionbank.example', status: 'Delivered', created: day(-21), due: day(-3), channel: 'Repeat client', lines: [line('p23', 'Black', 300), line('p30', 'Black', 300)], notes: 'Delivered and acknowledged by the client. Great feedback on print quality.' },
  ]
  for (const order of orders.filter(o => heldStage(o.status))) for (const l of order.lines) {
    const v = products.find(p => p.id === l.pid)!.variants.find(v => v.id === l.vid)!
    v.committed += l.qty
    v.qty = Math.max(v.qty, Math.ceil(v.committed * 1.3))
  }
  products[2].variants.find(v => v.color === 'Navy' && v.size === 'L')!.qty = 56
  products[4].variants.find(v => v.color === 'Black')!.qty = 280
  products[12].variants.find(v => v.color === 'Navy')!.qty = 105
  const fleet = [
    ['LED-01', 'LED wall · 3 × 2m', 'Display', 18000, 'led'], ['LED-02', 'LED wall · 4 × 3m', 'Display', 26000, 'led'],
    ['DSP-01', 'Digital poster kiosk', 'Display', 4500, 'kiosk'], ['ACT-01', 'Photo booth station', 'Activation', 8500, 'photobooth'],
    ['BTH-01', 'Modular booth · 3 × 3m', 'Booth', 12000, 'booth'], ['BTH-02', 'Modular booth · 6 × 3m', 'Booth', 18000, 'booth'],
    ['DSP-02', 'Product display counter', 'Display', 2500, 'counter'], ['RIG-01', 'Aluminium truss set', 'Rigging', 5500, 'led'],
    ['AV-01', 'PA system + wireless mics', 'Tech', 6500, 'tech'], ['AV-02', 'Stage lighting kit', 'Tech', 4500, 'tech'],
    ['REG-01', 'Registration kiosk set', 'Activation', 7500, 'registration'], ['AV-03', 'Livestream & camera kit', 'Tech', 9500, 'tech'],
    ['BTH-03', 'Pull-up banner stand set', 'Booth', 1200, 'banner'],
  ] as const
  return {
    products, orders, suppliers: structuredClone(suppliers), adjustments: [],
    equipment: fleet.map(([code, name, kind, rate, image], i) => ({ id: `eq${i + 1}`, code, name, kind, rate, image: `/equipment/${image}.webp`, base: i % 3 === 0 ? 'QC warehouse' : 'Parañaque yard', condition: i === 9 ? 'Dimmer needs servicing' : 'Good', maintenance: i === 9 })),
    events: [
      { id: 'e1', name: 'FSI executive summit', client: 'eCloudvalley', venue: 'Grand Hyatt Manila, BGC', start: day(2), end: day(3), status: 'Confirmed', pax: 200, equipment: ['eq1', 'eq5', 'eq8', 'eq9'], crew: [{ role: 'Event lead', name: 'Mia Santos' }, { role: 'Tech crew', name: 'Carlo Reyes' }], orderId: 'o1', notes: 'Load-in at 6 am. Ballroom access through the service entrance.' },
      { id: 'e2', name: 'Partner connect roadshow', client: 'Okta Philippines', venue: 'Shangri-La The Fort', start: day(8), end: day(9), status: 'Quoted', pax: 150, equipment: ['eq2', 'eq6', 'eq11'], crew: [], orderId: 'o2', notes: 'Awaiting venue confirmation. Booth wall needs a new graphic.' },
      { id: 'e3', name: 'Innovators’ Day', client: 'OutSystems', venue: 'SMX Convention Center', start: day(3), end: day(4), status: 'Confirmed', pax: 400, equipment: ['eq1', 'eq7', 'eq12'], crew: [], orderId: 'o3', notes: 'LED wall handover overlaps the FSI summit. Coordinate with the event leads.' },
      { id: 'e4', name: 'Business beyond boundaries', client: 'Globe Business', venue: 'The Fifth at Rockwell', start: day(-1), end: day(0), status: 'On site', pax: 120, equipment: ['eq3', 'eq4', 'eq13'], crew: [{ role: 'Event lead', name: 'Paolo Cruz' }, { role: 'Host', name: 'Sam Rivera' }, { role: 'Registration', name: 'Lea Tan' }], orderId: 'o4', notes: 'Program starts at 10 am. Pack down after 6 pm.' },
      { id: 'e5', name: 'Team canvas: welcome day', client: 'Canva Philippines', venue: 'Makati office', start: day(16), end: day(16), status: 'Quoted', pax: 300, equipment: [], crew: [], orderId: 'o5', notes: 'Initial concept: a relaxed welcome experience with personalized merch.' },
    ],
    agenda: [
      { id: 'a1', date: day(0), type: 'sale', title: 'Canva welcome kit discovery', who: 'Mia', done: false },
      { id: 'a2', date: day(0), type: 'email', title: 'Follow up on Okta quote', who: 'Jamie', done: false },
      { id: 'a3', date: day(1), type: 'meeting', title: 'FSI final production check', who: 'Carlo', done: false },
      { id: 'a4', date: day(2), type: 'sale', title: 'UnionBank Q4 requirements', who: 'Mia', done: false },
      { id: 'a5', date: day(4), type: 'email', title: 'Send Globe delivery receipt', who: 'Jamie', done: false },
      { id: 'a6', date: day(5), type: 'meeting', title: 'Weekly purchasing sync', who: 'Carlo', done: false },
      { id: 'a7', date: day(-1), type: 'email', title: 'Confirm Globe pickup time', who: 'Jamie', done: true },
      { id: 'a8', date: day(12), type: 'sale', title: 'Q4 corporate gift planning', who: 'Mia', done: false },
    ],
  }
}
