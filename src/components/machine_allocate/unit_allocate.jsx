import React, { useState, useEffect } from "react";
import { api } from "../../auth/auth";

function Unit_Allocate() {
  const [machines, setMachines] = useState([]);
  const [units, setUnits] = useState([]);
  const [lines, setLines] = useState([]);

  const [selectedMachines, setSelectedMachines] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedLine, setSelectedLine] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  // Fetch machines and units
  useEffect(() => {
    api
      .get("/qcapp/api/machines/")
      .then((res) => setMachines(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));

    api
      .get("/qcapp/api/units/")
      .then((res) => setUnits(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch lines when unit changes
  useEffect(() => {
    if (selectedUnit) {
      api
        .get(`/qcapp/api/lines/?unit=${selectedUnit}`)
        .then((res) => setLines(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error(err));
    } else {
      setLines([]);
      setSelectedLine("");
    }
  }, [selectedUnit]);

  const toggleMachine = (id) => {
    setSelectedMachines((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedMachines.length || !selectedUnit || !selectedLine) {
    setMessage("❌ Please select machine(s), unit, and line");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const payload = {
      machine_id: selectedMachines,  // ✅ send machine_id
      unit: selectedUnit,
      line: selectedLine,
    };

    await api.post("/qcapp/api/allocations/", payload);

    setMessage("✅ Machines allocated successfully!");
    setSelectedMachines([]);
    setSelectedUnit("");
    setSelectedLine("");
    setSearch("");

    // Refetch unallocated machines
    const res = await api.get("/qcapp/api/machines/");
    setMachines(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(err);
    setMessage("❌ Error allocating machines");
  } finally {
    setLoading(false);
  }
};

  const filteredMachines = machines.filter((m) =>
    m.Identity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Machine Allocation</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-6 animate-fade-in"
      >
        {/* Search */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Search Machines</label>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          />
        </div>

        {/* Machines */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Machines</label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
            {filteredMachines.length ? (
              filteredMachines.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200
                  ${
                    selectedMachines.includes(m.id)
                      ? "bg-blue-100 hover:bg-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleMachine(m.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedMachines.includes(m.id)}
                    onChange={() => toggleMachine(m.id)}
                    className="mr-2"
                  />
                  <span>{m.Identity}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No machines found.</p>
            )}
          </div>
        </div>

        {/* Unit */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Unit</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          >
            <option value="">Select Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Line */}
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Line</label>
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="border rounded-md p-2 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          >
            <option value="">Select Line</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.line_number}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300
            ${loading ? "opacity-50 cursor-not-allowed animate-pulse" : "animate-bounce"}`}
          >
            {loading ? "Allocating..." : "Allocate Machines"}
          </button>

          {message && (
            <p className="mt-4 sm:mt-0 text-sm font-medium text-gray-700">{message}</p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Unit_Allocate;