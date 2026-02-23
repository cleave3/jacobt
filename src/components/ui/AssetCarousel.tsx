"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetCarouselProps {
    images: string[];
    assetName: string;
    appreciation: number;
}

export function AssetCarousel({ images, assetName, appreciation }: AssetCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative w-full h-64 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center text-slate-400">
                <MapPin className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-64 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm group">
            <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((img, i) => (
                    <div key={i} className="min-w-full h-full relative">
                        <img
                            src={img}
                            alt={`${assetName} ${i + 1}`}
                            className="object-cover w-full h-full"
                        />
                    </div>
                ))}
            </div>

            {/* Floating Appreciation Badge */}
            <div className="absolute top-4 right-4 bg-[#2cd48b] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5 backdrop-blur-sm z-10 transition-transform hover:scale-105">
                <ArrowUpRight className="w-4 h-4" />
                {appreciation.toFixed(1)}% Appreciation
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full z-20">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "transition-all duration-300 rounded-full",
                                    currentIndex === i
                                        ? "w-6 h-2 bg-white"
                                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
