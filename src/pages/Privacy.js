import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Shield, Eye, X, Check, Users, Lock, Globe, ChevronRight } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [is2FA, setIs2FA] = useState(false);
  const [visibility, setVisibility] = useState('Friends Only');
  const [lastChanged, setLastChanged] = useState('Last changed 3 months ago'); // Dynamic Text
  
  const [showPassModal, setShowPassModal] = useState(false);
  const [showVisModal, setShowVisModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordUpdate = () => {
    if(!passwords.current || !passwords.new || !passwords.confirm) return alert("All fields required!");
    if(passwords.new !== passwords.confirm) return alert("New passwords do not match!");
    
    // Simulate Backend Update
    alert("Password Changed Successfully! 🔒");
    setShowPassModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setLastChanged('Last changed: Just now'); // 🔥 Update Text Immediately
  };

  const handleVisibilitySelect = (option) => {
    setVisibility(option);
    setShowVisModal(false);
  };

  return (
    <div className="container" style={{background:'#0f172a', minHeight:'100vh', color:'white', padding:'20px'}}>
      
      {/* Header */}
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px'}}>
        <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} />
        <h2 style={{margin:0, fontSize:'20px', fontWeight:'700'}}>Privacy & Security</h2>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        
        {/* Security Section */}
        <div style={{background:'#1e293b', padding:'20px', borderRadius:'20px', border:'1px solid #334155'}}>
            <h3 style={{margin:'0 0 20px 0', fontSize:'12px', color:'#94a3b8', letterSpacing:'1px', fontWeight:'600'}}>SECURITY</h3>
            
            {/* Change Password */}
            <div onClick={() => setShowPassModal(true)} style={{display:'flex', alignItems:'center', gap:'15px', paddingBottom:'15px', borderBottom:'1px solid #334155', cursor:'pointer'}}>
                <div style={{background:'rgba(245, 158, 11, 0.1)', padding:'8px', borderRadius:'10px'}}>
                    <Key size={20} color="#f59e0b"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'15px', fontWeight:'500'}}>Change Password</p>
                    <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>{lastChanged}</p>
                </div>
                <ChevronRight size={18} color="#64748b"/>
            </div>
            
            {/* 2FA Toggle */}
            <div onClick={() => setIs2FA(!is2FA)} style={{display:'flex', alignItems:'center', gap:'15px', paddingTop:'15px', cursor:'pointer'}}>
                <div style={{background:'rgba(16, 185, 129, 0.1)', padding:'8px', borderRadius:'10px'}}>
                    <Shield size={20} color="#10b981"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'15px', fontWeight:'500'}}>Two-Factor Auth</p>
                    <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>Secure your account</p>
                </div>
                <div style={{width:'44px', height:'24px', background: is2FA ? '#10b981' : '#334155', borderRadius:'20px', position:'relative', transition:'0.3s'}}>
                    <div style={{width:'18px', height:'18px', background:'white', borderRadius:'50%', position:'absolute', top:'3px', left: is2FA ? '23px' : '3px', transition:'0.3s'}}></div>
                </div>
            </div>
        </div>

        {/* Data Privacy Section */}
        <div style={{background:'#1e293b', padding:'20px', borderRadius:'20px', border:'1px solid #334155'}}>
            <h3 style={{margin:'0 0 20px 0', fontSize:'12px', color:'#94a3b8', letterSpacing:'1px', fontWeight:'600'}}>DATA PRIVACY</h3>
            
            {/* Visibility Selector */}
            <div onClick={() => setShowVisModal(true)} style={{display:'flex', alignItems:'center', gap:'15px', cursor:'pointer'}}>
                <div style={{background:'rgba(236, 72, 153, 0.1)', padding:'8px', borderRadius:'10px'}}>
                    <Eye size={20} color="#ec4899"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'15px', fontWeight:'500'}}>Data Visibility</p>
                    <p style={{margin:0, fontSize:'12px', color:'#3b82f6'}}>{visibility}</p>
                </div>
                <ChevronRight size={18} color="#64748b"/>
            </div>
        </div>
      </div>

      {/* Visibility Modal */}
      {showVisModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000}}>
            <div style={{width:'100%', maxWidth:'500px', padding:'25px', background:'#1e293b', borderTopLeftRadius:'24px', borderTopRightRadius:'24px', borderTop:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white'}}>Who sees your Stats?</h3>
                    <div onClick={() => setShowVisModal(false)} style={{cursor:'pointer', padding:'5px'}}><X size={20} color="white"/></div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {[
                        { label: 'Public', icon: <Globe size={18}/>, desc: 'Everyone sees Total Spent, Friends & Email' },
                        { label: 'Friends Only', icon: <Users size={18}/>, desc: 'Only friends see Stats & Email' },
                        { label: 'Private', icon: <Lock size={18}/>, desc: 'Hide Stats & Email from everyone' }
                    ].map((opt) => (
                        <div 
                            key={opt.label} 
                            onClick={() => handleVisibilitySelect(opt.label)}
                            style={{
                                display:'flex', alignItems:'center', gap:'15px', padding:'15px', 
                                background: visibility === opt.label ? 'rgba(59, 130, 246, 0.1)' : '#0f172a', 
                                borderRadius:'16px', border: visibility === opt.label ? '1px solid #3b82f6' : '1px solid #334155', 
                                cursor:'pointer'
                            }}
                        >
                            <div style={{color: visibility === opt.label ? '#3b82f6' : '#94a3b8'}}>{opt.icon}</div>
                            <div style={{flex:1}}>
                                <p style={{margin:0, fontSize:'15px', fontWeight:'500', color: visibility === opt.label ? '#3b82f6' : 'white'}}>{opt.label}</p>
                                <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>{opt.desc}</p>
                            </div>
                            {visibility === opt.label && <Check size={20} color="#3b82f6"/>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Password Modal (Same logic) */}
      {showPassModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
            <div className="card" style={{width:'85%', maxWidth:'350px', padding:'25px', background:'#1e293b', borderRadius:'24px', border:'1px solid #334155'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white'}}>Update Password</h3>
                    <div onClick={() => setShowPassModal(false)} style={{cursor:'pointer', padding:'5px', background:'#334155', borderRadius:'50%'}}><X size={18} color="white"/></div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'15px', marginBottom:'20px'}}>
                    <input type="password" placeholder="Current Password" value={passwords.current} onChange={e=>setPasswords({...passwords, current:e.target.value})} style={{padding:'12px', background:'#0f172a', borderRadius:'12px', border:'1px solid #334155', color:'white', outline:'none'}} />
                    <input type="password" placeholder="New Password" value={passwords.new} onChange={e=>setPasswords({...passwords, new:e.target.value})} style={{padding:'12px', background:'#0f172a', borderRadius:'12px', border:'1px solid #334155', color:'white', outline:'none'}} />
                    <input type="password" placeholder="Confirm Password" value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm:e.target.value})} style={{padding:'12px', background:'#0f172a', borderRadius:'12px', border:'1px solid #334155', color:'white', outline:'none'}} />
                </div>
                <button onClick={handlePasswordUpdate} style={{width:'100%', padding:'14px', borderRadius:'14px', background:'#3b82f6', color:'white', border:'none', fontWeight:'bold', fontSize:'15px', cursor:'pointer'}}>Update Password</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default Privacy;