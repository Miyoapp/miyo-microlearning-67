
# Configuración de Base de Datos de Producción

## Paso 1: Crear Proyecto de Producción en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto con nombre descriptivo (ej: "miyo-microlearning-production")
3. Anota las credenciales:
   - Project URL
   - Anon Key
   - Service Role Key

## Paso 2: Exportar Datos del Proyecto Actual

1. En el proyecto de desarrollo, ve a SQL Editor
2. Ejecuta el script `export-schema.sql` para obtener la estructura
3. Ejecuta el script `export-data.sql` para obtener los datos estructurales
4. Copia los resultados

## Paso 3: Configurar Proyecto de Producción

1. En el nuevo proyecto de producción, ve a SQL Editor
2. Ejecuta todas las migraciones de la carpeta `supabase/migrations/`
3. Aplica los scripts de estructura y datos exportados
4. Verifica que todas las tablas y datos se hayan creado correctamente

## Paso 4: Configurar Edge Functions

1. En el proyecto de producción, ve a Edge Functions
2. Crea las funciones:
   - `create-mercadopago-checkout`
   - `verify-mercadopago-payment`
3. Configura los secrets de producción:
   - `MERCADOPAGO_ACCESS_TOKEN` (producción)
   - `MP_SELLER_PUBLIC_KEY` (producción)

## Paso 5: Actualizar Configuración de la Aplicación

1. En tu aplicación, actualiza `src/config/database.ts`
2. Agrega las credenciales de producción
3. Configura variables de entorno para el deploy

## Paso 6: Probar la Configuración

1. Cambia temporalmente a producción en desarrollo
2. Verifica que todas las funcionalidades trabajen
3. Haz una transacción de prueba con MercadoPago

## Variables de Entorno para Producción

```bash
VITE_SUPABASE_URL=https://tu-proyecto-production.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-produccion
```

## Monitoreo Post-Deploy

- Revisar logs de Edge Functions
- Verificar métricas de base de datos
- Monitorear errores en tiempo real
