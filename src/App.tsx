import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardPage from './pages/Dashboard';
import RegisterPage from './pages/Register';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="app-shell">
        <Router>
          <header className="app-header">
            <div className="brand-stack">
              <span className="brand-title">Savings Tracker</span>
              <p className="brand-subtitle">Plan your finances with clarity and confidence.</p>
            </div>
            <nav className="app-nav">
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Dashboard
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Register
              </NavLink>
            </nav>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
        </Router>
      </div>
    </AppProvider>
  );
}

export default App;
