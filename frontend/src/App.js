import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputs, setInputs] = useState({
    scenario_name: 'Q1',
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000
  });

  const [results, setResults] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Handle input changes
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // Run simulation
  const handleSimulate = async () => {
    try {
      const res = await fetch('http://localhost:5000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Simulation error:', err);
      alert('Error connecting to backend');
    }
  };

  // Save scenario
  const handleSaveScenario = async () => {
    try {
      const res = await fetch('http://localhost:5000/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      alert(`Scenario saved with ID: ${data.id}`);
      fetchScenarios();
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving scenario');
    }
  };

  // Fetch saved scenarios
  const fetchScenarios = async () => {
    try {
      const res = await fetch('http://localhost:5000/scenarios');
      const data = await res.json();
      setSavedScenarios(data);
    } catch (err) {
      console.error('Fetch scenarios error:', err);
    }
  };

  // Load saved scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, []);

  // Download PDF report
  const handleDownloadReport = async () => {
    if (!results) return alert('Simulate first!');
    const email = prompt('Enter your email:');
    if (!email) return;

    try {
      const res = await fetch('http://localhost:5000/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scenario: inputs, results }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ROI_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Report error:', err);
      alert('Error generating report');
    }
  };

  return (
    <div className="container">
      <h1>Invoicing ROI Simulator</h1>

      {Object.keys(inputs).map((key) => (
        <div className="input-group" key={key}>
          <label>{key.replace(/_/g, ' ')}:</label>
          <input
            type="text"
            name={key}
            value={inputs[key]}
            onChange={handleChange}
          />
        </div>
      ))}

      <div className="button-group">
        <button onClick={handleSimulate}>Simulate</button>
        <button onClick={handleSaveScenario}>Save Scenario</button>
        <button onClick={handleDownloadReport}>Download PDF Report</button>
      </div>

      {results && (
        <div className="results">
          <h2>Results:</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}

      <div className="saved-scenarios">
        <h3>Saved Scenarios:</h3>
        <ul>
          {savedScenarios.map((s) => (
            <li key={s.id}>
              {s.scenario_name} (ID: {s.id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
