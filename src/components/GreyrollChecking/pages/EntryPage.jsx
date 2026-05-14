import React from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundImage from '../assets/RollCHecking.jpg'; 
import { FaClipboardList } from 'react-icons/fa'; 

export default function EntryPage() {
  const navigate = useNavigate();
  const handleReport = () => navigate(`/grey-app/report`);
  return (
    <div 
      className='relative flex flex-col text-center h-screen justify-center items-center p-4' // Added p-4 here for edge padding
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='absolute inset-0 bg-black opacity-60'></div>

      <div className='relative z-10 flex flex-col items-center gap-8 md:gap-12 w-full'> {/* Adjusted vertical gap */}
        
        {/* Responsive Title Scaling */}
        <span className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-sans text-white font-bold max-w-4xl leading-tight">
          Roll Checking <br/> Ready To Allocate
        </span>
 
        {/* Responsive Button Group */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center w-full max-w-sm sm:max-w-none">
            
            {/* Machine 1 Button */}
            <a 
              href="#/grey-app/machine/1A"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white w-full sm:w-auto px-8 py-4 rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-xl inline-block text-center"
              style={{ textDecoration: "none" }}
            >
              <span className="text-lg md:text-2xl">Machine 1A</span>
            </a>

            <a 
              href="#/grey-app/machine/1B"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white w-full sm:w-auto px-8 py-4 rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-xl inline-block text-center"
              style={{ textDecoration: "none" }}
            >
              <span className="text-lg md:text-2xl">Machine 1B</span>
            </a>
            
            {/* Machine 2 Button */}
            <a 
              href="#/grey-app/machine/2A"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white w-full sm:w-auto px-8 py-4 rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-xl inline-block text-center"
              style={{ textDecoration: "none" }}
            >
              <span className="text-lg md:text-2xl">Machine 2A</span>
            </a>
            <a 
              href="#/grey-app/machine/2B"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white w-full sm:w-auto px-8 py-4 rounded font-semibold hover:bg-blue-700 transition duration-300 shadow-xl inline-block text-center"
              style={{ textDecoration: "none" }}
            >
              <span className="text-lg md:text-2xl">Machine 2B</span>
            </a>
        </div>

        <button
         onClick={handleReport}
         className="flex items-center px-6 py-2 
         text-white font-medium rounded-full shadow-lg 
         transition duration-150 transform hover:scale-[1.05]"
        >
         <FaClipboardList className="h-5 w-5 mr-2" />
         Report
         </button>
      </div>
    </div>
  )
}