
export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'production';
}

// Configuración por defecto (desarrollo)
const developmentConfig: DatabaseConfig = {
  supabaseUrl: "https://ubsextjrmofwzvhvatcl.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVic2V4dGpybW9md3p2aHZhdGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMzY5NjQsImV4cCI6MjA1NzgxMjk2NH0.bD3aCP9PATqXjXM6-Pwv1OpYRkPrAP73-UKffD6Kzjc",
  environment: 'development'
};

// Configuración de producción (actualizar cuando tengas el proyecto)
const productionConfig: DatabaseConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || developmentConfig.supabaseUrl,
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || developmentConfig.supabaseAnonKey,
  environment: 'production'
};

// Detectar ambiente automáticamente
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' && 
                    !window.location.hostname.includes('lovable.app');

export const databaseConfig: DatabaseConfig = isProduction ? productionConfig : developmentConfig;

// Función para debug del ambiente actual
export const getCurrentEnvironment = () => {
  console.log('🌍 Current environment:', databaseConfig.environment);
  console.log('🔗 Supabase URL:', databaseConfig.supabaseUrl);
  console.log('🏠 Hostname:', window.location.hostname);
  return databaseConfig;
};
