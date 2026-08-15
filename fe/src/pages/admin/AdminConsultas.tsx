import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  FaCircleCheck,
  FaRotate,
  FaTriangleExclamation,
  FaUser,
  FaEnvelope,
  FaCalendarDays,
  FaUserSlash,
  FaUserCheck,
  FaUserGear,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { ClienteAdmin, SolicitudCuenta, SolicitudEmpleado, TecnicoAdmin } from '../../types';

type Vista = 'solicitudes' | 'cuentas';

type SolicitudCombinada =
  | { fuente: 'cliente'; data: SolicitudCuenta }
  | { fuente: 'empleado'; data: SolicitudEmpleado };

const AdminConsultas = () => {
  const location = useLocation();
  const [vista, setVista] = useState<Vista>('solicitudes');
  const [solicitudes, setSolicitudes] = useState<SolicitudCuenta[]>([]);
  const [solicitudesEmpleados, setSolicitudesEmpleados] = useState<SolicitudEmpleado[]>([]);
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [resolviendo, setResolviendo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaCuentas, setBusquedaCuentas] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [pagina, setPagina] = useState(1);

  const POR_PAGINA = 6;

  const cargarSolicitudes = async () => {
    try {
      const [clientesRes, empleadosRes] = await Promise.all([
        api.get<SolicitudCuenta[]>('/admin/account-requests'),
        api.get<SolicitudEmpleado[]>('/admin/account-requests/empleados'),
      ]);
      setSolicitudes(clientesRes.data || []);
      setSolicitudesEmpleados(empleadosRes.data || []);
    } catch {
      /* silencioso */
    }
  };

  const cargarCuentas = async () => {
    try {
      const [clientesRes, tecnicosRes] = await Promise.all([
        api.get<ClienteAdmin[]>('/clients'),
        api.get<TecnicoAdmin[]>('/tecnicos'),
      ]);
      setClientes(clientesRes.data || []);
      setTecnicos(tecnicosRes.data || []);
    } catch {
      /* silencioso */
    }
  };

  const cargarTodo = async () => {
    setCargando(true);
    await Promise.all([cargarSolicitudes(), cargarCuentas()]);
    setCargando(false);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      cargarSolicitudes();
      cargarCuentas();
    }, 30000);
    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (location.hash === '#solicitudes-cuenta') {
      setVista('cuentas');
      const el = document.getElementById('solicitudes-cuenta');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, filtroTipo]);

  const notify = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const resolver = async (id: number, accion: 'aprobar' | 'rechazar') => {
    setResolviendo(`cliente-${id}`);
    try {
      await api.put(`/admin/account-requests/${id}/${accion}`);
      await cargarSolicitudes();
      await cargarCuentas();
      notify(accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada');
      window.dispatchEvent(new CustomEvent('admin-solicitudes-updated'));
    } catch (err: any) {
      notify(err.response?.data?.detail || 'No se pudo procesar la solicitud', 'err');
    } finally {
      setResolviendo(null);
    }
  };

  const resolverEmpleado = async (id: number, accion: 'aprobar' | 'rechazar') => {
    setResolviendo(`emp-${id}`);
    try {
      await api.put(`/admin/account-requests/empleados/${id}/${accion}`);
      await cargarSolicitudes();
      await cargarCuentas();
      notify(accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada');
      window.dispatchEvent(new CustomEvent('admin-solicitudes-updated'));
    } catch (err: any) {
      notify(err.response?.data?.detail || 'No se pudo procesar la solicitud', 'err');
    } finally {
      setResolviendo(null);
    }
  };

  const habilitarCliente = async (id: number) => {
    setResolviendo(`cliente-${id}`);
    try {
      await api.put(`/clients/${id}/habilitar`);
      await cargarCuentas();
      notify('Cuenta del cliente habilitada correctamente');
      window.dispatchEvent(new CustomEvent('admin-solicitudes-updated'));
    } catch (err: any) {
      notify(err.response?.data?.detail || 'No se pudo habilitar la cuenta', 'err');
    } finally {
      setResolviendo(null);
    }
  };

  const habilitarTecnico = async (id: number) => {
    setResolviendo(`tecnico-${id}`);
    try {
      await api.put(`/users/${id}`, { is_active: true });
      await cargarCuentas();
      notify('Cuenta del técnico habilitada correctamente');
    } catch (err: any) {
      notify(err.response?.data?.detail || 'No se pudo habilitar la cuenta', 'err');
    } finally {
      setResolviendo(null);
    }
  };

  const solicitudesCombinadas: SolicitudCombinada[] = [
    ...solicitudes.map((s) => ({ fuente: 'cliente' as const, data: s })),
    ...solicitudesEmpleados.map((s) => ({ fuente: 'empleado' as const, data: s })),
  ].sort(
    (a, b) =>
      Date.parse(b.data.created_at || '') - Date.parse(a.data.created_at || ''),
  );

  const q = busqueda.trim().toLowerCase();
  const solicitudesFiltradas = solicitudesCombinadas.filter((item) => {
    if (filtroTipo !== 'todos') {
      if (filtroTipo === 'empleado') {
        if (item.fuente !== 'empleado') return false;
      } else if (item.fuente === 'empleado' || item.data.tipo !== filtroTipo) {
        return false;
      }
    }
    if (!q) return true;
    const nombre = item.fuente === 'empleado' ? item.data.empleado_nombre : item.data.cliente_nombre;
    const email = item.fuente === 'empleado' ? item.data.empleado_email : item.data.cliente_email;
    const motivo = item.fuente === 'cliente' ? item.data.motivo || '' : '';
    return `${nombre} ${email} ${motivo}`.toLowerCase().includes(q);
  });

  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const solicitudesVisibles = solicitudesFiltradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const pendientesCuenta =
    solicitudes.filter((s) => s.estado === 'pendiente').length +
    solicitudesEmpleados.filter((s) => s.estado === 'pendiente').length;

  const clientesInhabilitados = clientes.filter((c) => !c.is_active);
  const tecnicosInhabilitados = tecnicos.filter((t) => !t.is_active);
  const totalInhabilitadas = clientesInhabilitados.length + tecnicosInhabilitados.length;

  const qc = busquedaCuentas.trim().toLowerCase();
  const clientesInhabilitadosFiltrados = qc
    ? clientesInhabilitados.filter((c) =>
        `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''}`.toLowerCase().includes(qc),
      )
    : clientesInhabilitados;
  const tecnicosInhabilitadosFiltrados = qc
    ? tecnicosInhabilitados.filter((t) =>
        `${t.first_name || ''} ${t.last_name || ''} ${t.email || ''}`.toLowerCase().includes(qc),
      )
    : tecnicosInhabilitados;

  const fechaLegible = (fecha?: string | null) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const nombreCompleto = (nombre: string, apellido?: string) =>
    `${nombre} ${apellido || ''}`.trim();

  const renderTarjetaSolicitud = (item: SolicitudCombinada) => {
    if (item.fuente === 'empleado') {
      const s = item.data;
      const key = `emp-${s.id}`;
      return (
        <article className="scu-card" key={key}>
          <div className="scu-card-top">
            <span className="scu-tipo">
              <FaUserGear /> Habilitación de cuenta de técnico
            </span>
            <span className="scu-estado pendiente">Pendiente</span>
          </div>
          <div className="scu-datos">
            <span className="scu-dato"><FaUser /> {s.empleado_nombre}</span>
            <span className="scu-dato"><FaEnvelope /> {s.empleado_email}</span>
            <span className="scu-dato"><FaCalendarDays /> {fechaLegible(s.created_at)}</span>
          </div>
          <div className="scu-acciones">
            <button
              type="button"
              className="solicitud-btn ok"
              disabled={resolviendo === key}
              onClick={() => resolverEmpleado(s.id, 'aprobar')}
            >
              <FaCircleCheck /> Aprobar
            </button>
            <button
              type="button"
              className="solicitud-btn no"
              disabled={resolviendo === key}
              onClick={() => resolverEmpleado(s.id, 'rechazar')}
            >
              <FaUserCheck /> Rechazar
            </button>
          </div>
        </article>
      );
    }

    const s = item.data;
    const key = `cliente-${s.id}`;
    const esPendiente = s.estado === 'pendiente';
    return (
      <article className="scu-card" key={key}>
        <div className="scu-card-top">
          <span className="scu-tipo">
            {s.tipo === 'habilitar' ? <FaUserCheck /> : <FaUserSlash />}
            {s.tipo === 'habilitar' ? 'Habilitación de cuenta' : 'Inhabilitación de cuenta'}
          </span>
          <span className={`scu-estado ${esPendiente ? 'pendiente' : 'activa'}`}>
            {esPendiente ? 'Pendiente' : s.estado}
          </span>
        </div>
        <div className="scu-datos">
          <span className="scu-dato"><FaUser /> {s.cliente_nombre}</span>
          <span className="scu-dato"><FaEnvelope /> {s.cliente_email}</span>
          <span className="scu-dato"><FaCalendarDays /> {fechaLegible(s.created_at)}</span>
        </div>
        {s.motivo && <p className="scu-motivo">{s.motivo}</p>}
        <div className="scu-acciones">
          {esPendiente ? (
            <>
              <button
                type="button"
                className="solicitud-btn ok"
                disabled={resolviendo === key}
                onClick={() => resolver(s.id, 'aprobar')}
              >
                <FaCircleCheck /> Aprobar
              </button>
              <button
                type="button"
                className="solicitud-btn no"
                disabled={resolviendo === key}
                onClick={() => resolver(s.id, 'rechazar')}
              >
                <FaUserCheck /> Rechazar
              </button>
            </>
          ) : (
            <span className={`solicitud-btn ${s.estado === 'aprobada' ? 'ok' : 'no'}`}>
              {s.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'}
            </span>
          )}
        </div>
      </article>
    );
  };

  const renderTarjetaCuentaInhabilitada = (
    id: number,
    nombre: string,
    email: string,
    esTecnico: boolean,
  ) => (
    <article className="scu-card" key={`${esTecnico ? 'tecnico' : 'cliente'}-${id}`}>
      <div className="scu-card-top">
        <span className="scu-tipo">
          {esTecnico ? <FaUserGear /> : <FaUserSlash />}
          {esTecnico ? 'Cuenta de técnico' : 'Cuenta de cliente'}
        </span>
        <span className="scu-estado inhabilitada">Inhabilitada</span>
      </div>
      <div className="scu-datos">
        <span className="scu-dato"><FaUser /> {nombre}</span>
        <span className="scu-dato"><FaEnvelope /> {email}</span>
      </div>
      <div className="scu-acciones">
        <button
          type="button"
          className="solicitud-btn ok"
          disabled={resolviendo === `${esTecnico ? 'tecnico' : 'cliente'}-${id}`}
          onClick={() => (esTecnico ? habilitarTecnico(id) : habilitarCliente(id))}
        >
          <FaCircleCheck /> Habilitar cuenta
        </button>
      </div>
    </article>
  );

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">
            {vista === 'cuentas' ? 'Cuentas inhabilitadas' : 'Solicitudes'}
          </h1>
          <p className="ap-subtitle">
            {vista === 'cuentas'
              ? 'Cuentas de clientes y técnicos inhabilitadas, con opción de habilitarlas nuevamente.'
              : 'Solicitudes de inhabilitación y habilitación de cuentas enviadas por los usuarios.'}
          </p>
        </div>
        <div className="ap-header-right">
          <button
            type="button"
            className="ap-btn ap-btn-ghost"
            onClick={cargarTodo}
            disabled={cargando}
          >
            <FaRotate className={cargando ? 'spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      <div className="ap-tabs" role="tablist" aria-label="Secciones de solicitudes">
        <button
          type="button"
          role="tab"
          aria-selected={vista === 'solicitudes'}
          className={`ap-tab ${vista === 'solicitudes' ? 'active' : ''}`}
          onClick={() => setVista('solicitudes')}
        >
          <FaUserSlash /> Solicitudes
          {pendientesCuenta > 0 && (
            <span className="ap-pill-count">
              {pendientesCuenta}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vista === 'cuentas'}
          className={`ap-tab ${vista === 'cuentas' ? 'active' : ''}`}
          onClick={() => setVista('cuentas')}
        >
          <FaUserCheck /> Cuentas inhabilitadas
          {totalInhabilitadas > 0 && <span className="ap-pill-count">{totalInhabilitadas}</span>}
        </button>
      </div>

      {vista === 'solicitudes' ? (
        <>
          {cargando ? (
            <div className="ap-card">
              <div className="ap-states">
                <span className="ap-loader" />
                <h3>Cargando solicitudes</h3>
                <p>Consultando las solicitudes recibidas...</p>
              </div>
            </div>
          ) : solicitudesCombinadas.length === 0 ? (
            <div className="ap-card">
              <div className="ap-states">
                <div className="ap-states-icon">
                  <FaUserSlash />
                </div>
                <h3>No hay solicitudes</h3>
                <p>Las solicitudes de inhabilitación o habilitación de cuentas llegarán aquí.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="ap-toolbar">
                <input
                  type="search"
                  className="ap-form-input"
                  placeholder="Buscar por nombre, correo o motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <select
                  className="ap-form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="habilitar">Habilitación (cliente)</option>
                  <option value="inhabilitar">Inhabilitación (cliente)</option>
                  <option value="empleado">Habilitación de técnico</option>
                </select>
              </div>
              <div className="solicitudes-list">
                {solicitudesVisibles.map(renderTarjetaSolicitud)}
              </div>
              {solicitudesFiltradas.length === 0 && (
                <div className="ap-card">
                  <div className="ap-states">
                    <div className="ap-states-icon">
                      <FaUserSlash />
                    </div>
                    <h3>Sin resultados</h3>
                    <p>No hay solicitudes que coincidan con la búsqueda o el filtro seleccionado.</p>
                  </div>
                </div>
              )}
              {totalPaginas > 1 && (
                <div className="ap-paginacion">
                  <button
                    type="button"
                    className="ap-page-btn"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina(paginaActual - 1)}
                  >
                    ‹ Anterior
                  </button>
                  <div className="ap-page-nums">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`ap-page-btn ${n === paginaActual ? 'active' : ''}`}
                        onClick={() => setPagina(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="ap-page-btn"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina(paginaActual + 1)}
                  >
                    Siguiente ›
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div id="solicitudes-cuenta">
          {cargando ? (
            <div className="ap-card">
              <div className="ap-states">
                <span className="ap-loader" />
                <h3>Cargando cuentas</h3>
                <p>Consultando las cuentas inhabilitadas...</p>
              </div>
            </div>
          ) : totalInhabilitadas === 0 ? (
            <div className="ap-card">
              <div className="ap-states">
                <div className="ap-states-icon">
                  <FaUserCheck />
                </div>
                <h3>No hay cuentas inhabilitadas</h3>
                <p>Cuando se apruebe una solicitud de inhabilitación, la cuenta aparecerá aquí.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="ap-toolbar">
                <form className="ap-search" onSubmit={(e) => e.preventDefault()}>
                  <FaMagnifyingGlass />
                  <input
                    type="text"
                    placeholder="Buscar cuenta..."
                    value={busquedaCuentas}
                    onChange={(e) => setBusquedaCuentas(e.target.value)}
                  />
                </form>
              </div>
              {clientesInhabilitadosFiltrados.length > 0 && (
                <>
                  <h2 className="ap-section-title">Clientes</h2>
                  <div className="solicitudes-list">
                    {clientesInhabilitadosFiltrados.map((c) =>
                      renderTarjetaCuentaInhabilitada(
                        c.id_cliente,
                        nombreCompleto(c.first_name, c.last_name),
                        c.email,
                        false,
                      ),
                    )}
                  </div>
                </>
              )}
              {tecnicosInhabilitadosFiltrados.length > 0 && (
                <>
                  <h2 className="ap-section-title">Técnicos</h2>
                  <div className="solicitudes-list">
                    {tecnicosInhabilitadosFiltrados.map((t) =>
                      renderTarjetaCuentaInhabilitada(
                        t.id_usuario,
                        nombreCompleto(t.first_name, t.last_name),
                        t.email,
                        true,
                      ),
                    )}
                  </div>
                </>
              )}
              {qc &&
                clientesInhabilitadosFiltrados.length === 0 &&
                tecnicosInhabilitadosFiltrados.length === 0 && (
                  <div className="ap-card">
                    <div className="ap-states">
                      <div className="ap-states-icon">
                        <FaUserCheck />
                      </div>
                      <h3>Sin resultados</h3>
                      <p>No hay cuentas que coincidan con la búsqueda.</p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminConsultas;
