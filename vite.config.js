import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Use project root (not public folder) as the root
  // This allows /src, /shared, etc. to resolve correctly
  root: '.',
  
  // Public directory for static assets (images, sounds, etc.)
  publicDir: 'assets',
  
  build: {
    // Output to dist folder at project root
    outDir: 'dist',
    emptyOutDir: true,
    
    // Multi-page application setup
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        play: resolve(__dirname, 'public/play.html'),
        learn: resolve(__dirname, 'public/learn.html'),
        tutorial: resolve(__dirname, 'public/tutorial.html'),
        'mapping-hub': resolve(__dirname, 'public/mapping-hub.html'),
        challenges: resolve(__dirname, 'public/challenges.html'),
        leaderboard: resolve(__dirname, 'public/leaderboard.html'),
        analysis: resolve(__dirname, 'public/analysis.html'),
        profile: resolve(__dirname, 'public/profile.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        sandbox: resolve(__dirname, 'public/sandbox.html'),
      },
    },
    
    // Increase warning limit for legacy scripts
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    // Development server port
    port: 3000,
    open: '/public/index.html',
  },
  
  preview: {
    port: 4173,
  },
  
  resolve: {
    alias: {
      // Map absolute paths to project directories
      '/src': resolve(__dirname, 'src'),
      '/shared': resolve(__dirname, 'shared'),
      '/styles': resolve(__dirname, 'styles'),
      '/features': resolve(__dirname, 'features'),
      '/core': resolve(__dirname, 'core'),
      '/analytics': resolve(__dirname, 'analytics'),
      '/assets': resolve(__dirname, 'assets'),
      '/public': resolve(__dirname, 'public'),
      '/Profile.js': resolve(__dirname, 'Profile.js'),
    },
  },
});
