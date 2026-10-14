
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface CollectionChartProps {
    raisedTotal: number
    expectedTotal: number
    raisedPercentage: string
}

const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "#ef4444" // Red
    if (percentage < 70) return "#f59e0b" // Amber
    return "#2cd48b" // Green
}

export function CollectionChart({ raisedTotal, expectedTotal, raisedPercentage }: CollectionChartProps) {
    const rawVal = parseFloat(raisedPercentage) || 0
    const percentage = Math.min(100, Math.max(0, rawVal))
    const progressColor = getProgressColor(percentage)

    const data = [
        { name: "Raised", value: percentage, color: progressColor },
        { name: "Remaining", value: Math.max(0, 100 - percentage), color: "var(--track-color, #e2e8f0)" },
    ]

    const remainingGap = Math.max(0, expectedTotal - raisedTotal)

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full h-[220px] sm:h-[240px] relative overflow-hidden [--track-color:#f1f5f9] dark:[--track-color:#334155]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="90%"
                            innerRadius="82%"
                            outerRadius="115%"
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Percentage Center Display */}
                <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                        {percentage.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mt-2">
                        Collected
                    </span>
                </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                        ₦ {expectedTotal.toLocaleString()}
                    </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-100/60 dark:border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Raised</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                        ₦ {raisedTotal.toLocaleString()}
                    </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5 block">
                        ₦ {remainingGap.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    )
}

