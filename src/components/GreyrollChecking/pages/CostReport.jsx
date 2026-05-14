import React, { useEffect, useState } from "react";

const CostReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic date
  const today = new Date().toISOString().split("T")[0];

  // Dummy API response (same structure as backend)
  const dummyApiResponse = [
    {
      machine: 1,
      employee_id: 22506,
      helper_id: null,
      employee_name: "DIGVIJAY KUMAR TAKUR",
      helper_name: "",
      employee_shift: 0.5,
      helper_shift: 0,
      employee_wage: 150,
      helper_wage: 0,
      total_salary: 150,
      roll_kg: 0,
      cost_kg: 0,
      pnl: -150
    },
    {
      machine: 2,
      employee_id: 21981,
      helper_id: null,
      employee_name: "AKRUR MAHANAND",
      helper_name: "",
      employee_shift: 0.5,
      helper_shift: 0,
      employee_wage: 150,
      helper_wage: 0,
      total_salary: 150,
      roll_kg: 0,
      cost_kg: 0,
      pnl: -150
    },
    {
      machine: 1,
      employee_id: 22584,
      helper_id: null,
      employee_name: "ALOK KUMBHAR",
      helper_name: "",
      employee_shift: 0.25,
      helper_shift: 0,
      employee_wage: 75,
      helper_wage: 0,
      total_salary: 75,
      roll_kg: 21.2,
      cost_kg: 42.4,
      pnl: -32.6
    }
  ];

  useEffect(() => {
    // simulate API
    setTimeout(() => {
      setData(dummyApiResponse);
      setLoading(false);
    }, 400);
  }, []);

  const calculateEfficiency = (rollKg, shift) => {
    if (!shift || !rollKg) return "0.00";
    return ((rollKg / shift) * 100).toFixed(2);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Cost Report - {today}</h2>

      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: 10,
          background: "#ff6b6b",
          color: "#fff",
          border: "none",
          padding: "6px 14px",
          borderRadius: 4,
          cursor: "pointer"
        }}
      >
        Back
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          width="100%"
          cellPadding={8}
          style={{ borderCollapse: "collapse" }}
        >
          <thead style={{ background: "#ffe5e5" }}>
            <tr>
              <th>MACHINE</th>
              <th>EMPLOYEE ID</th>
              <th>HELPER ID</th>
              <th>EMPLOYEE NAME</th>
              <th>HELPER NAME</th>
              <th>EMP SHIFT</th>
              <th>HELPER SHIFT</th>
              <th>EMP WAGE</th>
              <th>HELPER WAGE</th>
              <th>TOTAL SALARY</th>
              <th>ROLL KG</th>
              <th>COST KG</th>
              <th>EFFICIENCY %</th>
              <th>P & L</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index} style={{ background: "#ffecec" }}>
                <td>{row.machine}</td>
                <td>{row.employee_id}</td>
                <td>{row.helper_id ?? "None"}</td>
                <td>{row.employee_name}</td>
                <td>{row.helper_name}</td>
                <td>{row.employee_shift}</td>
                <td>{row.helper_shift}</td>
                <td>{row.employee_wage.toFixed(2)}</td>
                <td>{row.helper_wage.toFixed(2)}</td>
                <td>{row.total_salary.toFixed(2)}</td>
                <td>{row.roll_kg.toFixed(2)}</td>
                <td>{row.cost_kg.toFixed(2)}</td>
                <td>
                  {calculateEfficiency(
                    row.roll_kg,
                    row.employee_shift
                  )}
                  %
                </td>
                <td
                  style={{
                    color: row.pnl < 0 ? "red" : "green",
                    fontWeight: 600
                  }}
                >
                  {row.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CostReport;
