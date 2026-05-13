import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
            <h1>NodeVet</h1>
          </div>
          <nav className="nav-tabs">
            <button className="nav-tab">One</button>
            <button className="nav-tab">Two</button>
            <button className="nav-tab">Three</button>
            <button className="nav-tab">One</button>
            <button className="nav-tab">Two</button>
            <button className="nav-tab">Three</button>
          </nav>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>
              Reserva Online
            </button>
            {token ? (
              <button className="btn-primary" onClick={() => navigate('/dashboard/tutor')}>
                Dashboard
              </button>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Ingresa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Banner */}
      <section className="banner">
        <div className="banner-content">
          <div className="clinic-info">
            <div className="info-item">
              <span className="icon">📍</span>
              <div>
                <h3>Nuestra ubicación</h3>
                <p>XXX XXXXX XXXXXX, Puente Alto</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">🕐</span>
              <div>
                <h3>Horario</h3>
                <p>09:00 - 19:00</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📞</span>
              <div>
                <h3>Llámenos</h3>
                <p>+ 569 99999999</p>
              </div>
            </div>
          </div>
          <div className="banner-carousel">
            <div className="carousel-slide"></div>
            <div className="carousel-controls">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-item">
          <h3>Reserva Fácil</h3>
          <p>Agenda citas para tus mascotas en minutos</p>
        </div>
        <div className="feature-item">
          <h3>Veterinarios Expertos</h3>
          <p>Profesionales certificados al servicio de tus mascotas</p>
        </div>
        <div className="feature-item">
          <h3>Atención de Calidad</h3>
          <p>Cuidamos a tus mascotas como si fueran las nuestras</p>
        </div>
      </section>
    </div>
  );
}
