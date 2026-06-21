import { useState, useEffect } from 'react';
import api from '@services/api';
import '@styles/technician-dashboard.css';
import fondoImg from '@assets/images/Fondo2.png';

interface Cita {
  id_cita: number;
  fecha_cita: string;
  hora_cita: string;
  estado: string;
  cliente: string;
  direccion: string;
  telefono: string;
  descripcion?: string;
  id_servicio: number;
}

const TechnicianDashboard = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCitas();
  }, []);

  const fetchCitas = async () => {
    setLoading(true);

    try {
      const res = await api.get('/tecnicos/mis-citas');
      setCitas(res.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (
    id_cita: number,
    nuevoEstadoId: number
  ) => {
    try {
      await api.put(
        `/tecnicos/citas/${id_cita}/estado`,
        {
          estado_id: nuevoEstadoId
        }
      );

      fetchCitas();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    }
  };

  const openModal = (cita: Cita) => {
    setSelectedCita(cita);
    setModalOpen(true);
  };

  const citasProgramadas = citas.filter(
    c => c.estado === 'programada'
  );

  const citasCompletadas = citas.filter(
    c => c.estado === 'completada'
  );

  const citasPendientes = citas.filter(
    c => c.estado === 'programada'
  );

  const proximaCita =
    citasProgramadas.length > 0
      ? citasProgramadas[0]
      : null;

  return (
    <>
      <main
        className="technician-container"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh'
        }}
      >

        <div className="dashboard-wrapper">

          <div className="dashboard-header">
            <div>
              <h1>¡Bienvenido, Técnico!</h1>
              <p>
                Aquí tienes un resumen de tu jornada de hoy.
              </p>
            </div>

            <div className="date-card">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-card">
              <h3>Citas de hoy</h3>
              <span className="stat-number">
                {citas.length}
              </span>
            </div>

            <div className="stat-card">
              <h3>Completadas</h3>
              <span className="stat-number">
                {citasCompletadas.length}
              </span>
            </div>

            <div className="stat-card">
              <h3>Pendientes</h3>
              <span className="stat-number">
                {citasPendientes.length}
              </span>
            </div>

            <div className="stat-card">
              <h3>Calificación</h3>
              <span className="stat-number">
                5.0
              </span>
            </div>

          </div>

          {loading ? (
            <div className="loading-message">
              Cargando citas...
            </div>
          ) : (
            <div className="dashboard-content">

              <div className="citas-panel">

                <div className="panel-header">
                  <h2>Citas del día</h2>
                </div>

                {citas.length === 0 ? (
                  <p>No hay citas para hoy.</p>
                ) : (
                  citas.map((cita) => (
                    <div
                      key={cita.id_cita}
                      className="appointment-card"
                    >
                      <div className="appointment-time">
                        {cita.hora_cita}
                      </div>

                      <div className="appointment-info">
                        <h3>{cita.cliente}</h3>

                        <p>
                          {cita.descripcion ||
                            'Servicio técnico'}
                        </p>

                        <small>
                          {cita.direccion}
                        </small>
                      </div>

                      <div>
                        <span
                          className={`status-badge ${cita.estado}`}
                        >
                          {cita.estado}
                        </span>

                        <button
                          className="details-btn"
                          onClick={() =>
                            openModal(cita)
                          }
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))
                )}

              </div>

              <div className="next-appointment">

                <h2>Próxima cita</h2>

                {proximaCita ? (
                  <>
                    <div className="next-date">
                      {proximaCita.hora_cita}
                    </div>

                    <h3>
                      {proximaCita.cliente}
                    </h3>

                    <p>
                      {proximaCita.descripcion}
                    </p>

                    <p>
                      {proximaCita.direccion}
                    </p>

                    <button
                      className="btn-location"
                      onClick={() =>
                        openModal(proximaCita)
                      }
                    >
                      Ver detalles
                    </button>
                  </>
                ) : (
                  <p>
                    No hay citas programadas.
                  </p>
                )}

              </div>

            </div>
          )}

          <div className="reminder-card">
            Tienes {citasPendientes.length} citas
            pendientes por completar hoy.
          </div>

        </div>
      </main>

      {modalOpen && selectedCita && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3>Detalle de cita</h3>

            <p>
              <strong>Cliente:</strong>{' '}
              {selectedCita.cliente}
            </p>

            <p>
              <strong>Dirección:</strong>{' '}
              {selectedCita.direccion}
            </p>

            <p>
              <strong>Teléfono:</strong>{' '}
              {selectedCita.telefono}
            </p>

            <p>
              <strong>Fecha:</strong>{' '}
              {selectedCita.fecha_cita}
            </p>

            <p>
              <strong>Hora:</strong>{' '}
              {selectedCita.hora_cita}
            </p>

            <p>
              <strong>Estado:</strong>{' '}
              {selectedCita.estado}
            </p>

            <div className="modal-buttons">

              <button
                className="btn-estado"
                onClick={() =>
                  actualizarEstado(
                    selectedCita.id_cita,
                    3
                  )
                }
              >
                Completar
              </button>

              <button
                className="btn-estado cancelar"
                onClick={() =>
                  actualizarEstado(
                    selectedCita.id_cita,
                    4
                  )
                }
              >
                Cancelar
              </button>

              <button
                className="btn-cerrar"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                Cerrar
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TechnicianDashboard;