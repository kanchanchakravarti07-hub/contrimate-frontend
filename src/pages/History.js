import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Receipt, MessageCircle, Utensils, Car, ShoppingBag, Zap, Coffee, Gift 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const History = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
      fetchExpenses(user.id);
    }
  }, [navigate]);

  const fetchExpenses = (userId) => {
    fetch(`${API_BASE_URL}/api/expenses/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        // 🔥 FIX 1: Robust Sorting (Newest First)
        const sorted = Array.isArray(data) ? data.sort((a, b) => {
          const dateA = parseDate(a.createdAt);
          const dateB = parseDate(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        }) : [];
        setExpenses(sorted);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  // 🔥 FIX 2: Universal Date Parser
  const parseDate = (dateInput) => {
    if (!dateInput) return new Date(0);

    if (Array.isArray(dateInput)) {
      const [year, month, day, hour, minute, second] = dateInput;
      return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    }

    return new Date(dateInput);
  };

  // 🔥 FIX 3: Nice Date Format
  const formatDate = (dateInput) => {
    const date = parseDate(dateInput);

    if (date.getTime() === 0 || date.getFullYear() === 1970) return 'Old Record';

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    let hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${day} ${month}, ${hour}:${minute} ${ampm}`;
  };

  // 🔥 FIX 4: Smart Category Icons
  const getCategoryIcon = (desc) => {
    const d = desc ? desc.toLowerCase() : "";
    if (d.includes('food') || d.includes('pizza') || d.includes('burger')) return <Utensils size={20} color="#f59e0b" />;
    if (d.includes('travel') || d.includes('cab') || d.includes('uber') || d.includes('fuel')) return <Car size={20} color="#3b82f6" />;
    if (d.includes('shopping') || d.includes('cloth')) return <ShoppingBag size={20} color="#ec4899" />;
    if (d.includes('settle')) return <Zap size={20} color="#10b981" />;
    if (d.includes('coffee') || d.includes('tea')) return <Coffee size={20} color="#8b5cf6" />;
    if (d.includes('party') || d.includes('gift')) return <Gift size={20} color="#f43f5e" />;
    return <Receipt size={20} color="#10b981" />;
  };

  return (
    <div className="container" style={{ paddingBottom: '40px', background:'#0f172a', minHeight:'100vh', color:'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer', color: 'white' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>All History</h2>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading history...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {expenses.length > 0 ? expenses.map((expense) => {
            const isMyExpense = expense.paidBy?.id === currentUser?.id;

            return (
              <div
                key={expense.id}
                className="card"
                style={{
                  padding: '16px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#1e293b',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: '#0f172a',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getCategoryIcon(expense.description)}
                  </div>

                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', textTransform:'capitalize', color:'white' }}>
                      {expense.description}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {isMyExpense ? 'You paid' : `${expense.paidBy?.name} paid`} • {formatDate(expense.createdAt)}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '15px', fontWeight: 'bold', color: isMyExpense ? '#10b981' : '#f43f5e' }}>
                  {isMyExpense ? '+' : '-'} ₹{expense.totalAmount}
                </span>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Receipt size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p>No history found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
