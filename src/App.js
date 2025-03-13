import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GDDApp = () => {
  const [location, setLocation] = useState("Larnaca");
  const [baseTemp, setBaseTemp] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [gddData, setGddData] = useState([]);
  const [totalGdd, setTotalGdd] = useState(0);
  const [growthStage, setGrowthStage] = useState("");
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!startDate) return;

    setLoading(true);
    setError("");

    fetch(
      `http://localhost:5000/gdd?location=${location}&base_temp=${baseTemp}&start_date=${startDate}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend Response:", data);

        if (data.error) {
          setError(data.error);
          return;
        }

        setGddData(data.daily_gdd || []);
        setTotalGdd(data.total_gdd || 0);
        setGrowthStage(data.growth_stage || "Unknown Stage");

        if (data.temperature_debug) {
          setTemperatureData(
            data.temperature_debug.map((entry) => ({
              date: entry.date,
              min_temp: entry.tmin,
              max_temp: entry.tmax,
              gdd: entry.gdd,
            }))
          );
        } else {
          setTemperatureData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Failed to fetch GDD data. Check your backend.");
      })
      .finally(() => setLoading(false));
  }, [location, baseTemp, startDate]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#e6f7e6",  // Light green background
      minHeight: "100vh"}}>
      <h1>Growing Degree Days (GDD) Tracker</h1>

      {/* Input Form */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Base Temperature (°C):
          <input
            type="number"
            value={baseTemp}
            onChange={(e) => setBaseTemp(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Planting Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      {loading && <p>Loading GDD data....</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* GDD Summary */}
      {!loading && !error && totalGdd > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Total GDD: {totalGdd.toFixed(2)}</h3>
          <h4>Current Growth Stage: {growthStage}</h4>
        </div>
      )}

      {/* GDD Line Chart */}
      <h3>GDD Progression Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={temperatureData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="gdd" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* Temperature & GDD Table */}
      <h3>Daily GDD & Temperature Records</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Date</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Daily GDD</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Min Temp (°C)</th>
            <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Max Temp (°C)</th>
          </tr>
        </thead>
        <tbody>
          {temperatureData.map((d, index) => (
            <tr key={index}>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{d.date}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {d.gdd !== undefined ? d.gdd.toFixed(2) : "N/A"}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {d.min_temp !== undefined ? d.min_temp.toFixed(2) + "°C" : "N/A"}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                {d.max_temp !== undefined ? d.max_temp.toFixed(2) + "°C" : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GDDApp;
