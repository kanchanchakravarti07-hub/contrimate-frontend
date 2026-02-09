import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [toggles, setToggles] = useState({ expense: true, groups: true, email: false });

  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="container" style={{background:'#0f172a', minHeight:'100vh', color:'white', padding:'20px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px'}}>
        <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} />
        <h2 style={{margin:0, fontSize:'20px'}}>Notification Prefs</h2>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
        {[
            { id: 'expense', label: 'New Expense Alerts', desc: 'Get notified when someone adds a bill.' },
            { id: 'groups', label: 'Group Invites', desc: 'Receive requests to join new groups.' },
            { id: 'email', label: 'Email Updates', desc: 'Receive weekly summaries via email.' }
        ].map(item => (
            <div key={item.id} onClick={() => toggle(item.id)} style={{background:'#1e293b', padding:'15px', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #334155', cursor:'pointer'}}>
                <div>
                    <h4 style={{margin:0, fontSize:'16px'}}>{item.label}</h4>
                    <p style={{margin:'4px 0 0 0', fontSize:'11px', color:'#94a3b8'}}>{item.desc}</p>
                </div>
                <div style={{width:'40px', height:'22px', background: toggles[item.id] ? '#10b981' : '#334155', borderRadius:'20px', position:'relative', transition:'0.3s'}}>
                    <div style={{width:'16px', height:'16px', background:'white', borderRadius:'50%', position:'absolute', top:'3px', left: toggles[item.id] ? '21px' : '3px', transition:'0.3s'}}></div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;