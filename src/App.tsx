import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import { AppProvider } from './context/AppContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-4">
            <Link to="/" className="hover:text-gray-300">Dashboard</Link>
            <Link to="/register" className="hover:text-gray-300">Register</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;