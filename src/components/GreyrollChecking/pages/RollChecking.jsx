import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Save,
  Plus,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

// Import images
import oil from "../assets/Oil.jpg";
import setoff from "../assets/Set Off2.jpg";
// import patches from "../assets/Patches.jpg";
import yarn from "../assets/Yarn Mistake.jpg";
import hole from "../assets/Hole.jpg";
// import gsm from "../assets/GSM Hole.jpg";
// import compact from "../assets/Compact Kadi.jpg";
import needleImg from "../assets/Needle Line.jpg";
// import stain from "../assets/Stain.jpg";
// import roll from "../assets/Roll Joint.jpg";

const QualityInspectionFullScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { rollData, r_code, h_code } = location.state || {};
  const rollNumber = rollData?.rlno || "";

  const defectTypes = [
    { id: 1, name: "OIL", hindi: "तेल", tamil: "ஆயில்", img: oil },
    { id: 2, name: "HOLES", hindi: "छेद", tamil: "ஹோல்ஸ்", img: hole },
    { id: 3, name: "SET OFF", hindi: "सेट ऑफ", tamil: "செட் ஆப்", img: setoff },
    { id: 4, name: "NEEDLE LINE", hindi: "सुई रेखा", tamil: "நீடில் லைன்", img: needleImg },
    { id: 5, name: "YARN MISTAKE", hindi: "यार्न मिस्टैक", tamil: "யான் மிஸ்டேக்", img: yarn },
    { id: 6, name: "POOVARI", hindi: "पूवारी", tamil: "பூவாரி", img: null },
    { id: 7, name: "LYCRA CUT", hindi: "लाइक्रा कट", tamil: "லைக்ரா வெட்டு", img: null },
    { id: 8, name: "NEPS", hindi: "नेप्स", tamil: "நேப்ஸ்", img: null },
    { id: 9, name: "NA HOLES", hindi: "ना होल", tamil: "நா ஹோல்", img: null },
  ];

  const POPUP_DEFECTS = ["OIL", "HOLES", "POOVARI", "LYCRA CUT", "NEPS", "NA HOLES"];
  const DECREASE_POPUP_DEFECTS = ["SET OFF", "YARN MISTAKE"];

  const [defectData, setDefectData] = useState(defectTypes.map(() => ({ count: 0, meter: "", display: "" })));
  const [time, setTime] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeDefectIndex, setActiveDefectIndex] = useState(null);
  const [showDecreasePopup, setShowDecreasePopup] = useState(false);
  const [activeDecreaseIndex, setActiveDecreaseIndex] = useState(null);
  const [showNeedlePopup, setShowNeedlePopup] = useState(false);
  const [needleMeterValue, setNeedleMeterValue] = useState("");
  const [capturedImage, setCapturedImage] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);

  const cameraInputRef = useRef(null);
  const timerStartRef = useRef(null);
  const payloadRef = useRef(null);
  const hasCheckedInitialRef = useRef(false);

  // Logic remains identical to your original code
  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${ss}`;
  };

  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const defectFieldMap = {
    "OIL": "oil_line",
    "HOLES": "hole",
    "SET OFF": "setoff",
    "NEEDLE LINE": "needle_line",
    "POOVARI": "poovari",
    "YARN MISTAKE": "yarn_mistake",
    "LYCRA CUT": "lycra_cut",
    "NEPS": "neps",
    "NA HOLES": "na_holes",
  };

  const getPayload = () => {
    const getVal = (name) => {
      const idx = defectTypes.findIndex((d) => d.name === name);
      return idx !== -1 ? (defectData[idx].display || "") : "";
    };

    return {
      dt: new Date().toISOString().split("T")[0],
      rlno: String(rollNumber),
      hole: getVal("HOLES"),
      setoff: getVal("SET OFF"),
      needle_line: getVal("NEEDLE LINE"),
      oil_line: getVal("OIL"),
      oil_drops: "",
      remark: String(remarks || ""),
      poovari: getVal("POOVARI"),
      yarn_mistake: getVal("YARN MISTAKE"),
      lycra_cut: getVal("LYCRA CUT"),
      yarn_uneven: "",
      neps: getVal("NEPS"),
      timer: formatTime(time),
      dia: String(safeNumber(rollData?.dia)),
      na_holes: getVal("NA HOLES"),
      empid: r_code,
      mach_id: id,
      m12: "",
      loop_len: String(safeNumber(rollData?.ll)),
      image: capturedImage || "",
      submit: isSubmitted,
    };
  };

  useEffect(() => {
    if (!rollNumber || hasCheckedInitialRef.current) return;
    const postOnce = async () => {
        const baseUrl = `https://app.herofashion.com/coraroll/`;
        const detailUrl = `${baseUrl}${rollNumber}/`;
        const checkRes = await fetch(detailUrl);
        if (checkRes.ok) {
            hasCheckedInitialRef.current = true;
            return;
        }
        await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getPayload()),
        });
        hasCheckedInitialRef.current = true;
    };
    postOnce();
  }, [rollNumber]);

  useEffect(() => {
    payloadRef.current = getPayload();
  }, [defectData, remarks, time, rollNumber, capturedImage]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (rollNumber && payloadRef.current) {
        fetch(`https://app.herofashion.com/coraroll/${rollNumber}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadRef.current),
        }).catch((err) => console.error("Auto-sync error:", err));
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [rollNumber]);

  useEffect(() => {
    if (rollNumber) fetchRollData();
  }, [rollNumber]);

  //GET
    const fetchRollData = async () => {
        try {
          const res = await fetch(`https://app.herofashion.com/coraroll/${rollNumber}/`);
          if (!res.ok) return;
          const data = await res.json();
      
          setCapturedImage(data.image || "");
          setRemarks(data.remark || "");
      
          setDefectData(defectTypes.map((defect) => {
            const value = data[defectFieldMap[defect.name]] || "";
            let count = 0, meter = "";
            if (value) {
              const cMatch = value.match(/C-(\d+)/);
              const mMatch = value.match(/M-(\d+)/);
              if (cMatch) count = Number(cMatch[1]);
              if (mMatch) meter = mMatch[1];
            }
            return { count, meter, display: value };
          }));
      
          if (data.timer) {
            const parts = data.timer.split(":").map(Number);
            const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            setTime(seconds);
            timerStartRef.current = Date.now() - seconds * 1000;
          }
        } catch (err) {
        console.error("GET error:", err);
        }
    };

  useEffect(() => {
    timerStartRef.current = Date.now() - (time * 1000);
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const updateDefect = (index, deltaCount = 0, newMeter = null) => {
    setDefectData((prev) => {
      const data = [...prev];
      const item = { ...data[index] };
      const defectName = defectTypes[index].name;
      const updatedCount = item.count + deltaCount;
      item.count = updatedCount < 0 ? 0 : updatedCount;
      if (newMeter !== null) item.meter = String(newMeter);
      const parts = [];
      if (defectName !== "NEEDLE LINE" && item.count > 0) parts.push(`C-${item.count}`);
      if (item.meter && item.meter !== "" && item.meter !== "0") parts.push(`M-${item.meter}`);
      item.display = parts.join(" ").toUpperCase();
      data[index] = item;
      return data;
    });
    setShowModal(false);
  };

  const handlePlusClick = (index, name) => {
    if (name === "NEEDLE LINE") {
      setActiveDefectIndex(index);
      setNeedleMeterValue(defectData[index].meter);
      setShowNeedlePopup(true);
    } else if (POPUP_DEFECTS.includes(name)) {
      setActiveDefectIndex(index);
      setShowModal(true);
    } else {
      updateDefect(index, 1);
    }
  };

  const handleMinusClick = (index, name) => {
    if (name === "NEEDLE LINE") {
      setActiveDefectIndex(index);
      setNeedleMeterValue(defectData[index].meter);
      setShowNeedlePopup(true);
    } else if (DECREASE_POPUP_DEFECTS.includes(name)) {
      setActiveDecreaseIndex(index);
      setShowDecreasePopup(true);
    } else if (POPUP_DEFECTS.includes(name)) {
      setActiveDefectIndex(index);
      setShowModal(true);
    } else {
      updateDefect(index, -1);
    }
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);
    formData.append("rlno", rollNumber);
    const res = await fetch("https://app.herofashion.com/upload-roll-image/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setCapturedImage(data.image);
  };

  const HeaderField = ({ label, value }) => (
    <div className="flex flex-col min-w-[100px]">
      <span className="text-[14px] font-bold text-blue-600 mb-0.5">{label}</span>
      <span className="text-[14px] font-medium text-gray-700">{value || "---"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-3 flex flex-col">
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleImageCapture} />

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col flex-grow relative">
        
        {/* Top Section: Info + Right Panel */}
        <div className="flex flex-col lg:flex-row p-3 sm:p-4 border-b border-gray-200 gap-4">
          
          {/* Left: Info Grid + Timer */}
          <div className="flex-grow">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              <HeaderField label="MACHINE ID" value={id} />
              <HeaderField label="ROLL NO" value={rollNumber} />
              <HeaderField label="JOB NO" value={rollData?.jobno} />
              <HeaderField label="COLOR" value={rollData?.colour} />
              <HeaderField label="PONO" value={rollData?.pono} />
              
              <HeaderField label="PDC REF" value={rollData?.pdcref} />
              <HeaderField label="FABRIC" value={rollData?.fabricdescription} />
              <HeaderField label="WEIGHT" value={rollData?.weight} />
              <HeaderField label="DIA" value={rollData?.dia} />
              <HeaderField label="LOOP LENGTH" value={rollData?.ll} />
            </div>

            <div className="flex items-center justify-between sm:justify-start sm:gap-12 mt-4">
              <div className="font-mono text-xl lg:text-2xl font-bold text-gray-800">{formatTime(time)}</div>
              <button
                onClick={() => setShowSubmitPopup(true)}
                disabled={isSubmitted}
                className="flex items-center gap-2 bg-[#e33446] hover:bg-red-700 text-white font-bold px-4 py-2 lg:px-8 lg:py-2.5 rounded-md transition-colors shadow-sm"
              >
                <Save size={18} /> Submit
              </button>
            </div>
          </div>

          {/* Right: Capture/View Controls */}
          <div className="flex flex-row justify-between lg:flex-col w-full lg:w-[180px] lg:border-l lg:pl-4 gap-2 border-t pt-3 lg:border-t-0 lg:pt-0">
            <div className="flex flex-col flex-1 gap-5">
              <button className="w-full sm:w-80 lg:w-41 bg-[#1a73e8] text-white flex items-center justify-center gap-2 py-2 rounded text-xs font-bold shadow-sm" onClick={() => cameraInputRef.current.click()}>
                <Camera size={14} /> Capture
              </button>
              <button className="w-full sm:w-80 lg:w-41 bg-[#1a73e8] text-white flex items-center justify-center gap-2 py-2 rounded text-xs font-bold shadow-sm" onClick={() => setShowImage(!showImage)}>
                <ImageIcon size={14} /> View
              </button>
            </div>
            <div className="w-[150px] lg:w-full h-[100px] lg:h-[120px] border border-gray-300 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 rounded">
              {showImage && (previewImage || capturedImage) ? (
                <img src={previewImage || `https://app.herofashion.com${capturedImage}`} alt="Captured" className="object-contain w-full h-full" />
              ) : "No Image"}
            </div>
          </div>
        </div>

        {/* Defects Grid Section */}
        <div className="flex-1 bg-[#f8f9fa] overflow-x-auto p-2 lg:mt-30">
          <div className="flex gap-2 pb-2">
            {defectTypes.map((defect, index) => (
              <div key={defect.id} className="flex flex-col border border-gray-300 rounded-sm bg-white min-w-[145px] overflow-hidden">
                <div className="bg-[#fdfdfd] text-center py-2 border-b border-gray-200">
                  <div className="text-[15px] font-bold text-gray-800">{defect.name}</div>
                  <div className="text-[15px] font-bold text-gray-500 leading-tight">{defect.tamil}</div>
                  <div className="text-[15px] font-bold text-gray-500 leading-tight">{defect.hindi}</div>
                </div>
                
                <div className="h-[110px] flex items-center justify-center p-2 bg-white">
                  {defect.img ? (
                    <img src={defect.img} alt={defect.name} className="w-full h-full object-cover rounded-sm p-0.5" />
                  ) : (
                    <span className="text-gray-400 text-[11px]">No Image</span>
                  )}
                </div>

                <div className="px-2 py-2 border-t border-gray-100 bg-white">
                  <input
                    type="text" readOnly value={defectData[index].display}
                    className="text-center text-[14px] font-bold border border-gray-200 rounded-sm w-full py-1 bg-white outline-none"
                  />
                </div>

                <div className="flex flex-col mt-auto">
                  <button onClick={() => handlePlusClick(index, defect.name)} className="bg-[#1b8e56] text-white py-2.5 flex justify-center hover:bg-green-700 active:bg-green-800">
                    <Plus size={20} strokeWidth={3} />
                  </button>
                  <button onClick={() => handleMinusClick(index, defect.name)} className="bg-[#d93025] text-white py-2.5 flex justify-center hover:bg-red-700 active:bg-red-800">
                    <Minus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Remarks */}
        <div className="bg-white p-3 border-t border-gray-200">
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-gray-700 mb-1">Remarks:</span>
            <input
              type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add notes..."
              className="border border-gray-300 rounded-sm w-full px-3 py-2 text-[13px] outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <CountMeterModal
          initialData={defectData[activeDefectIndex]}
          onClose={() => setShowModal(false)}
          onSave={(c, m) =>
            updateDefect(activeDefectIndex, c - defectData[activeDefectIndex].count, m)
          }
        />
      )}
      {showDecreasePopup && (
        <ConfirmDecreaseModal
          onConfirm={() => {
            updateDefect(activeDecreaseIndex, -1);
            setShowDecreasePopup(false);
          }}
          onCancel={() => setShowDecreasePopup(false)}
        />
      )}
      {showNeedlePopup && (
        <NeedleMeterPopup
          value={needleMeterValue}
          setValue={setNeedleMeterValue}
          onSave={() => {
            updateDefect(activeDefectIndex, 0, needleMeterValue);
            setNeedleMeterValue(""); 
            setShowNeedlePopup(false);
          }}
          onClose={() => setShowNeedlePopup(false)}
        />
      )}
      {showSubmitPopup && (
        <SubmitConfirmModal
          onCancel={() => setShowSubmitPopup(false)}
          onConfirm={async () => {
            setIsSubmitted(true);
            const final = { ...getPayload(), submit: true };
            await fetch(`https://app.herofashion.com/coraroll/${rollNumber}/`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(final),
            });
            navigate(-1);
          }}
        />
      )}
    </div>
  );
};

/* --- Sub-components remain unchanged from your logic --- */
const CountMeterModal = ({ initialData, onClose, onSave }) => {
    const [count, setCount] = useState(initialData.count || 0);
    const [meter, setMeter] = useState(initialData.meter || "");
    const adjustCount = (val) => setCount((prev) => Math.max(0, prev + val));
  const adjustMeter = (val) =>
    setMeter((prev) => {
      const next = (Number(prev) || 0) + val;
      return next >= 0 ? String(next) : "";
    });

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[3000]">
        <div className="bg-white p-5 rounded shadow w-[360px]">
          <h5 className="text-center font-bold border-b pb-2 mb-4 text-gray-700">Update Defect Details</h5>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Defect Count:</label>
            <div className="flex items-center">
              <button onClick={() => adjustCount(-1)} className="bg-red-500 text-white px-4 py-1.5 rounded-l">-</button>
              <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full text-center font-bold py-1" />
              <button onClick={() => adjustCount(1)} className="bg-green-500 text-white px-4 py-1.5 rounded-r">+</button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Meter Point:</label>
            <div className="flex items-center">
              <button onClick={() => adjustMeter(-1)} className="bg-red-500 text-white px-4 py-1.5 rounded-l">-</button>
              <input type="number" value={meter} onChange={(e) => setMeter(e.target.value)} className="w-full text-center font-bold py-1" />
              <button onClick={() => adjustMeter(1)} className="bg-green-500 text-white px-4 py-1.5 rounded-r">+</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="w-1/2 border rounded py-1 hover:bg-gray-100">Cancel</button>
            <button onClick={() => onSave(count, meter)} className="w-1/2 bg-blue-600 text-white rounded py-1 hover:bg-blue-700">Apply</button>
          </div>
        </div>
      </div>
    );
};

