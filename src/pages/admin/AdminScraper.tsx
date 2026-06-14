import React, { useState } from "react";
import { useGetApiScraperPosts, usePostApiScraperRun } from "@/api/generated/scraper/scraper";
import { queryClient } from "@/api";
import { Database, Play, AlertCircle, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import { resolveImageUrl } from "@/utils/imageUrl";

export const AdminScraper: React.FC = () => {
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [groupUrl, setGroupUrl] = useState("");
    const [limit, setLimit] = useState(50);

    const {
        data: scraperDataRaw,
        isLoading,
        error
    } = useGetApiScraperPosts({ limit: 50, offset: 0 });

    const { mutate: runScraper, isPending: isRunning } = usePostApiScraperRun();

    const scraperData = (scraperDataRaw as any)?.data || scraperDataRaw;
    const postsList = Array.isArray(scraperData) ? scraperData : scraperData?.data || [];
    const totalCount = scraperData?.totalCount || postsList.length;

    const handleRunScraper = () => {
        runScraper({ params: { group_url: groupUrl || undefined, limit: limit } }, {
            onSuccess: () => {
                setIsWarningModalOpen(false);
                setGroupUrl("");
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/scraper/posts"] });
                }, 5000);
            }
        });
    };

    return (
        <div className="w-full pb-12">
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-stone-900 via-stone-800 to-neutral-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-stone-800 rounded-xl">
                            <Database className="w-6 h-6 text-amber-400" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Data Scraper</h1>
                    </div>
                    <p className="text-stone-300 max-w-lg">
                        Manage the automated external data collection service. This service scans public sources for lost and found items to populate our database.
                    </p>
                </div>

                <div className="relative z-10 flex-shrink-0">
                    <button
                        onClick={() => setIsWarningModalOpen(true)}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/25 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isRunning ? (
                            <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                        {isRunning ? "Running Job..." : "Trigger Scraper Job"}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Scraped Items</p>
                        <p className="text-4xl font-bold text-foreground tracking-tight">{totalCount}</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-2xl">
                        <Database className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center justify-between bg-gradient-to-br from-card to-emerald-50/50 dark:to-emerald-900/10">
                    <div>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">Service Status</p>
                        <p className="text-4xl font-bold text-foreground flex items-center gap-3">
                            Online
                            <span className="flex h-4 w-4 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h2 className="text-lg font-bold text-foreground">Recently Scraped Data</h2>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="py-24 text-center">
                            <div className="w-12 h-12 border-4 border-stone-800 dark:border-stone-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">Loading scraped database...</p>
                        </div>
                    ) : error ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Connection Error</h3>
                            <p className="text-muted-foreground">Failed to connect to the scraper service database.</p>
                        </div>
                    ) : postsList.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-20 h-20 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-4 ring-8 ring-muted/20">
                                <Database className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No Scraped Data</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">The scraper database is currently empty. Trigger a new job to fetch items.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {postsList.map((post: any) => (
                                <div key={post.id} className="flex flex-col lg:flex-row items-start lg:items-center p-6 gap-6 hover:bg-muted/30 transition-colors group">
                                    {/* Image */}
                                    <div className="w-full lg:w-48 h-48 lg:h-32 rounded-2xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-border group-hover:shadow-md transition-shadow relative">
                                        {post.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(post.imageUrl)}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Core Info */}
                                    <div className="flex-1 min-w-0 w-full space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                                                Extracted Data
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown Date'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground truncate">
                                            {post.title || 'Untitled Post'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                                            {post.description || 'No description available for this scraped item.'}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            📍 {post.location || 'Location Not Specified'}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="shrink-0 self-end lg:self-center mt-4 lg:mt-0">
                                        {post.originalUrl && (
                                            <a 
                                                href={post.originalUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-colors border border-border shadow-sm hover:shadow-md"
                                            >
                                                Source
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Modal */}
            {isWarningModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-border animate-in fade-in zoom-in duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
                        
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                            Trigger Scraper Job?
                        </h3>
                        
                        <div className="space-y-4 mb-8 text-muted-foreground">
                            <p>
                                You are about to trigger the external FastAPI scraper service to crawl public sources for new lost and found data.
                            </p>
                            <p className="text-sm p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 font-medium mb-4">
                                ⚠️ <strong>Note:</strong> This process might take several minutes to complete and consumes server resources. Data will appear in the grid once processing finishes.
                            </p>

                            <div className="space-y-3 mt-4">
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Target Group URL</label>
                                    <input 
                                        type="url" 
                                        placeholder="e.g., https://www.facebook.com/groups/example"
                                        value={groupUrl}
                                        onChange={(e) => setGroupUrl(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Number of Posts to Scrape</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="500"
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsWarningModalOpen(false)}
                                disabled={isRunning}
                                className="px-6 py-3 font-semibold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRunScraper}
                                disabled={isRunning}
                                className="px-6 py-3 font-bold text-stone-950 bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center min-w-[8rem]"
                            >
                                {isRunning ? (
                                    <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                                ) : (
                                    "Confirm & Run"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
