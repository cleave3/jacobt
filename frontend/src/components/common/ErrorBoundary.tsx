import React, { Component, ReactNode, ErrorInfo } from "react"
import { AlertTriangle, RotateCcw, Home, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode)
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    title?: string
    description?: string
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    showDetails: boolean
    copied: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo })
        console.error("ErrorBoundary caught an unhandled error:", error, errorInfo)
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            copied: false,
        })
    }

    handleCopyDetails = (): void => {
        const { error, errorInfo } = this.state
        const textToCopy = `Error: ${error?.message || "Unknown error"}\n\nStack:\n${error?.stack || ""}\n\nComponent Stack:\n${errorInfo?.componentStack || ""}`
        navigator.clipboard.writeText(textToCopy)
        this.setState({ copied: true })
        setTimeout(() => this.setState({ copied: false }), 2000)
    }

    render(): ReactNode {
        const { hasError, error, errorInfo, showDetails, copied } = this.state
        const { children, fallback, title, description } = this.props

        if (hasError && error) {
            if (typeof fallback === "function") {
                return fallback({ error, reset: this.handleReset })
            }
            if (fallback) {
                return fallback
            }

            return (
                <div className="min-h-[400px] w-full flex items-center justify-center p-4 sm:p-6 my-auto">
                    <div className="w-full max-w-xl bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all p-6 sm:p-8">
                        {/* Header with Warning Icon */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-500/30">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {title || "Something went wrong"}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {description || "An unexpected error occurred while rendering this section. Your data is safe and your session is intact."}
                                </p>
                            </div>
                        </div>

                        {/* Error message preview */}
                        <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-rose-600 dark:text-rose-400 break-words">
                            {error.message || "Unknown runtime error occurred."}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-finance-gold hover:bg-finance-goldLight text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Try Again</span>
                            </button>

                            <button
                                onClick={() => {
                                    this.handleReset()
                                    window.location.href = "/"
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span>Overview</span>
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs font-medium active:scale-95 transition-all cursor-pointer ml-auto"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reload Page</span>
                            </button>
                        </div>

                        {/* Collapsible Technical Details */}
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => this.setState({ showDetails: !showDetails })}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    <span>{showDetails ? "Hide technical details" : "Show technical details"}</span>
                                </button>

                                {showDetails && (
                                    <button
                                        onClick={this.handleCopyDetails}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-finance-gold hover:underline cursor-pointer"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        <span>{copied ? "Copied" : "Copy error"}</span>
                                    </button>
                                )}
                            </div>

                            {showDetails && (
                                <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-56 scrollbar-thin">
                                    <p className="font-bold text-rose-400 mb-1">{error.name}: {error.message}</p>
                                    {error.stack && (
                                        <pre className="whitespace-pre-wrap text-slate-400 mt-2">{error.stack}</pre>
                                    )}
                                    {errorInfo?.componentStack && (
                                        <pre className="whitespace-pre-wrap text-slate-500 mt-2">{errorInfo.componentStack}</pre>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        return children
    }
}
