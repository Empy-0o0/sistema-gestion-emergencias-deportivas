'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SharedModule from '@/utils/shared';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'brigada',
    name: '',
    active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const userList = SharedModule.getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Actualizar usuario existente
        SharedModule.updateUser(editingUser.id, formData);
        setSuccess('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        SharedModule.createUser(formData);
        setSuccess('Usuario creado correctamente');
      }
      
      // Resetear formulario
      resetForm();
      loadUsers();
      
    } catch (error) {
      setError(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // No mostrar la contraseña actual
      role: user.role,
      name: user.name,
      active: user.active
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = (userId) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    try {
      SharedModule.deleteUser(userId);
      setSuccess('Usuario eliminado correctamente');
      loadUsers();
    } catch (error) {
      setError('Error al eliminar el usuario');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'brigada',
      name: '',
      active: true
    });
    setShowPassword(false);
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      'admin': 'Administrador',
      'brigada': 'Brigada de Emergencia',
      'enfermeria': 'Enfermería',
      'liga': 'Liga Deportiva'
    };
    return roleLabels[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      'admin': 'role-admin',
      'brigada': 'role-brigada',
      'enfermeria': 'role-enfermeria',
      'liga': 'role-liga'
    };
    return `role-badge ${classes[role] || ''}`;
  };

  const getSystemStats = () => {
    const activeUsers = users.filter(user => user.active).length;
    const totalRoles = [...new Set(users.map(user => user.role))].length;
    const recentUsers = users.filter(user => {
      const createdDate = new Date(user.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    return { activeUsers, totalRoles, recentUsers };
  };

  const stats = getSystemStats();

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="admin-container">
          {/* Header del Admin */}
          <div className="admin-header">
            <h1 className="admin-title">Panel de Administración</h1>
            <p className="admin-subtitle">
              Gestione usuarios del sistema, asigne roles y configure permisos
            </p>
          </div>

          {/* Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.activeUsers}</div>
              <div className="text-gray-600">Usuarios Activos</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalRoles}</div>
              <div className="text-gray-600">Roles Configurados</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.recentUsers}</div>
              <div className="text-gray-600">Usuarios Nuevos (7 días)</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{users.length}</div>
              <div className="text-gray-600">Total de Usuarios</div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="admin-grid">
            {/* Formulario de Usuario */}
            <div className="user-form">
              <h2 className="text-xl font-semibold mb-6">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name">Nombre Completo</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Nombre de Usuario</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    className="form-control"
                    placeholder="Ej: jperez"
                    required
                    disabled={editingUser && editingUser.username === 'admin'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    {editingUser ? 'Nueva Contraseña (dejar vacío para mantener actual)' : 'Contraseña'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="form-control pr-12"
                      placeholder={editingUser ? 'Nueva contraseña...' : 'Contraseña...'}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="role">Rol del Usuario</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                    disabled={editingUser && editingUser.username === 'admin'}
                  >
                    <option value="brigada">Brigada de Emergencia</option>
                    <option value="enfermeria">Enfermería</option>
                    <option value="liga">Liga Deportiva</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleFormChange}
                      className="mr-2"
                      disabled={editingUser && editingUser.username === 'admin'}
                    />
                    Usuario Activo
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="btn flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading mr-2"></span>
                        Procesando...
                      </>
                    ) : (
                      editingUser ? 'Actualizar Usuario' : 'Crear Usuario'
                    )}
                  </button>
                  
                  {editingUser && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn bg-gray-500 hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de Usuarios */}
            <div className="user-list">
              <h2 className="text-xl font-semibold mb-6">Lista de Usuarios</h2>
              
              <div className="overflow-x-auto">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="font-medium">{user.name}</td>
                        <td>{user.username}</td>
                        <td>
                          <span className={getRoleBadgeClass(user.role)}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="user-actions">
                            <button
                              onClick={() => handleEdit(user)}
                              className="btn btn-small btn-edit"
                            >
                              Editar
                            </button>
                            {user.username !== 'admin' && (
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="btn btn-small btn-delete"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No hay usuarios registrados
                </div>
              )}
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Última actualización:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uso de almacenamiento:</span>
                  <span className="font-medium">{SharedModule.getStorageUsage().formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado del sistema:</span>
                  <span className="font-medium text-green-600">Operativo</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Roles y Permisos</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="role-badge role-admin">Administrador</span>
                  <p className="text-gray-600 mt-1">Acceso completo al sistema</p>
                </div>
                <div>
                  <span className="role-badge role-brigada">Brigada</span>
                  <p className="text-gray-600 mt-1">Activación de alertas de emergencia</p>
                </div>
                <div>
                  <span className="role-badge role-enfermeria">Enfermería</span>
                  <p className="text-gray-600 mt-1">Recepción de alertas y registro de incidentes</p>
                </div>
                <div>
                  <span className="role-badge role-liga">Liga</span>
                  <p className="text-gray-600 mt-1">Estadísticas y gestión de equipos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones del Sistema */}
          <div className="bg-white rounded-lg p-6 shadow-md mt-8">
            <h3 className="text-lg font-semibold mb-4">Acciones del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  if (confirm('¿Está seguro de que desea limpiar todos los datos del sistema?')) {
                    SharedModule.clearAllData();
                  }
                }}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                Limpiar Datos del Sistema
              </button>
              
              <button
                onClick={() => {
                  const data = {
                    users: SharedModule.getUsers(),
                    statistics: SharedModule.getStatistics(),
                    incidents: SharedModule.getIncidentHistory(),
                    clubs: SharedModule.getClubData()
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sistema-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="btn bg-blue-500 hover:bg-blue-600 text-white"
              >
                Exportar Datos
              </button>
              
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="btn bg-green-500 hover:bg-green-600 text-white"
              >
                Recargar Sistema
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
