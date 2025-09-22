# 🎓 Sistema de Registro - I.E. Héctor Abad Gómez

Sistema web para el registro de sensibilización del programa de Media Técnica de la Institución Educativa Héctor Abad Gómez.

## 📋 Características

### ✨ Interfaz Moderna
- **Banner educativo** con información institucional
- **Diseño responsivo** que funciona en móviles y escritorio
- **Indicador de progreso** para guiar al usuario
- **Validaciones visuales** en tiempo real

### 🔍 Búsqueda de Estudiantes
- Búsqueda por número de documento
- Información completa del estudiante (nombre, grado, grupo, director)
- Validación de datos en tiempo real

### 📝 Formulario de Sensibilización
- **Información del acudiente** (nombres, teléfono, correo)
- **Selección de programa** de Media Técnica
- **Confirmación de asistencia** a la reunión
- **Firma digital** del acudiente
- **Validaciones estrictas** de todos los campos

### 🛠️ Panel de Administración
- **Acceso seguro** con clave de autenticación
- **Estadísticas en tiempo real** de registros
- **Filtros avanzados** por programa, hora, nombre
- **Visualización de firmas** digitales
- **Exportación de datos** a Excel con formato profesional
- **Paginación** para grandes volúmenes de datos
- **Sesión segura** con expiración automática

## 🗂️ Estructura del Proyecto

```
MEDIATECNICA/
├── index.html                 # Página principal del formulario
├── admin/
│   ├── index.html            # Panel de administración
│   └── login.html            # Página de acceso administrativo
├── assets/
│   ├── css/
│   │   └── styles.css        # Estilos principales
│   ├── js/
│   │   ├── script.js         # Lógica del formulario
│   │   └── admin.js          # Lógica de administración
│   └── images/               # Imágenes del proyecto
├── estudiantes.sql           # Datos de estudiantes
└── README.md                # Documentación
```

## 🚀 Instalación y Configuración

### 1. Configurar Base de Datos
Ejecuta el siguiente script SQL en tu proyecto de Supabase:

```sql
-- Crear tabla estudiantes
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    documento VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    grado VARCHAR(10) NOT NULL,
    grupo VARCHAR(10),
    director VARCHAR(255)
);

-- Crear tabla sensibilizacion
CREATE TABLE sensibilizacion (
    id SERIAL PRIMARY KEY,
    documento_estudiante VARCHAR(20) NOT NULL,
    nombre_estudiante VARCHAR(255) NOT NULL,
    acudiente VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    hora VARCHAR(50) NOT NULL,
    programa VARCHAR(255) NOT NULL,
    firma_digital TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de estudiantes (usar el archivo estudiantes.sql)
-- Configurar políticas RLS
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensibilizacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de estudiantes" ON estudiantes
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserción pública en sensibilizacion" ON sensibilizacion
    FOR INSERT WITH CHECK (true);
```

### 2. Configurar Credenciales
Actualiza las credenciales de Supabase en `assets/js/script.js` y `assets/js/admin.js`:

```javascript
const supabaseUrl = 'TU_URL_DE_SUPABASE';
const supabaseAnonKey = 'TU_CLAVE_ANONIMA_DE_SUPABASE';
```

### 3. Ejecutar la Aplicación
1. Abre `index.html` en un navegador web
2. Para administración, abre `admin/index.html`

## 📱 Uso del Sistema

### Para Acudientes
1. **Buscar estudiante** ingresando el número de documento
2. **Verificar información** del estudiante encontrado
3. **Completar formulario** con datos del acudiente
4. **Firmar digitalmente** el formulario
5. **Enviar registro** para confirmar asistencia

### Para Administradores
1. **Acceder al login** en `/admin/login.html`
2. **Ingresar clave** de acceso: `CAÑOLA2027*`
3. **Ver estadísticas** de registros en tiempo real
4. **Filtrar datos** por diferentes criterios
5. **Exportar información** a Excel con formato profesional
6. **Visualizar firmas** digitales en modal
7. **Cerrar sesión** cuando termine

## 🎨 Características Técnicas

### Frontend
- **HTML5** semántico y accesible
- **CSS3** con variables personalizadas y Grid/Flexbox
- **JavaScript ES6+** con async/await
- **Font Awesome** para iconografía
- **Google Fonts** (Inter) para tipografía

### Backend
- **Supabase** como base de datos
- **PostgreSQL** para almacenamiento
- **Row Level Security** para seguridad
- **API REST** para comunicación

### Responsive Design
- **Mobile First** approach
- **Breakpoints** para tablet y escritorio
- **Touch-friendly** para dispositivos móviles

## 🔒 Seguridad

- **Sistema de autenticación** con clave de acceso
- **Sesiones con expiración** automática (24 horas)
- **Validación client-side** y server-side
- **Sanitización** de datos de entrada
- **Políticas RLS** en Supabase
- **HTTPS** obligatorio en producción
- **Acceso restringido** al panel administrativo

### 🔑 Credenciales de Acceso
- **Clave de administrador:** `CAÑOLA2027*`
- **Sesión válida:** 24 horas
- **Acceso:** Solo personal autorizado

## 📊 Programas Disponibles

1. **Programación de Software**
2. **Prensa Digital para Medios Impresos**
3. **Formación Artística**
4. **Grado Académico Normal**

## 🎯 Directores de Grupo

- **9-1:** Mario Guerra
- **9-2:** Yazmin Cifuentes
- **9-3:** Paola Mejía
- **201:** Juan Carlos Sepulveda
- **202:** Ana Delis
- **203:** Leonardo
- **204:** Ana Prieto

## 🐛 Solución de Problemas

### Error de Conexión
- Verificar credenciales de Supabase
- Comprobar conexión a internet
- Revisar políticas RLS

### Error de Firma
- Verificar que el canvas esté inicializado
- Comprobar eventos de mouse/touch
- Limpiar firma si es necesario

### Error de Validación
- Verificar formato de email
- Comprobar longitud de teléfono (10 dígitos)
- Asegurar que todos los campos estén completos

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al administrador del sistema.

---

---

## 👨‍🏫 DESARROLLADOR

**Victor Cañola**  
*Docente - Institución Educativa Héctor Abad Gómez*  
*Enero 2025*

## 🛡️ PROPIEDAD INTELECTUAL

Este sistema es propiedad exclusiva de **Victor Cañola** y está protegido por derechos de autor. Para uso comercial o distribución, contactar al autor.

**© 2025 Victor Cañola - Institución Educativa Héctor Abad Gómez**  
*Formando Profesionales del Futuro* 🎓
