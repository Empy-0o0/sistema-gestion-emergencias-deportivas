'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SharedModule from '@/utils/shared';

export default function BrigadaPage() {
  const [alertActive, setAlertActive] = useState(false);
  const [alertLevel, setAlertLevel] = useState(null);
  const [alertStartTime, setAlertStartTime] = useState(null);
  const [alertTimer, setAlertTimer] = useState('--:--');
  const [currentAlert, setCurrentAlert] = useState(null);
  const [showSiren, setShowSiren] = useState(false);
  const [history, setHistory] = useState([]);

  // Ubicaciones disponibles
  const locations = [
    "Cancha 1 - Sector Norte", "Cancha 1 - Sector Sur", "Cancha 1 - Portería Este", "Cancha 1 - Portería Oeste",
    "Cancha 2 - Centro del Campo", "Cancha 2 - Banda Derecha", "Cancha 2 - Banda Izquierda", "Cancha 2 - Área Penal Norte",
    "Cancha 3 - Círculo Central", "Cancha 3 - Córner Noreste", "Cancha 3 - Córner Suroeste",
    "Cancha 4 - Área de Banquillos", "Cancha 4 - Línea de Fondo",
    "Gradas Norte - Sección A", "Gradas Norte - Sección B", "Gradas Sur - Sección C", "Gradas Sur - Sección D",
    "Zona de Entrenamiento", "Vestuarios Masculinos", "Vestuarios Femeninos", "Área de Calentamiento", "Entrada Principal", "Estacionamiento"
  ];

  // Tipos de emergencia por nivel
  const emergencyTypes = {
    leve: ["Raspones o abrasiones leves", "Contusión menor sin hinchazón", "Calambre muscular leve", "Pequeño corte superficial", "Mareo leve por calor", "Dolor muscular menor", "Rozadura por equipamiento", "Fatiga leve"],
    moderada: ["Esguince de tobillo grado I-II", "Esguince de rodilla", "Fractura de dedo de mano/pie", "Herida sangrante que requiere puntos", "Deshidratación moderada", "Torcedura de muñeca", "Contusión con hematoma", "Dolor abdominal agudo", "Hiperextensión articular"],
    grave: ["Fractura expuesta de pierna/brazo", "Lesión craneal con pérdida de conocimiento", "Dolor torácico intenso", "Sospecha de paro cardíaco", "Trauma espinal o cervical", "Hemorragia grave no controlada", "Fractura de costillas", "Luxación de hombro/cadera", "Convulsiones", "Shock anafiláctico"]
  };

  // Datos de clubes
  const clubsData = {
    clubs: [
      { name: 'Escuela Los Halcones', field: 'Cancha 1', category: 'Sub-15', players: 22 },
      { name: 'Escuela Águilas Doradas', field: 'Cancha 2', category: 'Sub-17', players: 20 },
      { name: 'Escuela Tormenta FC', field: 'Cancha 3', category: 'Sub-13', players: 18 },
      { name: 'Escuela Estrellas Rojas', field: 'Cancha 4', category: 'Sub-19', players: 24 }
    ],
    totalClubs: 4,
    activeFields: 4,
    totalPlayers: 84
  };

  useEffect(() => {
    // Inicializar datos de clubes
    SharedModule.setClubData(clubsData);
    
    // Verificar alerta existente
    checkExistingAlert();
    
    // Cargar historial
    loadHistory();
    
    // Configurar timer
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  const checkExistingAlert = () => {
    try {
      const existingAlert = SharedModule.getAlert();
      if (existingAlert) {
        setCurrentAlert(existingAlert);
        setAlertActive(true);
        setAlertLevel(existingAlert.level);
        setAlertStartTime(new Date(existingAlert.timestamp));
        
        if (existingAlert.level === 'grave') {
          setShowSiren(true);
        }
      }
    } catch (error) {
      console.error('Error verificando alerta existente:', error);
    }
  };

  const loadHistory = () => {
    try {
      const incidentHistory = SharedModule.getIncidentHistory();
      setHistory(incidentHistory.slice(0, 10)); // Últimos 10
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const updateTimer = () => {
    if (alertStartTime) {
      const elapsed = SharedModule.formatElapsedTime(alertStartTime.getTime());
      setAlertTimer(elapsed);
    }
  };

  const activateAlert = (level) => {
    try {
      const existingAlert = SharedModule.getAlert();
      if (existingAlert && !confirm(`Ya hay una alerta ${existingAlert.level} activa. ¿Reemplazar con nueva alerta ${level}?`)) {
        return;
      }
      
      if (existingAlert) {
        cancelAlert();
      }
      
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomType = emergencyTypes[level][Math.floor(Math.random() * emergencyTypes[level].length)];
      const relatedClub = getRelatedClub(randomLocation);
      
      const alertData = {
        level,
        location: randomLocation,
        type: randomType,
        timestamp: Date.now(),
        relatedClub,
        activatedBy: 'Coordinador de Emergencias',
        priority: level === 'grave' ? 'CRÍTICA' : level === 'moderada' ? 'ALTA' : 'NORMAL'
      };
      
      SharedModule.setAlert(alertData);
      setCurrentAlert(alertData);
      setAlertActive(true);
      setAlertLevel(level);
      setAlertStartTime(new Date(alertData.timestamp));
      
      addToHistory(level, randomLocation, randomType);
      
      if (level === 'grave') {
        setShowSiren(true);
      }
      
      console.log('Alerta activada:', alertData);
    } catch (error) {
      console.error('Error activando alerta:', error);
      alert('Error al activar la alerta');
    }
  };

  const getRelatedClub = (location) => {
    const fieldMatch = location.match(/Cancha (\d+)/);
    if (fieldMatch) {
      const fieldNumber = parseInt(fieldMatch[1]);
      return clubsData.clubs.find(club => club.field === `Cancha ${fieldNumber}`) || null;
    }
    return null;
  };

  const cancelAlert = () => {
    try {
      if (!alertActive && !SharedModule.getAlert()) return;
      
      if (alertLevel === 'grave' && !confirm('¿Cancelar alerta GRAVE? Esto notificará a todo el personal.')) {
        return;
      }
      
      SharedModule.clearAlert();
      setAlertActive(false);
      setAlertLevel(null);
      setAlertStartTime(null);
      setCurrentAlert(null);
      setAlertTimer('--:--');
      setShowSiren(false);
      
      console.log('Alerta cancelada');
    } catch (error) {
      console.error('Error cancelando alerta:', error);
    }
  };

  const addToHistory = (level, location, type) => {
    const timeString = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newItem = {
      level,
      location,
      type,
      time: `Hoy, ${timeString}`,
      timestamp: Date.now()
    };
    
    setHistory(prev => [newItem, ...prev.slice(0, 9)]);
  };

  const closeSiren = () => {
    setShowSiren(false);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'brigada']}>
      <Layout>
        {/* Sirena de emergencia */}
        {showSiren && (
          <div className="fixed inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center z-50 animate-pulse">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
              <div className="text-6xl text-red-600 mb-4 animate-spin">⚠</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">¡ALERTA MÁXIMA!</h2>
              <p className="text-lg mb-6">
                Se ha activado una alerta grave. Todo el personal debe movilizarse inmediatamente.
              </p>
              <button
                onClick={closeSiren}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Entendido - Continuar
              </button>
            </div>
          </div>
        )}

        <div className="main-content">
          <div className="card">
            <h2 className="card-title">Panel de Alertas de Emergencia</h2>
            
            <div className={`alert-panel ${alertActive ? `active-${alertLevel}` : ''}`}>
              <div className={`alert-level ${alertActive ? `alert-${alertLevel}` : ''}`}>
                {alertActive ? `ALERTA ${alertLevel?.toUpperCase()}` : 'SIN ALERTAS ACTIVAS'}
              </div>
              <div className="alert-timer">{alertTimer}</div>
              <div className="alert-location">
                <span className="mr-2">📍</span>
                {currentAlert ? currentAlert.location : 'Ninguna ubicación seleccionada'}
              </div>
              <div className="alert-message">
                {currentAlert 
                  ? `Tipo de emergencia: ${currentAlert.type}. Personal médico en camino.`
                  : 'El sistema está en modo de espera. Seleccione un nivel de emergencia para activar la alerta.'
                }
              </div>
              
              <div className="alert-buttons">
                <button 
                  className="alert-btn btn-leve"
                  onClick={() => activateAlert('leve')}
                  disabled={alertActive}
                >
                  <span className="text-2xl">ℹ</span>
                  Leve
                </button>
                
                <button 
                  className="alert-btn btn-moderada"
                  onClick={() => activateAlert('moderada')}
                  disabled={alertActive}
                >
                  <span className="text-2xl">⚠</span>
                  Moderada
                </button>
                
                <button 
                  className="alert-btn btn-grave"
                  onClick={() => activateAlert('grave')}
                  disabled={alertActive}
                >
                  <span className="text-2xl">☠</span>
                  Grave
                </button>
                
                <button 
                  className="alert-btn btn-cancel"
                  onClick={cancelAlert}
                  disabled={!alertActive}
                >
                  <span className="text-2xl">✖</span>
                  Cancelar Alerta
                </button>
              </div>
              
              <div className="alert-history">
                <div className="history-title">
                  <span className="mr-2">🕒</span> Historial de Alertas Recientes
                </div>
                <div className="history-list">
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <div key={index} className="history-item">
                        <div className={`history-level level-${item.level}`}>
                          {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                        </div>
                        <div>{item.location} - {item.type}</div>
                        <div className="history-time">{item.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No hay historial de alertas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Brigada de Emergencia</h2>
            
            <div className="space-y-4">
              {[
                { name: 'Enfermero Principal', location: 'Puesto Médico', status: 'available' },
                { name: 'Escuela Los Halcones', location: 'Cancha 1', status: 'available' },
                { name: 'Escuela Águilas Doradas', location: 'Cancha 2', status: 'available' },
                { name: 'Escuela Tormenta FC', location: 'Cancha 3', status: 'available' },
                { name: 'Escuela Estrellas Rojas', location: 'Cancha 4', status: 'available' }
              ].map((member, index) => (
                <div key={index} className="team-item">
                  <div className={`team-status status-${member.status}`}></div>
                  <div className="team-info">
                    <div className="team-name">{member.name}</div>
                    <div className="team-location">{member.location}</div>
                  </div>
                  <div className="text-gray-400">
                    📻
                  </div>
                </div>
              ))}
            </div>
            
            <h2 className="card-title mt-8">Protocolo de Comunicación</h2>
            
            <div className="bg-blue-50 p-5 rounded-lg mt-4">
              <h3 className="text-blue-900 font-semibold mb-3">Instrucciones para la Brigada:</h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Al activar una alerta grave, todos los miembros recibirán notificación</li>
                <li>El enfermero debe acudir inmediatamente a la ubicación reportada</li>
                <li>Las escuelas en canchas adyacentes deben contener al público</li>
                <li>Un miembro debe preparar la camilla de rescate</li>
                <li>Otro miembro debe contactar a servicios de emergencia externos</li>
              </ul>
              
              <p className="mt-4 font-semibold text-blue-900">
                <strong>Lema:</strong> "Rapidez y coordinación salvan vidas"
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
