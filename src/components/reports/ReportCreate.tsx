import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetApiCategoriesTree } from "@/api/generated/categories/categories";
import { usePostApiReports } from "@/api/generated/reports/reports";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPicker } from "@/components/ui/MapPicker";
import { X, MapPin, Tag, Type, Image as ImageIcon, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const reportSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    subCategoryId: z.number().min(1, "Please select a subcategory"),
    dateReported: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const REPORT_TYPES = [
    { value: "LostItem", label: "Lost Item", color: "text-red-600", activeClass: "bg-white text-red-600 shadow-sm" },
    { value: "FoundItem", label: "Found Item", color: "text-green-600", activeClass: "bg-white text-green-600 shadow-sm" },
    { value: "LostPerson", label: "Lost Person", color: "text-orange-600", activeClass: "bg-white text-orange-600 shadow-sm" },
    { value: "FoundPerson", label: "Found Person", color: "text-blue-600", activeClass: "bg-white text-blue-600 shadow-sm" },
];

export const ReportCreate = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [reportType, setReportType] = useState<string>("LostItem");
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutate: createReport, isPending } = usePostApiReports();
    const { data: categoriesTree } = useGetApiCategoriesTree();

    const subCategories = useMemo(() => {
        if (!selectedCategory || !categoriesTree) return [];
        const data = (categoriesTree as any).data || categoriesTree;
        if (!Array.isArray(data)) return [];
        const category = data.find((c: any) => c.id === selectedCategory);
        return category?.subCategories || [];
    }, [selectedCategory, categoriesTree]);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
            setValue("subCategoryId", 0); // trigger validation update
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
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
            Images: images.length > 0 ? images : undefined,
        };

        createReport({ data: payload }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["reports-feed"] });
                queryClient.invalidateQueries({ queryKey: ["reports-mine"] });
                navigate("/");
            },
            onError: (error: any) => {
                const msg =
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    error?.message ||
                    "Failed to create report. Please try again.";
                setSubmitError(msg);
            },
        });
    };

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Report Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                    {REPORT_TYPES.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => setReportType(type.value)}
                            className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${reportType === type.value ? type.activeClass : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
                        <Type className="w-5 h-5" />
                    </div>
                    <input
                        {...register("title")}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.title ? "border-red-300" : "border-gray-200"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-400`}
                        placeholder={`e.g. Lost black wallet near Cairo Mall`}
                    />
                </div>
                {errors.title && <p className="text-red-500 text-sm ml-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    {...register("description")}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.description ? "border-red-300" : "border-gray-200"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-gray-900 placeholder-gray-400`}
                    placeholder={`Describe the item in detail...`}
                />
                {errors.description && <p className="text-red-500 text-sm ml-1">{errors.description.message}</p>}
            </div>

            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
                            <Tag className="w-5 h-5" />
                        </div>
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none text-gray-900"
                            onChange={(e) => setSelectedCategory(Number(e.target.value))}
                            value={selectedCategory || ""}
                        >
                            <option value="">Select Category</option>
                            {(categoriesTree as any)?.data?.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Subcategory <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
                            <Tag className="w-5 h-5" />
                        </div>
                        <select
                            {...register("subCategoryId", { valueAsNumber: true })}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.subCategoryId ? "border-red-300" : "border-gray-200"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={!selectedCategory}
                        >
                            <option value="">Select Subcategory</option>
                            {subCategories.map((sub: any) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.subCategoryId && <p className="text-red-500 text-sm ml-1">{errors.subCategoryId.message}</p>}
                </div>
            </div>

            {/* Date Reported */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Date Reported <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                    type="date"
                    {...register("dateReported")}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                />
            </div>

            {/* Location */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Location <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                {!showMap ? (
                    <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{location ? location.address : "Click to pick a location on the map"}</span>
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="rounded-xl overflow-hidden border border-gray-200 h-80 relative">
                            <button
                                type="button"
                                onClick={() => setShowMap(false)}
                                className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
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
                                <MapPin className="w-4 h-4" />
                                Selected: {location.address}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Photos */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Photos <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors mb-2">
                            <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Add Photo</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                </div>
            </div>

            {/* Submit Error */}
            {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <p className="text-red-600 text-sm">{submitError}</p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Report...</span>
                    </>
                ) : (
                    "Submit Report"
                )}
            </button>
        </form>
    );
};
