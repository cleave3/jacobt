
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts"

interface DashboardChartProps {
    data: { name: string, total: number, goal: number }[]
}

export function DashboardChart({ data = [] }: DashboardChartProps) {
    const chartHeight = Math.max(240, Math.min(480, data.length * 44 + 40))
    const maxGoal = Math.max(...data.map(d => d.goal || 0), ...data.map(d => d.total || 0), 1000)

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 10, bottom: 8 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis
                        type="number"
                        domain={[0, maxGoal]}
                        tickFormatter={(val) => val >= 1000000 ? `₦${(val / 1000000).toFixed(1)}M` : `₦${(val / 1000).toFixed(0)}k`}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                        width={75}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(212, 175, 55, 0.04)' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const item = payload[0].payload
                                const percentage = Math.min(100, Math.round((item.total / (item.goal || 1)) * 100))
                                return (
                                    <div className="bg-white dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl min-w-[200px]">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.total >= item.goal ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                                {percentage}% Met
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                                <span>Contributed:</span>
                                                <strong className="text-slate-900 dark:text-white font-mono">₦ {item.total.toLocaleString()}</strong>
                                            </div>
                                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                                <span>Target Goal:</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-mono">₦ {item.goal.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${item.total >= item.goal ? 'bg-emerald-500' : 'bg-finance-gold'}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Bar
                        dataKey="total"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.total >= entry.goal ? "#2cd48b" : "#d4af37"}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

