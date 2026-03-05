import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import './GitHubFeed.css';

const GitHubFeed = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['github-activity'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/github/activity`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: true,
    retryDelay: 5000
  });

  const getIcon = (type) => {
    const iconMap = {
      'push': 'PUSH',
      'create': 'CREATE',
      'star': 'STAR'
    };
    return iconMap[type] || '•';
  };

  if (isLoading) {
    return (
      <div className="github-feed">
        <div className="feed-header">ACTIVITY LOG</div>
        <div className="feed-content">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-icon" />
              <div className="skeleton-content">
                <div className="skeleton-text skeleton-repo" />
                <div className="skeleton-text skeleton-message" />
              </div>
              <div className="skeleton-text skeleton-time" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="github-feed">
      <div className="feed-header">ACTIVITY LOG</div>
      <motion.div
        className="feed-content"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="feed-item"
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0 }
            }}
          >
            <div className="feed-icon">{getIcon(activity.type)}</div>
            <div className="feed-info">
              <div className="repo-name">{activity.repo}</div>
              <div className="commit-message">{activity.message}</div>
            </div>
            <div className="feed-time">{activity.time}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GitHubFeed;
