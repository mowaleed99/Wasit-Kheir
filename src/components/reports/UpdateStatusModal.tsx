import { useState } from "react";
import { usePutApiReportsIdStatus } from "@/api/generated/reports/reports";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateStatusModalProps {
    reportId: number;
    currentStatus: string;
    isOpen: boolean;
    onClose: () => void;
}

const statuses = [
    { value: "Active", label: "Active", description: "Report is open and active" },
    { value: "Resolved", label: "Resolved", description: "The item or person was found/resolved" },
    { value: "Cancelled", label: "Cancelled", description: "Report is no longer relevant" },
];

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ reportId, currentStatus, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState(currentStatus || "Active");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { mutate: updateStatus, isPending } = usePutApiReportsIdStatus();

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        updateStatus({ id: reportId, data: { status } }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["reports-feed"] });
                queryClient.invalidateQueries({ queryKey: ["reports-mine"] });
                queryClient.invalidateQueries({ queryKey: ["report-detail", reportId] });
                onClose();
            },
            onError: (error: any) => {
                const msg =
                    error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    error?.message ||
                    "Failed to update status.";
                setSubmitError(msg);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm rtl:dir-rtl">
            <div className="bg-card w-full max-w-md overflow-hidden rounded-3xl shadow-xl border border-border flex flex-col relative">
                {/* Header */}
                <div className="bg-card/95 backdrop-blur px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Update Status</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    <div className="space-y-3">
                        {statuses.map((s) => (
                            <label
                                key={s.value}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                    status === s.value 
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                                        : "border-border hover:border-blue-300 hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex items-center h-5">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s.value}
                                        checked={status === s.value}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-medium ${status === s.value ? "text-blue-700 dark:text-blue-400" : "text-foreground"}`}>
                                        {s.label}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{s.description}</span>
                                </div>
                                {status === s.value && (
                                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                                )}
                            </label>
                        ))}
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
                            disabled={isPending || status === currentStatus}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
