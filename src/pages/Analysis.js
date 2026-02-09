import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, HandCoins, Receipt, TrendingUp, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

const Analysis = () => {
  const navigate = useNavigate();
  const [allExpenses, setAllExpenses] = useState([]); // Raw Data
  const [filteredData, setFilteredData] = useState([]); // For Charts
  const [settlements, setSettlements] = useState([]);   // For Settlement List
  const [timeFilter, setTimeFilter] = useState('MONTH'); // WEEK, MONTH, YEAR
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) fetchExpenses(user.id);
  }, []);

  // 1. Fetch All Data
  const fetchExpenses = (userId) => {
    fetch(`${API_BASE_URL}/api/expenses/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setAllExpenses(data);
            applyFilter(data, 'MONTH'); // Default filter
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // 2. Filter Logic (Week, Month, Year)
  const applyFilter = (data, filterType) => {
    setTimeFilter(filterType);
    
    const now = new Date();
    const cutoff = new Date();

    if (filterType === 'WEEK') cutoff.setDate(now.getDate() - 7);
    if (filterType === 'MONTH') cutoff.setMonth(now.getMonth() - 1);
    if (filterType === 'YEAR') cutoff.setFullYear(now.getFullYear() - 1);

    // Filter by Date
    const recentData = data.filter(item => {
        // Handle Array Date format from Java [yyyy, mm, dd, ...]
        const dateVal = Array.isArray(item.createdAt) 
            ? new Date(item.createdAt[0], item.createdAt[1]-1, item.createdAt[2])
            : new Date(item.createdAt);
        return dateVal >= cutoff;
    });

    // 🔥 Separate Settlements vs Real Expenses
    // Assuming 'description' or 'category' contains "Settlement"
    const realExpenses = recentData.filter(item => !item.description.toLowerCase().includes('settle'));
    const settlementData = recentData.filter(item => item.description.toLowerCase().includes('settle'));

    setSettlements(settlementData); 
    processChartData(realExpenses); 
  };

  // 3. Process Data for Charts
  const processChartData = (expenses) => {
    const total = expenses.reduce((acc, curr) => acc + curr.totalAmount, 0);
    setTotalExpense(total);

    const categoryMap = {};
    expenses.forEach(exp => {
        // Auto-categorize based on description if category is missing
        let cat = 'General';
        const desc = exp.description.toLowerCase();
        if (desc.includes('food') || desc.includes('pizza')) cat = 'Food';
        else if (desc.includes('travel') || desc.includes('cab') || desc.includes('fuel')) cat = 'Travel';
        else if (desc.includes('shopping')) cat = 'Shopping';
        else if (desc.includes('bill')) cat = 'Bills';

        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += exp.totalAmount;
    });

    const formattedData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    }));

    setFilteredData(formattedData);
  };

  return (
    <div className="container" style={{ paddingBottom: '100px', background: '#0f172a', minHeight: '100vh', color: 'white' }}>
      
      {/* Header */}
      <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <ArrowLeft onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Analysis</h2>
      </div>

      {/* 🔥 TIME FILTER TABS */}
      <div style={{display:'flex', background:'#1e293b', padding:'5px', borderRadius:'14px', marginBottom:'25px', border:'1px solid #334155'}}>
        {['WEEK', 'MONTH', 'YEAR'].map(filter => (
            <button 
                key={filter}
                onClick={() => applyFilter(allExpenses, filter)}
                style={{
                    flex:1, padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'600', fontSize:'12px',
                    background: timeFilter === filter ? '#10b981' : 'transparent',
                    color: timeFilter === filter ? 'white' : '#94a3b8',
                    transition: '0.3s'
                }}
            >
                {filter}
            </button>
        ))}
      </div>

      {loading ? <p style={{textAlign:'center', color:'#64748b'}}>Analyzing...</p> : (
        <>
            {/* Total Spend Card */}
            <div className="card" style={{ padding: '25px', borderRadius: '24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', marginBottom: '30px', textAlign:'center', boxShadow:'0 10px 30px rgba(59, 130, 246, 0.4)', position:'relative', overflow:'hidden' }}>
                <div style={{position:'absolute', top:'-20px', left:'-20px', width:'100px', height:'100px', background:'rgba(255,255,255,0.1)', borderRadius:'50%'}}></div>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)', letterSpacing:'1px', textTransform:'uppercase', fontWeight:'600' }}>Total Spent ({timeFilter})</p>
                <h1 style={{ margin: '5px 0 0 0', fontSize: '42px', color: 'white', fontWeight:'800' }}>₹{totalExpense.toFixed(0)}</h1>
            </div>

            {/* PIE CHART SECTION */}
            <h3 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px', letterSpacing:'1px', fontWeight:'600' }}>SPENDING BREAKDOWN</h3>
            <div className="card" style={{ height: '320px', padding: '10px', borderRadius: '24px', background: '#1e293b', marginBottom:'30px', border:'1px solid #334155' }}>
                {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={filteredData} 
                                cx="50%" cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                                stroke="none"
                            >
                                {filteredData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip 
                                contentStyle={{background:'#0f172a', border:'1px solid #334155', borderRadius:'12px', color:'white'}} 
                                itemStyle={{color:'white'}}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#64748b'}}>
                        <Receipt size={40} style={{opacity:0.2, marginBottom:'10px'}}/>
                        <p>No spending data available</p>
                    </div>
                )}
            </div>

            {/* 🔥 SETTLEMENTS SECTION */}
            {settlements.length > 0 && (
                <>
                    <h3 style={{ fontSize: '14px', color: '#f43f5e', marginBottom: '15px', letterSpacing:'1px', fontWeight:'600' }}>SETTLEMENTS & REPAYMENTS</h3>
                    <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'30px'}}>
                        {settlements.map((settle, index) => (
                            <div key={index} className="card" style={{padding:'16px', borderRadius:'16px', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #334155'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                    <div style={{width:'40px', height:'40px', background:'rgba(244, 63, 94, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <HandCoins size={20} color="#f43f5e"/>
                                    </div>
                                    <div>
                                        <h4 style={{margin:0, fontSize:'14px', color:'white', fontWeight:'600'}}>{settle.description}</h4>
                                        <span style={{fontSize:'11px', color:'#64748b'}}>
                                            {Array.isArray(settle.createdAt) ? `${settle.createdAt[2]}/${settle.createdAt[1]}` : 'Date'}
                                        </span>
                                    </div>
                                </div>
                                <span style={{fontWeight:'bold', color:'#f43f5e', fontSize:'14px'}}>- ₹{settle.totalAmount}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 5 }}>
        {['Home', 'Groups', 'Settle', 'Profile'].map((item) => (
            <div key={item} onClick={() => item === 'Settle' ? null : navigate(`/${item.toLowerCase()}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', opacity: item === 'Analysis' ? 1 : 0.5 }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: item === 'Analysis' ? '#10b981' : '#64748b' }}>{item}</span>
            </div>
        ))}
      </div>

    </div>
  );
};

export default Analysis;