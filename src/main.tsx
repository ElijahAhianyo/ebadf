import './index.css'
import { initializeTheme } from './lib/theme-init'
import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'

// Initialize theme immediately to prevent flash of unstyled content (only in browser)
if (typeof document !== 'undefined') {
	initializeTheme();
}

export const createRoot = ViteReactSSG({ routes }, ({router, routes, isClient, initialState}) => {
	// any app-level async init for SSG can go here
});

