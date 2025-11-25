import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import { ToastProvider } from './components/ToastProvider';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import SignUpPage from './pages/SignUpPage';
import { firebaseConfigError, isFirebaseConfigured, missingFirebaseKeys } from './firebase/config';
import './index.css';

function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-main px-6 text-dark">
        <div className="max-w-xl border-[3px] border-dark bg-surface p-8 text-center shadow-hard">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-dark/40">Environment Required</p>
          <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-tight">Firebase Config Missing</h1>
          <p className="mt-4 text-sm leading-relaxed text-dark/70">
            {firebaseConfigError}. Create a <code>.env</code> file (see <code>.env.example</code>) and restart the app.
          </p>
          <div className="mt-4">
            <code className="block rounded-none border-[3px] border-dark bg-main px-4 py-3 text-left text-xs font-mono">
              missing: {missingFirebaseKeys.join(', ')}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ToastProvider>
        <div className="relative min-h-screen bg-main text-dark">
          <div className="kinetic-noise" aria-hidden="true" />
          <CustomCursor />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
