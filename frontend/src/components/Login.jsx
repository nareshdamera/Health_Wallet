import React, { useState } from 'react';
import api from '../api';
import { Lock, Mail, UserCircle, Activity } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(''); // Added name state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    try {
      // Included name in the request body
      const response = await api.post(endpoint, { name, email, password, role });
      
      if (isRegister) {
        alert("Registration successful! Please login.");
        setIsRegister(false);
        setName(''); // Clear name field
      } else {
        const userData = {
          token: response.data.token,
          role: response.data.role,
          userId: response.data.userId,
          name: response.data.name, // Ensure backend returns the name on login
          email: email
        };
        localStorage.setItem('user', JSON.stringify(userData));
        onLogin(userData);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Activity size={40} color="#007bff" />
          <h2 style={styles.title}>Digital Health Wallet</h2>
          <p style={styles.subtitle}>{isRegister ? 'Create your account' : 'Welcome back'}</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* New Name Input - Only visible during Registration */}
          {isRegister && (
            <div style={styles.inputGroup}>
              <UserCircle size={20} style={styles.icon} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <Mail size={20} style={styles.icon} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div style={styles.roleContainer}>
              <p style={styles.label}>Select Role:</p>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    value="patient" 
                    checked={role === 'patient'} 
                    onChange={() => setRole('patient')} 
                  /> Patient
                </label>
                <label style={styles.radioLabel}>
                  <input 
                    type="radio" 
                    value="viewer" 
                    checked={role === 'viewer'} 
                    onChange={() => setRole('viewer')} 
                  /> Other (Doctor/Family)
                </label>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            style={styles.toggleLink}
          >
            {isRegister ? ' Login here' : ' Register here'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  card: { background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { margin: '10px 0 5px', color: '#2c3e50' },
  subtitle: { color: '#7f8c8d', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '12px', color: '#bdc3c7' },
  input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #dfe6e9', fontSize: '16px', outline: 'none' },
  roleContainer: { textAlign: 'left' },
  label: { marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' },
  radioGroup: { display: 'flex', gap: '20px' },
  radioLabel: { fontSize: '14px', cursor: 'pointer' },
  button: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  toggleText: { marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#7f8c8d' },
  toggleLink: { color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;