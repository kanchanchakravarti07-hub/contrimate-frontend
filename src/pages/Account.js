import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, CheckCircle } from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load data from LocalStorage
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored) {
        setUser({
            ...stored,
            phone: stored.phoneNumber || '' // Agar phone number nahi hai to empty rakho
        });
    }
  }, []);

  const handleSave = () => {
    if(!user.name || !user.phone) return alert("Name and Phone are required!");

    // 1. Update Local Storage
    const updatedUser = { ...user, phoneNumber: user.phone };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 2. Show Success Message
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // 2 sec baad gayab ho jayega
  };

  return (
    <div className="container" style={{background:'#0f172a', minHeight:'100vh', color:'white', padding:'20px'}}>
      
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px'}}>
        <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} />
        <h2 style={{margin:0, fontSize:'20px'}}>Account Settings</h2>
      </div>

      {/* Form Card */}
      <div className="card" style={{background:'#1e293b', padding:'20px', borderRadius:'16px', border:'1px solid #334155'}}>
        
        {/* FULL NAME */}
        <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'8px', color:'#94a3b8', fontSize:'12px'}}>FULL NAME</label>
            <div style={{display:'flex', alignItems:'center', background:'#0f172a', borderRadius:'10px', padding:'12px', border:'1px solid #334155'}}>
                <User size={18} color="#64748b" style={{marginRight:'10px'}}/>
                <input 
                    value={user.name} 
                    onChange={(e)=>setUser({...user, name:e.target.value})} 
                    style={{background:'transparent', border:'none', color:'white', width:'100%', outline:'none'}}
                />
            </div>
        </div>

        {/* EMAIL (Read Only) */}
        <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'8px', color:'#94a3b8', fontSize:'12px'}}>EMAIL ADDRESS</label>
            <div style={{display:'flex', alignItems:'center', background:'#0f172a', borderRadius:'10px', padding:'12px', border:'1px solid #334155', opacity: 0.7}}>
                <Mail size={18} color="#64748b" style={{marginRight:'10px'}}/>
                <input 
                    value={user.email} 
                    disabled 
                    style={{background:'transparent', border:'none', color:'#94a3b8', width:'100%', outline:'none', cursor:'not-allowed'}}
                />
            </div>
        </div>

        {/* PHONE NUMBER (Simple Input) */}
        <div style={{marginBottom:'30px'}}>
            <label style={{display:'block', marginBottom:'8px', color:'#94a3b8', fontSize:'12px'}}>PHONE NUMBER</label>
            <div style={{display:'flex', alignItems:'center', background:'#0f172a', borderRadius:'10px', padding:'12px', border:'1px solid #334155'}}>
                <Phone size={18} color="#64748b" style={{marginRight:'10px'}}/>
                <input 
                    value={user.phone} 
                    onChange={(e)=>setUser({...user, phone:e.target.value})} 
                    placeholder="Enter Phone Number"
                    type="number"
                    style={{background:'transparent', border:'none', color:'white', width:'100%', outline:'none'}}
                />
            </div>
        </div>

        {/* Save Button */}
        <button 
            onClick={handleSave} 
            style={{
                width:'100%', 
                background: isSaved ? '#10b981' : '#3b82f6', 
                color:'white', padding:'14px', borderRadius:'12px', border:'none', 
                fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer',
                transition: '0.3s'
            }}
        >
            {isSaved ? <><CheckCircle size={20}/> Saved!</> : <><Save size={20}/> Save Changes</>}
        </button>

      </div>
    </div>
  );
};

export default Account;