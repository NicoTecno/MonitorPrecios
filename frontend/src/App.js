import React, { useState, useEffect } from 'react';
import Login from './Login';
import Registro from './Registro';

function App() {
  const [user, setUser] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [productos, setProductos] = useState([]);
  const [url, setUrl] = useState('');
  const [alerta, setAlerta] = useState('');

  // --- CONFIGURACIÓN CENTRALIZADA ---
  const API_URL = 'https://monitor-precios-backend.onrender.com';
  const BOT_USERNAME = 'Monitor_de_precios_2026_bot'; 

  const cargarProductos = async (userId) => {
    try {
      // Reemplazado localhost por la URL de Render
      const res = await fetch(`${API_URL}/api/usuario/${userId}/productos`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  useEffect(() => {
    if (user) {
      cargarProductos(user.id);
      console.log("Usuario actual:", user);
    }
  }, [user]);

  const vincularTelegram = () => {
    window.open(`https://t.me/${BOT_USERNAME}`, '_blank');
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    // Reemplazado localhost por la URL de Render
    const response = await fetch(`${API_URL}/api/productos/seguimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, precioAlerta: Number(alerta), userId: user.id })
    });
    
    if (response.ok) {
      setUrl('');
      setAlerta('');
      setTimeout(() => cargarProductos(user.id), 3000);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!window.confirm("¿Dejar de seguir este producto?")) return;
    
    try {
      // Reemplazado localhost por la URL de Render
      const res = await fetch(`${API_URL}/api/usuario/${user.id}/producto/${productoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProductos(productos.filter(item => item.producto._id !== productoId));
      } else {
        alert("Error al eliminar del servidor");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  if (user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', marginBottom: '20px', paddingBottom: '10px' }}>
          <h2>Hola, {user.nombre} 👋</h2>
          <button onClick={() => setUser(null)} style={{ padding: '8px 15px', cursor: 'pointer', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>Cerrar Sesión</button>
        </header>

        {/* --- SECCIÓN VINCULAR TELEGRAM --- */}
        <section style={{ 
            background: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            border: '1px solid #90caf9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: '#0d47a1' }}>📱 Recibí alertas en tu celular</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
              Hacé clic y enviá al bot: <code>/vincular {user.email || "(revisá tu email)"}</code>
            </p>
          </div>
          <button 
            onClick={vincularTelegram}
            style={{ 
                padding: '10px 20px', 
                background: '#0088cc', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
            }}
          >
            ABRIR BOT
          </button>
        </section>

        <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3>Añadir Producto</h3>
          <form onSubmit={agregarProducto}>
            <input type="url" placeholder="Link del producto (CompraGamer, MeLi, Tiendamia)" value={url} onChange={e => setUrl(e.target.value)} required 
                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            <input type="number" placeholder="Tu alerta en pesos (Ej: 800000)" value={alerta} onChange={e => setAlerta(e.target.value)} required 
                   style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              EMPEZAR A SEGUIR
            </button>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Tus Seguimientos</h3>
            <button onClick={() => cargarProductos(user.id)} style={{ padding: '5px 10px', cursor: 'pointer' }}>🔄 Actualizar Lista</button>
          </div>
          
          {productos.length === 0 ? <p>No hay seguimientos activos.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Producto</th>
                  <th style={{ padding: '12px' }}>Precio Actual</th>
                  <th style={{ padding: '12px' }}>Tu Alerta</th>
                  <th style={{ padding: '12px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((item, index) => (
                  <tr key={item.producto._id || index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <a href={item.producto.url} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
                        {item.producto.nombre}
                      </a>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      ${item.producto.ultimoPrecio?.toLocaleString('es-AR') || 'Pendiente'}
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>
                      ${item.precioAlerta?.toLocaleString('es-AR')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => eliminarProducto(item.producto._id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '18px' }}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    );
  }

  return (
    <div>
      {vistaActual === 'login' ? (
        <Login onLogin={setUser} irARegistro={() => setVistaActual('registro')} />
      ) : (
        <Registro irALogin={() => setVistaActual('login')} />
      )}
    </div>
  );
}

export default App;