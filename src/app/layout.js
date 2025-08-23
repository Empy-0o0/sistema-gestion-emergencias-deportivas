import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

export const metadata = {
  title: 'Sistema de Gestión de Emergencias Deportivas - Ergo SaniTas SpA',
  description: 'Sistema integral de gestión de emergencias médicas deportivas que conecta tres paneles principales para el manejo coordinado de incidentes en eventos deportivos.',
  keywords: ['emergencias', 'deportivas', 'medicina', 'gestión', 'ergo sanitas'],
  authors: [{ name: 'Ergo SaniTas SpA' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
