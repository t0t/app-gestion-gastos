const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        // Obtener todos los gastos
        const { data: gastos, error: getError } = await supabase
          .from('gastos')
          .select('*')
          .order('fecha', { ascending: false });
        
        if (getError) throw getError;
        
        return {
          statusCode: 200,
          body: JSON.stringify(gastos)
        };
        
      case 'POST':
        // Crear nuevo gasto
        const nuevoGasto = JSON.parse(event.body);
        const { data: createdGasto, error: postError } = await supabase
          .from('gastos')
          .insert([{
            ...nuevoGasto,
            fecha: new Date().toISOString().split('T')[0]
          }])
          .single();
        
        if (postError) throw postError;
        
        return {
          statusCode: 201,
          body: JSON.stringify(createdGasto)
        };
        
      default:
        return {
          statusCode: 405,
          body: 'Método no permitido'
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};