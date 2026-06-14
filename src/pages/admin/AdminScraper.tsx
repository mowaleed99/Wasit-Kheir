import React, { useState } from "react";
import { useGetApiScraperPosts, usePostApiScraperRun } from "@/api/generated/scraper/scraper";
import { queryClient } from "@/api";
import { Database, Play, AlertCircle, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import { resolveImageUrl } from "@/utils/imageUrl";
import { useTranslation } from "react-i18next";

export const AdminScraper: React.FC = () => {
    const { t } = useTranslation();
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
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        {t('admin.scraper.title', 'Data Scraper')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                        {t('admin.scraper.subtitle', 'Manage the automated external data collection service. This service scans public sources for lost and found items to populate our database.')}
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={() => setIsWarningModalOpen(true)}
                        disabled={isRunning}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                        {isRunning ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        {isRunning ? t('admin.scraper.runningJob', 'Running Job...') : t('admin.scraper.triggerJob', 'Trigger Scraper Job')}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('admin.scraper.totalItems', 'Total Scraped Items')}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{totalCount}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Database className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('admin.scraper.serviceStatus', 'Service Status')}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                            {t('admin.scraper.online', 'Online')}
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.scraper.recentData', 'Recently Scraped Data')}</h2>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="py-16 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.scraper.loading', 'Loading scraped database...')}</p>
                        </div>
                    ) : error ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.scraper.errorTitle', 'Connection Error')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.scraper.errorDesc', 'Failed to connect to the scraper service database.')}</p>
                        </div>
                    ) : postsList.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-3">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('admin.scraper.noDataTitle', 'No Scraped Data')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{t('admin.scraper.noDataDesc', 'The scraper database is currently empty. Trigger a new job to fetch items.')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {postsList.map((post: any) => (
                                <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4 sm:gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                    {/* Image */}
                                    <div className="w-full sm:w-32 h-40 sm:h-24 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 relative">
                                        {post.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(post.imageUrl)}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-wider">{t('admin.reports.table.noImage', 'No Image')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Core Info */}
                                    <div className="flex-1 min-w-0 w-full space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {t('admin.scraper.extractedData', 'Extracted Data')}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : t('admin.scraper.unknownDate', 'Unknown Date')}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                            {post.title || t('admin.scraper.untitledPost', 'Untitled Post')}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {post.description || t('admin.scraper.noDescription', 'No description available for this scraped item.')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex items-center gap-1.5">
                                            <span className="text-gray-400">📍</span> {post.location || t('admin.scraper.locationNotSpecified', 'Location Not Specified')}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="shrink-0 self-end sm:self-center mt-2 sm:mt-0 w-full sm:w-auto">
                                        {post.originalUrl && (
                                            <a 
                                                href={post.originalUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-lg transition-colors"
                                            >
                                                {t('admin.scraper.source', 'Source')}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200 relative overflow-hidden">
                        
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t('admin.scraper.modal.title', 'Trigger Scraper Job?')}
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('admin.scraper.modal.warningDesc', 'You are about to trigger the external FastAPI scraper service to crawl public sources for new lost and found data.')}
                            </p>
                            <p className="text-sm p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-800 dark:text-amber-400 font-medium">
                                {t('admin.scraper.modal.warningNote', '⚠️ This process might take several minutes to complete. Data will appear in the grid once processing finishes.')}
                            </p>

                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.scraper.modal.targetUrl', 'Target Group URL')}</label>
                                    <input 
                                        type="url" 
                                        placeholder={t('admin.scraper.modal.targetUrlPlaceholder', 'e.g., https://www.facebook.com/groups/example')}
                                        value={groupUrl}
                                        onChange={(e) => setGroupUrl(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('admin.scraper.modal.limit', 'Number of Posts to Scrape')}</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        max="500"
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsWarningModalOpen(false)}
                                disabled={isRunning}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                {t('admin.scraper.modal.cancel', 'Cancel')}
                            </button>
                            <button
                                onClick={handleRunScraper}
                                disabled={isRunning}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center min-w-[7rem] shadow-sm"
                            >
                                {isRunning ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    t('admin.scraper.modal.confirm', 'Confirm & Run')
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
