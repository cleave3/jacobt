import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Maximize, TrendingUp, Building2, ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AddAssetButton } from "@/components/ui/AddAssetButton"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"

interface Asset {
    id: string
    name: string
    location?: string
    dimensions?: string
    purchasePrice: number | string
    currentValue: number | string
    images?: string[]
}

interface AssetsResponse {
    success: boolean
    assets: Asset[]
}

export default function Properties() {
    const { data: response, isLoading, error } = useQuery<AssetsResponse>({
        queryKey: ['assets'],
        queryFn: async (): Promise<AssetsResponse> => {
            const res = await axios.get('/assets')
            return res.data || res
        }
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

    const assets: Asset[] = response?.assets || []

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
                        <motion.div 
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.05 }
                                }
                            }}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {assets?.map?.((asset: Asset) => {
                                const current = Number(asset.currentValue)
                                const purchase = Number(asset.purchasePrice)
                                const gain = current - purchase
                                const appreciation = purchase > 0 ? ((gain) / purchase) * 100 : 0

                                return (
                                    <motion.div
                                        key={asset.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 12 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileTap={{ scale: 0.985 }}
                                    >
                                        <Link to={`/properties/${asset.id}`} className="block group">
                                            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative">
                                                {/* Image Container with 16:9 aspect ratio */}
                                                <div className="aspect-[16/9] relative bg-slate-100 dark:bg-slate-800 w-full overflow-hidden flex items-center justify-center">
                                                    {asset.images && asset.images.length > 0 ? (
                                                        <img 
                                                            src={asset.images[0]} 
                                                            alt={asset.name} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                        />
                                                    ) : (
                                                        <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center gap-1.5">
                                                            <Building2 className="w-10 h-10" />
                                                            <span className="text-[11px] font-medium">No image</span>
                                                        </div>
                                                    )}

                                                    {/* Floating Frosted Glass Appreciation Badge */}
                                                    <div className="absolute top-3 right-3 z-10 bg-slate-900/75 dark:bg-slate-900/85 backdrop-blur-md shadow-md border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                        <TrendingUp className="w-3.5 h-3.5 text-[#2cd48b]" />
                                                        <span className="text-[11px] font-bold text-[#2cd48b] tracking-wider">
                                                            +{appreciation.toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    {/* Location Overlay Pill */}
                                                    <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white text-xs max-w-[80%]">
                                                        <MapPin className="w-3 h-3 shrink-0 text-finance-gold" />
                                                        <span className="truncate text-[11px] font-medium">{asset.location}</span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 sm:p-5">
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-finance-gold transition-colors truncate">
                                                            {asset.name}
                                                        </h3>
                                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-finance-gold transition-colors shrink-0 mt-0.5" />
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-4">
                                                        <Maximize className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="font-medium">{asset.dimensions}</span>
                                                    </div>

                                                    {/* Valuation Growth Bar */}
                                                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-2">
                                                        <div className="flex justify-between items-baseline text-xs mb-1">
                                                            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Purchase</span>
                                                            <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Current Value</span>
                                                        </div>
                                                        <div className="flex justify-between items-baseline mb-2">
                                                            <span className="font-bold font-mono text-slate-700 dark:text-slate-300 text-xs">
                                                                ₦ {purchase.toLocaleString()}
                                                            </span>
                                                            <span className="font-extrabold font-mono text-[#2cd48b] text-sm">
                                                                ₦ {current.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}
