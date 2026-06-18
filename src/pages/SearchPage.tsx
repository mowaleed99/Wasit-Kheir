import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useFilteredReports, extractList, useGetApiCategoriesTree } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Search, Filter, Calendar, X, Image as ImageIcon, Upload, ScanFace, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { usePostApiAiSearchImage, usePostApiAiFaceMatch, usePostApiAiMultimodalSearch } from "@/api/generated/ai/ai";
import { AiReportCard } from "@/components/reports/AiReportCard";
import type { AiResultDto } from "@/api/generated/lostAndFoundAPI.schemas";

interface SearchFilters {
    Search?: string;
    CategoryId?: number;
    SubCategoryId?: number;
    DateFrom?: string;
    DateTo?: string;
}

type SearchMode = "text" | "image" | "face" | "multimodal";

// Safely extract the real array from API results (handles both wrapped and unwrapped responses)
// Safely extract the real array from API results (handles both wrapped and unwrapped responses)
// Sorts by best match first (descending score)
function extractAiResults(raw: unknown): AiResultDto[] {
    let arr: AiResultDto[] = [];
    if (!raw) return arr;
    if (Array.isArray(raw)) arr = raw;
    else {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj?.data)) arr = obj.data as AiResultDto[];
    }
    return arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); // best match first
}

// For face-match the match ID lives in personId (postId comes back as empty string "")
// Use || so that empty string falls through to personId
function getMatchId(match: AiResultDto): string | null {
    return match.postId || match.personId || null;
}

