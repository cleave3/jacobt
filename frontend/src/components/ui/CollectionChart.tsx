
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
// import { motion } from "framer-motion"

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
    const percentage = Math.min(100, parseFloat(raisedPercentage))
    const progressColor = getProgressColor(percentage)

    const data = [
        { name: "Raised", value: percentage, color: progressColor },
        { name: "Remaining", value: 100 - percentage, color: "#f1f5f9" },
    ]

    // Needle calculation: 0% is left (-90deg), 100% is right (90deg)
    // const rotation = (percentage * 1.8) - 90

    return (
        <div className="w-full h-[280px] sm:h-[320px] relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="90%"
                        innerRadius="85%"
                        outerRadius="120%" // Pushing boundaries to maximize size
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

            {/* Content Display - Positioned relative to the arc center */}
            <div className="absolute inset-x-0 bottom-[10%] flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-5xl sm:text-6xl font-bold font-heading tracking-tight text-slate-900 dark:text-white leading-none">
                    {percentage?.toFixed(1)}%
                </span>
                <span className="text-xs sm:text-sm text-slate-500 uppercase font-bold tracking-widest mt-3 sm:mt-4">
                    Collected
                </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-2 pb-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Raised</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight leading-none mt-1">₦ {raisedTotal.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Target</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight leading-none mt-1">₦ {expectedTotal.toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
