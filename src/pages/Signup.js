import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AtSign, Key, CheckCircle, ArrowRight } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [upiId, setUpiId] = useState('');


  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return alert("Valid Email toh daal bhai!");
    
    setLoading(true);
    try {

        const res = await fetch('http://localhost:8081/api/users/send-otp?email=' + email, {
            method: 'POST'
        });
        
        
        if (res.ok) {
            alert(`OTP sent to ${email} 📧`);
            setStep(2);
        } else {
            const text = await res.text();
            alert("Error: " + text);
        }
    } catch (err) { 
        console.error(err);
        alert("Server Error. Backend Terminal check karo."); 
    }
    setLoading(false);
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if(otp.length < 6) return alert("6 Digit ka OTP daal bhai!");
    
    
    setStep(3); 
  };

  
  const handleSignup = async (e) => {
    e.preventDefault();
    
   
    if (!upiId.includes('@') || upiId.length < 5) {
        return alert("Invalid UPI ID! (Format: name@bank)");
    }

    setLoading(true);
    

    const userData = { 
        name, 
        email, 
        password, 
        upiId,
        otp 
    };

    try {
      const res = await fetch('http://localhost:8081/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        const newUser = await res.json();
        localStorage.setItem('user', JSON.stringify(newUser));
        alert("Account Verified & Created! 🚀");
        navigate('/home'); 
      } else {
        const errorText = await res.text();
        alert("Failed: " + errorText);
      }
    } catch (error) { 
        console.error(error);
        alert("Server Error"); 
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh'}}>
      <div className="card" style={{width:'100%', maxWidth:'450px', padding:'40px 30px', borderRadius:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.05)', backgroundColor:'#1a1a1a'}}>
        
        <div style={{textAlign:'center', marginBottom:'30px'}}>
          <h1 style={{fontSize:'2.5rem', fontWeight:'800', background:'linear-gradient(to right, #10b981, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin: 0}}>
            {step === 1 ? 'Get Started' : step === 2 ? 'Verify Email' : 'Final Details'}
          </h1>
          <p style={{color:'#888', marginTop:'10px'}}>
            {step === 1 ? 'Enter email to receive OTP' : step === 2 ? `OTP sent to ${email}` : 'Secure your account'}
          </p>
        </div>

        
        {step === 1 && (
            <form onSubmit={handleSendOtp}>
                <div style={{marginBottom:'20px', position:'relative'}}>
                    <Mail style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
                    <input type="email" placeholder="Your Email Address" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'#2a2a2a', border:'1px solid #444', color:'white', fontSize:'16px', outline:'none'}} />
                </div>
                <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'#10b981', color:'white', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                    {loading ? 'Sending...' : <><ArrowRight size={20}/> Send OTP</>}
                </button>
            </form>
        )}

        
        {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
                <div style={{marginBottom:'20px', position:'relative'}}>
                    <Key style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
                    <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} required style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'#2a2a2a', border:'1px solid #444', color:'white', fontSize:'16px', outline:'none', letterSpacing:'5px', fontWeight:'bold'}} />
                </div>
                <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'#10b981', color:'white', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                    {loading ? 'Verifying...' : <><CheckCircle size={20}/> Verify & Continue</>}
                </button>
                <p onClick={()=>setStep(1)} style={{textAlign:'center', marginTop:'15px', color:'#888', fontSize:'12px', cursor:'pointer'}}>Wrong email? Change it</p>
            </form>
        )}

        
        {step === 3 && (
            <form onSubmit={handleSignup}>
                <div style={{marginBottom:'15px', position:'relative'}}>
                    <User style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} required style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'#2a2a2a', border:'1px solid #444', color:'white', fontSize:'16px', outline:'none'}} />
                </div>
                <div style={{marginBottom:'15px', position:'relative'}}>
                    <AtSign style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
                    <input type="text" placeholder="Your UPI ID (Verified)" value={upiId} onChange={(e)=>setUpiId(e.target.value)} required style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'#2a2a2a', border:'1px solid #444', color:'white', fontSize:'16px', outline:'none'}} />
                </div>
                <div style={{marginBottom:'25px', position:'relative'}}>
                    <Lock style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#10b981'}} size={20}/>
                    <input type="password" placeholder="Set Password" value={password} onChange={(e)=>setPassword(e.target.value)} required style={{width:'100%', padding:'16px 16px 16px 50px', borderRadius:'14px', background:'#2a2a2a', border:'1px solid #444', color:'white', fontSize:'16px', outline:'none'}} />
                </div>
                <button type="submit" disabled={loading} style={{width:'100%', padding:'16px', borderRadius:'14px', background:'#10b981', color:'white', border:'none', fontSize:'16px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                    {loading ? 'Creating...' : <><UserPlus size={20}/> Finish Setup</>}
                </button>
            </form>
        )}

        {step === 1 && (
            <div style={{textAlign:'center', marginTop:'25px'}}>
            <p style={{color:'#888'}}>Already have an account? <Link to="/login" style={{color:'#10b981', fontWeight:'bold', textDecoration:'none'}}>Login</Link></p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Signup;