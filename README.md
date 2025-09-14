# 🚀 GitHub Profile Explorer

A modern, interactive web application for exploring and analyzing GitHub profiles with beautiful visualizations and smooth animations.

![GitHub Profile Explorer](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.5-blue)
![Framer Motion](https://img.shields.io/badge/FramerMotion-10.16.4-purple)

## ✨ Features

### 🎨 Modern Design
- **Dark theme** with neon accent colors (blue, purple, green)
- **Responsive design** that works on desktop and mobile
- **Smooth animations** powered by Framer Motion
- **Futuristic developer aesthetic** with clean typography

### 🔍 Core Functionality
- **Smart search** for GitHub users
- **Profile overview** with avatar, bio, stats, and social links
- **Repository analysis** with top repos sorted by stars
- **Interactive charts** showing language distribution and repo performance
- **AI-generated profile summaries**

### 📊 Data Visualizations
- **Pie charts** for programming language distribution
- **Bar charts** for repository performance (stars vs forks)
- **Statistics cards** with total stars, forks, and follower counts
- **Responsive charts** that adapt to different screen sizes

### 🆚 Compare Mode
- **Side-by-side profile comparison**
- **Quick comparison metrics** highlighting winners
- **Dual search interface** for easy comparison setup

### ⚡ Performance Features
- **Animated loading skeletons** while fetching data
- **Error handling** with user-friendly messages
- **API rate limit awareness**
- **Smooth page transitions**

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **Recharts** - Composable charting library
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd github-profile-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up GitHub API Token (Recommended)**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your GitHub Personal Access Token
   # REACT_APP_GITHUB_TOKEN=your_token_here
   ```

   **To create a GitHub token:**
   - Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "GitHub Profile Explorer"
   - Select scopes: `public_repo` and `read:user` (or leave default)
   - Copy the generated token to your `.env` file

   **Rate Limits:**
   - **Without token**: 60 requests/hour (may cause issues with Discover feature)
   - **With token**: 5,000 requests/hour (recommended for full functionality)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🎯 Usage

### Basic Search
1. Enter a GitHub username in the search bar
2. View the comprehensive profile overview
3. Explore repository statistics and visualizations
4. Check out the AI-generated profile summary

### Compare Mode
1. Click the "Compare" button in the navigation
2. Enter two GitHub usernames
3. View side-by-side profile comparison
4. Analyze the quick comparison metrics

## 🎨 Design Features

### Color Palette
- **Primary**: `#00d4ff` (Neon Blue)
- **Secondary**: `#a855f7` (Neon Purple)  
- **Accent**: `#00ff88` (Neon Green)
- **Background**: `#0a0a0a` (Dark)
- **Cards**: `#1a1a1a` (Dark Card)

### Animations
- **Page transitions** with fade effects
- **Hover animations** on cards and buttons
- **Loading skeletons** with shimmer effects
- **Particle background** on landing screen
- **Smooth scaling** and rotation effects

### Typography
- **Font**: Inter (Google Fonts)
- **Gradient text** for headings
- **Consistent spacing** and hierarchy

## 📱 Responsive Design

- **Mobile-first** approach
- **Flexible grid layouts** using CSS Grid and Flexbox
- **Adaptive charts** that resize based on screen size
- **Touch-friendly** interactions

## 🔧 API Integration

The app uses multiple APIs:
- **GitHub Trending API**: Real trending repositories and developers
- **GitHub REST API v3**: Detailed user profiles and repositories

### Rate Limiting & Authentication
- **Unauthenticated**: 60 requests/hour per IP
- **With GitHub Token**: 5,000 requests/hour per token
- **Real-time rate limit monitoring** with status indicator
- **Graceful degradation** when limits are reached
- **Automatic retry logic** for failed requests

### API Status Indicator
The app includes a real-time API status indicator (bottom-right corner) that shows:
- Current rate limit usage
- Token authentication status
- Reset time for rate limits
- Helpful setup links for GitHub tokens

## 🎪 Interactive Elements

### Profile Card
- **Hover effects** on avatar (scale + rotate)
- **Animated statistics** counters
- **Social links** with external navigation
- **AI summary** with delayed animation

### Repository Section
- **Expandable list** (show more/less functionality)
- **Language indicators** with color coding
- **Hover effects** with card lifting
- **Topic tags** for repository categorization

### Charts & Visualizations
- **Interactive tooltips** on hover
- **Smooth transitions** between data states
- **Custom styling** to match the dark theme
- **Responsive containers** for different screen sizes

## 🚀 Performance Optimizations

- **Lazy loading** of components
- **Optimized re-renders** with React hooks
- **Efficient API calls** with error handling
- **Smooth animations** with hardware acceleration

## 🎨 Customization

### Colors
Modify the color palette in `tailwind.config.js`:
```javascript
colors: {
  'neon-blue': '#00d4ff',
  'neon-purple': '#a855f7',
  'neon-green': '#00ff88',
  // Add your custom colors
}
```

### Animations
Customize animations in the component files using Framer Motion:
```javascript
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub API** for providing the data
- **Framer Motion** for smooth animations
- **Recharts** for beautiful charts
- **Tailwind CSS** for rapid styling
- **Lucide** for clean icons

---

Built with ❤️ and modern web technologies