import { useState, useEffect } from 'react';
import api from '../services/api';
import './Admin.css';

function formatFecha(raw) {
  try {
    const str = raw instanceof Date ? raw.toISOString().slice(0,10) : String(raw).slice(0,10);
    const [year, month, day] = str.split('-').map(Number);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${day} ${meses[month-1]} ${year}`;
  } catch { return String(raw); }
}

function formatTS(raw) {
  try {
    const d = new Date(raw);
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return String(raw); }
}

const TABS = ['Reservas', 'Tipos de Espacio', 'Mensajes de Contacto'];

export default function Admin() {
  const [tab, setTab] = useState('Reservas');

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Panel de <span>Administración</span></h1>
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`admin-tab ${tab === t ? 'active' : ''}`}>{t}</button>
          ))}
        </div>
        {tab === 'Reservas' && <ReservasAdmin />}
        {tab === 'Tipos de Espacio' && <SpaceTypesAdmin />}
        {tab === 'Mensajes de Contacto' && <ContactAdmin />}
      </div>
    </div>
  );
}

function ReservasAdmin() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/reservations/all');
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    await api.patch(`/reservations/${id}/cancel`);
    load();
  };

  if (loading) return <p className="loading-text">Cargando...</p>;

  return (
    <div>
      <div className="table-header">
        <h2>Todas las reservas ({reservations.length})</h2>
      </div>
      <div className="admin-table-wrapper card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th><th>Usuario</th><th>Espacio</th><th>Fecha</th><th>Horario</th><th>Total</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><div>{r.user_name}</div><div className="text-muted">{r.user_email}</div></td>
                <td><span className="space-dot" style={{background: r.space_color}} />{r.space_name}</td>
                <td>{formatFecha(r.reservation_date)}</td>
                <td>{String(r.start_time).slice(0,5)} – {String(r.end_time).slice(0,5)}</td>
                <td>${r.total_cost}</td>
                <td><span className={`badge badge-${r.status === 'active' ? 'active' : 'cancelled'}`}>{r.status === 'active' ? 'Activa' : 'Cancelada'}</span></td>
                <td>{r.status === 'active' && <button className="btn btn-danger btn-sm" onClick={() => cancel(r.id)}>Cancelar</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpaceTypesAdmin() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price_per_hour: '', color: '#3B82F6' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/space-types/admin');
    setTypes(data);
  };

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/space-types/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/space-types', form);
      }
      setForm({ name: '', description: '', price_per_hour: '', color: '#3B82F6' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const del = async (id) => {
    if (!confirm('¿Desactivar este tipo de espacio?')) return;
    await api.delete(`/space-types/${id}`);
    load();
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, description: t.description || '', price_per_hour: t.price_per_hour, color: t.color });
  };

  return (
    <div className="spacetypes-grid">
      <div>
        <h2 className="section-label">Tipos de espacio</h2>
        <div className="types-list">
          {types.map((t) => (
            <div key={t.id} className="card type-card">
              <div className="type-color" style={{ background: t.color }} />
              <div className="type-info">
                <strong>{t.name}</strong>
                <span className="text-muted">${t.price_per_hour}/hr</span>
                {!t.is_active && <span className="badge badge-cancelled">Inactivo</span>}
              </div>
              <div className="type-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)}>Editar</button>
                {t.is_active && <button className="btn btn-danger btn-sm" onClick={() => del(t.id)}>Eliminar</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-label">{editing ? 'Editar tipo' : 'Agregar tipo'}</h2>
        <div className="card">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nombre</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Ej. Sala de Juntas" required />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea name="description" value={form.description} onChange={handle} rows={2} />
            </div>
            <div className="form-group">
              <label>Precio por hora (MXN)</label>
              <input name="price_per_hour" type="number" min="0" step="0.01" value={form.price_per_hour} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                <input type="color" name="color" value={form.color} onChange={handle} style={{ width:48, height:40, borderRadius:8, border:'none', cursor:'pointer' }} />
                <span style={{ color:'var(--muted)', fontSize:'0.875rem' }}>{form.color}</span>
              </div>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Agregar tipo'}</button>
              {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name:'', description:'', price_per_hour:'', color:'#3B82F6' }); }}>Cancelar</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactAdmin() {
  const [messages, setMessages] = useState([]);

  const load = async () => {
    const { data } = await api.get('/contact');
    setMessages(data);
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.patch(`/contact/${id}/read`);
    load();
  };

  return (
    <div>
      <h2 className="section-label">Mensajes de contacto ({messages.length})</h2>
      <div className="messages-list">
        {messages.map((m) => (
          <div key={m.id} className={`card message-card ${!m.read ? 'unread' : ''}`}>
            <div className="message-header">
              <div>
                <strong>{m.name}</strong>
                <span className="text-muted"> · {m.email}</span>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                {!m.read && <span className="badge badge-active">Nuevo</span>}
                <span className="text-muted" style={{fontSize:'0.8rem'}}>{formatTS(m.created_at)}</span>
              </div>
            </div>
            <p className="message-body">{m.message}</p>
            {!m.read && <button className="btn btn-secondary btn-sm" onClick={() => markRead(m.id)}>Marcar como leído</button>}
          </div>
        ))}
        {messages.length === 0 && <p className="text-muted">Sin mensajes aún.</p>}
      </div>
    </div>
  );
}
