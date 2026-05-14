// import Sidebar from "./Sidebar/Sidebar";

// export default function ProtectedLayout({ children }) {
//   return (
//     <div className="flex h-screen">
//       <Sidebar /> {/* Always visible */}
      
//       {/* Content area scrolls independently */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Optional: If you have a top navbar */}
//         {/* <Navbar /> */}

//         {/* Scrollable main content */}
//         <div className="flex-1 overflow-y-auto p-0">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { UserContext } from "./UserContext";
import Sidebar from "./Sidebar/Sidebar";

export default function ProtectedLayout({ children }) {
  const [username, setUsername] = useState(""); // initially empty
   const [userId, setUserId] = useState("");
   const [role, setRole] = useState(null);

  return (
    <UserContext.Provider value={{ username, setUsername, userId, setUserId, role, setRole }}>
      <div className="flex h-screen">
        <Sidebar /> {/* Sidebar will fetch and update username */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-0">{children}</div>
        </div>
      </div>
    </UserContext.Provider>
  );
}