import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "https://contrimate-backend-production.up.railway.app"; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullUrl = `${API_BASE_URL}/api/users/all`;

    try {
      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const users = await res.json();
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        if(foundUser.password && foundUser.password !== password) {
             alert("Wrong Password!");
             setLoading(false);
             return;
        }
        localStorage.setItem('user', JSON.stringify(foundUser));
        navigate('/home');
      } else {
        alert("Account nahi mila! Pehle Sign Up karo.");
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert(`Connection Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:'100%', padding:'16px 50px 16px 50px',
    borderRadius:'12px', background:'rgba(255, 255, 255, 0.05)', 
    border:'1px solid rgba(255, 255, 255, 0.1)', 
    color:'white', fontSize:'16px', outline:'none',
    transition: 'all 0.3s ease', boxSizing: 'border-box'
  };

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f172a'}}>
      <div className="card" style={{width:'100%', maxWidth:'400px', padding:'45px 35px', borderRadius:'24px', background:'#1e293b', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)', border:'1px solid rgba(255,255,255,0.08)'}}>
        
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <h1 style={{fontSize:'2.5rem', fontWeight:'800', background:'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0, letterSpacing: '-1px'}}>
            ContriMate
          </h1>
          <p style={{color:'#94a3b8', marginTop:'10px'}}>Welcome back! Please sign in.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'20px', position:'relative'}}>
            <Mail style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981', pointerEvents:'none'}} size={20}/>
            <input type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{marginBottom:'20px', position:'relative'}}>
            <Lock style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981', pointerEvents:'none'}} size={20}/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <div onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:'#94a3b8'}}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '30px' }}>
            <Link to="/forgot-password" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'bold', background:'#10b981', color:'white', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)'}}>
            {loading ? 'Checking...' : <><LogIn size={20}/> Sign In</>}
          </button>
        </form>

        <div style={{textAlign:'center', marginTop:'30px'}}>
          <p style={{color:'#94a3b8', fontSize:'14px'}}>
            New here? <Link to="/signup" style={{color:'#10b981', fontWeight:'bold', textDecoration:'none'}}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;