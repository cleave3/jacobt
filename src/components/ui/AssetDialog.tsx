"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, Building2, MapPin, Maximize, Banknote, Calendar, FileText, Image as ImageIcon, Users } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { createAsset, updateAsset } from "@/app/properties/actions";
import { getMembers } from "@/app/members/actions";
import ImageUpload from "./ImageUpload";
import { MultiSelect, Option } from "./multi-select";

interface AssetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    asset?: any; // If provided, we are in "edit" mode
}

export function AssetDialog({ isOpen, onClose, asset }: AssetDialogProps) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [dimensions, setDimensions] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [currentValue, setCurrentValue] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [description, setDescription] = useState("");
    const [associatedUsersId, setAssociatedUsersId] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [allMembers, setAllMembers] = useState<Option[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Fetch members
        const fetchMembers = async () => {
            const result = await getMembers();
            if (result.success && result.members) {
                setAllMembers(result.members.map((m: any) => ({
                    label: m.name,
                    value: m.id
                })));
            }
        };
        fetchMembers();

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (asset) {
            setName(asset.name || "");
            setLocation(asset.location || "");
            setDimensions(asset.dimensions || "");
            setPurchasePrice(asset.purchasePrice?.toString() || "");
            setCurrentValue(asset.currentValue?.toString() || "");
            setPurchaseDate(asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "");
            setDescription(asset.description || "");
            setImages(asset.images || []);
            setAssociatedUsersId(asset.associatedUsersId || []);
        } else {
            setName("");
            setLocation("");
            setDimensions("");
            setPurchasePrice("");
            setCurrentValue("");
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setDescription("");
            setImages([]);
            setAssociatedUsersId([]);
        }
    }, [asset, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const data = {
            name,
            location,
            dimensions,
            purchasePrice: parseFloat(purchasePrice),
            currentValue: parseFloat(currentValue),
            purchaseDate,
            description,
            images,
            associatedUsersId
        };

        const result = asset
            ? await updateAsset(asset.id, data)
            : await createAsset(data);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } else {
            setError(result.error || "Something went wrong");
        }
        setIsSubmitting(false);
    };

    const variants = {
        initial: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
        animate: isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
        exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, x: "-50%", y: "-40%" },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        drag={isMobile ? "y" : false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.8 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed z-[100] bottom-0 md:bottom-auto md:top-1/2 left-0 md:left-1/2 w-full md:w-[500px] max-h-[95vh] bg-white border-t border-slate-200 md:border md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Drag Handle and Close Button Area */}
                        <div className="md:hidden flex flex-col items-center pt-3 pb-2 sticky top-0 bg-white z-20">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-2" />
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-2 md:pt-6 custom-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 font-heading tracking-tight">
                                        {asset ? "Update Property" : "Add New Property"}
                                    </h2>
                                    <p className="text-[14px] text-slate-500 mt-1 font-medium">
                                        {asset ? "Modify existing property details." : "Enter details for a new real estate acquisition."}
                                    </p>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 md:block hidden">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {success ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <CheckCircle2 className="w-16 h-16 text-[#2cd48b]" />
                                    </motion.div>
                                    <h3 className="font-bold text-lg text-slate-900 text-center font-heading">
                                        {asset ? "Property Updated!" : "Property Added!"}
                                    </h3>
                                    <p className="text-sm text-slate-500 text-center font-medium">
                                        Changes have been saved successfully.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 pb-10">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold border border-red-100 mb-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label htmlFor="name" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Property Name</Label>
                                            <div className="relative">
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Primrose Court"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="location" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Location</Label>
                                            <div className="relative">
                                                <Input
                                                    id="location"
                                                    placeholder="Epe, Lagos"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="dimensions" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Dimensions</Label>
                                            <div className="relative">
                                                <Input
                                                    id="dimensions"
                                                    placeholder="500sqm"
                                                    value={dimensions}
                                                    onChange={(e) => setDimensions(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="purchasePrice" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Purchase Price (₦)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="purchasePrice"
                                                    type="number"
                                                    placeholder="2500000"
                                                    value={purchasePrice}
                                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="currentValue" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Current Value (₦)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentValue"
                                                    type="number"
                                                    placeholder="3500000"
                                                    value={currentValue}
                                                    onChange={(e) => setCurrentValue(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="purchaseDate" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Purchase Date</Label>
                                            <div className="relative">
                                                <Input
                                                    id="purchaseDate"
                                                    type="date"
                                                    value={purchaseDate}
                                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                                    required
                                                    className="pl-9 text-[14px] font-semibold border-slate-200 focus:border-finance-gold focus:ring-finance-gold/20 h-10"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Property Images</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                                                {images.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                                                        <img src={img.trim()} alt={`Property ${idx}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <ImageUpload multiple={true} onUpload={(url) => setImages(prev => [...prev, url])} />
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Associated Members</Label>
                                            <div className="relative">
                                                <MultiSelect
                                                    options={allMembers}
                                                    selected={associatedUsersId}
                                                    onChange={setAssociatedUsersId}
                                                    placeholder="Select members..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label htmlFor="description" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Description</Label>
                                            <div className="relative">
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    placeholder="Property description..."
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-[14px] font-semibold focus:border-finance-gold focus:ring-1 focus:ring-finance-gold/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-finance-gold hover:bg-finance-goldLight text-white font-bold text-[15px] rounded-xl shadow-md transition-all active:scale-[0.98]"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Saving..." : asset ? "Update Property" : "Add Property"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onClose}
                                            className="w-full h-10 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
