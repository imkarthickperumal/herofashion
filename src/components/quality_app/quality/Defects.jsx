import React, { useState, useEffect, useContext } from "react";
import { api } from "../../../auth/auth";
// import { useParams, useNavigate } from "react-router-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../../UserContext";

export default function DefectTabs() {
  const { unit, line } = useParams();
  const navigate = useNavigate();
  const qc_type = "first_piece";
  const seq = "first_piece";
  const machineId =0
  const location = useLocation(); // ✅ IMPORTANT
  const passedData = location.state; // ✅ data from previous page
  const { userId } = useContext(UserContext);

  // Bundle info fetched from API
  const [bundleData, setBundleData] = useState({});
  const [qcdatas, setQcdatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const [inspectedCount, setInspectedCount] = useState(0);
  const [forceSave, setForceSave] = useState(false);

  const totalPieces = Number(bundleData.total_pieces) || 0;

  useEffect(() => {
    if (passedData) {
      setBundleData({
        bundle_no: passedData.bundleNo,
        bundle_id: passedData.bundle_id,
        jobno: passedData.jobNo,
        product: passedData.product,
        color: passedData.colour,
        size: passedData.size,
        total_pieces: Number(passedData.pieces),
      });
      setInspectedCount(0);
    }
  }, [passedData]);


  // 🔹 Fetch QC data (defects)
  useEffect(() => {
    const fetchQCData = async () => {
      try {
        const res = await api.get("qcapp/qcadmin_mistakes/");
        setQcdatas(res.data);
      } catch (err) {
        console.error("Failed to fetch QC data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQCData();
  }, []);

  // 🔹 Fetch last bundle info
  useEffect(() => {
    const fetchLastBundle = async () => {
      try {
        const res = await api.get(
          `qcapp/get_last_bundle/?unit=${unit}&line=${line}&qc_type=${qc_type}&seq=${seq}`
        );
        const last = res.data;
        if (last) {
          setBundleData(last);
          setInspectedCount(last.checked_pieces || 0);
        }
      } catch (err) {
        console.error("Failed to fetch last bundle:", err);
      }
    };

    fetchLastBundle();
  }, [unit, line]);

  // 🔹 Filtering defects based on active tab
  const [activeTab, setActiveTab] = useState("minor");
  const getFilteredData = () => {
    return qcdatas.filter((item) => {
      if (activeTab === "minor") return item.category === "Minor Defects";
      if (activeTab === "major") return item.category === "Major Defects";
      if (activeTab === "critical") return item.category === "Critical Defects";
      return false;
    });
  };

  const getCategoryCount = (categoryName) => {
    return qcdatas
      .filter((item) => item.category === categoryName)
      .reduce((total, item) => total + (counts[item.id] || 0), 0);
  };

  const handleIncrement = (id) =>
    setCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const handleDecrement = (id) =>
    setCounts((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));

  const totalMistakes = Object.values(counts).reduce((a, b) => a + b, 0);
  const mistakePercent =
    totalPieces > 0 ? ((totalMistakes / totalPieces) * 100).toFixed(1) : 0;

  // 🔹 Save a piece
  const handleSavePiece = async () => {
    if (inspectedCount >= totalPieces) return;
    if (!userId) return alert("User not logged in! Cannot save piece.");

    const defectsArray =
      Object.entries(counts).map(([id, count]) => {
        const defect = qcdatas.find((item) => item.id === Number(id));
        return {
          mistake_name: defect.name,
          mistake_count: count,
          category: defect.category,
        };
      }) || [];

    if (defectsArray.length === 0) {
      defectsArray.push({
        mistake_name: "no_mistake",
        mistake_count: 0,
        category: "no_mistake",
      });
    }

    const payload = {
      bundle_no: bundleData.bundle_no,
      bundle_id: bundleData.bundle_id,
      jobno: bundleData.jobno,
      product: bundleData.product,
      color: bundleData.color,
      size: bundleData.size,
      unit,
      line,
      qc_type,
      total_pieces: totalPieces,
      piece_no: inspectedCount + 1,
      total_mistake: totalMistakes,
      mistake_percentage: mistakePercent,
      defects: defectsArray,
      userId,
      seq:seq,
      machineId:machineId
    };

    try {
      await api.post("qcapp/save_piece/", payload);
      alert(`Piece ${inspectedCount + 1} saved ✅`);
      setInspectedCount((prev) => prev + 1);
      setCounts({});
    } catch (err) {
      console.error(err);
      alert("Failed to save piece ❌");
    }
  };

  // 🔹 Final submit
  const handleFinalSubmit = async () => {
    try {
      await api.post("qcapp/save_final_piece/", {
        bundle_no: bundleData.bundle_no,
        bundle_id: bundleData.bundle_id,
        jobno: bundleData.jobno,
        product: bundleData.product,
        color: bundleData.color,
        size: bundleData.size,
        unit,
        line,
        machineId,
        qc_type,
        total_pieces: totalPieces,
        checked_piece: inspectedCount,
        force_save: forceSave,
        userId,
        seq:"first_piece"
      });

      alert("Saved Successfully ✅");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Save failed ❌");
    }
  };
console.log("Bundle Data:", bundleData);
console.log("Total Pieces:", totalPieces);
  const tabs = [
    { id: "minor", label: "Minor" },
    { id: "major", label: "Major" },
    { id: "critical", label: "Critical" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center mt-12 sm:mt-12 md:mt-4 lg:mt-0">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Defect Tracking</h1>
            <p className="text-gray-400">Record quality issues</p>
          </div>
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={forceSave}
                onChange={(e) => setForceSave(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-md font-medium text-green-500">Force Save</span>
            </label>
          </div>
          <p className="text-blue-600 font-bold">
            Unit - {unit} / Line - {line}
          </p>
          {/* <p>{jobno}</p> */}
          <p className="text-sm text-gray-500">User ID: {userId}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Garments Inspected</p>
            <p className="text-2xl font-bold text-slate-800">
              {inspectedCount}/{totalPieces}
            </p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Mistakes Found</p>
            <p className="text-2xl font-bold text-red-500">{totalMistakes}</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Mistake %</p>
            <p className="text-2xl font-bold text-yellow-500">{mistakePercent}%</p>
          </div>
        </div>

        {/* Save Piece */}
        <button
          onClick={handleSavePiece}
          disabled={inspectedCount >= totalPieces}
          className={`w-full py-3 rounded-xl font-bold text-lg mb-6 transition ${
            inspectedCount >= totalPieces
              ? "bg-gray-300 text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Save Piece ({inspectedCount + 1})
        </button>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-2 rounded-xl mb-6 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg font-semibold ${
                activeTab === tab.id
                  ? tab.id === "minor"
                    ? "bg-green-500 text-white"
                    : tab.id === "major"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
                  : "text-gray-500"
              }`}
            >
              {tab.label} ({getCategoryCount(tab.label + " Defects")})
            </button>
          ))}
        </div>

        {/* Defect List */}
        <div className="grid gap-4 md:grid-cols-2 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            <p>Loading...</p>
          ) : (
            getFilteredData().map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-4 border rounded-xl hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://hfapi.herofashion.com${item.image}`}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <p className="font-semibold text-gray-700">{item.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    className="px-3 py-1 bg-red-200 rounded-lg hover:bg-red-300"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold">{counts[item.id] || 0}</span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    className="px-3 py-1 bg-green-200 rounded-lg hover:bg-green-300"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Final Submit */}
        <button
          onClick={handleFinalSubmit}
          disabled={!(inspectedCount === totalPieces || forceSave)}
          className={`w-full mt-6 py-4 rounded-xl text-lg font-bold transition ${
            inspectedCount === totalPieces || forceSave
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Complete & Save Record
        </button>
      </div>
    </div>
  );
}