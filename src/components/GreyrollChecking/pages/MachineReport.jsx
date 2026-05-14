import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MachineReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ================= STATES =================
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [api1Rows, setApi1Rows] = useState([]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [empFilter, setEmpFilter] = useState('All'); 
  const [searchRoll, setSearchRoll] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const MISTAKE_KEYS = [
    'hole', 'setoff', 'needle_line', 'oil_line', 'poovari', 
    'yarn_mistake', 'lycra_cut', 'neps', 'na_holes'
  ];

  // ================= FETCH + MERGE =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [api1Res, api2Res] = await Promise.all([
          fetch('https://app.herofashion.com/CoraRollcheck/'),
          fetch('https://app.herofashion.com/coraroll/')
        ]);

        const api1 = await api1Res.json();
        const api2 = await api2Res.json();

        setApi1Rows(api1);

        const api2Map = {};
        api2.forEach(item => {
          api2Map[item.rlno] = item;
        });

        const merged = api1
          .filter(item => {
            const check = api2Map[item.rlno];
            return check && check.submit === true;
          })
          .map(item => {
            const check = api2Map[item.rlno];
            const remarkExists = check.remark && check.remark.trim() !== '';
            
            // Logic: Count how many mistake types were recorded
            const hasBigMistake = MISTAKE_KEYS.some(key => {
              const value = check[key];
              if (!value) return false;

              const str = String(value).trim();
              const match = str.match(/\d+/);
              if (!match) return false;

              return parseInt(match[0], 10) > 5;
            });

            const status = (remarkExists || hasBigMistake)
              ? 'Fail Roll'
              : 'Pass Roll';

            return {
              roll_no: item.rlno,
              job_no: item.jobno,
              color: item.colour,
              dia: check.dia || item.dia,
              gsm: item.gsm,
              loop_length: check.loop_len || item.ll,
              remarks: check.remark || '',
              time: check.timer || '',
              date: check.dt || '',
              emp_id: check.empid || 'N/A',
              mistakes: check,
              status
            };
          });

        setRows(merged);
        setFilteredRows(merged);
      } catch (err) {
        console.error('API error:', err);
      }
    };

    fetchData();
  }, []);

  // ================= FILTER LOGIC =================
  useEffect(() => {
    let data = [...rows];
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter);
    if (jobFilter !== 'All') data = data.filter(r => r.job_no === jobFilter);
    if (colorFilter !== 'All') data = data.filter(r => r.color === colorFilter);
    if (empFilter !== 'All') data = data.filter(r => r.emp_id === empFilter);
    if (dateFilter) data = data.filter(r => r.date === dateFilter);
    if (searchRoll.trim() !== '') {
      data = data.filter(r => String(r.roll_no).includes(searchRoll.trim()));
    }
    setFilteredRows(data);
  }, [statusFilter, jobFilter, colorFilter, empFilter, searchRoll, dateFilter, rows]);

  const jobOptions = ['All Job No', ...new Set(api1Rows.map(r => r.jobno))];
  const colorOptions = ['All Colours', ...new Set(api1Rows.map(r => r.colour))];
  const empOptions = ['All Employees', ...new Set(rows.map(r => r.emp_id))];

  return (
    <div className="p-2 bg-slate-100 min-h-screen font-sans text-slate-800">
      <div className="max-w-auto mx-auto bg-white shadow-2xl rounded-xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 pt-2 pb-2 flex justify-between items-center text-white">
          <div>
            <h2 className="font-extrabold tracking-tight">Quality Inspection Report</h2>
            <p className="text-slate-400 text-sm mt-1">Real-time monitoring of fabric roll defects</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all px-6 py-2 rounded-xl text-sm font-semibold border border-white/20"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-white ">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option>All</option>
                <option>Pass Roll</option>
                <option>Fail Roll</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Job Number</label>
              <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                {jobOptions.map(j => <option key={j} value={j === 'All Job No' ? 'All' : j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Inspector</label>
              <select value={empFilter} onChange={e => setEmpFilter(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                {empOptions.map(emp => <option key={emp} value={emp === 'All Employees' ? 'All' : emp}>{emp}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Roll Search</label>
              <input type="text" placeholder="Roll #" value={searchRoll} onChange={e => setSearchRoll(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
              <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Color</label>
              <select value={colorFilter} onChange={e => setColorFilter(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                {colorOptions.map(c => <option key={c} value={c === 'All Colours' ? 'All' : c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-auto max-h-[63.7vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b">Roll / Job</th>
                <th className="px-6 py-4 border-b">Inspector</th>
                <th className="px-6 py-4 border-b">Specifications</th>
                <th className="px-6 py-4 border-b">Defects Found</th>
                <th className="px-6 py-4 border-b">Remarks</th>
                <th className="px-6 py-4 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400 animate-pulse">No inspection records found for this criteria.</td>
                </tr>
              ) : (
                filteredRows.map((row, i) => {
                  const isFail = row.status === 'Fail Roll';
                  return (
                    <tr key={i} className={`transition-colors ${isFail ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-3">
                        <div className={`font-bold ${isFail ? 'text-red-700' : 'text-slate-900'}`}>{row.roll_no}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{row.job_no}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200">
                          {row.emp_id}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-medium text-slate-700">Dia: {row.dia} | GSM: {row.gsm}</div>
                        <div className="text-[11px] text-slate-400 italic">Loop: {row.loop_length}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                          {MISTAKE_KEYS.filter(k => row.mistakes?.[k] && row.mistakes[k] !== '0').length > 0 ? (
                            MISTAKE_KEYS.filter(k => row.mistakes?.[k] && row.mistakes[k] !== '0').map(k => (
                              <span key={k} className="bg-white text-red-600 border border-red-200 shadow-sm px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                {k.replace('_', ' ')}: {row.mistakes[k]}
                              </span>
                            ))
                          ) : (
                            <span className="text-green-500 text-[11px] font-medium">Clear / No Defects</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm text-slate-600 leading-relaxed italic">
                          {row.remarks || "—"}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{row.time}</div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          !isFail 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-600 text-white'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-slate-400 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>TOTAL ROLLS: {filteredRows.length}</span>
            <span className="text-red-400">FAILED: {filteredRows.filter(r => r.status === 'Fail Roll').length}</span>
            <span className="text-green-400">PASSED: {filteredRows.filter(r => r.status === 'Pass Roll').length}</span>
          </div>
          <span className="italic">SYNCED AT: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MachineReport;