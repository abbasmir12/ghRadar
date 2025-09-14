import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Code2, Star, Users } from 'lucide-react';
import { getTopLanguages } from '../services/githubApi';

const StatsVisualization = ({ user, repos }) => {
  const languageData = getTopLanguages(repos);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  const colors = ['#00d4ff', '#a855f7', '#00ff88', '#ff6b6b', '#ffd93d', '#6bcf7f'];
  
  // Calculate percentages for language data
  const totalRepos = languageData.reduce((sum, lang) => sum + lang.count, 0);
  const languageDataWithPercentage = languageData.map(lang => ({
    ...lang,
    percentage: ((lang.count / totalRepos) * 100).toFixed(1)
  }));
  
  const repoStatsData = repos.slice(0, 8).map(repo => ({
    name: repo.name.length > 10 ? repo.name.substring(0, 10) + '...' : repo.name,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.payload.language}</p>
          <p style={{ color: data.payload.fill }}>
            Repositories: {data.value} ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function with connector lines
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, language, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30; // Distance from pie edge
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Line start point (edge of pie)
    const lineStartRadius = outerRadius + 5;
    const lineStartX = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
    const lineStartY = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
    
    // Line end point (before text)
    const lineEndRadius = outerRadius + 25;
    const lineEndX = cx + lineEndRadius * Math.cos(-midAngle * RADIAN);
    const lineEndY = cy + lineEndRadius * Math.sin(-midAngle * RADIAN);
    
    const shouldShowLabel = parseFloat(percentage) > 2; // Show labels for slices > 2%
    
    if (!shouldShowLabel) return null;

    return (
      <g>
        {/* Connector line */}
        <line
          x1={lineStartX}
          y1={lineStartY}
          x2={lineEndX}
          y2={lineEndY}
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.8"
        />
        {/* Percentage label */}
        <text 
          x={x} 
          y={y} 
          fill="#ffffff" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {`${percentage}%`}
        </text>
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-neon-green" />
          Statistics Overview
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border border-neon-blue/30 rounded-xl p-4 text-center"
          >
            <Star className="w-8 h-8 text-neon-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalStars}</div>
            <div className="text-sm text-gray-400">Total Stars</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border border-neon-purple/30 rounded-xl p-4 text-center"
          >
            <Users className="w-8 h-8 text-neon-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalForks}</div>
            <div className="text-sm text-gray-400">Total Forks</div>
          </motion.div>
        </div>
      </div>

      {/* Language Distribution */}
      {languageData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Code2 className="w-5 h-5 text-neon-purple" />
            Language Distribution
          </h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="count"
                  nameKey="language"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {languageDataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {languageDataWithPercentage.map((lang, index) => (
              <div key={lang.language} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-gray-300">{lang.language}</span>
                <span className="text-gray-500">({lang.count}) {lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repository Performance */}
      {repoStatsData.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-neon-green" />
            Top Repositories Performance
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stars" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="forks" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neon-blue rounded-full" />
              <span className="text-gray-300">Stars</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neon-purple rounded-full" />
              <span className="text-gray-300">Forks</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatsVisualization;