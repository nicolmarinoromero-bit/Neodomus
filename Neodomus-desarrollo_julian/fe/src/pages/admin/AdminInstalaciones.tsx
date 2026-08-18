import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarCheck,
  FaCircleInfo,
  FaTriangleExclamation,
  FaCircleCheck,
  FaMoneyBillWave,
  FaMagnifyingGlass,
} from 'react-icons/fa6';
import '@styles/admin-panel.css';
import '@styles/dashboard-admin.css';
import api from '@services/api';
import type { CitaAdmin, TecnicoAdmin, TarifaServicio } from '../../types';
import { nombreCompleto } from '@utils/formatoNombre';

const ESTADOS = ['Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'];

const CLASE_ESTADO: Record<string, string> = {
  Pendiente: 'warn',
  Confirmada: 'info',
  Finalizada: 'ok',
  Cancelada: 'err',
};

const CLASE_PAGO: Record<string, string> = {
  aprobado: 'ok',
  pagado: 'ok',
  pendiente: 'warn',
  rechazado: 'err',
};

const formatoPeso = (value: number) =>
  value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const NOMBRE_SERVICIO: Record<string, string> = {
  instalacion: 'Instalación',
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  revision: 'Revisión técnica',
  soporte: 'Soporte técnico',
};

const normalizar = (s?: string | null) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const SERVICIO_KEYWORDS: Record<string, string[]> = {
  instalacion: [
    'instalacion', 'domotica', 'automatizacion', 'cableado', 'redes',
    'electrico', 'electrica', 'electronica', 'hogar', 'iot',
  ],
  mantenimiento: [
    'mantenimiento', 'preventivo', 'soporte', 'servidores',
    'bases de datos', 'sistemas', 'iot', 'redes',
  ],
  reparacion: [
    'reparacion', 'diagnostico', 'programacion', 'plc', 'backend',
    'informatica', 'seguridad', 'sistemas', 'electronica',
  ],
  revision: [
    'revision', 'diagnostico', 'supervision', 'control', 'seguridad', 'sistemas',
  ],
  soporte: [
    'soporte', 'asistencia', 'ayuda', 'configuracion',
    'sistemas', 'software', 'informatica', 'redes', 'mesa',
  ],
};

const esCompatible = (tipoServicio: string, certificacion?: string | null) => {
  const palabras = SERVICIO_KEYWORDS[normalizar(tipoServicio)];
  if (!palabras) return true;
  const cert = normalizar(certificacion);
  return palabras.some((p) => cert.includes(p));
};

