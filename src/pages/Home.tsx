import { useReports, useFilteredReports, extractList } from "@/api";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "@/context/AuthContext";
import { useCategoryFilter } from "@/context/CategoryFilterContext";
import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { ReportCard } from "@/components/reports/ReportCard";

export const Home = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { selectedCategoryId, selectedSubCategoryId, clearFilter } = useCategoryFilter();

  const hasFilter = selectedCategoryId !== null || selectedSubCategoryId !== null;

  // ── Filtered reports (single page) ──────────────────────────────────────
  const {
    data: filteredRaw,
    isLoading: filteredLoading,
    error: filteredError,
  } = useFilteredReports(
    {
      CategoryId: selectedCategoryId ?? undefined,
      SubCategoryId: selectedSubCategoryId ?? undefined,
      PageSize: 100,
      Page: 1,
    },
    hasFilter
  );

  // ── Infinite scroll (unfiltered feed) ───────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: reportsLoading,
    error: reportsError,
  } = useReports(undefined, !hasFilter && isAuthenticated);

  const loading = hasFilter ? filteredLoading : reportsLoading;
  const error = hasFilter ? filteredError : reportsError;

  // Extract the array from the filtered response
  // API shape: { success, data: { data: [], page, totalPages } }
  const filteredReports = extractList(filteredRaw);

  // Extract all report items from infinite pages
  const allReports =
    data?.pages?.flatMap((page: any) => extractList(page)) ?? [];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">Please login</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Wasit Kheir</h1>
            <p className="text-muted-foreground">Help your community find what matters</p>
            {hasFilter && (
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Filtered by category
                  <button
                    onClick={clearFilter}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                    aria-label="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
          <Link
            to="/create-report"
            className="w-full sm:w-auto text-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5 mx-auto sm:mx-0" />
            <span>Report</span>
          </Link>
        </div>

        <div className="h-px bg-border mb-8" />

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Loading reports...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
            <p className="text-red-600 dark:text-red-400 text-lg">
              Unable to load reports. Please try again later.
            </p>
            <p className="text-red-400 text-sm mt-2">
              {(error as any)?.message || "Unknown error"}
            </p>
          </div>
        )}

        {/* Reports */}
        {!loading && !error && (
          <>
            {hasFilter ? (
              // ── Filtered grid ────────────────────────────────────────────
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReports.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No reports found</h3>
                    <p className="text-muted-foreground mt-1">No reports match the selected category</p>
                    <button
                      onClick={clearFilter}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear filter
                    </button>
                  </div>
                ) : (
                  filteredReports.map((report: any) => (
                    <ReportCard key={report.id} report={report} />
                  ))
                )}
              </div>
            ) : (
              // ── Infinite scroll feed ─────────────────────────────────────
              <>
                {allReports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No reports yet</h3>
                    <p className="text-muted-foreground mt-1">Be the first to report a lost or found item!</p>
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={allReports.length}
                    next={fetchNextPage}
                    hasMore={!!hasNextPage}
                    loader={
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    }
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {allReports.map((report: any, i: number) => (
                      <ReportCard key={`${i}-${report.id}`} report={report} />
                    ))}
                  </InfiniteScroll>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
