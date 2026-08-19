import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MyGames from './pages/MyGames';
import MyBooks from './pages/MyBooks';
import BookDetails from './pages/BookDetails';
import Sales from './pages/Sales';
import SoldBooks from './pages/SoldBooks';
import UnsoldBooks from './pages/UnsoldBooks';
import TickerSearch from './pages/TickerSearch';
import Results from './pages/Results';
import ResultSearch from './pages/ResultSearch';
import AssignmentHistory from './pages/AssignmentHistory';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/agent/login" element={<Login />} />

          <Route path="/agent" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="games" element={<MyGames />} />
            <Route path="books" element={<MyBooks />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="ticker-search" element={<TickerSearch />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sold-books" element={<SoldBooks />} />
            <Route path="unsold-books" element={<UnsoldBooks />} />
            <Route path="results" element={<Results />} />
            <Route path="result-search" element={<ResultSearch />} />
            <Route path="assignment-history" element={<AssignmentHistory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/agent/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