const AdminInstalaciones = () => {
  const [citas, setCitas] = useState<CitaAdmin[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoAdmin[]>([]);
  const [tarifas, setTarifas] = useState<TarifaServicio[]>([]);
  const [edicionTarifas, setEdicionTarifas] = useState<Record<string, string>>({});
  const [guardandoTarifa, setGuardandoTarifa] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [edicionComision, setEdicionComision] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'err' } | null>(null);

  const POR_PAGINA = 6;

  const cargar = async () => {
    setCargando(true);
    setError(false);
    try {
      const [res, resT, resTar] = await Promise.all([
        api.get<CitaAdmin[]>('/citas/all-admin'),
        api.get<TecnicoAdmin[]>('/tecnicos'),
        api.get<TarifaServicio[]>('/tarifas'),
      ]);
      setCitas(res.data || []);
      setTecnicos(resT.data || []);
      setTarifas(resTar.data || []);
    } catch {
      setError(true);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const notify = (msg: string, tipo: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tipo });
    window.setTimeout(() => setToast(null), 3200);
  };

  const guardarTarifa = async (tipo: string) => {
    const valor = Number((edicionTarifas[tipo] ?? '').replace(/\./g, '').replace(',', '.'));
    if (!valor || valor <= 0) {
      notify('El costo debe ser un número mayor a cero', 'err');
      return;
    }
    setGuardandoTarifa(tipo);
    try {
      const res = await api.put<TarifaServicio>(`/tarifas/${tipo}`, { costo: valor });
      setTarifas((prev) => prev.map((t) => (t.tipo_servicio === tipo ? res.data : t)));
      setEdicionTarifas((prev) => {
        const copia = { ...prev };
        delete copia[tipo];
        return copia;
      });
      notify('Tarifa actualizada correctamente');
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo actualizar la tarifa', 'err');
    } finally {
      setGuardandoTarifa(null);
    }
  };

  const actualizar = async (
    cita: CitaAdmin,
    cambios: {
      estado?: string;
      id_tecnico?: number | null;
      id_comision_c?: number | null;
      comision_porcentaje?: number;
      comision_valor?: number;
    },
  ) => {
    setGuardandoId(cita.id_cita);
    try {
      const payload: Record<string, unknown> = {};
      if (cambios.estado !== undefined) payload.estado = cambios.estado;
      if (cambios.id_tecnico !== undefined) {
        payload.id_tecnico = cambios.id_tecnico;
        const t = tecnicos.find((x) => x.id_tecnico === cambios.id_tecnico);
        payload.nombre_tecnico = t ? nombreCompleto(t.first_name, t.last_name) : null;
      }
      if (cambios.comision_porcentaje !== undefined) payload.comision_porcentaje = cambios.comision_porcentaje;
      if (cambios.comision_valor !== undefined) payload.comision_valor = cambios.comision_valor;
      if (cambios.id_comision_c !== undefined) payload.id_comision_c = cambios.id_comision_c;
      const res = await api.put<CitaAdmin>(`/citas/admin/${cita.id_cita}`, payload);
      setCitas((prev) => prev.map((c) => (c.id_cita === cita.id_cita ? res.data : c)));
      setEdicionComision((prev) => {
        const copia = { ...prev };
        delete copia[cita.id_cita];
        return copia;
      });
      notify(
        cambios.id_comision_c === null
          ? 'Comisión retirada de la cita'
          : 'Comisión aplicada a la cita',
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      notify(typeof msg === 'string' ? msg : 'No se pudo actualizar la cita', 'err');
    } finally {
      setGuardandoId(null);
    }
  };

  const guardarComision = async (cita: CitaAdmin) => {
    const pct = Number((edicionComision[cita.id_cita] ?? '').replace(',', '.'));
    if (!pct || pct <= 0) {
      notify('El porcentaje debe ser un número mayor a cero', 'err');
      return;
    }
    await actualizar(cita, { comision_porcentaje: pct });
  };

  const q = busqueda.trim().toLowerCase();
  const filtradas = citas.filter((c) => {
    if (filtro !== 'todas' && c.estado !== filtro) return false;
    if (!q) return true;
    return `${c.cliente_nombre || ''} ${c.cliente_email || ''} ${c.tipo_servicio || ''} ${c.nombre_tecnico || ''} ${c.direccion || ''} ${c.descripcion || ''} ${c.estado_pago || ''} ${c.metodo_pago || ''} ${c.numero_transaccion || ''}`
      .toLowerCase()
      .includes(q);
  });
  const contadores = ESTADOS.reduce<Record<string, number>>((acc, e) => {
    acc[e] = citas.filter((c) => c.estado === e).length;
    return acc;
  }, {});

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const citasPagina = filtradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const formatTecnico = (t: TecnicoAdmin) => `${t.first_name || ''} ${t.last_name || ''}`.trim().toUpperCase();

  const formatFecha = (f: string) => {
    try {
      return new Date(`${f}T00:00:00`).toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return f;
    }
  };

  return (
    <motion.section
      className="admin-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Citas</h1>
          <p className="ap-subtitle">
            {citas.length > 0
              ? `${citas.length} citas agendadas por los clientes`
              : 'Citas de instalación y servicio agendadas por los usuarios.'}
          </p>
        </div>
      </div>

      <div className="ap-pills">
        <button
          type="button"
          className={`ap-pill ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => {
            setFiltro('todas');
            setPagina(1);
          }}
        >
          Todas <span className="ap-pill-count">{citas.length}</span>
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e}
            type="button"
            className={`ap-pill ${filtro === e ? 'active' : ''}`}
            onClick={() => {
              setFiltro(e);
              setPagina(1);
            }}
          >
            {e} <span className="ap-pill-count">{contadores[e] || 0}</span>
          </button>
        ))}
      </div>

      <div className="ap-toolbar" style={{ marginBottom: 16 }}>
        <form className="ap-search" onSubmit={(e) => e.preventDefault()}>
          <FaMagnifyingGlass />
          <input
            type="text"
            placeholder="Buscar cita..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
        </form>
      </div>

      {cargando ? (
        <div className="ap-card">
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>Cargando citas</h3>
            <p>Consultando las citas agendadas...</p>
          </div>
        </div>
      ) : (
        <div className="ap-card ap-tarifas-card">
          <div className="ap-card-head">
            <h3><FaMoneyBillWave /> Tarifas de servicio</h3>
            <p>Costos fijos que se cobran al agendar cada tipo de cita.</p>
          </div>
          <div className="ap-tarifas-grid">
            {tarifas.map((t) => (
              <div className="ap-tarifa-item" key={t.tipo_servicio}>
                <span className="ap-tarifa-nombre">
                  {NOMBRE_SERVICIO[t.tipo_servicio] || t.tipo_servicio}
                </span>
                {edicionTarifas[t.tipo_servicio] !== undefined ? (
                  <div className="ap-tarifa-editar">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="ap-form-input"
                      value={edicionTarifas[t.tipo_servicio]}
                      onChange={(e) =>
                        setEdicionTarifas((prev) => ({ ...prev, [t.tipo_servicio]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') guardarTarifa(t.tipo_servicio);
                        if (e.key === 'Escape') {
                          setEdicionTarifas((prev) => {
                            const copia = { ...prev };
                            delete copia[t.tipo_servicio];
                            return copia;
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ap-btn ap-btn-primary"
                      disabled={guardandoTarifa === t.tipo_servicio}
                      onClick={() => guardarTarifa(t.tipo_servicio)}
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="ap-tarifa-valor">
                    <strong>{formatoPeso(t.costo)}</strong>
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      onClick={() => setEdicionTarifas((prev) => ({ ...prev, [t.tipo_servicio]: String(t.costo) }))}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="ap-card">
          <div className="ap-states error">
            <div className="ap-states-icon">
              <FaCircleInfo />
            </div>
            <h3>No se pudieron cargar las citas</h3>
            <p>Verifica tu conexión e inténtalo nuevamente.</p>
            <button type="button" className="ap-btn ap-btn-ghost" onClick={cargar}>
              Reintentar
            </button>
          </div>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="ap-card">
          <div className="ap-states">
            <div className="ap-states-icon">
              <FaCalendarCheck />
            </div>
            <h3>
              {q
                ? 'Sin resultados'
                : filtro === 'todas'
                  ? 'No hay citas registradas'
                  : `Sin citas ${filtro.toLowerCase()}`}
            </h3>
            <p>
              {q
                ? 'No hay citas que coincidan con la búsqueda.'
                : filtro === 'todas'
                  ? 'Cuando los clientes agenden una instalación o servicio, aparecerá aquí.'
                  : `No existen citas con estado "${filtro}".`}
            </p>
          </div>
        </div>
      ) : (
        <div className="ap-grid">
          {citasPagina.map((cita) => (
            <div className="ap-grid-item" key={cita.id_cita}>
              <div className="ap-grid-item-top">
                <span className="ap-initials">
                  {(cita.cliente_nombre || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className={`ap-badge ${CLASE_ESTADO[cita.estado] || 'neutral'}`}>{cita.estado}</span>
              </div>
              <div>
                <h3>{cita.cliente_nombre || 'Cliente'}</h3>
                <p>{cita.cliente_email}</p>
              </div>

              <div className="ap-def-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                <div className="ap-def">
                  <div className="ap-def-label">Servicio</div>
                  <div className="ap-def-value">{cita.tipo_servicio}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Fecha</div>
                  <div className="ap-def-value">{formatFecha(cita.fecha)}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Hora</div>
                  <div className="ap-def-value">{cita.hora}</div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Pago</div>
                  <div className="ap-def-value">
                    {cita.costo_cita != null ? formatoPeso(cita.costo_cita) : '—'}
                    {cita.estado_pago && (
                      <span
                        className={`ap-badge ${CLASE_PAGO[cita.estado_pago] || 'neutral'}`}
                        style={{ marginLeft: 8 }}
                      >
                        {cita.estado_pago}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ap-def">
                  <div className="ap-def-label">Comisión</div>
                  <div className="ap-def-value">
                    {cita.comision_valor != null ? (
                      <>
                        <span className="ap-badge ok">
                          {cita.comision_porcentaje != null ? `${cita.comision_porcentaje}%` : 'Comisión'}
                        </span>
                        <span style={{ marginLeft: 6 }}>
                          {formatoPeso(cita.comision_valor)}
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
                {cita.metodo_pago && (
                  <div className="ap-def">
                    <div className="ap-def-label">Método</div>
                    <div className="ap-def-value" style={{ fontSize: '0.8rem' }}>
                      {cita.metodo_pago.replace(/_/g, ' ')}
                    </div>
                  </div>
                )}
                {cita.numero_transaccion && (
                  <div className="ap-def">
                    <div className="ap-def-label">Transacción</div>
                    <div className="ap-def-value" style={{ fontSize: '0.78rem' }}>
                      {cita.numero_transaccion}
                    </div>
                  </div>
                )}
                <div className="ap-def full">
                  <div className="ap-def-label">Dirección</div>
                  <div className="ap-def-value" style={{ fontSize: '0.82rem' }}>
                    {cita.direccion}
                  </div>
                </div>
                {cita.descripcion && (
                  <div className="ap-def full">
                    <div className="ap-def-label">Descripción</div>
                    <div className="ap-def-value" style={{ fontSize: '0.82rem' }}>
                      {cita.descripcion}
                    </div>
                  </div>
                )}
              </div>

              <div className="ap-form-grid" style={{ marginTop: 8 }}>
                <div className="ap-form-group">
                  <label className="ap-form-label">Estado</label>
                  <select
                    className="ap-form-select"
                    value={cita.estado}
                    disabled={guardandoId === cita.id_cita}
                    onChange={(e) => actualizar(cita, { estado: e.target.value })}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ap-form-group">
                  <label className="ap-form-label">Técnico asignado</label>
                  <select
                    className="ap-form-select"
                    value={cita.id_tecnico?.toString() || ''}
                    disabled={guardandoId === cita.id_cita}
                    onChange={(e) =>
                      actualizar(cita, { id_tecnico: e.target.value ? parseInt(e.target.value, 10) : null })
                    }
                  >
                    <option value="">Sin asignar</option>
                    {tecnicos
                      .filter(
                        (t) =>
                          esCompatible(cita.tipo_servicio, t.certificacion_t) ||
                          t.id_tecnico === cita.id_tecnico,
                      )
                      .map((t) => (
                        <option key={t.id_tecnico} value={t.id_tecnico}>
                          {formatTecnico(t)}
                          {esCompatible(cita.tipo_servicio, t.certificacion_t) ? '' : ' (sin especialidad)'}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="ap-comision" style={{ marginTop: 12 }}>
                {cita.comision_valor != null ? (
                  <>
                    <span className="ap-badge ok">
                      {cita.comision_porcentaje != null
                        ? `${cita.comision_porcentaje}%`
                        : 'Comisión'}{' '}
                      · {formatoPeso(cita.comision_valor)}
                    </span>
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      disabled={guardandoId === cita.id_cita}
                      onClick={() =>
                        setEdicionComision((prev) => ({
                          ...prev,
                          [cita.id_cita]: String(cita.comision_porcentaje ?? 5),
                        }))
                      }
                    >
                      Cambiar %
                    </button>
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      disabled={guardandoId === cita.id_cita}
                      onClick={() => actualizar(cita, { id_comision_c: null })}
                    >
                      Quitar
                    </button>
                  </>
                ) : edicionComision[cita.id_cita] !== undefined ? (
                  <>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="ap-form-input"
                      style={{ width: 90 }}
                      placeholder="%"
                      value={edicionComision[cita.id_cita]}
                      disabled={guardandoId === cita.id_cita}
                      onChange={(e) =>
                        setEdicionComision((prev) => ({ ...prev, [cita.id_cita]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') guardarComision(cita);
                        if (e.key === 'Escape') {
                          setEdicionComision((prev) => {
                            const copia = { ...prev };
                            delete copia[cita.id_cita];
                            return copia;
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ap-btn ap-btn-primary"
                      disabled={guardandoId === cita.id_cita}
                      onClick={() => guardarComision(cita)}
                    >
                      Aplicar
                    </button>
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost"
                      disabled={guardandoId === cita.id_cita}
                      onClick={() =>
                        setEdicionComision((prev) => {
                          const copia = { ...prev };
                          delete copia[cita.id_cita];
                          return copia;
                        })
                      }
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="ap-btn ap-btn-primary"
                    disabled={guardandoId === cita.id_cita}
                    onClick={() =>
                      setEdicionComision((prev) => ({ ...prev, [cita.id_cita]: '5' }))
                    }
                  >
                    Agregar comisión
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!cargando && !error && totalPaginas > 1 && (
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

      {toast && (
        <div className={`ap-toast ${toast.tipo}`}>
          {toast.tipo === 'ok' ? <FaCircleCheck /> : <FaTriangleExclamation />}
          {toast.msg}
        </div>
      )}
    </motion.section>
  );
};

export default AdminInstalaciones;