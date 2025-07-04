
-- Script para exportar datos estructurales (cursos, categorías, etc.)
-- NO incluye datos de usuarios ni progreso

-- Exportar categorías
SELECT 'INSERT INTO categorias (id, nombre, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || nombre || ''', ''' || fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM categorias;

-- Exportar creadores
SELECT 'INSERT INTO creadores (id, nombre, imagen_url, linkedin_url, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || nombre || ''', ''' || imagen_url || ''', ' || 
    COALESCE('''' || linkedin_url || '''', 'NULL') || ', ''' || 
    fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM creadores;

-- Exportar cursos
SELECT 'INSERT INTO cursos (id, titulo, descripcion, imagen_portada, categoria_id, creador_id, duracion_total, numero_lecciones, tipo_curso, precio, moneda, likes, dislikes, show, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || titulo || ''', ''' || descripcion || ''', ''' || imagen_portada || ''', ''' || 
    categoria_id || ''', ''' || creador_id || ''', ' || duracion_total || ', ' || numero_lecciones || ', ''' || 
    tipo_curso || ''', ' || COALESCE(precio::text, 'NULL') || ', ''' || moneda || ''', ' || 
    likes || ', ' || dislikes || ', ' || show || ', ''' || fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM cursos;

-- Exportar módulos
SELECT 'INSERT INTO modulos (id, titulo, descripcion, curso_id, orden, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || titulo || ''', ' || COALESCE('''' || descripcion || '''', 'NULL') || ', ''' || 
    curso_id || ''', ' || orden || ', ''' || fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM modulos;

-- Exportar lecciones
SELECT 'INSERT INTO lecciones (id, titulo, descripcion, url_audio, duracion, modulo_id, orden, estado_inicial, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || titulo || ''', ' || COALESCE('''' || descripcion || '''', 'NULL') || ', ''' || 
    url_audio || ''', ' || duracion || ', ''' || modulo_id || ''', ' || orden || ', ''' || 
    estado_inicial || ''', ''' || fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM lecciones;

-- Exportar categorías landing
SELECT 'INSERT INTO categoria_landing (id, nombre, descripcion, imagen_url, audio_preview_url, orden, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || nombre || ''', ' || COALESCE('''' || descripcion || '''', 'NULL') || ', ''' || 
    imagen_url || ''', ' || COALESCE('''' || audio_preview_url || '''', 'NULL') || ', ' || orden || ', ''' || 
    fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM categoria_landing;

-- Exportar social media de creadores
SELECT 'INSERT INTO creador_social_media (id, creador_id, platform, url, fecha_creacion, fecha_actualizacion) VALUES' ||
  string_agg(
    '(''' || id || ''', ''' || creador_id || ''', ''' || platform || ''', ''' || url || ''', ''' || 
    fecha_creacion || ''', ''' || fecha_actualizacion || ''')',
    ', '
  ) || ';'
FROM creador_social_media;
