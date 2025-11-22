import React, { useState, useCallback } from "react";
import { VegaEmbed } from "react-vega";
import { chartApi } from "../services/api";

function AdvancedChartGenerator() {
  const [chartSpec, setChartSpec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const handleChartClick = useCallback((view, item) => {
    if (item && item.datum) {
      setSelectedData(item.datum);
    }
  }, []);

  const generateChart = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        val: 1,
      };

      const response = await chartApi.getChart();

      if (!response) {
        throw new Error("Failed to generate chart");
      }

      setChartSpec(response.spec);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const vegaOptions = {
    actions: true,
    tooltip: true,
    hover: true,
  };

  return (
    <div>
      <h2>Advanced Chart Generator</h2>
      <button onClick={generateChart} disabled={loading}>
        {loading ? "Generating..." : "Generate Chart"}
      </button>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {selectedData && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h4>Selected Data Point:</h4>
          <pre>{JSON.stringify(selectedData, null, 2)}</pre>
        </div>
      )}

      {chartSpec && (
        <div>
          <h3>Generated Chart:</h3>
          <VegaEmbed
            spec={chartSpec}
            options={vegaOptions}
            onNewView={(view) => {
              view.addEventListener("click", handleChartClick);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AdvancedChartGenerator;