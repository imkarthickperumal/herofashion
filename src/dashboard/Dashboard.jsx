import { useEffect, useState, useContext } from "react";
import { UserContext } from "../UserContext";

function Dashboard() {
  const [visible, setVisible] = useState(false);
  const { username } = useContext(UserContext);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-cyan-700 via-gray-600 to-cyan-500 overflow-hidden relative">
      
      {/* Animated Background Blur Circles */}
      <div className="absolute w-72 h-72 bg-white/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-pink-300/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Glass Card */}
      <div
        className={`backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 text-center transform transition-all duration-700 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-10"
        }`}
      >
        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wide">
          Welcome 👋
        </h1>

        {/* Username */}
        <h2 className="mt-3 text-xl md:text-3xl font-semibold text-yellow-300">
          {username}
        </h2>

        
        {/* Animated Line */}
        <div className="mt-6 h-1 w-0 bg-yellow-300 mx-auto rounded-full animate-[grow_1s_ease_forwards]"></div>
      </div>

      {/* Custom Animation */}
      <style>
        {`
          @keyframes grow {
            from { width: 0 }
            to { width: 80px }
          }
        `}
      </style>
    </div>
  );
}

export default Dashboard;