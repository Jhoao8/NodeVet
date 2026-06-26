import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/authUtils';
import './UserMenu.css';

interface Props {
  nombre: string;
  onLogout: () => void;
}

export default function UserMenu({ nombre, onLogout }: Props) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const irAPerfil = () => {
    setAbierto(false);
    navigate(getDashboardPath());
  };

  const cerrarSesion = () => {
    setAbierto(false);
    onLogout();
  };

  return (
    <div className="user-menu-dropdown" ref={ref}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setAbierto((o) => !o)}
        aria-haspopup="true"
        aria-expanded={abierto}
      >
        <span className="user-menu-nombre">{nombre || 'Mi cuenta'}</span>
        <span className={`user-menu-caret ${abierto ? 'abierto' : ''}`}>▾</span>
      </button>

      {abierto && (
        <div className="user-menu-panel" role="menu">
          <button type="button" className="user-menu-item" role="menuitem" onClick={irAPerfil}>
            👤 Perfil
          </button>
          <button type="button" className="user-menu-item" role="menuitem" onClick={cerrarSesion}>
            🚪 Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
