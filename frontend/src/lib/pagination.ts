export interface PageNumberPagination {
    isFirstPage: boolean
    isLastPage: boolean
    currentPage: number
    previousPage: number | null
    nextPage: number | null
    pageCount: number
    totalCount: number
}

export interface PaginationMeta {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
}

export function buildPageData(
    meta?: PaginationMeta | null,
    fallbackPage: number = 1,
    fallbackTotal: number = 0
): PageNumberPagination {
    const currentPage = meta?.page ?? fallbackPage
    const rawTotalPages = meta?.totalPages
    const pageCount = rawTotalPages !== undefined ? Math.max(1, rawTotalPages) : (fallbackTotal > 0 ? 1 : 1)
    const totalCount = meta?.total ?? fallbackTotal

    return {
        currentPage,
        pageCount,
        totalCount,
        isFirstPage: currentPage <= 1,
        isLastPage: currentPage >= pageCount,
        previousPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < pageCount ? currentPage + 1 : null,
    }
}
