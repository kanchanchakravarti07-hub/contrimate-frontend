import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    { q: "How to split unevenly?", a: "While adding an expense, click 'Split Equally' to toggle modes." },
    { q: "Can I edit an expense?", a: "Currently, you can delete and re-add the expense." },
    { q: "Is payment real?", a: "No, this is just a tracker. Payments happen via UPI apps." }
  ];

  return (
    <div className="container" style={{background:'#0f172a', minHeight:'100vh', color:'white', padding:'20px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px'}}>
        <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} />
        <h2 style={{margin:0, fontSize:'20px'}}>Help & Support</h2>
      </div>

      <h3 style={{fontSize:'14px', color:'#94a3b8', marginBottom:'10px'}}>FREQUENTLY ASKED</h3>
      <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'30px'}}>
        {faqs.map((f, i) => (
            <div key={i} style={{background:'#1e293b', padding:'15px', borderRadius:'12px', border:'1px solid #334155'}}>
                <p style={{margin:'0 0 5px 0', fontWeight:'bold', color:'#3b82f6'}}>{f.q}</p>
                <p style={{margin:0, fontSize:'13px', color:'#cbd5e1'}}>{f.a}</p>
            </div>
        ))}
      </div>

      <button style={{width:'100%', background:'#10b981', color:'white', padding:'14px', borderRadius:'12px', border:'none', fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer'}}>
        <MessageCircle size={20}/> Contact Support
      </button>
    </div>
  );
};

export default Help;
