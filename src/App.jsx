import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, ReferenceLine } from 'recharts';
import { Calculator, BarChart2, Table, Info, LayoutGrid, ChevronRight } from 'lucide-react';

// --- Data Definition ---
// Hardcoded from the provided notebook content
const rawData = {
  I: {
    x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]
  },
  II: {
    x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]
  },
  III: {
    x: [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5],
    y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]
  },
  IV: {
    x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],
    y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]
  }
};

// Transform data for Recharts
const datasets = Object.keys(rawData).map(key => {
  const points = rawData[key].x.map((xVal, i) => ({
    x: xVal,
    y: rawData[key].y[i],
    id: i
  }));
  return { name: `Dataset ${key}`, key, points };
});

// --- Statistical Functions ---
const calculateStats = (points) => {
  const n = points.length;
  const xValues = points.map(p => p.x);
  const yValues = points.map(p => p.y);

  const mean = arr => arr.reduce((a, b) => a + b, 0) / n;
  const xMean = mean(xValues);
  const yMean = mean(yValues);

  // Standard Deviation (Sample)
  const stdDev = (arr, meanVal) => Math.sqrt(arr.map(val => Math.pow(val - meanVal, 2)).reduce((a, b) => a + b) / (n - 1));
  const xStd = stdDev(xValues, xMean);
  const yStd = stdDev(yValues, yMean);

  // Correlation & Regression
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    const dy = yValues[i] - yMean;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const r = numerator / Math.sqrt(denomX * denomY);
  
  // y = mx + c
  const slope = numerator / denomX;
  const intercept = yMean - slope * xMean;

  return {
    xMean,
    yMean,
    xStd,
    yStd,
    r,
    slope,
    intercept
  };
};

// --- Components ---

const StatCard = ({ label, value, subtext, colorClass = "text-slate-800" }) => (
  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
    <span className={`text-xl font-bold ${colorClass}`}>{value}</span>
    {subtext && <span className="text-xs text-slate-500 mt-1">{subtext}</span>}
  </div>
);

const DataSetView = ({ data, color }) => {
  const stats = useMemo(() => calculateStats(data.points), [data]);
  
  // Generate regression line points
  const regressionData = [
    { x: 0, yLine: stats.intercept },
    { x: 20, yLine: stats.slope * 20 + stats.intercept }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${color}`}></span>
          {data.name}
        </h3>
        <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
          r = {stats.r.toFixed(3)}
        </div>
      </div>

      <div className="h-64 w-full p-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" dataKey="x" domain={[0, 20]} hide />
            <YAxis type="number" dataKey="y" domain={[0, 14]} hide />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            {/* Regression Line */}
            <Line 
              data={regressionData} 
              dataKey="yLine" 
              stroke="#ef4444" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false} 
              activeDot={false}
              isAnimationActive={false}
            />
            {/* Scatter Points */}
            <Scatter 
              data={data.points} 
              fill={color.replace('bg-', '').replace('-500', '')} // Hacky way to get hex roughly or just rely on CSS classes if using customized dots
              shape="circle"
            >
              {
                data.points.map((entry, index) => (
                  <circle key={`cell-${index}`} cx={0} cy={0} r={6} className={`${color.replace('bg', 'fill')} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`} stroke="black" strokeWidth={1} />
                ))
              }
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Axis Labels Overlay */}
        <div className="absolute bottom-2 w-full text-center text-xs text-slate-400 font-medium">X Axis</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-400 font-medium origin-center">Y Axis</div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Mean X:</span>
          <span className="font-mono font-semibold">{stats.xMean.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mean Y:</span>
          <span className="font-mono font-semibold">{stats.yMean.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Std X:</span>
          <span className="font-mono font-semibold">{stats.xStd.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Std Y:</span>
          <span className="font-mono font-semibold">{stats.yStd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ data }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-2 text-left font-medium text-slate-500">Index</th>
          <th className="px-4 py-2 text-right font-medium text-slate-500">X</th>
          <th className="px-4 py-2 text-right font-medium text-slate-500">Y</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {data.points.map((p, i) => (
          <tr key={i} className="hover:bg-slate-50">
            <td className="px-4 py-2 text-slate-400 font-mono">{i + 1}</td>
            <td className="px-4 py-2 text-right font-mono text-slate-700">{p.x}</td>
            <td className="px-4 py-2 text-right font-mono text-slate-700">{p.y}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function AnscombeApp() {
  const [viewMode, setViewMode] = useState('visualize'); // 'visualize', 'data', 'learn'
  
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Anscombe's Quartet
            </h1>
          </div>
          
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'visualize', icon: LayoutGrid, label: 'Visualize' },
              { id: 'data', icon: Table, label: 'Raw Data' },
              { id: 'learn', icon: Info, label: 'The Lesson' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === item.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: VISUALIZE */}
        {viewMode === 'visualize' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Same Statistics, Different Stories</h2>
              <p className="text-lg text-slate-600">
                Below are four different datasets. Despite having nearly identical statistical properties, their graphical representations reveal very different patterns.
              </p>
            </div>

            {/* Common Stats Summary Block - To prove the point */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4 text-indigo-800 font-semibold">
                <Calculator className="w-5 h-5" />
                <span>Shared Statistical Properties (Across All 4 Datasets)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Mean X" value="9.0" colorClass="text-indigo-600" />
                <StatCard label="Mean Y" value="7.50" colorClass="text-indigo-600" />
                <StatCard label="Variance X" value="11.0" colorClass="text-indigo-600" />
                <StatCard label="Variance Y" value="4.12" colorClass="text-indigo-600" />
                <StatCard label="Correlation" value="0.816" subtext="Strong Positive" colorClass="text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {datasets.map((dataset, idx) => (
                <DataSetView 
                  key={dataset.key} 
                  data={dataset} 
                  color={colors[idx]} 
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: RAW DATA */}
        {viewMode === 'data' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Raw Data Tables</h2>
              <p className="text-slate-600">Inspect the underlying coordinate points for each dataset.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {datasets.map((dataset, idx) => (
                <div key={dataset.key} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-3 h-3 rounded-full ${colors[idx]}`}></span>
                    <h3 className="font-bold text-slate-800">{dataset.name}</h3>
                  </div>
                  <DataTable data={dataset} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: LESSON */}
        {viewMode === 'learn' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Why does this matter?</h2>
              <p className="text-indigo-100 text-lg">The importance of visualizing data before analyzing it.</p>
            </div>
            
            <div className="p-8 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
                  Statistics can be misleading
                </h3>
                <p className="text-slate-600 leading-relaxed ml-10">
                  If you only looked at the summary statistics (mean, variance, correlation), you would conclude that these four datasets are effectively identical. You might assume they all represent a simple linear relationship with some noise.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-sm">2</span>
                  Outliers change everything
                </h3>
                <p className="text-slate-600 leading-relaxed ml-10">
                  <strong>Dataset III</strong> shows how a single outlier can distort the correlation coefficient of an otherwise perfect linear relationship. <strong>Dataset IV</strong> shows how an outlier can produce a high correlation coefficient even when there is no linear relationship between X and Y variables at all (except for the outlier).
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 text-sm">3</span>
                  Always plot your data
                </h3>
                <p className="text-slate-600 leading-relaxed ml-10">
                  Visualizing data allows us to identify structural patterns, outliers, and clusters that summary statistics might miss. It is a critical first step in any data analysis pipeline.
                </p>
              </section>
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-center">
              <button 
                onClick={() => setViewMode('visualize')}
                className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                Return to Visualization <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}