import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search GitHub username..." }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="relative max-w-md mx-auto mb-8"
    >
      <div className="relative">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 pl-14 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 transition-all"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      <motion.button
        type="submit"
        whileHover={{ 
          boxShadow: "0 10px 25px rgba(0, 212, 255, 0.4), 0 0 20px rgba(0, 212, 255, 0.3)",
          filter: "brightness(1.1)"
        }}
        whileTap={{ filter: "brightness(0.9)" }}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg font-medium transition-all"
      >
        Search
      </motion.button>
    </motion.form>
  );
};

export default SearchBar;