'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SharedModule from '@/utils/shared';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function LigaPage() {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [safetyIndicators, setSafetyIndicators] = useState({
    daysWithoutGrave: 42,
    daysWithoutModerada: 18,
    daysWithoutLeve: 3
  });

  // Información detallada de cada paso del protocolo
  const stepDetails = {
    A: {
      title: "Identificación de Emergencia",
      content: `
        Primer paso crucial donde se detecta y reconoce una situación de emergencia.
        
        Acciones clave:
        • Reconocer signos de emergencia (inconsciencia, dificultad respiratoria, dolor intenso)
        • Alertar inmediatamente al personal capacitado
        • Asegurar la zona para prevenir más accidentes
        • Evaluar rápidamente la gravedad de la situación
        
        Responsables: Entrenadores, personal médico, cualquier miembro del equipo presente.
      `
    },
    B: {
      title: "Activación de Protocolos",
      content: `
        Puesta en marcha de los procedimientos de emergencia establecidos.
        
        Acciones clave:
        • Designar un líder de emergencia
        • Activar el sistema de respuesta a emergencias
        • Preparar el equipo médico necesario
        • Establecer comunicación con servicios médicos externos si es necesario
        
        Equipo requerido: Botiquín de primeros auxilios, DEA (si está disponible), teléfono móvil.
      `
    },
    C: {
      title: "Evaluación Inicial y Primeros Auxilios",
      content: `
        Evaluación rápida del estado del deportista y aplicación de primeros auxilios.
        
        Acciones clave:
        • Verificar consciencia y respiración
        • Controlar hemorragias evidentes
        • Inmovilizar sospechas de fracturas
        • Aplicar RCP si es necesario
        • Administrar primeros auxilios básicos
        
        Precauciones: No mover al deportista si se sospecha de lesión cervical, proteger del frío/calor.
      `
    },
    D: {
      title: "Estabilización del Deportista",
      content: `
        Acciones para estabilizar al deportista mientras llega ayuda especializada.
        
        Acciones clave:
        • Mantener vía aérea permeable
        • Controlar signos vitales (pulso, respiración)
        • Tratar el shock si está presente
        • Administrar oxígeno si está disponible y se requiere
        • Mantener al deportista cómodo y tranquilo
        
        Objetivo: Evitar el empeoramiento de la condición mientras se espera ayuda médica.
      `
    },
    E: {
      title: "Registro de Datos del Incidente",
      content: `
        Documentación detallada de todo lo ocurrido y acciones tomadas.
        
        Información a registrar:
        • Hora y lugar exacto del incidente
        • Descripción detallada de lo ocurrido
        • Acciones de primeros auxilios aplicadas
        • Personas involucradas y testigos
        • Condiciones ambientales relevantes
        • Equipo utilizado
        
        Importancia: Fundamental para seguimiento médico, análisis de riesgos y aspectos legales.
      `
    },
    F: {
      title: "Notificación a Padres/Tutores y Servicios Médicos",
      content: `
        Comunicación con las partes relevantes de manera clara y oportuna.
        
        Acciones clave:
        • Contactar a padres/tutores con información clara y tranquilizadora
        • Informar a servicios médicos con datos precisos para preparar su respuesta
        • Notificar a dirección del centro/organización deportiva
        • Coordinar punto de encuentro para el traslado
        
        Protocolo de comunicación: Mantener la calma, ser claro y conciso, evitar especulaciones, ofrecer apoyo.
      `
    },
    G: {
      title: "Traslado si es Necesario",
      content: `
        Transporte seguro del deportista a un centro médico cuando se requiere.
        
        Opciones de traslado:
        • Ambulancia medicalizada (casos graves)
        • Vehículo particular (casos leves con supervisión)
        • Transporte del club/organización con acompañante médico
        
        Consideraciones: No trasladar sin estabilización previa, llevar documentación médica, enviar acompañante.
      `
    },
    H: {
      title: "Seguimiento y Rehabilitación",
      content: `
        Proceso posterior al incidente para la recuperación completa del deportista.
        
        Acciones clave:
        • Visitas de seguimiento médico
        • Programa de rehabilitación adaptado
        • Soporte psicológico si es necesario
        • Comunicación constante con familia y especialistas
        • Evaluación para retorno deportivo seguro
        
        Duración: Varía según la gravedad de la lesión, desde días hasta meses.
      `
    },
    I: {
      title: "Cierre del Incidente",
      content: `
        Finalización formal del proceso de gestión del incidente.
        
        Acciones clave:
        • Revisión completa de la documentación
        • Análisis de lo sucedido y lecciones aprendidas
        • Actualización de protocolos si es necesario
        • Comunicación de cierre a todas las partes involucradas
        • Archivo de toda la documentación relacionada
        
        Objetivo: Garantizar que se han completado todas las acciones y mejorar la respuesta futura.
      `
    }
  };

  useEffect(() => {
    // Cargar datos iniciales
    loadData();
    
    // Configurar listeners para actualizaciones en tiempo real
    SharedModule.registerAlertListener(handleAlertUpdate);
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    try {
      const stats = SharedModule.getStatistics();
      const history = SharedModule.getIncidentHistory();
      const alert = SharedModule.getAlert();
      
      setStatistics(stats);
      setIncidentHistory(history);
      setCurrentAlert(alert);
      
      // Actualizar indicadores de seguridad
      setSafetyIndicators({
        daysWithoutGrave: SharedModule.calculateDaysSinceLastIncident('grave', history),
        daysWithoutModerada: SharedModule.calculateDaysSinceLastIncident('moderada', history),
        daysWithoutLeve: SharedModule.calculateDaysSinceLastIncident('leve', history)
      });
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleAlertUpdate = (alertEvent) => {
    console.log('Cambio de alerta detectado en Panel de Liga:', alertEvent);
    loadData();
  };

  const showStepDetails = (stepId) => {
    setSelectedStep(stepId);
  };

  // Generar datos para gráficos
  const generateChartData = () => {
    if (!statistics) return null;

    const sportChartData = {
      labels: Object.keys(statistics.bySport || {}),
      datasets: [{
        data: Object.values(statistics.bySport || {}),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(201, 203, 207, 0.7)',
          'rgba(255, 205, 86, 0.7)'
        ],
        borderWidth: 1
      }]
    };

    const typeChartData = {
      labels: Object.keys(statistics.byType || {}),
      datasets: [{
        data: Object.values(statistics.byType || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderWidth: 1
      }]
    };

    const monthlyData = generateMonthlyData();
    const trendChartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Lesiones Leves',
        data: monthlyData.leve,
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.3,
        fill: true
      }, {
        label: 'Lesiones Moderadas',
        data: monthlyData.moderada,
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.3,
        fill: true
      }, {
        label: 'Lesiones Graves',
        data: monthlyData.grave,
        borderColor: 'rgba(220, 53, 69, 1)',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };

    return { sportChartData, typeChartData, trendChartData };
  };

  const generateMonthlyData = () => {
    const monthlyData = {
      leve: new Array(12).fill(0),
      moderada: new Array(12).fill(0),
      grave: new Array(12).fill(0)
    };
    
    incidentHistory.forEach(incident => {
      const month = new Date(incident.createdAt).getMonth();
      const severity = incident.severity || 'leve';
      if (monthlyData[severity]) {
        monthlyData[severity][month]++;
      }
    });
    
    return monthlyData;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      title: { display: true }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Número de Lesiones' }
      },
      x: {
        title: { display: true, text: 'Meses del Año' }
      }
    }
  };

  const chartData = generateChartData();

  return (
    <ProtectedRoute allowedRoles={['admin', 'liga']}>
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

        {/* Indicadores de Seguridad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-2">💚</div>
            <div className="text-3xl font-bold text-green-600 mb-2">{safetyIndicators.daysWithoutGrave}</div>
            <div className="text-gray-600">Días sin lesiones graves</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">{safetyIndicators.daysWithoutModerada}</div>
            <div className="text-gray-600">Días sin lesiones moderadas</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="text-4xl mb-2">🩹</div>
            <div className="text-3xl font-bold text-red-600 mb-2">{safetyIndicators.daysWithoutLeve}</div>
            <div className="text-gray-600">Días sin lesiones leves</div>
          </div>
        </div>

        <div className="main-content">
          <div className="card">
            <h2 className="card-title">Protocolo de Gestión de Incidentes</h2>
            
            {/* Diagrama de flujo interactivo */}
            <div className="relative min-h-[500px] bg-gray-50 border border-gray-200 rounded-lg p-5 overflow-auto flex justify-center items-center mb-6">
              <div className="relative w-full max-w-md">
                {/* Pasos del diagrama */}
                {[
                  { id: 'A', title: 'Identificación de Emergencia', top: '10px', color: '#FFEBEE', border: '#E53935' },
                  { id: 'B', title: 'Activación de Protocolos', top: '100px', color: '#E3F2FD', border: '#1E88E5' },
                  { id: 'C', title: 'Evaluación Inicial', top: '190px', color: '#E8F5E9', border: '#43A047' },
                  { id: 'D', title: 'Estabilización', top: '280px', color: '#FFF8E1', border: '#FFB300' },
                  { id: 'E', title: 'Registro de Datos', top: '370px', color: '#F3E5F5', border: '#8E24AA' },
                  { id: 'F', title: 'Notificación', top: '460px', color: '#E0F7FA', border: '#00ACC1' },
                  { id: 'G', title: 'Traslado', top: '550px', color: '#E8EAF6', border: '#3949AB' },
                  { id: 'H', title: 'Seguimiento', top: '640px', color: '#E0F2F1', border: '#00897B' },
                  { id: 'I', title: 'Cierre', top: '730px', color: '#FBE9E7', border: '#FF5722' }
                ].map((step, index) => (
                  <div key={step.id}>
                    <div
                      className="absolute w-48 h-16 rounded-lg flex items-center justify-center text-center font-semibold cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm px-3"
                      style={{
                        top: step.top,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: step.color,
                        border: `2px solid ${step.border}`,
                        zIndex: 10
                      }}
                      onClick={() => showStepDetails(step.id)}
                    >
                      <span className="mr-2 text-lg">{step.id}</span>
                      {step.title}
                    </div>
                    {index < 8 && (
                      <div
                        className="absolute w-1 bg-blue-400"
                        style={{
                          top: `${parseInt(step.top) + 66}px`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          height: '24px',
                          zIndex: 5
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel de detalles del paso seleccionado */}
            {selectedStep && stepDetails[selectedStep] && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4 pb-3 border-b-2 border-blue-300">
                  <div className="text-2xl text-blue-600">ℹ️</div>
                  <h3 className="text-xl font-semibold text-blue-900">
                    {stepDetails[selectedStep].title}
                  </h3>
                </div>
                <div className="text-blue-800 whitespace-pre-line leading-relaxed">
                  {stepDetails[selectedStep].content}
                </div>
              </div>
            )}

            {/* Estadísticas de Lesiones */}
            <h2 className="card-title mt-8">Estadísticas de Lesiones</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>⚽</span> Lesiones por Deporte
                </h3>
                <div className="h-64">
                  {chartData?.sportChartData && (
                    <Doughnut data={chartData.sportChartData} options={chartOptions} />
                  )}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🦴</span> Lesiones por Tipo
                </h3>
                <div className="h-64">
                  {chartData?.typeChartData && (
                    <Pie data={chartData.typeChartData} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="card-title">Brigada de Emergencia</h2>
            
            <div className="space-y-4 mb-8">
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
            
            <h2 className="card-title">Protocolo de Comunicación</h2>
            
            <div className="bg-blue-50 p-5 rounded-lg">
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

        {/* Incidentes Recientes */}
        <div className="card mt-8">
          <h2 className="card-title">Incidentes Recientes</h2>
          <div className="space-y-4">
            {incidentHistory.slice(0, 5).map((incident, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{incident.incidentType || incident.type || 'Incidente médico'}</h3>
                  <span className="text-sm text-gray-500">{new Date(incident.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div><strong>Deportista:</strong> {incident.athleteName || 'N/A'}</div>
                  <div><strong>Deporte:</strong> {incident.sportType || 'N/A'}</div>
                  <div><strong>Ubicación:</strong> {incident.incidentLocation || incident.location || 'N/A'}</div>
                  <div><strong>Gravedad:</strong> <span className={`font-semibold ${
                    incident.severity === 'grave' ? 'text-red-600' :
                    incident.severity === 'moderada' ? 'text-yellow-600' : 'text-green-600'
                  }`}>{incident.severity || 'N/A'}</span></div>
                </div>
                <p className="text-gray-700">{incident.incidentDescription || incident.type || 'Sin descripción'}</p>
              </div>
            ))}
            
            {incidentHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No hay incidentes registrados
              </div>
            )}
          </div>
          
          {/* Tendencia Mensual */}
          <h2 className="card-title mt-8">Tendencia Mensual de Lesiones</h2>
          <div className="h-80 mt-4">
            {chartData?.trendChartData && (
              <Line data={chartData.trendChartData} options={lineChartOptions} />
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
