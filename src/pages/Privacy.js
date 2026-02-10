import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Shield, Eye, X, Check, Users, Lock, Globe, ChevronRight } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  const [is2FA, setIs2FA] = useState(false);
  const [visibility, setVisibility] = useState('Friends Only');
  const [lastChanged, setLastChanged] = useState('Last changed 3 months ago'); 
  
  const [showPassModal, setShowPassModal] = useState(false);
  const [showVisModal, setShowVisModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordUpdate = () => {
    if(!passwords.current || !passwords.new || !passwords.confirm) return alert("All fields required!");
    if(passwords.new !== passwords.confirm) return alert("New passwords do not match!");
    
    alert("Password Changed Successfully! 🔒");
    setShowPassModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setLastChanged('Last changed: Just now'); 
  };

  const handleVisibilitySelect = (option) => {
    setVisibility(option);
    setTimeout(() => setShowVisModal(false), 300); 
  };

  return (
    <div className="container" style={{background:'#0f172a', minHeight:'100vh', color:'white', padding:'20px 20px 100px 20px'}}>
      
      <div style={{display:'flex', alignItems:'center', gap:'15px', padding: '20px 0', marginBottom:'10px'}}>
        <div onClick={() => navigate(-1)} style={{ background: '#1e293b', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #334155' }}>
          <ArrowLeft size={20} color="white" />
        </div>
        <h2 style={{margin:0, fontSize:'22px', fontWeight:'800'}}>Privacy & Security</h2>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
        
        <div style={{background:'#1e293b', padding:'25px', borderRadius:'28px', border:'1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{margin:'0 0 20px 0', fontSize:'12px', color:'#64748b', letterSpacing:'1.5px', fontWeight:'800', textTransform:'uppercase'}}>SECURITY SETTINGS</h3>
            
            <div onClick={() => setShowPassModal(true)} style={{display:'flex', alignItems:'center', gap:'18px', paddingBottom:'20px', borderBottom:'1px solid rgba(51, 65, 85, 0.5)', cursor:'pointer'}}>
                <div style={{background:'rgba(245, 158, 11, 0.15)', padding:'12px', borderRadius:'14px'}}>
                    <Key size={22} color="#f59e0b"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'16px', fontWeight:'700'}}>Change Password</p>
                    <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>{lastChanged}</p>
                </div>
                <ChevronRight size={18} color="#475569"/>
            </div>
            
            <div onClick={() => setIs2FA(!is2FA)} style={{display:'flex', alignItems:'center', gap:'18px', paddingTop:'20px', cursor:'pointer'}}>
                <div style={{background:'rgba(16, 185, 129, 0.15)', padding:'12px', borderRadius:'14px'}}>
                    <Shield size={22} color="#10b981"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'16px', fontWeight:'700'}}>Two-Factor Auth</p>
                    <p style={{margin:0, fontSize:'12px', color:'#64748b'}}>Additional layer of security</p>
                </div>
                <div style={{
                    width:'50px', height:'28px', 
                    background: is2FA ? '#10b981' : '#0f172a', 
                    borderRadius:'24px', position:'relative', 
                    transition:'0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #334155'
                }}>
                    <div style={{
                        width:'22px', height:'22px', 
                        background:'white', borderRadius:'50%', 
                        position:'absolute', top:'2px', 
                        left: is2FA ? '25px' : '2px', 
                        transition:'0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}></div>
                </div>
            </div>
        </div>

        <div style={{background:'#1e293b', padding:'25px', borderRadius:'28px', border:'1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
            <h3 style={{margin:'0 0 20px 0', fontSize:'12px', color:'#64748b', letterSpacing:'1.5px', fontWeight:'800', textTransform:'uppercase'}}>DATA VISIBILITY</h3>
            
            <div onClick={() => setShowVisModal(true)} style={{display:'flex', alignItems:'center', gap:'18px', cursor:'pointer'}}>
                <div style={{background:'rgba(236, 72, 153, 0.15)', padding:'12px', borderRadius:'14px'}}>
                    <Eye size={22} color="#ec4899"/>
                </div>
                <div style={{flex:1}}>
                    <p style={{margin:0, fontSize:'16px', fontWeight:'700'}}>Who can see my stats?</p>
                    <p style={{margin:0, fontSize:'13px', color:'#3b82f6', fontWeight:'600'}}>{visibility}</p>
                </div>
                <ChevronRight size={18} color="#475569"/>
            </div>
        </div>
      </div>

      {showVisModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:1000}}>
            <div style={{
                width:'100%', maxWidth:'500px', padding:'30px', 
                background:'#1e293b', borderTopLeftRadius:'32px', borderTopRightRadius:'32px', 
                borderTop:'1px solid #334155', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white', fontSize:'20px', fontWeight:'800'}}>Visibility Options</h3>
                    <div onClick={() => setShowVisModal(false)} style={{cursor:'pointer', padding:'8px', background: '#0f172a', borderRadius: '50%'}}><X size={20} color="white"/></div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    {[
                        { label: 'Public', icon: <Globe size={20}/>, desc: 'Everyone can see your activity & stats' },
                        { label: 'Friends Only', icon: <Users size={20}/>, desc: 'Only your friends can see your data' },
                        { label: 'Private', icon: <Lock size={20}/>, desc: 'Hide your stats from everyone' }
                    ].map((opt) => (
                        <div 
                            key={opt.label} 
                            onClick={() => handleVisibilitySelect(opt.label)}
                            style={{
                                display:'flex', alignItems:'center', gap:'18px', padding:'20px', 
                                background: visibility === opt.label ? 'rgba(59, 130, 246, 0.1)' : '#0f172a', 
                                borderRadius:'20px', border: visibility === opt.label ? '2px solid #3b82f6' : '1px solid #334155', 
                                cursor:'pointer', transition: '0.2s'
                            }}
                        >
                            <div style={{color: visibility === opt.label ? '#3b82f6' : '#64748b'}}>{opt.icon}</div>
                            <div style={{flex:1}}>
                                <p style={{margin:0, fontSize:'16px', fontWeight:'700', color: visibility === opt.label ? '#3b82f6' : 'white'}}>{opt.label}</p>
                                <p style={{margin:0, fontSize:'12px', color:'#64748b', marginTop: '2px'}}>{opt.desc}</p>
                            </div>
                            {visibility === opt.label && <div style={{background: '#3b82f6', borderRadius: '50%', padding: '4px'}}><Check size={16} color="white"/></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {showPassModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding: '20px'}}>
            <div style={{width:'100%', maxWidth:'400px', padding:'30px', background:'#1e293b', borderRadius:'32px', border:'1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center'}}>
                    <h3 style={{margin:0, color:'white', fontSize:'20px', fontWeight:'800'}}>Update Password</h3>
                    <div onClick={() => setShowPassModal(false)} style={{cursor:'pointer', padding:'8px', background:'#334155', borderRadius:'50%'}}><X size={18} color="white"/></div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'18px', marginBottom:'25px'}}>
                    <div style={{position: 'relative'}}>
                        <input type="password" placeholder="Current Password" value={passwords.current} onChange={e=>setPasswords({...passwords, current:e.target.value})} style={{width: '100%', padding:'16px', paddingLeft: '45px', background:'#0f172a', borderRadius:'16px', border:'1px solid #334155', color:'white', outline:'none', fontSize: '15px'}} />
                        <Lock size={18} color="#64748b" style={{position: 'absolute', left: '16px', top: '18px'}}/>
                    </div>
                    <div style={{position: 'relative'}}>
                        <input type="password" placeholder="New Password" value={passwords.new} onChange={e=>setPasswords({...passwords, new:e.target.value})} style={{width: '100%', padding:'16px', paddingLeft: '45px', background:'#0f172a', borderRadius:'16px', border:'1px solid #334155', color:'white', outline:'none', fontSize: '15px'}} />
                        <Shield size={18} color="#64748b" style={{position: 'absolute', left: '16px', top: '18px'}}/>
                    </div>
                    <div style={{position: 'relative'}}>
                        <input type="password" placeholder="Confirm Password" value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm:e.target.value})} style={{width: '100%', padding:'16px', paddingLeft: '45px', background:'#0f172a', borderRadius:'16px', border:'1px solid #334155', color:'white', outline:'none', fontSize: '15px'}} />
                        <Check size={18} color="#64748b" style={{position: 'absolute', left: '16px', top: '18px'}}/>
                    </div>
                </div>
                <button onClick={handlePasswordUpdate} style={{width:'100%', padding:'18px', borderRadius:'18px', background:'#3b82f6', color:'white', border:'none', fontWeight:'900', fontSize:'16px', cursor:'pointer', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'}}>Save New Password</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default Privacy;