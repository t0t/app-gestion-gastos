document.addEventListener('DOMContentLoaded', () => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Configurar botón flotante
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formContainer = document.getElementById('formContainer');
  
  // Mostrar/ocultar formulario y manejar clics fuera
  toggleFormBtn.addEventListener('click', () => {
    formContainer.classList.toggle('hidden');
  });

  // Ocultar formulario al hacer clic fuera
  document.addEventListener('click', (e) => {
    const isClickInside = formContainer.contains(e.target) || toggleFormBtn.contains(e.target);
    if (!isClickInside && !formContainer.classList.contains('hidden')) {
      formContainer.classList.add('hidden');
    }
  });

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
      fecha: document.getElementById('fecha').value
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
      row.insertCell().textContent = formatearFecha(gasto.fecha);
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

  // Configurar gráfica con D3.js
  const chartDiv = document.getElementById('gastosChart');
  const margin = {top: 50, right: 40, bottom: 60, left: 60};
  const width = chartDiv.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  
  const svg = d3.select(chartDiv)
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('overflow', 'visible')
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Selector de vista
  const selector = d3.select(chartDiv)
    .insert('div', ':first-child')
    .style('position', 'absolute')
    .style('top', '10px')
    .style('left', '10px');

  selector.append('select')
    .attr('id', 'viewSelector')
    .selectAll('option')
    .data(['Días', 'Meses'])
    .enter()
    .append('option')
      .text(d => d)
      .attr('value', d => d);

  function actualizarGrafica() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const view = document.getElementById('viewSelector').value;

    // Agrupar gastos según la vista seleccionada
    const groupedData = gastos.reduce((acc, gasto) => {
      try {
        const fecha = new Date(gasto.fecha);
        if (isNaN(fecha)) throw new Error('Fecha inválida');
        
        const key = view === 'Días' ?
          fecha.toISOString().split('T')[0] :
          `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += parseFloat(gasto.monto) || 0;
        
        return acc;
      } catch (error) {
        console.error('Error procesando gasto:', gasto, error);
        return acc;
      }
    }, {});

    // Ordenar y preparar datos para la gráfica
    const labels = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
    const values = labels.map(label => groupedData[label]);

    // Escalas
    const x = d3.scaleBand()
      .domain(labels)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values)])
      .nice()
      .range([height, 0]);

    // Formatear fechas en el eje X
    const formatDate = d3.timeFormat(view === 'Días' ? '%d/%m' : '%m/%Y');

    // Ejes
    svg.selectAll('.axis').remove();
    
    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickFormat(d => formatDate(new Date(d)))
        .tickSizeOuter(0));

    svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(5));

    // Barras
    svg.selectAll('.bar').remove();
    
    svg.selectAll('.bar')
      .data(labels)
      .enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d))
        .attr('y', d => y(groupedData[d]))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(groupedData[d]))
        .attr('fill', '#3B82F6');
  }

  // Actualizar gráfica al cambiar la vista
  d3.select('#viewSelector').on('change', actualizarGrafica);

  function actualizarTotalesCategorias() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const totales = gastos.reduce((acc, gasto) => {
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = 0;
      }
      acc[gasto.categoria] += gasto.monto;
      return acc;
    }, {});

    const totalesContainer = document.getElementById('totalesCategorias');
    totalesContainer.innerHTML = Object.entries(totales)
      .map(([categoria, total]) => `
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <p class="text-sm text-slate-500">${categoria}</p>
          <p class="text-lg font-semibold text-slate-800">€${total.toFixed(2)}</p>
        </div>
      `)
      .join('');
  }

  function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  function actualizarTotalesMeses() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const totales = gastos.reduce((acc, gasto) => {
      const fecha = new Date(gasto.fecha);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += gasto.monto;
      return acc;
    }, {});

    const totalesContainer = document.getElementById('totalesMeses');
    totalesContainer.innerHTML = Object.entries(totales)
      .map(([mes, total]) => {
        const [year, month] = mes.split('-');
        const fechaFormateada = `1 ${meses[parseInt(month) - 1]} ${year}`;
        return `
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <p class="text-sm text-slate-500">${fechaFormateada}</p>
            <p class="text-lg font-semibold text-slate-800">€${total.toFixed(2)}</p>
          </div>
        `;
      })
      .join('');
  }

  // Actualizar gráfica y totales al cargar y al agregar nuevos gastos
  actualizarGrafica();
  actualizarTotalesCategorias();
  actualizarTotalesMeses();
  gastoForm.addEventListener('submit', () => {
    actualizarGrafica();
    actualizarTotalesCategorias();
    actualizarTotalesMeses();
  });
  importBtn.addEventListener('click', () => {
    fileInput.addEventListener('change', () => {
      actualizarGrafica();
      actualizarTotalesCategorias();
      actualizarTotalesMeses();
    }, { once: true });
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
    const rows = gastos.map(g => [g.descripcion, `€${g.monto.toFixed(2)}`, g.categoria, formatearFecha(g.fecha)]);
    
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