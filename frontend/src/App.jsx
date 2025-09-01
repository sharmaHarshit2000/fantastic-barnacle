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

      const { token, supersetUrl, message } = await response.json();
      setGuestToken(token);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Token fetch error:', error);
      setError(error.message || 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && guestToken && mountPoint.current) {
      const embedDashboardAsync = async () => {
        // Store original fetch function
        const originalFetch = window.fetch;
        
        try {
          // Intercept problematic API calls that cause 401 errors
          window.fetch = async function(...args) {
            const url = args[0];
            
            // Bypass the roles API call that causes 401 errors
            if (url && typeof url === 'string' && url.includes('/api/v1/me/roles/')) {
              console.log('Intercepted roles API call - returning mock data');
              return Promise.resolve(new Response(JSON.stringify({
                result: [{ name: 'Gamma' }, { name: 'Public' }]
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            
            return originalFetch.apply(this, args);
          };

          await embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39",
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
          setError('Failed to load dashboard. Please try again or contact support.');
        } finally {
          // Restore original fetch function
          window.fetch = originalFetch;
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
              border: '1px solid #e74c3c',
              fontSize: '14px'
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
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.background = '#5a67d8';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.background = '#667eea';
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
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        marginBottom: '1rem', 
        padding: '1rem', 
        background: 'white', 
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem' }}>
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
            fontSize: '14px',
            fontWeight: 'bold'
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