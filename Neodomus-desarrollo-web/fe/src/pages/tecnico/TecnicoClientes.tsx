import { useState, useEffect } from 'react';
import {
  FaCalendarCheck,
  FaEnvelope,
  FaLocationDot,
  FaPhone,
  FaUsers,
} from 'react-icons/fa6';
import { useIdioma } from '@i18n/IdiomaContext';
import api from '@services/api';
import '@styles/admin-panel.css';

interface Cliente {
  id_cliente: number;
  nombre: string;
  email?: string | null;
  telefono?: number | null;
  direccion?: string | null;
  citas_count: number;
}

const TecnicoClientes = () => {
  const { t } = useIdioma();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/tecnicos/mis-clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    const interval = setInterval(fetchClientes, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iniciales = (nombre: string) =>
    nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');

  return (
    <div className="admin-panel">
      <header className="ap-header">
        <div>
          <h1 className="ap-title"><FaUsers /> {t('tec.clientesTitulo')}</h1>
          <p className="ap-subtitle">{t('tec.clientesSub')}</p>
        </div>
        <div className="ap-header-right">
          <span className="ap-badge info">{clientes.length}</span>
        </div>
      </header>

      <div className="ap-card" style={{ marginTop: 8 }}>
        {loading ? (
          <div className="ap-states">
            <span className="ap-loader" />
            <h3>{t('tec.cargandoDatos')}</h3>
          </div>
        ) : clientes.length === 0 ? (
          <div className="ap-states">
            <div className="ap-states-icon"><FaUsers /></div>
            <h3>{t('tec.sinClientes')}</h3>
            <p>{t('tec.sinClientesHint')}</p>
          </div>
        ) : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>{t('tec.cliente')}</th>
                  <th>{t('tec.email')}</th>
                  <th>{t('tec.telefono')}</th>
                  <th>{t('tec.direccion')}</th>
                  <th>{t('tec.citasHoy')}</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>
                      <span className="ap-initials">{iniciales(c.nombre)}</span>
                      <strong style={{ marginLeft: 10 }}>{c.nombre}</strong>
                    </td>
                    <td>
                      <FaEnvelope /> {c.email || '—'}
                    </td>
                    <td>
                      <FaPhone /> {c.telefono ? String(c.telefono) : '—'}
                    </td>
                    <td>
                      <FaLocationDot /> {c.direccion || '—'}
                    </td>
                    <td>
                      <span className="ap-badge neutral">{t('tec.citasCount', { n: c.citas_count })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {clientes.length > 0 && (
        <div className="ap-card" style={{ marginTop: 20, borderLeft: '4px solid #d4a54b' }}>
          <p style={{ margin: 0, color: '#dcdcdc', fontSize: '0.9rem' }}>
            <FaCalendarCheck style={{ marginRight: 8, color: '#d4a54b' }} />
            {t('tec.totalClientes', { n: clientes.length })}
          </p>
        </div>
      )}
    </div>
  );
};

export default TecnicoClientes;
