import React, { useState } from 'react';

function Registro({ irALogin }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  // Cambiamos localhost por tu URL de Render
  const API_URL = 'https://monitor-precios-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("¡Cuenta creada! Ahora podés iniciar sesión.");
        irALogin();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '80px auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Tu Nombre" 
               onChange={e => setForm({...form, nombre: e.target.value})} 
               style={{width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box'}} required />
        
        <input type="email" placeholder="Email" 
               onChange={e => setForm({...form, email: e.target.value})} 
               style={{width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box'}} required />
        
        <input type="password" placeholder="Contraseña" 
               onChange={e => setForm({...form, password: e.target.value})} 
               style={{width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box'}} required />
        
        <button type="submit" style={{width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
          Registrarme
        </button>
      </form>
      <p style={{fontSize: '14px', marginTop: '15px'}}>
        ¿Ya tenés cuenta? <button onClick={irALogin} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}>Iniciá sesión</button>
      </p>
    </div>
  );
}

export default Registro;