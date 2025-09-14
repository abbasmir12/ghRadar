import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, TrendingUp } from 'lucide-react';

const ContributionHeatmap = ({ repos }) => {
  // Generate mock contribution data based on repository creation and update dates
  const contributionData = useMemo(() => {
    const data = {};
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Initialize all days with 0 contributions
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = 0;
    }
    
    // Add contributions based on repo activity
    repos.forEach(repo => {
      const createdDate = new Date(repo.created_at).toISOString().split('T')[0];
      const updatedDate = new Date(repo.updated_at).toISOString().split('T')[0];
      
      if (data[createdDate] !== undefined) {
        data[createdDate] += Math.min(repo.stargazers_count + 1, 10);
      }
      if (data[updatedDate] !== undefined && updatedDate !== createdDate) {
        data[updatedDate] += Math.min(Math.floor(repo.stargazers_count / 2) + 1, 5);
      }
    });
    
    return data;
  }, [repos]);

  const getContributionLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 8) return 3;
    return 4;
  };

  const getContributionColor = (level) => {
    const colors = [
      '#1a1a1a', // No contributions
      '#0e4429', // Low
      '#006d32', // Medium-low
      '#26a641', // Medium-high
      '#39d353'  // High
    ];
    return colors[level];
  };

  const weeks = useMemo(() => {
    const result = [];
    const dates = Object.keys(contributionData).sort();
    
    for (let i = 0; i < dates.length; i += 7) {
      const week = dates.slice(i, i + 7).map(date => ({
        date,
        count: contributionData[date],
        level: getContributionLevel(contributionData[date])
      }));
      result.push(week);
    }
    
    return result;
  }, [contributionData]);

  const totalContributions = Object.values(contributionData).reduce((sum, count) => sum + count, 0);
  const maxStreak = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    Object.values(contributionData).forEach(count => {
      if (count > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }, [contributionData]);

  const currentStreak = useMemo(() => {
    const dates = Object.keys(contributionData).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
      if (contributionData[date] > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [contributionData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Calendar className="w-5 h-5 text-neon-green" />
          Contribution Activity
        </h3>
        <div className="text-sm text-gray-400">
          {totalContributions} contributions in the last year
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-blue">{totalContributions}</div>
          <div className="text-xs text-gray-400">Total Contributions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-purple">{maxStreak}</div>
          <div className="text-xs text-gray-400">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-green">{currentStreak}</div>
          <div className="text-xs text-gray-400">Current Streak</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: getContributionColor(day.level) }}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-400">Less</div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getContributionColor(level) }}
            />
          ))}
        </div>
        <div className="text-xs text-gray-400">More</div>
      </div>

      {/* Activity Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-neon-green/10 to-neon-blue/10 border border-neon-green/20 rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-neon-green" />
          <span className="text-sm font-semibold text-white">Activity Insights</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-300">
          <div>
            <span className="text-gray-400">Most Active Period:</span>
            <span className="ml-2 text-neon-blue font-medium">
              {(() => {
                const monthCounts = {};
                Object.entries(contributionData).forEach(([date, count]) => {
                  const month = new Date(date).toLocaleDateString('en-US', { month: 'short' });
                  monthCounts[month] = (monthCounts[month] || 0) + count;
                });
                const topMonth = Object.entries(monthCounts).sort(([,a], [,b]) => b - a)[0];
                return topMonth ? topMonth[0] : 'N/A';
              })()}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Consistency Score:</span>
            <span className="ml-2 text-neon-purple font-medium">
              {Math.round((Object.values(contributionData).filter(c => c > 0).length / Object.keys(contributionData).length) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContributionHeatmap;