import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPageData } from '../src/lib/pagination.ts'

// Simulated backend response as provided by the user
const backendResponse = {
    success: true,
    data: new Array(10).fill({ id: 'dummy' }),
    availableYears: [2025, 2026, 2027],
    meta: {
        total: 21,
        page: 1,
        limit: 10,
        totalPages: 3
    }
}

test('reproduces bug: old extraction logic results in pageCount = 1 and hides pagination', () => {
    // Old buggy logic in Payments.tsx:
    const oldPageData = backendResponse.pageData || {
        isFirstPage: true,
        isLastPage: true,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        pageCount: 1,
        totalCount: backendResponse.data.length
    }

    // Demonstrates the bug: pageCount is 1 despite 21 total items across 3 pages
    assert.strictEqual(oldPageData.pageCount, 1)
    // In Pagination.tsx: if (pageCount <= 1) return null; -> hence hidden!
    const isHiddenInPagination = oldPageData.pageCount <= 1
    assert.strictEqual(isHiddenInPagination, true)
})

test('fixed logic: extracts meta properly and generates correct pageData for page 1', () => {
    const pageData = buildPageData(backendResponse.meta, 1, backendResponse.data.length)

    assert.strictEqual(pageData.currentPage, 1)
    assert.strictEqual(pageData.pageCount, 3)
    assert.strictEqual(pageData.totalCount, 21)
    assert.strictEqual(pageData.isFirstPage, true)
    assert.strictEqual(pageData.isLastPage, false)
    assert.strictEqual(pageData.previousPage, null)
    assert.strictEqual(pageData.nextPage, 2)
    assert.strictEqual(pageData.pageCount > 1, true)
})

test('fixed logic: middle page (page 2 of 3)', () => {
    const pageData = buildPageData({ ...backendResponse.meta, page: 2 }, 2, backendResponse.data.length)

    assert.strictEqual(pageData.currentPage, 2)
    assert.strictEqual(pageData.pageCount, 3)
    assert.strictEqual(pageData.isFirstPage, false)
    assert.strictEqual(pageData.isLastPage, false)
    assert.strictEqual(pageData.previousPage, 1)
    assert.strictEqual(pageData.nextPage, 3)
})

test('fixed logic: last page (page 3 of 3)', () => {
    const pageData = buildPageData({ ...backendResponse.meta, page: 3 }, 3, 1)

    assert.strictEqual(pageData.currentPage, 3)
    assert.strictEqual(pageData.pageCount, 3)
    assert.strictEqual(pageData.isFirstPage, false)
    assert.strictEqual(pageData.isLastPage, true)
    assert.strictEqual(pageData.previousPage, 2)
    assert.strictEqual(pageData.nextPage, null)
})

test('fixed logic: fallback when meta is missing or undefined', () => {
    const pageData = buildPageData(undefined, 1, 5)

    assert.strictEqual(pageData.currentPage, 1)
    assert.strictEqual(pageData.pageCount, 1)
    assert.strictEqual(pageData.totalCount, 5)
    assert.strictEqual(pageData.isFirstPage, true)
    assert.strictEqual(pageData.isLastPage, true)
    assert.strictEqual(pageData.previousPage, null)
    assert.strictEqual(pageData.nextPage, null)
})
