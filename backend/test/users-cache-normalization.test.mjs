import test from 'node:test'
import assert from 'node:assert/strict'

// Reproduction of the bug:
// When TanStack Query has cached { users: [...] } from Members.tsx,
// calling usersData?.map throws TypeError because usersData is an object, not an array.
test('REPRODUCE BUG: calling .map on object { users: [...] } throws TypeError', () => {
    const cachedUsersData = {
        users: [
            { id: 'u1', name: 'Jacob T' },
            { id: 'u2', name: 'John Doe' }
        ]
    }

    // Direct invocation like PaymentFilters.tsx:114 fails
    assert.throws(
        () => {
            // @ts-ignore
            cachedUsersData.map(u => u.id)
        },
        {
            name: 'TypeError',
        }
    )
})

// Safe normalizer function to be used across frontend
export function normalizeUsersList(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.users)) return data.users
    return []
}

test('FIX: normalizeUsersList safely extracts array from object { users: [...] }', () => {
    const cachedUsersData = {
        users: [
            { id: 'u1', name: 'Jacob T' },
            { id: 'u2', name: 'John Doe' }
        ]
    }
    const result = normalizeUsersList(cachedUsersData)
    assert.strictEqual(Array.isArray(result), true)
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].name, 'Jacob T')
    // Now map works with 0 errors!
    const names = result.map(u => u.name)
    assert.deepStrictEqual(names, ['Jacob T', 'John Doe'])
})

test('FIX: normalizeUsersList safely handles direct array', () => {
    const rawArray = [{ id: 'u1', name: 'Jacob T' }]
    const result = normalizeUsersList(rawArray)
    assert.strictEqual(Array.isArray(result), true)
    assert.strictEqual(result.length, 1)
})

test('FIX: normalizeUsersList safely handles null, undefined, and empty objects', () => {
    assert.deepStrictEqual(normalizeUsersList(null), [])
    assert.deepStrictEqual(normalizeUsersList(undefined), [])
    assert.deepStrictEqual(normalizeUsersList({}), [])
    assert.deepStrictEqual(normalizeUsersList('unexpected-string'), [])
})
