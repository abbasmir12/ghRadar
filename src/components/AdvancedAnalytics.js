import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, TrendingUp, Calendar, Clock, Award, Zap, Target, BarChart3 } from 'lucide-react';

const AdvancedAnalytics = ({ user, repos }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalStars: 0,
    totalForks: 0,
    avgStarsPerRepo: 0,
    totalSize: 0
  });

  // Calculate advanced metrics
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalSize = repos.reduce((sum, repo) => sum + (repo.size || 0), 0);
  const avgStarsPerRepo = repos.length > 0 ? (totalStars / repos.length).toFixed(1) : 0;
  const avgForksPerRepo = repos.length > 0 ? (totalForks / repos.length).toFixed(1) : 0;
  
  // Performance metrics
  const topPerformers = repos
    .filter(repo => repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  // Activity timeline (mock data based on repo creation dates)
  const activityData = repos
    .map(repo => ({
      year: new Date(repo.created_at).getFullYear(),
      repos: 1,
      stars: repo.stargazers_count
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.year === curr.year);
      if (existing) {
        existing.repos += 1;
        existing.stars += curr.stars;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [])
    .sort((a, b) => a.year - b.year);

  // Developer profile radar data
  const radarData = [
    { subject: 'Stars', A: Math.min(totalStars / 10, 100), fullMark: 100 },
    { subject: 'Repos', A: Math.min(user.public_repos * 2, 100), fullMark: 100 },
    { subject: 'Followers', A: Math.min(user.followers / 5, 100), fullMark: 100 },
    { subject: 'Following', A: Math.min(user.following / 2, 100), fullMark: 100 },
    { subject: 'Activity', A: Math.min(repos.length * 5, 100), fullMark: 100 },
    { subject: 'Impact', A: Math.min(totalForks * 3, 100), fullMark: 100 }
  ];

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedStats({
        totalStars: Math.floor(totalStars * easeOutQuart),
        totalForks: Math.floor(totalForks * easeOutQuart),
        avgStarsPerRepo: (avgStarsPerRepo * easeOutQuart).toFixed(1),
        totalSize: Math.floor(totalSize * easeOutQuart)
      });
      
      currentStep++;
      if (currentStep > steps) {
        clearInterval(interval);
        setAnimatedStats({
          totalStars,
          totalForks,
          avgStarsPerRepo,
          totalSize
        });
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [totalStars, totalForks, avgStarsPerRepo, totalSize]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 border border-neon-blue/30 rounded-xl p-4 text-center"
        >
          <Activity className="w-6 h-6 text-neon-blue mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{animatedStats.totalStars}</div>
          <div className="text-xs text-gray-400">Total Stars</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 border border-neon-purple/30 rounded-xl p-4 text-center"
        >
          <TrendingUp className="w-6 h-6 text-neon-purple mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{animatedStats.avgStarsPerRepo}</div>
          <div className="text-xs text-gray-400">Avg Stars/Repo</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/30 rounded-xl p-4 text-center"
        >
          <Award className="w-6 h-6 text-neon-green mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{animatedStats.totalForks}</div>
          <div className="text-xs text-gray-400">Total Forks</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 text-center"
        >
          <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{(animatedStats.totalSize / 1024).toFixed(1)}MB</div>
          <div className="text-xs text-gray-400">Total Code Size</div>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      {activityData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-neon-blue" />
            Activity Timeline
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorRepos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="repos"
                  stackId="1"
                  stroke="#00d4ff"
                  fillOpacity={1}
                  fill="url(#colorRepos)"
                />
                <Area
                  type="monotone"
                  dataKey="stars"
                  stackId="2"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorStars)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Developer Profile Radar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-card border border-dark-border rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-neon-green" />
          Developer Profile Analysis
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                name="Profile"
                dataKey="A"
                stroke="#00d4ff"
                fill="#00d4ff"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
            Top Performing Repositories
          </h3>
          
          <div className="space-y-3">
            {topPerformers.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-neon-blue text-black'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{repo.name}</h4>
                    <p className="text-gray-400 text-sm">{repo.language || 'No language'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neon-blue font-bold">{repo.stargazers_count} ⭐</div>
                  <div className="text-gray-400 text-sm">{repo.forks_count} forks</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-neon-purple" />
          Performance Insights
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Repository Quality Score:</span>
              <span className="text-neon-blue font-bold">
                {Math.min(Math.round((totalStars / repos.length) * 10), 100)}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Community Engagement:</span>
              <span className="text-neon-green font-bold">
                {totalForks > totalStars * 0.1 ? 'High' : totalForks > totalStars * 0.05 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Repo Size:</span>
              <span className="text-yellow-500 font-bold">
                {repos.length > 0 ? (totalSize / repos.length / 1024).toFixed(1) : 0}MB
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Most Used Language:</span>
              <span className="text-neon-purple font-bold">
                {(() => {
                  const languageCounts = repos.reduce((acc, repo) => {
                    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
                    return acc;
                  }, {});
                  const topLanguage = Object.entries(languageCounts).sort(([,a], [,b]) => b - a)[0];
                  return topLanguage ? topLanguage[0] : 'N/A';
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Productivity Level:</span>
              <span className="text-neon-blue font-bold">
                {repos.length > 20 ? 'Very High' : repos.length > 10 ? 'High' : repos.length > 5 ? 'Medium' : 'Growing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Open Source Impact:</span>
              <span className="text-neon-green font-bold">
                {totalStars > 100 ? 'Significant' : totalStars > 50 ? 'Moderate' : totalStars > 10 ? 'Growing' : 'Starting'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedAnalytics;