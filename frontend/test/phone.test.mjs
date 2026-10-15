import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhoneNumber } from '../src/lib/phone.ts'

test('phone normalizer: leaves standard 11-digit local Nigerian numbers intact', () => {
    assert.strictEqual(normalizePhoneNumber('08012345678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('09098765432'), '09098765432')
    assert.strictEqual(normalizePhoneNumber('07011223344'), '07011223344')
})

test('phone normalizer: prepends leading 0 when 10 digits are provided without leading 0', () => {
    assert.strictEqual(normalizePhoneNumber('8012345678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('9098765432'), '09098765432')
    assert.strictEqual(normalizePhoneNumber('7011223344'), '07011223344')
})

test('phone normalizer: converts +234 international format into 11-digit local format', () => {
    assert.strictEqual(normalizePhoneNumber('+2348012345678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('2348012345678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('+234 801 234 5678'), '08012345678')
})

test('phone normalizer: strips spaces, dashes and brackets from inputs', () => {
    assert.strictEqual(normalizePhoneNumber('0801 234 5678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('0801-234-5678'), '08012345678')
    assert.strictEqual(normalizePhoneNumber('(0801) 234 5678'), '08012345678')
})

test('phone normalizer: preserves non-standard format gracefully without crashing', () => {
    assert.strictEqual(normalizePhoneNumber('12345'), '12345')
    assert.strictEqual(normalizePhoneNumber(''), '')
})
