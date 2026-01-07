import React, { useState } from 'react';

function Login({ onLogin, irARegistro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cambiamos localhost por tu URL de Render
  const API_URL = 'https://monitor-precios-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        const usuarioParaApp = {
          ...data.usuario,
          email: email.toLowerCase() 
        };

        onLogin(usuarioParaApp);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor en Render. Revisá los logs del Backend.");
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          style={{width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box'}} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          style={{width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box'}} 
          required 
        />
        <button type="submit" style={{width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
          ENTRAR
        </button>
      </form>
      
      <p style={{fontSize: '14px', marginTop: '15px'}}>
        ¿No tenés cuenta? 
        <button 
          onClick={irARegistro} 
          style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px'}}
        >
          Registrate acá
        </button>
      </p>
    </div>
  );
}

export default Login;