const NeedleMeterPopup = ({ value, setValue, onSave, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[3000]">
      <div className="bg-white p-5 rounded shadow w-[320px]">
        <h6 className="font-bold mb-3 text-sm">Needle Line Meter Position:</h6>
        <input className="w-full border rounded text-center py-1 font-semibold text-lg mb-4" type="number" value={value} autoFocus onChange={(e) => setValue(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded py-1 hover:bg-gray-100">Cancel</button>
          <button onClick={onSave} className="flex-1 bg-blue-600 text-white rounded py-1 hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
);

const ConfirmDecreaseModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[3000]">
      <div className="bg-white p-5 rounded shadow text-center w-[320px]">
        <AlertTriangle className="text-yellow-500 mx-auto mb-2" size={40} />
        <h5 className="font-bold text-gray-800">Confirm Decrease</h5>
        <p className="text-xs text-gray-500">Are you sure you want to reduce the defect count?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border py-1 rounded hover:bg-gray-100">No</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700">Yes, Decrease</button>
        </div>
      </div>
    </div>
);

const SubmitConfirmModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[3000]">
      <div className="bg-white p-5 rounded shadow text-center w-[350px]">
        <AlertTriangle className="text-red-600 mx-auto mb-2" size={40} />
        <h5 className="font-bold text-gray-800">Submit Roll?</h5>
        <p className="text-xs text-gray-500">Once submitted, you cannot edit this roll data.</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 border py-1 rounded hover:bg-gray-100">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700">Confirm & Submit</button>
        </div>
      </div>
    </div>
);

export default QualityInspectionFullScreen;