import { describe, expect, it } from 'vitest'
import { adjustStock, day, entriesOn, free, gearStatus, heldStage, overlaps, shortages, stockRows, stockState, transition } from './model'
import { createSeed } from './seed'

describe('demo data integrity', () => {
  it('has the catalogue scope and reconciled stock holds', () => {
    const data = createSeed()
    expect(data.products).toHaveLength(33)
    expect(stockRows(data.products)).toHaveLength(163)
    const expected = new Map<string, number>()
    for (const order of data.orders) for (const line of order.lines) {
      expect(data.products.find(p => p.id === line.pid)?.variants.some(v => v.id === line.vid)).toBe(true)
      if (heldStage(order.status)) expected.set(line.vid, (expected.get(line.vid) ?? 0) + line.qty)
    }
    for (const { v } of stockRows(data.products)) expect(v.committed).toBe(expected.get(v.id) ?? 0)
  })

  it('contains the three intended shortage stories', () => {
    const data = createSeed()
    expect(shortages(data.products, data.orders[0])[0].deficit).toBe(24)
    expect(shortages(data.products, data.orders[1])[0].deficit).toBe(45)
    expect(shortages(data.products, data.orders[2])[0].deficit).toBe(120)
  })
})

describe('stock movements', () => {
  it('holds only after approval and reverses every normal transition', () => {
    let data = createSeed()
    const original = structuredClone(data.products)
    data = transition(data, 'o2', 'Approved')
    const vid = data.orders[1].lines[0].vid
    expect(stockRows(data.products).find(r => r.v.id === vid)!.v.committed).toBe(150)
    for (const stage of ['In production', 'Ready', 'Delivered', 'Ready', 'In production', 'Approved', 'Quoted'] as const) data = transition(data, 'o2', stage)
    expect(data.products).toEqual(original)
  })

  it('does not duplicate movements for the same target and rejects skipped stages', () => {
    const data = createSeed()
    expect(transition(data, 'o1', 'In production')).toBe(data)
    expect(() => transition(data, 'o1', 'Delivered')).toThrow('one stage')
  })

  it('aggregates repeated variants when checking shortages', () => {
    const data = createSeed()
    const order = data.orders[1]
    order.lines = [order.lines[0], { ...order.lines[0], qty: 10 }]
    expect(shortages(data.products, order)[0].deficit).toBe(55)
  })

  it('receives stock without releasing holds and rejects invalid deductions', () => {
    const data = createSeed()
    const vid = data.orders[0].lines[0].vid
    const updated = adjustStock(data, vid, 24, 'Stock received')
    const v = stockRows(updated.products).find(r => r.v.id === vid)!.v
    expect(v.qty).toBe(80)
    expect(v.committed).toBe(80)
    expect(shortages(updated.products, updated.orders[0])).toHaveLength(0)
    expect(() => adjustStock(data, vid, -57, 'Sample pulled')).toThrow('below zero')
    expect(data.adjustments).toHaveLength(0)
    expect(updated.adjustments).toHaveLength(1)
  })

  it('uses free stock for health, including negative free', () => {
    const v = { ...createSeed().products[0].variants[0], qty: 20, committed: 25, reorder: 10 }
    expect(free(v)).toBe(-5)
    expect(stockState(v)).toBe('out')
    expect(stockState({ ...v, qty: 35 })).toBe('ok')
    expect(stockState({ ...v, qty: 30 })).toBe('low')
  })
})

describe('event scheduling', () => {
  it('treats shared load-out/load-in dates as overlapping', () => {
    expect(overlaps(day(0), day(2), day(2), day(3))).toBe(true)
    expect(overlaps(day(0), day(1), day(2), day(3))).toBe(false)
  })
  it('derives gear status and prioritizes maintenance over bookings', () => {
    const data = createSeed()
    expect(gearStatus(data.equipment[2], data.events).label).toBe('Out on site')
    expect(gearStatus({ ...data.equipment[2], maintenance: true }, data.events).label).toBe('In maintenance')
    expect(gearStatus(data.equipment[1], data.events).label).toBe('Held for quote')
  })
  it('includes events for their entire date range and omits delivered orders', () => {
    const data = createSeed()
    expect(entriesOn(data, day(3)).some(e => e.id === 'e1')).toBe(true)
    expect(entriesOn(data, day(-3)).some(e => e.id === 'o6')).toBe(false)
  })
})
