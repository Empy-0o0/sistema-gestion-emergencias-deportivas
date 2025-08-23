'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SharedModule from '@/utils/shared';

export default function EnfermeriaPage() {
  const [currentStatus, setCurrentStatus] = useState('available');
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertTimer, setAlertTimer] = useState('--:--');
  const [alertStartTime, setAlertStartTime] = useState(null);
  const [formData, setFormData] = useState({
    athleteName: '',
    athleteAge: '',
    athleteClub: '',
    athleteCategory: '',
    sportType: '',
    incidentType: '',
    incidentDate: '',
    incidentLocation: '',
    bodyPart: '',
    incidentDescription: '',
    firstAid: '',
    severity: 'leve',
    status: 'pendiente'
  });

  useEffect(() => {
    // Verificar alerta existente
    checkExistingAlert();
    
    // Registrar listener para alertas
    SharedModule.registerAlertListener(handleIncomingAlert);
    
    // Configurar fecha y hora actual por defecto
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, incidentDate: localDateTime }));
    
    // Timer para alertas
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  const checkExistingAlert = () => {
    try {
      const existingAlert = SharedModule.getAlert();
      if (existingAlert) {
        setCurrentAlert({
          ...existingAlert,
          confirmed: false,
          arrived: false,
          startTime: new Date(existingAlert.timestamp)
        });
        setAlertStartTime(new Date(existingAlert.timestamp));
        
        if (existingAlert.level === 'grave') {
          setCurrentStatus('emergency');
        } else if (existingAlert.level === 'moderada') {
          setCurrentStatus('busy');
        } else {
          setCurrentStatus('busy');
        }
      }
    } catch (error) {
      console.error('Error verificando alerta existente:', error);
    }
  };

  const handleIncomingAlert = (alertEvent) => {
    try {
      console.log('Alerta recibida en Panel de Enfermería:', alertEvent);
      
      if (alertEvent.type === 'set' && alertEvent.data) {
        const newAlert = {
          ...alertEvent.data,
          confirmed: false,
          arrived: false,
          startTime: new Date(alertEvent.data.timestamp)
        };
        
        setCurrentAlert(newAlert);
        setAlertStartTime(newAlert.startTime);
        
        // Cambiar estado según nivel de alerta
        if (newAlert.level === 'grave') {
          setCurrentStatus('emergency');
          playAlertSound();
        } else if (newAlert.level === 'moderada') {
          setCurrentStatus('busy');
        } else {
          setCurrentStatus('busy');
        }
        
        showNotification(`🚨 NUEVA ALERTA ${newAlert.level.toUpperCase()}: ${newAlert.type}`, 'warning');
        
        // Enviar confirmación automática de recepción
        sendReceptionConfirmation(newAlert);
        
      } else if (alertEvent.type === 'clear') {
        clearCurrentAlert();
        showNotification('Alerta cancelada por el coordinador', 'info');
      }
    } catch (error) {
      console.error('Error manejando alerta entrante:', error);
    }
  };

  const sendReceptionConfirmation = (alertData) => {
    try {
      SharedModule.updateAlert({
        receivedBy: 'María Jiménez - Brigada de Emergencia',
        receivedAt: new Date().toISOString(),
        receptionConfirmed: true,
        nurseStatus: currentStatus,
        nurseLocation: 'Puesto Médico Central'
      });
      console.log('✅ Confirmación de recepción enviada al Panel de Brigada');
    } catch (error) {
      console.error('Error enviando confirmación:', error);
    }
  };

  const playAlertSound = () => {
    try {
      // Crear contexto de audio para generar sonido de alerta médica
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido de alerta médica (dos tonos alternados)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
    } catch (error) {
      console.log('Audio no disponible:', error);
    }
  };

  const updateTimer = () => {
    if (alertStartTime) {
      const elapsed = SharedModule.formatElapsedTime(alertStartTime.getTime());
      setAlertTimer(elapsed);
    }
  };

  const clearCurrentAlert = () => {
    setCurrentAlert(null);
    setAlertStartTime(null);
    setAlertTimer('--:--');
    setCurrentStatus('available');
  };

  const showNotification = (message, type = 'info') => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#1a6dcc'};
      color: ${type === 'warning' ? '#000' : '#fff'};
      padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      font-family: 'Inter', sans-serif; font-weight: 600; max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  const setStatus = (status) => {
    try {
      setCurrentStatus(status);
      SharedModule.setStatus(status, { 
        location: 'Puesto Médico',
        name: 'María Jiménez',
        role: 'Brigada de Emergencia'
      });
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const confirmAlert = () => {
    if (!currentAlert) {
      showNotification('No hay alertas activas para confirmar', 'error');
      return;
    }
    
    if (currentAlert.confirmed) {
      showNotification('Esta alerta ya ha sido confirmada', 'warning');
      return;
    }
    
    setCurrentAlert(prev => ({ ...prev, confirmed: true }));
    showNotification(`Alerta confirmada. Diríjase a ${currentAlert.location}`, 'success');
    
    try {
      SharedModule.updateAlert({ 
        confirmed: true, 
        confirmedAt: new Date().toISOString(),
        healthStaffEnRoute: true
      });
    } catch (error) {
      console.error('Error actualizando alerta:', error);
    }
  };

  const markArrived = () => {
    if (!currentAlert) {
      showNotification('No hay alertas activas', 'error');
      return;
    }
    
    if (!currentAlert.confirmed) {
      showNotification('Por favor confirme la alerta primero', 'warning');
      return;
    }
    
    if (currentAlert.arrived) {
      showNotification('Ya marcó su llegada anteriormente', 'warning');
      return;
    }
    
    setCurrentAlert(prev => ({ ...prev, arrived: true }));
    showNotification(`Llegada registrada en ${currentAlert.location}. Proceda con la atención.`, 'success');
    
    try {
      SharedModule.updateAlert({ arrived: true, arrivedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error actualizando alerta:', error);
    }
  };

  const requestAssistance = () => {
    if (!currentAlert) {
      showNotification('No hay alertas activas', 'error');
      return;
    }
    
    showNotification('Solicitud de apoyo adicional enviada. Refuerzos en camino.', 'success');
    
    try {
      SharedModule.updateAlert({ 
        assistanceRequested: true, 
        assistanceRequestedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error actualizando alerta:', error);
    }
  };

  const completeAlert = () => {
    if (!currentAlert) {
      showNotification('No hay alertas activas', 'error');
      return;
    }
    
    if (!currentAlert.confirmed) {
      showNotification('Por favor confirme la alerta primero', 'warning');
      return;
    }
    
    if (!currentAlert.arrived) {
      showNotification('Por favor marque su llegada primero', 'warning');
      return;
    }
    
    // Agregar al historial del SharedModule
    try {
      SharedModule.addIncident({
        athleteName: 'Deportista',
        athleteAge: 17,
        sportType: 'futbol',
        incidentType: currentAlert.type,
        incidentDate: currentAlert.startTime.toISOString(),
        incidentLocation: currentAlert.location,
        bodyPart: 'tobillo',
        incidentDescription: currentAlert.type,
        firstAid: 'Primeros auxilios aplicados según protocolo',
        severity: currentAlert.level,
        status: 'completado',
        completedBy: 'María Jiménez - Brigada de Emergencia',
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error agregando incidente al historial:', error);
    }
    
    // Limpiar alerta actual
    clearCurrentAlert();
    
    showNotification('Emergencia marcada como resuelta. ¡Buen trabajo!', 'success');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Agregar al SharedModule
      SharedModule.addIncident(formData);
      
      showNotification('¡Incidente registrado correctamente!', 'success');
      
      // Resetear formulario
      setFormData({
        athleteName: '',
        athleteAge: '',
        athleteClub: '',
        athleteCategory: '',
        sportType: '',
        incidentType: '',
        incidentDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        incidentLocation: '',
        bodyPart: '',
        incidentDescription: '',
        firstAid: '',
        severity: 'leve',
        status: 'pendiente'
      });
      
    } catch (error) {
      console.error('Error registrando incidente:', error);
      showNotification('Error al registrar el incidente', 'error');
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'available': 'Disponible',
      'busy': 'Ocupado',
      'emergency': 'En Emergencia'
    };
    return statusLabels[status] || 'Desconocido';
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'text-green-600',
      'busy': 'text-yellow-600',
      'emergency': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'enfermeria']}>
      <Layout>
        <div className="main-content">
          <div className="card">
            <h2 className="card-title">Estado del Brigadista</h2>
            
            <div className={`alert-panel ${currentAlert ? `active-${currentAlert.level}` : ''}`}>
              <div className={`text-2xl font-bold mb-4 ${getStatusColor(currentStatus)}`}>
                <span className="inline-block w-6 h-6 rounded-full bg-current mr-3"></span>
                {getStatusLabel(currentStatus).toUpperCase()}
              </div>
              <div className="text-gray-600 mb-6">
                {currentStatus === 'available' ? 'Listo para responder a emergencias' :
                 currentStatus === 'busy' ? 'Atendiendo una emergencia menor' :
                 'Atendiendo una emergencia grave'}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button 
                  className="alert-btn btn-leve"
                  onClick={() => setStatus('available')}
                >
                  <span className="text-2xl">✓</span>
                  Disponible
                </button>
                
                <button 
                  className="alert-btn btn-moderada"
                  onClick={() => setStatus('busy')}
                >
                  <span className="text-2xl">⏰</span>
                  Ocupado
                </button>
                
                <button 
                  className="alert-btn btn-grave"
                  onClick={() => setStatus('emergency')}
                >
                  <span className="text-2xl">⚠</span>
                  En Emergencia
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Información de la Brigada</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Equipo:</strong> Brigada Médica Principal</div>
                  <div><strong>Ubicación:</strong> Puesto Médico Central</div>
                  <div><strong>Miembros:</strong> María Jiménez, Carlos López, Ana Torres</div>
                  <div><strong>Radio:</strong> Canal 3 (Emergencias)</div>
                </div>
              </div>
            </div>
            
            <h2 className="card-title mt-8">Alertas Activas</h2>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Alerta actual:</strong> {currentAlert ? `${currentAlert.level.toUpperCase()}` : 'Ninguna alerta activa'}</div>
                <div><strong>Ubicación:</strong> {currentAlert ? currentAlert.location : '--'}</div>
                <div><strong>Tiempo:</strong> {alertTimer}</div>
                <div><strong>Descripción:</strong> {currentAlert ? currentAlert.type : 'Esperando asignación de alerta'}</div>
              </div>
              {currentAlert?.relatedClub && (
                <div className="mt-3 p-3 bg-blue-100 rounded">
                  <strong>Club Afectado:</strong> {currentAlert.relatedClub.name} ({currentAlert.relatedClub.category})
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="alert-btn btn-leve"
                onClick={confirmAlert}
                disabled={!currentAlert || currentAlert.confirmed}
              >
                <span className="text-2xl">✓✓</span>
                Confirmar Alerta
              </button>
              
              <button 
                className="alert-btn btn-moderada"
                onClick={markArrived}
                disabled={!currentAlert || !currentAlert.confirmed || currentAlert.arrived}
              >
                <span className="text-2xl">📍</span>
                Llegué al lugar
              </button>
              
              <button 
                className="alert-btn btn-grave"
                onClick={requestAssistance}
                disabled={!currentAlert}
              >
                <span className="text-2xl">🤝</span>
                Solicitar Apoyo
              </button>
              
              <button 
                className="alert-btn btn-cancel"
                onClick={completeAlert}
                disabled={!currentAlert || !currentAlert.confirmed || !currentAlert.arrived}
              >
                <span className="text-2xl">🏁</span>
                Emergencia Resuelta
              </button>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Registrar Nuevo Incidente</h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="athleteName">Nombre del Deportista</label>
                  <input
                    type="text"
                    id="athleteName"
                    name="athleteName"
                    value={formData.athleteName}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: Carlos Torres"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="athleteAge">Edad</label>
                  <input
                    type="number"
                    id="athleteAge"
                    name="athleteAge"
                    value={formData.athleteAge}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: 17"
                    min="8"
                    max="60"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="athleteClub">Club del Deportista</label>
                  <input
                    type="text"
                    id="athleteClub"
                    name="athleteClub"
                    value={formData.athleteClub}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: Colo Colo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="athleteCategory">Categoría del Deportista</label>
                  <input
                    type="text"
                    id="athleteCategory"
                    name="athleteCategory"
                    value={formData.athleteCategory}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: Sub 11"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sportType">Deporte</label>
                  <select
                    id="sportType"
                    name="sportType"
                    value={formData.sportType}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  >
                    <option value="">Seleccionar deporte</option>
                    <option value="futbol">Fútbol</option>
                    <option value="voleibol">Voleibol</option>
                    <option value="baloncesto">Baloncesto</option>
                    <option value="atletismo">Atletismo</option>
                    <option value="tenis">Tenis</option>
                    <option value="rugby">Rugby</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="incidentType">Tipo de Lesión</label>
                  <select
                    id="incidentType"
                    name="incidentType"
                    value={formData.incidentType}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="fractura">Fractura</option>
                    <option value="esguince">Esguince</option>
                    <option value="contusion">Contusión</option>
                    <option value="desgarro">Desgarro muscular</option>
                    <option value="tendinitis">Tendinitis</option>
                    <option value="conmocion">Conmoción cerebral</option>
                    <option value="laceracion">Laceración</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="incidentDate">Fecha y Hora del Incidente</label>
                  <input
                    type="datetime-local"
                    id="incidentDate"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="incidentLocation">Ubicación</label>
                  <input
                    type="text"
                    id="incidentLocation"
                    name="incidentLocation"
                    value={formData.incidentLocation}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: Cancha Principal, Campo de Fútbol"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="bodyPart">Parte del Cuerpo Afectada</label>
                <select
                  id="bodyPart"
                  name="bodyPart"
                  value={formData.bodyPart}
                  onChange={handleFormChange}
                  className="form-control"
                  required
                >
                  <option value="">Seleccionar parte del cuerpo</option>
                  <option value="tobillo">Tobillo</option>
                  <option value="rodilla">Rodilla</option>
                  <option value="muslo">Muslo</option>
                  <option value="pierna">Pierna</option>
                  <option value="hombro">Hombro</option>
                  <option value="brazo">Brazo</option>
                  <option value="cabeza">Cabeza/Cuello</option>
                  <option value="torso">Torso</option>
                  <option value="otra">Otra</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="incidentDescription">Descripción del Incidente</label>
                  <textarea
                    id="incidentDescription"
                    name="incidentDescription"
                    value={formData.incidentDescription}
                    onChange={handleFormChange}
                    className="form-control"
                    rows="3"
                    placeholder="Describa en detalle lo ocurrido, síntomas observados..."
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="firstAid">Primeros Auxilios Aplicados</label>
                  <textarea
                    id="firstAid"
                    name="firstAid"
                    value={formData.firstAid}
                    onChange={handleFormChange}
                    className="form-control"
                    rows="3"
                    placeholder="Describa los primeros auxilios aplicados..."
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="severity">Gravedad</label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  >
                    <option value="leve">Leve (sin tiempo fuera)</option>
                    <option value="moderada">Moderada (1-7 días fuera)</option>
                    <option value="grave">Grave (8-28 días fuera)</option>
                    <option value="critica">Crítica (más de 28 días fuera)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  >
                    <option value="pendiente">Pendiente de evaluación</option>
                    <option value="progreso">En tratamiento</option>
                    <option value="completado">Recuperado</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="btn w-full bg-orange-500 hover:bg-orange-600">
                <span className="mr-2">💾</span> Registrar Incidente
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
