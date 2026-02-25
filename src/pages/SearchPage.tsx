import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFilteredReports, extractList, useGetApiCategoriesTree } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { Search, Filter, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SearchFilters {
    Search?: string;
    CategoryId?: number;
    SubCategoryId?: number;
    DateFrom?: string;
    DateTo?: string;
}

export const SearchPage: React.FC = () => {
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
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Posts</h1>
                    <p className="text-gray-600">Find lost or found items using advanced filters</p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Main Search Bar */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    {...register("Search")}
                                    type="text"
                                    placeholder="Search by keywords..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </Button>
                            <Button type="submit">Search</Button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        {...register("CategoryId")}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category: any) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subcategory */}
                                {selectedCategory && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Subcategory
                                        </label>
                                        <select
                                            {...register("SubCategoryId")}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">All Subcategories</option>
                                            {selectedCategory.subCategories?.map((sub: any) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}



                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date From
                                    </label>
                                    <input
                                        {...register("DateFrom")}
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date To
                                    </label>
                                    <input
                                        {...register("DateTo")}
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Clear Filters */}
                                <div className="md:col-span-2 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="text-gray-600"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear All Filters
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
                            <p className="text-gray-500">Searching...</p>
                        </div>
                    ) : Object.keys(filters).length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-gray-500">
                                Enter keywords or use filters to find lost or found items
                            </p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Results Found
                            </h3>
                            <p className="text-gray-500">
                                Try adjusting your search filters or keywords
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-gray-600">
                                    Found <span className="font-semibold text-gray-900">{results.length}</span> results
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
