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

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
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
      let errorMessage = "Login failed. Please check your email and password.";

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
        errorMessage =
          "Request timeout. Please check your internet connection.";
      } else if (
        error?.code === "ERR_NETWORK" ||
        error?.message === "Network Error"
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
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
          <Label htmlFor="email" className="text-white font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email", { required: "Email is required" })}
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
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
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
        </div>

        {/* Error Message */}
        {loginError && (
          <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4 animate-shake">
            <div className="text-sm text-white flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white text-indigo-600 hover:bg-white/90 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center pt-4 border-t border-white/20">
        <p className="text-white/90 text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};
