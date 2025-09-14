import axios from 'axios';

const GITHUB_API_BASE = process.env.NODE_ENV === 'development' ? '/api/github' : 'https://api.github.com';

// Create axios instance for GitHub API
const api = axios.create({
  baseURL: GITHUB_API_BASE,
  timeout: 15000,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(process.env.NODE_ENV !== 'development' && {
      'User-Agent': 'GitHub-Profile-Explorer',
      ...(process.env.REACT_APP_GITHUB_TOKEN && { 
        'Authorization': `token ${process.env.REACT_APP_GITHUB_TOKEN}` 
      })
    })
  }
});

// Fetch repository details with comprehensive data
export const fetchRepositoryDetails = async (owner, repo) => {
  try {
    console.log(`🔍 Fetching comprehensive data for ${owner}/${repo}...`);
    
    // Fetch basic repository data first
    const repoResponse = await api.get(`/repos/${owner}/${repo}`);
    const repository = repoResponse.data;
    
    // Get total counts using pagination headers (like your PowerShell script)
    const getTotalCount = async (endpoint) => {
      try {
        const response = await api.get(`/repos/${owner}/${repo}/${endpoint}`, { params: { per_page: 1 } });
        const linkHeader = response.headers.link;
        if (linkHeader && linkHeader.includes('rel="last"')) {
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          return lastPageMatch ? parseInt(lastPageMatch[1]) : response.data.length;
        }
        return response.data.length;
      } catch (error) {
        console.warn(`Failed to get total count for ${endpoint}:`, error.response?.status);
        return 0;
      }
    };

    // Get search counts for issues and PRs (like your PowerShell script)
    const getSearchCount = async (query) => {
      try {
        console.log(`🔍 Searching with query: ${query}`);
        const response = await api.get('/search/issues', { 
          params: { q: query, per_page: 1 }
        });
        console.log(`✅ Search result for "${query}": ${response.data.total_count}`);
        return response.data.total_count;
      } catch (error) {
        console.error(`❌ Failed to get search count for query: ${query}`, error.response?.status, error.response?.data);
        return 0;
      }
    };

    // First get the basic counts
    const [
      totalContributorsCount, 
      totalReleasesCount, 
      totalBranchesCount, 
      totalTagsCount, 
      totalCommitsCount
    ] = await Promise.all([
      getTotalCount('contributors?anon=true'),
      getTotalCount('releases'),
      getTotalCount('branches'),
      getTotalCount('tags'),
      getTotalCount('commits')
    ]);

    // Then get issues and PRs counts with fallback
    let issuesOpenCount = 0, issuesClosedCount = 0, prsOpenCount = 0, prsClosedCount = 0;
    
    try {
      // Try search API first
      [issuesOpenCount, issuesClosedCount, prsOpenCount, prsClosedCount] = await Promise.all([
        getSearchCount(`repo:${owner}/${repo} type:issue state:open`),
        getSearchCount(`repo:${owner}/${repo} type:issue state:closed`),
        getSearchCount(`repo:${owner}/${repo} type:pr state:open`),
        getSearchCount(`repo:${owner}/${repo} type:pr state:closed`)
      ]);
    } catch (error) {
      console.warn('Search API failed, trying fallback approach:', error);
      
      // Fallback: use regular endpoints with pagination
      try {
        [issuesOpenCount, issuesClosedCount, prsOpenCount, prsClosedCount] = await Promise.all([
          getTotalCount('issues?state=open'),
          getTotalCount('issues?state=closed'),
          getTotalCount('pulls?state=open'),
          getTotalCount('pulls?state=closed')
        ]);
      } catch (fallbackError) {
        console.error('Both search and fallback approaches failed:', fallbackError);
      }
    }
    
    // Fetch additional data in parallel with higher limits
    const [
      contributorsResponse, 
      languagesResponse, 
      commitsResponse, 
      releasesResponse,
      tagsResponse,
      branchesResponse
    ] = await Promise.all([
      api.get(`/repos/${owner}/${repo}/contributors`, { params: { per_page: 100 } })
        .catch(err => {
          console.warn('Contributors fetch failed:', err.response?.status);
          return { data: [] };
        }),
      api.get(`/repos/${owner}/${repo}/languages`)
        .catch(err => {
          console.warn('Languages fetch failed:', err.response?.status);
          return { data: {} };
        }),
      // Get more commits for better analysis
      api.get(`/repos/${owner}/${repo}/commits`, { params: { per_page: 100 } })
        .catch(err => {
          console.warn('Commits fetch failed:', err.response?.status);
          return { data: [] };
        }),
      // Get all releases
      api.get(`/repos/${owner}/${repo}/releases`, { params: { per_page: 100 } })
        .catch(err => {
          console.warn('Releases fetch failed:', err.response?.status);
          return { data: [] };
        }),
      api.get(`/repos/${owner}/${repo}/tags`, { params: { per_page: 100 } })
        .catch(err => {
          console.warn('Tags fetch failed:', err.response?.status);
          return { data: [] };
        }),
      // Get all branches
      api.get(`/repos/${owner}/${repo}/branches`, { params: { per_page: 100 } })
        .catch(err => {
          console.warn('Branches fetch failed:', err.response?.status);
          return { data: [] };
        })
    ]);

    const contributors = contributorsResponse.data;
    const languages = languagesResponse.data;
    const commits = commitsResponse.data;
    const releases = releasesResponse.data;
    const tags = tagsResponse.data;
    const branches = branchesResponse.data;

    console.log(`✅ Fetched sample data: ${contributors.length} contributors, ${commits.length} commits, ${releases.length} releases`);
    console.log(`📊 Total counts: ${totalContributorsCount} contributors, ${totalCommitsCount} commits, ${totalReleasesCount} releases, ${totalBranchesCount} branches, ${totalTagsCount} tags`);
    console.log(`🔍 Issues & PRs: ${issuesOpenCount} open issues, ${issuesClosedCount} closed issues, ${prsOpenCount} open PRs, ${prsClosedCount} closed PRs`);

    return {
      repository,
      contributors,
      languages,
      commits,
      releases,
      tags,
      branches,
      totalCounts: {
        contributors: totalContributorsCount,
        commits: totalCommitsCount,
        releases: totalReleasesCount,
        branches: totalBranchesCount,
        tags: totalTagsCount,
        issuesOpen: issuesOpenCount,
        issuesClosed: issuesClosedCount,
        prsOpen: prsOpenCount,
        prsClosed: prsClosedCount
      },
      analytics: generateRepositoryAnalytics(repository, contributors, languages, commits, releases, tags, branches, {
        totalContributors: totalContributorsCount,
        totalCommits: totalCommitsCount,
        totalReleases: totalReleasesCount,
        totalBranches: totalBranchesCount,
        totalTags: totalTagsCount,
        issuesOpen: issuesOpenCount,
        issuesClosed: issuesClosedCount,
        prsOpen: prsOpenCount,
        prsClosed: prsClosedCount
      })
    };
  } catch (error) {
    console.error('Repository fetch error:', error);
    if (error.response?.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found`);
    } else if (error.response?.status === 403) {
      throw new Error('API rate limit exceeded or repository is private');
    }
    throw new Error('Failed to fetch repository data. Please try again.');
  }
};

// Helper function to get date N days ago
const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Fetch repository issues and pull requests with detailed analysis
export const fetchRepositoryActivity = async (owner, repo) => {
  try {
    console.log(`📊 Fetching activity data for ${owner}/${repo}...`);
    
    const [issuesResponse, pullsResponse, forksResponse, eventsResponse] = await Promise.all([
      api.get(`/repos/${owner}/${repo}/issues`, { 
        params: { state: 'all', per_page: 100, sort: 'created', direction: 'desc' } 
      }).catch(err => {
        console.warn('Issues fetch failed:', err.response?.status);
        return { data: [] };
      }),
      api.get(`/repos/${owner}/${repo}/pulls`, { 
        params: { state: 'all', per_page: 100, sort: 'created', direction: 'desc' } 
      }).catch(err => {
        console.warn('PRs fetch failed:', err.response?.status);
        return { data: [] };
      }),
      api.get(`/repos/${owner}/${repo}/forks`, { 
        params: { per_page: 50, sort: 'newest' } 
      }).catch(err => {
        console.warn('Forks fetch failed:', err.response?.status);
        return { data: [] };
      }),
      api.get(`/repos/${owner}/${repo}/events`, { 
        params: { per_page: 100 } 
      }).catch(err => {
        console.warn('Events fetch failed:', err.response?.status);
        return { data: [] };
      })
    ]);

    const issues = issuesResponse.data.filter(issue => !issue.pull_request); // Filter out PRs from issues
    const pullRequests = pullsResponse.data;
    const forks = forksResponse.data;
    const events = eventsResponse.data;

    // Analyze activity patterns
    const activityAnalysis = analyzeActivityPatterns(issues, pullRequests, events);

    console.log(`✅ Activity data: ${issues.length} issues, ${pullRequests.length} PRs, ${forks.length} forks`);

    return {
      issues,
      pullRequests,
      forks,
      events,
      analysis: activityAnalysis
    };
  } catch (error) {
    console.error('Activity fetch error:', error);
    return { 
      issues: [], 
      pullRequests: [], 
      forks: [], 
      events: [],
      analysis: {
        issuesTrend: [],
        prsTrend: [],
        activityHeatmap: [],
        topContributors: []
      }
    };
  }
};

// Analyze activity patterns for better insights
const analyzeActivityPatterns = (issues, pullRequests, events) => {
  // Issues trend over time
  const issuesByMonth = {};
  issues.forEach(issue => {
    const month = new Date(issue.created_at).toISOString().slice(0, 7);
    issuesByMonth[month] = (issuesByMonth[month] || 0) + 1;
  });

  // PRs trend over time
  const prsByMonth = {};
  pullRequests.forEach(pr => {
    const month = new Date(pr.created_at).toISOString().slice(0, 7);
    prsByMonth[month] = (prsByMonth[month] || 0) + 1;
  });

  // Activity heatmap (last 12 months)
  const activityHeatmap = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);
    activityHeatmap.push({
      month: monthKey,
      issues: issuesByMonth[monthKey] || 0,
      prs: prsByMonth[monthKey] || 0,
      total: (issuesByMonth[monthKey] || 0) + (prsByMonth[monthKey] || 0)
    });
  }

  // Top contributors from events
  const contributorActivity = {};
  events.forEach(event => {
    if (event.actor) {
      contributorActivity[event.actor.login] = (contributorActivity[event.actor.login] || 0) + 1;
    }
  });

  const topContributors = Object.entries(contributorActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([login, activity]) => ({ login, activity }));

  return {
    issuesTrend: Object.entries(issuesByMonth).map(([month, count]) => ({ month, count })),
    prsTrend: Object.entries(prsByMonth).map(([month, count]) => ({ month, count })),
    activityHeatmap,
    topContributors
  };
};

// Fetch repository traffic (requires push access)
export const fetchRepositoryTraffic = async (owner, repo) => {
  try {
    const [viewsResponse, clonesResponse] = await Promise.all([
      api.get(`/repos/${owner}/${repo}/traffic/views`).catch(() => ({ data: { count: 0, uniques: 0, views: [] } })),
      api.get(`/repos/${owner}/${repo}/traffic/clones`).catch(() => ({ data: { count: 0, uniques: 0, clones: [] } }))
    ]);

    return {
      views: viewsResponse.data,
      clones: clonesResponse.data
    };
  } catch (error) {
    console.warn('Failed to fetch repository traffic (requires push access):', error);
    return {
      views: { count: 0, uniques: 0, views: [] },
      clones: { count: 0, uniques: 0, clones: [] }
    };
  }
};

// Generate comprehensive repository analytics
const generateRepositoryAnalytics = (repo, contributors, languages, commits, releases, tags, branches, totalCounts = {}) => {
  const now = new Date();
  const createdDate = new Date(repo.created_at);
  const updatedDate = new Date(repo.updated_at);
  
  // Age calculations
  const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  const ageInMonths = Math.floor(ageInDays / 30);
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
  
  // Language analysis
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const languagePercentages = Object.entries(languages).map(([lang, bytes]) => ({
    language: lang,
    bytes,
    percentage: ((bytes / totalBytes) * 100).toFixed(1)
  })).sort((a, b) => b.bytes - a.bytes);

  // Contributor analysis
  const totalContributions = contributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
  const topContributors = contributors.slice(0, 10);
  
  // Commit analysis
  const commitsByMonth = {};
  commits.forEach(commit => {
    const month = new Date(commit.commit.author.date).toISOString().slice(0, 7);
    commitsByMonth[month] = (commitsByMonth[month] || 0) + 1;
  });
  
  const commitTrend = Object.entries(commitsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months
    .map(([month, count]) => ({ month, commits: count }));
  
  // Use total counts if available, otherwise fall back to fetched data
  const actualCommitCount = totalCounts.totalCommits || commits.length;
  const actualReleaseCount = totalCounts.totalReleases || releases.length;
  const actualContributorCount = totalCounts.totalContributors || contributors.length;
  const actualBranchCount = totalCounts.totalBranches || branches.length;
  const actualTagCount = totalCounts.totalTags || tags.length;

  // Health metrics
  const healthScore = calculateHealthScore(repo, contributors, commits, releases, ageInDays);
  
  // Activity metrics
  const activityScore = calculateActivityScore(repo, commits, daysSinceUpdate);
  
  // Community metrics
  const communityScore = calculateCommunityScore(repo, contributors);

  return {
    age: {
      days: ageInDays,
      months: ageInMonths,
      years: Math.floor(ageInMonths / 12),
      daysSinceUpdate
    },
    languages: {
      total: Object.keys(languages).length,
      distribution: languagePercentages,
      primary: languagePercentages[0]?.language || 'Unknown'
    },
    contributors: {
      total: actualContributorCount,
      totalContributions,
      top: topContributors,
      averageContributions: Math.round(totalContributions / Math.max(actualContributorCount, 1)) || 0
    },
    commits: {
      total: actualCommitCount,
      trend: commitTrend,
      averagePerMonth: Math.round(actualCommitCount / Math.max(ageInMonths, 1)),
      recentActivity: commits.filter(commit => 
        new Date(commit.commit.author.date) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length
    },
    releases: {
      total: actualReleaseCount,
      latest: releases[0] || null,
      frequency: actualReleaseCount > 0 ? Math.round(ageInMonths / actualReleaseCount) : 0
    },
    branches: {
      total: actualBranchCount
    },
    tags: {
      total: actualTagCount
    },
    issues: {
      open: totalCounts.issuesOpen || 0,
      closed: totalCounts.issuesClosed || 0,
      total: (totalCounts.issuesOpen || 0) + (totalCounts.issuesClosed || 0)
    },
    pullRequests: {
      open: totalCounts.prsOpen || 0,
      closed: totalCounts.prsClosed || 0,
      total: (totalCounts.prsOpen || 0) + (totalCounts.prsClosed || 0)
    },
    scores: {
      health: healthScore,
      activity: activityScore,
      community: communityScore,
      overall: Math.round((healthScore + activityScore + communityScore) / 3)
    },
    metrics: {
      starsPerDay: repo.stargazers_count / Math.max(ageInDays, 1),
      forksPerStar: repo.stargazers_count > 0 ? repo.forks_count / repo.stargazers_count : 0,
      issuesRatio: repo.open_issues_count / Math.max(repo.stargazers_count, 1),
      sizePerStar: repo.stargazers_count > 0 ? repo.size / repo.stargazers_count : repo.size
    }
  };
};

// Calculate repository health score (0-100)
const calculateHealthScore = (repo, contributors, commits, releases, ageInDays) => {
  let score = 0;
  
  // Documentation (README, description)
  if (repo.description) score += 15;
  if (repo.homepage) score += 10;
  
  // Activity
  if (ageInDays < 30) score += 20; // Recent activity
  else if (ageInDays < 90) score += 15;
  else if (ageInDays < 365) score += 10;
  
  // Community
  if (repo.stargazers_count > 100) score += 15;
  else if (repo.stargazers_count > 10) score += 10;
  else if (repo.stargazers_count > 0) score += 5;
  
  // Maintenance
  if (contributors.length > 5) score += 10;
  else if (contributors.length > 1) score += 5;
  
  // Releases
  if (releases.length > 0) score += 10;
  
  // License
  if (repo.license) score += 10;
  
  // Issues management
  if (repo.has_issues && repo.open_issues_count < repo.stargazers_count * 0.1) score += 10;
  
  return Math.min(score, 100);
};

// Calculate activity score (0-100)
const calculateActivityScore = (repo, commits, daysSinceUpdate) => {
  let score = 0;
  
  // Recent updates
  if (daysSinceUpdate < 7) score += 30;
  else if (daysSinceUpdate < 30) score += 20;
  else if (daysSinceUpdate < 90) score += 10;
  
  // Commit frequency
  const commitsPerMonth = commits.length / Math.max(1, Math.floor((new Date() - new Date(repo.created_at)) / (1000 * 60 * 60 * 24 * 30)));
  if (commitsPerMonth > 10) score += 25;
  else if (commitsPerMonth > 5) score += 20;
  else if (commitsPerMonth > 1) score += 15;
  else if (commitsPerMonth > 0) score += 10;
  
  // Repository features
  if (repo.has_issues) score += 10;
  if (repo.has_projects) score += 5;
  if (repo.has_wiki) score += 5;
  if (repo.has_pages) score += 5;
  
  // Size and complexity
  if (repo.size > 1000) score += 10; // Substantial codebase
  
  return Math.min(score, 100);
};

// Calculate community score (0-100)
const calculateCommunityScore = (repo, contributors) => {
  let score = 0;
  
  // Stars and engagement
  if (repo.stargazers_count > 1000) score += 25;
  else if (repo.stargazers_count > 100) score += 20;
  else if (repo.stargazers_count > 10) score += 15;
  else if (repo.stargazers_count > 0) score += 10;
  
  // Forks (indicates people want to contribute)
  if (repo.forks_count > 100) score += 20;
  else if (repo.forks_count > 10) score += 15;
  else if (repo.forks_count > 0) score += 10;
  
  // Contributors
  if (contributors.length > 20) score += 20;
  else if (contributors.length > 10) score += 15;
  else if (contributors.length > 5) score += 10;
  else if (contributors.length > 1) score += 5;
  
  // Watchers
  if (repo.watchers_count > 50) score += 15;
  else if (repo.watchers_count > 10) score += 10;
  else if (repo.watchers_count > 0) score += 5;
  
  // Open source indicators
  if (repo.license) score += 10;
  if (repo.has_issues) score += 5;
  if (!repo.private) score += 5;
  
  return Math.min(score, 100);
};

// Parse repository URL to extract owner and repo name
export const parseRepositoryUrl = (url) => {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /^([^\/]+)\/([^\/]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
      };
    }
  }
  
  throw new Error('Invalid GitHub repository URL or format. Use: owner/repo or full GitHub URL');
};

// Get repository categories based on topics and language
export const categorizeRepository = (repo) => {
  const topics = repo.topics || [];
  const language = repo.language?.toLowerCase() || '';
  const description = (repo.description || '').toLowerCase();
  const name = repo.name.toLowerCase();
  
  const categories = {
    'Web Framework': ['react', 'vue', 'angular', 'express', 'django', 'flask', 'rails'],
    'Mobile Development': ['android', 'ios', 'react-native', 'flutter', 'ionic', 'xamarin'],
    'Machine Learning': ['ml', 'ai', 'tensorflow', 'pytorch', 'scikit-learn', 'keras'],
    'DevOps & Tools': ['docker', 'kubernetes', 'ci-cd', 'deployment', 'monitoring'],
    'Database': ['database', 'sql', 'mongodb', 'redis', 'postgresql', 'mysql'],
    'Game Development': ['game', 'unity', 'unreal', 'godot', 'phaser'],
    'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
    'Data Science': ['data-science', 'analytics', 'visualization', 'jupyter'],
    'Security': ['security', 'auth', 'encryption', 'cybersecurity'],
    'CLI Tool': ['cli', 'command-line', 'terminal', 'tool'],
    'Library': ['library', 'sdk', 'api', 'framework'],
    'Educational': ['tutorial', 'learning', 'course', 'example', 'demo']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => 
      topics.includes(keyword) || 
      description.includes(keyword) || 
      name.includes(keyword) ||
      language.includes(keyword)
    )) {
      return category;
    }
  }
  
  // Language-based categorization
  const languageCategories = {
    'javascript': 'Web Development',
    'typescript': 'Web Development',
    'python': 'Data Science',
    'java': 'Enterprise',
    'go': 'Systems Programming',
    'rust': 'Systems Programming',
    'swift': 'Mobile Development',
    'kotlin': 'Mobile Development',
    'c++': 'Systems Programming',
    'c#': 'Enterprise',
    'php': 'Web Development',
    'ruby': 'Web Development'
  };
  
  return languageCategories[language] || 'General';
};