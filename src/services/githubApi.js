import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: GITHUB_API_BASE,
  timeout: 10000,
});

export const fetchGitHubUser = async (username) => {
  try {
    const response = await api.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`User "${username}" not found`);
    } else if (error.response?.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error('Failed to fetch user data. Please try again.');
  }
};

export const fetchUserRepos = async (username, perPage = 30) => {
  try {
    const response = await api.get(`/users/${username}/repos`, {
      params: {
        sort: 'stars',
        direction: 'desc',
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Repositories for "${username}" not found`);
    } else if (error.response?.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error('Failed to fetch repositories. Please try again.');
  }
};

export const generateAISummary = (user, repos) => {
  const topLanguages = getTopLanguages(repos);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  const primaryLanguage = topLanguages[0]?.language || 'various languages';
  const repoCount = user.public_repos;
  const followerCount = user.followers;
  
  let summary = `${user.name || user.login} is a developer`;
  
  if (primaryLanguage !== 'various languages') {
    summary += ` primarily working with ${primaryLanguage}`;
  }
  
  if (repoCount > 10) {
    summary += ` with ${repoCount} public repositories`;
  }
  
  if (totalStars > 50) {
    summary += ` and ${totalStars} total stars across their projects`;
  }
  
  if (followerCount > 100) {
    summary += `. They have built a strong community with ${followerCount} followers`;
  }
  
  if (topLanguages.length > 3) {
    summary += ` and demonstrate versatility across multiple programming languages`;
  }
  
  summary += '.';
  
  return summary;
};

export const getTopLanguages = (repos) => {
  const languageCount = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  });
  
  return Object.entries(languageCount)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
};