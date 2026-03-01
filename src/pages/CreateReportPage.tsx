import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportCreate } from "@/components/reports/ReportCreate";

export const CreateReportPage = () => {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/"
                        className="p-2 rounded-full bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm border border-border"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Submit a Report</h1>
                        <p className="text-muted-foreground">Share details about the item you lost or found</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                    <ReportCreate />
                </div>
            </div>
        </div>
    );
};
