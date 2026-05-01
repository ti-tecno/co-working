import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/reservar');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1>Bienvenido de nuevo</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" name="email" value={form.email} onChange={handle} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
