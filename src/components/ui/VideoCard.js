/**
 * VideoCard - YouTube video card component for tutorial pages
 * Displays video thumbnail, title, type badge, and watch button
 * 
 * @example
 * const card = new VideoCard({
 *   title: 'Load Balancing Explained',
 *   type: 'concept',
 *   youtubeId: 'sCR3SAVdyCc',
 *   duration: '5:23'
 * });
 * container.appendChild(card.render());
 */

import { TagBadge } from './TagBadge.js';

/**
 * @typedef {'concept' | 'architecture' | 'failure'} VideoType
 */

/**
 * @typedef {Object} VideoCardProps
 * @property {string} title - Video title
 * @property {VideoType} type - Video category type
 * @property {string} youtubeId - YouTube video ID only (not full URL)
 * @property {string} duration - Video duration in MM:SS format
 */

/**
 * Type to badge configuration mapping
 */
const TYPE_CONFIG = {
    concept: {
        label: '📚 Concept',
        variant: 'default',
        icon: '📚'
    },
    architecture: {
        label: '🏗️ Architecture',
        variant: 'success',
        icon: '🏗️'
    },
    failure: {
        label: '⚠️ Failure',
        variant: 'danger',
        icon: '⚠️'
    }
};

/**
 * Fallback thumbnail for invalid video IDs
 */
const FALLBACK_THUMBNAIL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%231e293b" width="320" height="180"/%3E%3Ctext fill="%2364748b" font-family="system-ui" font-size="14" text-anchor="middle" x="160" y="95"%3EVideo Unavailable%3C/text%3E%3C/svg%3E';

class VideoCard {
    /**
     * Create a VideoCard component
     * @param {VideoCardProps} props - Component properties
     */
    constructor(props = {}) {
        this.props = {
            title: props.title || 'Untitled Video',
            type: props.type || 'concept',
            youtubeId: props.youtubeId || '',
            duration: props.duration || '0:00'
        };
        
        this.element = null;
        this.isModalOpen = false;
        this.lastClickTime = 0;
        
        // Bind methods
        this.handleWatchClick = this.handleWatchClick.bind(this);
        this.handleThumbnailError = this.handleThumbnailError.bind(this);
    }

    /**
     * Get YouTube thumbnail URL
     * @returns {string} Thumbnail URL
     */
    getThumbnailUrl() {
        if (!this.props.youtubeId) {
            return FALLBACK_THUMBNAIL;
        }
        return `https://img.youtube.com/vi/${this.props.youtubeId}/hqdefault.jpg`;
    }

    /**
     * Get YouTube video URL
     * @returns {string} Video URL
     */
    getVideoUrl() {
        return `https://www.youtube.com/watch?v=${this.props.youtubeId}`;
    }

    /**
     * Get type configuration
     * @returns {Object} Type config
     */
    getTypeConfig() {
        return TYPE_CONFIG[this.props.type] || TYPE_CONFIG.concept;
    }

    /**
     * Handle thumbnail load error
     * @param {Event} event - Error event
     */
    handleThumbnailError(event) {
        event.target.src = FALLBACK_THUMBNAIL;
        event.target.alt = 'Video thumbnail unavailable';
    }

    /**
     * Handle watch button click with debounce
     * @param {Event} event - Click event
     */
    handleWatchClick(event) {
        event.preventDefault();
        
        // Debounce - prevent rapid clicks
        const now = Date.now();
        if (now - this.lastClickTime < 500) {
            return;
        }
        this.lastClickTime = now;
        
        if (!this.props.youtubeId) {
            console.warn('VideoCard: No video ID available');
            return;
        }
        
        // Open in new tab (MVP approach - simpler than modal)
        window.open(this.getVideoUrl(), '_blank', 'noopener,noreferrer');
    }

    /**
     * Render the component
     * @returns {HTMLElement} The rendered element
     */
    render() {
        const typeConfig = this.getTypeConfig();
        
        const card = document.createElement('div');
        card.className = 'video-card bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200';
        
        // Thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'relative aspect-video bg-gray-900';
        
        // Thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.src = this.getThumbnailUrl();
        thumbnail.alt = this.props.title;
        thumbnail.className = 'w-full h-full object-cover';
        thumbnail.loading = 'lazy';
        thumbnail.onerror = this.handleThumbnailError;
        thumbnailContainer.appendChild(thumbnail);
        
        // Play overlay
        const playOverlay = document.createElement('div');
        playOverlay.className = 'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer';
        playOverlay.addEventListener('click', this.handleWatchClick);
        
        const playIcon = document.createElement('div');
        playIcon.className = 'w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg';
        playIcon.innerHTML = `
            <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
        playOverlay.appendChild(playIcon);
        thumbnailContainer.appendChild(playOverlay);
        
        // Duration badge
        const durationBadge = document.createElement('span');
        durationBadge.className = 'absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded';
        durationBadge.textContent = this.props.duration;
        thumbnailContainer.appendChild(durationBadge);
        
        card.appendChild(thumbnailContainer);
        
        // Content section
        const content = document.createElement('div');
        content.className = 'p-3';
        
        // Type badge
        const typeBadge = new TagBadge({
            text: typeConfig.label,
            variant: typeConfig.variant
        });
        content.appendChild(typeBadge.render());
        
        // Title
        const title = document.createElement('h4');
        title.className = 'mt-2 text-sm font-medium text-gray-200 line-clamp-2';
        title.textContent = this.props.title;
        content.appendChild(title);
        
        // Watch button
        const watchBtn = document.createElement('button');
        watchBtn.className = 'mt-3 w-full px-3 py-2 bg-cyan-600/20 text-cyan-400 text-sm font-medium rounded hover:bg-cyan-600/30 transition-colors flex items-center justify-center gap-2';
        watchBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Watch Video
        `;
        watchBtn.addEventListener('click', this.handleWatchClick);
        content.appendChild(watchBtn);
        
        card.appendChild(content);
        
        this.element = card;
        return card;
    }

    /**
     * Cleanup component resources
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

export { VideoCard };
export default VideoCard;
