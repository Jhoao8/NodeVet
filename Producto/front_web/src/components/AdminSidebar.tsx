import { useNavigate } from 'react-router-dom';

export type AdminSection = 'usuarios' | 'veterinarios' | 'agenda' | 'precio';

// Sidebar compartido de las páginas del administrador.
export default function AdminSidebar({ active }: { active: AdminSection }) {
  const navigate = useNavigate();

  const items: { section: AdminSection; label: string; path: string }[] = [
    { section: 'usuarios', label: '👥 Usuarios', path: '/dashboard/admin' },
    { section: 'veterinarios', label: '🩺 Veterinarios', path: '/dashboard/admin/veterinarios' },
    { section: 'agenda', label: '🗓️ Generar Agenda', path: '/dashboard/admin/agenda' },
    { section: 'precio', label: '💲 Valor de citas', path: '/dashboard/admin/precio' },
  ];

  return (
    <aside className="sidebar">
      <h3>Menú</h3>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.section}
            className={`nav-item ${active === item.section ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
