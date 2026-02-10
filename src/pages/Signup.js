import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AtSign, Key, CheckCircle, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { API_BASE_URL } from '../config'; 

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');

  const isLengthValid = password.length >= 8;
  const isSymbolValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return alert("Valid Email toh daal bhai!");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/send-otp?email=${email}`, { method: 'POST' });
      if (res.ok) { alert(`OTP sent to ${email} 📧`); setStep(2); } 
      else { const text = await res.text(); alert("Error: " + text); }
    } catch (err) { console.error(err); alert("Server Error"); } 
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => { 
      e.preventDefault(); 
      if (otp.length < 6) return alert("6 Digit OTP!"); 
      setStep(3); 
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!upiId.includes('@') || upiId.length < 5) return alert("Invalid UPI ID!");
    if (!isLengthValid || !isSymbolValid) return alert("Password weak hai! Min 8 chars aur @#$ symbol use karo.");
    
    setLoading(true);
    const userData = { name, email, password, upiId, otp };
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/add`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(userData) });
      if (res.ok) { 
          const newUser = await res.json(); localStorage.setItem('user', JSON.stringify(newUser)); 
          alert("Account Created! 🚀"); navigate('/home'); 
      } else { const text = await res.text(); alert("Failed: " + text); }
    } catch (error) { console.error(error); alert("Server Error"); } 
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '16px 50px 16px 50px', borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box'
  };
  const iconStyle = { position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', pointerEvents: 'none' };
  
  const validationStyle = (isValid) => ({
    fontSize: '13px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px',
    color: isValid ? '#10b981' : '#64748b', 
    transition: 'color 0.3s ease'
  });

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '45px 35px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1e293b' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            {step === 1 ? 'Get Started' : step === 2 ? 'Verify Email' : 'Final Details'}
          </h1>
          <div style={{ color: '#94a3b8', marginTop: '10px', fontSize: '15px' }}>
            {step === 1 ? 'Enter email to receive OTP' : step === 2 ? (
               <>OTP sent to <span style={{color:'white', fontWeight:'bold'}}>{email}</span><br/><span style={{color: '#f59e0b', fontWeight: 'bold'}}>⚠️ Check Spam/Junk Folder</span></>
            ) : 'Secure your account'}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <Mail style={iconStyle} size={20} />
              <input type="email" placeholder="Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Sending...' : <><ArrowRight size={20} /> Send OTP</>}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <Key style={iconStyle} size={20} />
              <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required style={{ ...inputStyle, letterSpacing: '8px', fontSize: '18px', fontWeight: 'bold' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Verifying...' : <><CheckCircle size={20} /> Verify & Continue</>}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <User style={iconStyle} size={20} />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <AtSign style={iconStyle} size={20} />
              <input type="text" placeholder="Your UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} required style={inputStyle} />
            </div>
            
            <div style={{ marginBottom: '25px', position: 'relative' }}>
              <Lock style={iconStyle} size={20} />
              <input type={showPassword ? "text" : "password"} placeholder="Set Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
              <div onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#94a3b8'}}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
              
              <div style={{marginTop: '10px', paddingLeft: '5px'}}>
                <div style={validationStyle(isLengthValid)}>
                    {isLengthValid ? <Check size={14} /> : <div style={{width:14, height:14, borderRadius:'50%', border:'1px solid #64748b'}}/>} 
                    Min 8 characters
                </div>
                <div style={validationStyle(isSymbolValid)}>
                    {isSymbolValid ? <Check size={14} /> : <div style={{width:14, height:14, borderRadius:'50%', border:'1px solid #64748b'}}/>} 
                    Contains symbol (@#$%)
                </div>
              </div>

            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {loading ? 'Creating...' : <><UserPlus size={20} /> Finish Setup</>}
            </button>
          </form>
        )}

        {step === 1 && <div style={{ textAlign: 'center', marginTop: '30px' }}><p style={{ color: '#94a3b8' }}>Already have an account? <Link to="/login" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link></p></div>}
      </div>
    </div>
  );
};
export default Signup;