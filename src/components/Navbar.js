import React from 'react';
import { motion } from 'framer-motion';
import { Github, GitCompare, Home, Compass, Search, BarChart3 } from 'lucide-react';

const Navbar = ({ 
  compareMode, 
  setCompareMode, 
  discoverMode, 
  setDiscoverMode, 
  repoAnalysisMode, 
  setRepoAnalysisMode,
  repoCompareMode,
  setRepoCompareMode,
  onBackToHome 
}) => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-dark-card/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={onBackToHome}
          >
            <div className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
              <Github className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              GitHub Profile Explorer
            </h1>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToHome}
              className="flex items-center space-x-2 px-3 py-2 bg-dark-card border border-dark-border rounded-lg hover:border-neon-blue transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDiscoverMode(!discoverMode);
                setCompareMode(false);
                setRepoAnalysisMode(false);
                setRepoCompareMode(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                discoverMode
                  ? 'bg-neon-green text-black'
                  : 'bg-dark-card border border-dark-border hover:border-neon-green'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCompareMode(!compareMode);
                setDiscoverMode(false);
                setRepoAnalysisMode(false);
                setRepoCompareMode(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                compareMode
                  ? 'bg-neon-blue text-black'
                  : 'bg-dark-card border border-dark-border hover:border-neon-blue'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRepoAnalysisMode(!repoAnalysisMode);
                setCompareMode(false);
                setDiscoverMode(false);
                setRepoCompareMode(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                repoAnalysisMode
                  ? 'bg-neon-purple text-black'
                  : 'bg-dark-card border border-dark-border hover:border-neon-purple'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Repo Analysis</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setRepoCompareMode(!repoCompareMode);
                setCompareMode(false);
                setDiscoverMode(false);
                setRepoAnalysisMode(false);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                repoCompareMode
                  ? 'bg-yellow-500 text-black'
                  : 'bg-dark-card border border-dark-border hover:border-yellow-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Repo Compare</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;