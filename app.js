document.addEventListener('DOMContentLoaded', () => {
  const gastoForm = document.getElementById('gastoForm');
  const gastosTable = document.getElementById('gastosTable').getElementsByTagName('tbody')[0];
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const reportBtn = document.getElementById('reportBtn');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  // Cargar gastos al iniciar
  cargarGastos();

  // Manejar envío del formulario
  gastoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nuevoGasto = {
      id: Date.now(),
      descripcion: document.getElementById('descripcion').value,
      monto: parseFloat(document.getElementById('monto').value),
      categoria: document.getElementById('categoria').value,
      fecha: new Date().toISOString().split('T')[0]
    };

    // Guardar en localStorage
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    gastos.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    gastoForm.reset();
    cargarGastos();
  });

  // Función para cargar y mostrar los gastos
  function cargarGastos() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    
    gastosTable.innerHTML = ''; // Limpiar tabla
    
    gastos.forEach(gasto => {
      const row = gastosTable.insertRow();
      row.insertCell().textContent = gasto.descripcion;
      row.insertCell().textContent = `€${gasto.monto.toFixed(2)}`;
      row.insertCell().textContent = gasto.categoria;
      row.insertCell().textContent = gasto.fecha;
    });
  }

  // Exportar datos
  exportBtn.addEventListener('click', () => {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const blob = new Blob([JSON.stringify(gastos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Importar datos
  importBtn.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          localStorage.setItem('gastos', JSON.stringify(data));
          cargarGastos();
          alert('Datos importados correctamente');
        } catch (error) {
          alert('Error al importar los datos: Archivo inválido');
        }
      };
      reader.readAsText(file);
    }
  });

  // Configurar gráfica
  const ctx = document.getElementById('gastosChart').getContext('2d');
  let chart;

  function actualizarGrafica() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    
    // Agrupar gastos por mes
    const gastosPorMes = gastos.reduce((acc, gasto) => {
      const fecha = new Date(gasto.fecha);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += gasto.monto;
      
      return acc;
    }, {});

    // Ordenar meses y preparar datos para la gráfica
    const meses = Object.keys(gastosPorMes).sort();
    const montos = meses.map(mes => gastosPorMes[mes]);

    const data = {
      labels: meses,
      datasets: [{
        label: 'Gastos Mensuales',
        data: montos,
        backgroundColor: '#3B82F6',
        borderColor: '#1E40AF',
        borderWidth: 2,
        hoverBackgroundColor: '#2563EB'
      }]
    };

    if (chart) {
      chart.data = data;
      chart.update();
    } else {
      chart = new Chart(ctx, {
        type: 'bar',
        indexAxis: 'y',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 3,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Gastado (€)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Mes'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `€${context.raw.toFixed(2)}`;
                }
              }
            }
          }
        }
      });
    }
  }

  // Actualizar gráfica al cargar y al agregar nuevos gastos
  actualizarGrafica();
  gastoForm.addEventListener('submit', actualizarGrafica);
  importBtn.addEventListener('click', () => {
    fileInput.addEventListener('change', actualizarGrafica, { once: true });
  });

  // Generar reporte PDF
  reportBtn.addEventListener('click', () => {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.text('Reporte de Gastos', 10, 10);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 20);
    
    // Tabla de gastos
    const columns = ['Descripción', 'Monto', 'Categoría', 'Fecha'];
    const rows = gastos.map(g => [g.descripcion, `€${g.monto.toFixed(2)}`, g.categoria, g.fecha]);
    
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 30,
      theme: 'striped',
      styles: { fontSize: 10 }
    });
    
    // Total
    const total = gastos.reduce((sum, g) => sum + g.monto, 0);
    doc.text(`Total: €${total.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 10);
    
    doc.save(`reporte_gastos_${new Date().toISOString().split('T')[0]}.pdf`);
  });
});