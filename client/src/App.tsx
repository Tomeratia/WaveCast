import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { SpotPage } from './pages/SpotPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AlertsPage } from './pages/AlertsPage';
import { LoginPage } from './pages/LoginPage';
import { AgentPage } from './pages/AgentPage';
import { UnitsProvider } from './context/UnitsContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
    <UnitsProvider>
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/spot/:spotId" element={<SpotPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/agent" element={<AgentPage />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <p>WaveCast · Free, open-source surf forecasting · Powered by Open-Meteo</p>
      </footer>
    </div>
    </UnitsProvider>
    </AuthProvider>
  );
}
