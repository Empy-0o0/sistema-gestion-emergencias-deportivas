# Sistema de Gestión de Emergencias Deportivas - Next.js

## 🚀 Descripción del Proyecto

Sistema integral de gestión de emergencias médicas deportivas desarrollado en **Next.js** con autenticación completa y panel de administración. Conecta múltiples paneles para el manejo coordinado de incidentes en eventos deportivos.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Login seguro** con credenciales por rol
- **Rutas protegidas** con autorización basada en roles
- **Gestión de sesiones** persistente
- **4 roles de usuario**: Administrador, Brigada, Enfermería, Liga

### 👨‍💼 Panel de Administración - CRUD Completo
- ✅ **Crear usuarios** - Formulario completo con validación
- ✅ **Leer usuarios** - Lista organizada con información detallada
- ✅ **Actualizar usuarios** - Edición de perfiles y roles
- ✅ **Eliminar usuarios** - Gestión segura de eliminación
- 📊 **Estadísticas del sistema** en tiempo real

### 🚨 Paneles Operativos
1. **Dashboard Principal** - Resumen del sistema con métricas
2. **Panel de Brigada** - Activación de alertas (Leve, Moderada, Grave)
3. **Panel de Enfermería** - Recepción de alertas y registro de incidentes
4. **Panel de Liga** - Estadísticas con gráficos interactivos
5. **Panel de Administración** - Gestión completa de usuarios

## 🛠️ Tecnologías Utilizadas

- **Next.js 15.5.0** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **Chart.js** - Gráficos interactivos
- **Context API** - Gestión de estado global
- **CSS Modules** - Estilos modulares
- **Google Fonts** - Tipografía moderna
- **LocalStorage** - Persistencia de datos (demo)

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Empy-0o0/sistema-emergencias-deportivas.git

# Navegar al directorio
cd sistema-emergencias-deportivas

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Servidor de producción
npm run lint     # Verificar código
```

## 🔑 Credenciales de Demostración

| Rol | Usuario | Contraseña | Permisos |
|-----|---------|------------|----------|
| **Administrador** | `admin` | `admin123` | Acceso completo al sistema |
| **Brigada** | `brigada` | `brigada123` | Activación de alertas |
| **Enfermería** | `enfermeria` | `enfermeria123` | Registro de incidentes |
| **Liga** | `liga` | `liga123` | Estadísticas y reportes |

## 📱 Funcionalidades por Panel

### 🏠 Dashboard
- Resumen del sistema con estadísticas clave
- Navegación rápida a todos los paneles
- Indicadores de estado en tiempo real

### 🚨 Panel de Brigada
- Activación de alertas por nivel de gravedad
- Historial de alertas recientes
- Gestión de equipos de emergencia
- Sirena automática para alertas graves

### 🏥 Panel de Enfermería
- Recepción automática de alertas
- Formulario completo de registro de incidentes
- Gestión de estado del brigadista
- Confirmación y seguimiento de emergencias

### 📊 Panel de Liga
- Gráficos interactivos de estadísticas
- Protocolo de gestión de incidentes (9 pasos)
- Tendencias mensuales de lesiones
- Indicadores de seguridad

### ⚙️ Panel de Administración
- CRUD completo de usuarios
- Asignación de roles y permisos
- Estadísticas del sistema
- Herramientas de administración

## 🎨 Diseño y UX

- **Interfaz moderna** sin dependencias de iconos externos
- **Diseño responsive** adaptable a todos los dispositivos
- **Tipografía limpia** con Google Fonts (Inter)
- **Sistema de colores** coherente y accesible
- **Navegación intuitiva** con breadcrumbs y menús claros

## 🔧 Arquitectura Técnica

### Estructura del Proyecto
```
src/
├── app/                 # App Router de Next.js
│   ├── layout.js       # Layout principal
│   ├── page.js         # Dashboard
│   ├── login/          # Página de login
│   ├── admin/          # Panel de administración
│   ├── brigada/        # Panel de brigada
│   ├── enfermeria/     # Panel de enfermería
│   └── liga/           # Panel de liga
├── components/         # Componentes reutilizables
├── context/           # Context API para estado global
├── utils/             # Utilidades y módulo compartido
└── styles/            # Estilos globales
```

### Comunicación en Tiempo Real
- **SharedModule** refactorizado para Next.js
- **Custom Events** para comunicación entre componentes
- **LocalStorage** para persistencia de datos
- **Context API** para gestión de estado de autenticación

## 🏥 Información Médica

### Niveles de Alerta
- **🟢 Leve**: Lesiones menores, atención básica
- **🟡 Moderada**: Lesiones que requieren atención especializada
- **🔴 Grave**: Emergencias críticas con movilización completa

### Protocolo de 9 Pasos
1. Identificación de Emergencia
2. Activación de Protocolos
3. Evaluación Inicial y Primeros Auxilios
4. Estabilización del Deportista
5. Registro de Datos del Incidente
6. Notificación a Padres/Tutores
7. Traslado si es Necesario
8. Seguimiento y Rehabilitación
9. Cierre del Incidente

## 🏢 Información de la Empresa

**Ergo SaniTas SpA**
- 📍 San Bernardo, Santiago, Chile
- 📞 +56 9 6114 9975
- 🌐 www.ergosanitas.com

## 📄 Licencia

© 2025 Ergo SaniTas SpA - Todos los derechos reservados

---

*Sistema desarrollado para la gestión profesional de emergencias médicas en eventos deportivos, garantizando respuesta rápida y coordinada para la seguridad de los deportistas.*

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contacta a través de los canales oficiales de Ergo SaniTas SpA.
