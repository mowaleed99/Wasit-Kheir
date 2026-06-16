import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { usePostApiAuthForgotPassword } from "@/api/generated/auth/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

interface ForgotPasswordForm {
    email: string;
}

export const ForgotPassword: React.FC = () => {
    const [sent, setSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

    const { mutate: forgotPassword, isPending } = usePostApiAuthForgotPassword({
        mutation: {
            onSuccess: () => setSent(true),
            onError: (err: any) => {
                const msg = err?.response?.data?.message || err?.message || "Failed to send reset email.";
                alert(msg);
            }
        }
    });

    const onSubmit = (data: ForgotPasswordForm) => {
        forgotPassword({ data: { email: data.email } });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
                    {sent ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
                            <p className="text-muted-foreground mb-6">
                                We've sent a password reset link to your email address. Check your inbox and follow the instructions.
                            </p>
                            <Link to="/reset-password" className="text-primary hover:underline text-sm font-medium">
                                I have a reset code →
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold text-foreground">Forgot Password?</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Enter your email address and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="mt-1"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" }
                                        })}
                                    />
                                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Send Reset Link
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
