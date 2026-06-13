import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import '../../styles/Dashboard.css';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: string;
}

interface Mascota {
  id: string;
  nombre: string;
  tutor: string;
  fecha: string;
  estado: string;
}

interface Cita {
  id: string;
  mascota: string;
  tutor: string;
  medico: string;
  tipoConsulta: string;
  fecha: string;
  estado: string;
}

interface Especialidad {
  id: number;
  nombre: string;
}

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({ nombre: 'Administrador' });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [stats, setStats] = useState({
    medicos: 0,
    tutores: 0,
    mascotas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('home');
  const [newEspecialidadName, setNewEspecialidadName] = useState('');
  const [creatingEspecialidad, setCreatingEspecialidad] = useState(false);
  const [showCreateMedicoForm, setShowCreateMedicoForm] = useState(false);
  const [medicoForm, setMedicoForm] = useState({
    nombreUsr: '',
    apellidoUsr: '',
    correoUsr: '',
    passUsr: '',
    telefonoUsr: '',
    runVet: '',
    dvVet: '',
    especialidadesIds: [] as number[],
  });
  const [creatingMedico, setCreatingMedico] = useState(false);

  // Clinic scheduling settings state
  const [clinicSettings, setClinicSettings] = useState({
    appointmentDurationMin: 30,
    workingDaysPerWeek: 5,
    weeklyWorkingHours: 40,
  });

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const handleClinicSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClinicSettings(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // Calculate daily blocks
  const calculateDailyBlocks = () => {
    const { appointmentDurationMin, workingDaysPerWeek, weeklyWorkingHours } = clinicSettings;
    if (workingDaysPerWeek <= 0 || appointmentDurationMin <= 0) return 0;
    
    const dailyWorkingHours = weeklyWorkingHours / workingDaysPerWeek;
    const dailyWorkingMinutes = dailyWorkingHours * 60;
    return Math.floor(dailyWorkingMinutes / appointmentDurationMin);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar que tiene acceso (está autenticado y tiene rol ADMIN)
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        console.log('DashboardAdmin - Token:', !!token, 'Rol:', userRole);
        
        if (!token) {
          console.warn('No hay token, redirigiendo a login');
          navigate('/login');
          return;
        }

        // Si el rol no es ADMIN, redirigir a home
        if (userRole !== 'ADMIN') {
          console.warn('Acceso denegado: no eres administrador. Rol:', userRole);
          navigate('/home');
          return;
        }

        console.log('Acceso permitido - Cargando datos de admin...');

        // Decodificar token para obtener nombre del usuario
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setAdmin(prev => ({ ...prev, nombre: payload.sub || 'Administrador' }));
            console.log('Admin name:', payload.sub);
          } catch (e) {
            console.error('Error al decodificar el token:', e);
          }
        }

        // Intentar cargar datos del admin si los endpoints existen
        // Si no existen, los dashboards igualmente mostrarán información
        try {
          const adminData = await api.get('/v1/admin/perfil');
          setAdmin(adminData.data);
        } catch (err) {
          console.log('Endpoint /v1/admin/perfil no disponible');
        }

        try {
          const statsData = await api.get('/v1/admin/stats');
          setStats(statsData.data);
        } catch (err) {
          console.log('Endpoint /v1/admin/stats no disponible');
        }

        try {
          const usuariosData = await api.get('/v1/admin/usuarios');
          setUsuarios(usuariosData.data);
        } catch (err) {
          console.log('Endpoint /v1/admin/usuarios no disponible');
        }

        try {
          const mascotasData = await api.get('/v1/admin/mascotas');
          setMascotas(mascotasData.data);
        } catch (err) {
          console.log('Endpoint /v1/admin/mascotas no disponible');
        }

        try {
          const citasData = await api.get('/v1/admin/citas');
          setCitas(citasData.data);
        } catch (err) {
          console.log('Endpoint /v1/admin/citas no disponible');
        }

        // Cargar especialidades
        try {
          const especialidadesData = await api.get('/v1/especialidades');
          setEspecialidades(especialidadesData.data);
          console.log('Especialidades cargadas:', especialidadesData.data);
        } catch (err) {
          console.log('Endpoint /v1/especialidades no disponible');
        }

      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    console.log('Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleAddEspecialidad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEspecialidadName.trim()) {
      alert('Por favor ingresa el nombre de la especialidad');
      return;
    }

    setCreatingEspecialidad(true);
    try {
      console.log('Creando especialidad:', newEspecialidadName);
      const response = await api.post('/v1/especialidades/crear', {
        nombre: newEspecialidadName
      });
      
      console.log('Especialidad creada:', response.data);
      setEspecialidades([...especialidades, response.data]);
      setNewEspecialidadName('');
      alert('✓ Especialidad agregada correctamente');
    } catch (err: any) {
      console.error('Error al crear especialidad:', err);
      alert('Error al agregar especialidad: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingEspecialidad(false);
    }
  };

  const handleCreateMedicoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMedicoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEspecialidadToggle = (id: number) => {
    setMedicoForm(prev => {
      const ids = prev.especialidadesIds;
      if (ids.includes(id)) {
        return { ...prev, especialidadesIds: ids.filter(eId => eId !== id) };
      } else {
        return { ...prev, especialidadesIds: [...ids, id] };
      }
    });
  };

  const handleCreateMedicoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMedico(true);
    try {
      const payload = {
        ...medicoForm,
        runVet: parseInt(medicoForm.runVet, 10),
      };
      await api.post('/v1/veterinarios/registrar', payload);
      alert('✓ Médico creado exitosamente');
      setShowCreateMedicoForm(false);
      setMedicoForm({
        nombreUsr: '',
        apellidoUsr: '',
        correoUsr: '',
        passUsr: '',
        telefonoUsr: '',
        runVet: '',
        dvVet: '',
        especialidadesIds: [],
      });
      // Recargar usuarios
      try {
        const usuariosData = await api.get('/v1/admin/usuarios');
        setUsuarios(usuariosData.data);
      } catch (err) {
        console.log('Error al recargar usuarios');
      }
    } catch (err: any) {
      console.error('Error al crear médico:', err);
      alert('Error al crear médico: ' + (err.response?.data?.error || err.response?.data || err.message));
    } finally {
      setCreatingMedico(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>NodeVet</div>
        <nav className="nav-tabs">
          <button 
            className="nav-tab"
            onClick={() => navigate('/dashboard/admin')}
            title="Panel de Administrador"
          >
            🔐 Administrador
          </button>
        </nav>
        <div className="user-section">
          <span className="notification">🔔</span>
          <span className="username">{admin.nombre}</span>
          <button className="user-menu" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Menú</h3>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentSection('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-item ${currentSection === 'usuarios' ? 'active' : ''}`}
              onClick={() => setCurrentSection('usuarios')}
            >
              👥 Usuarios
            </button>
            <button 
              className={`nav-item ${currentSection === 'mascotas' ? 'active' : ''}`}
              onClick={() => setCurrentSection('mascotas')}
            >
              🐾 Mascotas
            </button>
            <button 
              className={`nav-item ${currentSection === 'citas' ? 'active' : ''}`}
              onClick={() => setCurrentSection('citas')}
            >
              📅 Citas
            </button>
            <button 
              className={`nav-item ${currentSection === 'especialidades' ? 'active' : ''}`}
              onClick={() => setCurrentSection('especialidades')}
            >
              🩺 Especialidades
            </button>
            <button 
              className={`nav-item ${currentSection === 'configuracion' ? 'active' : ''}`}
              onClick={() => setCurrentSection('configuracion')}
            >
              ⚙️ Configuración
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              {/* HOME SECTION */}
              {currentSection === 'home' && (
                <section className="dashboard-section">
                  <h2>Dashboard</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-icon">⚕️</span>
                      <h4>Médicos</h4>
                      <p className="stat-number">{stats.medicos}</p>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">👤</span>
                      <h4>Tutores</h4>
                      <p className="stat-number">{stats.tutores}</p>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🐾</span>
                      <h4>Mascotas</h4>
                      <p className="stat-number">{stats.mascotas}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* USUARIOS SECTION */}
              {currentSection === 'usuarios' && (
                <section className="dashboard-section">
                  <h2>Gestión de Usuarios</h2>
                  <div className="action-buttons">
                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowCreateMedicoForm(!showCreateMedicoForm)}
                    >
                      {showCreateMedicoForm ? 'Cancelar Creación' : 'Crear Médico'}
                    </button>
                    <button className="btn-secondary">Listar</button>
                    <button className="btn-secondary">Modificar</button>
                    <button className="btn-secondary">Eliminar</button>
                  </div>

                  {showCreateMedicoForm && (
                    <div style={{
                      backgroundColor: '#f9f9f9',
                      padding: '20px',
                      borderRadius: '8px',
                      marginTop: '20px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <h3>Registrar Nuevo Médico (Veterinario)</h3>
                      <form onSubmit={handleCreateMedicoSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
                          <input type="text" name="nombreUsr" value={medicoForm.nombreUsr} onChange={handleCreateMedicoChange} required style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Apellido:</label>
                          <input type="text" name="apellidoUsr" value={medicoForm.apellidoUsr} onChange={handleCreateMedicoChange} required style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
                          <input type="email" name="correoUsr" value={medicoForm.correoUsr} onChange={handleCreateMedicoChange} required style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
                          <input type="password" name="passUsr" value={medicoForm.passUsr} onChange={handleCreateMedicoChange} required style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono:</label>
                          <input type="text" name="telefonoUsr" value={medicoForm.telefonoUsr} onChange={handleCreateMedicoChange} required style={inputStyle} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>RUN (sin dígito ni puntos):</label>
                            <input type="number" name="runVet" value={medicoForm.runVet} onChange={handleCreateMedicoChange} required style={inputStyle} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>DV:</label>
                            <input type="text" name="dvVet" value={medicoForm.dvVet} onChange={handleCreateMedicoChange} required maxLength={1} style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Especialidades:</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                            {especialidades.map(esp => (
                              <label key={esp.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fff', padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={medicoForm.especialidadesIds.includes(esp.id)}
                                  onChange={() => handleEspecialidadToggle(esp.id)}
                                />
                                {esp.nombre}
                              </label>
                            ))}
                            {especialidades.length === 0 && <span style={{ color: '#666', fontSize: '0.9em' }}>No hay especialidades registradas.</span>}
                          </div>
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                          <button 
                            type="submit" 
                            disabled={creatingMedico}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: creatingMedico ? 'not-allowed' : 'pointer',
                              opacity: creatingMedico ? 0.6 : 1,
                              width: '100%',
                              fontWeight: 'bold'
                            }}
                          >
                            {creatingMedico ? 'Guardando...' : 'Guardar Médico'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {!showCreateMedicoForm && (
                    <table className="data-table" style={{ marginTop: '20px' }}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Rol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length > 0 ? (
                          usuarios.map((usuario, index) => (
                            <tr key={usuario.id || index}>
                              <td>{usuario.nombre}</td>
                              <td>{usuario.email}</td>
                              <td>{usuario.telefono}</td>
                              <td>{usuario.tipo}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                              No hay usuarios registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </section>
              )}

              {/* CITAS SECTION */}
              {currentSection === 'citas' && (
                <section className="dashboard-section">
                  <h2>Gestión de Citas</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Tutor</th>
                        <th>Médico</th>
                        <th>Tipo Consulta</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citas.length > 0 ? (
                        citas.map((cita) => (
                          <tr key={cita.id}>
                            <td>{cita.mascota}</td>
                            <td>{cita.tutor}</td>
                            <td>{cita.medico}</td>
                            <td>{cita.tipoConsulta}</td>
                            <td>{cita.fecha}</td>
                            <td>
                              <span className={`status ${cita.estado.toLowerCase()}`}>
                                {cita.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                            No hay citas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {/* MASCOTAS SECTION */}
              {currentSection === 'mascotas' && (
                <section className="dashboard-section">
                  <h2>Gestión de Mascotas</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Mascota</th>
                        <th>Tutor</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotas.length > 0 ? (
                        mascotas.map((mascota) => (
                          <tr key={mascota.id}>
                            <td>{mascota.id}</td>
                            <td>{mascota.nombre}</td>
                            <td>{mascota.tutor}</td>
                            <td>{mascota.fecha}</td>
                            <td>
                              <span className={`status ${mascota.estado.toLowerCase()}`}>
                                {mascota.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                            No hay mascotas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {/* ESPECIALIDADES SECTION */}
              {currentSection === 'especialidades' && (
                <section className="dashboard-section">
                  <h2>Gestión de Especialidades</h2>
                  
                  {/* Formulario para agregar nueva especialidad */}
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3>Agregar Nueva Especialidad</h3>
                    <form onSubmit={handleAddEspecialidad} style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Nombre de la especialidad (ej: Oncología, Peluquería, etc.)"
                        value={newEspecialidadName}
                        onChange={(e) => setNewEspecialidadName(e.target.value)}
                        disabled={creatingEspecialidad}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <button 
                        type="submit" 
                        disabled={creatingEspecialidad}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: creatingEspecialidad ? 'not-allowed' : 'pointer',
                          opacity: creatingEspecialidad ? 0.6 : 1
                        }}
                      >
                        {creatingEspecialidad ? 'Agregando...' : '+ Agregar'}
                      </button>
                    </form>
                  </div>

                  {/* Lista de especialidades */}
                  <div>
                    <h3>Especialidades Registradas ({especialidades.length})</h3>
                    {especialidades.length > 0 ? (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {especialidades.map((especialidad) => (
                            <tr key={especialidad.id}>
                              <td>{especialidad.id}</td>
                              <td>{especialidad.nombre}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ 
                        textAlign: 'center', 
                        padding: '20px',
                        color: '#999',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px'
                      }}>
                        No hay especialidades registradas aún. ¡Agrega la primera!
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* CONFIGURACIÓN SECTION */}
              {currentSection === 'configuracion' && (
                <section className="dashboard-section">
                  <h2>Configuración de Horarios de la Clínica</h2>
                  
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e0e0e0',
                    display: 'grid',
                    gap: '20px',
                    gridTemplateColumns: '1fr 1fr'
                  }}>
                    <div>
                      <h3>Parámetros Generales</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Duración por Cita (minutos):</label>
                          <input 
                            type="number" 
                            name="appointmentDurationMin" 
                            value={clinicSettings.appointmentDurationMin} 
                            onChange={handleClinicSettingsChange} 
                            min="1"
                            style={inputStyle} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Días Laborales por Semana:</label>
                          <input 
                            type="number" 
                            name="workingDaysPerWeek" 
                            value={clinicSettings.workingDaysPerWeek} 
                            onChange={handleClinicSettingsChange} 
                            min="1"
                            max="7"
                            style={inputStyle} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px' }}>Horas Abiertas por Semana:</label>
                          <input 
                            type="number" 
                            name="weeklyWorkingHours" 
                            value={clinicSettings.weeklyWorkingHours} 
                            onChange={handleClinicSettingsChange} 
                            min="1"
                            max="168"
                            style={inputStyle} 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px dashed #ccc'
                    }}>
                      <h3 style={{ color: '#555', marginBottom: '10px' }}>Bloques Horarios Calculados</h3>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
                        {calculateDailyBlocks()}
                      </div>
                      <p style={{ color: '#777', marginTop: '10px', textAlign: 'center' }}>
                        Bloques de citas disponibles por cada día laboral.
                      </p>
                      <p style={{ color: '#999', fontSize: '12px', marginTop: '5px', textAlign: 'center' }}>
                        Basado en {(clinicSettings.weeklyWorkingHours / Math.max(1, clinicSettings.workingDaysPerWeek)).toFixed(1)} horas de trabajo al día.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}