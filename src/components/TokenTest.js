import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { checkRateLimit } from '../services/trendingApi';

const TokenTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      // Test environment variables
      const token = process.env.REACT_APP_GITHUB_TOKEN?.replace(/['"]/g, '');
      console.log('🔍 Token Test - Environment:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 8),
        tokenEnd: token?.substring(token.length - 4)
      });

      // Test rate limit endpoint
      const rateLimit = await checkRateLimit();
      console.log('📊 Rate Limit Test:', rateLimit);

      // Test a simple API call
      const apiUrl = process.env.NODE_ENV === 'development' ? '/api/github/users/octocat' : 'https://api.github.com/users/octocat';
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // In development, proxy handles auth headers
          ...(process.env.NODE_ENV !== 'development' && {
            'User-Agent': 'GitHub-Profile-Explorer',
            ...(token && { 'Authorization': `token ${token}` })
          })
        }
      });

      const data = await response.json();
      console.log('🧪 API Test Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'GitHub API is working correctly!',
          details: {
            user: data.login,
            rateLimit: rateLimit,
            authenticated: !!token && rateLimit?.limit > 60
          }
        });
      } else {
        setTestResult({
          success: false,
          message: `API Error: ${response.status} ${response.statusText}`,
          details: {
            error: data.message,
            rateLimit: rateLimit
          }
        });
      }
    } catch (error) {
      console.error('❌ Token test failed:', error);
      setTestResult({
        success: false,
        message: 'Test failed: ' + error.message,
        details: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-dark-card border border-dark-border rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">GitHub Token Test</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={runTest}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Testing API access...</span>
          </div>
        )}

        {testResult && (
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{testResult.message}</span>
            </div>

            {testResult.details && (
              <div className="text-xs space-y-1">
                {testResult.details.user && (
                  <div className="text-gray-300">✅ User: {testResult.details.user}</div>
                )}
                {testResult.details.rateLimit && (
                  <div className="text-gray-300">
                    📊 Rate Limit: {testResult.details.rateLimit.remaining}/{testResult.details.rateLimit.limit}
                    {testResult.details.authenticated ? ' (Authenticated)' : ' (Unauthenticated)'}
                  </div>
                )}
                {testResult.details.error && (
                  <div className="text-red-400">❌ Error: {testResult.details.error}</div>
                )}
              </div>
            )}

            {!testResult.success && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                <div className="text-yellow-400 mb-1">💡 Troubleshooting:</div>
                <ul className="text-gray-300 space-y-1">
                  <li>• Make sure you restarted the dev server after adding the token</li>
                  <li>• Check that the token starts with 'ghp_' or 'github_pat_'</li>
                  <li>• Verify the token has the right permissions</li>
                  <li>• Check the browser console for detailed error logs</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TokenTest;