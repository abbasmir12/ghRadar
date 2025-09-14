import axios from 'axios';

const TRENDING_API_BASE = 'https://github-trending-api.up.railway.app';
const GITHUB_API_BASE = process.env.NODE_ENV === 'development' ? '/api/github' : 'https://api.github.com';

// Create axios instance for trending API
const trendingApi = axios.create({
  baseURL: TRENDING_API_BASE,
  timeout: 15000,
});

// Get GitHub token from environment variables
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN?.replace(/['"]/g, ''); // Remove quotes if present
const DEBUG_API = process.env.REACT_APP_DEBUG_API === 'true';

// Debug environment variables
console.log('🔍 Environment Debug:', {
  rawToken: process.env.REACT_APP_GITHUB_TOKEN,
  cleanToken: GITHUB_TOKEN,
  hasToken: !!GITHUB_TOKEN,
  tokenLength: GITHUB_TOKEN?.length,
  debugMode: DEBUG_API
});

// Create axios instance for GitHub API (for additional user details)
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE,
  timeout: 10000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    // Don't set User-Agent and Authorization here in development - proxy will handle it
    ...(process.env.NODE_ENV !== 'development' && {
      'User-Agent': 'GitHub-Profile-Explorer',
      ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
    })
  }
});

// Log token status on initialization
console.log('🔑 GitHub API Configuration:', {
  hasToken: !!GITHUB_TOKEN,
  tokenPreview: GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 8)}...${GITHUB_TOKEN.substring(GITHUB_TOKEN.length - 4)}` : 'none',
  rateLimit: GITHUB_TOKEN ? '5,000 requests/hour' : '60 requests/hour',
  headers: githubApi.defaults.headers
});

// Helper function to map our time periods to API format
const mapTimePeriod = (period) => {
  const mapping = {
    day: 'daily',
    week: 'weekly', 
    month: 'monthly',
    year: 'monthly' // API doesn't support yearly, fallback to monthly
  };
  return mapping[period] || 'weekly';
};

// Fetch trending repositories
export const fetchTrendingRepositories = async (period = 'week', language = '', limit = 30) => {
  try {
    const since = mapTimePeriod(period);
    
    const params = {
      since,
    };
    
    // Add language filter if specified
    if (language) {
      params.language = language.toLowerCase();
    }
    
    const response = await trendingApi.get('/repositories', { params });
    
    // Transform the data to match our expected format
    return response.data.slice(0, limit).map(repo => ({
      id: `${repo.author}/${repo.name}`,
      name: repo.name,
      full_name: `${repo.author}/${repo.name}`,
      owner: {
        login: repo.author,
        avatar_url: repo.avatar,
      },
      description: repo.description,
      html_url: repo.url,
      stargazers_count: repo.stars,
      forks_count: repo.forks,
      language: repo.language,
      languageColor: repo.languageColor,
      topics: [], // Not provided by trending API
      created_at: new Date().toISOString(), // Not provided, use current date
      updated_at: new Date().toISOString(), // Not provided, use current date
      trend: `+${repo.currentPeriodStars}`,
      category: categorizeRepository(repo),
      builtBy: repo.builtBy || []
    }));
  } catch (error) {
    console.error('Error fetching trending repositories:', error);
    throw new Error('Failed to fetch trending repositories. Please try again.');
  }
};

// Retry function for API calls
const retryApiCall = async (apiCall, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait longer for rate limit errors
      const waitTime = error.response?.status === 403 ? 2000 : 1000;
      console.log(`API call failed (attempt ${attempt}), retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Check GitHub API rate limit status
export const checkRateLimit = async () => {
  try {
    const response = await githubApi.get('/rate_limit');
    const { rate } = response.data;
    
    if (DEBUG_API) {
      console.log('GitHub API Rate Limit Status:', {
        limit: rate.limit,
        remaining: rate.remaining,
        reset: new Date(rate.reset * 1000).toLocaleTimeString(),
        hasToken: !!GITHUB_TOKEN
      });
    }
    
    return {
      limit: rate.limit,
      remaining: rate.remaining,
      reset: rate.reset,
      hasToken: !!GITHUB_TOKEN
    };
  } catch (error) {
    console.error('Failed to check rate limit:', error.message);
    return null;
  }
};

