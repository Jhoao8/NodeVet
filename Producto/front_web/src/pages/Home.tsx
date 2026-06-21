import { useNavigate } from 'react-router-dom';
import { useNombreUsuario } from '../hooks/useNombreUsuario';
import UserMenu from '../components/UserMenu';
import Carousel from '../components/Carousel';
import '../styles/Home.css';
import Logo from '../assets/images/Logo.png';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombreUsuario = useNombreUsuario();

  const handleLogout = () => {
    console.log('Logout iniciado');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    console.log('localStorage limpiado');
    // Recargar la página para actualizar el estado de autenticación
    window.location.href = '/home';
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => navigate('/home')}>
            <img src={Logo} alt="NodeVet Logo" style={{ width: '40px', height: '40px' }} />
            <h1>NodeVet</h1>
          </div>
          <div className="header-buttons">
            <button className="btn-outline" onClick={() => navigate('/agendarCita')}>
              Reserva Online
            </button>
            {token ? (
              <UserMenu nombre={nombreUsuario} onLogout={handleLogout} />
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
          <Carousel />
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
