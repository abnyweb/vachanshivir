import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { StoreProvider } from './store/StoreContext';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './components/common/ToastProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LanguageProvider } from './i18n/LanguageContext';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <StoreProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </StoreProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
