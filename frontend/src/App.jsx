import React, { useState, useRef, useEffect } from 'react';
import { embedDashboard } from '@superset-ui/embedded-sdk';

function App() {
  const [companyId, setCompanyId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestToken, setGuestToken] = useState(null);
  const [error, setError] = useState(null);
  const mountPoint = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Use LIVE backend URL
      const response = await fetch('https://fantastic-barnacle.onrender.com/api/superset/guest-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get guest token');
      }

      const { token, supersetUrl } = await response.json();
      setGuestToken(token);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Token fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && guestToken && mountPoint.current) {
      const embedDashboardAsync = async () => {
        try {
          await embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39", // UUID for embedding
            supersetDomain: "https://superset-develop.solargraf.com",
            mountPoint: mountPoint.current,
            fetchGuestToken: () => Promise.resolve(guestToken),
            dashboardUiConfig: {
              hideTitle: true,
              hideTab: true,
              filters: {
                expanded: false,
              },
            },
          });
          console.log('✅ Dashboard embedded successfully!');
        } catch (error) {
          console.error('❌ Embedding error:', error);
          setError('Failed to load dashboard. Please try again.');
        }
      };

      embedDashboardAsync();
    }
  }, [isAuthenticated, guestToken]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '350px'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem', 
            color: '#333',
            fontSize: '1.5rem'
          }}>
            Company Dashboard Login
          </h2>
          
          {error && (
            <div style={{
              color: '#e74c3c',
              background: '#fdf0ed',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #e74c3c'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                Company ID:
              </label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter Company ID (e.g., 9458, 27215)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666', 
                marginTop: '0.25rem' 
              }}>
                Try: 9458 (PlugPV), 27215 (Solar Energy), 30681 (ION Solar)
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Loading Dashboard...' : 'View Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      padding: '1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        marginBottom: '1rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
          Company Dashboard - ID: {companyId}
        </h3>
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            setCompanyId('');
            setGuestToken(null);
            setError(null);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
      
      <div 
        ref={mountPoint} 
        style={{ 
          height: 'calc(100vh - 100px)', 
          border: '2px dashed #ddd',
          borderRadius: '8px',
          background: '#fafafa'
        }}
      />
    </div>
  );
}

export default App;