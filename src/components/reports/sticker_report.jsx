import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer, Cell, LabelList
} from "recharts";
import {
  Activity, Target, AlertCircle, TrendingUp,
  RefreshCcw, Tag, Users, Download
} from "lucide-react";
// Import PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";


const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'
];



const KpiCard = ({ title, value, icon, color }) => {
  const palette = {
    indigo:  "text-indigo-600 bg-indigo-50",
    red:     "text-red-600 bg-red-50",
    emerald: "text-emerald-600 bg-emerald-50",
    amber:   "text-amber-600 bg-amber-50",
    blue:    "text-blue-600 bg-blue-50",
  };
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg shrink-0 ${palette[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[10px] sm:text-xs font-medium truncate">{title}</p>
        <p className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
};



const Sticker_r = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [jobFilter, setJobFilter] = useState("all"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const getEmpColor = useCallback((empName) => {
    const names = [...new Set(data.map(d => d.empname))];
    const index = names.indexOf(empName);
    return COLORS[index % COLORS.length] || '#cbd5e1';
  }, [data]);

  const handleReset = () => {
    setFilter("today");
    setStartDate("");
    setEndDate("");
    setSelectedEmp(null);
    setJobFilter("all");
    setError(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `https://app.herofashion.com/attendance/stick_report/`;
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      } else {
        url += `?filter=${filter}`;
      }
      const res = await axios.get(url);
      setData(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || `${err.response?.status || ""} ${err.message}`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(id);
  }, [fetchData]);

  const uniqueJobs = useMemo(
    () => [...new Set(data.map(d => d.jobno).filter(Boolean))].sort(),
    [data]
  );

  const handelNavi = () => {
    navigate(-1);
  }

  const jobFiltered = useMemo(
    () => (jobFilter === "all" ? data : data.filter(d => String(d.jobno) === jobFilter)),
    [data, jobFilter]
  );

  const activeData = useMemo(
    () => (selectedEmp ? jobFiltered.filter(d => d.empname === selectedEmp) : jobFiltered),
    [jobFiltered, selectedEmp]
  );

  const kpi = useMemo(() => {
    const totalPlansl  = activeData.reduce((s, d) => s + (d.plansl || 0), 0);
    const totalPc      = activeData.reduce((s, d) => s + (d.pc     || 0), 0);
    const totalSalary  = activeData.reduce((s, d) => s + parseFloat(d.salary || 0), 0);
    const uniqueEmps   = new Set(activeData.map(d => d.empname)).size;
    return { plansl: totalPlansl, pc: totalPc, salary: totalSalary.toFixed(2), emps: uniqueEmps };
  }, [activeData]);

  const tableData = useMemo(() => {
    const map = activeData.reduce((acc, d) => {
      const key = d.empname;
      if (!acc[key]) {
        acc[key] = {
          empname: d.empname,
          empid:   d.empid,
          jobno:   d.jobno,
          plansl:  d.plansl  || 0,
          pc:      d.pc      || 0,
          salary:  parseFloat(d.salary || 0),
        };
      } else {
        acc[key].plansl += d.plansl || 0;
        acc[key].pc     += d.pc     || 0;
        acc[key].salary += parseFloat(d.salary || 0);
      }
      return acc;
    }, {});
    return Object.values(map);
  }, [activeData]);

  // ─── PDF Export Logic ───
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Employee Name", "Employee ID", "Job No", "Plansl", "PC", "Salary (INR)"];
    const tableRows = [];

    tableData.forEach(row => {
      const rowData = [
        row.empname,
        row.empid,
        row.jobno || "N/A",
        row.plansl,
        row.pc,
        `Rs. ${row.salary.toFixed(2)}`
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(16);
    doc.text("Stickering Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }, // Indigo-600
    });

    doc.save(`Sticker_Report_${new Date().getTime()}.pdf`);
  };

  const trendData = useMemo(() => {
    const hourlySlots = ["08:30", "09:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30", "19:30", "20:30"];
    const hourlyMap = hourlySlots.reduce((acc, time) => { acc[time] = { time, plansl: 0 }; return acc; }, {});
    activeData.forEach(d => {
      if (!d.dt) return;
      const dateObj = new Date(d.dt);
      const hour = dateObj.getHours();
      const timeKey = `${hour.toString().padStart(2, '0')}:30`;
      if (hourlyMap[timeKey]) hourlyMap[timeKey].plansl += (d.plansl || 0);
    });
    return Object.values(hourlyMap);
  }, [activeData]);

  const empBarData = useMemo(() => {
    const map = jobFiltered.reduce((acc, d) => {
      if (!acc[d.empname]) acc[d.empname] = { name: d.empname, plansl: 0, pc: 0 };
      acc[d.empname].plansl += d.plansl || 0;
      acc[d.empname].pc     += d.pc     || 0;
      return acc;
    }, {});
    return Object.values(map).sort((a, b) => b.plansl - a.plansl);
  }, [jobFiltered]);

  const formatAMPM = (value) => {
    const [h, m] = value.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-slate-50 min-h-screen font-sans text-slate-900 flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Stickering Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedEmp ? `Filtered: ${selectedEmp}` : `Real-time monitoring`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200 w-full xl:w-auto">
          {["today", "week", "month"].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setStartDate(""); setEndDate(""); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-all flex-1 sm:flex-none text-center
                ${filter === f && !startDate ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
          
          <div className="flex items-center gap-1.5 px-0 sm:px-2 sm:border-l border-slate-200 w-full sm:w-auto mt-1 sm:mt-0">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto" />
          </div>
          
          <div className="flex items-center gap-1 px-0 sm:px-2 sm:border-l border-slate-200 w-full sm:w-auto mt-1 sm:mt-0">
            <Tag size={13} className="text-slate-400 shrink-0" />
            <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 w-full">
              <option value="all">All Jobs</option>
              {uniqueJobs.map(j => <option key={j} value={String(j)}>{j}</option>)}
            </select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0 ml-auto">
            {/* Added PDF Export Button */}
            <button 
              onClick={exportPDF}
              className="p-2 flex-1 sm:flex-none justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <Download size={15} />
              <span>PDF</span>
            </button>

            <button onClick={handleReset} className="p-2 flex-1 sm:flex-none justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors">
              <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
              <span className="inline">Reset</span>
            </button>
            <button onClick={(handelNavi) => navigate(-1)} className="p-2 flex-1 sm:flex-none justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard title="Total Plansl" value={kpi.plansl} icon={<Target size={20}/>} color="indigo" />
        <KpiCard title="Total PC" value={kpi.pc} icon={<Activity size={20}/>} color="emerald" />
        <KpiCard title="Employees" value={kpi.emps} icon={<Users size={20}/>} color="blue" />
        <KpiCard title="Total Salary" value={`₹${kpi.salary}`} icon={<TrendingUp size={20}/>} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Trend Chart */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm md:text-base font-semibold">Hourly Trend</h3>
            {selectedEmp && <button onClick={() => setSelectedEmp(null)} className="text-[10px] md:text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Clear Selection</button>}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPlansl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatAMPM} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip labelFormatter={formatAMPM} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="plansl" stroke={selectedEmp ? getEmpColor(selectedEmp) : "#6366f1"} strokeWidth={3} fillOpacity={1} fill="url(#gradPlansl)">
                <LabelList dataKey="plansl" position="top" style={{ fill: selectedEmp ? getEmpColor(selectedEmp) : '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm md:text-base font-semibold mb-1">Plansl by Employee</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={empBarData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} interval={0}  textAnchor="end" height={60} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="plansl" radius={[4, 4, 0, 0]} barSize={26} onClick={(d) => setSelectedEmp(d.name)} cursor="pointer">
                {empBarData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={getEmpColor(entry.name)} opacity={selectedEmp && selectedEmp !== entry.name ? 0.25 : 1} />
                ))}
                <LabelList dataKey="plansl" position="top" style={{ fill: '#64748b', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-auto max-h-[420px] relative">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Employee</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Job No</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Plansl</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">PC</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tableData.map((row, i) => (
                <tr key={i} className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedEmp === row.empname ? "bg-indigo-50/50" : ""}`} onClick={() => setSelectedEmp(row.empname)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: getEmpColor(row.empname) }}></div>
                      <div>
                        <div className="font-semibold text-slate-700">{row.empname}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400">ID: {row.empid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium whitespace-nowrap">{row.jobno || "—"}</td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-600 whitespace-nowrap">{row.plansl}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-600 whitespace-nowrap">{row.pc}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 whitespace-nowrap">₹{row.salary.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sticker_r;