const express = require('express');
const axios = require('axios');

const router = express.Router();

const GITHUB_USERNAME = 'lucaslau19'; // Real GitHub username
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Cache for 5 minutes
let cache = {};
const CACHE_DURATION = 5 * 60 * 1000;

router.get('/repos', async (req, res) => {
  try {
    if (cache.repos && Date.now() - cache.repos.timestamp < CACHE_DURATION) {
      return res.json(cache.repos.data);
    }

    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 10 // Get more to filter out forks
      }
    });

    // Filter out forks and take top 6
    const nonForkRepos = response.data.filter(repo => !repo.fork).slice(0, 6);

    const repos = nonForkRepos.map(repo => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      lastPush: repo.pushed_at,
      homepage: repo.homepage,
      url: repo.html_url,
      topics: repo.topics || []
    }));

    cache.repos = { data: repos, timestamp: Date.now() };
    res.json(repos);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    if (cache.stats && Date.now() - cache.stats.timestamp < CACHE_DURATION) {
      return res.json(cache.stats.data);
    }

    // Get user data
    const userResponse = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    // Get contributions (simplified - in reality you'd need GraphQL for detailed stats)
    const stats = {
      totalCommits: userResponse.data.public_repos * 50, // Rough estimate
      topLanguages: ['JavaScript', 'TypeScript', 'Python'],
      contributionStreak: 7 // Mock data
    };

    cache.stats = { data: stats, timestamp: Date.now() };
    res.json(stats);
  } catch (error) {
    console.error('GitHub stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const ACTIVITY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

    if (cache.activity && Date.now() - cache.activity.timestamp < ACTIVITY_CACHE_DURATION) {
      return res.json(cache.activity.data);
    }

    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/events`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 10
      }
    });

    // Helper to format relative time
    const timeAgo = (dateStr) => {
      const diff = Date.now() - new Date(dateStr);
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 7) return `${days}d ago`;
      return `${Math.floor(days / 7)}w ago`;
    };

    // Filter for relevant events and extract data
    const events = response.data
      .filter(event => ['PushEvent', 'CreateEvent', 'WatchEvent'].includes(event.type))
      .map(event => {
        let type = 'push';
        let message = '';

        if (event.type === 'PushEvent' && event.payload.commits && event.payload.commits[0]) {
          type = 'push';
          message = event.payload.commits[0].message;
        } else if (event.type === 'CreateEvent') {
          type = 'create';
          message = event.payload.ref_type === 'branch'
            ? `Created branch: ${event.payload.ref}`
            : 'Created new repository';
        } else if (event.type === 'WatchEvent') {
          type = 'star';
          message = 'Starred repository';
        }

        return {
          type,
          repo: event.repo.name.split('/')[1] || event.repo.name,
          message: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
          time: timeAgo(event.created_at)
        };
      })
      .slice(0, 4); // Take top 4

    cache.activity = { data: events, timestamp: Date.now() };
    res.json(events);
  } catch (error) {
    console.error('GitHub activity error:', error);

    // Fallback data
    const fallback = [
      {
        type: 'push',
        repo: 'GenAI-Data-Scraper',
        message: 'feat: improve query latency',
        time: '2d ago'
      },
      {
        type: 'push',
        repo: 'Volleyball-AI-Jumptracker',
        message: 'fix: reduce false positives',
        time: '5d ago'
      },
      {
        type: 'create',
        repo: 'Arduino-PulseOx',
        message: 'Created new repository',
        time: '1w ago'
      },
      {
        type: 'push',
        repo: 'Portfolio',
        message: 'update: new RPG theme',
        time: '1w ago'
      }
    ];

    res.json(fallback);
  }
});

module.exports = router;