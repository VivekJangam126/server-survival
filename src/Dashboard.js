// src/Dashboard.js
// Module to manage dashboard data and UI population

export const dashboardData = {
  stats: [
    { title: 'Current Level', value: 8, icon: '🎯', color: 'text-blue-400' },
    { title: 'Challenges Completed', value: 24, icon: '🏆', color: 'text-green-400' },
    { title: 'Tutorials Finished', value: 18, icon: '📚', color: 'text-purple-400' },
    { title: 'Achievements', value: 12, icon: '⭐', color: 'text-yellow-400' }
  ],

  activities: [
    { icon: '🏅', title: 'Earned Achievement: Mentor', description: 'Helped 10 other learners', time: '15 min ago', points: 100 },
    { icon: '💰', title: 'Completed Challenge: Cost Analysis', description: 'Optimized cloud costs by 35%', time: '30 min ago', points: 75 },
    { icon: '📚', title: 'Completed Tutorial: Cost Optimization', description: 'Learned advanced cost management', time: '1 hour ago', points: 50 },
    { icon: '🎯', title: 'New High Score: 3,250 points', description: 'Survived 30 minutes in hard mode', time: '2 hours ago', points: 125 }
  ],

  recommendations: [
    { title: 'Try Infrastructure Challenges', description: 'Test your skills with hands-on scenarios', priority: 'MEDIUM', priorityColor: 'bg-yellow-600' },
    { title: 'Explore Sandbox Mode', description: 'Experiment freely with cloud components', priority: 'LOW', priorityColor: 'bg-gray-600' },
    { title: 'Advanced Security Course', description: 'Master cloud security best practices', priority: 'HIGH', priorityColor: 'bg-red-600' }
  ],

  progress: [
    { skill: 'Infrastructure', percentage: 85, color: 'bg-blue-500' },
    { skill: 'Security', percentage: 72, color: 'bg-green-500' },
    { skill: 'Networking', percentage: 90, color: 'bg-purple-500' },
    { skill: 'Databases', percentage: 68, color: 'bg-yellow-500' }
  ],

  quickActions: [
    { title: 'Start Survival', description: 'Begin survival mode', icon: '⚡', color: 'bg-green-600 hover:bg-green-500', action: 'openPlayModal' },
    { title: 'Sandbox Mode', description: 'Free exploration', icon: '🛠️', color: 'bg-purple-600 hover:bg-purple-500', action: 'startSandbox' },
    { title: 'Learn', description: 'Tutorials & guides', icon: '📚', color: 'bg-blue-600 hover:bg-blue-500', action: 'openLearn' },
    { title: 'Achievements', description: 'View progress', icon: '🏆', color: 'bg-yellow-600 hover:bg-yellow-500', action: 'openAchievements' }
  ]
};

function el(selector) {
  return document.querySelector(selector);
}

export function populateStats(container = '#stats-grid', data = dashboardData.stats) {
  const node = el(container);
  if (!node) return;
  node.innerHTML = data.map(stat => `
    <div class="glass-panel p-6 rounded-xl">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm">${stat.title}</p>
          <p class="text-3xl font-bold text-white">${stat.value}</p>
        </div>
        <div class="text-4xl ${stat.color}">${stat.icon}</div>
      </div>
    </div>
  `).join('');
}

export function populateActivities(container = '#recent-activities', data = dashboardData.activities) {
  const node = el(container);
  if (!node) return;
  node.innerHTML = data.map(activity => `
    <div class="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
      <div class="text-2xl">${activity.icon}</div>
      <div class="flex-1">
        <p class="text-white font-medium">${activity.title}</p>
        <p class="text-gray-400 text-sm">${activity.description} • ${activity.time}</p>
      </div>
      <div class="text-green-400 font-bold">+${activity.points} XP</div>
    </div>
  `).join('');
}

export function populateRecommendations(container = '#recommendations', data = dashboardData.recommendations) {
  const node = el(container);
  if (!node) return;
  node.innerHTML = data.map(rec => `
    <div class="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition cursor-pointer">
      <h3 class="font-semibold text-white mb-1">${rec.title}</h3>
      <p class="text-gray-400 text-sm mb-2">${rec.description}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs px-2 py-1 rounded ${rec.priorityColor} text-white">${rec.priority}</span>
        <span class="text-blue-400">→</span>
      </div>
    </div>
  `).join('');
}

export function populateProgress(container = '#learning-progress', data = dashboardData.progress) {
  const node = el(container);
  if (!node) return;
  node.innerHTML = data.map(skill => `
    <div>
      <div class="flex justify-between text-sm mb-2">
        <span class="text-gray-300">${skill.skill}</span>
        <span class="text-blue-400">${skill.percentage}%</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div class="${skill.color} h-2 rounded-full" style="width: ${skill.percentage}%"></div>
      </div>
    </div>
  `).join('');
}

export function populateQuickActions(container = '#quick-actions', data = dashboardData.quickActions) {
  const node = el(container);
  if (!node) return;
  node.innerHTML = data.map(action => `
    <button onclick="${action.action}()" class="quick-action-btn ${action.color} text-white font-bold py-6 px-4 rounded-lg shadow-lg transform transition hover:scale-105">
      <div class="text-3xl mb-2">${action.icon}</div>
      <div class="text-lg font-bold">${action.title}</div>
      <div class="text-sm opacity-80">${action.description}</div>
    </button>
  `).join('');
}

export function populateAll() {
  populateStats();
  populateActivities();
  populateRecommendations();
  populateProgress();
  populateQuickActions();
}

// Handlers used by quick actions / modal
export function openPlayModal() {
  const m = document.getElementById('play-type-modal');
  if (m) m.classList.remove('hidden');
}

export function closePlayModal() {
  const m = document.getElementById('play-type-modal');
  if (m) m.classList.add('hidden');
}

export function startSurvival() {
  window.location.href = 'play.html?mode=survival';
}

export function startSandbox() {
  window.location.href = 'play.html?mode=sandbox';
}

export function resumeLast() {
  window.location.href = 'play.html?resume=1';
}

// Note: Auto-initialization is intentionally omitted so pages can import
// this module and control initialization lifecycle (avoids duplicate runs).
