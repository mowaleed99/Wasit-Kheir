import { LoginForm } from '@/components/authentication/LoginForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { Navigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { language, toggleLanguage } = useSettings();

  // Redirect to home if already authenticated
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Visual/Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90 mix-blend-multiply"></div>
        {/* Placeholder for an image, using a nice pattern for now */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center h-full p-16 text-white w-full max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-white shadow-2xl p-2">
              <img
                src="/logo2.png"
                alt="Waseet Kheir Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-xl text-indigo-100/90 leading-relaxed max-w-lg">
              {t('auth.footerText')}
            </p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full transition-all duration-300 shadow-sm border border-gray-200"
          >
            <Globe className="w-5 h-5 text-indigo-600" />
            <span className="font-medium text-sm">{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-white shadow-lg p-1">
              <img
                src="/logo2.png"
                alt="Waseet Kheir Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{t('auth.login')}</h2>
            <p className="mt-2 text-gray-600">{t('auth.welcomeBack')}</p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
             {/* Desktop Title */}
             <div className="hidden lg:block mb-8 text-center">
               <h2 className="text-3xl font-bold text-gray-900">{t('auth.login')}</h2>
             </div>
             <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};
