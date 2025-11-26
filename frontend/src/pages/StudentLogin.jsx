import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import titleImg from '../assets/vidumina.png';

export const StudentLogin = () => {
  const [step, setStep] = useState(1); // 1: request OTP, 2: verify OTP
  const [registerNumber, setRegisterNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.studentRequestOTP({ register_number: registerNumber, phone });
      setSuccess('OTP sent to your registered phone number!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.studentVerifyOTP({ 
        register_number: registerNumber, 
        otp_code: otp 
      });
      login(response.data.user, {
        access: response.data.access,
        refresh: response.data.refresh,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
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

        {/* Heading */}
        <h2
          style={{
            marginBottom: '32px',
            fontSize: '1.8rem',
            fontWeight: '700',
            textShadow: '1px 1px 8px rgba(0,0,0,0.5)',
          }}
        >
          Student Login
        </h2>

        {/* Error / Success */}
        {error && (
          <div
            style={{
              background: 'rgba(255, 0, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ff4d4f',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: 'rgba(0, 255, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#4ade80',
              fontWeight: 500,
            }}
          >
            {success}
          </div>
        )}

        {/* Form */}
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Register Number</label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="STU123456"
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter registered phone number"
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #ff7e5f, #feb47b)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255,126,95,0.4)',
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          <Link
            to="/login"
            style={{
              color: '#00d4ff',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.target.style.color = '#ffffff'}
            onMouseLeave={e => e.target.style.color = '#00d4ff'}
          >
            ← Owner / Teacher Login
          </Link>
        </div>
      </div>
    </div>
  );
};
