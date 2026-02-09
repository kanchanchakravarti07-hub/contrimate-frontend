import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Yahan Future me Backend API call lagegi
    // Abhi ke liye bas UI change kar rahe hain
    setSubmitted(true);
  };

  const inputStyle = {
    width:'100%', padding:'16px 16px 16px 50px', 
    borderRadius:'12px', background:'rgba(255, 255, 255, 0.05)', 
    border:'1px solid rgba(255, 255, 255, 0.1)', 
    color:'white', fontSize:'16px', outline:'none',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f172a'}}>
      <div className="card" style={{
        width:'100%', maxWidth:'400px', padding:'45px 35px', 
        borderRadius:'24px', background:'#1e293b', 
        boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        border:'1px solid rgba(255,255,255,0.08)'
      }}>
        
        <div style={{textAlign:'center', marginBottom:'30px'}}>
          <h2 style={{fontSize:'2rem', fontWeight:'700', color: 'white', margin:0}}>
            Forgot Password
          </h2>
          <p style={{color:'#94a3b8', marginTop:'10px', lineHeight:'1.5'}}>
            {submitted ? "We've sent a reset link to your email." : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'25px', position:'relative'}}>
              <Mail style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => {e.target.style.borderColor = '#10b981';}}
                onBlur={(e) => {e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';}}
              />
            </div>

            <button type="submit" style={{width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'bold', background:'#10b981', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
              <Send size={20}/> Send Reset Link
            </button>
          </form>
        ) : (
          <div style={{textAlign:'center'}}>
             <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '12px', color: '#10b981', marginBottom: '20px'}}>
                Please check your inbox (and spam folder) for the reset link.
             </div>
          </div>
        )}

        <div style={{textAlign:'center', marginTop:'30px'}}>
          <Link to="/login" style={{color:'#94a3b8', fontSize:'14px', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
            <ArrowLeft size={16}/> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;