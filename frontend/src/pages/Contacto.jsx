import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock4, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import './Contacto.css';

// Fix Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coordenadas Xalapa, Veracruz
const LOCATION = [19.535193, -96.931562];
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '521234567890';
const WA_MSG = encodeURIComponent(import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hola, me interesa reservar un espacio en el coworking');
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'info@coworking.com';

export default function Contacto() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Contác<span>tanos</span></h1>

        <div className="contact-grid">
          {/* Info + Map */}
          <div className="contact-left">
            <div className="card contact-info">
              <h2>Encuéntranos</h2>
              <div className="info-items">
                <div className="info-item">
                  <span className="info-icon"><MapPin size={20} strokeWidth={1.8} /></span>
                  <div>
                    <strong>Dirección</strong>
                    <p>Papantla 27B, Col. Centro<br />Xalapa, Veracruz, México</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Clock4 size={20} strokeWidth={1.8} /></span>
                  <div>
                    <strong>Horario</strong>
                    <p>Lunes a viernes: 9:00 – 18:00 hrs</p>
                    <p>Sábado y domingo: cerrado</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon"><Mail size={20} strokeWidth={1.8} /></span>
                  <div>
                    <strong>Email</strong>
                    <p>{CONTACT_EMAIL}</p>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Escribir por WhatsApp
              </a>
            </div>

            <div className="map-wrapper">
              <MapContainer center={LOCATION} zoom={15} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={LOCATION}>
                  <Popup>CoWork Xalapa<br />Tu espacio de trabajo ideal</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Contact form */}
          <div className="card contact-form-card">
            <h2>Envíanos un mensaje</h2>
            <p className="form-desc">¿Tienes preguntas? Con gusto te respondemos.</p>

            {status === 'success' && (
              <div className="success-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} strokeWidth={2} /> Mensaje enviado correctamente. Te contactaremos pronto.
              </div>
            )}
            {status === 'error' && (
              <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} strokeWidth={2} /> Error al enviar el mensaje. Intenta de nuevo.
              </div>
            )}

            <form onSubmit={submit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Tu nombre" required />
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handle} placeholder="tu@email.com" required />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea name="message" value={form.message} onChange={handle} placeholder="¿En qué podemos ayudarte?" rows={5} required />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
