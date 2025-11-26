import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import titleImg from '../assets/vidumina.png'; // make sure this path is correct

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      login(response.data.user, {
        access: response.data.access,
        refresh: response.data.refresh,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url("https://wpvip.edutopia.org/wp-content/uploads/2023/08/hero_feature_BTS_photo_iStock_1463406555_skynesher.jpg?w=2880&quality=85")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: '400px',
          maxWidth: '90%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '40px 30px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        {/* Title Image */}
        <img
          src={titleImg}
          alt="විදුමිණ"
          style={{
            width: '120px',
            
            margin: '0 auto 16px',
          }}
        />

        <h2
          style={{
            marginBottom: '32px',
            fontSize: '1.8rem',
            fontWeight: '700',
            textShadow: '1px 1px 8px rgba(0,0,0,0.5)',
          }}
        >
          Owner / Teacher Login
        </h2>

        {error && (
          <div
            style={{
              background: 'rgba(255, 0, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ff4d4f',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                outline: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                outline: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(90deg, #ff7e5f, #feb47b)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255,126,95,0.4)',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          <Link
            to="/student-login"
            style={{
              color: '#00d4ff',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.target.style.color = '#ffffff'}
            onMouseLeave={e => e.target.style.color = '#00d4ff'}
          >
            Student? Login with OTP →
          </Link>
        </div>
      </div>
    </div>
  );
};
