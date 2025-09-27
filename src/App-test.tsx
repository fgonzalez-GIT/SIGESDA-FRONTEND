import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎵 SIGESDA - Prueba Básica</h1>
      <p>Si ves este texto, React está funcionando correctamente.</p>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Sistema funcionando ✅</h2>
        <p>La aplicación React se está renderizando correctamente.</p>
        <button onClick={() => alert('¡Funciona!')}>Probar JavaScript</button>
      </div>
    </div>
  );
}

export default App;