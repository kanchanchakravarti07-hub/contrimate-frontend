import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AtSign, Key, CheckCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config'; 

const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');

  // --- LOGIC SAME HAI ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return alert("Valid Email toh daal bhai!");
    setLoading(true);
    const url = `${API_BASE_URL}/api/users/send-otp?email=${email}`;
    console.log("🚀 Trying to send OTP to:", url); 
    try {
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        alert(`OTP sent to ${email} 📧`);
        setStep(2);
      } else {
        const text = await res.text();
        alert("Error: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Server connect nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return alert("6 Digit ka OTP daal bhai!");
    setStep(3);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!upiId.includes('@') || upiId.length < 5) {
      return alert("Invalid UPI ID! (Format: name@bank)");
    }
    setLoading(true);
    const userData = { name, email, password, upiId, otp };
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const newUser = await res.json();
        localStorage.setItem('user', JSON.stringify(newUser));
        alert("Account Verified & Created! 🚀");
        navigate('/home');
      } else {
        const errorText = await res.text();
        alert("Signup Failed: " + errorText);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  // --- UI STYLES (Fixed) ---
  const inputContainerStyle = {
    marginBottom: '20px',
    position: 'relative',
    transition: 'all 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 50px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxSizing: 'border-box' // ✅ FIXED RIGHT SIDE ISSUE
  };

  const iconStyle = {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#10b981',
    pointerEvents: 'none'
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <div className="card" style={{ 
        width: '100%', maxWidth: '450px', padding: '45px 35px', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        backgroundColor: '#1e293b' 
      }}>

        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-1px' }}>
            {step === 1 ? 'Get Started' : step === 2 ? 'Verify Email' : 'Final Details'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '15px' }}>
            {step === 1 ? 'Enter email to receive OTP' : step === 2 ? `OTP sent to ${email}` : 'Secure your account'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={inputContainerStyle}>
              <Mail style={iconStyle} size={20} />
              <input 
                type="email" 
                placeholder="Your Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={inputStyle}
                onFocus={(e) => {e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'}}
                onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'}}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.3s' }}>
              {loading ? 'Sending...' : <><ArrowRight size={20} /> Send OTP</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={inputContainerStyle}>
              <Key style={iconStyle} size={20} />
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                maxLength={6} 
                required 
                style={{ ...inputStyle, letterSpacing: '8px', fontSize: '18px', fontWeight: 'bold' }}
                onFocus={(e) => {e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.1)'}}
                onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'}}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Verifying...' : <><CheckCircle size={20} /> Verify & Continue</>}
            </button>
            <p onClick={() => setStep(1)} style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>Wrong email? Change it</p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSignup}>
            <div style={inputContainerStyle}>
              <User style={iconStyle} size={20} />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
            </div>
            <div style={inputContainerStyle}>
              <AtSign style={iconStyle} size={20} />
              <input type="text" placeholder="Your UPI ID (Verified)" value={upiId} onChange={(e) => setUpiId(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
            </div>
            <div style={{ marginBottom: '25px', position: 'relative' }}>
              <Lock style={iconStyle} size={20} />
              <input type="password" placeholder="Set Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Creating...' : <><UserPlus size={20} /> Finish Setup</>}
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ color: '#94a3b8' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>
                Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;