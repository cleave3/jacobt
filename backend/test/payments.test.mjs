import test from 'node:test'
import assert from 'node:assert/strict'
import { submitPaymentSchema, updatePaymentSchema, queryPaymentsSchema } from '../dist/modules/payments/payments.schema.js'

test('submitPaymentSchema validates valid payment submission payload', () => {
    const valid = {
        amount: 50000,
        paymentCircle: 2026,
        proofUrl: 'https://res.cloudinary.com/test/image.jpg',
        paymentDate: '2026-10-14',
        userId: 'user-uuid-1',
    }
    const result = submitPaymentSchema.safeParse(valid)
    assert.strictEqual(result.success, true)
})

test('submitPaymentSchema fails when required fields are missing', () => {
    const invalid = {
        amount: 50000,
        // paymentCircle missing
        // proofUrl missing
    }
    const result = submitPaymentSchema.safeParse(invalid)
    assert.strictEqual(result.success, false)
})

test('updatePaymentSchema allows partial updates including paymentDate', () => {
    const updatePayload = {
        amount: 75000,
        paymentDate: '2026-10-12T00:00:00.000Z',
        status: 'CONFIRMED',
    }
    const result = updatePaymentSchema.safeParse(updatePayload)
    assert.strictEqual(result.success, true)
})

test('queryPaymentsSchema validates filter queries correctly', () => {
    const query = {
        page: '2',
        limit: '20',
        year: '2026',
        status: 'CONFIRMED',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        search: 'Jacob',
    }
    const result = queryPaymentsSchema.safeParse(query)
    assert.strictEqual(result.success, true)
})

test('date parsing edge cases: handling YYYY-MM-DD and fallback to now', () => {
    const isoDateStr = '2026-10-14'
    const parsed = new Date(isoDateStr)
    assert.strictEqual(isNaN(parsed.getTime()), false)
    assert.strictEqual(parsed.getUTCFullYear(), 2026)

    // Invalid date fallback verification
    const invalidDateStr = 'not-a-date'
    const candidateDate = new Date(invalidDateStr)
    const fallbackDate = isNaN(candidateDate.getTime()) ? new Date() : candidateDate
    assert.strictEqual(isNaN(fallbackDate.getTime()), false)
})
