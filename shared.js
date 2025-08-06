/**
 * Módulo Compartido para Sistema de Gestión de Emergencias Deportivas
 * Ergo SaniTas SpA - 2025
 * 
 * Este módulo centraliza la comunicación entre los paneles del sistema:
 * - PanelBrigadaEmerg.html (Activación de alertas)
 * - PanelEnfermeria.html (Recepción de alertas y registro de incidentes)
 * - PanelLiga.html (Estadísticas y gestión de clubes)
 */

(function() {
    'use strict';

    // Claves para localStorage
    const STORAGE_KEYS = {
        CURRENT_ALERT: 'ergosanitas_current_alert',
        BRIGADISTA_STATUS: 'ergosanitas_brigadista_status',
        INCIDENT_HISTORY: 'ergosanitas_incident_history',
        CLUB_DATA: 'ergosanitas_club_data',
        STATISTICS: 'ergosanitas_statistics'
    };

    // Estados válidos del brigadista
    const VALID_STATUSES = ['available', 'busy', 'emergency'];
    
    // Niveles de alerta válidos
    const VALID_ALERT_LEVELS = ['leve', 'moderada', 'grave'];

    /**
     * Función auxiliar para manejar errores de localStorage
     */
    function handleStorageError(error, operation) {
        console.error(`Error en operación de localStorage (${operation}):`, error);
        
        // Mostrar mensaje amigable al usuario
        const message = 'Error de almacenamiento local. Algunos datos pueden no sincronizarse correctamente.';
        
        // Crear notificación temporal
        showNotification(message, 'error');
    }

    /**
     * Mostrar notificación temporal al usuario
     */
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#1a6dcc'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
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
     * Generar ID único para incidentes
     */
    function generateIncidentId() {
        return 'INC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Módulo principal
    const SharedModule = {
        
        /**
         * Establecer alerta activa
         * @param {Object} alertData - Datos de la alerta
         * @param {string} alertData.level - Nivel de alerta (leve, moderada, grave)
         * @param {string} alertData.location - Ubicación de la emergencia
         * @param {string} alertData.type - Tipo de emergencia
         * @param {number} alertData.timestamp - Timestamp de creación
         * @param {Object} alertData.additionalInfo - Información adicional opcional
         */
        setAlert: function(alertData) {
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
                
                // Disparar evento personalizado para notificar a otros paneles
                window.dispatchEvent(new CustomEvent('alertChanged', {
                    detail: { type: 'set', data: enrichedAlert }
                }));

                console.log('Alerta establecida:', enrichedAlert);
                return enrichedAlert;

            } catch (error) {
                handleStorageError(error, 'setAlert');
                throw error;
            }
        },

        /**
         * Obtener alerta activa
         * @returns {Object|null} Datos de la alerta activa o null si no hay ninguna
         */
        getAlert: function() {
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
            try {
                const currentAlert = this.getAlert();
                
                localStorage.removeItem(STORAGE_KEYS.CURRENT_ALERT);
                
                // Disparar evento de limpieza
                window.dispatchEvent(new CustomEvent('alertChanged', {
                    detail: { type: 'clear', data: currentAlert }
                }));

                console.log('Alerta limpiada');

            } catch (error) {
                handleStorageError(error, 'clearAlert');
            }
        },

        /**
         * Actualizar estado de alerta existente
         */
        updateAlert: function(updates) {
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
                
                window.dispatchEvent(new CustomEvent('alertChanged', {
                    detail: { type: 'update', data: updatedAlert }
                }));

                return updatedAlert;

            } catch (error) {
                handleStorageError(error, 'updateAlert');
                throw error;
            }
        },

        /**
         * Registrar listener para cambios de alerta
         * @param {Function} callback - Función a ejecutar cuando cambie la alerta
         */
        registerAlertListener: function(callback) {
            if (typeof callback !== 'function') {
                throw new Error('El callback debe ser una función');
            }

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
         * @param {string} status - Estado (available, busy, emergency)
         * @param {Object} additionalInfo - Información adicional
         */
        setStatus: function(status, additionalInfo = {}) {
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
                
                window.dispatchEvent(new CustomEvent('statusChanged', {
                    detail: statusData
                }));

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
            if (typeof callback !== 'function') {
                throw new Error('El callback debe ser una función');
            }

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
                
                window.dispatchEvent(new CustomEvent('incidentAdded', {
                    detail: incident
                }));

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
                
                window.dispatchEvent(new CustomEvent('statisticsUpdated', {
                    detail: stats
                }));

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
            try {
                const data = {
                    ...clubData,
                    updatedAt: new Date().toISOString()
                };

                localStorage.setItem(STORAGE_KEYS.CLUB_DATA, JSON.stringify(data));
                
                window.dispatchEvent(new CustomEvent('clubDataChanged', {
                    detail: data
                }));

                return data;

            } catch (error) {
                handleStorageError(error, 'setClubData');
                throw error;
            }
        },

        getClubData: function() {
            try {
                const data = localStorage.getItem(STORAGE_KEYS.CLUB_DATA);
                return data ? JSON.parse(data) : {
                    clubs: [
                        { name: 'Escuela Los Halcones', field: 'Cancha 1', status: 'active' },
                        { name: 'Escuela Águilas Doradas', field: 'Cancha 2', status: 'active' },
                        { name: 'Escuela Tormenta FC', field: 'Cancha 3', status: 'active' },
                        { name: 'Escuela Estrellas Rojas', field: 'Cancha 4', status: 'active' }
                    ],
                    totalClubs: 4,
                    activeFields: 4
                };
            } catch (error) {
                handleStorageError(error, 'getClubData');
                return { clubs: [], totalClubs: 0, activeFields: 0 };
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
                storageUsage: this.getStorageUsage()
            };
        },

        /**
         * Calcular uso de localStorage
         */
        getStorageUsage: function() {
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
         * Obtener resumen completo del sistema para el dashboard
         */
        getSystemSummary: function() {
            try {
                const currentAlert = this.getAlert();
                const statistics = this.getStatistics();
                const clubData = this.getClubData();
                const incidentHistory = this.getIncidentHistory();
                const brigadistaStatus = this.getStatus();
                const systemInfo = this.getSystemInfo();
                const storageUsage = this.getStorageUsage();

                // Calcular métricas adicionales
                const totalIncidents = incidentHistory.length;
                const activeAlerts = currentAlert ? 1 : 0;
                
                // Calcular días sin incidentes por severidad
                const daysWithoutGrave = this.calculateDaysSinceLastIncident('grave', incidentHistory);
                const daysWithoutModerada = this.calculateDaysSinceLastIncident('moderada', incidentHistory);
                const daysWithoutLeve = this.calculateDaysSinceLastIncident('leve', incidentHistory);

                // Calcular tendencias
                const monthlyTrend = this.calculateMonthlyTrend(incidentHistory);
                const safetyScore = this.calculateSafetyScore(statistics);

                return {
                    // Estado actual del sistema
                    systemStatus: {
                        operational: true,
                        lastUpdate: new Date().toISOString(),
                        version: systemInfo.version
                    },
                    
                    // Alertas y estado
                    alerts: {
                        current: currentAlert,
                        active: activeAlerts,
                        brigadistaStatus: brigadistaStatus
                    },
                    
                    // Estadísticas generales
                    statistics: {
                        totalIncidents,
                        byLevel: statistics?.byLevel || {},
                        bySport: statistics?.bySport || {},
                        byType: statistics?.byType || {},
                        byMonth: statistics?.byMonth || {}
                    },
                    
                    // Métricas de seguridad
                    safety: {
                        daysWithoutGrave,
                        daysWithoutModerada,
                        daysWithoutLeve,
                        safetyScore,
                        monthlyTrend
                    },
                    
                    // Información de clubes
                    clubs: {
                        total: clubData?.totalClubs || 0,
                        active: clubData?.activeFields || 0,
                        list: clubData?.clubs || []
                    },
                    
                    // Información técnica
                    technical: {
                        storageUsage,
                        incidentHistorySize: incidentHistory.length,
                        lastIncidentDate: incidentHistory.length > 0 ? incidentHistory[0].createdAt : null
                    }
                };

            } catch (error) {
                handleStorageError(error, 'getSystemSummary');
                return {
                    systemStatus: { operational: false, error: error.message },
                    alerts: { current: null, active: 0 },
                    statistics: { totalIncidents: 0 },
                    safety: { safetyScore: 0 },
                    clubs: { total: 0, active: 0 },
                    technical: { error: true }
                };
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

    // Exponer el módulo globalmente
    window.SharedModule = SharedModule;

    // Inicialización automática
    document.addEventListener('DOMContentLoaded', function() {
        console.log('SharedModule inicializado correctamente');
        console.log('Información del sistema:', SharedModule.getSystemInfo());
    });

})();
