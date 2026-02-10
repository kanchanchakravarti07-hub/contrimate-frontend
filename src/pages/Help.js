import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, ExternalLink, HelpCircle } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    { 
      q: "How to split unevenly?", 
      a: "While adding an expense, use the 'Diff Bill' toggle to manually enter amounts for each person." 
    },
    { 
      q: "Can I edit an expense?", 
      a: "Currently, you can delete an incorrect expense and re-add it to maintain accuracy." 
    },
    { 
      q: "Is payment real?", 
      a: "No, Contrimate is a tracking tool. Actual payments are made via your preferred UPI apps." 
    }
  ];

  const handleEmailContact = () => {
    window.location.href = "mailto:2314114kanchan.2023cse@gmail.com?subject=Contrimate Support Request";
  };

  return (
    <div className="container" style={{ background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px 20px 100px 20px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0', marginBottom: '10px' }}>
        <div onClick={() => navigate(-1)} style={{ background: '#1e293b', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: '1px solid #334155' }}>
          <ArrowLeft size={20} color="white" />
        </div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Help Center</h2>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', 
        padding: '25px', borderRadius: '24px', marginBottom: '30px', 
        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' 
      }}>
        <HelpCircle size={40} color="white" style={{ marginBottom: '15px', opacity: 0.8 }} />
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>How can we help?</h3>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
          Find answers to frequently asked questions or get in touch with our team.
        </p>
      </div>

      <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', letterSpacing: '1.5px', fontWeight: '800', textTransform: 'uppercase' }}>
        FREQUENTLY ASKED
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        {faqs.map((f, i) => (
            <div key={i} style={{ 
              background: '#1e293b', padding: '20px', borderRadius: '20px', 
              border: '1px solid #334155', transition: '0.3s' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                    <p style={{ margin: 0, fontWeight: '700', color: 'white', fontSize: '15px' }}>{f.q}</p>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', paddingLeft: '18px' }}>{f.a}</p>
            </div>
        ))}
      </div>

      <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', letterSpacing: '1.5px', fontWeight: '800', textTransform: 'uppercase' }}>
        CONTACT US
      </h4>

      <div 
        onClick={handleEmailContact}
        style={{ 
          background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', 
          padding: '20px', borderRadius: '20px', display: 'flex', 
          alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#10b981', padding: '10px', borderRadius: '12px' }}>
            <Mail size={20} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'white' }}>Email Support</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#10b981' }}>2314114kanchan.2023cse@gmail.com</p>
          </div>
        </div>
        <ExternalLink size={18} color="#64748b" />
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
            onClick={handleEmailContact}
            style={{ 
                width: '100%', background: '#10b981', color: 'white', 
                padding: '18px', borderRadius: '18px', border: 'none', 
                fontSize: '16px', fontWeight: '800', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', gap: '12px', 
                cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' 
            }}
        >
            <MessageCircle size={22}/> Send Message
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '40px', color: '#475569', fontSize: '11px', fontWeight: '600' }}>
        CONTRIMATE SUPPORT v1.0.0
      </p>

    </div>
  );
};

export default Help;