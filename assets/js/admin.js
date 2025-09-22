/*
 * ============================================
 * PANEL DE ADMINISTRACIÓN - SISTEMA DE REGISTRO
 * ============================================
 * 
 * Desarrollado por: Victor Cañola
 * Institución: I.E. Héctor Abad Gómez
 * Fecha: Enero 2025
 * © 2025 Victor Cañola - Todos los derechos reservados
 * 
 * Este panel administrativo fue desarrollado específicamente
 * para la gestión de registros de sensibilización de la
 * Institución Educativa Héctor Abad Gómez.
 * 
 * PROHIBIDA SU REPRODUCCIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN
 * ============================================
 */

const supabaseUrl = 'https://fxcojeuycvebpzyhxylm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y29qZXV5Y3ZlYnB6eWh4eWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzg2NDIsImV4cCI6MjA3MzY1NDY0Mn0.ozeujNYyCkvT6bviiNdBw2ZLZ9090KIsJc1LFZAcoGo';
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

let registros = [];
let registrosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 10;

// Verificar autenticación
function verificarAutenticacion() {
  const isAuthenticated = localStorage.getItem('admin_authenticated');
  const loginTime = localStorage.getItem('admin_login_time');
  
  if (isAuthenticated !== 'true' || !loginTime) {
    window.location.href = 'login.html';
    return false;
  }
  
  // Verificar si la sesión no ha expirado (24 horas)
  const now = Date.now();
  const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
  
  if (now - parseInt(loginTime) > sessionDuration) {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('admin_authenticated');
  localStorage.removeItem('admin_login_time');
  window.location.href = 'login.html';
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', async () => {
  if (!verificarAutenticacion()) return;
  
  await cargarRegistros();
  configurarEventos();
  actualizarInfoSesion();
});

// Actualizar información de sesión
function actualizarInfoSesion() {
  const loginTime = localStorage.getItem('admin_login_time');
  if (loginTime) {
    const fecha = new Date(parseInt(loginTime));
    console.log('Sesión iniciada:', fecha.toLocaleString('es-CO'));
  }
}

// Configurar eventos
function configurarEventos() {
  // Filtros
  document.getElementById('buscar').addEventListener('input', aplicarFiltros);
  document.getElementById('filtroPrograma').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroHora').addEventListener('change', aplicarFiltros);
}

// Cargar registros desde Supabase
async function cargarRegistros() {
  try {
    mostrarLoading(true);
    
    const { data, error } = await client
      .from('sensibilizacion')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) {
      console.error('Error cargando registros:', error);
      mostrarError('Error al cargar los registros: ' + error.message);
      return;
    }

    registros = data || [];
    registrosFiltrados = [...registros];
    
    actualizarEstadisticas();
    mostrarRegistros();
    
  } catch (err) {
    console.error('Error de conexión:', err);
    mostrarError('Error de conexión. Verifica tu internet.');
  } finally {
    mostrarLoading(false);
  }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
  const hoy = new Date().toISOString().split('T')[0];
  
  const total = registros.length;
  const hoyCount = registros.filter(r => 
    r.fecha_registro && r.fecha_registro.startsWith(hoy)
  ).length;
  
  const programacion = registros.filter(r => 
    r.programa === 'PROGRAMACIÓN DE SOFTWARE'
  ).length;
  
  const prensa = registros.filter(r => 
    r.programa === 'PRENSA DIGITAL PARA MEDIOS IMPRESOS'
  ).length;

  document.getElementById('totalRegistros').textContent = total;
  document.getElementById('registrosHoy').textContent = hoyCount;
  document.getElementById('programacionSoftware').textContent = programacion;
  document.getElementById('prensaDigital').textContent = prensa;
}

// Aplicar filtros
function aplicarFiltros() {
  const buscar = document.getElementById('buscar').value.toLowerCase();
  const programa = document.getElementById('filtroPrograma').value;
  const hora = document.getElementById('filtroHora').value;

  registrosFiltrados = registros.filter(registro => {
    const coincideBuscar = !buscar || 
      registro.nombre_estudiante.toLowerCase().includes(buscar) ||
      registro.documento_estudiante.includes(buscar) ||
      registro.acudiente.toLowerCase().includes(buscar);
    
    const coincidePrograma = !programa || registro.programa === programa;
    const coincideHora = !hora || registro.hora === hora;

    return coincideBuscar && coincidePrograma && coincideHora;
  });

  paginaActual = 1;
  mostrarRegistros();
}

