import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { toast } from "sonner";

interface VerifyFormData {
  code: string;
  email: string;
}

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Get email from URL params if available (from signup redirect)
  const urlEmail = searchParams.get("email");
  const urlCode = searchParams.get("code");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<VerifyFormData>({
    defaultValues: {
      email: urlEmail || "",
      code: urlCode || "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyFormData) => {
      // Call the API directly using apiClient
      const response = await apiClient.get("/api/auth/verify-account", {
        params: {
          code: data.code,
          email: data.email,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setVerificationSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Verification error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Verification failed. Please check your code and email.";
      toast.error(errorMessage);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const email = getValues("email");
      if (!email) {
        throw new Error("Email is required to resend verification code");
      }
      return apiClient.post("/api/auth/resend-verification", { email });
    },
    onSuccess: () => {
      toast.success("Verification code has been resent to your email!");
    },
    onError: (error: any) => {
      console.error("Resend error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend verification code.";
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: VerifyFormData) => {
    verifyMutation.mutate(data);
  };

  if (verificationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-green-600 text-2xl font-bold">
            ✓ Verification Successful!
          </div>
          <p>Your email has been verified. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-center">
            {t("auth.verifyEmail")}
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Enter the verification code sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder={t("auth.email")}
              error={errors.email?.message}
            />
          </div>

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              {...register("code", {
                required: "Verification code is required",
                minLength: {
                  value: 4,
                  message: "Code must be at least 4 characters",
                },
              })}
              placeholder="Enter verification code"
              error={errors.code?.message}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending
              ? "Sending..."
              : t("auth.resendVerification")}
          </Button>
        </div>
      </div>
    </div>
  );
};
