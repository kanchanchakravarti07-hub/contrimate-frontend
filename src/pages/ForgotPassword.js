import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Key, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { API_BASE_URL } from '../config'; 

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isLengthValid = newPassword.length >= 8;
  const isSymbolValid = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/send-otp?email=${email}`, { method: 'POST' });
      if (res.ok) { alert(`OTP sent to ${email} 📧`); setStep(2); } else { alert("Check email."); }
    } catch (err) { console.error(err); alert("Server Error"); } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); 
    if(otp.length < 6) return alert("Invalid OTP"); 
    if (!isLengthValid || !isSymbolValid) return alert("Password weak hai! Min 8 chars aur @#$ symbol use karo.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp, newPassword }),
      });
      if (res.ok) { alert("Success! 🎉 Now Login."); navigate('/login'); } else { const text = await res.text(); alert("Error: " + text); }
    } catch (err) { console.error(err); alert("Server Error"); } finally { setLoading(false); }
  };

  const inputStyle = {
    width:'100%', padding:'16px 50px 16px 50px', borderRadius:'12px', background:'rgba(255, 255, 255, 0.05)', 
    border:'1px solid rgba(255, 255, 255, 0.1)', color:'white', fontSize:'16px', outline:'none', transition: 'all 0.3s ease', boxSizing: 'border-box'
  };
  const iconStyle = { position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981' };
  
  const validationStyle = (isValid) => ({
    fontSize: '13px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px',
    color: isValid ? '#10b981' : '#64748b', 
    transition: 'color 0.3s ease'
  });

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f172a'}}>
      <div className="card" style={{width:'100%', maxWidth:'400px', padding:'45px 35px', borderRadius:'24px', background:'#1e293b', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)', border:'1px solid rgba(255,255,255,0.08)'}}>
        
        <div style={{textAlign:'center', marginBottom:'30px'}}>
          <h2 style={{fontSize:'2rem', fontWeight:'700', color: 'white', margin:0}}>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
          
          <div style={{color:'#94a3b8', marginTop:'10px'}}>
            {step === 1 ? "Enter your email to receive OTP" : (
                 <>Enter OTP sent to <span style={{color:'white'}}>{email}</span><br/><span style={{color: '#f59e0b', fontWeight: 'bold'}}>⚠️ Check Spam/Junk Folder</span></>
            )}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div style={{marginBottom:'25px', position:'relative'}}>
              <Mail style={iconStyle} size={20}/>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#10b981', color:'white', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
             <div style={{marginBottom:'20px', position:'relative'}}>
              <Key style={iconStyle} size={20}/>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} required style={{...inputStyle, letterSpacing:'5px'}} />
            </div>
            <div style={{marginBottom:'25px', position:'relative'}}>
              <Lock style={iconStyle} size={20}/>
              <input type={showPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required style={inputStyle} />
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
            <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'12px', background:'#10b981', color:'white', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer'}}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{textAlign:'center', marginTop:'30px'}}>
          <Link to="/login" style={{color:'#94a3b8', fontSize:'14px', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}><ArrowLeft size={16}/> Back to Login</Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;