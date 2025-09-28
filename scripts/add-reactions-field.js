// Script temporal para agregar el campo reactions a la base de datos
// Este script se puede ejecutar directamente en la base de datos SQLite

const sql = `
-- Agregar columna reactions a la tabla chat_messages si no existe
ALTER TABLE chat_messages ADD COLUMN reactions TEXT DEFAULT '{}';
`;

console.log('SQL para ejecutar:');
console.log(sql);
console.log('\nEjecuta este SQL en tu base de datos SQLite para agregar el campo reactions.');