export const SearchPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchMode, setSearchMode] = useState<SearchMode>("text");

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

    // Per-mode result state (manual, so we can clear on new search)
    const [imageResults, setImageResults] = useState<AiResultDto[]>([]);
    const [faceResults, setFaceResults] = useState<AiResultDto[]>([]);
    const [multimodalResults, setMultimodalResults] = useState<AiResultDto[]>([]);
    const [aiError, setAiError] = useState<string | null>(null);

    // AI hooks
    const { mutate: searchImage, isPending: isImageSearching } = usePostApiAiSearchImage();
    const { mutate: searchFace, isPending: isFaceSearching } = usePostApiAiFaceMatch();

    const [multimodalText, setMultimodalText] = useState("");
    const { mutate: searchMultimodal, isPending: isMultimodalSearching } = usePostApiAiMultimodalSearch();

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
            // Clear results when a new image is picked
            setImageResults([]);
            setFaceResults([]);
            setMultimodalResults([]);
            setAiError(null);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setImageResults([]);
        setFaceResults([]);
        setMultimodalResults([]);
        setAiError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleModeChange = (mode: SearchMode) => {
        setSearchMode(mode);
        setAiError(null);
    };

    const onSearchImage = () => {
        if (!selectedImage) return;
        setImageResults([]);
        setAiError(null);
        searchImage(
            { data: { Image: selectedImage as any, K: 5 } },
            {
                onSuccess: (raw) => {
                    // Filter results to only show relevant matches (score > 80)
                    const results = extractAiResults(raw).filter(r => (r.score ?? 0) > 80);
                    setImageResults(results);
                    if (results.length === 0) setAiError(t('searchPage.noResults', 'No similar images found in the database.'));
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || t('searchPage.aiError', 'AI search failed. Please try again.');
                    setAiError(msg);
                }
            }
        );
    };

    const onSearchFace = () => {
        if (!selectedImage) return;
        setFaceResults([]);
        setAiError(null);
        searchFace(
            { data: { Image: selectedImage as any, K: 5 } },
            {
                onSuccess: (raw) => {
                    // FaceMatch returns 0-100 scores. We only want highly confident matches (e.g. > 50)
                    const results = extractAiResults(raw).filter(r => (r.score ?? 0) > 50);
                    setFaceResults(results);
                    if (results.length === 0) setAiError(t('searchPage.noFaceResults', 'No matching faces found in the database.'));
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || t('searchPage.aiError', 'AI search failed. Please try again.');
                    setAiError(msg);
                }
            }
        );
    };

    const onSearchMultimodal = () => {
        if (!selectedImage && !multimodalText) return;
        setMultimodalResults([]);
        setAiError(null);
        searchMultimodal(
            { data: { Image: selectedImage as any || undefined, Text: multimodalText || undefined, K: 5 } },
            {
                onSuccess: (raw) => {
                    // Filter results to only show relevant matches (score > 80)
                    const results = extractAiResults(raw).filter(r => (r.score ?? 0) > 80);
                    setMultimodalResults(results);
                    if (results.length === 0) setAiError(t('searchPage.noResults', 'No matches found.'));
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || err?.message || t('searchPage.aiError', 'AI search failed. Please try again.');
                    setAiError(msg);
                }
            }
        );
    };

    const isAiSearching = isImageSearching || isFaceSearching || isMultimodalSearching;

    const renderUploader = (prompt: string, desc: string, icon: React.ReactNode, colorClass: string) => (
        <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors cursor-pointer ${colorClass}`}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
            />
            {imagePreview ? (
                <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-56 rounded-xl shadow-md object-contain" />
                    <button
                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <div className="mb-4 inline-block">{icon}</div>
                    <p className="text-foreground font-medium text-lg mb-1">{prompt}</p>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                    <p className="text-xs text-muted-foreground mt-2 opacity-70">{t('searchPage.clickToUpload', 'Click to upload')}</p>
                </div>
            )}
        </div>
    );

    const renderAiResults = (results: AiResultDto[], colorClass: string) => {
        if (results.length === 0) return null;
        const validResults = results.filter(m => getMatchId(m) !== null);
        if (validResults.length === 0) return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                {t('searchPage.noValidResults', 'Results returned but could not resolve to posts.')}
            </div>
        );
        return (
            <div className="space-y-3">
                <p className="text-sm text-muted-foreground px-1">
                    {t('searchPage.foundResults', 'Found {{count}} match(es)', { count: validResults.length })}
                </p>
                {validResults.map((match, i) => (
                    <AiReportCard
                        key={`ai-${getMatchId(match)}-${i}`}
                        postId={getMatchId(match)!}
                        score={match.score ?? 0}
                        colorClass={colorClass}
                    />
                ))}
            </div>
        );
    };

    const tabStyle = (mode: SearchMode, activeColor: string) =>
        `px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            searchMode === mode
                ? `${activeColor} border-current`
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
        }`;

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{t('searchPage.title', 'Search Reports')}</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">{t('searchPage.subtitle', 'Find what you are looking for')}</p>
                </div>

                {/* Search Mode Tabs */}
                <div className="flex overflow-x-auto gap-0 mb-6 border-b border-border scrollbar-hide">
                    <button onClick={() => handleModeChange("text")} className={tabStyle("text", "text-blue-600 dark:text-blue-400")}>
                        <Search className="w-4 h-4" />
                        {t('searchPage.standardSearch', 'Standard Search')}
                    </button>
                    <button onClick={() => handleModeChange("image")} className={tabStyle("image", "text-indigo-600 dark:text-indigo-400")}>
                        <ImageIcon className="w-4 h-4" />
                        {t('searchPage.aiImageSearch', 'AI Image Search')}
                    </button>
                    <button onClick={() => handleModeChange("face")} className={tabStyle("face", "text-rose-600 dark:text-rose-400")}>
                        <ScanFace className="w-4 h-4" />
                        {t('searchPage.aiFaceMatch', 'Face Match')}
                    </button>
                    <button onClick={() => handleModeChange("multimodal")} className={tabStyle("multimodal", "text-violet-600 dark:text-violet-400")}>
                        <Sparkles className="w-4 h-4" />
                        {t('searchPage.aiMultimodal', 'Multimodal Search')}
                    </button>
                </div>

                {/* Search Inputs Area */}
                <div className="bg-card rounded-3xl shadow-sm border border-border p-6 mb-6">

                    {/* ── TEXT SEARCH ── */}
                    {searchMode === "text" && (
                        <form onSubmit={handleSubmit(onSubmitTextSearch)} className="space-y-4">
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
                                <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    {t('searchPage.filters', 'Filters')}
                                </Button>
                                <Button type="submit">{t('searchPage.searchButton', 'Search')}</Button>
                            </div>

                            {showFilters && (
                                <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">{t('searchPage.category', 'Category')}</label>
                                        <select {...register("CategoryId")} className="w-full px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-blue-500">
                                            <option value="">{t('searchPage.allCategories', 'All Categories')}</option>
                                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    {selectedCategory && (
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">{t('searchPage.subcategory', 'Subcategory')}</label>
                                            <select {...register("SubCategoryId")} className="w-full px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:ring-2 focus:ring-blue-500">
                                                <option value="">{t('searchPage.allSubcategories', 'All Subcategories')}</option>
                                                {selectedCategory.subCategories?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />{t('searchPage.dateFrom', 'Date From')}
                                        </label>
                                        <input {...register("DateFrom")} type="date" className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />{t('searchPage.dateTo', 'Date To')}
                                        </label>
                                        <input {...register("DateTo")} type="date" className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end">
                                        <Button type="button" variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                            <X className="w-4 h-4 mr-2" />{t('searchPage.clearFilters', 'Clear Filters')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}

                    {/* ── AI IMAGE SEARCH ── */}
                    {searchMode === "image" && (
                        <div className="space-y-5">
                            {renderUploader(
                                t('searchPage.imageUpload.prompt', 'Upload an image to search'),
                                t('searchPage.imageUpload.desc', 'AI will find visually similar items'),
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full"><Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>,
                                "border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            )}
                            <div className="flex justify-center">
                                <Button
                                    onClick={onSearchImage}
                                    disabled={!selectedImage || isImageSearching}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-base flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isImageSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                    {isImageSearching ? t('searchPage.searching', 'Searching...') : t('searchPage.imageSearch', 'Search Similar Images')}
                                </Button>
                            </div>
                            {isImageSearching && (
                                <p className="text-center text-sm text-muted-foreground">{t('searchPage.aiWarmup', '⏳ AI service may take up to a minute on first use...')}</p>
                            )}
                        </div>
                    )}

                    {/* ── FACE MATCH ── */}
                    {searchMode === "face" && (
                        <div className="space-y-5">
                            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20 text-sm text-rose-700 dark:text-rose-400">
                                💡 {t('searchPage.faceTip', 'For best results, upload a clear, front-facing photo with good lighting.')}
                            </div>
                            {renderUploader(
                                t('searchPage.faceUpload.prompt', 'Upload a clear face photo'),
                                t('searchPage.faceUpload.desc', 'AI will scan for matching facial features'),
                                <div className="bg-rose-100 dark:bg-rose-900/50 p-4 rounded-full"><ScanFace className="w-8 h-8 text-rose-600 dark:text-rose-400" /></div>,
                                "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            )}
                            <div className="flex justify-center">
                                <Button
                                    onClick={onSearchFace}
                                    disabled={!selectedImage || isFaceSearching}
                                    className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-2.5 rounded-xl text-base flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isFaceSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanFace className="w-5 h-5" />}
                                    {isFaceSearching ? t('searchPage.scanning', 'Scanning Faces...') : t('searchPage.faceSearch', 'Scan Faces')}
                                </Button>
                            </div>
                            {isFaceSearching && (
                                <p className="text-center text-sm text-muted-foreground">{t('searchPage.aiWarmup', '⏳ AI service may take up to a minute on first use...')}</p>
                            )}
                        </div>
                    )}

                    {/* ── MULTIMODAL ── */}
                    {searchMode === "multimodal" && (
                        <div className="space-y-5">
                            {renderUploader(
                                t('searchPage.multimodalUpload.prompt', 'Upload an image (optional)'),
                                t('searchPage.multimodalUpload.desc', 'Combine image and text for better results'),
                                <div className="bg-violet-100 dark:bg-violet-900/50 p-4 rounded-full"><Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" /></div>,
                                "border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            )}
                            <div className="max-w-2xl mx-auto">
                                <input
                                    type="text"
                                    value={multimodalText}
                                    onChange={(e) => setMultimodalText(e.target.value)}
                                    placeholder={t('searchPage.multimodalPlaceholder', "Add text context (e.g. 'A red bicycle with a black seat')")}
                                    className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="flex justify-center">
                                <Button
                                    onClick={onSearchMultimodal}
                                    disabled={(!selectedImage && !multimodalText) || isMultimodalSearching}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl text-base flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isMultimodalSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {isMultimodalSearching ? t('searchPage.searching', 'Searching...') : t('searchPage.multimodalSearch', 'Run Multimodal Search')}
                                </Button>
                            </div>
                            {isMultimodalSearching && (
                                <p className="text-center text-sm text-muted-foreground">{t('searchPage.aiWarmup', '⏳ AI service may take up to a minute on first use...')}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {aiError && !isAiSearching && (
                    <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{aiError}</p>
                    </div>
                )}

                {/* Results Area */}
                <div>
                    {/* Text results */}
                    {searchMode === "text" && (
                        isLoading ? (
                            <div className="text-center py-12"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /></div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4">{results.map((post: any) => <ReportCard key={post.id} report={post} />)}</div>
                        ) : Object.keys(filters).length > 0 ? (
                            <div className="text-center py-12 text-muted-foreground">{t('searchPage.noTextResults', 'No results found for your search.')}</div>
                        ) : null
                    )}

                    {/* Image search results */}
                    {searchMode === "image" && !isImageSearching && renderAiResults(imageResults, "indigo")}

                    {/* Face match results */}
                    {searchMode === "face" && !isFaceSearching && renderAiResults(faceResults, "rose")}

                    {/* Multimodal results */}
                    {searchMode === "multimodal" && !isMultimodalSearching && renderAiResults(multimodalResults, "violet")}
                </div>
            </div>
        </div>
    );
};
