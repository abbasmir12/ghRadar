import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, GitFork, TrendingUp, Calendar, Users, Crown, Award, Flame, Clock, Filter, RefreshCw, Code } from 'lucide-react';
import { fetchTrendingRepositories, fetchTrendingDevelopers, fetchTopMaintainers, getPopularLanguages, getPopularLanguagesSync } from '../services/trendingApi';

const DiscoverSection = () => {
  const [activeDiscoverTab, setActiveDiscoverTab] = useState('repositories');
  const [timeFilter, setTimeFilter] = useState('week');
  const [languageFilter, setLanguageFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState(getPopularLanguagesSync());
  const [topData, setTopData] = useState({
    repositories: [],
    contributors: [],
    maintainers: []
  });

  // Fetch real data from GitHub Trending API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let repositories = [];
      let contributors = [];
      let maintainers = [];

      if (activeDiscoverTab === 'repositories') {
        repositories = await fetchTrendingRepositories(timeFilter, languageFilter, 30);
      } else if (activeDiscoverTab === 'contributors') {
        contributors = await fetchTrendingDevelopers(timeFilter, languageFilter, 20);
      } else if (activeDiscoverTab === 'maintainers') {
        maintainers = await fetchTopMaintainers(timeFilter, 20);
      }

      setTopData({
        repositories,
        contributors,
        maintainers
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trending data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load available languages on component mount
  const loadLanguages = async () => {
    try {
      const languages = await getPopularLanguages();
      setAvailableLanguages(languages);
    } catch (err) {
      console.warn('Failed to load languages, using fallback:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, languageFilter, activeDiscoverTab]);

  useEffect(() => {
    loadLanguages();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'Legendary': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'React Core': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'Prolific': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'Vue Creator': 'bg-gradient-to-r from-green-400 to-blue-500',
      'Google Dev': 'bg-gradient-to-r from-red-500 to-yellow-500'
    };
    return colors[badge] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Go: '#00ADD8',
      C: '#555555',
      Assembly: '#6E4C13',
      Shell: '#89e051',
      Ruby: '#701516',
      HTML: '#e34c26',
      CSS: '#1572B6',
      Vue: '#4FC08D',
      Swift: '#ffac45'
    };
    return colors[language] || '#8b949e';
  };

  const timeOptions = [
    { key: 'day', label: 'Today', icon: '📅' },
    { key: 'week', label: 'This Week', icon: '📊' },
    { key: 'month', label: 'This Month', icon: '📈' },
    { key: 'year', label: 'This Year', icon: '🏆' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-4">
            🌟 Discover GitHub
          </h2>
          <p className="text-gray-400 text-lg">
            Explore trending repositories, top contributors, and amazing maintainers
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { key: 'repositories', label: 'Top Repositories', icon: '🏆' },
              { key: 'contributors', label: 'Top Contributors', icon: '👑' },
              { key: 'maintainers', label: 'Top Maintainers', icon: '🛠️' }
            ].map(tab => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveDiscoverTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeDiscoverTab === tab.key
                    ? 'bg-neon-blue text-black'
                    : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Filters & Refresh */}
          <div className="flex items-center gap-4">
            {/* Language Filter (only for repositories) */}
            {activeDiscoverTab === 'repositories' && (
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-gray-400" />
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="px-3 py-1 bg-dark-card border border-dark-border rounded-lg text-white text-xs focus:outline-none focus:border-neon-blue"
                >
                  <option value="">All Languages</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1">
                {timeOptions.map(option => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeFilter(option.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeFilter === option.key
                        ? 'bg-neon-purple text-black'
                        : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={loading}
              className="p-2 bg-dark-card border border-dark-border rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-center"
          >
            <p className="text-red-400">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={refreshData}
              className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2" />
                      <div className="h-3 bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <>
              {activeDiscoverTab === 'repositories' && (
                <motion.div
                  key="repositories"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {topData.repositories.map((repo, index) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-dark-card border border-dark-border rounded-2xl p-6 card-hover group cursor-pointer"
                    >
                      {/* Rank Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-neon-blue text-black'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {repo.trend}
                        </div>
                      </div>

                      {/* Repository Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-10 h-10 rounded-full border-2 border-neon-blue/30"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-neon-blue transition-colors">
                            {repo.owner.login}/{repo.name}
                          </h3>
                          <span className="text-xs text-neon-purple bg-neon-purple/10 px-2 py-1 rounded-full">
                            {repo.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {repo.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span>{repo.stargazers_count > 1000 ? `${(repo.stargazers_count / 1000).toFixed(1)}k` : repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <GitFork className="w-4 h-4" />
                            <span>{repo.forks_count > 1000 ? `${(repo.forks_count / 1000).toFixed(1)}k` : repo.forks_count}</span>
                          </div>
                        </div>
                        {repo.language && (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            <span className="text-gray-400">{repo.language}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeDiscoverTab === 'contributors' && (
                <motion.div
                  key="contributors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {topData.contributors.map((contributor, index) => (
                    <motion.div
                      key={contributor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-dark-card border border-dark-border rounded-2xl p-6 card-hover group cursor-pointer"
                    >
                      {/* Rank & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-neon-blue text-black'
                        }`}>
                          {index + 1}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getBadgeColor(contributor.badge)}`}>
                          {contributor.badge}
                        </div>
                      </div>

                      {/* Contributor Info */}
                      <div className="text-center mb-4">
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.name || contributor.login}
                          className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-neon-blue/30 group-hover:border-neon-blue/60 transition-colors"
                        />
                        <h3 className="text-lg font-bold text-white group-hover:text-neon-blue transition-colors">
                          {contributor.name || contributor.login}
                        </h3>
                        <p className="text-neon-blue">@{contributor.login}</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-green">{contributor.contributions?.toLocaleString() || 'N/A'}</div>
                          <div className="text-gray-400 text-xs">Contributions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-purple">{contributor.public_repos || contributor.repositories?.length || 'N/A'}</div>
                          <div className="text-gray-400 text-xs">Repositories</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {contributor.followers > 0 ? 
                              (contributor.followers > 1000 ? `${(contributor.followers / 1000).toFixed(1)}k` : contributor.followers) 
                              : 'N/A'
                            }
                          </div>
                          <div className="text-gray-400 text-xs">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{contributor.topRepo || 'N/A'}</div>
                          <div className="text-gray-400 text-xs">Top Repo</div>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-wrap gap-1">
                        {(contributor.languages || []).slice(0, 3).map(lang => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-dark-bg rounded-full text-xs text-gray-300 border border-dark-border"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeDiscoverTab === 'maintainers' && (
                <motion.div
                  key="maintainers"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {topData.maintainers.map((maintainer, index) => (
                    <motion.div
                      key={maintainer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-dark-card border border-dark-border rounded-2xl p-6 card-hover group cursor-pointer"
                    >
                      {/* Rank & Response Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-neon-blue text-black'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {maintainer.responseTime}
                        </div>
                      </div>

                      {/* Maintainer Info */}
                      <div className="text-center mb-4">
                        <img
                          src={maintainer.avatar_url}
                          alt={maintainer.name || maintainer.login}
                          className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-neon-purple/30 group-hover:border-neon-purple/60 transition-colors"
                        />
                        <h3 className="text-lg font-bold text-white group-hover:text-neon-purple transition-colors">
                          {maintainer.name || maintainer.login}
                        </h3>
                        <p className="text-neon-purple">@{maintainer.login}</p>
                        <p className="text-gray-400 text-sm mt-1">{maintainer.topProject}</p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-blue">{maintainer.maintainedRepos || 0}</div>
                          <div className="text-gray-400 text-xs">Maintained</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {maintainer.totalStars > 1000 ? `${(maintainer.totalStars / 1000).toFixed(1)}k` : maintainer.totalStars || 0}
                          </div>
                          <div className="text-gray-400 text-xs">Total Stars</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-400">{maintainer.activeIssues || 0}</div>
                          <div className="text-gray-400 text-xs">Issues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{maintainer.mergedPRs || 0}</div>
                          <div className="text-gray-400 text-xs">Merged PRs</div>
                        </div>
                      </div>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1">
                        {(maintainer.expertise || []).slice(0, 2).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-neon-purple/10 text-neon-purple rounded-full text-xs border border-neon-purple/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiscoverSection;