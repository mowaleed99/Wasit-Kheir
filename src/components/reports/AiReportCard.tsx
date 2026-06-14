import React from "react";
import { useGetApiReportsId } from "@/api/generated/reports/reports";
import { ReportCard } from "./ReportCard";

interface AiReportCardProps {
    postId: string;
    score: number;
}

export const AiReportCard: React.FC<AiReportCardProps> = ({ postId, score }) => {
    const { data, isLoading, error } = useGetApiReportsId(Number(postId));
    
    // Type assertion because generated API response shapes can be nested
    const report = (data as any)?.data || data;

    if (isLoading) {
        return (
            <div className="animate-pulse bg-muted h-32 rounded-2xl border border-border"></div>
        );
    }

    if (error || !report) {
        return null; // Skip rendering if the report couldn't be loaded
    }

    return (
        <div className="relative">
            <div className="absolute top-4 right-4 z-10 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm bg-indigo-600/90">
                <span>AI Match: {(score * 100).toFixed(0)}%</span>
            </div>
            <ReportCard report={report} />
        </div>
    );
};
