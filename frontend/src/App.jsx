import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Reservar from './pages/Reservar';
import MisReservas from './pages/MisReservas';
import Admin from './pages/Admin';
import Contacto from './pages/Contacto';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/reservar" element={<ProtectedRoute><Reservar /></ProtectedRoute>} />
          <Route path="/mis-reservas" element={<ProtectedRoute><MisReservas /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
