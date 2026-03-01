import { LoginForm } from '@/components/authentication/LoginForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if already authenticated
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient-xy">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl overflow-hidden p-1">
            <img
              src="/logo1.png"
              alt="Waseet Kheir Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {t('auth.login')}
          </h1>
          <p className="text-white/90 text-lg">Welcome back to Wasit Kheir!</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          Wasit Kheir © 2026
        </p>
      </div>
    </div>
  );
};
