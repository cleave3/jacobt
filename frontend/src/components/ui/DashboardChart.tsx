
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface DashboardChartProps {
    data: { name: string, total: number, goal: number }[]
}

export function DashboardChart({ data = [] }: DashboardChartProps) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
                {/* <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" /> */}
                <XAxis type="number" domain={[0, data?.[0]?.goal || 0]} />
                <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    width={20}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl">
                                    <p className="font-bold text-slate-900 dark:text-white mb-1">{data.name}</p>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500">
                                            Contributed: <span className="text-slate-900 dark:text-white font-bold ml-1">₦ {data.total.toLocaleString()}</span>
                                        </p>
                                        <p className="text-xs font-medium text-slate-500">
                                            Target: <span className="text-slate-900 dark:text-white font-bold ml-1">₦ {data.goal.toLocaleString()}</span>
                                        </p>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-finance-gold transition-all duration-500"
                                                style={{ width: `${Math.min(100, (data.total / (data.goal || 1)) * 100)}%` }}
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
                    radius={[0, 4, 4, 0]}
                    barSize={5}
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
    )
}
