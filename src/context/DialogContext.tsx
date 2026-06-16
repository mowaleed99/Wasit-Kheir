import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface PromptOptions extends DialogOptions {
  defaultValue?: string;
}

interface DialogContextType {
  confirm: (options: string | DialogOptions) => Promise<boolean>;
  prompt: (options: string | PromptOptions, defaultVal?: string) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useAppDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'confirm' | 'prompt'>('confirm');
  const [options, setOptions] = useState<PromptOptions>({ message: '' });
  const [inputValue, setInputValue] = useState('');
  const [resolvePromise, setResolvePromise] = useState<((val: any) => void) | null>(null);

  const handleConfirm = useCallback((opts: string | DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      const parsedOpts = typeof opts === 'string' ? { message: opts } : opts;
      setOptions(parsedOpts);
      setType('confirm');
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handlePrompt = useCallback((opts: string | PromptOptions, defaultVal?: string) => {
    return new Promise<string | null>((resolve) => {
      let parsedOpts: PromptOptions;
      if (typeof opts === 'string') {
        parsedOpts = { message: opts, defaultValue: defaultVal || '' };
      } else {
        parsedOpts = { ...opts, defaultValue: opts.defaultValue || defaultVal || '' };
      }
      setOptions(parsedOpts);
      setInputValue(parsedOpts.defaultValue || '');
      setType('prompt');
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleClose = (value: any) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(value);
      setResolvePromise(null);
    }
  };

  return (
    <DialogContext.Provider value={{ confirm: handleConfirm, prompt: handlePrompt }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => handleClose(type === 'prompt' ? null : false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {options.title || (type === 'prompt' ? t('dialog.prompt', 'Input Required') : t('dialog.confirm', 'Please Confirm'))}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {options.message}
            </p>
            
            {type === 'prompt' && (
              <div className="mb-6">
                <Input 
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClose(inputValue);
                    if (e.key === 'Escape') handleClose(null);
                  }}
                  className="w-full"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleClose(type === 'prompt' ? null : false)}
              >
                {options.cancelText || t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={() => handleClose(type === 'prompt' ? inputValue : true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {options.confirmText || t('common.confirm', 'Confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
