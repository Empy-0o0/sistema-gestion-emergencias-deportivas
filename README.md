# Sistema de Gestión de Emergencias Deportivas - Ergo SaniTas SpA

## Descripción del Proyecto

Sistema integral de gestión de emergencias médicas deportivas que conecta tres paneles principales para el manejo coordinado de incidentes en eventos deportivos.

## Arquitectura del Sistema

### Componentes Principales

1. **PanelBrigadaEmerg.html** - Panel de Activación de Alertas
   - Permite activar alertas de emergencia (leve, moderada, grave)
   - Gestiona información de clubes y canchas
   - Coordina respuesta de equipos de emergencia
   - Incluye sirena para alertas graves

2. **PanelEnfermeria.html** - Panel de Recepción y Atención
   - Recibe alertas automáticamente del Panel de Brigada
   - Gestiona el estado del brigadista (disponible, ocupado, emergencia)
   - Registra incidentes médicos detallados
   - Controla el flujo de atención de emergencias

3. **PanelLiga.html** - Panel de Estadísticas y Gestión
   - Genera estadísticas basadas en datos de los otros paneles
   - Muestra protocolos de gestión de incidentes
   - Presenta gráficos y tendencias de lesiones
   - Gestiona información de clubes participantes

4. **shared.js** - Módulo de Comunicación Compartida
   - Centraliza la comunicación entre paneles
   - Maneja localStorage para persistencia de datos
   - Proporciona eventos en tiempo real
   - Gestiona estadísticas y historial de incidentes

## Características Principales

### Comunicación en Tiempo Real
- Los paneles se comunican automáticamente usando localStorage y eventos personalizados
- Las alertas activadas en PanelBrigadaEmerg.html aparecen instantáneamente en PanelEnfermeria.html
- Las estadísticas se actualizan dinámicamente en PanelLiga.html

### Gestión de Alertas
- **Alertas Leves**: Lesiones menores que requieren atención básica
- **Alertas Moderadas**: Lesiones que requieren atención médica especializada
- **Alertas Graves**: Emergencias críticas con activación de sirena y movilización completa

### Registro de Incidentes
- Formulario completo para registro de incidentes médicos
- Seguimiento del estado de cada incidente
- Historial persistente de todos los eventos

### Estadísticas y Análisis
- Gráficos de distribución por deporte y tipo de lesión
- Tendencias mensuales de incidentes
- Indicadores de seguridad (días sin lesiones)
- Análisis de patrones de lesiones

## Flujo de Trabajo

1. **Detección de Emergencia**: Se identifica una situación de emergencia en el evento deportivo

2. **Activación de Alerta**: El coordinador activa una alerta desde PanelBrigadaEmerg.html especificando:
   - Nivel de gravedad (leve, moderada, grave)
   - Ubicación específica
   - Tipo de emergencia
   - Club/cancha afectada

3. **Recepción Automática**: PanelEnfermeria.html recibe la alerta automáticamente y muestra:
   - Información completa de la emergencia
   - Temporizador de respuesta
   - Botones de acción (confirmar, llegada, apoyo, completar)

4. **Respuesta Coordinada**: El personal médico:
   - Confirma recepción de la alerta
   - Se dirige a la ubicación
   - Marca llegada al lugar
   - Solicita apoyo si es necesario
   - Completa la atención

5. **Registro y Estadísticas**: 
   - Se registra el incidente completo
   - Se actualiza el historial
   - Se generan estadísticas automáticamente
   - PanelLiga.html refleja los nuevos datos

## Tecnologías Utilizadas

- **HTML5**: Estructura de las páginas
- **CSS3**: Diseño responsivo y moderno con variables CSS
- **JavaScript ES6+**: Lógica de aplicación y comunicación
- **Chart.js**: Gráficos y visualizaciones
- **Font Awesome**: Iconografía
- **LocalStorage API**: Persistencia de datos
- **Custom Events**: Comunicación entre paneles

## Instalación y Uso

1. **Clonar o descargar** todos los archivos del proyecto
2. **Abrir los paneles** en pestañas separadas del navegador:
   - `PanelBrigadaEmerg.html` - Para coordinadores de emergencia
   - `PanelEnfermeria.html` - Para personal médico
   - `PanelLiga.html` - Para gestión y estadísticas
3. **Probar la comunicación** activando una alerta en el Panel de Brigada

## Estructura de Archivos

```
proyecto/
├── PanelBrigadaEmerg.html    # Panel de activación de alertas
├── PanelEnfermeria.html      # Panel de recepción y atención
├── PanelLiga.html            # Panel de estadísticas y gestión
├── shared.js                 # Módulo de comunicación compartida
└── README.md                 # Documentación del proyecto
```

## Funcionalidades Avanzadas

### Sistema de Notificaciones
- Notificaciones visuales en tiempo real
- Diferentes tipos de notificaciones (éxito, advertencia, error, información)
- Desaparición automática después de 4 segundos
x  
### Gestión de Estados
- Estado del brigadista sincronizado entre paneles
- Estados de equipos de emergencia
- Seguimiento de alertas activas

### Validación y Manejo de Errores
- Validación de datos de entrada
- Manejo robusto de errores de localStorage
- Mensajes de error informativos para el usuario

### Responsive Design
- Diseño adaptable a diferentes tamaños de pantalla
- Optimizado para tablets y dispositivos móviles
- Interfaz intuitiva y accesible

## Datos de Clubes Participantes

El sistema incluye información de los siguientes clubes:
- **Escuela Los Halcones** (Sub-15) - Cancha 1
- **Escuela Águilas Doradas** (Sub-17) - Cancha 2  
- **Escuela Tormenta FC** (Sub-13) - Cancha 3
- **Escuela Estrellas Rojas** (Sub-19) - Cancha 4

## Protocolo de Emergencias

El sistema implementa un protocolo de 9 pasos:
1. Identificación de Emergencia
2. Activación de Protocolos
3. Evaluación Inicial y Primeros Auxilios
4. Estabilización del Deportista
5. Registro de Datos del Incidente
6. Notificación a Padres/Tutores
7. Traslado si es Necesario
8. Seguimiento y Rehabilitación
9. Cierre del Incidente

## Soporte y Contacto

**Ergo SaniTas SpA**
- Ubicación: San Bernardo, Santiago, Chile
- Teléfono: +56 9 6114 9975
- Web: www.ergosanitas.com

## Licencia

© 2025 Ergo SaniTas SpA - Todos los derechos reservados

---

*Sistema desarrollado para la gestión profesional de emergencias médicas en eventos deportivos, garantizando respuesta rápida y coordinada para la seguridad de los deportistas.*
