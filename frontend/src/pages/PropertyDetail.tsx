import { Link, useParams } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Ruler, Calendar, TrendingUp, Users } from "lucide-react"
import { AssetCarousel } from "@/components/ui/AssetCarousel"
import { EditAssetButton } from "@/components/ui/EditAssetButton"
import { useQuery } from "@tanstack/react-query"
import { axios } from "@/lib/axios"
import { AccessControl } from "@/components/auth/AccessControl"

export default function PropertyDetail() {
    const { id } = useParams()

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['asset', id],
        queryFn: async (): Promise<any> => await axios.get(`/assets/${id}`),
        enabled: !!id
    })

    if (isLoading) {
        return (
            <AppShell>
                <div className="flex flex-col gap-4 md:gap-6 max-w-2xl mx-auto w-full">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-64 md:h-80 w-full rounded-2xl" />
                    <div className="mt-2 flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 md:w-64" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <Skeleton className="h-5 w-40" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl mt-4" />
                </div>
            </AppShell>
        )
    }

    if (error || !response.asset) {
        return (
            <AppShell>
                <div className="flex flex-col items-center p-8 text-center">
                    <div className="text-red-500 mb-4">Asset not found.</div>
                    <Link to="/properties" className="text-finance-gold hover:underline">Return to Properties</Link>
                </div>
            </AppShell>
        )
    }

    const asset = response.asset
    const associatedUsers = asset.associatedUsers || []

    const current = Number(asset.currentValue)
    const purchase = Number(asset.purchasePrice)
    const gain = current - purchase
    const appreciation = purchase > 0 ? ((gain) / purchase) * 100 : 0

    const createdAtTime = new Date(asset.createdAt || new Date()).getTime()
    const monthsSincePurchase = Math.max(1, (new Date().getTime() - createdAtTime) / (1000 * 60 * 60 * 24 * 30))
    const annualReturn = (appreciation / (monthsSincePurchase / 12)).toFixed(1)

    return (
        <AppShell>
            <div className="flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto">

                <Link to="/properties" className="inline-flex items-center gap-2 text-slate-800 dark:text-white font-medium hover:text-finance-gold transition-colors w-fit mb-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Assets</span>
                </Link>

                <AssetCarousel
                    images={asset.images || []}
                    assetName={asset.name}
                    appreciation={appreciation}
                />

                <div className="mt-2 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mb-2">{asset.name}</h1>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{asset.location}</span>
                        </div>
                    </div>
                    <AccessControl permittedRoles={["ADMIN", "SUPERADMIN"]}>
                        <EditAssetButton asset={asset} />
                    </AccessControl>
                </div>

                {associatedUsers.length > 0 ? (
                    <div className="flex flex-col gap-1.5 text-slate-500 font-medium mb-4">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Associated Members</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {associatedUsers.map((user: any) => (
                                <span className="p-2 bg-finance-gold/20 text-finance-gold rounded-md" key={user.id}>{user.name}</span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 text-slate-500 font-medium mb-4">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Associated Members</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">No associated members</div>
                    </div>
                )}

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {asset.description || "No extensive description provided for this asset. It is actively maintained within the portfolio."}
                </p>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-4 md:p-5">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Purchase</p>
                            <p className="font-bold text-lg md:text-xl text-slate-900 dark:text-white tracking-tight">₦ {purchase.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-4 md:p-5">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Current Value</p>
                            <p className="font-bold text-lg md:text-xl text-[#2cd48b] tracking-tight">₦ {current.toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-4 md:p-5">
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Capital Gain</p>
                            <p className="font-bold text-lg md:text-xl text-[#2cd48b] tracking-tight">+{gain >= 0 ? '₦ ' : '-₦ '}{Math.abs(gain).toLocaleString()}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-finance-gold text-white border-transparent shadow-sm rounded-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <CardContent className="p-4 md:p-5 flex flex-col justify-center h-full relative z-10">
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1.5 opacity-90">Appreciation</p>
                            <p className="font-bold text-2xl md:text-3xl tracking-tight">{appreciation.toFixed(1)}%</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-sm mt-4 rounded-xl overflow-hidden">
                    <div className="p-5 pb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Details</h3>
                    </div>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Ruler className="w-4 h-4" />
                                    <span className="font-medium">Dimensions</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">{asset.dimensions}</span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Purchase Date</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Added</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {asset.createdAt ? new Date(asset.createdAt).toLocaleString() : 'N/A'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Added By</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {asset?.submittedBy?.name || 'N/A'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Last Updated</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : 'N/A'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Last Updated By</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {asset?.updatedBy?.name || 'N/A'}
                                </span>
                            </li>
                            <li className="flex justify-between items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-medium">Est. Annual Return</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">{annualReturn}% / yr</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Extra spacing at the bottom for Mobile Bottom Nav clearance */}
                <div className="h-6 md:h-0"></div>
            </div>
        </AppShell >
    )
}
