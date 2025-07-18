const { ipcRenderer } = require('electron');
const { modal_vc_ga } = require("./modal");
const { query_vc_ga } = require('../database/conexion');

const loginHTML_vc_ga = document.getElementById("login");

// 1. Capa de Datos (Repositorio)
class AuthRepositorio_vc_ga {

  obtenerUsuarioPorCredenciales_vc_ga = async (correo_vc_ga, contraseña_vc_ga)=> {
    try {
      return await query_vc_ga(
        'SELECT * FROM td_usuarios_vc_ga WHERE correo_electronico_vc_ga = ? AND clave_vc_ga = ?',
        [correo_vc_ga, contraseña_vc_ga]
      );
    } catch (error_vc_ga) {
      console.error('Error en repositorio:', error_vc_ga);
      throw new Error('Error al consultar la base de datos');
    }
  }
}

// 2. Capa de Servicio (Lógica de Negocio)
class AuthServicio_vc_ga {
  constructor(repositorio_vc_ga) {
    this.repositorio_vc_ga = repositorio_vc_ga;
  }

  async autenticar_vc_ga(correo_vc_ga, contraseña_vc_ga) {
    if (!correo_vc_ga || !contraseña_vc_ga) {
      throw new Error('Correo y contraseña son obligatorios');
    }

    const usuario_vc_ga = await this.repositorio_vc_ga.obtenerUsuarioPorCredenciales_vc_ga(correo_vc_ga, contraseña_vc_ga);
    
    if (!usuario_vc_ga || usuario_vc_ga.length === 0) {
      throw new Error('Credenciales incorrectas');
    }

    return this.limpiarDatosUsuario_vc_ga(usuario_vc_ga[0]);
  }

  limpiarDatosUsuario_vc_ga(usuario_vc_ga) {
    const { clave_vc_ga, ...usuarioLimpio_vc_ga } = usuario_vc_ga;
    return usuarioLimpio_vc_ga;
  }
}

// 3. Capa de Presentación (Controlador)
class LoginControlador_vc_ga {
  constructor(servicioAuth_vc_ga, servicioModal_vc_ga) {
    this.auth_vc_ga = servicioAuth_vc_ga;
    this.modal_vc_ga = servicioModal_vc_ga;
    this.inicializar_vc_ga();
  }

  inicializar_vc_ga() {
    this.configurarToggleContraseña_vc_ga();
    this.configurarFormularioLogin_vc_ga();
  }

  configurarToggleContraseña_vc_ga() {
    const inputContraseña_vc_ga = document.getElementById('clave');
    const botonToggle_vc_ga = document.getElementById('togglePassword');
    
    if (!inputContraseña_vc_ga || !botonToggle_vc_ga) return;

    botonToggle_vc_ga.addEventListener('click', () => {
      const tipo_vc_ga = inputContraseña_vc_ga.getAttribute('type') === 'password' 
        ? 'text' 
        : 'password';
      inputContraseña_vc_ga.setAttribute('type', tipo_vc_ga);
      this.actualizarIconoToggle_vc_ga(botonToggle_vc_ga, tipo_vc_ga);
    });
  }

  actualizarIconoToggle_vc_ga(boton_vc_ga, tipo_vc_ga) {
    boton_vc_ga.innerHTML = tipo_vc_ga === 'password'
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
         </svg>`;
  }

  async configurarFormularioLogin_vc_ga() {
    const formulario_vc_ga = document.querySelector('form');
    if (!formulario_vc_ga) return;

    formulario_vc_ga.addEventListener('submit', async (e_vc_ga) => {
      e_vc_ga.preventDefault();      
      const correo_vc_ga = document.getElementById('correo').value.trim();
      const contraseña_vc_ga = document.getElementById('clave').value;

      try {
        const usuario_vc_ga = await this.auth_vc_ga.autenticar_vc_ga(correo_vc_ga, contraseña_vc_ga);
        GestorSesion_vc_ga.guardarUsuarioActual_vc_ga(usuario_vc_ga);
        window.location.href = 'reportes.html';
      } catch (error_vc_ga) {
        await this.modal_vc_ga.showError_vc_ga('Error al iniciar sesión', error_vc_ga.message);
      }
    });
  }
}

// 4. Capa de Estado (Gestión de Sesión)
class GestorSesion_vc_ga {
  static guardarUsuarioActual_vc_ga(usuario_vc_ga) {
    sessionStorage.setItem('usuarioActual_vc_ga', JSON.stringify(usuario_vc_ga));
  }

  static obtenerUsuarioActual_vc_ga() {
    return JSON.parse(sessionStorage.getItem('usuarioActual_vc_ga'));
  }

  static cerrarSesion_vc_ga() {
    sessionStorage.removeItem('usuarioActual_vc_ga');
  }
}

// Fábrica para inicialización
class AuthFabrica_vc_ga {
  static crear_vc_ga() {
    const repositorio_vc_ga = new AuthRepositorio_vc_ga(
      (sql_vc_ga, params_vc_ga) => ipcRenderer.invoke('query-auth_vc_ga', sql_vc_ga, params_vc_ga)
    );
    const servicio_vc_ga = new AuthServicio_vc_ga(repositorio_vc_ga);
    return new LoginControlador_vc_ga(servicio_vc_ga, modal_vc_ga);
  }
}

// Inicialización condicional
if (document.getElementById('login')) {
  const controladorLogin_vc_ga = AuthFabrica_vc_ga.crear_vc_ga();
}

// Interfaz para futuros proveedores de autenticación
class IProveedorAuth_vc_ga {
  async login_vc_ga(correo_vc_ga, contraseña_vc_ga) {
    throw new Error('Método login_vc_ga debe ser implementado');
  }
}

module.exports = { 
  LoginControlador_vc_ga, 
  AuthServicio_vc_ga, 
  AuthRepositorio_vc_ga, 
  GestorSesion_vc_ga 
};