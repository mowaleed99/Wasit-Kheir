import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { usePostApiAuthSignupMutation } from "@/api";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone number is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const mutation = usePostApiAuthSignupMutation({
    mutation: {
      onSuccess: (_, variables) => {
        // Navigate to verification page with email
        navigate(`/verify?email=${encodeURIComponent(variables.data.email)}`);
      },
      onError: (error: any) => {
        console.error("Signup error details:", error);
        let errorMessage = "Signup failed. Please try again.";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors) {
          const errors = error.response.data.errors;
          errorMessage = Array.isArray(errors)
            ? errors.join(", ")
            : Object.values(errors).flat().join(", ");
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your internet connection.";
        } else if (error?.message === "Network Error" || error?.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your connection and try again.";
        }

        setSignupError(errorMessage);
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    setSignupError(null);
    mutation.mutate({ data });
  };

  const password = watch("password");
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-400" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-400" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-400" };
    return { strength, label: "Strong", color: "bg-green-400" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First & Last Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="John"
              className={`w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 transition-all duration-300 ${errors.firstName ? "border-red-400" : ""
                }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Doe"
              className={`w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 transition-all duration-300 ${errors.lastName ? "border-red-400" : ""
                }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={`w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 transition-all duration-300 ${errors.email ? "border-red-400" : ""
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 transition-all duration-300 pr-10 ${errors.password ? "border-red-400" : ""
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.password.message}
            </p>
          )}

          {/* Password Strength Indicator */}
          {password && password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength.strength
                      ? passwordStrength.color
                      : "bg-white/20"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/80">
                Password strength: {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            type="tel"
            placeholder="+20 100 000 0000"
            className={`w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 transition-all duration-300 ${errors.phone ? "border-red-400" : ""
              }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-200 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {signupError && (
          <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4 animate-shake">
            <div className="text-sm text-white flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {t("auth.signup")}
            </span>
          )}
        </Button>
      </form>

      {/* Sign In Link */}
      <div className="text-center pt-4 border-t border-white/20">
        <p className="text-white/90 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