// Test function to verify GitHub API access
const testGitHubAPI = async () => {
  try {
    console.log('🧪 Testing GitHub API access...');
    
    // Check rate limit first
    const rateLimitInfo = await checkRateLimit();
    console.log('📊 Rate limit info:', rateLimitInfo);
    
    const response = await githubApi.get('/users/octocat');
    console.log('✅ GitHub API test successful:', {
      user: response.data.login,
      followers: response.data.followers,
      rateLimit: rateLimitInfo,
      responseHeaders: {
        'x-ratelimit-limit': response.headers['x-ratelimit-limit'],
        'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': response.headers['x-ratelimit-reset']
      }
    });
    
    // Warn if rate limit is low
    if (rateLimitInfo && rateLimitInfo.remaining < 10) {
      console.warn(`⚠️ Low rate limit remaining: ${rateLimitInfo.remaining}/${rateLimitInfo.limit}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ GitHub API test failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      headers: error.response?.headers,
      data: error.response?.data
    });
    
    // Provide helpful error messages
    if (error.response?.status === 401) {
      console.error('❌ Invalid GitHub token. Please check your REACT_APP_GITHUB_TOKEN in .env file');
      console.error('Token being used:', GITHUB_TOKEN ? `${GITHUB_TOKEN.substring(0, 8)}...` : 'none');
    } else if (error.response?.status === 403) {
      console.error('❌ Rate limit exceeded or token lacks permissions');
      console.error('Rate limit headers:', {
        limit: error.response?.headers['x-ratelimit-limit'],
        remaining: error.response?.headers['x-ratelimit-remaining'],
        reset: error.response?.headers['x-ratelimit-reset']
      });
    }
    
    return false;
  }
};

// Fetch trending developers
export const fetchTrendingDevelopers = async (period = 'week', language = '', limit = 20) => {
  try {
    // Test GitHub API first
    const apiWorking = await testGitHubAPI();
    if (!apiWorking) {
      console.warn('GitHub API not accessible, will return basic data only');
    }
    
    const since = mapTimePeriod(period);
    
    const params = {
      since,
    };
    
    // Add language filter if specified
    if (language) {
      params.language = language.toLowerCase();
    }
    
    console.log('Fetching trending developers with params:', params);
    const response = await trendingApi.get('/developers', { params });
    console.log(`Received ${response.data.length} developers from trending API`);
    
    // Get additional details for each developer from GitHub API
    const developersWithDetails = [];
    
    // Process developers in smaller batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < Math.min(response.data.length, limit); i += batchSize) {
      const batch = response.data.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (dev) => {
          try {
            console.log(`Fetching details for developer: ${dev.username}`);
            
            // Get detailed user info from GitHub API with retry logic
            const userResponse = await retryApiCall(() => githubApi.get(`/users/${dev.username}`));
            const userReposResponse = await retryApiCall(() => 
              githubApi.get(`/users/${dev.username}/repos`, {
                params: { sort: 'stars', direction: 'desc', per_page: 10 }
              })
            );

            const userDetails = userResponse.data;
            const userRepos = userReposResponse.data;
            const totalStars = userRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            const languages = [...new Set(userRepos.filter(repo => repo.language).map(repo => repo.language))].slice(0, 5);
            
            console.log(`Successfully fetched details for ${dev.username}:`, {
              followers: userDetails.followers,
              public_repos: userDetails.public_repos,
              totalStars
            });
            
            return {
              id: userDetails.id,
              login: dev.username,
              name: dev.name || userDetails.name || dev.username,
              avatar_url: dev.avatar,
              html_url: dev.url,
              type: dev.type,
              followers: userDetails.followers || 0,
              following: userDetails.following || 0,
              public_repos: userDetails.public_repos || 0,
              created_at: userDetails.created_at,
              bio: userDetails.bio,
              location: userDetails.location,
              company: userDetails.company,
              blog: userDetails.blog,
              // Additional computed fields
              repositories: userRepos,
              totalStars,
              topRepo: dev.repo?.name || userRepos[0]?.name || 'N/A',
              topRepoDescription: dev.repo?.description || userRepos[0]?.description || '',
              topRepoUrl: dev.repo?.url || userRepos[0]?.html_url || '',
              languages,
              badge: generateBadge(userDetails, userRepos),
              contributions: estimateContributions(userRepos, period)
            };
          } catch (err) {
            console.error(`Failed to fetch details for developer ${dev.username}:`, err.response?.status, err.response?.statusText);
            
            // Return basic info from trending API if GitHub API fails
            return {
              id: dev.username,
              login: dev.username,
              name: dev.name || dev.username,
              avatar_url: dev.avatar,
              html_url: dev.url,
              type: dev.type,
              followers: 0,
              following: 0,
              public_repos: 0,
              totalStars: 0,
              topRepo: dev.repo?.name || 'N/A',
              topRepoDescription: dev.repo?.description || '',
              topRepoUrl: dev.repo?.url || '',
              languages: [],
              badge: 'Developer',
              contributions: 0
            };
          }
        })
      );
      
      developersWithDetails.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < Math.min(response.data.length, limit)) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const validDevelopers = developersWithDetails.filter(dev => dev !== null);
    console.log(`Successfully processed ${validDevelopers.length} developers`);
    return validDevelopers;
  } catch (error) {
    console.error('Error fetching trending developers:', error);
    throw new Error('Failed to fetch trending developers. Please try again.');
  }
};

// Fetch top maintainers (users with high activity in popular repos)
export const fetchTopMaintainers = async (period = 'week', limit = 20) => {
  try {
    // First get trending repos to find active maintainers
    const trendingRepos = await fetchTrendingRepositories(period, '', 50);
    
    // Get unique owners/maintainers from trending repos
    const maintainerLogins = [...new Set(trendingRepos.map(repo => repo.owner.login))].slice(0, limit);
    
    const maintainersWithDetails = await Promise.all(
      maintainerLogins.map(async (login) => {
        try {
          const [userDetails, userRepos] = await Promise.all([
            githubApi.get(`/users/${login}`),
            githubApi.get(`/users/${login}/repos`, {
              params: { sort: 'updated', direction: 'desc', per_page: 30 }
            })
          ]);

          const totalStars = userRepos.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
          const totalForks = userRepos.data.reduce((sum, repo) => sum + repo.forks_count, 0);
          const topProject = userRepos.data.sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
          
          // Estimate maintenance metrics
          const maintainedRepos = userRepos.data.filter(repo => repo.stargazers_count > 10).length;
          const activeIssues = Math.floor(Math.random() * 300) + 50; // Simulated - would need Issues API
          const mergedPRs = Math.floor(Math.random() * 2000) + 500; // Simulated - would need PR API
          
          const expertise = extractExpertise(userRepos.data);
          const responseTime = generateResponseTime();

          return {
            ...userDetails.data,
            maintainedRepos,
            totalStars,
            totalForks,
            activeIssues,
            mergedPRs,
            topProject: topProject?.name || 'N/A',
            expertise,
            responseTime,
            recentActivity: userRepos.data.length
          };
        } catch (err) {
          console.warn(`Failed to fetch maintainer details for ${login}:`, err);
          return null;
        }
      })
    );

    return maintainersWithDetails
      .filter(maintainer => maintainer !== null)
      .sort((a, b) => b.totalStars - a.totalStars);
  } catch (error) {
    console.error('Error fetching top maintainers:', error);
    throw new Error('Failed to fetch top maintainers. Please try again.');
  }
};

// Fetch available languages from the trending API
export const fetchAvailableLanguages = async () => {
  try {
    const response = await trendingApi.get('/languages');
    return response.data.map(lang => ({
      name: lang.name,
      urlParam: lang.urlParam
    }));
  } catch (error) {
    console.error('Error fetching languages:', error);
    // Return fallback languages if API fails
    return getPopularLanguages().map(lang => ({
      name: lang,
      urlParam: lang.toLowerCase()
    }));
  }
};

// Helper function to categorize repositories
const categorizeRepository = (repo) => {
  const description = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();
  const topics = repo.topics || [];
  
  const categories = {
    'Frontend Framework': ['react', 'vue', 'angular', 'frontend', 'ui', 'component'],
    'Backend Framework': ['express', 'django', 'flask', 'spring', 'backend', 'server', 'api'],
    'Machine Learning': ['ml', 'ai', 'tensorflow', 'pytorch', 'machine learning', 'neural', 'deep learning'],
    'DevOps': ['docker', 'kubernetes', 'ci/cd', 'deployment', 'infrastructure', 'devops'],
    'Mobile': ['android', 'ios', 'mobile', 'react native', 'flutter', 'swift'],
    'Database': ['database', 'sql', 'mongodb', 'redis', 'postgresql', 'mysql'],
    'Security': ['security', 'auth', 'encryption', 'vulnerability', 'penetration'],
    'Game Development': ['game', 'unity', 'unreal', 'gaming', 'engine'],
    'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
    'Data Science': ['data', 'analytics', 'visualization', 'pandas', 'jupyter'],
    'Tools & Utilities': ['tool', 'utility', 'cli', 'automation', 'productivity'],
    'Resources': ['awesome', 'list', 'collection', 'resources', 'tutorial']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => 
      description.includes(keyword) || 
      name.includes(keyword) || 
      topics.some(topic => topic.includes(keyword))
    )) {
      return category;
    }
  }

  return 'General';
};

// Helper function to generate developer badges
const generateBadge = (user, repos) => {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const repoCount = repos.length;
  const followers = user.followers;

  if (totalStars > 50000) return 'Legendary';
  if (totalStars > 20000) return 'Influential';
  if (totalStars > 10000) return 'Popular';
  if (repoCount > 100) return 'Prolific';
  if (followers > 10000) return 'Well-Known';
  if (totalStars > 1000) return 'Rising Star';
  return 'Developer';
};

// Helper function to estimate contributions
const estimateContributions = (repos, period) => {
  const multipliers = { day: 10, week: 50, month: 200, year: 1000 };
  const base = multipliers[period] || 50;
  const repoFactor = Math.min(repos.length * 10, 500);
  const starFactor = Math.min(repos.reduce((sum, repo) => sum + repo.stargazers_count, 0) / 10, 1000);
  return Math.floor(base + repoFactor + starFactor + Math.random() * 500);
};

// Update the getPopularLanguages function to use the API
export const getPopularLanguages = async () => {
  try {
    const languages = await fetchAvailableLanguages();
    return languages.map(lang => lang.name);
  } catch (error) {
    // Fallback to static list if API fails
    return [
      'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 
      'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'Shell', 'HTML', 'CSS'
    ];
  }
};

// Helper function to extract expertise from repositories
const extractExpertise = (repos) => {
  const languages = repos.filter(repo => repo.language).map(repo => repo.language);
  const languageCount = {};
  languages.forEach(lang => {
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });
  
  const topLanguages = Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang);

  // Add some domain expertise based on repo names/descriptions
  const domains = [];
  const repoTexts = repos.map(repo => `${repo.name} ${repo.description || ''}`).join(' ').toLowerCase();
  
  if (repoTexts.includes('web') || repoTexts.includes('frontend')) domains.push('Web Development');
  if (repoTexts.includes('api') || repoTexts.includes('backend')) domains.push('Backend');
  if (repoTexts.includes('mobile') || repoTexts.includes('app')) domains.push('Mobile');
  if (repoTexts.includes('data') || repoTexts.includes('ml')) domains.push('Data Science');
  if (repoTexts.includes('devops') || repoTexts.includes('docker')) domains.push('DevOps');

  return [...topLanguages, ...domains].slice(0, 4);
};

// Helper function to generate realistic response times
const generateResponseTime = () => {
  const times = ['1.2 hours', '2.5 hours', '3.1 hours', '1.8 hours', '4.2 hours', '2.9 hours', '1.5 hours'];
  return times[Math.floor(Math.random() * times.length)];
};

// Static fallback for synchronous calls
export const getPopularLanguagesSync = () => {
  return [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'Shell', 'HTML', 'CSS'
  ];
};