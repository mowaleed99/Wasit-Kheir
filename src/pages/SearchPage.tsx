import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useFilteredReports, extractList, useGetApiCategoriesTree } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Search, Filter, Calendar, X, Image as ImageIcon, Upload, ScanFace, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { usePostApiAiSearchImage, usePostApiAiFaceMatch, usePostApiAiMultimodalSearch } from "@/api/generated/ai/ai";
import { AiReportCard } from "@/components/reports/AiReportCard";

interface SearchFilters {
    Search?: string;
    CategoryId?: number;
    SubCategoryId?: number;
    DateFrom?: string;
    DateTo?: string;
}

export const SearchPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchMode, setSearchMode] = useState<"text" | "image" | "face" | "multimodal">("text");

    // Standard Search State
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const { data: categoriesData } = useGetApiCategoriesTree();
    const { data: searchResults, isLoading } = useFilteredReports(
        { ...filters, ForPublicView: false } as any,
        Object.keys(filters).length > 0
    );
    const { register, handleSubmit, watch, reset } = useForm<SearchFilters>();

    // Shared Upload State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI States
    const { mutate: searchImage, isPending: isImageSearching, data: imageResultsRaw } = usePostApiAiSearchImage();
    const imageResults = (imageResultsRaw as any)?.data || imageResultsRaw || [];

    const { mutate: searchFace, isPending: isFaceSearching, data: faceResultsRaw } = usePostApiAiFaceMatch();
    const faceResults = (faceResultsRaw as any)?.data || faceResultsRaw || [];

    const [multimodalText, setMultimodalText] = useState("");
    const { mutate: searchMultimodal, isPending: isMultimodalSearching, data: multimodalResultsRaw } = usePostApiAiMultimodalSearch();
    const multimodalResults = (multimodalResultsRaw as any)?.data || multimodalResultsRaw || [];

    // Parse Categories
    let categories: any[] = [];
    const apiData = categoriesData as any;
    if (Array.isArray(apiData)) categories = apiData;
    else if (Array.isArray(apiData?.data)) categories = apiData.data;
    else if (Array.isArray(apiData?.data?.data)) categories = apiData.data.data;

    const selectedCategoryId = watch("CategoryId");
    const selectedCategory = categories.find((cat: any) => cat.id === Number(selectedCategoryId));

    const results = extractList(searchResults);

    const onSubmitTextSearch = (data: SearchFilters) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
        );
        setFilters(cleanFilters);
    };

    const clearFilters = () => {
        reset();
        setFilters({});
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSearchImage = () => {
        if (!selectedImage) return;
        searchImage({ data: { Image: selectedImage as any, K: 10 } });
    };

    const onSearchFace = () => {
        if (!selectedImage) return;
        searchFace({ data: { Image: selectedImage as any, K: 10 } });
    };

    const onSearchMultimodal = () => {
        if (!selectedImage && !multimodalText) return;
        searchMultimodal({ data: { Image: selectedImage as any, Text: multimodalText, K: 10 } });
    };

    const renderUploader = (prompt: string, desc: string, icon: React.ReactNode, activeColorClass: string) => (
        <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors relative ${activeColorClass}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
            />
            {imagePreview ? (
                <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl shadow-sm object-contain" />
                    <button
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="mb-4 inline-block">
                        {icon}
                    </div>
                    <p className="text-foreground font-medium text-lg mb-1">{prompt}</p>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{t('searchPage.title', 'Search Reports')}</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">{t('searchPage.subtitle', 'Find what you are looking for')}</p>
                </div>

                {/* Search Mode Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-6 border-b border-border scrollbar-hide pb-2">
                    <button
                        onClick={() => setSearchMode("text")}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${searchMode === "text"
                                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        {t('searchPage.standardSearch', 'Standard Search')}
                    </button>
                    <button
                        onClick={() => setSearchMode("image")}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${searchMode === "image"
                                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        {t('searchPage.aiImageSearch', 'AI Image Search')}
                    </button>
                    <button
                        onClick={() => setSearchMode("face")}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${searchMode === "face"
                                ? "text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        <ScanFace className="w-4 h-4" />
                        {t('searchPage.aiFaceMatch', 'Face Match')}
                    </button>
                    <button
                        onClick={() => setSearchMode("multimodal")}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${searchMode === "multimodal"
                                ? "text-violet-600 dark:text-violet-400 border-violet-600 dark:border-violet-400"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        {t('searchPage.aiMultimodal', 'Multimodal Search')}
                    </button>
                </div>

                {/* Search Inputs Area */}
                <div className="bg-card rounded-3xl shadow-sm border border-border p-6 mb-6">
                    {searchMode === "text" && (
                        <form onSubmit={handleSubmit(onSubmitTextSearch)} className="space-y-4">
                            {/* Main Search Bar */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex-1 min-w-[180px] relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        {...register("Search")}
                                        type="text"
                                        placeholder={t('searchPage.searchPlaceholder', 'Enter keywords...')}
                                        className="w-full pl-12 pr-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    {t('searchPage.filters', 'Filters')}
                                </Button>
                                <Button type="submit">{t('searchPage.searchButton', 'Search')}</Button>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                                        <select {...register("CategoryId")} className="w-full px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-blue-500">
                                            <option value="">All Categories</option>
                                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Subcategory */}
                                    {selectedCategory && (
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Subcategory</label>
                                            <select {...register("SubCategoryId")} className="w-full px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-blue-500">
                                                <option value="">All Subcategories</option>
                                                {selectedCategory.subCategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date From
                                        </label>
                                        <input
                                            {...register("DateFrom")}
                                            type="date"
                                            className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date To
                                        </label>
                                        <input
                                            {...register("DateTo")}
                                            type="date"
                                            className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="md:col-span-2 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={clearFilters}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    {searchMode === "image" && (
                        <div className="space-y-6">
                            {renderUploader(
                                "Upload an image to search",
                                "AI will find visually similar items",
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full"><Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>,
                                "border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            )}
                            <div className="flex justify-center">
                                <Button onClick={onSearchImage} disabled={!selectedImage || isImageSearching} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-lg flex items-center gap-2 disabled:opacity-50">
                                    {isImageSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                    Search Similar Images
                                </Button>
                            </div>
                        </div>
                    )}

                    {searchMode === "face" && (
                        <div className="space-y-6">
                            {renderUploader(
                                "Upload a clear photo of a face",
                                "AI will scan for matching facial features",
                                <div className="bg-rose-100 dark:bg-rose-900/50 p-4 rounded-full"><ScanFace className="w-8 h-8 text-rose-600 dark:text-rose-400" /></div>,
                                "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            )}
                            <div className="flex justify-center">
                                <Button onClick={onSearchFace} disabled={!selectedImage || isFaceSearching} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-2.5 rounded-xl text-lg flex items-center gap-2 disabled:opacity-50">
                                    {isFaceSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ScanFace className="w-5 h-5" />}
                                    Scan Faces
                                </Button>
                            </div>
                        </div>
                    )}

                    {searchMode === "multimodal" && (
                        <div className="space-y-6">
                            {renderUploader(
                                "Upload an image (optional)",
                                "Combine image and text for better results",
                                <div className="bg-violet-100 dark:bg-violet-900/50 p-4 rounded-full"><ImageIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" /></div>,
                                "border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            )}
                            <div className="max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    value={multimodalText}
                                    onChange={(e) => setMultimodalText(e.target.value)}
                                    placeholder="Add text context (e.g. 'A red bicycle with a black seat')"
                                    className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="flex justify-center">
                                <Button onClick={onSearchMultimodal} disabled={(!selectedImage && !multimodalText) || isMultimodalSearching} className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl text-lg flex items-center gap-2 disabled:opacity-50">
                                    {isMultimodalSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Run Multimodal Search
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Area */}
                <div>
                    {searchMode === "text" && (
                        isLoading ? (
                            <div className="text-center py-12"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div></div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4">{results.map((post: any) => <ReportCard key={post.id} report={post} />)}</div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">No text search results found.</div>
                        )
                    )}

                    {searchMode === "image" && (
                        isImageSearching ? (
                            <div className="text-center py-12"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground">AI is analyzing image...</p></div>
                        ) : imageResults.length > 0 ? (
                            <div className="space-y-4">{imageResults.map((match: any, i: number) => match.postId && <AiReportCard key={`img-${match.postId}-${i}`} postId={match.postId} score={match.score} />)}</div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">Upload an image to see similar missing items.</div>
                        )
                    )}

                    {searchMode === "face" && (
                        isFaceSearching ? (
                            <div className="text-center py-12"><div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground">AI is scanning facial features...</p></div>
                        ) : faceResults.length > 0 ? (
                            <div className="space-y-4">{faceResults.map((match: any, i: number) => match.postId && <AiReportCard key={`face-${match.postId}-${i}`} postId={match.postId} score={match.score} />)}</div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">Upload a face photo to scan the database.</div>
                        )
                    )}

                    {searchMode === "multimodal" && (
                        isMultimodalSearching ? (
                            <div className="text-center py-12"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground">Processing multimodal AI search...</p></div>
                        ) : multimodalResults.length > 0 ? (
                            <div className="space-y-4">{multimodalResults.map((match: any, i: number) => match.postId && <AiReportCard key={`multi-${match.postId}-${i}`} postId={match.postId} score={match.score} />)}</div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">Use image and/or text to run a combined AI search.</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
