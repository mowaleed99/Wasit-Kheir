import React from "react";
import { useGetApiReportsId } from "@/api/generated/reports/reports";
import { ReportCard } from "./ReportCard";

interface AiReportCardProps {
    postId: string;
    score: number;
    colorClass?: string; // e.g. "indigo", "rose", "violet"
}

export const AiReportCard: React.FC<AiReportCardProps> = ({ postId, score, colorClass: _colorClass }) => {
    const numericId = Number(postId);

    // If postId is not a valid number we can't fetch the report — skip silently
    if (!numericId || isNaN(numericId)) return null;

    const { data, isLoading, error } = useGetApiReportsId(numericId);

    const report = (data as any)?.data || data;

    if (isLoading) {
        return (
            <div className="animate-pulse bg-muted h-32 rounded-2xl border border-border" />
        );
    }

    if (error || !report) {
        return null;
    }

    return <ReportCard report={report} aiScore={score} />;
};
