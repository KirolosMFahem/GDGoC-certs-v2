import { AuthProvider } from './contexts/AuthContext';
import AdminApp from './components/AdminApp';
import PublicValidationPage from './pages/PublicValidationPage';

function App() {
  const hostname = window.location.hostname;

  // Route based on hostname
  if (hostname === 'sudo.certs-admin.certs.gdg-oncampus.dev' || hostname === 'localhost') {
    // Admin interface
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    );
  } else if (hostname === 'certs.gdg-oncampus.dev') {
    // Public validation page
    return <PublicValidationPage />;
  }

  // Fallback for unknown hostnames (show public validation)
  return <PublicValidationPage />;
}

export default App;
