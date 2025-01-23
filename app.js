document.addEventListener('DOMContentLoaded', () => {
  const gastoForm = document.getElementById('gastoForm');
  const gastosTable = document.getElementById('gastosTable').getElementsByTagName('tbody')[0];

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
});