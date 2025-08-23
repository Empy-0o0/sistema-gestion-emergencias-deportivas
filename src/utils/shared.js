/**
 * Módulo Compartido para Sistema de Gestión de Emergencias Deportivas
 * Ergo SaniTas SpA - 2025
 * 
 * Este módulo centraliza la comunicación entre los paneles del sistema:
 * - Dashboard (Resumen del sistema)
 * - Panel de Brigada (Activación de alertas)
 * - Panel de Enfermería (Recepción de alertas y registro de incidentes)
 * - Panel de Liga (Estadísticas y gestión de clubes)
 * - Panel de Administración (Gestión de usuarios y roles)
 * 
 * Refactorizado para Next.js con soporte SSR
 */

// Verificar si estamos en el cliente
const isClient = typeof window !== 'undefined';

// Claves para localStorage
const STORAGE_KEYS = {
  CURRENT_ALERT: 'ergosanitas_current_alert',
  BRIGADISTA_STATUS: 'ergosanitas_brigadista_status',
  INCIDENT_HISTORY: 'ergosanitas_incident_history',
  CLUB_DATA: 'ergosanitas_club_data',
  STATISTICS: 'ergosanitas_statistics',
  USERS: 'ergosanitas_users',
  CURRENT_USER: 'ergosanitas_current_user'
};

// Estados válidos del brigadista
const VALID_STATUSES = ['available', 'busy', 'emergency'];

// Niveles de alerta válidos
const VALID_ALERT_LEVELS = ['leve', 'moderada', 'grave'];

// Roles válidos del sistema
const VALID_ROLES = ['admin', 'brigada', 'enfermeria', 'liga'];

/**
 * Función auxiliar para manejar errores de localStorage
 */
function handleStorageError(error, operation) {
  console.error(`Error en operación de localStorage (${operation}):`, error);
  
  // Mostrar mensaje amigable al usuario
  const message = 'Error de almacenamiento local. Algunos datos pueden no sincronizarse correctamente.';
  
  // Crear notificación temporal
  if (isClient) {
    showNotification(message, 'error');
  }
}

/**
 * Mostrar notificación temporal al usuario
 */
