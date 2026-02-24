import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Maximize, TrendingUp, Building2 } from "lucide-react"
import { Link } from "react-router-dom"
import { AddAssetButton } from "@/components/ui/AddAssetButton"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"

export default function Properties() {
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['assets'],
        queryFn: async (): Promise<any> => await axios.get('/assets')
    })

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-6 w-full">
                    <header className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden pb-6">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-5 space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                                        <div className="space-y-1"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-20" /></div>
                                        <div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-24" /></div>
                                        <div className="space-y-1"><Skeleton className="h-3 w-16" /><Skeleton className="h-4 w-24" /></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        )
    }

    if (error || !response?.success) {
        return <AppShell><div className="flex justify-center p-8 text-red-500">Failed to load properties data.</div></AppShell>
    }

    const assets: any[] = response?.assets || []

    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Properties</h1>
                        <div className="bg-finance-gold text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                            {assets.length} Total
                        </div>
                    </div>
                    <AddAssetButton />
                </header>
                <div className="">
                    {assets.length === 0 ? (
                        <Card className="border-dashed border-2 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                            <CardHeader className="text-center pt-10">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                                    <Building2 className="w-8 h-8 text-slate-400" />
                                </div>
                                <CardTitle className="text-xl text-slate-800 dark:text-white">No Assets Recorded</CardTitle>
                                <CardDescription className="max-w-xs mx-auto text-slate-500">
                                    Begin building the portfolio by securely logging verified real estate acquisitions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center pb-10">
                                <AddAssetButton showFullText={true} />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets?.map?.((asset: any) => {
                                const current = Number(asset.currentValue)
                                const purchase = Number(asset.purchasePrice)
                                const gain = current - purchase
                                const appreciation = purchase > 0 ? ((gain) / purchase) * 100 : 0

                                return (
                                    <Link to={`/properties/${asset.id}`} key={asset.id} className="block group">
                                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative pb-6">

                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border border-slate-200/50 dark:border-slate-700/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-[#2cd48b]" />
                                                <span className="text-[10px] font-bold text-[#2cd48b] tracking-wider uppercase">+{appreciation.toFixed(1)}%</span>
                                            </div>

                                            {/* Image Header */}
                                            <div className="h-48 relative bg-slate-100 dark:bg-slate-800 w-full overflow-hidden flex items-center justify-center">
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                    {asset.images && asset.images.length > 0 ? (
                                                        <img src={asset.images[0]} alt={asset.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MapPin className="w-10 h-10" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-finance-gold transition-colors">{asset.name}</h3>

                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                                    <MapPin className="w-4 h-4 shrink-0" />
                                                    <span className="text-sm truncate font-medium">{asset.location}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
                                                    <Maximize className="w-4 h-4 shrink-0" />
                                                    <span className="text-sm font-medium">{asset.dimensions}</span>
                                                </div>

                                                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Purchased</p>
                                                        <p className="font-bold text-slate-800 dark:text-white text-xs">
                                                            {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Purchase Price</p>
                                                        <p className="font-bold text-slate-900 dark:text-white">₦ {purchase.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Current</p>
                                                        <p className="font-bold text-[#2cd48b]">₦ {current.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}
