# JuliFor3D — Sitio Web Oficial y Panel Administrativo

Sitio web estático (HTML, CSS y JavaScript puro) para **JuliFor3D** (*IDEAS · DISEÑO · IMPRESIÓN 3D*) en Bogotá, Colombia. Listo para desplegar en **GitHub Pages** y conectarse con **Supabase** (Auth, Database y Storage).

## Estructura del proyecto

- `index.html` — Página pública (Hero con Lobo JF, Servicios, Catálogo con filtros y modal de WhatsApp, Formulario "Mi idea", Cómo funciona, Reglas de cotización y entregas, Contacto y Footer).
- `admin.html` — Panel privado protegido con Supabase Auth (gestión de Productos, Categorías e Ideas de clientes).
- `config.js` — Archivo de credenciales de Supabase (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).
- `supabase_schema.sql` — Script SQL con tablas (`categories`, `products`, `ideas`), buckets de Storage (`productos`, `ideas-clientes`) y políticas RLS listas para ejecutar.
- `css/` — Estilos principales (`styles.css`) y del panel privado (`admin.css`).
- `js/` — Capa de datos Supabase + modo demostración (`data-service.js`), lógica pública (`app.js`) y panel (`admin.js`).
- `assets/` — Imágenes oficiales (`logo.jpeg`, `mascota.jpeg`) y recursos gráficos de ejemplo (`assets/demo/`).

## Probar inmediatamente (Modo sin conexión)

Mientras `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén vacíos en `config.js`, tanto `index.html` como `admin.html` funcionan en **modo demostración** con productos de ejemplo y envío de formulario simulado (guardado localmente en el navegador).

## Conectar con Supabase

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor**, pega todo el contenido de `supabase_schema.sql` y ejecútalo.
3. Crea tu usuario administrador en **Authentication > Users > Add user** (correo y contraseña).
4. Ve a **Project Settings > API**, copia tu **Project URL** y tu clave **anon public**, y pégalas en `config.js`.

## Publicar en GitHub Pages

1. Sube esta carpeta completa a un repositorio en GitHub.
2. Ve a **Settings > Pages**.
3. En **Source**, elige la rama `main` y la carpeta `/ (root)`.
4. Guarda los cambios: en unos minutos tu sitio estará en línea.
