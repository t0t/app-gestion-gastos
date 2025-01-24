const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Crear directorio dist si no existe
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Minificar CSS
execSync('npx tailwindcss -i ./src/styles.css -o ./dist/output.min.css --minify');

// Copiar archivos estáticos
const filesToCopy = [
  'index.html',
  'app.js',
  'netlify/functions/gastos.js'
];

filesToCopy.forEach(file => {
  const source = path.join(__dirname, '..', file);
  const dest = path.join(distDir, file);
  
  // Crear directorios necesarios
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(source, dest);
});

// Actualizar index.html para producción
const indexPath = path.join(distDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Reemplazar CSS de desarrollo por el minificado
indexContent = indexContent.replace(
  /<link href="\.\/dist\/output\.css" rel="stylesheet">/,
  '<link href="./output.min.css" rel="stylesheet">'
);

// Eliminar comentarios de desarrollo
indexContent = indexContent.replace(/<!-- DEV-ONLY[\s\S]*?-->/g, '');

fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log('Build completado con éxito!');