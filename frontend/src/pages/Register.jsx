import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/reservar');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <h1>Crear cuenta</h1>
          <p>Únete a la comunidad CoWork</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" name="name" value={form.name} onChange={handle} placeholder="Tu nombre" required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" name="email" value={form.email} onChange={handle} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handle} placeholder="Mínimo 6 caracteres" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
