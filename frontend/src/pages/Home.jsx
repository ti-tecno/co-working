import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { animate, stagger, createTimeline, onScroll } from 'animejs';
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

  useEffect(() => {
    // Hero: animación de entrada en cadena
    const tl = createTimeline({ defaults: { easing: 'easeOutExpo' } });
    tl
      .add('.hero-badge',   { opacity: [0, 1], translateY: [-18, 0], duration: 520 }, 0)
      .add('.hero h1',      { opacity: [0, 1], translateY: [38, 0],  duration: 720 }, 150)
      .add('.hero-sub',     { opacity: [0, 1], translateY: [25, 0],  duration: 660 }, 340)
      .add('.hero-actions', { opacity: [0, 1], translateY: [22, 0],  duration: 640 }, 490);

    // Helper: anima cuando el elemento entra al viewport
    const observers = [];
    const onEnter = (selector, animations, threshold = 0.12) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          animations.forEach(({ targets, ...props }) => animate(targets, props));
          obs.disconnect();
        }
      }, { threshold });
      obs.observe(el);
      observers.push(obs);
    };

    // Tarjetas de espacios
    onEnter('.features-section', [
      {
        targets: '.feature-card',
        opacity: [0, 1], translateY: [45, 0],
        delay: stagger(140), duration: 720, easing: 'easeOutExpo',
      },
    ]);

    // Sección amenidades
    onEnter('.amenities-section', [
      {
        targets: '.amenities-img-wrapper',
        opacity: [0, 1], translateX: [-50, 0],
        duration: 820, easing: 'easeOutExpo',
      },
      {
        targets: '.amenities-label',
        opacity: [0, 1], translateY: [20, 0],
        duration: 580, delay: 120, easing: 'easeOutExpo',
      },
      {
        targets: '.amenities-title',
        opacity: [0, 1], translateY: [28, 0],
        duration: 650, delay: 230, easing: 'easeOutExpo',
      },
      {
        targets: '.amenity-row',
        opacity: [0, 1], translateX: [30, 0],
        delay: stagger(90, { start: 330 }), duration: 600, easing: 'easeOutExpo',
      },
    ]);

    // CTA
    onEnter('.cta-section', [
      {
        targets: '.cta-box',
        opacity: [0, 1], translateY: [32, 0], scale: [0.96, 1],
        duration: 720, easing: 'easeOutExpo',
      },
    ]);

    // Parallax: fondo del hero (capa más lejana, se desplaza más)
    const heroBgParallax = animate('.hero-bg', {
      translateY: [0, 130],
      ease: 'linear',
      autoplay: onScroll({
        target: '.hero',
        sync: true,
        enter: 'top top',
        leave: 'bottom top',
      }),
    });

    // Parallax: contenido del hero (capa media, desplazamiento menor)
    const heroContentParallax = animate('.hero-content', {
      translateY: [0, 55],
      ease: 'linear',
      autoplay: onScroll({
        target: '.hero',
        sync: true,
        enter: 'top top',
        leave: 'bottom top',
      }),
    });

    // Parallax: imagen de amenidades dentro de su contenedor con overflow:hidden
    const amenitiesParallax = animate('.amenities-img', {
      translateY: [-35, 35],
      ease: 'linear',
      autoplay: onScroll({
        target: '.amenities-section',
        sync: true,
      }),
    });

    return () => {
      observers.forEach(o => o.disconnect());
      heroBgParallax.cancel();
      heroContentParallax.cancel();
      amenitiesParallax.cancel();
    };
  }, []);

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
