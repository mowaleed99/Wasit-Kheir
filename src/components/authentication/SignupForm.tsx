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


const getSignupSchema = (t: any) => z.object({
  firstName: z.string().min(1, t('auth.firstNameRequired')).max(50),
  lastName: z.string().min(1, t('auth.lastNameRequired')).max(50),
  email: z.string().email(t('auth.invalidEmail')),
  password: z.string().min(6, t('auth.passwordMinLength')),
  phone: z.string().min(1, t('auth.phoneRequired')),
});

type SignupFormData = z.infer<ReturnType<typeof getSignupSchema>>;

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
        let errorMessage = t('auth.signupFailed');

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
          errorMessage = t('auth.requestTimeout');
        } else if (error?.message === "Network Error" || error?.code === "ERR_NETWORK") {
          errorMessage = t('auth.networkError');
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
    resolver: zodResolver(getSignupSchema(t)),
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

    if (strength <= 2) return { strength, label: t('auth.weak'), color: "bg-red-400" };
    if (strength <= 3) return { strength, label: t('auth.fair'), color: "bg-yellow-400" };
    if (strength <= 4) return { strength, label: t('auth.good'), color: "bg-blue-400" };
    return { strength, label: t('auth.strong'), color: "bg-green-400" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First & Last Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700 font-medium">
              {t('auth.firstNameLabel')}
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder={t('auth.firstNamePlaceholder')}
              className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${errors.firstName ? "border-red-400" : ""
                }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700 font-medium">
              {t('auth.lastNameLabel')}
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder={t('auth.lastNamePlaceholder')}
              className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${errors.lastName ? "border-red-400" : ""
                }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            {t('auth.emailAddressLabel')}
          </Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${errors.email ? "border-red-400" : ""
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            {t('auth.passwordLabel')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 pr-10 ${errors.password ? "border-red-400" : ""
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
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
                      : "bg-gray-200"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {t('auth.passwordStrength')}{passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-medium">
            {t('auth.phoneNumberLabel')}
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            type="tel"
            placeholder={t('auth.phonePlaceholder')}
            className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 ${errors.phone ? "border-red-400" : ""
              }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {signupError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
            <div className="text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {mutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('auth.creatingAccount')}
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
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-gray-600 text-sm">
          {t('auth.alreadyHaveAccount')} {" "}
          <Link
            to="/login"
            className="font-semibold text-purple-600 hover:text-purple-500 underline underline-offset-2 transition-colors"
          >
            {t('auth.signInHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};
