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
        return null;
    }

    return <ReportCard report={report} aiScore={score} />;
};
