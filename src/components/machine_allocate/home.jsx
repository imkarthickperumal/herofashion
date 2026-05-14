import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Machine Allocation ",
      desc: "Unit&Line",
      icon: "fa-industry",
      color: "indigo",
      path: "unit_allocation",
    },
    {
      title: "Employee Allocation",
      desc: "Unit&Line",
      icon: "fa-gears",
      color: "blue",
      path: "machine_allocation",
    },
    
    // {
    //   title: "Employee Allocation",
    //   desc: "Manage operator and helper assignments",
    //   icon: "fa-users-gear",
    //   color: "teal",
    //   path: "/employee-allocation",
    // }
    
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="w-full max-w-6xl mb-10 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          Allocation Control Center
        </h1>
        <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
          Select a category to manage resources
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {cards.map((card, index) => (
          <div 
            key={index}
            onClick={() => navigate(card.path)}
            className="group relative bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer active:scale-95 flex flex-col h-full"
          >
            {/* Icon Box */}
            <div className={`h-12 w-12 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 
              ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                card.color === 'teal' ? 'bg-teal-50 text-teal-600' : 
                'bg-indigo-50 text-indigo-600'}`}>
              <i className={`fa-solid ${card.icon} text-xl`}></i>
            </div>

            {/* Content */}
            <div className="flex-grow">
              <h3 className="text-lg font-extrabold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-500 font-medium">
                {card.desc}
              </p>
            </div>

            {/* Footer / Action */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                Manage Details
              </span>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
        Quality Control Management System v2.0
      </div>
    </div>
  );
}