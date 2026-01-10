"use client";

import { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatHashrate } from "@/lib/formatters";
import { poolConfig } from "@/lib/poolConfig";
import { API_BASE_URL } from "@/lib/api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HashrateDataPoint {
  timestamp: number;
  hashrate: number;
}

interface HashrateChartProps {
  title?: string;
  color?: string;
  height?: number;
  refreshInterval?: number;
  dataSource?: "pool" | "account";
  accountAddress?: string;
}

const MAX_DATA_POINTS = 60; // Keep 60 data points (e.g., 1 hour at 1 min intervals)

export default function HashrateChart({
  title = "Pool Hashrate",
  color = "#22c55e",
  height = 300,
  refreshInterval = 60000, // 1 minute default
  dataSource = "pool",
  accountAddress,
}: HashrateChartProps) {
  const [historyData, setHistoryData] = useState<HashrateDataPoint[]>([]);
  const chartRef = useRef<ChartJS<"line">>(null);

  const storageKey = `${poolConfig.storage.hashrateHistory}-${dataSource}${accountAddress ? `-${accountAddress}` : ""}`;

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out old data (keep last 24 hours)
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((d: HashrateDataPoint) => d.timestamp > cutoff);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialization from localStorage is intentional
        setHistoryData(filtered);
      } catch {
        setHistoryData([]);
      }
    }
  }, [storageKey]);

  // Fetch and update hashrate data
  useEffect(() => {
    const fetchHashrate = async () => {
      try {
        let url = `${API_BASE_URL}/api/stats`;
        if (dataSource === "account" && accountAddress) {
          url = `${API_BASE_URL}/api/accounts/${accountAddress}`;
        }

        const res = await fetch(url);
        if (!res.ok) return;

        const data = await res.json();
        const currentHashrate =
          dataSource === "pool" ? data.hashrate || 0 : data.currentHashrate || 0;

        const newDataPoint: HashrateDataPoint = {
          timestamp: Date.now(),
          hashrate: currentHashrate,
        };

        setHistoryData((prev) => {
          const updated = [...prev, newDataPoint].slice(-MAX_DATA_POINTS);
          // Save to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error("Failed to fetch hashrate:", error);
      }
    };

    // Initial fetch
    fetchHashrate();

    // Set up interval
    const interval = setInterval(fetchHashrate, refreshInterval);
    return () => clearInterval(interval);
  }, [dataSource, accountAddress, refreshInterval, storageKey]);

  // Format time for labels
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  // Chart data
  const chartData = {
    labels: historyData.map((d) => formatTime(d.timestamp)),
    datasets: [
      {
        label: title,
        data: historyData.map((d) => d.hashrate),
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#9ca3af",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return `Hashrate: ${formatHashrate(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#374151",
          lineWidth: 0.5,
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 0,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: "#374151",
          lineWidth: 0.5,
        },
        ticks: {
          color: "#9ca3af",
          callback: (value) => formatHashrate(value as number),
        },
        beginAtZero: true,
      },
    },
  };

  // Calculate stats
  const currentHashrate = historyData.length > 0 ? historyData[historyData.length - 1].hashrate : 0;
  const avgHashrate =
    historyData.length > 0
      ? historyData.reduce((sum, d) => sum + d.hashrate, 0) / historyData.length
      : 0;
  const maxHashrate = historyData.length > 0 ? Math.max(...historyData.map((d) => d.hashrate)) : 0;
  const minHashrate = historyData.length > 0 ? Math.min(...historyData.map((d) => d.hashrate)) : 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-400">Current: </span>
            <span className="text-white font-medium">{formatHashrate(currentHashrate)}</span>
          </div>
          <div>
            <span className="text-gray-400">Avg: </span>
            <span className="text-white font-medium">{formatHashrate(avgHashrate)}</span>
          </div>
        </div>
      </div>

      <div style={{ height }}>
        {historyData.length > 1 ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p>Collecting data...</p>
              <p className="text-sm mt-1">Graph will appear after collecting more data points</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {historyData.length > 1 && (
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700 text-sm">
          <div>
            <p className="text-gray-400">Current</p>
            <p className="text-white font-medium">{formatHashrate(currentHashrate)}</p>
          </div>
          <div>
            <p className="text-gray-400">Average</p>
            <p className="text-white font-medium">{formatHashrate(avgHashrate)}</p>
          </div>
          <div>
            <p className="text-gray-400">Maximum</p>
            <p className="text-green-400 font-medium">{formatHashrate(maxHashrate)}</p>
          </div>
          <div>
            <p className="text-gray-400">Minimum</p>
            <p className="text-red-400 font-medium">{formatHashrate(minHashrate)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
