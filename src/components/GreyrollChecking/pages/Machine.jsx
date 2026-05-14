import React, { useEffect, useState } from 'react';
import { FaUserTag, FaUserFriends} from 'react-icons/fa';
import backgroundMachine from '../assets/RollCHecking.jpg'; 
import { useNavigate, useParams} from "react-router-dom";

const Machine = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);

    const [rollChecker, setRollChecker] = useState({
        code: "",
        employee: "",
        photo: ""
    });

    const [helper, setHelper] = useState({
        code: "",
        employee: "",
        photo: ""
    });

    useEffect(() => {
        document.title = `Machine ${id}`;
    }, [id]);

    /* ================= GET API ================= */
    useEffect(() => {
    fetch("https://app.herofashion.com/coraaemp/")
    .then(res => res.json())
    .then(setEmployees);
    }, []);

    useEffect(() => {
        fetch(`https://app.herofashion.com/empd/${id}`)
        .then(res => res.json())
        .then(data => {
            console.log("EMP DATA:", data);   // DEBUG

            setRollChecker({
            code: data.r_code || "",
            employee: data.r_emp || "",
            photo: ""
            });

            setHelper({
            code: data.h_code || "",
            employee: data.h_emp || "",
            photo: ""
            });
        })
        .catch(err => console.error("API ERROR:", err));
    }, [id]);

    useEffect(() => {
        if (!employees.length) return;

        if (rollChecker.code) {
            const emp = employees.find(
                e => String(e.code) === String(rollChecker.code)
            );

            if (emp?.photo) {
                setRollChecker(prev => ({ ...prev, photo: emp.photo }));
            }
        }

        if (helper.code) {
            const emp = employees.find(
                e => String(e.code) === String(helper.code)
            );

            if (emp?.photo) {
                setHelper(prev => ({ ...prev, photo: emp.photo }));
            }
        }
    }, [employees, rollChecker.code, helper.code]);


    /* ================= HANDLERS ================= */
    const handleRollCheckerIdChange = (e) => {
        const selectedId = Number(e.target.value);
        const emp = employees.find(emp => emp.code === selectedId);

        if (emp) {
            setRollChecker({
                code: emp.code,
                employee: emp.employee,
                photo: emp.photo
            });
        } else {
            setRollChecker(prev => ({
            ...prev,
            code: e.target.value,
            employee: "",
            photo: ""
            }));
        }
    };

    const handleHelperIdChange = (e) => {
        const selectedId = Number(e.target.value);
        const emp = employees.find(emp => emp.code === selectedId);

        if (emp) {
            setHelper({
                code: emp.code,
                employee: emp.employee,
                photo: emp.photo
            });
        } else {
            setHelper(prev => ({
            ...prev,
            code: e.target.value,
            employee: "",
            photo: ""
            }));
        }
    };

    const handleSubmit = async () => {
    const payload = {
        machine_id: id,
        r_code: rollChecker.code,
        r_emp: rollChecker.employee,
        h_code: helper.code || null,
        h_emp: helper.employee || null
    };

    try {
        await fetch("https://app.herofashion.com/create_emp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
        });
        console.log("Saved Allocation:", payload)
        navigate(`/grey-app/machine/${id}/checking`);
    } catch (err) {
        console.error("Save failed", err);
    }
    };

    const showSaveButton =
        rollChecker.code && rollChecker.employee &&
        (
        !helper.code ||               
        rollChecker.code !== helper.code
        );

    /* ================= BORDERS (UNCHANGED) ================= */
    const rollCheckerBorder = {
        backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #a050ff, #ff8c00)',
    };
  
    const helperBorder = {
        backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #00cc99, #00bfff)',
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{ 
                backgroundImage: `url(${backgroundMachine})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className='absolute inset-0 bg-black opacity-60'></div>

            <div className="flex flex-col items-center relative z-10">
                <header className="mb-10 text-center">
                    <span className="text-3xl xs:text-4xl md:text-5xl lg:text-6xl font-sans text-white font-bold max-w-4xl leading-tight tracking-wider drop-shadow-2xl text-center">
                        Allocation Form <br />
                        <span className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-bold font-sans text-gray-300'>
                            Machine {id}
                        </span>
                    </span>
                </header>

                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-8 p-10 bg-white/70 rounded-2xl shadow-3xl backdrop-blur-sm min-w-[300px] lg:min-w-[900px] border border-white/20">
                    
                    {/* -------- ROLL CHECKER -------- */}
                    <div className="flex-1 p-8 rounded-xl shadow-lg flex flex-col space-y-4 border border-gray-100">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Roll Checker</h2>

                            <div
                                className="w-20 h-20 rounded-full p-1 mx-auto flex items-center justify-center bg-origin-border bg-clip-content mb-3"
                                style={{ ...rollCheckerBorder, backgroundClip: 'content-box, border-box' }}
                            >
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    {rollChecker.photo ? (
                                        <img src={rollChecker.photo} className="w-full h-full object-cover" alt='Roll Checker' 
                                        referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) =>{ e.target.style.display = "none";}} />
                                    ) : (
                                        <FaUserTag className="text-4xl text-purple-600" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <label className="text-sm md:text-lg font-medium text-gray-700">Roll Checker Name</label>
                        <input
                            type="text"
                            value={rollChecker.employee}
                            readOnly
                            className="p-3 border border-gray-300 rounded-lg"
                        />

                        <label className="text-sm md:text-lg font-medium text-gray-700 mt-4">Roll Checker ID</label>
                            <input
                            list="rollCheckerIds"
                            value={rollChecker.code || ""}
                            onChange={handleRollCheckerIdChange}
                            placeholder="Select or type ID"
                            className="p-3 border border-gray-300 rounded-lg"
                            />
                            <datalist id="rollCheckerIds">
                            {employees.map(emp => (
                                <option key={emp.code} value={emp.code} />
                            ))}
                            </datalist>
                    </div>

                    {/* -------- HELPER -------- */}
                    <div className="flex-1 p-8 rounded-xl shadow-lg flex flex-col space-y-4 border border-gray-100">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Helper</h2>

                            <div
                                className="w-20 h-20 rounded-full p-1 mx-auto flex items-center justify-center bg-origin-border bg-clip-content mb-3"
                                style={{ ...helperBorder, backgroundClip: 'content-box, border-box' }}
                            >
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    {helper.photo ? (
                                        <img src={helper.photo} className="w-full h-full object-cover" alt='Helper' 
                                        referrerPolicy="no-referrer" crossOrigin="anonymous" onError={(e) =>{ e.target.style.display = "none";}} />
                                    ) : (
                                        <FaUserFriends className="text-4xl text-green-600" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <label className="text-sm md:text-lg font-medium text-gray-700">Helper Name</label>
                        <input
                            type="text"
                            value={helper.employee || ""}
                            readOnly
                            className="p-3 border border-gray-300 rounded-lg"
                        />

                        <label className="text-sm md:text-lg font-medium text-gray-700 mt-4">Helper ID</label>
                            <input
                            list="helperIds"
                            value={helper.code || ""}
                            onChange={handleHelperIdChange}
                            placeholder="Select or type ID"
                            className="p-3 border border-gray-300 rounded-lg"
                            />
                            <datalist id="helperIds">
                            {employees.map(emp => (
                                <option key={emp.code} value={emp.code} />
                            ))}
                            </datalist>
                    </div>
                </div>

                {/* -------- SAVE BUTTON -------- */}
                {showSaveButton && (
                    <button
                        onClick={handleSubmit}
                        className="mt-3 px-10 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-lg"
                    >
                        Save Allocation
                    </button>
                )}
            </div>
        </div>
    );
};

export default Machine;
