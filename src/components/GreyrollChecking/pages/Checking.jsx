import { useState, useEffect } from 'react';
import { FaArrowRight, FaClipboardList } from 'react-icons/fa';
import backgroundMachine from '../assets/RollCHecking.jpg';
import { useParams, useNavigate } from "react-router-dom";

const UserIconSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const CombinedCheckUICentered = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [allocation, setAllocation] = useState(null);

    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [pendingRollData, setPendingRollData] = useState(null);

    // Functionality placeholder
    const handleAllocate = () => {
        navigate(`/grey-app/machine/${id}`);
    }

    const handleReport = () => navigate(`/grey-app/machine/${id}/report`);

    useEffect(()=> {
        document.title = `Machine ${id}` 
    }, [id])

    useEffect(() => {
        fetch(`https://app.herofashion.com/empd/${id}`)
            .then(res => res.json())
            .then(data => setAllocation(data))
            .catch(err => console.error(err));
    }, [id]);


    const handleRollCheck = async (e) => {
        e.preventDefault();
        const rollNo = e.target.elements['roll-no'].value;

        if (!rollNo) {
            alert("Please scan a Roll Number.");
            return;
        }

        try {
            // 1️⃣ Roll master check
            const res = await fetch("https://app.herofashion.com/CoraRollcheck");
            const data = await res.json();

            const rollData = data.find(
                item => String(item.rlno) === String(rollNo)
            );

            if (!rollData) {
                alert("Roll number not found");
                return;
            }

            // 2️⃣ Submit check
            const submitRes = await fetch("https://app.herofashion.com/corarollview/");
            const submitList = await submitRes.json();

            const submittedRoll = submitList.find(
                item => String(item.rlno) === String(rollNo)
            );

            // 🔒 Employee already working another roll
            const employeePendingRoll = submitList.find(
                item =>
                    String(item.empid) === String(allocation?.r_code) &&
                    item.submit === false
            );

            if (employeePendingRoll && String(employeePendingRoll.rlno) !== String(rollNo)) {
                alert(`You already started Roll ${employeePendingRoll.rlno}. Please submit it before checking another roll.`);
                return;
            }

            // ❌ BLOCK if already submitted
            if (submittedRoll && submittedRoll.submit === true) {
                alert("This roll is already submitted. You cannot proceed.");
                return;
            }

            // 🔐 PASSWORD CHECK if submit === false
            if (submittedRoll && submittedRoll.submit === false) {
                setPendingRollData(rollData);
                setShowLoginPopup(true);
                return;
            }

            // ✅ ALLOW navigation
            navigate(`/grey-app/machine/${id}/details`, {
                state: {
                    rollData,
                    h_code: allocation?.h_code || "",
                    r_code: allocation?.r_code || ""
                }
            });

        } catch (error) {
            console.error(error);
            alert("Error fetching roll data");
        }
    };

    return (
        // 1. Main container with Background Image and full opacity overlay
        <div
            className="min-h-screen flex items-center justify-center p-8 relative"
            style={{
                backgroundImage: `url(${backgroundMachine})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >

            {/* Dark Overlay (opacity 60%) */}
            <div className='absolute inset-0 bg-black opacity-60'></div>

            {/* Content Container (relative z-10) - Uses justify-evenly for equal vertical spacing */}
            <div className="flex flex-col items-center relative z-10 w-full max-w-2xl min-h-[500px] justify-evenly gap-3">

                {/* --- 1. Top Header Card (Translucent and Rounded) --- */}
                <div className="w-full p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-between border border-white/20 flex-col md:flex-row gap-3">

                    {/* Left Side: Text and Icons */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center text-xl font-semibold text-gray-800">
                            <UserIconSVG />
                            Current Employee Allocation
                        </div>
                        <div className="text-md font-medium text-gray-500">
                            Machine {id}
                        </div>
                        <div className="text-md font-medium text-gray-700">
                            <span className="font-bold text-blue-700">Roll Checker :</span>{" "}{allocation?.r_emp} - {allocation?.r_code}
                        </div>
                        <div className="text-md font-medium text-gray-700">
                            <span className="font-bold text-blue-700">Helper :</span>{" "}{allocation?.h_emp} - {allocation?.h_code}
                        </div>
                    </div>

                    {/* Right Side: Employee Allocate Button */}
                    <button
                        onClick={handleAllocate}
                        className="px-4 py-3 bg-blue-600 text-white font-medium rounded transition duration-150 shadow-md hover:bg-blue-700" >
                        Employee Allocate
                    </button>
                </div>

                {/* --- 2. Middle Report Button (Fixed styling for visual consistency) --- */}
                <button
                    onClick={handleReport}
                    className="flex items-center px-6 py-2 
                    text-white font-medium rounded-full shadow-lg 
                    transition duration-150 transform hover:scale-[1.05]"
                >
                    <FaClipboardList className="h-5 w-5 mr-2" />
                    Report
                </button>


                {/* --- 3. Bottom Roll Check Card (Translucent and Blurred) --- */}
                <div className="w-full max-w-lg p-10 bg-white/70 rounded-2xl shadow-2xl backdrop-blur-sm">

                    {/* Header: Roll Check Title */}
                    <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
                        Roll Check
                    </h1>

                    {/* Form Content */}
                    <form className="space-y-6" onSubmit={handleRollCheck}>

                        {/* Input Field Section */}
                        <div className="space-y-2">
                            <label htmlFor="roll-no" className="block text-lg font-medium text-gray-700">
                                Scan Roll No:
                            </label>
                            <input
                                type="text"
                                id="roll-no"
                                name="roll-no"
                                className="w-full p-3 rounded-lg transition duration-150 shadow-sm border"
                                placeholder="Scan Your Roll No"
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center p-3  
                            font-semibold text-white bg-blue-600 rounded 
                            hover:bg-blue-700 transition duration-150 shadow-md"
                        >
                            Next
                            <FaArrowRight className="h-5 w-5 ml-3 mt-1" />
                        </button>
                    </form>
                </div>
            </div>
            {showLoginPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-[380px] p-6">

                        <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
                            Roll Already Progress !
                        </h2>

                        <div className="mb-3">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 rounded bg-gray-100 outline-none"
                                placeholder="Enter Incharge ID:"
                            />
                        </div>

                        <div className="mb-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded bg-gray-100 outline-none"
                                placeholder="Password"
                            />
                        </div>

                        {loginError && (
                            <p className="text-red-500 text-sm text-center mb-2">
                                {loginError}
                            </p>
                        )}

                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700"
                            onClick={() => {
                                if (username !== "22332" || password !== "1234") {
                                    setLoginError("Invalid Incharge ID or password");
                                    return;
                                }

                                setShowLoginPopup(false);
                                setUsername("");
                                setPassword("");
                                setLoginError("");

                                navigate(`/grey-app/machine/${id}/details`, {
                                    state: {
                                        rollData: pendingRollData,
                                        h_code: allocation?.h_code || "",
                                        r_code: allocation?.r_code || ""
                                    }
                                });
                            }}
                        >
                            Next
                        </button>

                        <button
                            className="w-full mt-3 text-gray-500 text-sm"
                            onClick={() => {
                                setShowLoginPopup(false);
                                setPassword("");
                                setLoginError("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombinedCheckUICentered;