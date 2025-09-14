import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Link as LinkIcon, Users, GitFork, Star, Calendar, Building } from 'lucide-react';
import { generateAISummary } from '../services/githubApi';

const ProfileCard = ({ user }) => {
  const aiSummary = generateAISummary(user, []);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-8 card-hover"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="relative"
        >
          <img
            src={user.avatar_url}
            alt={user.name || user.login}
            className="w-32 h-32 rounded-full border-4 border-neon-blue/30"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-dark-card"></div>
        </motion.div>
        
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              {user.name || user.login}
            </h2>
            <p className="text-neon-blue text-lg">@{user.login}</p>
          </div>
          
          {user.bio && (
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              {user.bio}
            </p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue">{user.followers}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-purple">{user.following}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">{user.public_repos}</div>
              <div className="text-sm text-gray-400">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{user.public_gists}</div>
              <div className="text-sm text-gray-400">Gists</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-blue hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Summary Section */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-neon-blue mb-2 flex items-center gap-2">
          <Star className="w-5 h-5" />
          AI Profile Summary
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {aiSummary}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ProfileCard;