function showNotification(message, type = 'info') {
  if (!isClient) return;

  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#1a6dcc'};
    color: ${type === 'warning' ? '#000' : '#fff'};
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  // Agregar estilos de animación si no existen
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

/**
 * Validar estructura de datos de alerta
 */
function validateAlertData(alertData) {
  if (!alertData || typeof alertData !== 'object') {
    return false;
  }

  const required = ['level', 'location', 'type', 'timestamp'];
  for (const field of required) {
    if (!alertData.hasOwnProperty(field)) {
      return false;
    }
  }

  if (!VALID_ALERT_LEVELS.includes(alertData.level)) {
    return false;
  }

  return true;
}

/**
 * Validar estructura de datos de usuario
 */
function validateUserData(userData) {
  if (!userData || typeof userData !== 'object') {
    return false;
  }

  const required = ['username', 'password', 'role', 'name'];
  for (const field of required) {
    if (!userData.hasOwnProperty(field) || !userData[field]) {
      return false;
    }
  }

  if (!VALID_ROLES.includes(userData.role)) {
    return false;
  }

  return true;
}

/**
 * Generar ID único para incidentes
 */
function generateIncidentId() {
  return 'INC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generar ID único para usuarios
 */
function generateUserId() {
  return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Módulo principal
const SharedModule = {
  
  /**
   * Establecer alerta activa
   */
  setAlert: function(alertData) {
    if (!isClient) return null;
    
    try {
      if (!validateAlertData(alertData)) {
        throw new Error('Datos de alerta inválidos');
      }

      // Agregar ID único y metadatos
      const enrichedAlert = {
        ...alertData,
        id: generateIncidentId(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_ALERT, JSON.stringify(enrichedAlert));
      
      // Disparar evento personalizado para notificar a otros componentes
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('alertChanged', {
          detail: { type: 'set', data: enrichedAlert }
        }));
      }

      console.log('Alerta establecida:', enrichedAlert);
      return enrichedAlert;

    } catch (error) {
      handleStorageError(error, 'setAlert');
      throw error;
    }
  },

  /**
   * Obtener alerta activa
   */
  getAlert: function() {
    if (!isClient) return null;
    
    try {
      const alertData = localStorage.getItem(STORAGE_KEYS.CURRENT_ALERT);
      if (!alertData) {
        return null;
      }

      const parsed = JSON.parse(alertData);
      
      // Validar que la alerta no haya expirado (opcional: 24 horas)
      const alertAge = Date.now() - new Date(parsed.createdAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (alertAge > maxAge) {
        this.clearAlert();
        return null;
      }

      return parsed;

    } catch (error) {
      handleStorageError(error, 'getAlert');
      return null;
    }
  },

  /**
   * Limpiar alerta activa
   */
  clearAlert: function() {
    if (!isClient) return;
    
    try {
      const currentAlert = this.getAlert();
      
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ALERT);
      
      // Disparar evento de limpieza
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('alertChanged', {
          detail: { type: 'clear', data: currentAlert }
        }));
      }

      console.log('Alerta limpiada');

    } catch (error) {
      handleStorageError(error, 'clearAlert');
    }
  },

  /**
   * Actualizar estado de alerta existente
   */
  updateAlert: function(updates) {
    if (!isClient) return null;
    
    try {
      const currentAlert = this.getAlert();
      if (!currentAlert) {
        throw new Error('No hay alerta activa para actualizar');
      }

      const updatedAlert = {
        ...currentAlert,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_ALERT, JSON.stringify(updatedAlert));
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('alertChanged', {
          detail: { type: 'update', data: updatedAlert }
        }));
      }

      return updatedAlert;

    } catch (error) {
      handleStorageError(error, 'updateAlert');
      throw error;
    }
  },

  /**
   * Registrar listener para cambios de alerta
   */
  registerAlertListener: function(callback) {
    if (!isClient || typeof callback !== 'function') return;

    // Listener para eventos personalizados
    window.addEventListener('alertChanged', function(event) {
      try {
        callback(event.detail);
      } catch (error) {
        console.error('Error en callback de alerta:', error);
      }
    });

    // Listener para cambios de localStorage (entre pestañas)
    window.addEventListener('storage', function(event) {
      if (event.key === STORAGE_KEYS.CURRENT_ALERT) {
        try {
          const newData = event.newValue ? JSON.parse(event.newValue) : null;
          const type = event.newValue ? 'set' : 'clear';
          callback({ type, data: newData });
        } catch (error) {
          console.error('Error procesando cambio de storage:', error);
        }
      }
    });
  },

  /**
   * Establecer estado del brigadista
   */
  setStatus: function(status, additionalInfo = {}) {
    if (!isClient) return null;
    
    try {
      if (!VALID_STATUSES.includes(status)) {
        throw new Error(`Estado inválido: ${status}`);
      }

      const statusData = {
        status,
        timestamp: Date.now(),
        updatedAt: new Date().toISOString(),
        ...additionalInfo
      };

      localStorage.setItem(STORAGE_KEYS.BRIGADISTA_STATUS, JSON.stringify(statusData));
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('statusChanged', {
          detail: statusData
        }));
      }

      return statusData;

    } catch (error) {
      handleStorageError(error, 'setStatus');
      throw error;
    }
  },

  /**
   * Obtener estado actual del brigadista
   */
  getStatus: function() {
    if (!isClient) return { status: 'available', timestamp: Date.now() };
    
    try {
      const statusData = localStorage.getItem(STORAGE_KEYS.BRIGADISTA_STATUS);
      return statusData ? JSON.parse(statusData) : { status: 'available', timestamp: Date.now() };
    } catch (error) {
      handleStorageError(error, 'getStatus');
      return { status: 'available', timestamp: Date.now() };
    }
  },

  /**
   * Registrar listener para cambios de estado
   */
  registerStatusListener: function(callback) {
    if (!isClient || typeof callback !== 'function') return;

    window.addEventListener('statusChanged', function(event) {
      try {
        callback(event.detail);
      } catch (error) {
        console.error('Error en callback de estado:', error);
      }
    });
  },

  /**
   * Agregar incidente al historial
   */
  addIncident: function(incidentData) {
    if (!isClient) return null;
    
    try {
      const history = this.getIncidentHistory();
      
      const incident = {
        ...incidentData,
        id: generateIncidentId(),
        createdAt: new Date().toISOString(),
        status: incidentData.status || 'pending'
      };

      history.unshift(incident); // Agregar al inicio
      
      // Mantener solo los últimos 100 incidentes
      if (history.length > 100) {
        history.splice(100);
      }

      localStorage.setItem(STORAGE_KEYS.INCIDENT_HISTORY, JSON.stringify(history));
      
      // Actualizar estadísticas
      this.updateStatistics();
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('incidentAdded', {
          detail: incident
        }));
      }

      return incident;

    } catch (error) {
      handleStorageError(error, 'addIncident');
      throw error;
    }
  },

  /**
   * Obtener historial de incidentes
   */
  getIncidentHistory: function() {
    if (!isClient) return [];
    
    try {
      const history = localStorage.getItem(STORAGE_KEYS.INCIDENT_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      handleStorageError(error, 'getIncidentHistory');
      return [];
    }
  },

  /**
   * Actualizar estadísticas basadas en el historial
   */
  updateStatistics: function() {
    if (!isClient) return null;
    
    try {
      const history = this.getIncidentHistory();
      
      const stats = {
        total: history.length,
        byLevel: {
          leve: history.filter(i => i.severity === 'leve').length,
          moderada: history.filter(i => i.severity === 'moderada').length,
          grave: history.filter(i => i.severity === 'grave').length
        },
        bySport: {},
        byType: {},
        byMonth: {},
        lastUpdated: new Date().toISOString()
      };

      // Calcular estadísticas por deporte
      history.forEach(incident => {
        if (incident.sportType) {
          stats.bySport[incident.sportType] = (stats.bySport[incident.sportType] || 0) + 1;
        }
        
        if (incident.incidentType) {
          stats.byType[incident.incidentType] = (stats.byType[incident.incidentType] || 0) + 1;
        }
        
        // Estadísticas por mes
        const month = new Date(incident.createdAt).getMonth();
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      });

      localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('statisticsUpdated', {
          detail: stats
        }));
      }

      return stats;

    } catch (error) {
      handleStorageError(error, 'updateStatistics');
      return null;
    }
  },

  /**
   * Obtener estadísticas
   */
  getStatistics: function() {
    if (!isClient) return null;
    
    try {
      const stats = localStorage.getItem(STORAGE_KEYS.STATISTICS);
      return stats ? JSON.parse(stats) : this.updateStatistics();
    } catch (error) {
      handleStorageError(error, 'getStatistics');
      return null;
    }
  },

  /**
   * Gestión de datos de clubes
   */
  setClubData: function(clubData) {
    if (!isClient) return null;
    
    try {
      const data = {
        ...clubData,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CLUB_DATA, JSON.stringify(data));
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('clubDataChanged', {
          detail: data
        }));
      }

      return data;

    } catch (error) {
      handleStorageError(error, 'setClubData');
      throw error;
    }
  },

  getClubData: function() {
    if (!isClient) {
      return {
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
    }
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLUB_DATA);
      return data ? JSON.parse(data) : {
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
    } catch (error) {
      handleStorageError(error, 'getClubData');
      return { clubs: [], totalClubs: 0, activeFields: 0, totalPlayers: 0 };
    }
  },

  /**
   * Gestión de usuarios y autenticación
   */
  createUser: function(userData) {
    if (!isClient) return null;
    
    try {
      if (!validateUserData(userData)) {
        throw new Error('Datos de usuario inválidos');
      }

      const users = this.getUsers();
      
      // Verificar si el usuario ya existe
      if (users.find(user => user.username === userData.username)) {
        throw new Error('El nombre de usuario ya existe');
      }

      const newUser = {
        ...userData,
        id: generateUserId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return newUser;

    } catch (error) {
      handleStorageError(error, 'createUser');
      throw error;
    }
  },

  getUsers: function() {
    if (!isClient) {
      return [
        {
          id: 'admin_default',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          name: 'Administrador del Sistema',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      const defaultUsers = [
        {
          id: 'admin_default',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          name: 'Administrador del Sistema',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'brigada_default',
          username: 'brigada',
          password: 'brigada123',
          role: 'brigada',
          name: 'Samuel Toro Fuentes',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'enfermeria_default',
          username: 'enfermeria',
          password: 'enfermeria123',
          role: 'enfermeria',
          name: 'María Jiménez',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'liga_default',
          username: 'liga',
          password: 'liga123',
          role: 'liga',
          name: 'Coordinador de Liga',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      if (!users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
      
      return JSON.parse(users);
    } catch (error) {
      handleStorageError(error, 'getUsers');
      return [];
    }
  },

  updateUser: function(userId, updates) {
    if (!isClient) return null;
    
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[userIndex];

    } catch (error) {
      handleStorageError(error, 'updateUser');
      throw error;
    }
  },

  deleteUser: function(userId) {
    if (!isClient) return false;
    
    try {
      const users = this.getUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
      return true;

    } catch (error) {
      handleStorageError(error, 'deleteUser');
      return false;
    }
  },

  login: function(username, password) {
    if (!isClient) return null;
    
    try {
      const users = this.getUsers();
      const user = users.find(u => u.username === username && u.password === password && u.active);
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      const sessionData = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        loginAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionData));
      return sessionData;

    } catch (error) {
      handleStorageError(error, 'login');
      throw error;
    }
  },

  logout: function() {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      handleStorageError(error, 'logout');
    }
  },

  getCurrentUser: function() {
    if (!isClient) return null;
    
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      handleStorageError(error, 'getCurrentUser');
      return null;
    }
  },

  /**
   * Utilidades de tiempo
   */
  formatElapsedTime: function(startTime) {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Limpiar todos los datos (para testing o reset)
   */
  clearAllData: function() {
    if (!isClient) return;
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      showNotification('Todos los datos han sido limpiados', 'success');
      
      // Recargar la página para reflejar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      handleStorageError(error, 'clearAllData');
    }
  },

  /**
   * Obtener información del sistema
   */
  getSystemInfo: function() {
    return {
      version: '1.0.0',
      storageKeys: STORAGE_KEYS,
      validStatuses: VALID_STATUSES,
      validAlertLevels: VALID_ALERT_LEVELS,
      validRoles: VALID_ROLES,
      storageUsage: this.getStorageUsage()
    };
  },

  /**
   * Calcular uso de localStorage
   */
  getStorageUsage: function() {
    if (!isClient) return { total: 0, breakdown: {}, formatted: '0 KB' };
    
    try {
      let totalSize = 0;
      const usage = {};

      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const data = localStorage.getItem(key);
        const size = data ? new Blob([data]).size : 0;
        usage[name] = size;
        totalSize += size;
      });

      return {
        total: totalSize,
        breakdown: usage,
        formatted: `${(totalSize / 1024).toFixed(2)} KB`
      };

    } catch (error) {
      return { total: 0, breakdown: {}, formatted: '0 KB' };
    }
  },

  /**
   * Calcular días desde último incidente de una severidad específica
   */
  calculateDaysSinceLastIncident: function(severity, history = null) {
    try {
      const incidentHistory = history || this.getIncidentHistory();
      const lastIncident = incidentHistory.find(incident => incident.severity === severity);
      
      if (!lastIncident) return 999; // Si no hay incidentes de este tipo
      
      const lastDate = new Date(lastIncident.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Calcular tendencia mensual de incidentes
   */
  calculateMonthlyTrend: function(history = null) {
    try {
      const incidentHistory = history || this.getIncidentHistory();
      
      if (!incidentHistory || incidentHistory.length === 0) return 0;
      
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const currentMonthIncidents = incidentHistory.filter(incident => 
        new Date(incident.createdAt).getMonth() === currentMonth
      ).length;
      
      const lastMonthIncidents = incidentHistory.filter(incident => 
        new Date(incident.createdAt).getMonth() === lastMonth
      ).length;
      
      if (lastMonthIncidents === 0) return currentMonthIncidents > 0 ? 100 : 0;
      
      const trend = ((currentMonthIncidents - lastMonthIncidents) / lastMonthIncidents) * 100;
      return Math.round(trend);
      
    } catch (error) {
      return 0;
    }
  },

  /**
   * Calcular índice de seguridad basado en estadísticas
   */
  calculateSafetyScore: function(stats = null) {
    try {
      const statistics = stats || this.getStatistics();
      
      if (!statistics || !statistics.total || statistics.total === 0) return 100;
      
      const graveWeight = 3;
      const moderadaWeight = 2;
      const leveWeight = 1;
      
      const totalWeighted = (statistics.byLevel?.grave || 0) * graveWeight + 
                          (statistics.byLevel?.moderada || 0) * moderadaWeight + 
                          (statistics.byLevel?.leve || 0) * leveWeight;
      
      const maxPossibleScore = 100;
      const score = Math.max(0, maxPossibleScore - (totalWeighted * 2)); // Factor de 2 para hacer más sensible
      
      return Math.round(score);
      
    } catch (error) {
      return 50; // Valor neutro en caso de error
    }
  }
};

// Exportar el módulo para Next.js
export default SharedModule;

// También mantener compatibilidad con window para componentes que lo necesiten
if (isClient) {
  window.SharedModule = SharedModule;
}
