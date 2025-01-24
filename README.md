# Gestor de Gastos - MoneyFly

Aplicación web para el seguimiento y gestión de gastos personales.

## Características Principales

- Registro de gastos con descripción, monto, categoría y fecha
- Visualización de gastos en lista interactiva
- Gráficos de gastos mensuales usando D3.js
- Exportación/importación de datos en formato JSON
- Generación de reportes en PDF
- Almacenamiento local usando localStorage
- Interfaz moderna con Tailwind CSS

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/gastos-app.git
cd gastos-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Abrir en el navegador:
```
http://localhost:3000
```

## Uso

1. Agregar gastos usando el formulario flotante
2. Ver gastos en la lista
3. Explorar gráficos de gastos
4. Exportar/importar datos
5. Generar reportes PDF

## Estructura del Proyecto

```
gastos-app/
├── src/
│   ├── styles.css        # Estilos base
├── dist/
│   ├── output.css        # CSS compilado
├── netlify/
│   └── functions/        # Funciones serverless
├── public/               # Archivos estáticos
│   ├── index.html        # Página principal
│   ├── app.js            # Lógica principal
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración de Tailwind
└── README.md             # Documentación
```

## Tecnologías Utilizadas

- Frontend:
  - HTML5, CSS3, JavaScript
  - Tailwind CSS
  - D3.js (gráficos)
  - jsPDF (reportes PDF)

- Herramientas:
  - Node.js
  - PostCSS

## Autor

Sergio Forés
