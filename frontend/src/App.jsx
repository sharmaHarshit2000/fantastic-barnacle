import React, { useState, useRef, useEffect } from 'react';
import { embedDashboard } from '@superset-ui/embedded-sdk';

function App() {
  const [companyId, setCompanyId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestToken, setGuestToken] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const mountPoint = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    setError(null);
    setDebugInfo('');
    
    try {
      setDebugInfo('Fetching guest token from backend...');
      const response = await fetch('https://fantastic-barnacle.onrender.com/api/superset/guest-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(`Backend error: ${response.status} - ${errorText}`);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const { token, supersetUrl, message } = await response.json();
      setDebugInfo('Token received successfully. Starting dashboard embedding...');
      setGuestToken(token);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Token fetch error:', error);
      setError(error.message || 'Failed to connect to server. Please try again.');
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && guestToken && mountPoint.current) {
      const embedDashboardAsync = async () => {
        setDebugInfo('Attempting to embed dashboard...');
        
        try {
          // Add a timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Dashboard embedding timeout after 30 seconds')), 30000)
          );

          const embedPromise = embedDashboard({
            id: "0ca85b14-d815-4107-8f5f-adea5e49bc39",
            supersetDomain: "https://superset-develop.solargraf.com",
            mountPoint: mountPoint.current,
            fetchGuestToken: () => {
              setDebugInfo('Guest token provided to Superset SDK');
              return Promise.resolve(guestToken);
            },
            dashboardUiConfig: {
              hideTitle: true,
              hideTab: true,
              filters: {
                expanded: false,
              },
            },
          });

          await Promise.race([embedPromise, timeoutPromise]);
          setDebugInfo('✅ Dashboard embedded successfully!');
          
        } catch (error) {
          console.error('❌ Embedding error:', error);
          setError(`Failed to load dashboard: ${error.message}`);
          setDebugInfo(`Embedding failed: ${error.message}`);
          
          // Show the mount point for debugging
          if (mountPoint.current) {
            mountPoint.current.innerHTML = `
              <div style="padding: 20px; text-align: center; color: #666;">
                <h3>Dashboard Failed to Load</h3>
                <p>Error: ${error.message}</p>
                <p>Check console for details</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Try Again
                </button>
              </div>
            `;
          }
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
              <strong>Error:</strong> {error}
            </div>
          )}

          {debugInfo && (
            <div style={{
              color: '#666',
              background: '#f0f8ff',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #b3d9ff',
              fontSize: '12px',
              maxHeight: '100px',
              overflow: 'auto'
            }}>
              <strong>Debug:</strong> {debugInfo}
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
              {loading ? 'Loading...' : 'View Dashboard'}
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
        
        {debugInfo && (
          <div style={{
            color: '#666',
            background: '#f0f8ff',
            padding: '0.5rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            border: '1px solid #b3d9ff',
            fontSize: '11px',
            maxHeight: '60px',
            overflow: 'auto'
          }}>
            <strong>Status:</strong> {debugInfo}
          </div>
        )}
        
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            setCompanyId('');
            setGuestToken(null);
            setError(null);
            setDebugInfo('');
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
          height: 'calc(100vh - 150px)', 
          border: '2px dashed #ddd',
          borderRadius: '8px',
          background: '#fafafa',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#666'
        }}
      >
        {!debugInfo.includes('successfully') && 'Loading dashboard...'}
      </div>
    </div>
  );
}

export default App;