// Mostrar registros en la tabla
function mostrarRegistros() {
  const container = document.getElementById('tablaContainer');
  
  if (registrosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="no-data">
        <i class="fas fa-inbox"></i>
        <p>No se encontraron registros</p>
      </div>
    `;
    return;
  }

  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosPagina = registrosFiltrados.slice(inicio, fin);

  const tabla = `
    <table class="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Estudiante</th>
          <th>Documento</th>
          <th>Acudiente</th>
          <th>Teléfono</th>
          <th>Programa</th>
          <th>Hora</th>
          <th>Firma</th>
        </tr>
      </thead>
      <tbody>
        ${registrosPagina.map(registro => `
          <tr>
            <td>${formatearFecha(registro.fecha_registro)}</td>
            <td>${registro.nombre_estudiante}</td>
            <td>${registro.documento_estudiante}</td>
            <td>${registro.acudiente}</td>
            <td>${registro.telefono}</td>
            <td>
              <span class="badge-status badge-success">
                ${registro.programa}
              </span>
            </td>
            <td>${registro.hora}</td>
            <td>
              <img 
                src="${registro.firma_digital}" 
                class="signature-preview"
                onclick="verFirma('${registro.firma_digital}')"
                alt="Firma"
              />
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${generarPaginacion()}
  `;

  container.innerHTML = tabla;
}

// Generar paginación
function generarPaginacion() {
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  
  if (totalPaginas <= 1) return '';

  let paginacion = '<div class="pagination">';
  
  // Botón anterior
  paginacion += `
    <button 
      onclick="cambiarPagina(${paginaActual - 1})" 
      ${paginaActual === 1 ? 'disabled' : ''}
    >
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    const activo = i === paginaActual ? 'active' : '';
    paginacion += `
      <button 
        class="${activo}" 
        onclick="cambiarPagina(${i})"
      >
        ${i}
      </button>
    `;
  }

  // Botón siguiente
  paginacion += `
    <button 
      onclick="cambiarPagina(${paginaActual + 1})" 
      ${paginaActual === totalPaginas ? 'disabled' : ''}
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  paginacion += '</div>';
  return paginacion;
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
  
  paginaActual = nuevaPagina;
  mostrarRegistros();
}

// Ver firma en modal
function verFirma(firmaData) {
  const modal = document.getElementById('signatureModal');
  const content = document.getElementById('signatureContent');
  
  content.innerHTML = `
    <img src="${firmaData}" alt="Firma Digital" style="max-width: 100%; height: auto;">
  `;
  
  modal.classList.remove('hidden');
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('signatureModal').classList.add('hidden');
}

// Actualizar datos
async function actualizarDatos() {
  await cargarRegistros();
}

// Exportar a Excel
function exportarExcel() {
  try {
    const datos = registrosFiltrados.map(r => ({
      'Fecha': formatearFecha(r.fecha_registro),
      'Estudiante': r.nombre_estudiante,
      'Documento': r.documento_estudiante,
      'Acudiente': r.acudiente,
      'Teléfono': r.telefono,
      'Correo': r.correo,
      'Programa': r.programa,
      'Hora': r.hora
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 20 }, // Fecha
      { wch: 30 }, // Estudiante
      { wch: 15 }, // Documento
      { wch: 30 }, // Acudiente
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Correo
      { wch: 40 }, // Programa
      { wch: 15 }  // Hora
    ];
    ws['!cols'] = colWidths;
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Registros Sensibilización');
    
    // Generar nombre de archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Registros_Sensibilizacion_${fecha}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
    
    // Mostrar confirmación
    mostrarNotificacion('✅ Archivo Excel descargado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    mostrarNotificacion('❌ Error al exportar el archivo Excel', 'error');
  }
}

// Exportar a PDF (simulado)
function exportarPDF() {
  alert('Función de exportación PDF en desarrollo');
}

// Convertir datos a CSV
function convertirACSV(datos) {
  if (datos.length === 0) return '';
  
  const headers = Object.keys(datos[0]);
  const csvContent = [
    headers.join(','),
    ...datos.map(row => 
      headers.map(header => 
        `"${(row[header] || '').toString().replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n');
  
  return csvContent;
}

// Descargar archivo
function descargarArchivo(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return '-';
  
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Mostrar loading
function mostrarLoading(mostrar) {
  const container = document.getElementById('tablaContainer');
  
  if (mostrar) {
    container.innerHTML = `
      <div class="no-data">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando registros...</p>
      </div>
    `;
  }
}

// Mostrar error
function mostrarError(mensaje) {
  const container = document.getElementById('tablaContainer');
  container.innerHTML = `
    <div class="no-data">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${mensaje}</p>
    </div>
  `;
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notification notification-${tipo}`;
  notificacion.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${mensaje}</span>
    </div>
  `;
  
  // Agregar estilos
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${tipo === 'success' ? '#dcfce7' : tipo === 'error' ? '#fef2f2' : '#f0f9ff'};
    color: ${tipo === 'success' ? '#166534' : tipo === 'error' ? '#dc2626' : '#0369a1'};
    border: 1px solid ${tipo === 'success' ? '#bbf7d0' : tipo === 'error' ? '#fecaca' : '#bae6fd'};
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
  `;
  
  // Agregar al DOM
  document.body.appendChild(notificacion);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.parentNode.removeChild(notificacion);
      }
    }, 300);
  }, 5000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
`;
document.head.appendChild(style);

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  const modal = document.getElementById('signatureModal');
  if (e.target === modal) {
    cerrarModal();
  }
});
