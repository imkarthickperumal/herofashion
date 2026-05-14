import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FabricForm() {

  const [fabrics, setFabrics] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    alias: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      const master = await axios.get("https://app.herofashion.com/fablist/");
      const alias = await axios.get("https://app.herofashion.com/fabaligs/");

      const masterData = master.data;
      const aliasData = alias.data;

      const aliasIds = aliasData.map(a => a.id);


      const filtered = masterData.filter(f =>
        f.isactive === 1 && !aliasIds.includes(f.id)
      );

      setFabrics(filtered);

    } catch (error) {
      console.error(error);
    }
  };

  const handleIdChange = (e) => {

    const id = e.target.value;

    const fabric = fabrics.find(f => f.id == id);

    if (fabric) {
      setFormData({
        ...formData,
        id: fabric.id,
        name: fabric.name
      });
    }
  };

  const handleAliasChange = (e) => {
    setFormData({
      ...formData,
      alias: e.target.value
    });
  };

  const handleUpdate = async () => {

    try {

      await axios.post(
        "https://app.herofashion.com/fabaligs/",
        formData
      );

      alert("Alias Saved");

      loadData(); // refresh list

      setFormData({
        id: "",
        name: "",
        alias: ""
      });

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">

        <h2 className="text-xl font-semibold mb-6">
          Fabric Alias Update
        </h2>

        {/* Fabric ID */}
        <div className="mb-4">

          <label className="block text-sm mb-1">
            Fabric ID
          </label>

          <select
            value={formData.id}
            onChange={handleIdChange}
            className="w-full border rounded-md px-3 py-2"
          >

            <option value="">Fabric ID</option>

            {fabrics.map(f => (
              <option key={f.id} value={f.id}>
                {f.id}
              </option>
            ))}

          </select>

        </div>

        {/* Fabric Name */}
        <div className="mb-4">

          <label className="block text-sm mb-1">
            Fabric Name
          </label>

          <input
            type="text"
            value={formData.name}
            readOnly
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
          />

        </div>

        {/* Alias */}
        <div className="mb-6">

          <label className="block text-sm mb-1">
            Alias Name
          </label>

          <input
            type="text"
            value={formData.alias}
            onChange={handleAliasChange}
            className="w-full border rounded-md px-3 py-2"
          />

        </div>

        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Save Alias
        </button>

      </div>

    </div>
  );
}