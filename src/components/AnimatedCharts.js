import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Animated Counter Component
export const AnimatedCounter = ({ value, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// Animated Progress Bar
export const AnimatedProgressBar = ({ percentage, color = '#00d4ff', height = 8, delay = 0 }) => {
  return (
    <div className="w-full bg-dark-bg rounded-full overflow-hidden" style={{ height }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.5, delay, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

// Animated Pie Chart with Custom Labels
export const AnimatedPieChart = ({ data, colors, title }) => {
  // Ensure data is valid and has values
  const validData = data?.filter(item => item && typeof item.value === 'number' && item.value > 0) || [];

  const [animatedData, setAnimatedData] = useState(validData.map(item => ({ ...item, value: 0 })));

  useEffect(() => {
    if (validData.length === 0) return;

    const timer = setTimeout(() => {
      setAnimatedData(validData);
    }, 500);
    return () => clearTimeout(timer);
  }, [validData]);

  const renderCustomLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, percentage, index } = props;

    // Safety checks for undefined values
    if (!cx || !cy || midAngle === undefined || !outerRadius || percentage === undefined) {
      return null;
    }

    // Don't show labels for very small slices
    if (percentage < 2) return null;

    // Get the color for this slice
    const sliceColor = colors[index % colors.length] || '#ffffff';

    const RADIAN = Math.PI / 180;

    // Calculate positions for the label line and text
    const startRadius = outerRadius + 8;
    const endRadius = outerRadius + 30;

    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
    const endX = cx + endRadius * Math.cos(-midAngle * RADIAN);
    const endY = cy + endRadius * Math.sin(-midAngle * RADIAN);

    // Determine if label should be on left or right side
    const isRightSide = endX > cx;
    const textX = isRightSide ? endX + 20 : endX - 20;

    return (
      <g>
        {/* Connector line from pie slice to end point */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={sliceColor}
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Horizontal line extension */}
        <line
          x1={endX}
          y1={endY}
          x2={textX}
          y2={endY}
          stroke={sliceColor}
          strokeWidth="2"
          opacity="0.8"
        />
        {/* Background circle for percentage text */}
        <circle
          cx={textX}
          cy={endY}
          r="12"
          fill="rgba(0,0,0,0.8)"
          stroke={sliceColor}
          strokeWidth="1"
        />
        {/* Percentage text */}
        <text
          x={textX}
          y={endY}
          fill={sliceColor}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fontWeight="bold"
        >
          {`${Math.round(percentage)}%`}
        </text>
      </g>
    );
  };

  // Don't render if no valid data
  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No data available for chart</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            labelLine={false}
            label={renderCustomLabel}
            animationBegin={0}
            animationDuration={2000}
          >
            {animatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Animated Line Chart with Gradient
export const AnimatedLineChart = ({ data, dataKey, color = '#00d4ff', title }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    // Animate data points one by one
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 100);
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={animatedData}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#gradient-${dataKey})`}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Animated Bar Chart with Hover Effects
export const AnimatedBarChart = ({ data, dataKeys, colors, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#333' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={index * 200}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Interactive Metric Card
export const InteractiveMetricCard = ({
  title,
  value,
  icon: Icon,
  color = '#00d4ff',
  trend,
  description,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer relative overflow-hidden"
    >
      {/* Background glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        className="absolute inset-0 rounded-xl"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" style={{ color }} />
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </motion.div>
          )}
        </div>

        <div className="text-3xl font-bold text-white mb-2">
          <AnimatedCounter value={value} />
        </div>

        <div className="text-sm text-gray-400 mb-2">{title}</div>

        {description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            className="text-xs text-gray-500 overflow-hidden"
          >
            {description}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Activity Heatmap Component
export const ActivityHeatmap = ({ data, title }) => {
  const getIntensityColor = (value, max) => {
    const intensity = value / max;
    if (intensity === 0) return '#1a1a1a';
    if (intensity <= 0.25) return '#0e4429';
    if (intensity <= 0.5) return '#006d32';
    if (intensity <= 0.75) return '#26a641';
    return '#39d353';
  };

  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {data.map((item, index) => (
          <motion.div
            key={item.month}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.2 }}
            className="w-3 h-3 rounded-sm cursor-pointer"
            style={{ backgroundColor: getIntensityColor(item.total, maxValue) }}
            title={`${item.month}: ${item.total} activities`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
            <div
              key={intensity}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(intensity * maxValue, maxValue) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
};
// Animated Multi-Line Chart for comparing multiple data series
export const AnimatedMultiLineChart = ({ data, lines, title }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    // Animate data points one by one
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 150);
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {lines.map((line, index) => (
              <linearGradient key={`gradient-${line.dataKey}`} id={`gradient-${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
            tickLine={{ stroke: '#444' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#444' }}
            tickLine={{ stroke: '#444' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}
            labelStyle={{ color: '#00d4ff' }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={3}
              dot={{
                fill: line.color,
                strokeWidth: 2,
                r: 5,
                stroke: '#1a1a1a'
              }}
              activeDot={{
                r: 8,
                stroke: line.color,
                strokeWidth: 3,
                fill: '#1a1a1a',
                boxShadow: `0 0 10px ${line.color}`
              }}
              animationDuration={2000}
              animationBegin={index * 500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

  ;// Modern Radial Progress Chart for Performance Metrics
export const RadialProgressChart = ({ data, title }) => {
  const [progress, setProgress] = useState(data.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(data.map(item => item.value));
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const CircularProgress = ({ percentage, color, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#374151"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-2000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
              transition: 'stroke-dashoffset 2s ease-out'
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={percentage} suffix="%" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="flex justify-center items-center"
    >
      <div className="grid grid-cols-3 gap-8">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <CircularProgress
              percentage={progress[index]}
              color={item.color}
              size={120}
              strokeWidth={10}
            />
            <div className="mt-4 text-center">
              <div className="text-sm font-medium text-white">{item.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                {item.value >= 80 ? 'Excellent' : item.value >= 60 ? 'Good' : item.value >= 40 ? 'Fair' : 'Needs Work'}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Modern Area Chart with Gradient Fill
export const ModernAreaChart = ({ data, title, colors }) => {
  const [animatedData, setAnimatedData] = useState([]);

  useEffect(() => {
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => [...prev, item]);
      }, index * 200);
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            labelStyle={{ color: '#00d4ff' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00d4ff"
            strokeWidth={3}
            fill="url(#areaGradient)"
            dot={{
              fill: '#00d4ff',
              strokeWidth: 2,
              r: 6,
              stroke: '#111827'
            }}
            activeDot={{
              r: 8,
              stroke: '#00d4ff',
              strokeWidth: 3,
              fill: '#111827',
              filter: 'drop-shadow(0 0 8px #00d4ff)'
            }}
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Stylish Pie Chart with External Labels and Connector Lines
export const StylishPieChart = ({ data, colors, centerColor = '#1a1a1a', accentColor = '#00d4ff' }) => {
  const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, value: 0 })));

  useEffect(() => {
    if (data.length === 0) return;

    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const renderStylishLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage, name, index } = props;

    // Safety checks for undefined values
    if (!cx || !cy || midAngle === undefined || !outerRadius || !name || percentage === undefined || percentage === null || percentage < 2) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 40;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Determine if label should be on left or right
    const isRightSide = x > cx;
    
    // Calculate connector line points
    const startRadius = outerRadius + 8;
    const midRadius = outerRadius + 25;
    const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);
    const midX = cx + midRadius * Math.cos(-midAngle * RADIAN);
    const midY = cy + midRadius * Math.sin(-midAngle * RADIAN);
    
    const color = colors[index % colors.length];

    return (
      <g>
        {/* Connector line from pie to label */}
        <path
          d={`M${startX},${startY} Q${midX},${midY} ${x},${y}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.8"
          style={{
            filter: `drop-shadow(0 0 4px ${color}40)`
          }}
        />
        
        {/* Dot at the end of connector */}
        <circle
          cx={x}
          cy={y}
          r="4"
          fill={color}
          stroke={centerColor}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`
          }}
        />
        
        {/* Label background */}
        <rect
          x={isRightSide ? x + 10 : x - 80}
          y={y - 12}
          width="70"
          height="24"
          fill="rgba(0,0,0,0.8)"
          stroke={color}
          strokeWidth="1"
          rx="12"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
          }}
        />
        
        {/* Language name */}
        <text
          x={isRightSide ? x + 45 : x - 45}
          y={y - 2}
          fill={color}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
        >
          {name}
        </text>
        
        {/* Percentage */}
        <text
          x={isRightSide ? x + 45 : x - 45}
          y={y + 8}
          fill="#ffffff"
          textAnchor="middle"
          fontSize="10"
          fontWeight="500"
        >
          {`${(percentage || 0).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading language data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderStylishLabel}
            labelLine={false}
            animationBegin={0}
            animationDuration={2000}
            style={{ filter: 'url(#glow)' }}
          >
            {animatedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                stroke={centerColor}
                strokeWidth={2}
              />
            ))}
          </Pie>
          
          {/* Center circle with gradient */}
          <Pie
            data={[{ value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={58}
            fill={`url(#centerGradient-${accentColor.replace('#', '')})`}
            dataKey="value"
          />
          
          <defs>
            <radialGradient id={`centerGradient-${accentColor.replace('#', '')}`}>
              <stop offset="0%" stopColor={centerColor} />
              <stop offset="70%" stopColor={centerColor} />
              <stop offset="100%" stopColor={`${accentColor}20`} />
            </radialGradient>
          </defs>
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: `1px solid ${accentColor}`,
              borderRadius: '12px',
              color: '#fff',
              boxShadow: `0 10px 25px ${accentColor}20`
            }}
            formatter={(value, name) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {data.length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Languages
          </div>
        </div>
      </div>
    </motion.div>
  );
};