import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Star, GitFork, Eye, Calendar, Filter, BarChart2 } from 'lucide-react';

const RepositoryTrends = ({ repos }) => {
  const [selectedMetric, setSelectedMetric] = useState('stars');
  const [timeFilter, setTimeFilter] = useState('all');

  // Process repository data for trends
  const processedRepos = repos.map(repo => ({
    ...repo,
    createdYear: new Date(repo.created_at).getFullYear(),
    updatedYear: new Date(repo.updated_at).getFullYear(),
    ageInDays: Math.floor((new Date() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24)),
    starsPerDay: repo.stargazers_count / Math.max(Math.floor((new Date() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24)), 1),
    efficiency: repo.stargazers_count / Math.max(repo.size || 1, 1) * 1000 // Stars per KB
  }));

  // Filter repos based on time filter
  const filteredRepos = processedRepos.filter(repo => {
    if (timeFilter === 'recent') return repo.ageInDays <= 365;
    if (timeFilter === 'mature') return repo.ageInDays > 365;
    return true;
  });

  // Trend data for line chart
  const trendData = filteredRepos
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((repo, index) => ({
      index: index + 1,
      name: repo.name.length > 8 ? repo.name.substring(0, 8) + '...' : repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      size: repo.size || 0,
      efficiency: repo.efficiency,
      starsPerDay: repo.starsPerDay
    }));

  // Scatter plot data for repository analysis
  const scatterData = filteredRepos.map(repo => ({
    x: repo.size || 1,
    y: repo.stargazers_count,
    z: repo.forks_count,
    name: repo.name,
    language: repo.language
  }));

  // Repository performance categories
  const performanceCategories = {
    rising: filteredRepos.filter(repo => repo.starsPerDay > 0.1).length,
    stable: filteredRepos.filter(repo => repo.starsPerDay <= 0.1 && repo.starsPerDay > 0.01).length,
    dormant: filteredRepos.filter(repo => repo.starsPerDay <= 0.01).length
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-neon-blue">Size: {data.x} KB</p>
          <p className="text-neon-purple">Stars: {data.y}</p>
          <p className="text-neon-green">Forks: {data.z}</p>
          {data.language && <p className="text-gray-400">Language: {data.language}</p>}
        </div>
      );
    }
    return null;
  };

  const metricOptions = [
    { key: 'stars', label: 'Stars', color: '#00d4ff', icon: Star },
    { key: 'forks', label: 'Forks', color: '#a855f7', icon: GitFork },
    { key: 'efficiency', label: 'Efficiency', color: '#00ff88', icon: TrendingUp },
    { key: 'starsPerDay', label: 'Growth Rate', color: '#ffd93d', icon: BarChart2 }
  ];

  const timeOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'recent', label: 'Recent (1Y)' },
    { key: 'mature', label: 'Mature (1Y+)' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Performance Overview */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-neon-blue" />
          Repository Performance Trends
        </h3>

        {/* Performance Categories */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4 text-center"
          >
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{performanceCategories.rising}</div>
            <div className="text-xs text-gray-400">Rising Stars</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 text-center"
          >
            <Star className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{performanceCategories.stable}</div>
            <div className="text-xs text-gray-400">Stable Repos</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-500/20 to-gray-500/5 border border-gray-500/30 rounded-xl p-4 text-center"
          >
            <Eye className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{performanceCategories.dormant}</div>
            <div className="text-xs text-gray-400">Dormant</div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Metric:</span>
            <div className="flex gap-1">
              {metricOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMetric(option.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      selectedMetric === option.key
                        ? 'bg-neon-blue text-black'
                        : 'bg-dark-bg text-gray-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-3 h-3" />
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Period:</span>
            <div className="flex gap-1">
              {timeOptions.map(option => (
                <motion.button
                  key={option.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeFilter(option.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    timeFilter === option.key
                      ? 'bg-neon-purple text-black'
                      : 'bg-dark-bg text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMetric + timeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={metricOptions.find(m => m.key === selectedMetric)?.color || '#00d4ff'}
                  strokeWidth={3}
                  dot={{ fill: metricOptions.find(m => m.key === selectedMetric)?.color || '#00d4ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metricOptions.find(m => m.key === selectedMetric)?.color || '#00d4ff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Repository Size vs Stars Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-card border border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-neon-purple" />
          Repository Efficiency Analysis
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Relationship between repository size and popularity (stars)
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="x" 
                name="Size (KB)" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{ value: 'Repository Size (KB)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9ca3af' } }}
              />
              <YAxis 
                dataKey="y" 
                name="Stars" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{ value: 'Stars', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                dataKey="y" 
                fill="#00d4ff" 
                fillOpacity={0.7}
                stroke="#00d4ff"
                strokeWidth={1}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Insights */}
        <div className="mt-4 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-xl">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Most Efficient:</span>
              <div className="text-neon-blue font-medium">
                {processedRepos.sort((a, b) => b.efficiency - a.efficiency)[0]?.name || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Fastest Growing:</span>
              <div className="text-neon-purple font-medium">
                {processedRepos.sort((a, b) => b.starsPerDay - a.starsPerDay)[0]?.name || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Average Efficiency:</span>
              <div className="text-neon-green font-medium">
                {(processedRepos.reduce((sum, repo) => sum + repo.efficiency, 0) / processedRepos.length).toFixed(2)} stars/KB
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RepositoryTrends;