import { useState, useCallback, useEffect } from "react";
// @ts-ignore - react-vega doesn't have TypeScript definitions
import { VegaEmbed } from "react-vega";
import { chartApi } from "../services/api";
import { Button, Box, CircularProgress, Typography } from "@mui/material";

interface ChartProps {
  trackerId?: number;
}

function AdvancedChartGenerator({ trackerId }: ChartProps) {
  const [chartSpec, setChartSpec] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);

  const handleChartClick = useCallback((_view: any, item: any) => {
    if (item && item.datum) {
      setSelectedData(item.datum);
    }
  }, []);

  const generateChart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await chartApi.getChart(trackerId);

      if (!response) {
        throw new Error("Failed to generate chart");
      }

      setChartSpec(response.spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [trackerId]);

  useEffect(() => {
    if (trackerId) {
      generateChart();
    }
  }, [trackerId, generateChart]);

  const vegaOptions = {
    actions: true,
    tooltip: true,
    hover: true,
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {!trackerId && (
        <>
          <Typography variant="h6" gutterBottom>Generador de Gráficos Avanzado</Typography>
          <Button onClick={generateChart} disabled={loading} variant="contained" sx={{ mb: 2 }}>
            {loading ? "Generando..." : "Generar Gráfico"}
          </Button>
        </>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {selectedData && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="subtitle2">Selected Data Point:</Typography>
          <pre style={{ margin: 0, overflow: 'auto' }}>
            {JSON.stringify(selectedData, null, 2)}
          </pre>
        </Box>
      )}

      {chartSpec && (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          {!trackerId && <Typography variant="h6" gutterBottom>Generated Chart:</Typography>}
          <VegaEmbed
            spec={chartSpec}
            options={vegaOptions}
            onNewView={(view: any) => {
              view.addEventListener("click", handleChartClick);
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default AdvancedChartGenerator;
