import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, GitFork, Code, Calendar, MapPin, Building, BarChart3, TrendingUp, Target, Zap, Award, Activity, Eye, Filter } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import LoadingSkeleton from './LoadingSkeleton';

const CompareMode = ({ onCompareSearch, compareData, loading, error }) => {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [activeComparisonTab, setActiveComparisonTab] = useState('overview');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username1.trim() && username2.trim()) {
      onCompareSearch(username1.trim(), username2.trim());
    }
  };

  // Advanced comparison analytics
  const comparisonAnalytics = useMemo(() => {
    if (!compareData.user1 || !compareData.user2) return null;

    const user1 = compareData.user1.profile;
    const user2 = compareData.user2.profile;
    const repos1 = compareData.user1.repos;
    const repos2 = compareData.user2.repos;

    // Calculate advanced metrics
    const metrics1 = {
      totalStars: repos1.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos1.reduce((sum, repo) => sum + repo.forks_count, 0),
      totalSize: repos1.reduce((sum, repo) => sum + (repo.size || 0), 0),
      avgStarsPerRepo: repos1.length > 0 ? repos1.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repos1.length : 0,
      avgForksPerRepo: repos1.length > 0 ? repos1.reduce((sum, repo) => sum + repo.forks_count, 0) / repos1.length : 0,
      topRepoStars: Math.max(...repos1.map(repo => repo.stargazers_count), 0),
      languageCount: new Set(repos1.filter(repo => repo.language).map(repo => repo.language)).size,
      accountAge: Math.floor((new Date() - new Date(user1.created_at)) / (1000 * 60 * 60 * 24 * 365)),
      followerToFollowingRatio: user1.following > 0 ? user1.followers / user1.following : user1.followers,
      repoActivity: repos1.filter(repo => {
        const lastUpdate = new Date(repo.updated_at);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return lastUpdate > oneYearAgo;
      }).length
    };

    const metrics2 = {
      totalStars: repos2.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos2.reduce((sum, repo) => sum + repo.forks_count, 0),
      totalSize: repos2.reduce((sum, repo) => sum + (repo.size || 0), 0),
      avgStarsPerRepo: repos2.length > 0 ? repos2.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repos2.length : 0,
      avgForksPerRepo: repos2.length > 0 ? repos2.reduce((sum, repo) => sum + repo.forks_count, 0) / repos2.length : 0,
      topRepoStars: Math.max(...repos2.map(repo => repo.stargazers_count), 0),
      languageCount: new Set(repos2.filter(repo => repo.language).map(repo => repo.language)).size,
      accountAge: Math.floor((new Date() - new Date(user2.created_at)) / (1000 * 60 * 60 * 24 * 365)),
      followerToFollowingRatio: user2.following > 0 ? user2.followers / user2.following : user2.followers,
      repoActivity: repos2.filter(repo => {
        const lastUpdate = new Date(repo.updated_at);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return lastUpdate > oneYearAgo;
      }).length
    };

    // Radar chart data
    const radarData = [
      {
        subject: 'Stars',
        user1: Math.min(metrics1.totalStars / 10, 100),
        user2: Math.min(metrics2.totalStars / 10, 100),
        fullMark: 100
      },
      {
        subject: 'Repos',
        user1: Math.min(user1.public_repos * 2, 100),
        user2: Math.min(user2.public_repos * 2, 100),
        fullMark: 100
      },
      {
        subject: 'Followers',
        user1: Math.min(user1.followers / 5, 100),
        user2: Math.min(user2.followers / 5, 100),
        fullMark: 100
      },
      {
        subject: 'Languages',
        user1: Math.min(metrics1.languageCount * 10, 100),
        user2: Math.min(metrics2.languageCount * 10, 100),
        fullMark: 100
      },
      {
        subject: 'Activity',
        user1: Math.min(metrics1.repoActivity * 5, 100),
        user2: Math.min(metrics2.repoActivity * 5, 100),
        fullMark: 100
      },
      {
        subject: 'Impact',
        user1: Math.min(metrics1.totalForks * 3, 100),
        user2: Math.min(metrics2.totalForks * 3, 100),
        fullMark: 100
      }
    ];

    // Performance comparison data
    const performanceData = [
      { metric: 'Total Stars', user1: metrics1.totalStars, user2: metrics2.totalStars },
      { metric: 'Total Forks', user1: metrics1.totalForks, user2: metrics2.totalForks },
      { metric: 'Public Repos', user1: user1.public_repos, user2: user2.public_repos },
      { metric: 'Followers', user1: user1.followers, user2: user2.followers },
      { metric: 'Following', user1: user1.following, user2: user2.following },
      { metric: 'Languages', user1: metrics1.languageCount, user2: metrics2.languageCount }
    ];

    // Language distribution comparison
    const getLanguageDistribution = (repos) => {
      const langCount = {};
      repos.forEach(repo => {
        if (repo.language) {
          langCount[repo.language] = (langCount[repo.language] || 0) + 1;
        }
      });
      return Object.entries(langCount)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    const languages1 = getLanguageDistribution(repos1);
    const languages2 = getLanguageDistribution(repos2);

    // Efficiency metrics
    const efficiency1 = {
      starsPerRepo: metrics1.avgStarsPerRepo,
      forksPerRepo: metrics1.avgForksPerRepo,
      starsPerFollower: user1.followers > 0 ? metrics1.totalStars / user1.followers : 0,
      repoPerYear: metrics1.accountAge > 0 ? user1.public_repos / metrics1.accountAge : 0
    };

    const efficiency2 = {
      starsPerRepo: metrics2.avgStarsPerRepo,
      forksPerRepo: metrics2.avgForksPerRepo,
      starsPerFollower: user2.followers > 0 ? metrics2.totalStars / user2.followers : 0,
      repoPerYear: metrics2.accountAge > 0 ? user2.public_repos / metrics2.accountAge : 0
    };

    return {
      metrics1,
      metrics2,
      radarData,
      performanceData,
      languages1,
      languages2,
      efficiency1,
      efficiency2,
      users: { user1, user2 },
      repos: { repos1, repos2 }
    };
  }, [compareData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ?
                (entry.value > 1000 ? (entry.value / 1000).toFixed(1) + 'k' : entry.value.toFixed(1))
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const UserComparisonCard = ({ user, repos, title, color }) => {
    const totalStars = repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
    const totalForks = repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: title === 'User 1' ? -50 : 50 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-dark-card border-2 rounded-2xl p-6 ${color}`}
      >
        <h3 className="text-xl font-bold text-white mb-6 text-center">{title}</h3>

        <div className="text-center mb-6">
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user.avatar_url}
            alt={user.name || user.login}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-current"
          />
          <h4 className="text-xl font-bold text-white">{user.name || user.login}</h4>
          <p className="text-current">@{user.login}</p>
        </div>

        {user.bio && (
          <p className="text-gray-300 text-sm mb-4 text-center line-clamp-3">
            {user.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{user.followers}</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{user.following}</div>
            <div className="text-xs text-gray-400">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{user.public_repos}</div>
            <div className="text-xs text-gray-400">Repos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalStars}</div>
            <div className="text-xs text-gray-400">Stars</div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>{user.company}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
        </div>

        {/* Top Repositories */}
        <div className="mt-6">
          <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Top Repositories
          </h5>
          <div className="space-y-2">
            {repos?.slice(0, 3).map((repo) => (
              <div key={repo.id} className="bg-dark-bg rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <h6 className="font-medium text-white text-sm truncate">
                    {repo.name}
                  </h6>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                </div>
                {repo.language && (
                  <span className="text-xs text-current">{repo.language}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-4">
            Compare GitHub Profiles
          </h2>
          <p className="text-gray-400 text-lg">
            Enter two GitHub usernames to compare their profiles side by side
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              placeholder="First GitHub username"
              className="px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
            />
            <input
              type="text"
              value={username2}
              onChange={(e) => setUsername2(e.target.value)}
              placeholder="Second GitHub username"
              className="px-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-xl font-medium hover:shadow-lg hover:shadow-neon-blue/25 transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Compare Profiles
          </motion.button>
        </motion.form>

        {loading && (
          <div className="grid md:grid-cols-2 gap-8">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {compareData.user1 && compareData.user2 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <UserComparisonCard
              user={compareData.user1.profile}
              repos={compareData.user1.repos}
              title="User 1"
              color="border-neon-blue text-neon-blue"
            />
            <UserComparisonCard
              user={compareData.user2.profile}
              repos={compareData.user2.repos}
              title="User 2"
              color="border-neon-purple text-neon-purple"
            />
          </motion.div>
        )}

        {compareData.user1 && compareData.user2 && !loading && comparisonAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 space-y-8"
          >
            {/* Comparison Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-dark-border">
              {[
                { key: 'overview', label: 'Overview', icon: '' },
                { key: 'performance', label: 'Performance', icon: '' },
                { key: 'languages', label: 'Languages', icon: '' },
                { key: 'efficiency', label: 'Efficiency', icon: '' }
              ].map(tab => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveComparisonTab(tab.key)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeComparisonTab === tab.key
                    ? 'bg-neon-blue text-black border-b-2 border-neon-blue'
                    : 'text-gray-400 hover:text-white hover:bg-dark-card'
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeComparisonTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Quick Stats Comparison */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
                      <BarChart3 className="w-6 h-6 text-neon-blue" />
                      Quick Comparison
                    </h3>

                    <div className="grid md:grid-cols-4 gap-6 text-center">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Followers</h4>
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${comparisonAnalytics.users.user1.followers > comparisonAnalytics.users.user2.followers ? 'text-neon-blue' : 'text-gray-400'}`}>
                            {comparisonAnalytics.users.user1.followers}
                          </div>
                          <div className={`text-lg font-bold ${comparisonAnalytics.users.user2.followers > comparisonAnalytics.users.user1.followers ? 'text-neon-purple' : 'text-gray-400'}`}>
                            {comparisonAnalytics.users.user2.followers}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Public Repos</h4>
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${comparisonAnalytics.users.user1.public_repos > comparisonAnalytics.users.user2.public_repos ? 'text-neon-blue' : 'text-gray-400'}`}>
                            {comparisonAnalytics.users.user1.public_repos}
                          </div>
                          <div className={`text-lg font-bold ${comparisonAnalytics.users.user2.public_repos > comparisonAnalytics.users.user1.public_repos ? 'text-neon-purple' : 'text-gray-400'}`}>
                            {comparisonAnalytics.users.user2.public_repos}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Total Stars</h4>
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${comparisonAnalytics.metrics1.totalStars > comparisonAnalytics.metrics2.totalStars ? 'text-neon-blue' : 'text-gray-400'}`}>
                            {comparisonAnalytics.metrics1.totalStars}
                          </div>
                          <div className={`text-lg font-bold ${comparisonAnalytics.metrics2.totalStars > comparisonAnalytics.metrics1.totalStars ? 'text-neon-purple' : 'text-gray-400'}`}>
                            {comparisonAnalytics.metrics2.totalStars}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Account Age</h4>
                        <div className="space-y-1">
                          <div className={`text-lg font-bold ${comparisonAnalytics.metrics1.accountAge > comparisonAnalytics.metrics2.accountAge ? 'text-neon-blue' : 'text-gray-400'}`}>
                            {comparisonAnalytics.metrics1.accountAge}y
                          </div>
                          <div className={`text-lg font-bold ${comparisonAnalytics.metrics2.accountAge > comparisonAnalytics.metrics1.accountAge ? 'text-neon-purple' : 'text-gray-400'}`}>
                            {comparisonAnalytics.metrics2.accountAge}y
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Radar Chart Comparison */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <Target className="w-5 h-5 text-neon-green" />
                      Developer Profile Comparison
                    </h3>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={comparisonAnalytics.radarData}>
                          <PolarGrid stroke="#333" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                            tickCount={5}
                          />
                          <Radar
                            name="User 1"
                            dataKey="user1"
                            stroke="#00d4ff"
                            fill="#00d4ff"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Radar
                            name="User 2"
                            dataKey="user2"
                            stroke="#a855f7"
                            fill="#a855f7"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neon-blue rounded-full" />
                        <span className="text-gray-300">{comparisonAnalytics.users.user1.login}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neon-purple rounded-full" />
                        <span className="text-gray-300">{comparisonAnalytics.users.user2.login}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeComparisonTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Performance Bar Chart */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-neon-blue" />
                      Performance Metrics
                    </h3>

                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparisonAnalytics.performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis
                            dataKey="metric"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a1a1a',
                              border: '1px solid #333',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="user1"
                            stroke="#00d4ff"
                            strokeWidth={3}
                            dot={{ fill: '#00d4ff', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#00d4ff', strokeWidth: 2, fill: '#00d4ff' }}
                            name={comparisonAnalytics.users.user1.login}
                          />
                          <Line
                            type="monotone"
                            dataKey="user2"
                            stroke="#a855f7"
                            strokeWidth={3}
                            dot={{ fill: '#a855f7', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#a855f7', strokeWidth: 2, fill: '#a855f7' }}
                            name={comparisonAnalytics.users.user2.login}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neon-blue rounded-full" />
                        <span className="text-gray-300">{comparisonAnalytics.users.user1.login}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-neon-purple rounded-full" />
                        <span className="text-gray-300">{comparisonAnalytics.users.user2.login}</span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Metrics Grid */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-neon-blue" />
                        {comparisonAnalytics.users.user1.login} Metrics
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Stars/Repo:</span>
                          <span className="text-neon-blue font-bold">{comparisonAnalytics.metrics1.avgStarsPerRepo.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Top Repo Stars:</span>
                          <span className="text-neon-blue font-bold">{comparisonAnalytics.metrics1.topRepoStars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Languages Used:</span>
                          <span className="text-neon-blue font-bold">{comparisonAnalytics.metrics1.languageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Repos (1Y):</span>
                          <span className="text-neon-blue font-bold">{comparisonAnalytics.metrics1.repoActivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Follower Ratio:</span>
                          <span className="text-neon-blue font-bold">{comparisonAnalytics.metrics1.followerToFollowingRatio.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-neon-purple" />
                        {comparisonAnalytics.users.user2.login} Metrics
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Stars/Repo:</span>
                          <span className="text-neon-purple font-bold">{comparisonAnalytics.metrics2.avgStarsPerRepo.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Top Repo Stars:</span>
                          <span className="text-neon-purple font-bold">{comparisonAnalytics.metrics2.topRepoStars}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Languages Used:</span>
                          <span className="text-neon-purple font-bold">{comparisonAnalytics.metrics2.languageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Repos (1Y):</span>
                          <span className="text-neon-purple font-bold">{comparisonAnalytics.metrics2.repoActivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Follower Ratio:</span>
                          <span className="text-neon-purple font-bold">{comparisonAnalytics.metrics2.followerToFollowingRatio.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeComparisonTab === 'languages' && (
                <motion.div
                  key="languages"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-neon-blue" />
                      {comparisonAnalytics.users.user1.login} Languages
                    </h3>
                    <div className="space-y-3">
                      {comparisonAnalytics.languages1.map((lang, index) => (
                        <div key={lang.language} className="flex items-center justify-between">
                          <span className="text-gray-300">{lang.language}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-dark-bg rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(lang.count / comparisonAnalytics.languages1[0].count) * 100}%` }}
                                transition={{ delay: index * 0.1 }}
                                className="h-2 bg-neon-blue rounded-full"
                              />
                            </div>
                            <span className="text-neon-blue font-bold text-sm">{lang.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-neon-purple" />
                      {comparisonAnalytics.users.user2.login} Languages
                    </h3>
                    <div className="space-y-3">
                      {comparisonAnalytics.languages2.map((lang, index) => (
                        <div key={lang.language} className="flex items-center justify-between">
                          <span className="text-gray-300">{lang.language}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-dark-bg rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(lang.count / comparisonAnalytics.languages2[0].count) * 100}%` }}
                                transition={{ delay: index * 0.1 }}
                                className="h-2 bg-neon-purple rounded-full"
                              />
                            </div>
                            <span className="text-neon-purple font-bold text-sm">{lang.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeComparisonTab === 'efficiency' && (
                <motion.div
                  key="efficiency"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Efficiency Comparison */}
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Efficiency Analysis
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-neon-blue">{comparisonAnalytics.users.user1.login}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stars per Repo:</span>
                            <span className="text-neon-blue font-bold">{comparisonAnalytics.efficiency1.starsPerRepo.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Forks per Repo:</span>
                            <span className="text-neon-blue font-bold">{comparisonAnalytics.efficiency1.forksPerRepo.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stars per Follower:</span>
                            <span className="text-neon-blue font-bold">{comparisonAnalytics.efficiency1.starsPerFollower.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Repos per Year:</span>
                            <span className="text-neon-blue font-bold">{comparisonAnalytics.efficiency1.repoPerYear.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-neon-purple">{comparisonAnalytics.users.user2.login}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stars per Repo:</span>
                            <span className="text-neon-purple font-bold">{comparisonAnalytics.efficiency2.starsPerRepo.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Forks per Repo:</span>
                            <span className="text-neon-purple font-bold">{comparisonAnalytics.efficiency2.forksPerRepo.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stars per Follower:</span>
                            <span className="text-neon-purple font-bold">{comparisonAnalytics.efficiency2.starsPerFollower.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Repos per Year:</span>
                            <span className="text-neon-purple font-bold">{comparisonAnalytics.efficiency2.repoPerYear.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winner Analysis */}
                  <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Comparison Summary
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Overall Impact</h4>
                        <div className="text-lg font-bold">
                          {comparisonAnalytics.metrics1.totalStars > comparisonAnalytics.metrics2.totalStars ? (
                            <span className="text-neon-blue">{comparisonAnalytics.users.user1.login} Wins</span>
                          ) : comparisonAnalytics.metrics2.totalStars > comparisonAnalytics.metrics1.totalStars ? (
                            <span className="text-neon-purple">{comparisonAnalytics.users.user2.login} Wins</span>
                          ) : (
                            <span className="text-gray-400">Tie</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Productivity</h4>
                        <div className="text-lg font-bold">
                          {comparisonAnalytics.efficiency1.repoPerYear > comparisonAnalytics.efficiency2.repoPerYear ? (
                            <span className="text-neon-blue">{comparisonAnalytics.users.user1.login} Wins</span>
                          ) : comparisonAnalytics.efficiency2.repoPerYear > comparisonAnalytics.efficiency1.repoPerYear ? (
                            <span className="text-neon-purple">{comparisonAnalytics.users.user2.login} Wins</span>
                          ) : (
                            <span className="text-gray-400">Tie</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Quality</h4>
                        <div className="text-lg font-bold">
                          {comparisonAnalytics.efficiency1.starsPerRepo > comparisonAnalytics.efficiency2.starsPerRepo ? (
                            <span className="text-neon-blue">{comparisonAnalytics.users.user1.login} Wins</span>
                          ) : comparisonAnalytics.efficiency2.starsPerRepo > comparisonAnalytics.efficiency1.starsPerRepo ? (
                            <span className="text-neon-purple">{comparisonAnalytics.users.user2.login} Wins</span>
                          ) : (
                            <span className="text-gray-400">Tie</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompareMode;