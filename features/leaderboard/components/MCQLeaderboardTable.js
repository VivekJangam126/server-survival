/**
 * MCQLeaderboardTable Component
 * Renders leaderboard table for MCQ challenges
 * Stateless, render-only component - no ranking logic
 */

import { getRankLabel } from '../leaderboard.constants.js';

class MCQLeaderboardTable {
    /**
     * Render MCQ leaderboard table
     * @param {Object} props - Component props
     * @param {Object} props.leaderboardData - Leaderboard data from logic layer
     * @param {Object} props.challengeDetails - Challenge details
     * @param {string} props.currentUserId - Current user ID for highlighting
     */
    static render(props) {
        const { leaderboardData, challengeDetails, currentUserId } = props;
        
        const container = document.getElementById('mcq-leaderboard-table');
        if (!container) {
            console.error('MCQLeaderboardTable: Container element not found');
            return;
        }

        // Check if we have data
        if (!leaderboardData || !leaderboardData.hasData) {
            this.renderEmpty({ 
                message: leaderboardData?.message || 'No attempts yet for this challenge' 
            });
            return;
        }

        // Render table with data
        this.renderTable(leaderboardData, challengeDetails, currentUserId, container);
    }

    /**
     * Render the leaderboard table with data
     * @param {Object} leaderboardData - Leaderboard data
     * @param {Object} challengeDetails - Challenge details
     * @param {string} currentUserId - Current user ID
     * @param {HTMLElement} container - Container element
     */
    static renderTable(leaderboardData, challengeDetails, currentUserId, container) {
        const { leaderboard, totalParticipants } = leaderboardData;
        
        // Limit to top 10 entries as specified
        const topEntries = leaderboard.slice(0, 10);
        
        const tableHTML = `
            <div class="glass-panel rounded-xl overflow-hidden">
                <!-- Table Header -->
                <div class="bg-gray-800 px-6 py-4 border-b border-gray-700">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold text-white">
                                ${challengeDetails ? challengeDetails.title : 'Challenge Leaderboard'}
                            </h3>
                            <p class="text-gray-400 text-sm">
                                ${totalParticipants} participant${totalParticipants !== 1 ? 's' : ''} • 
                                Showing top ${Math.min(topEntries.length, 10)} results
                            </p>
                        </div>
                        ${challengeDetails ? `
                            <div class="text-right">
                                <div class="text-sm text-gray-400">Difficulty</div>
                                <div class="text-sm font-medium ${
                                    challengeDetails.difficulty === 'beginner' ? 'text-green-400' : 'text-yellow-400'
                                }">
                                    ${challengeDetails.difficulty.charAt(0).toUpperCase() + challengeDetails.difficulty.slice(1)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Table Content -->
                <div class="overflow-x-auto scrollable-container">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Score (%)
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Time Taken
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Attempt Date
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-800 divide-y divide-gray-700">
                            ${topEntries.map(entry => this.renderTableRow(entry, currentUserId)).join('')}
                        </tbody>
                    </table>
                </div>

                ${leaderboard.length > 10 ? `
                    <div class="bg-gray-800 px-6 py-3 border-t border-gray-700 text-center">
                        <p class="text-gray-400 text-sm">
                            Showing top 10 of ${leaderboard.length} participants
                        </p>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    /**
     * Render a single table row
     * @param {Object} entry - Leaderboard entry
     * @param {string} currentUserId - Current user ID for highlighting
     * @returns {string} HTML for table row
     */
    static renderTableRow(entry, currentUserId) {
        const { rank, userId, percentage, timeTaken, completedAt } = entry;
        
        // Check if this is the current user
        const isCurrentUser = userId === currentUserId;
        
        // Format time taken (convert seconds to mm:ss)
        const timeFormatted = this.formatTime(timeTaken);
        
        // Format date
        const dateFormatted = this.formatDate(completedAt);
        
        // Get rank badge class
        const rankBadgeClass = this.getRankBadgeClass(rank);
        
        return `
            <tr class="leaderboard-row ${isCurrentUser ? 'bg-blue-900 bg-opacity-30' : 'hover:bg-gray-700'} transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <span class="rank-badge ${rankBadgeClass} px-2 py-1 rounded-full text-xs font-bold">
                            ${getRankLabel(rank)}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <span class="text-sm font-medium ${isCurrentUser ? 'text-blue-300' : 'text-white'}">
                            ${userId}
                        </span>
                        ${isCurrentUser ? '<span class="ml-2 text-xs text-blue-400">(You)</span>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold ${this.getScoreColor(percentage)}">
                        ${percentage.toFixed(1)}%
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-300">
                        ${timeFormatted}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-400">
                        ${dateFormatted}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render empty state
     * @param {Object} props - Props with message
     */
    static renderEmpty(props) {
        const { message = 'No attempts yet for this challenge' } = props;
        
        const container = document.getElementById('mcq-leaderboard-table');
        if (!container) return;

        const emptyHTML = `
            <div class="glass-panel rounded-xl p-12 text-center">
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-xl font-bold mb-2 text-gray-300">No Leaderboard Data</h3>
                <p class="text-gray-400">${message}</p>
            </div>
        `;

        container.innerHTML = emptyHTML;
    }

    /**
     * Get rank badge CSS class
     * @param {number} rank - Rank number
     * @returns {string} CSS class
     */
    static getRankBadgeClass(rank) {
        switch (rank) {
            case 1: return 'rank-1';
            case 2: return 'rank-2';
            case 3: return 'rank-3';
            default: return 'bg-gray-600 text-white';
        }
    }

    /**
     * Get score color based on percentage
     * @param {number} percentage - Score percentage
     * @returns {string} CSS class
     */
    static getScoreColor(percentage) {
        if (percentage >= 90) return 'text-green-400';
        if (percentage >= 70) return 'text-yellow-400';
        if (percentage >= 50) return 'text-orange-400';
        return 'text-red-400';
    }

    /**
     * Format time in seconds to mm:ss
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time
     */
    static formatTime(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            return '--:--';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format timestamp to readable date
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    static formatDate(timestamp) {
        if (typeof timestamp !== 'number' || timestamp <= 0) {
            return 'Unknown';
        }
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }
}

// Export to global scope
window.MCQLeaderboardTable = MCQLeaderboardTable;