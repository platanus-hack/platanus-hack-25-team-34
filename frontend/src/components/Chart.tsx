import { useState, useCallback, useEffect, useMemo } from "react";
// @ts-ignore
import { VegaEmbed } from "react-vega";
import { chartApi } from "../services/api";
import { Box, Typography, Skeleton } from "@mui/material";

interface ChartProps {
  trackerId?: number;
}

/**
 * THE HEDGIE THEME INJECTOR v2
 * Now with "Axis X Surgeon" logic to fix overlapping dates.
 */
const injectHedgieTheme = (spec: any) => {
  if (!spec) return null;

  // Deep clone to avoid mutation
  const themedSpec = JSON.parse(JSON.stringify(spec));

  // 1. Layout & Sizing
  // 'fit' ensures the chart respects the container's width/height
  themedSpec.autosize = { type: 'fit', contains: 'padding' };
  themedSpec.padding = { top: 10, left: 10, right: 10, bottom: 20 };

  if (!themedSpec.config) themedSpec.config = {};

  // 2. Global Configuration
  themedSpec.config = {
    ...themedSpec.config,
    font: 'JetBrains Mono, monospace', // The "Terminal" font
    background: 'transparent',
    view: { 
      stroke: 'transparent' // No outer border
    },
    
    // 3. The "Punk" Grid System
    axis: {
      domainColor: '#111827',
      domainWidth: 2,
      gridColor: '#374151',
      gridDash: [2, 2], // Tight dots = Engineering look
      gridOpacity: 0.2,
      tickColor: '#111827',
      tickWidth: 2,
      labelFont: 'JetBrains Mono, monospace',
      labelFontSize: 10,
      labelColor: '#6B7280',
      labelPadding: 8,
      title: null // Remove standard titles for cleaner look
    },

    // 4. THE AXIS FIX: Specific overrides for X-Axis (Time)
    axisX: {
      // Force roughly 6 ticks to prevent crowding
      tickCount: 6, 
      
      // Force labels to be flat (no 45 degree tilt)
      labelAngle: 0,
      
      // THE MAGIC FORMULA: 
      // 1. timeFormat(..., '%b') turns "September" -> "Sep"
      // 2. upper(...) turns "Sep" -> "SEP"
      labelExpr: "upper(timeFormat(datum.value, '%b'))",
      
      // If they still overlap, hide every other one
      labelOverlap: 'parity' 
    },

    // 5. Y-Axis Specifics
    axisY: {
      tickCount: 5,
      labelPadding: 10,
      // Add a grid line at 0 for visual baseline
      domain: false
    },

    // 6. Colors & Interaction
    range: {
      category: ['#111827', '#00C853', '#FF6B6B', '#9CA3AF']
    },
    // Make the tooltip crosshair sharp
    rule: {
      color: '#374151',
      strokeDash: [4, 4]
    }
  };

  return themedSpec;
};

function AdvancedChartGenerator({ trackerId }: ChartProps) {
  const [originalSpec, setOriginalSpec] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply the theme logic
  const chartSpec = useMemo(() => injectHedgieTheme(originalSpec), [originalSpec]);

  const generateChart = useCallback(async () => {
    if (!trackerId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await chartApi.getChart(trackerId);
      if (!response) throw new Error("No Data Stream");
      setOriginalSpec(response.spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection Lost');
    } finally {
      setLoading(false);
    }
  }, [trackerId]);

  useEffect(() => {
    generateChart();
  }, [generateChart]);

  // Vega Options: Disable actions, cleaner SVG render
  const vegaOptions = {
    actions: false,
    renderer: 'svg',
    tooltip: { theme: 'dark' } 
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 0 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: 350, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#FEF2F2',
        border: '2px dashed #EF4444' 
      }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#EF4444', fontWeight: 700 }}>
          [!] DATA_STREAM_INTERRUPTED
        </Typography>
      </Box>
    );
  }

  if (!chartSpec) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 2. The Chart Container */}
      <Box 
        sx={{ 
          width: '100%', 
          overflowX: 'hidden',
          // Global CSS overrides for the Tooltip to look like a Terminal
          '& #vg-tooltip-element': {
            fontFamily: 'JetBrains Mono, monospace !important',
            fontSize: '11px !important',
            backgroundColor: '#000 !important',
            color: '#00C853 !important', // Hacker Green text
            border: '1px solid #00C853 !important', // Green border
            boxShadow: '0 4px 0 rgba(0,200,83,0.2) !important', // Hard shadow
            padding: '8px 12px !important',
            borderRadius: '0px !important', // Sharp corners
          },
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.3 },
            '100%': { opacity: 1 },
          }
        }}
      >
        <VegaEmbed spec={chartSpec} options={vegaOptions} />
      </Box>
    </Box>
  );
}

export default AdvancedChartGenerator;