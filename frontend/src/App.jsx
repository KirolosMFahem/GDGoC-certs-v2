import { AuthProvider } from './contexts/AuthContext';
import AdminApp from './components/AdminApp';
import PublicValidationPage from './pages/PublicValidationPage';
import { HOSTNAMES } from './config';

function App() {
  const hostname = window.location.hostname;

  // Route based on hostname
  if (hostname === HOSTNAMES.ADMIN || hostname === HOSTNAMES.DEV) {
    // Admin interface
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    );
  } else if (hostname === HOSTNAMES.PUBLIC) {
    // Public validation page
    return <PublicValidationPage />;
  }

  // Fallback for unknown hostnames (show public validation)
  return <PublicValidationPage />;
}

export default App;
