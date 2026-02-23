

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize, Plus, TrendingUp, Building2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { AddAssetButton } from "@/components/ui/AddAssetButton";

export default async function AssetsPage() {
    const assets = await prisma.asset.findMany({
        orderBy: { createdAt: 'desc' }
    });

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
                            {assets.map((asset) => {
                                const current = Number(asset.currentValue);
                                const purchase = Number(asset.purchasePrice);
                                const gain = current - purchase;
                                const appreciation = purchase > 0 ? ((gain) / purchase) * 100 : 0;

                                return (
                                    <Link href={`/properties/${asset.id}`} key={asset.id} className="block group">
                                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">

                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border border-slate-200/50 dark:border-slate-700/50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-[#2cd48b]" />
                                                <span className="text-[10px] font-bold text-[#2cd48b] tracking-wider uppercase">+{appreciation.toFixed(1)}%</span>
                                            </div>

                                            {/* Image Header */}
                                            <div className="h-auto relative bg-slate-100 dark:bg-slate-800 w-full overflow-hidden">
                                                {/* {asset.images && asset.images.length > 0 ? (
                                                    <img
                                                        src={asset.images[0]}
                                                        alt={asset.name}
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    />
                                                ) : (
                                                )} */}
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300"><MapPin className="w-10 h-10" /></div>
                                            </div>

                                            {/* Content Loop */}
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

                                                <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
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
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
