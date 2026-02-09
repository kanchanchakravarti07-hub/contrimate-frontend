import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const res = await fetch('http://localhost:8081/api/users/all');
      const users = await res.json();

      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (foundUser) {
        
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        
        navigate('/home');
      } else {
        alert("Account nahi mila! Pehle Sign Up karo.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server connect nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>
      <div className="card" style={{width:'100%', padding:'40px 30px', borderRadius:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          
          <h1 style={{
              fontSize:'2.5rem', 
              fontWeight:'800', 
              background:'linear-gradient(to right, #10b981, #34d399)', 
              WebkitBackgroundClip:'text', 
              WebkitTextFillColor:'transparent'
          }}>
            ContriMate
          </h1>
          <p style={{color:'var(--text-muted)', marginTop:'10px'}}>Welcome back!</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'20px'}}>
            <div style={{position:'relative'}}>
              <Mail style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'var(--primary)'}} size={20}/>
              <input 
                type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)}
                required
                style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'var(--bg-dark)', border:'2px solid var(--border)', color:'white', fontSize:'16px', outline:'none'}}
              />
            </div>
          </div>

          <div style={{marginBottom:'30px'}}>
            <div style={{position:'relative'}}>
              <Lock style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'var(--primary)'}} size={20}/>
              <input 
                type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}
                required
                style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'var(--bg-dark)', border:'2px solid var(--border)', color:'white', fontSize:'16px', outline:'none'}}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{padding:'16px', borderRadius:'14px', fontSize:'18px', letterSpacing:'1px'}}>
            {loading ? 'Checking...' : <><LogIn size={20}/> Sign In</>}
          </button>
        </form>

        <div style={{textAlign:'center', marginTop:'25px'}}>
          <p style={{color:'var(--text-muted)'}}>New here? <Link to="/signup" style={{color:'var(--primary)', fontWeight:'bold', textDecoration:'none'}}>Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;