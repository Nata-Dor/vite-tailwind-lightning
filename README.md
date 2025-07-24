# Vite + Tailwind CSS + Lightning CSS

An optimized, modern starter template combining Vite, Tailwind CSS v4, and Lightning CSS for lightning-fast builds and exceptional developer experience.

## ✨ Features

- ⚡ **Lightning CSS** integration for 10x faster builds
- 🎨 **Tailwind CSS v4** with modern configuration
- 📱 **Responsive design** utilities
- 🔧 **Modern tooling** with Vite
- 🎯 **Optimized builds** with automatic chunk splitting
- 🚀 **Hot Module Replacement** for instant updates
- 🎭 **Modern browser targets** for smaller bundles
- 📦 **Zero-config** setup with sensible defaults

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vite-tailwind-lightning.git
cd vite-tailwind-lightning

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm format` - Format code with Prettier

## 📁 Project Structure

```
vite-tailwind-lightning/
├── public/              # Static assets
├── src/
│   ├── main.js         # Entry point
│   └── style.css       # Main styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
├── package.json        # Dependencies
└── README.md          # This file
```

## 🎨 Customization

### Tailwind Configuration

The project includes a pre-configured `tailwind.config.js` with:

- Extended color palette with primary colors
- Custom animations (fade-in, slide-up)
- Inter font family
- Modern spacing scale

### Lightning CSS Features

- **CSS Nesting** support
- **Custom Media Queries**
- **Modern browser targets** (Chrome 100+, Firefox 95+, Safari 15+)
- **Automatic vendor prefixing**
- **Minification** with lightning-fast speeds

## 🛠️ Development

### Adding New Components

1. Create new files in `src/`
2. Import styles in your component files
3. Use Tailwind classes for styling

### Environment Variables

Create a `.env` file for environment-specific variables:

```bash
VITE_API_URL=https://api.example.com
```

## 📦 Building for Production

```bash
pnpm build
```

The build output will be in the `dist/` directory with:

- Optimized CSS with Lightning CSS
- Minified JavaScript
- Automatic code splitting
- Modern browser targeting

## 🚀 Deploy to GitHub Pages

### Method 1: GitHub Actions (Recommended)

1. **Create a new repository** on GitHub:
   - Go to https://github.com/new
   - Name it `vite-tailwind-lightning`
   - Make it public
   - Don't initialize with README (we have one)

2. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vite + Tailwind + Lightning CSS"
   git branch -M main
   git remote add origin https://github.com/yourusername/vite-tailwind-lightning.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Click Save

4. **GitHub Actions workflow** (already configured):
   - The workflow will automatically deploy to GitHub Pages on every push to main

### Method 2: Manual Deployment

```bash
# Build the project
pnpm build

# Deploy to GitHub Pages
pnpm build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## 🔄 Updating Dependencies

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update to latest versions
pnpm update --latest
```

## 🎯 Performance Optimizations

- **Lightning CSS**: 10x faster than traditional CSS processing
- **Tree shaking**: Unused code elimination
- **Code splitting**: Automatic chunk splitting
- **Modern syntax**: ES2022+ features
- **Browser targeting**: Optimized for modern browsers

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   pnpm dev -- --port 3001
   ```

2. **Build failures**:
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall:
     ```bash
     rm -rf node_modules pnpm-lock.yaml
     pnpm install
     ```

3. **Tailwind classes not working**:
   - Ensure content paths are correct in tailwind.config.js
   - Restart dev server

## 📄 License

MIT License - feel free to use this template for any project!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.