import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportCreate } from "@/components/reports/ReportCreate";

export const CreateReportPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/"
                        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm border border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submit a Report</h1>
                        <p className="text-gray-500">Share details about the item you lost or found</p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <ReportCreate />
                </div>
            </div>
        </div>
    );
};
