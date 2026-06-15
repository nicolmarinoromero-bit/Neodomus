import { useState, useEffect } from 'react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
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

  const actualizarEstado = async (id_cita: number, nuevoEstadoId: number) => {
    try {
      await api.put(`/tecnicos/citas/${id_cita}/estado`, { estado_id: nuevoEstadoId });
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

  const citasProgramadas = citas.filter(c => c.estado === 'programada');
  const citasCanceladas = citas.filter(c => c.estado === 'cancelada');
  const citasCompletadas = citas.filter(c => c.estado === 'completada');

  return (
    <>
      <Navbar />
      <main
        className="technician-container"
        style={{
          backgroundImage: `url(${fondoImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          padding: '30px'
        }}
      >
        <h1>Citas del día</h1>
        {loading ? (
          <div className="loading-message">Cargando citas...</div>
        ) : (
          <div className="cards">
            <div className="card">
              <h2>Programadas</h2>
              {citasProgramadas.length === 0 ? (
                <p className="empty-message">No hay citas programadas</p>
              ) : (
                citasProgramadas.map(cita => (
                  <div key={cita.id_cita} className="item">
                    <span>✔ {cita.hora_cita} - {cita.cliente}</span>
                    <button className="btn-arrow" onClick={() => openModal(cita)}>➜</button>
                  </div>
                ))
              )}
            </div>
            <div className="card">
              <h2>Completadas</h2>
              {citasCompletadas.length === 0 ? (
                <p className="empty-message">No hay citas completadas</p>
              ) : (
                citasCompletadas.map(cita => (
                  <div key={cita.id_cita} className="item">
                    <span>✔ {cita.hora_cita} - {cita.cliente}</span>
                    <button className="btn-arrow" onClick={() => openModal(cita)}>➜</button>
                  </div>
                ))
              )}
            </div>
            <div className="card">
              <h2>Canceladas</h2>
              {citasCanceladas.length === 0 ? (
                <p className="empty-message">No hay citas canceladas</p>
              ) : (
                citasCanceladas.map(cita => (
                  <div key={cita.id_cita} className="item">
                    <span>✖ {cita.hora_cita} - {cita.cliente}</span>
                    <button className="btn-arrow" onClick={() => openModal(cita)}>➜</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {modalOpen && selectedCita && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalle de cita</h3>
            <p><strong>Cliente:</strong> {selectedCita.cliente}</p>
            <p><strong>Dirección:</strong> {selectedCita.direccion}</p>
            <p><strong>Teléfono:</strong> {selectedCita.telefono}</p>
            <p><strong>Fecha/Hora:</strong> {selectedCita.fecha_cita} {selectedCita.hora_cita}</p>
            <p><strong>Estado actual:</strong> {selectedCita.estado}</p>
            {selectedCita.descripcion && <p><strong>Descripción:</strong> {selectedCita.descripcion}</p>}
            <div className="modal-buttons">
              <button onClick={() => actualizarEstado(selectedCita.id_cita, 3)} className="btn-estado">
                Marcar completada
              </button>
              <button onClick={() => actualizarEstado(selectedCita.id_cita, 4)} className="btn-estado cancelar">
                Marcar cancelada
              </button>
              <button onClick={() => setModalOpen(false)} className="btn-cerrar">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default TechnicianDashboard;