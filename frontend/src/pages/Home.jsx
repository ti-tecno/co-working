import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Armchair, Monitor, Users, MapPin, ShieldCheck, Wifi, Coffee, ParkingSquare, Clock4 } from 'lucide-react';
import './Home.css';

const amenities = [
  { icon: <MapPin size={20} strokeWidth={1.8} />, title: 'Ubicación céntrica', desc: 'En el corazón de Xalapa, a minutos de bancos, restaurantes y transporte público.' },
  { icon: <ShieldCheck size={20} strokeWidth={1.8} />, title: 'Espacio seguro', desc: 'Acceso controlado, cámaras de seguridad y personal presente durante todo el horario.' },
  { icon: <Wifi size={20} strokeWidth={1.8} />, title: 'Internet de alta velocidad', desc: 'Fibra óptica dedicada con respaldo para garantizar tu conectividad.' },
  { icon: <Coffee size={20} strokeWidth={1.8} />, title: 'Cocina y café gratis', desc: 'Cocina equipada con café, té y agua sin costo para todos los miembros.' },
  { icon: <ParkingSquare size={20} strokeWidth={1.8} />, title: 'Estacionamiento disponible', desc: 'Lugares de estacionamiento en las inmediaciones para tu comodidad.' },
  { icon: <Clock4 size={20} strokeWidth={1.8} />, title: 'Horario amplio', desc: 'Abierto de lunes a viernes de 9:00 a 18:00 hrs, con reservas flexibles por hora.' },
];

const features = [
  { icon: <Armchair size={36} strokeWidth={1.5} />, title: 'Escritorio y silla ergonómica', desc: 'Espacio de trabajo individual en ambiente productivo.' },
  { icon: <Monitor size={36} strokeWidth={1.5} />, title: 'Escritorios con monitor', desc: 'Escritorio equipado con monitor 24" de alta resolución.' },
  { icon: <Users size={36} strokeWidth={1.5} />, title: 'Sala de Juntas', desc: 'Sala privada para reuniones de hasta 5 personas.' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge">Coworking · Xalapa, Ver.</div>
          <h1>Tu espacio de<br /><span>trabajo ideal</span></h1>
          <p className="hero-sub">
            Reserva escritorios, monitores y salas de juntas de forma sencilla.
            Trabaja en un ambiente diseñado para tu productividad.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/reservar" className="btn btn-primary btn-lg">Hacer una reserva</Link>
            ) : (
              <>
                <Link to="/registro" className="btn btn-primary btn-lg">Empezar gratis</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Iniciar sesión</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Nuestros espacios</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="amenities-section">
        <div className="container">
          <div className="amenities-layout">

            <div className="amenities-img-col">
              <div className="amenities-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
                  alt="Espacio de coworking"
                  className="amenities-img"
                />
                <div className="amenities-img-badge">
                  <strong>+50</strong>
                  <span>miembros activos</span>
                </div>
              </div>
            </div>

            <div className="amenities-content-col">
              <span className="amenities-label">¿Por qué elegirnos?</span>
              <h2 className="amenities-title">Un espacio pensado<br />para tu productividad</h2>
              <div className="amenities-list">
                {amenities.map((a) => (
                  <div key={a.title} className="amenity-row">
                    <div className="amenity-row-icon">{a.icon}</div>
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box card">
            <h2>¿Listo para trabajar diferente?</h2>
            <p>Únete a nuestra comunidad de profesionales y emprendedores.</p>
            <Link to="/contacto" className="btn btn-primary">Contáctanos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
