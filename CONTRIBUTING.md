# 🤝 Contributing to ghRadar

We welcome contributions! Help us make GitHub Radar even better.

## Quick Start

1. **Fork & Clone**
   ```bash
   git clone https://github.com/abbasmir12/ghRadar.git
   cd ghRadar
   ```

2. **Setup Environment**
   ```bash
   npm install
   cp .env.example .env
   # Add your GitHub token to .env
   #Your .env file should look like; #REACT_APP_GITHUB_TOKEN=ghp_your_token_here
   npm start
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### **Code Standards**
- Follow existing code patterns and ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent formatting with Prettier

### **Commit Messages**
- Use clear, descriptive commit messages
- Format: `type: description` (e.g., `feat: add repository comparison`)
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### **Testing**
- Test across different browsers (Chrome, Firefox, Safari)
- Verify responsive design on mobile and desktop
- Test with various GitHub repositories
- Ensure API rate limits are handled gracefully

## 🎯 Contribution Areas

| Area | Description | Examples |
|------|-------------|----------|
| 🐛 **Bug Fixes** | Fix existing issues | API errors, UI glitches, data inconsistencies |
| ✨ **Features** | Add new functionality | New chart types, additional metrics, filters |
| 🎨 **UI/UX** | Improve user experience | Better animations, responsive design, accessibility |
| 📊 **Analytics** | Enhance data insights | New visualizations, better algorithms, performance metrics |
| 📚 **Documentation** | Improve docs | README updates, code comments, examples |
| ⚡ **Performance** | Optimize speed | Bundle size, loading times, API efficiency |

## 🔧 Technical Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Charts**: Recharts, Custom SVG components
- **API**: GitHub REST API v3, Axios
- **Build**: Create React App, ESLint, PostCSS

## 📋 Pull Request Process

1. **Before Submitting**
   - Ensure your code follows the style guide
   - Test thoroughly across different scenarios
   - Update documentation if needed
   - Rebase your branch on the latest main

2. **PR Description**
   - Clearly describe what your PR does
   - Include screenshots for UI changes
   - Reference any related issues
   - List breaking changes (if any)

3. **Review Process**
   - Maintainers will review as soon as possible
   - Address feedback promptly
   - Keep discussions constructive and respectful

## 🚫 What Not to Contribute

- Breaking changes without discussion
- Features that significantly increase bundle size
- Code that doesn't follow our style guide
- Contributions without proper testing

## 💡 Need Help?

- 📖 Check existing [issues](https://github.com/abbasmir12/ghRadar/issues)
- 💬 Start a [discussion](https://github.com/abbasmir12/ghRadar/discussions)
- 📧 Contact maintainers for major changes

## 🎉 Recognition

Contributors will be:
- Added to our contributors list
- Mentioned in release notes
- Given credit in documentation

---

**Thank you for contributing to ghRadar!**