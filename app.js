document.addEventListener('DOMContentLoaded', () => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Configurar botón flotante
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  const formContainer = document.getElementById('formContainer');
  const cancelBtn = document.getElementById('cancelBtn');
  
  // Mostrar/ocultar formulario y manejar clics fuera
  toggleFormBtn.addEventListener('click', () => {
    formContainer.classList.toggle('hidden');
  });

  // Ocultar formulario al hacer clic en cancelar
  cancelBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
    gastoForm.reset();
  });

  // Ocultar formulario al hacer clic fuera
  document.addEventListener('click', (e) => {
    const isClickInside = formContainer.contains(e.target) || toggleFormBtn.contains(e.target);
    if (!isClickInside && !formContainer.classList.contains('hidden')) {
      formContainer.classList.add('hidden');
    }
  });

  const gastoForm = document.getElementById('gastoForm');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const reportBtn = document.getElementById('reportBtn');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  // Cargar gastos al iniciar
  cargarGastos();
  actualizarTotalesMensuales();

  // Manejar envío del formulario
  gastoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const concepto = document.getElementById('concepto').value.trim();
    const importe = parseFloat(document.getElementById('importe').value);
    const categoria = document.getElementById('categoria').value.trim();
    const fecha = document.getElementById('fecha').value;

    if (!concepto || !importe || !categoria || !fecha) {
      alert('Por favor, complete todos los campos');
      return;
    }

    if (isNaN(importe) || importe <= 0) {
      alert('El importe debe ser un número mayor a cero');
      return;
    }

    const nuevoGasto = {
      id: Date.now(),
      concepto,
      importe,
      categoria,
      fecha
    };

    // Guardar en localStorage
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    gastos.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    formContainer.classList.add('hidden');
    gastoForm.reset();
    cargarGastos();
    actualizarTotalesMensuales();
    actualizarGrafica();
  });

  // Función para cargar y mostrar los gastos
  function cargarGastos() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const tbody = document.querySelector('table tbody');
    
    tbody.innerHTML = ''; // Limpiar tabla
    
    gastos.forEach(gasto => {
      // Asegurar compatibilidad con datos antiguos
      const importe = gasto.importe || gasto.monto || 0;
      const concepto = gasto.concepto || gasto.descripcion || '';
      
      const row = tbody.insertRow();
      row.className = 'hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors';
      
      const conceptoCell = row.insertCell();
      conceptoCell.className = 'px-6 py-4 text-dark-gray dark:text-light-gray';
      conceptoCell.textContent = concepto;
      
      const categoriaCell = row.insertCell();
      categoriaCell.className = 'px-6 py-4 text-dark-gray dark:text-light-gray';
      categoriaCell.textContent = gasto.categoria || '';
      
      const importeCell = row.insertCell();
      importeCell.className = 'px-6 py-4 text-dark-gray dark:text-light-gray';
      importeCell.textContent = Number(importe).toFixed(2) + ' €';
      
      const fechaCell = row.insertCell();
      fechaCell.className = 'px-6 py-4 text-dark-gray dark:text-light-gray';
      fechaCell.textContent = formatearFecha(gasto.fecha);
    });

    actualizarGrafica();
  }

  // Función para formatear la fecha
  function formatearFecha(fechaStr) {
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return ''; // Fecha inválida
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }

  // Configurar gráfica con D3.js
  function actualizarGrafica() {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const chart = document.getElementById('gastosChart');
    
    // Limpiar gráfica anterior
    chart.innerHTML = '';
    
    if (gastos.length === 0) {
      chart.innerHTML = '<p class="text-center text-gray-500">No hay gastos registrados</p>';
      return;
    }

    // Agrupar gastos por mes
    const gastosPorMes = {};
    gastos.forEach(gasto => {
      try {
        const fecha = new Date(gasto.fecha);
        if (!isNaN(fecha.getTime())) {
          const mes = fecha.getMonth();
          const importe = Number(gasto.importe || gasto.monto || 0);
          gastosPorMes[mes] = (gastosPorMes[mes] || 0) + importe;
        }
      } catch (error) {
        console.error('Error procesando gasto:', error);
      }
    });

    // Convertir a array para D3
    const data = Object.entries(gastosPorMes).map(([mes, total]) => ({
      mes: meses[parseInt(mes)],
      total
    }));

    // Configurar dimensiones
    const margin = {top: 20, right: 20, bottom: 30, left: 60};
    const width = chart.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Crear SVG
    const svg = d3.select('#gastosChart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    x.domain(data.map(d => d.mes));
    y.domain([0, d3.max(data, d => d.total)]);

    // Ejes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y));

    // Barras
    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.mes))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.total))
      .attr('height', d => height - y(d.total))
      .attr('fill', '#ED8936');
  }

  // Función para actualizar los totales mensuales
  function actualizarTotalesMensuales() {
    // Verificar que los elementos existen
    const currentMonthTotal = document.getElementById('currentMonthTotal');
    const lastMonthTotal = document.getElementById('lastMonthTotal');
    const twoMonthsAgoTotal = document.getElementById('twoMonthsAgoTotal');
    const threeMonthsAgoTotal = document.getElementById('threeMonthsAgoTotal');
    const diffElement = document.getElementById('currentMonthDiff');

    if (!currentMonthTotal || !lastMonthTotal || !twoMonthsAgoTotal || !threeMonthsAgoTotal || !diffElement) {
      console.warn('Algunos elementos de totales mensuales no se encontraron en el DOM');
      return;
    }

    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    console.log('Gastos cargados:', gastos);
    
    const fechaActual = new Date();
    console.log('Fecha actual:', fechaActual);
    
    // Obtener el primer día de cada mes
    const inicioMesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const inicioMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
    const inicioDosAnteriores = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 2, 1);
    const inicioTresAnteriores = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 3, 1);
    const inicioSiguienteMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1);

    console.log('Períodos de cálculo:');
    console.log('- Mes actual:', inicioMesActual, 'hasta', inicioSiguienteMes);
    console.log('- Mes anterior:', inicioMesAnterior, 'hasta', inicioMesActual);
    console.log('- Dos meses atrás:', inicioDosAnteriores, 'hasta', inicioMesAnterior);
    console.log('- Tres meses atrás:', inicioTresAnteriores, 'hasta', inicioDosAnteriores);

    // Calcular totales por mes
    const totalMesActual = calcularTotalPeriodo(gastos, inicioMesActual, inicioSiguienteMes);
    const totalMesAnterior = calcularTotalPeriodo(gastos, inicioMesAnterior, inicioMesActual);
    const totalDosAnteriores = calcularTotalPeriodo(gastos, inicioDosAnteriores, inicioMesAnterior);
    const totalTresAnteriores = calcularTotalPeriodo(gastos, inicioTresAnteriores, inicioDosAnteriores);

    console.log('Totales calculados:');
    console.log('- Mes actual:', totalMesActual);
    console.log('- Mes anterior:', totalMesAnterior);
    console.log('- Dos meses atrás:', totalDosAnteriores);
    console.log('- Tres meses atrás:', totalTresAnteriores);

    // Calcular diferencia porcentual
    const diferenciaPorcentual = totalMesAnterior !== 0 
      ? ((totalMesActual - totalMesAnterior) / totalMesAnterior * 100).toFixed(1)
      : 0;

    // Actualizar elementos en el DOM
    currentMonthTotal.textContent = `€${totalMesActual.toFixed(2)}`;
    lastMonthTotal.textContent = `€${totalMesAnterior.toFixed(2)}`;
    twoMonthsAgoTotal.textContent = `€${totalDosAnteriores.toFixed(2)}`;
    threeMonthsAgoTotal.textContent = `€${totalTresAnteriores.toFixed(2)}`;

    // Actualizar diferencia porcentual y flecha
    const isPositive = diferenciaPorcentual > 0;
    const arrowPath = isPositive 
      ? "M5 10l7-7m0 0l7 7m-7-7v18"  // Flecha hacia arriba
      : "M19 14l-7 7m0 0l-7-7m7 7V3"; // Flecha hacia abajo

    diffElement.innerHTML = `
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${arrowPath}"/>
      </svg>
      ${Math.abs(diferenciaPorcentual)}%
    `;
    diffElement.className = `text-${isPositive ? 'green' : 'red'}-500 flex items-center`;
  }

  // Función auxiliar para calcular el total en un período
  function calcularTotalPeriodo(gastos, inicio, fin) {
    // Convertir las fechas de inicio y fin a fechas UTC
    const inicioUTC = Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const finUTC = Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate());
    
    console.log('Calculando total para período UTC:', new Date(inicioUTC), 'hasta', new Date(finUTC));
    console.log('Gastos disponibles:', gastos);
    
    const gastosEnPeriodo = gastos.filter(gasto => {
      // Convertir la fecha del gasto a UTC
      const [year, month, day] = gasto.fecha.split('-').map(Number);
      const fechaGastoUTC = Date.UTC(year, month - 1, day);
      console.log('Comparando fecha UTC:', new Date(fechaGastoUTC), 'con inicio:', new Date(inicioUTC), 'y fin:', new Date(finUTC));
      return fechaGastoUTC >= inicioUTC && fechaGastoUTC < finUTC;
    });
    
    console.log('Gastos en período:', gastosEnPeriodo);
    
    const total = gastosEnPeriodo.reduce((total, gasto) => {
      // Asegurarnos de que el importe es un número válido
      const importe = typeof gasto.importe === 'string' ? parseFloat(gasto.importe.replace(',', '.')) : parseFloat(gasto.importe);
      if (isNaN(importe)) {
        console.warn('Importe inválido encontrado:', gasto.importe, 'para el gasto:', gasto);
        return total;
      }
      console.log('Sumando importe:', importe, 'al total:', total);
      return total + importe;
    }, 0);
    
    console.log('Total calculado:', total);
    return isNaN(total) ? 0 : total; // Si por alguna razón el total es NaN, devolver 0
  }

  // Exportar datos
  exportBtn.addEventListener('click', () => {
    const gastos = localStorage.getItem('gastos') || '[]';
    const blob = new Blob([gastos], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gastos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Importar datos
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gastos = JSON.parse(e.target.result);
          localStorage.setItem('gastos', JSON.stringify(gastos));
          cargarGastos();
          actualizarTotalesMensuales();
        } catch (error) {
          console.error('Error al importar archivo:', error);
        }
      };
      reader.readAsText(file);
    }
  });

  // Generar reporte PDF
  reportBtn.addEventListener('click', () => {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    
    const doc = new jsPDF();
    doc.text('Reporte de Gastos', 20, 20);

    const data = gastos.map(gasto => {
      const importe = Number(gasto.importe || gasto.monto || 0);
      const concepto = gasto.concepto || gasto.descripcion || '';
      return [
        concepto,
        gasto.categoria || '',
        importe.toFixed(2) + ' €',
        formatearFecha(gasto.fecha)
      ];
    });

    doc.autoTable({
      head: [['Concepto', 'Categoría', 'Importe', 'Fecha']],
      body: data,
      startY: 30,
      theme: 'striped',
      styles: {
        fontSize: 8
      },
      headStyles: {
        fillColor: [237, 137, 54]
      }
    });

    doc.save('reporte-gastos.pdf');
  });
});