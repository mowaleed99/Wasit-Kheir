import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";


interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const { isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (
    data: LoginFormData,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();
    setLoginError(null);
    console.log("Attempting login with:", {
      email: data.email,
      password: "***",
    });

    try {
      console.log("Calling login mutation...");
      await loginMutation.mutateAsync({ data });
      console.log("Login successful");

      // Wait briefly for the authentication cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Invalidate and refetch user query to trigger AuthContext update
      console.log("Invalidating user query...");
      await queryClient.invalidateQueries({ queryKey: ["/api/Users/me"] });

      // Wait for the user data to be fetched successfully
      console.log("Fetching user data...");
      let retries = 0;
      const maxRetries = 10; // 5 seconds max wait

      while (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userData = queryClient.getQueryData(["/api/Users/me"]);
        console.log("Checking user data, retry:", retries, "data:", userData);

        if (userData) {
          console.log("User data loaded successfully");
          break;
        }

        retries++;
      }

      console.log("Navigating to home...");
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Login failed - Full error:", error);
      console.error("Error response:", error?.response);
      console.error("Error message:", error?.message);
      console.error("Error code:", error?.code);

      // Show user-friendly error message
      let errorMessage = t('auth.loginFailed');

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
      } else if (
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error"
      ) {
        errorMessage = t('auth.networkError');
      }

      setLoginError(errorMessage);
    }
  };

  const isLoading = isSubmitting || authLoading || loginMutation.isPending;


  return (
    <div className="w-full space-y-6">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
      >
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            {t('auth.emailAddressLabel')}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            {...register("email", { required: t('auth.emailRequired') })}
            className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 ${errors.email ? "border-red-400" : ""
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
              placeholder="••••••••"
              {...register("password", { required: t('auth.passwordRequired') })}
              className={`w-full bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 pr-10 ${errors.password ? "border-red-400" : ""
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
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
            <div className="text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('auth.signingIn')}
            </span>
          ) : (
            t('auth.signIn')
          )}
        </Button>
      </form>



      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-gray-600 text-sm">
          {t('auth.noAccount')} {" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-2 transition-colors"
          >
            {t('auth.signUpHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};
