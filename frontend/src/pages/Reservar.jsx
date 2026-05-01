import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks,
         startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, X as XIcon, CalendarDays, Wallet } from 'lucide-react';
import api from '../services/api';
import './Reservar.css';

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9..17
const VIEWS = ['mes', 'semana', 'día'];

export default function Reservar() {
  const [view, setView] = useState('semana');
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [spaceTypes, setSpaceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    api.get('/space-types').then((r) => setSpaceTypes(r.data));
  }, []);

  useEffect(() => {
    if (selectedDate && selectedType) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      api.get(`/reservations/availability?date=${dateStr}&space_type_id=${selectedType}`)
        .then((r) => setAvailability(r.data.reserved));
    }
  }, [selectedDate, selectedType]);

  const isReserved = (hour) => {
    return availability.some((r) => {
      const startH = parseInt(r.start_time.split(':')[0]);
      const endH = parseInt(r.end_time.split(':')[0]);
      return hour >= startH && hour < endH;
    });
  };

  const cost = () => {
    if (!selectedStart || !selectedEnd || !selectedType) return 0;
    const type = spaceTypes.find((t) => t.id === parseInt(selectedType));
    if (!type) return 0;
    const hours = (parseInt(selectedEnd) - parseInt(selectedStart));
    return (type.price_per_hour * hours).toFixed(2);
  };

  const handleReserve = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/reservations', {
        space_type_id: parseInt(selectedType),
        reservation_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: `${String(selectedStart).padStart(2,'0')}:00:00`,
        end_time: `${String(selectedEnd).padStart(2,'0')}:00:00`,
        notes,
      });
      setSuccess('¡Reserva realizada exitosamente!');
      setSelectedStart(''); setSelectedEnd(''); setNotes('');
      // Refresh availability
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const r = await api.get(`/reservations/availability?date=${dateStr}&space_type_id=${selectedType}`);
      setAvailability(r.data.reserved);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al realizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Calendar navigation helpers
  const navigate = (dir) => {
    if (view === 'día') setCurrent(dir > 0 ? addDays(current, 1) : subDays(current, 1));
    else if (view === 'semana') setCurrent(dir > 0 ? addWeeks(current, 1) : subWeeks(current, 1));
    else setCurrent(new Date(current.getFullYear(), current.getMonth() + dir, 1));
  };

  const getWeekDays = () => {
    const start = startOfWeek(current, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getMonthDays = () => {
    const start = startOfMonth(current);
    const end = endOfMonth(current);
    return eachDayOfInterval({ start, end });
  };

  const today = startOfDay(new Date());
  const isPast = (d) => isBefore(d, today);

  const type = spaceTypes.find((t) => t.id === parseInt(selectedType));

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Hacer una <span>Reserva</span></h1>

        <div className="reservar-grid">
          {/* Columna izquierda: Calendario */}
          <div className="calendar-col">
            <div className="card calendar-card">
              <div className="cal-toolbar">
                <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm"><ChevronLeft size={16} strokeWidth={2} /></button>
                <span className="cal-title">
                  {view === 'mes' && format(current, 'MMMM yyyy', { locale: es })}
                  {view === 'semana' && `Semana del ${format(startOfWeek(current, { weekStartsOn: 1 }), 'd MMM', { locale: es })}`}
                  {view === 'día' && format(current, 'EEEE d MMMM', { locale: es })}
                </span>
                <button onClick={() => navigate(1)} className="btn btn-secondary btn-sm"><ChevronRight size={16} strokeWidth={2} /></button>
                <div className="view-tabs">
                  {VIEWS.map((v) => (
                    <button key={v} onClick={() => setView(v)} className={`view-tab ${view === v ? 'active' : ''}`}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Month view */}
              {view === 'mes' && (
                <div className="month-grid">
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => (
                    <div key={d} className="month-header">{d}</div>
                  ))}
                  {/* Empty cells for first week */}
                  {Array.from({ length: (getMonthDays()[0].getDay() || 7) - 1 }).map((_, i) => (
                    <div key={`e${i}`} />
                  ))}
                  {getMonthDays().map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isPast(day) && !isWeekend(day) && setSelectedDate(day)}
                      className={`month-day ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isPast(day) || isWeekend(day) ? 'disabled' : ''}`}
                    >
                      {format(day, 'd')}
                    </button>
                  ))}
                </div>
              )}

              {/* Week view */}
              {view === 'semana' && (
                <div className="week-grid">
                  <div className="week-time-col">
                    {HOURS.map((h) => <div key={h} className="week-hour-label">{h}:00</div>)}
                  </div>
                  {getWeekDays().map((day) => (
                    <div key={day.toISOString()} className="week-day-col">
                      <div className={`week-day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                        <span>{format(day, 'EEE', { locale: es })}</span>
                        <strong>{format(day, 'd')}</strong>
                      </div>
                      {HOURS.map((h) => (
                        <button
                          key={h}
                          onClick={() => !isPast(day) && !isWeekend(day) && setSelectedDate(day)}
                          className={`week-cell ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isPast(day) || isWeekend(day) ? 'disabled' : ''}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Day view */}
              {view === 'día' && (
                <div className="day-view">
                  <div className="day-view-header">
                    <h3>{format(current, 'EEEE d MMMM', { locale: es })}</h3>
                  </div>
                  <button onClick={() => !isPast(current) && !isWeekend(current) && setSelectedDate(current)}
                    className={`btn ${isSameDay(current, selectedDate) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isSameDay(current, selectedDate)
                      ? <><Check size={15} strokeWidth={2.5} /> Día seleccionado</>
                      : <><CalendarDays size={15} strokeWidth={1.8} /> Seleccionar este día</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Formulario */}
          <div className="form-col">
            <div className="card">
              <h2 className="form-section-title">Detalles de la reserva</h2>

              <div className="form-group">
                <label>Fecha seleccionada</label>
                <div className="selected-date">
                  {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es }) : 'Selecciona un día en el calendario'}
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de espacio</label>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="">— Selecciona un tipo —</option>
                  {spaceTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — ${t.price_per_hour}/hr</option>
                  ))}
                </select>
              </div>

              {selectedDate && selectedType && (
                <>
                  <div className="hours-grid">
                    <label>Horarios disponibles</label>
                    <div className="hour-slots">
                      {HOURS.map((h) => (
                        <div key={h} className={`hour-slot ${isReserved(h) ? 'reserved' : 'available'}`}
                          style={{ borderColor: !isReserved(h) && type ? type.color : undefined }}>
                          {h}:00{isReserved(h) ? <XIcon size={11} strokeWidth={2.5} style={{ marginLeft: 3, verticalAlign: 'middle' }} /> : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="time-row">
                    <div className="form-group">
                      <label>Hora de inicio</label>
                      <select value={selectedStart} onChange={(e) => setSelectedStart(e.target.value)}>
                        <option value="">--</option>
                        {HOURS.filter((h) => !isReserved(h)).map((h) => (
                          <option key={h} value={h}>{h}:00</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hora de fin</label>
                      <select value={selectedEnd} onChange={(e) => setSelectedEnd(e.target.value)}>
                        <option value="">--</option>
                        {HOURS.filter((h) => h > parseInt(selectedStart || 0) && !isReserved(h)).concat([18]).map((h) => (
                          <option key={h} value={h}>{h}:00</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedStart && selectedEnd && (
                    <div className="cost-display">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Wallet size={15} strokeWidth={1.8} /> Costo estimado</span>
                      <strong>${cost()} MXN</strong>
                    </div>
                  )}
                </>
              )}

              <div className="form-group">
                <label>Notas (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Algún requerimiento especial..." rows={3} />
              </div>

              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}

              <button
                className="btn btn-primary w-full"
                onClick={handleReserve}
                disabled={!selectedDate || !selectedType || !selectedStart || !selectedEnd || loading}
              >
                {loading ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
