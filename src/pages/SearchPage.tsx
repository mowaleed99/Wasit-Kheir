import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFilteredReports, extractList, useGetApiCategoriesTree } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Search, Filter, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface SearchFilters {
    Search?: string;
    CategoryId?: number;
    SubCategoryId?: number;
    DateFrom?: string;
    DateTo?: string;
}

export const SearchPage: React.FC = () => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const { data: categoriesData } = useGetApiCategoriesTree();
    const { data: searchResults, isLoading } = useFilteredReports(
        { ...filters, ForPublicView: false } as any,
        Object.keys(filters).length > 0
    );

    const { register, handleSubmit, watch, reset } = useForm<SearchFilters>();

    const categories = (categoriesData as any)?.data || [];
    const selectedCategoryId = watch("CategoryId");
    const selectedCategory = categories.find((cat: any) => cat.id === Number(selectedCategoryId));

    const results = extractList(searchResults);

    const onSubmit = (data: SearchFilters) => {
        // Remove empty values
        const cleanFilters = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
        );
        setFilters(cleanFilters);
    };

    const clearFilters = () => {
        reset();
        setFilters({});
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{t('searchPage.title')}</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">{t('searchPage.subtitle')}</p>
                </div>

                {/* Search Form */}
                <div className="bg-card rounded-3xl shadow-sm border border-border p-6 mb-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Main Search Bar */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex-1 min-w-[180px] relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    {...register("Search")}
                                    type="text"
                                    placeholder={t('searchPage.searchPlaceholder')}
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
                                {t('searchPage.filters')}
                            </Button>
                            <Button type="submit">{t('searchPage.searchButton')}</Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('searchPage.category')}
                                    </label>
                                    <select
                                        {...register("CategoryId")}
                                        className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">{t('searchPage.allCategories')}</option>
                                        {categories.map((category: any) => (
                                            <option key={category.id} value={category.id}>
                                                {t(`categories.${category.name}`, { defaultValue: category.name })}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory */}
                                {selectedCategory && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {t('searchPage.subcategory')}
                                        </label>
                                        <select
                                            {...register("SubCategoryId")}
                                            className="w-full px-4 py-2 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">{t('searchPage.allSubcategories')}</option>
                                            {selectedCategory.subCategories?.map((sub: any) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {t(`subcategories.${sub.name}`, { defaultValue: sub.name })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}



                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {t('searchPage.dateFrom')}
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
                                        {t('searchPage.dateTo')}
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
                                        {t('searchPage.clearAllFilters')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Results */}
                <div>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">{t('searchPage.searching')}</p>
                        </div>
                    ) : Object.keys(filters).length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <Search className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {t('searchPage.startYourSearch')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t('searchPage.enterKeywords')}
                            </p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <Search className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {t('searchPage.noResultsFound')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t('searchPage.tryAdjusting')}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    {t('searchPage.foundResults', { count: results.length })}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {results.map((post: any) => (
                                    <ReportCard key={post.id} report={post} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
