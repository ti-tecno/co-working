import { useState, useEffect } from 'react';
import api from '../services/api';
import './MisReservas.css';

// Formatea fecha de forma segura sin importar si llega como string, Date o ISO
function formatFecha(raw) {
  try {
    let str = '';
    if (raw instanceof Date) {
      str = raw.toISOString().slice(0, 10);
    } else if (typeof raw === 'string') {
      str = raw.slice(0, 10); // toma solo YYYY-MM-DD
    } else {
      return String(raw);
    }
    const [year, month, day] = str.split('-').map(Number);
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${day} de ${meses[month - 1]} de ${year}`;
  } catch {
    return String(raw);
  }
}

function formatHora(t) {
  if (!t) return '';
  return String(t).slice(0, 5);
}

export default function MisReservas() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reservations/my');
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
      alert(err.response?.data?.error || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    setCancelling(id);
    try {
      await api.patch(`/reservations/${id}/cancel`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setCancelling(null);
    }
  };

  const active = reservations.filter((r) => r.status === 'active');
  const cancelled = reservations.filter((r) => r.status === 'cancelled');

  if (loading) return (
    <div className="page">
      <div className="container"><p style={{ color: 'var(--muted)' }}>Cargando...</p></div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Mis <span>Reservas</span></h1>

        <div className="reservas-stats">
          <div className="stat-pill">🟢 {active.length} activas</div>
          <div className="stat-pill">🔴 {cancelled.length} canceladas</div>
        </div>

        {reservations.length === 0 && (
          <div className="card empty-state">
            <p>No tienes reservas aún.</p>
            <a href="/reservar" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Hacer mi primera reserva
            </a>
          </div>
        )}

        {active.length > 0 && (
          <>
            <h2 className="section-sub">Reservas activas</h2>
            <div className="reservas-grid">
              {active.map((r) => (
                <ReservaCard key={r.id} r={r} onCancel={cancel} cancelling={cancelling} />
              ))}
            </div>
          </>
        )}

        {cancelled.length > 0 && (
          <>
            <h2 className="section-sub" style={{ marginTop: '2rem' }}>Historial</h2>
            <div className="reservas-grid">
              {cancelled.map((r) => (
                <ReservaCard key={r.id} r={r} onCancel={cancel} cancelling={cancelling} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReservaCard({ r, onCancel, cancelling }) {
  return (
    <div className="card reserva-card">
      <div className="reserva-color-bar" style={{ background: r.space_color }} />
      <div className="reserva-body">
        <div className="reserva-top">
          <h3>{r.space_name}</h3>
          <span className={`badge badge-${r.status === 'active' ? 'active' : 'cancelled'}`}>
            {r.status === 'active' ? 'Activa' : 'Cancelada'}
          </span>
        </div>
        <div className="reserva-details">
          <span>📅 {formatFecha(r.reservation_date)}</span>
          <span>🕐 {formatHora(r.start_time)} – {formatHora(r.end_time)}</span>
          <span>💵 ${r.total_cost} MXN</span>
        </div>
        {r.notes && <p className="reserva-notes">{r.notes}</p>}
        {r.status === 'active' && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(r.id)}
            disabled={cancelling === r.id}
          >
            {cancelling === r.id ? 'Cancelando...' : 'Cancelar reserva'}
          </button>
        )}
      </div>
    </div>
  );
}
