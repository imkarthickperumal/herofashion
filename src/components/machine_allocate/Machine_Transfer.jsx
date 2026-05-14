import React, { useEffect, useState } from "react";
import { api } from "../../auth/auth";
import { motion, AnimatePresence } from "framer-motion";

// Modal for editing / creating new allocation
function MachineEditPopup({ allocation, onClose, onSaved }) {
  const [units, setUnits] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(allocation.unit || "");
  const [selectedLine, setSelectedLine] = useState(allocation.line || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editAlloc, setEditAlloc] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get("/qcapp/api/units/");
        setUnits(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!selectedUnit) return setLines([]);
    const fetchLines = async () => {
      try {
        const res = await api.get(`/qcapp/api/lines/?unit=${selectedUnit}`);
        setLines(res.data);
        if (!res.data.find((l) => l.id === selectedLine)) {
          setSelectedLine("");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLines();
  }, [selectedUnit]);

  const handleSave = async () => {
  if (!selectedUnit || !selectedLine) {
    setError("Select unit and line");
    return;
  }

  setLoading(true);
  setError("");
  setMessage("");

  try {
    await api.post("/qcapp/api/machine-transfer/", {
      machine_id: allocation.machine_id,
      unit: selectedUnit,
      line: selectedLine,
    });

    setMessage("✅ Transfer completed successfully");

    setTimeout(() => {
      onSaved();
      onClose();
    }, 1000);

  } catch (err) {
    if (err.response && err.response.data) {
      const data = err.response.data;

      if (data.non_field_errors) {
        setError(data.non_field_errors.join(", "));
      } else {
        setError(Object.values(data).flat().join(", "));
      }
    } else {
      setError("❌ Failed to save allocation");
    }
  } finally {
    setLoading(false);
  }
};

<AnimatePresence>
  {editAlloc && (
    <MachineEditPopup
      allocation={editAlloc}
      onClose={() => setEditAlloc(null)}
      onSaved={fetchData}
    />
  )}
</AnimatePresence>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Machine Transfer</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Machine ID</label>
              <input 
                type="text" 
                value={allocation.machine} 
                readOnly 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line</label>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Line</option>
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>{l.line_number}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MachineAllocation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editAlloc, setEditAlloc] = useState(null);
  
  // 🔹 Step 1: Add Search State
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/qcapp/api/machine-transfer/");
      setData(res.data);
    } catch (err) {
      alert("Failed to load allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Step 2: Filter Logic (Global Search)
  const filteredData = data.filter((alloc) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      alloc.machine?.toLowerCase().includes(searchStr) ||
      alloc.unit_name?.toLowerCase().includes(searchStr) ||
      alloc.line_number?.toString().toLowerCase().includes(searchStr) ||
      alloc.id?.toString().includes(searchStr)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/qcapp/api/machine-transfer/${id}/`);
      fetchData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-extrabold text-gray-800">Machine Transfer</h2>
          
          {/* 🔹 Step 3: Search Input UI */}
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search machine, unit, or line..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </span>
            </div>
            <button 
              onClick={fetchData} 
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b">Machine</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b">Unit</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b">Line</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b">Allocated At</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                   <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading data...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400">No matching allocations found.</td></tr>
                ) : (
                  // 🔹 Step 4: Map Filtered Data instead of original data
                  filteredData.map((alloc) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={alloc.id} 
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{alloc.machine}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                          {alloc.unit_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alloc.line_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic">
                        {new Date(alloc.allocated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button 
                          onClick={() => setEditAlloc(alloc)}
                          className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all text-sm font-medium"
                        >
                          Transfer
                        </button>
                        <button 
                          onClick={() => handleDelete(alloc.id)}
                          className="px-3 py-1 text-red-500 hover:bg-red-50 rounded transition-all text-sm font-medium hidden"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            {/* ✅ IMPORTANT FIX: POPUP RENDER */}
      <AnimatePresence>
        {editAlloc && (
          <MachineEditPopup
            allocation={editAlloc}
            onClose={() => setEditAlloc(null)}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>
          </div>
        </div>
      </div>
      {/* ... Popup Logic remains same ... */}
    </div>
  );
}

export default MachineAllocation;