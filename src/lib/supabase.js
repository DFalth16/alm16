import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto en Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'tu-anon-key';

// Crear cliente de Supabase con persistencia de sesión mejorada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,      // Renovar token automáticamente
        persistSession: true,         // Persistir sesión en localStorage
        detectSessionInUrl: true,     // Detectar sesión en URL (para OAuth)
        storageKey: 'alm-auth-token', // Clave específica para localStorage
        storage: window.localStorage  // Usar localStorage explícitamente
    }
});

// Exportar también para uso directo
export default supabase;

