import React from 'react';
import { useNavigate } from 'react-router-dom';


const Home_1 = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Bit Report', path: '/cutting-report/bit_report', icon: '📊', color: 'bg-blue-500' },
    { title: 'Sticker Report', path: '/cutting-report/sticker_report', icon: '🏷️', color: 'bg-green-500' },
    { title: 'Lay Management', path: '/cutting-report/lay', icon: '📏', color: 'bg-purple-500' },
    { title: 'Roll Overview', path: '/cutting-report/roll', icon: '🧵', color: 'bg-orange-500' },
    { title: 'Mistake Summary', path: '/cutting-report/mistake_summary', icon: '🚨', color: 'bg-gray-200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Production Dashboard</h1>
        <p className="text-gray-600 mt-2">Select a module to manage your reports and inventory.</p>
      </header>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 text-white shadow-inner`}>
              {item.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Click to view and edit the {item.title.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>

      {/* Footer / Status Section */}
      <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-gray-400 text-sm">
        System Online • {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

export default Home_1;