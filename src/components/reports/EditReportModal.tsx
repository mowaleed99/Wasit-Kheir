import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetApiCategoriesTree } from "@/api/generated/categories/categories";
import { usePutApiReportsId } from "@/api/generated/reports/reports";
import { MapPicker } from "@/components/ui/MapPicker";
import { X, MapPin, Tag, Type, Image as ImageIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { resolveImageUrl } from "@/utils/imageUrl";

const getReportSchema = (t: any) => z.object({
    title: z.string().min(3, t('createReport.validation.titleMin')),
    description: z.string().min(10, t('createReport.validation.descMin')),
    subCategoryId: z.number().min(1, t('createReport.validation.subCatRequired')),
    dateReported: z.string().optional(),
});

type ReportFormData = {
    title: string;
    description: string;
    subCategoryId: number;
    dateReported?: string;
};

const getReportTypes = (t: any) => [
    { value: "LostItem", label: t('reportTypes.LostItem'), color: "text-red-600 dark:text-red-400", activeClass: "bg-card text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-900/50" },
    { value: "FoundItem", label: t('reportTypes.FoundItem'), color: "text-green-600 dark:text-green-400", activeClass: "bg-card text-green-600 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-900/50" },
    { value: "LostPerson", label: t('reportTypes.LostPerson'), color: "text-orange-600 dark:text-orange-400", activeClass: "bg-card text-orange-600 dark:text-orange-400 shadow-sm border border-orange-200 dark:border-orange-900/50" },
    { value: "FoundPerson", label: t('reportTypes.FoundPerson'), color: "text-blue-600 dark:text-blue-400", activeClass: "bg-card text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-900/50" },
];

interface EditReportModalProps {
    report: any;
    isOpen: boolean;
    onClose: () => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({ report, isOpen, onClose }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [reportType, setReportType] = useState<string>("LostItem");
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [showMap, setShowMap] = useState(false);
    
    // Existing images from backend
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
    
    // New images
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutate: updateReport, isPending } = usePutApiReportsId();
    const { data: categoriesTree } = useGetApiCategoriesTree();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ReportFormData>({
        resolver: zodResolver(getReportSchema(t)),
    });

    const reportTypes = useMemo(() => getReportTypes(t), [t]);

    // Initialize state from report
    useEffect(() => {
        if (report && isOpen) {
            setReportType(report.type || "LostItem");
            
            // Set initial form values
            reset({
                title: report.title || "",
                description: report.description || "",
                subCategoryId: report.subCategoryId || 0,
                dateReported: report.dateReported ? report.dateReported.split("T")[0] : "",
            });

            // Find parent category ID based on subCategoryId
            if (report.subCategoryId && categoriesTree) {
                const data = (categoriesTree as any).data || categoriesTree;
                if (Array.isArray(data)) {
                    for (const cat of data) {
                        if (cat.subCategories?.some((sub: any) => sub.id === report.subCategoryId)) {
                            setSelectedCategory(cat.id);
                            break;
                        }
                    }
                }
            }

            if (report.latitude && report.longitude) {
                setLocation({ lat: report.latitude, lng: report.longitude, address: report.locationName || "" });
            }

            if (report.images && Array.isArray(report.images)) {
                setExistingImages(report.images);
            }
            
            setRemovedImageIds([]);
            setNewImages([]);
            setPreviews([]);
            setSubmitError(null);
        }
    }, [report, isOpen, categoriesTree, reset]);

    const subCategories = useMemo(() => {
        if (!selectedCategory || !categoriesTree) return [];
        const data = (categoriesTree as any).data || categoriesTree;
        if (!Array.isArray(data)) return [];
        const category = data.find((c: any) => c.id === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory, categoriesTree]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (imageId: number) => {
        setRemovedImageIds((prev) => [...prev, imageId]);
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const onSubmit = (data: ReportFormData) => {
        setSubmitError(null);

        const payload: any = {
            Title: data.title,
            Description: data.description,
            Type: reportType,
            SubCategoryId: data.subCategoryId,
            LocationName: location?.address,
            Latitude: location?.lat,
            Longitude: location?.lng,
            DateReported: data.dateReported || new Date().toISOString().split("T")[0],
            ImageIdsToRemove: removedImageIds.length > 0 ? removedImageIds : undefined,
            NewImages: newImages.length > 0 ? newImages : undefined,
        };

        updateReport({ id: report.id, data: payload }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["reports-feed"] });
                queryClient.invalidateQueries({ queryKey: ["reports-mine"] });
                queryClient.invalidateQueries({ queryKey: ["report-detail", report.id] });
                onClose();
            },
            onError: (error: any) => {
                const msg =
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    error?.message ||
                    "Failed to update report.";
                setSubmitError(msg);
            },
        });
    };

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm rtl:dir-rtl">
            <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-xl border border-border flex flex-col relative">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Edit Report</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                    {/* Report Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('createReport.reportType')} <span className="text-red-500">{t('createReport.required')}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                            {reportTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setReportType(type.value)}
                                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${reportType === type.value ? type.activeClass : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            {t('createReport.titleLabel')} <span className="text-red-500">{t('createReport.required')}</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto text-muted-foreground">
                                <Type className="w-5 h-5" />
                            </div>
                            <input
                                {...register("title")}
                                className={`w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 bg-card border ${errors.title ? "border-red-500" : "border-border"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-foreground placeholder:text-muted-foreground`}
                                placeholder={t('createReport.titlePlaceholder')}
                            />
                        </div>
                        {errors.title && <p className="text-red-500 text-sm ml-1 rtl:mr-1 rtl:ml-0">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            {t('createReport.descriptionLabel')} <span className="text-red-500">{t('createReport.required')}</span>
                        </label>
                        <textarea
                            {...register("description")}
                            rows={4}
                            className={`w-full px-4 py-3 bg-card border ${errors.description ? "border-red-500" : "border-border"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-foreground placeholder:text-muted-foreground`}
                            placeholder={t('createReport.descriptionPlaceholder')}
                        />
                        {errors.description && <p className="text-red-500 text-sm ml-1 rtl:mr-1 rtl:ml-0">{errors.description.message}</p>}
                    </div>

                    {/* Category Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">
                                {t('createReport.categoryLabel')} <span className="text-red-500">{t('createReport.required')}</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto text-muted-foreground">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <select
                                    className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none text-foreground"
                                    onChange={(e) => setSelectedCategory(Number(e.target.value))}
                                    value={selectedCategory || ""}
                                >
                                    <option value="">{t('createReport.selectCategory')}</option>
                                    {(categoriesTree as any)?.data?.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {t(`categories.${cat.name}`, { defaultValue: cat.name })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-foreground">
                                {t('createReport.subcategoryLabel')} <span className="text-red-500">{t('createReport.required')}</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 rtl:right-3 rtl:left-auto text-muted-foreground">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <select
                                    {...register("subCategoryId", { valueAsNumber: true })}
                                    className={`w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 bg-card border ${errors.subCategoryId ? "border-red-500" : "border-border"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed`}
                                    disabled={!selectedCategory}
                                >
                                    <option value="">{t('createReport.selectSubcategory')}</option>
                                    {subCategories.map((sub: any) => (
                                        <option key={sub.id} value={sub.id}>
                                            {t(`subcategories.${sub.name}`, { defaultValue: sub.name })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {errors.subCategoryId && <p className="text-red-500 text-sm ml-1 rtl:mr-1 rtl:ml-0">{errors.subCategoryId.message}</p>}
                        </div>
                    </div>

                    {/* Date Reported */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            {t('createReport.dateReportedLabel')} <span className="text-muted-foreground font-normal">{t('createReport.optional')}</span>
                        </label>
                        <input
                            type="date"
                            {...register("dateReported")}
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-foreground"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            {t('createReport.locationLabel')} <span className="text-muted-foreground font-normal">{t('createReport.optional')}</span>
                        </label>
                        {!showMap ? (
                            <button
                                type="button"
                                onClick={() => setShowMap(true)}
                                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                            >
                                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>{location ? t('createReport.locationSelected', { address: location.address }) : t('createReport.pickLocationOnMap')}</span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="rounded-xl overflow-hidden border border-border h-80 relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowMap(false)}
                                        className="absolute top-2 right-2 z-[1000] bg-card p-2 rounded-full shadow-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <MapPicker
                                        onLocationSelect={(lat, lng, address) => {
                                            setLocation({ lat, lng, address });
                                        }}
                                        initialLocation={location ? { lat: location.lat, lng: location.lng } : undefined}
                                    />
                                </div>
                                {location && (
                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                        <MapPin className="w-4 h-4 rtl:ml-1 rtl:mr-0" />
                                        {t('createReport.locationSelected', { address: location.address })}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Photos */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            {t('createReport.photosLabel')} <span className="text-muted-foreground font-normal">{t('createReport.optional')}</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Existing Images */}
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                    <img src={resolveImageUrl(img.imageUrl || img.url)} alt="Existing" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            {/* New Previews */}
                            {previews.map((preview, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                                <div className="p-3 rounded-full bg-muted group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors mb-2">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-blue-500" />
                                </div>
                                <span className="text-sm text-muted-foreground group-hover:text-blue-600 font-medium">{t('createReport.addPhoto')}</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
