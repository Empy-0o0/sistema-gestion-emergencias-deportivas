'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SharedModule from '@/utils/shared';

export default function DashboardPage() {
  const [systemData, setSystemData] = useState({
    daysWithoutIncidents: '--',
    totalIncidents: '--',
    activeAlerts: '--',
    activeClubs: '--',
    alertsActivated: '--',
    responseTime: '--',
    incidentsRegistered: '--',
    nurseStatus: '--',
    monthlyTrend: '--',
    safetyScore: '--'
  });
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    // Inicializar datos del sistema
    updateSystemOverview();
    
    // Configurar listeners para actualizaciones en tiempo real
    SharedModule.registerAlertListener(handleAlertUpdate);
    
    // Actualizar cada 30 segundos
    const interval = setInterval(updateSystemOverview, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateSystemOverview = () => {
    try {
      const stats = SharedModule.getStatistics();
      const clubData = SharedModule.getClubData();
      const alert = SharedModule.getAlert();
      const incidentHistory = SharedModule.getIncidentHistory();
      const brigadistaStatus = SharedModule.getStatus();

      // Calcular días sin incidentes graves
      const daysWithoutGrave = SharedModule.calculateDaysSinceLastIncident('grave', incidentHistory);
      
      // Calcular tiempo promedio de respuesta
      const avgResponseTime = calculateAverageResponseTime(incidentHistory);
      
      // Calcular tendencia mensual
      const monthlyTrend = SharedModule.calculateMonthlyTrend(incidentHistory);
      
      // Calcular índice de seguridad
      const safetyScore = SharedModule.calculateSafetyScore(stats);

      setSystemData({
        daysWithoutIncidents: daysWithoutGrave,
        totalIncidents: stats?.total || 0,
        activeAlerts: alert ? 1 : 0,
        activeClubs: clubData?.totalClubs || 0,
        alertsActivated: (stats?.byLevel?.leve || 0) + (stats?.byLevel?.moderada || 0) + (stats?.byLevel?.grave || 0),
        responseTime: avgResponseTime,
        incidentsRegistered: incidentHistory.length,
        nurseStatus: getStatusLabel(brigadistaStatus.status),
        monthlyTrend: monthlyTrend > 0 ? `+${monthlyTrend}%` : `${monthlyTrend}%`,
        safetyScore: safetyScore
      });

      setCurrentAlert(alert);
    } catch (error) {
      console.error('Error actualizando resumen del sistema:', error);
    }
  };

  const handleAlertUpdate = (alertEvent) => {
    console.log('Cambio de alerta detectado en Dashboard:', alertEvent);
    updateSystemOverview();
  };

  const calculateAverageResponseTime = (history) => {
    if (!history || history.length === 0) return '--';
    
    const completedIncidents = history.filter(incident => 
      incident.status === 'completado' && incident.completedAt
    );
    
    if (completedIncidents.length === 0) return '--';
    
    const totalTime = completedIncidents.reduce((sum, incident) => {
      const start = new Date(incident.createdAt);
      const end = new Date(incident.completedAt);
      return sum + (end - start);
    }, 0);
    
    const averageMinutes = Math.round((totalTime / completedIncidents.length) / (1000 * 60));
    return `${averageMinutes}min`;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'available': 'Disponible',
      'busy': 'Ocupado',
      'emergency': 'Emergencia'
    };
    return statusLabels[status] || 'Desconocido';
  };

  return (
    <ProtectedRoute>
      <Layout>
        {/* Alerta activa si existe */}
        {currentAlert && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  Alerta {currentAlert.level.toUpperCase()} Activa
                </h3>
                <p className="text-red-700">
                  {currentAlert.location} - {currentAlert.type}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen del Sistema */}
        <section className="system-overview">
          <div className="overview-header">
            <h2 className="overview-title">Resumen del Sistema</h2>
          </div>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-value success">{systemData.daysWithoutIncidents}</div>
              <div className="overview-label">Días sin incidentes graves</div>
            </div>
            <div className="overview-card">
              <div className="overview-value primary">{systemData.totalIncidents}</div>
              <div className="overview-label">Total de incidentes registrados</div>
            </div>
            <div className="overview-card">
              <div className="overview-value warning">{systemData.activeAlerts}</div>
              <div className="overview-label">Alertas activas</div>
            </div>
            <div className="overview-card">
              <div className="overview-value primary">{systemData.activeClubs}</div>
              <div className="overview-label">Clubes participantes</div>
            </div>
          </div>
        </section>

        {/* Grid de Paneles */}
        <section className="dashboard-grid">
          {/* Panel de Brigada */}
          <div className="panel-card brigada">
            <div className="panel-header">
              <div className="panel-icon brigada">B</div>
              <h2 className="panel-title">Panel de Brigada de Emergencias</h2>
            </div>
            <p className="panel-description">
              Administre alertas de emergencia, coordine la movilización del equipo médico y gestione la respuesta inmediata a incidentes deportivos.
            </p>
            <div className="panel-stats">
              <div className="stat-item">
                <div className="stat-value">{systemData.alertsActivated}</div>
                <div className="stat-label">Alertas Activadas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{systemData.responseTime}</div>
                <div className="stat-label">Tiempo Promedio</div>
              </div>
            </div>
            <Link href="/brigada" className="panel-button brigada">
              Acceder al Panel de Brigada
            </Link>
          </div>

          {/* Panel de Enfermería */}
          <div className="panel-card enfermeria">
            <div className="panel-header">
              <div className="panel-icon enfermeria">E</div>
              <h2 className="panel-title">Panel de Enfermería</h2>
            </div>
            <p className="panel-description">
              Gestione la recepción de alertas, registre incidentes médicos detallados y coordine la atención directa a los deportistas lesionados.
            </p>
            <div className="panel-stats">
              <div className="stat-item">
                <div className="stat-value">{systemData.incidentsRegistered}</div>
                <div className="stat-label">Incidentes Registrados</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{systemData.nurseStatus}</div>
                <div className="stat-label">Estado Actual</div>
              </div>
            </div>
            <Link href="/enfermeria" className="panel-button enfermeria">
              Acceder al Panel de Enfermería
            </Link>
          </div>

          {/* Panel de Liga */}
          <div className="panel-card liga">
            <div className="panel-header">
              <div className="panel-icon liga">L</div>
              <h2 className="panel-title">Panel de Liga y Estadísticas</h2>
            </div>
            <p className="panel-description">
              Consulte estadísticas detalladas, genere informes de incidentes y analice tendencias para mejorar la seguridad deportiva.
            </p>
            <div className="panel-stats">
              <div className="stat-item">
                <div className="stat-value">{systemData.monthlyTrend}</div>
                <div className="stat-label">Tendencia Mensual</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{systemData.safetyScore}</div>
                <div className="stat-label">Índice de Seguridad</div>
              </div>
            </div>
            <Link href="/liga" className="panel-button liga">
              Acceder al Panel de Liga
            </Link>
          </div>

          {/* Panel de Administración (solo para admin) */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="panel-icon" style={{background: 'linear-gradient(135deg, #6f42c1 0%, #9c27b0 100%)'}}>A</div>
              <h2 className="panel-title">Panel de Administración</h2>
            </div>
            <p className="panel-description">
              Gestione usuarios del sistema, asigne roles y permisos, y configure parámetros generales del sistema.
            </p>
            <div className="panel-stats">
              <div className="stat-item">
                <div className="stat-value">4</div>
                <div className="stat-label">Usuarios Activos</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">4</div>
                <div className="stat-label">Roles Configurados</div>
              </div>
            </div>
            <Link href="/admin" className="panel-button" style={{background: 'linear-gradient(135deg, #6f42c1 0%, #9c27b0 100%)'}}>
              Acceder al Panel de Admin
            </Link>
          </div>
        </section>

        {/* Información del Sistema */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="card-title">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-green-600 font-semibold">Operativo</span>
              </div>
              <div className="flex justify-between">
                <span>Última actualización:</span>
                <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Versión:</span>
                <span className="text-gray-600">1.0.0</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Actividad Reciente</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Último incidente:</span>
                <span className="text-gray-600">Hace 2 horas</span>
              </div>
              <div className="flex justify-between">
                <span>Última alerta:</span>
                <span className="text-gray-600">Hace 45 min</span>
              </div>
              <div className="flex justify-between">
                <span>Usuarios conectados:</span>
                <span className="text-gray-600">3</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Link href="/brigada" className="block w-full text-center py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                Activar Alerta
              </Link>
              <Link href="/enfermeria" className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Registrar Incidente
              </Link>
              <Link href="/liga" className="block w-full text-center py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                Ver Estadísticas
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
}
