

import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageNumberPagination {
    isFirstPage: boolean
    isLastPage: boolean
    currentPage: number
    previousPage: number | null
    nextPage: number | null
    pageCount: number
    totalCount: number
}

interface PaginationProps {
    pageData: PageNumberPagination
    baseUrl: string
}

export function Pagination({ pageData, baseUrl }: PaginationProps) {
    const { currentPage, pageCount, previousPage, nextPage, isFirstPage, isLastPage } = pageData

    if (pageCount <= 1) return null

    const getPageUrl = (page: number) => {
        const url = new URL(baseUrl, window.location.origin)
        url.searchParams.set("page", page.toString())
        return url.pathname + url.search
    }

    // Generate page numbers to show
    const getVisiblePages = () => {
        const pages = []
        const delta = 2 // Number of pages shown around current

        for (let i = Math.max(1, currentPage - delta); i <= Math.min(pageCount, currentPage + delta); i++) {
            pages.push(i)
        }
        return pages
    }

    const visiblePages = getVisiblePages()

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    to={previousPage ? getPageUrl(previousPage) : "#"}
                    className={cn(
                        "relative inline-flex items-center rounded-md border border-slate-200 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50",
                        isFirstPage && "pointer-events-none opacity-50"
                    )}
                >
                    Previous
                </Link>
                <Link
                    to={nextPage ? getPageUrl(nextPage) : "#"}
                    className={cn(
                        "relative ml-3 inline-flex items-center rounded-md border border-slate-200 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50",
                        isLastPage && "pointer-events-none opacity-50"
                    )}
                >
                    Next
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-700 dark:text-slate-400">
                        Showing page <span className="font-bold">{currentPage}</span> of{" "}
                        <span className="font-bold">{pageCount}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Link
                            to={previousPage ? getPageUrl(previousPage) : "#"}
                            className={cn(
                                "relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors",
                                isFirstPage && "pointer-events-none opacity-50"
                            )}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Link>

                        {visiblePages[0] > 1 && (
                            <>
                                <Link
                                    to={getPageUrl(1)}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors"
                                >
                                    1
                                </Link>
                                {visiblePages[0] > 2 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                                        ...
                                    </span>
                                )}
                            </>
                        )}

                        {visiblePages.map((page) => (
                            <Link
                                key={page}
                                to={getPageUrl(page)}
                                aria-current={currentPage === page ? "page" : undefined}
                                className={cn(
                                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-colors ring-1 ring-inset ring-slate-200 dark:ring-slate-700",
                                    currentPage === page
                                        ? "z-10 bg-finance-gold text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-finance-gold"
                                        : "text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                {page}
                            </Link>
                        ))}

                        {visiblePages[visiblePages.length - 1] < pageCount && (
                            <>
                                {visiblePages[visiblePages.length - 1] < pageCount - 1 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-500 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                                        ...
                                    </span>
                                )}
                                <Link
                                    to={getPageUrl(pageCount)}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors"
                                >
                                    {pageCount}
                                </Link>
                            </>
                        )}

                        <Link
                            to={nextPage ? getPageUrl(nextPage) : "#"}
                            className={cn(
                                "relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 transition-colors",
                                isLastPage && "pointer-events-none opacity-50"
                            )}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}
