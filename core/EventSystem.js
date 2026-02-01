/**
 * EventSystem - Centralized event management for loose coupling between modules
 * Provides pub/sub pattern for component communication
 */
class EventSystem {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
        this.debugMode = false;
    }

    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        if (this.debugMode) {
            console.log(`EventSystem: Subscribed to '${event}'`);
        }

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     */
    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(callback);

        if (this.debugMode) {
            console.log(`EventSystem: Subscribed once to '${event}'`);
        }

        // Return unsubscribe function
        return () => this.onceListeners.get(event)?.delete(callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
            if (listeners.size === 0) {
                this.listeners.delete(event);
            }
        }

        const onceListeners = this.onceListeners.get(event);
        if (onceListeners) {
            onceListeners.delete(callback);
            if (onceListeners.size === 0) {
                this.onceListeners.delete(event);
            }
        }

        if (this.debugMode) {
            console.log(`EventSystem: Unsubscribed from '${event}'`);
        }
    }

    /**
     * Emit an event to all subscribers
     */
    emit(event, data = null) {
        if (this.debugMode) {
            console.log(`EventSystem: Emitting '${event}'`, data);
        }

        // Handle regular listeners
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventSystem: Error in listener for '${event}':`, error);
                }
            });
        }

        // Handle once listeners
        const onceListeners = this.onceListeners.get(event);
        if (onceListeners) {
            onceListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventSystem: Error in once listener for '${event}':`, error);
                }
            });
            // Clear once listeners after execution
            this.onceListeners.delete(event);
        }
    }

    /**
     * Get all active event names
     */
    getActiveEvents() {
        const events = new Set();
        this.listeners.forEach((_, event) => events.add(event));
        this.onceListeners.forEach((_, event) => events.add(event));
        return Array.from(events);
    }

    /**
     * Get listener count for an event
     */
    getListenerCount(event) {
        const regularCount = this.listeners.get(event)?.size || 0;
        const onceCount = this.onceListeners.get(event)?.size || 0;
        return regularCount + onceCount;
    }

    /**
     * Clear all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            // Clear all listeners if no event specified
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`EventSystem: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

export { EventSystem };