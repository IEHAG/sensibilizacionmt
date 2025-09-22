/*
 * ============================================
 * SISTEMA DE REGISTRO DE SENSIBILIZACIÓN
 * ============================================
 * 
 * Desarrollado por: Victor Cañola
 * Institución: I.E. Héctor Abad Gómez
 * Fecha: Enero 2025
 * © 2025 Victor Cañola - Todos los derechos reservados
 * 
 * Este sistema fue desarrollado específicamente para la
 * Institución Educativa Héctor Abad Gómez y contiene
 * funcionalidades únicas protegidas por derechos de autor.
 * 
 * PROHIBIDA SU REPRODUCCIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN
 * ============================================
 */

const supabaseUrl = 'https://fxcojeuycvebpzyhxylm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y29qZXV5Y3ZlYnB6eWh4eWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNzg2NDIsImV4cCI6MjA3MzY1NDY0Mn0.ozeujNYyCkvT6bviiNdBw2ZLZ9090KIsJc1LFZAcoGo';
const client = supabase.createClient(supabaseUrl, supabaseAnonKey);

let estudianteData = {};

// Función para probar la conexión
async function probarConexion() {
  try {
    const { data, error } = await client.from('estudiantes').select('count').limit(1);
    if (error) {
      console.error('Error de conexión a la base de datos:', error);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err);
    return false;
  }
}

// Probar conexión al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  const conectado = await probarConexion();
  if (!conectado) {
    console.warn('⚠️ No se pudo conectar a la base de datos. Algunas funciones pueden no funcionar.');
  }
  
  // Configurar evento del formulario
  const formulario = document.getElementById('formularioSensibilizacion');
  if (formulario) {
    formulario.addEventListener('submit', function(e) {
      e.preventDefault();
      enviarFormulario();
    });
  }
});

async function buscarEstudiante() {
  const documento = document.getElementById('documento').value.trim();
  if (!documento) return alert('Ingresa un documento');

  try {
    const { data, error } = await client
      .from('estudiantes')
      .select('nombre, grado, documento, grupo, director')
      .eq('documento', documento)
      .single();

    const res = document.getElementById('resultado');
    const err = document.getElementById('error');
    res.classList.add('hidden');
    err.classList.add('hidden');

    if (error || !data) {
      console.error('Error buscando estudiante:', error);
      err.classList.remove('hidden');
      return;
    }

    estudianteData = data;
    document.getElementById('nombre').textContent = data.nombre;
    document.getElementById('grado').textContent = data.grado;
    document.getElementById('grupo').textContent = data.grupo || 'No asignado';
    document.getElementById('director').textContent = data.director || 'No asignado';
    res.classList.remove('hidden');
  } catch (err) {
    console.error('Error de conexión:', err);
    alert('Error de conexión. Verifica tu internet e intenta de nuevo.');
  }
}

function mostrarFormulario() {
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
  
  // Actualizar indicador de progreso
  document.getElementById('step-indicator-1').classList.remove('active');
  document.getElementById('step-indicator-2').classList.add('active');
  
  iniciarFirma();
}

function volverBusqueda() {
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
  
  // Actualizar indicador de progreso
  document.getElementById('step-indicator-2').classList.remove('active');
  document.getElementById('step-indicator-1').classList.add('active');
  
  // Limpiar formulario
  document.getElementById('formularioSensibilizacion').reset();
  limpiarFirma();
}

function limpiarBusqueda() {
  document.getElementById('documento').value = '';
  document.getElementById('resultado').classList.add('hidden');
  document.getElementById('error').classList.add('hidden');
}

// FIRMA DIGITAL
let canvas, ctx, drawing = false, hasSignature = false;
function iniciarFirma() {
  canvas = document.getElementById('firma');
  ctx = canvas.getContext('2d');
  
  // Configurar el canvas
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });
  
  canvas.addEventListener('mouseup', () => {
    drawing = false;
    hasSignature = true; // Marcar que hay firma
    mostrarEstadoFirma();
  });
  
  canvas.addEventListener('mousemove', dibujar);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    drawing = false;
    hasSignature = true; // Marcar que hay firma
    mostrarEstadoFirma();
  });

  canvas.addEventListener('touchmove', dibujarTouch);
}

function dibujar(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function dibujarTouch(e) {
  e.preventDefault(); // 👈 Evita scroll
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function limpiarFirma() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  hasSignature = false; // Resetear el estado de la firma
  ocultarEstadoFirma();
}

function mostrarEstadoFirma() {
  const status = document.getElementById('signatureStatus');
  if (status) {
    status.classList.remove('hidden');
  }
}

function ocultarEstadoFirma() {
  const status = document.getElementById('signatureStatus');
  if (status) {
    status.classList.add('hidden');
  }
}

// ENVIAR FORMULARIO
async function enviarFormulario() {
  // Validar que hay datos del estudiante
  if (!estudianteData || !estudianteData.documento) {
    alert('❌ Error: No se encontró información del estudiante. Regresa al paso anterior.');
    return;
  }

  // Obtener valores del formulario
  const acudiente = document.getElementById('acudiente').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const hora = document.getElementById('hora').value;
  const programa = document.getElementById('programa').value;

  // Validaciones más estrictas
  if (!acudiente || !telefono || !correo || !hora || !programa) {
    alert('❌ Por favor completa todos los campos obligatorios');
    return;
  }

  // Validar formato de teléfono
  if (!/^[0-9]{10}$/.test(telefono.replace(/\s/g, ''))) {
    alert('❌ El teléfono debe tener 10 dígitos');
    return;
  }

  // Validar formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    alert('❌ Ingresa un correo electrónico válido');
    return;
  }

  // Verificar que hay firma
  if (!hasSignature) {
    alert('❌ Por favor firma el formulario');
    return;
  }
  
  const firmaData = canvas.toDataURL();

  // Mostrar indicador de carga
  const loadingOverlay = document.getElementById('loadingOverlay');
  const botonEnviar = document.getElementById('btnEnviar');
  const textoOriginal = botonEnviar.innerHTML;
  botonEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  botonEnviar.disabled = true;
  loadingOverlay.classList.remove('hidden');

  try {
    const { data, error } = await client.from('sensibilizacion').insert([
      {
        documento_estudiante: estudianteData.documento,
        nombre_estudiante: estudianteData.nombre,
        acudiente,
        telefono,
        correo,
        hora,
        programa,
        firma_digital: firmaData
      }
    ]);

    if (error) {
      console.error('Error detallado:', error);
      alert('❌ Error al enviar el formulario: ' + error.message + '\n\nCódigo de error: ' + error.code);
    } else {
      alert('✅ ¡Formulario enviado con éxito!\n\nSe ha registrado tu participación en la reunión de sensibilización.');
      location.reload();
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    alert('❌ Error de conexión. Verifica tu internet e intenta de nuevo.');
  } finally {
    // Restaurar botón y ocultar loading
    botonEnviar.innerHTML = textoOriginal;
    botonEnviar.disabled = false;
    loadingOverlay.classList.add('hidden');
  }
}