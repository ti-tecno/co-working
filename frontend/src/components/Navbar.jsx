import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, UserCircle2, ShieldCheck } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          <Building2 size={20} strokeWidth={2} className="logo-icon" />
          <span className="logo-mark">Co</span>Work
        </Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Inicio</Link>
          {user && <Link to="/reservar" className={isActive('/reservar')}>Reservar</Link>}
          {user && <Link to="/mis-reservas" className={isActive('/mis-reservas')}>Mis Reservas</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={`${isActive('/admin')} admin-link`}>Panel Admin</Link>}
          <Link to="/contacto" className={isActive('/contacto')}>Contacto</Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <UserCircle2 size={18} strokeWidth={1.8} style={{ color: 'var(--muted)' }} />
              <span className="user-name">{user.name.split(' ')[0]}</span>
              {user.role === 'admin' && (
                <span className="badge badge-admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} strokeWidth={2} /> Admin
                </span>
              )}
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogOut size={14} strokeWidth={2} /> Salir
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
