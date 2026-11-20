/**
 * Configuración de JuliFor3D
 * -------------------------------------------------------------------------
 * Para conectar el sitio con Supabase:
 * 1. Crea tu proyecto en https://supabase.com
 * 2. Ejecuta el archivo `supabase_schema.sql` en el SQL Editor de Supabase.
 * 3. Ve a Project Settings > API y copia la URL del proyecto y la clave `anon public`.
 * 4. Pégalas abajo en SUPABASE_URL y SUPABASE_ANON_KEY.
 *
 * IMPORTANTE: Mientras ambos campos estén vacíos (""), el sitio público
 * funcionará automáticamente en modo demostración con productos de ejemplo
 * y envío de formulario simulado.
 */

window.JULIFOR_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // Datos de contacto y marca
  BRAND_NAME: "JuliFor3D",
  WHATSAPP_NUMBER: "573007709585",
  WHATSAPP_DISPLAY: "300 770 9585",
  INSTAGRAM_URL: "https://www.instagram.com/julifor3d?bqrl=MXI0ZTZ4dXY5YWluYg==",
  TIKTOK_URL: "https://www.tiktok.com/@julifor3d?_r=1&_t=ZS-9BY5hIQCOIM",
  CITY: "Bogotá, Colombia",

  // Nombres de buckets de Supabase Storage
  STORAGE_BUCKET_PRODUCTS: "productos",
  STORAGE_BUCKET_IDEAS: "ideas-clientes"
};
