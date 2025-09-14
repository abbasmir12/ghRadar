import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Key, ExternalLink } from 'lucide-react';
import { checkRateLimit } from '../services/trendingApi';

const GitHubApiStatus = () => {
  const [rateLimit, setRateLimit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const status = await checkRateLimit();
      setRateLimit(status);
      setLoading(false);
    };

    checkStatus();
    // Check every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !rateLimit) {
    return null;
  }

  const getStatusColor = () => {
    if (!rateLimit.hasToken) return 'text-yellow-400';
    if (rateLimit.remaining < 100) return 'text-red-400';
    if (rateLimit.remaining < 500) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (!rateLimit.hasToken) return <Key className="w-4 h-4" />;
    if (rateLimit.remaining < 100) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusMessage = () => {
    if (!rateLimit.hasToken) {
      return 'No GitHub token - Limited to 60 requests/hour';
    }
    return `${rateLimit.remaining}/${rateLimit.limit} requests remaining`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-card border border-dark-border rounded-lg shadow-lg"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-2 px-3 py-2 text-sm ${getStatusColor()}`}
        >
          {getStatusIcon()}
          <span>API Status</span>
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-dark-border p-3 text-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getStatusColor()}>{getStatusMessage()}</span>
                </div>
                
                {rateLimit.hasToken && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Reset:</span>
                    <span className="text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {!rateLimit.hasToken && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <p className="text-yellow-400 text-xs mb-2">
                      Add a GitHub token to increase rate limits to 5,000/hour
                    </p>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neon-blue hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Create Token
                    </a>
                  </div>
                )}

                {rateLimit.hasToken && rateLimit.remaining < 100 && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="text-red-400 text-xs">
                      Rate limit running low. Consider reducing API calls or wait for reset.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GitHubApiStatus;