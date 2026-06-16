import { useState } from "react";
import { usePostApiReportsIdReport } from "@/api/generated/reports/reports";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ReportAbuseModalProps {
    reportId: number;
    isOpen: boolean;
    onClose: () => void;
}

const abuseReasons = [
    "Spam or misleading",
    "Inappropriate content",
    "Harassment or hate speech",
    "Violence or physical harm",
    "Fraud or scam",
    "Other"
];

export const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ reportId, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState(abuseReasons[0]);
    const [details, setDetails] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutate: reportAbuse, isPending } = usePostApiReportsIdReport({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["report-detail", reportId] });
                alert("Thank you for your report. Our team will review it shortly.");
                onClose();
            },
            onError: (error: any) => {
                const msg =
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    error?.message ||
                    "Failed to submit report. Please try again later.";
                setSubmitError(msg);
            },
        }
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        reportAbuse({ id: reportId, data: { reason, details } });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm rtl:dir-rtl">
            <div className="bg-card w-full max-w-md overflow-hidden rounded-3xl shadow-xl border border-border flex flex-col relative">
                {/* Header */}
                <div className="bg-card/95 backdrop-blur px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Report Abuse
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    <p className="text-sm text-muted-foreground">
                        Please help us understand what's wrong with this post. Your report will be kept confidential.
                    </p>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none appearance-none text-foreground"
                            required
                        >
                            {abuseReasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            Additional Details <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none text-foreground placeholder:text-muted-foreground"
                            placeholder="Provide any additional context to help our team investigate..."
                        />
                    </div>

                    {submitError && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4">
                            <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
