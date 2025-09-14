import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingScreen from './components/LandingScreen';
import SearchBar from './components/SearchBar';
import ProfileCard from './components/ProfileCard';
import RepositoriesSection from './components/RepositoriesSection';
import StatsVisualization from './components/StatsVisualization';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import ContributionHeatmap from './components/ContributionHeatmap';
import RepositoryTrends from './components/RepositoryTrends';
import CompareMode from './components/CompareMode';
import DiscoverSection from './components/DiscoverSection';
import RepositoryAnalysis from './components/RepositoryAnalysis';
import RepositoryComparison from './components/RepositoryComparison';
import GitHubApiStatus from './components/GitHubApiStatus';
import LoadingSkeleton from './components/LoadingSkeleton';
import { fetchGitHubUser, fetchUserRepos } from './services/githubApi';

function App() {
  const [userData, setUserData] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [discoverMode, setDiscoverMode] = useState(false);
  const [repoAnalysisMode, setRepoAnalysisMode] = useState(false);
  const [repoCompareMode, setRepoCompareMode] = useState(false);
  const [compareData, setCompareData] = useState({ user1: null, user2: null });
  const [activeTab, setActiveTab] = useState('overview');

  const handleSearch = async (username) => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setShowLanding(false);
    setActiveTab('overview'); // Reset to overview tab

    try {
      const [user, repos] = await Promise.all([
        fetchGitHubUser(username),
        fetchUserRepos(username)
      ]);

      setUserData(user);
      setUserRepos(repos);
    } catch (err) {
      setError(err.message);
      setUserData(null);
      setUserRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSearch = async (username1, username2) => {
    setLoading(true);
    setError(null);

    try {
      const [user1Data, user1Repos, user2Data, user2Repos] = await Promise.all([
        fetchGitHubUser(username1),
        fetchUserRepos(username1),
        fetchGitHubUser(username2),
        fetchUserRepos(username2)
      ]);

      setCompareData({
        user1: { profile: user1Data, repos: user1Repos },
        user2: { profile: user2Data, repos: user2Repos }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        discoverMode={discoverMode}
        setDiscoverMode={setDiscoverMode}
        repoAnalysisMode={repoAnalysisMode}
        setRepoAnalysisMode={setRepoAnalysisMode}
        repoCompareMode={repoCompareMode}
        setRepoCompareMode={setRepoCompareMode}
        onBackToHome={() => {
          setShowLanding(true);
          setUserData(null);
          setUserRepos([]);
          setCompareData({ user1: null, user2: null });
          setCompareMode(false);
          setDiscoverMode(false);
          setRepoAnalysisMode(false);
          setRepoCompareMode(false);
        }}
      />

      <AnimatePresence mode="wait">
        {showLanding && !compareMode && !discoverMode && !repoAnalysisMode && !repoCompareMode ? (
          <LandingScreen key="landing" onSearch={handleSearch} />
        ) : compareMode ? (
          <CompareMode
            key="compare"
            onCompareSearch={handleCompareSearch}
            compareData={compareData}
            loading={loading}
            error={error}
          />
        ) : discoverMode ? (
          <DiscoverSection key="discover" />
        ) : repoAnalysisMode ? (
          <RepositoryAnalysis key="repo-analysis" />
        ) : repoCompareMode ? (
          <RepositoryComparison key="repo-compare" />
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-6xl mx-auto">
              <SearchBar onSearch={handleSearch} />

              {loading && <LoadingSkeleton />}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 text-center"
                >
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}

              {userData && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-8"
                >
                  <ProfileCard user={userData} />

                  {/* Tab Navigation */}
                  <div className="flex flex-wrap gap-2 border-b border-dark-border">
                    {[
                      { key: 'overview', label: 'Overview', icon: '' },
                      { key: 'analytics', label: 'Advanced Analytics', icon: '' },
                      { key: 'activity', label: 'Activity', icon: '' },
                      { key: 'trends', label: 'Trends', icon: '' }
                    ].map(tab => (
                      <motion.button
                        key={tab.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-t-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
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
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid lg:grid-cols-2 gap-8"
                      >
                        <RepositoriesSection repos={userRepos} />
                        <StatsVisualization user={userData} repos={userRepos} />
                      </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <AdvancedAnalytics user={userData} repos={userRepos} />
                      </motion.div>
                    )}

                    {activeTab === 'activity' && (
                      <motion.div
                        key="activity"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <ContributionHeatmap repos={userRepos} />
                      </motion.div>
                    )}

                    {activeTab === 'trends' && (
                      <motion.div
                        key="trends"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <RepositoryTrends repos={userRepos} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* GitHub API Status Indicator */}
      <GitHubApiStatus />
    </div>
  );
}

export default App;