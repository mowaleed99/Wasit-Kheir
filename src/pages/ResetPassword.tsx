import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { usePostApiAuthResetPassword } from "@/api/generated/auth/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordForm {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordForm>({
        defaultValues: {
            email: searchParams.get("email") || "",
            resetToken: searchParams.get("token") || "",
        }
    });

    const { mutate: resetPassword, isPending } = usePostApiAuthResetPassword({
        mutation: {
            onSuccess: () => {
                toast.success("Password reset successfully! Please log in.");
                navigate("/login");
            },
            onError: (err: any) => {
                const msg = err?.response?.data?.message || err?.message || "Failed to reset password.";
                toast.error(msg);
            }
        }
    });

    const onSubmit = (data: ResetPasswordForm) => {
        resetPassword({ data: { email: data.email, resetToken: data.resetToken, newPassword: data.newPassword } });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Enter the code from your email and your new password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="mt-1"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="resetToken">Reset Code</Label>
                            <Input
                                id="resetToken"
                                type="text"
                                placeholder="Enter the code from your email"
                                className="mt-1"
                                {...register("resetToken", { required: "Reset code is required" })}
                            />
                            {errors.resetToken && <p className="text-destructive text-xs mt-1">{errors.resetToken.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="At least 8 characters"
                                className="mt-1"
                                {...register("newPassword", { required: "New password is required", minLength: { value: 8, message: "Min 8 characters" } })}
                            />
                            {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat your new password"
                                className="mt-1"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (val) => val === watch("newPassword") || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Reset Password
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
