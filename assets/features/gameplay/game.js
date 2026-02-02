/**
 * game.js - Main Game Orchestrator
 * 
 * This is a thin orchestrator that:
 * - Instantiates managers
 * - Wires dependencies
 * - Delegates calls
 * - Handles input/events
 * 
 * All game logic has been moved to:
 * - ScoreManager.js
 * - TrafficManager.js
 * - ServiceManager.js
 * - EventManager.js
 * - GameUIManager.js
 * - GameEngine.js
 */

// ==================== INITIALIZE SOUND SERVICE ====================
STATE.sound = new SoundService();

// ==================== UTILITY FUNCTIONS (kept for backward compatibility) ====================

function formatTime(totalSeconds) {
    return window.gameUIManager.formatTime(totalSeconds);
}

// Backward compatibility exports
function getUpkeepMultiplier() {
    return window.gameScoreManager.getUpkeepMultiplier();
}

function calculateFailChanceBasedOnLoad(load) {
    return window.gameServiceManager.calculateFailChanceBasedOnLoad(load);
}

// ==================== THREE.JS SCENE SETUP ====================

const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.bg);
scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.008);

let isDraggingNode = false;
let draggedNode = null;
let dragOffset = new THREE.Vector3();

const aspect = window.innerWidth / window.innerHeight;
const d = 50;
const camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    1,
    1000
);
const cameraTarget = new THREE.Vector3(0, 0, 0);
let isIsometric = true;
resetCamera();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const gridHelper = new THREE.GridHelper(
    CONFIG.gridSize * CONFIG.tileSize,
    CONFIG.gridSize,
    CONFIG.colors.grid,
    CONFIG.colors.grid
);
scene.add(gridHelper);

const serviceGroup = new THREE.Group();
const connectionGroup = new THREE.Group();
const requestGroup = new THREE.Group();
scene.add(serviceGroup);
scene.add(connectionGroup);
scene.add(requestGroup);

// Internet node setup
const internetGeo = new THREE.BoxGeometry(6, 1, 10);
const internetMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0x00ffff,
    emissiveIntensity: 0.7,
    roughness: 0.2,
});
const internetMesh = new THREE.Mesh(internetGeo, internetMat);
internetMesh.position.copy(STATE.internetNode.position);
internetMesh.castShadow = true;
internetMesh.receiveShadow = true;
scene.add(internetMesh);
STATE.internetNode.mesh = internetMesh;

const intRingGeo = new THREE.RingGeometry(7, 7.2, 32);
const intRingMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
});
const internetRing = new THREE.Mesh(intRingGeo, intRingMat);
internetRing.rotation.x = -Math.PI / 2;
internetRing.position.set(
    internetMesh.position.x,
    -internetMesh.position.y + 0.1,
    internetMesh.position.z
);
scene.add(internetRing);
STATE.internetNode.ring = internetRing;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// ==================== INSTANTIATE MANAGERS ====================

const gameScoreManager = new ScoreManager();
const gameTrafficManager = new TrafficManager();
const gameServiceManager = new ServiceManager();
const gameEventManager = new EventManager();
const gameUIManager = new GameUIManager();
const gameEngine = new GameEngine({
    scene,
    camera,
    renderer,
    serviceGroup,
    connectionGroup,
    requestGroup,
    container
});

// Wire dependencies
gameEngine.setManagers({
    scoreManager: gameScoreManager,
    trafficManager: gameTrafficManager,
    serviceManager: gameServiceManager,
    eventManager: gameEventManager,
    uiManager: gameUIManager
});

// Global exports for backward compatibility and cross-module access
window.gameScoreManager = gameScoreManager;
window.gameTrafficManager = gameTrafficManager;
window.gameServiceManager = gameServiceManager;
window.gameEventManager = gameEventManager;
window.gameUIManager = gameUIManager;
window.gameEngine = gameEngine;

// ==================== BACKWARD COMPATIBILITY FUNCTIONS ====================

// These functions delegate to managers but keep the same API

function updateScore(req, outcome) {
    gameScoreManager.updateScore(req, outcome);
}

function updateScoreUI() {
    gameScoreManager.updateScoreUI();
}

function flashMoney() {
    gameScoreManager.flashMoney();
}

function addInterventionWarning(message, type, duration) {
    gameEventManager.addInterventionWarning(message, type, duration);
}

function finishRequest(req) {
    gameEngine.finishRequest(req);
}

function failRequest(req) {
    gameEngine.failRequest(req);
}

function removeRequest(req) {
    gameEngine.removeRequest(req);
}

function showMainMenu() {
    gameUIManager.showMainMenu();
}

function resetGame(mode) {
    gameEngine.resetGame(mode);
}

function restartGame() {
    gameEngine.restartGame();
}

function toggleAutoRepair() {
    gameServiceManager.toggleAutoRepair();
}

function updateRepairCostTable() {
    gameUIManager.updateRepairCostTable();
}

function createService(type, pos) {
    gameServiceManager.createService(type, pos, flashMoney);
}

function restoreService(serviceData, pos) {
    gameServiceManager.restoreService(serviceData, pos);
}

function createConnection(fromId, toId) {
    gameServiceManager.createConnection(fromId, toId, connectionGroup);
}

function deleteConnection(fromId, toId) {
    gameServiceManager.deleteConnection(fromId, toId, connectionGroup);
}

function deleteObject(id) {
    gameServiceManager.deleteObject(id, connectionGroup);
}

function retryWithSameArchitecture() {
    gameEngine.retryWithSameArchitecture();
}

// ==================== INPUT HANDLING ====================

let isPanning = false;
let lastMouseX = 0;
let lastMouseY = 0;
const panSpeed = 0.1;

const keysPressed = {};

window.addEventListener("keydown", (e) => {
    keysPressed[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false;
});

function getIntersect(clientX, clientY) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(serviceGroup.children, true);
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== serviceGroup) obj = obj.parent;
        return { type: "service", id: obj.userData.id, obj: obj };
    }

    const intInter = raycaster.intersectObject(STATE.internetNode.mesh);
    if (intInter.length > 0)
        return { type: "internet", id: "internet", obj: STATE.internetNode.mesh };

    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    return { type: "ground", pos: target };
}

function snapToGrid(vec) {
    const s = CONFIG.tileSize;
    return new THREE.Vector3(
        Math.round(vec.x / s) * s,
        0,
        Math.round(vec.z / s) * s
    );
}

// ==================== TOOL HANDLING ====================

window.setTool = (t) => {
    STATE.activeTool = t;
    STATE.selectedNodeId = null;
    document
        .querySelectorAll(".service-btn")
        .forEach((b) => b.classList.remove("active"));
    document.getElementById(`tool-${t}`).classList.add("active");
    new Audio("/assets/sounds/click-9.mp3").play();
};

window.setTimeScale = (s) => {
    STATE.timeScale = s;
    document
        .querySelectorAll(".time-btn")
        .forEach((b) => b.classList.remove("active"));

    if (s === 0) {
        document.getElementById("btn-pause").classList.add("active");
        if (!window.tutorial?.isActive) {
            document.getElementById("btn-play").classList.add("pulse-green");
        }
    } else if (s === 1) {
        document.getElementById("btn-play").classList.add("active");
        document.getElementById("btn-play").classList.remove("pulse-green");
        if (window.tutorial?.isActive) {
            window.tutorial.onAction("start_game");
        }
    } else if (s === 3) {
        document.getElementById("btn-fast").classList.add("active");
        document.getElementById("btn-play").classList.remove("pulse-green");
    }
};

window.toggleMute = () => {
    const muted = STATE.sound.toggleMute();
    const icon = document.getElementById("mute-icon");
    const menuIcon = document.getElementById("menu-mute-icon");

    const iconText = muted ? "🔇" : "🔊";
    if (icon) icon.innerText = iconText;
    if (menuIcon) menuIcon.innerText = iconText;

    const muteBtn = document.getElementById("tool-mute");
    const menuMuteBtn = document.getElementById("menu-mute-btn");

    if (muted) {
        muteBtn.classList.add("bg-red-900");
        muteBtn.classList.add("pulse-green");
        if (menuMuteBtn) menuMuteBtn.classList.add("pulse-green");
    } else {
        muteBtn.classList.remove("bg-red-900");
        muteBtn.classList.remove("pulse-green");
        if (menuMuteBtn) menuMuteBtn.classList.remove("pulse-green");
    }
};

// ==================== ZOOM HANDLING ====================

let currentZoom = 1;
const minZoom = 0.5;
const maxZoom = 3.0;
const zoomSpeed = 0.001;

container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -zoomSpeed;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + zoomDelta));

    if (newZoom !== currentZoom) {
        currentZoom = newZoom;
        camera.zoom = currentZoom;
        camera.updateProjectionMatrix();
    }
}, { passive: false });

// ==================== UPGRADE INDICATOR ====================

let hoveredUpgradeService = null;
let hideUpgradeTimer = null;
const upgradeIndicator = document.getElementById("upgrade-indicator");
const upgradeCostEl = document.getElementById("upgrade-cost");

if (upgradeIndicator) {
    upgradeIndicator.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hoveredUpgradeService) {
            hoveredUpgradeService.upgrade();

            const tiers = CONFIG.services[hoveredUpgradeService.type].tiers;
            if (hoveredUpgradeService.tier < tiers.length) {
                const nextCost = tiers[hoveredUpgradeService.tier].cost;
                upgradeCostEl.textContent = `$${nextCost}`;

                if (STATE.money < nextCost) {
                    upgradeCostEl.classList.remove("bg-green-600", "border-green-400");
                    upgradeCostEl.classList.add("bg-red-600", "border-red-400");
                } else {
                    upgradeCostEl.classList.remove("bg-red-600", "border-red-400");
                    upgradeCostEl.classList.add("bg-green-600", "border-green-400");
                }
            } else {
                hoveredUpgradeService = null;
                upgradeIndicator.classList.add("hidden");
                if (hideUpgradeTimer) {
                    clearTimeout(hideUpgradeTimer);
                    hideUpgradeTimer = null;
                }
            }
        }
    });

    upgradeIndicator.addEventListener("mouseenter", () => {
        if (hideUpgradeTimer) {
            clearTimeout(hideUpgradeTimer);
            hideUpgradeTimer = null;
        }
    });

    upgradeIndicator.addEventListener("mouseleave", () => {
        if (hoveredUpgradeService) {
            hideUpgradeTimer = setTimeout(() => {
                hoveredUpgradeService = null;
                upgradeIndicator.classList.add("hidden");
                hideUpgradeTimer = null;
            }, 300);
        }
    });
}

// ==================== MOUSE EVENT HANDLERS ====================

container.addEventListener("contextmenu", (e) => e.preventDefault());

container.addEventListener("mousedown", (e) => {
    if (!STATE.isRunning) return;

    if (e.button === 2 || e.button === 1) {
        isPanning = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        container.style.cursor = "grabbing";
        e.preventDefault();
        return;
    }

    const i = getIntersect(e.clientX, e.clientY);
    if (STATE.activeTool === "select") {
        if (i.type === "service") {
            const svc = STATE.services.find((s) => s.id === i.id);
            const criticalHealth = CONFIG.survival.degradation?.criticalHealth || 40;
            if (svc && svc.health < criticalHealth && CONFIG.survival.degradation?.enabled) {
                if (svc.repair()) {
                    addInterventionWarning(
                        i18n.t('repaired_msg', { type: i18n.t(svc.type) }),
                        "info",
                        2000
                    );
                    return;
                }
            }
            draggedNode = svc;
        } else if (i.type === "internet") {
            draggedNode = STATE.internetNode;
        }
        if (draggedNode) {
            isDraggingNode = true;
            const hit = getIntersect(e.clientX, e.clientY);
            if (hit.pos) {
                dragOffset.copy(draggedNode.position).sub(hit.pos);
            }
            container.style.cursor = "grabbing";
            e.preventDefault();
            return;
        }
    } else if (STATE.activeTool === "delete" && i.type === "service") {
        deleteObject(i.id);
    } else if (STATE.activeTool === "unlink") {
        const conn = gameServiceManager.getConnectionAtPoint(e.clientX, e.clientY, raycaster, camera, plane);
        if (conn) {
            deleteConnection(conn.from, conn.to);
        } else {
            new Audio("/assets/sounds/click-9.mp3").play();
        }
    } else if (
        STATE.activeTool === "connect" &&
        (i.type === "service" || i.type === "internet")
    ) {
        if (STATE.selectedNodeId) {
            createConnection(STATE.selectedNodeId, i.id);
            STATE.selectedNodeId = null;
        } else {
            STATE.selectedNodeId = i.id;
            new Audio("/assets/sounds/click-5.mp3").play();
        }
    } else if (
        ["waf", "alb", "lambda", "db", "s3", "sqs", "cache", "cdn"].includes(
            STATE.activeTool
        )
    ) {
        if (
            (STATE.activeTool === "lambda" && i.type === "service") ||
            (STATE.activeTool === "db" && i.type === "service") ||
            (STATE.activeTool === "cache" && i.type === "service")
        ) {
            const svc = STATE.services.find((s) => s.id === i.id);
            if (
                svc &&
                ((STATE.activeTool === "lambda" && svc.type === "compute") ||
                    (STATE.activeTool === "db" && svc.type === "db") ||
                    (STATE.activeTool === "cache" && svc.type === "cache"))
            ) {
                svc.upgrade();
                return;
            }
        }
        if (i.type === "ground") {
            const typeMap = {
                waf: "waf",
                alb: "alb",
                lambda: "compute",
                db: "db",
                s3: "s3",
                sqs: "sqs",
                cache: "cache",
                cdn: "cdn",
            };

            const serviceType = typeMap[STATE.activeTool];
            if (serviceType) {
                createService(serviceType, snapToGrid(i.pos));
            }
        }
    }
});

container.addEventListener("mousemove", (e) => {
    if (isDraggingNode && draggedNode) {
        const hit = getIntersect(e.clientX, e.clientY);
        if (hit.pos) {
            const newPos = hit.pos.clone().add(dragOffset);
            newPos.y = 0;

            draggedNode.position.copy(newPos);

            if (draggedNode.mesh) {
                draggedNode.mesh.position.x = newPos.x;
                draggedNode.mesh.position.z = newPos.z;
            } else {
                STATE.internetNode.mesh.position.x = newPos.x;
                STATE.internetNode.mesh.position.z = newPos.z;
                STATE.internetNode.ring.position.x = newPos.x;
                STATE.internetNode.ring.position.z = newPos.z;
            }

            gameServiceManager.updateConnectionsForNode(draggedNode.id);
            container.style.cursor = "grabbing";
        }
        return;
    }
    
    if (isPanning) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;

        const panX = ((-dx * (camera.right - camera.left)) / window.innerWidth) * panSpeed;
        const panY = ((dy * (camera.top - camera.bottom)) / window.innerHeight) * panSpeed;

        if (isIsometric) {
            camera.position.x += panX;
            camera.position.z += panY;
            cameraTarget.x += panX;
            cameraTarget.z += panY;
            camera.lookAt(cameraTarget);
        } else {
            camera.position.x += panX;
            camera.position.z += panY;
            camera.lookAt(camera.position.x, 0, camera.position.z);
        }
        camera.updateProjectionMatrix();
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        gameUIManager.hideTooltip();
        return;
    }

    const i = getIntersect(e.clientX, e.clientY);
    const t = document.getElementById("tooltip");
    let cursor = "default";

    // Reset all connection colors first
    STATE.connections.forEach((c) => {
        if (c.mesh && c.mesh.material) {
            c.mesh.material.color.setHex(CONFIG.colors.line);
        }
    });

    // Handle unlink tool hover
    if (STATE.activeTool === "unlink") {
        const conn = gameServiceManager.getConnectionAtPoint(e.clientX, e.clientY, raycaster, camera, plane);
        if (conn) {
            cursor = "pointer";
            if (conn.mesh && conn.mesh.material) {
                conn.mesh.material.color.setHex(0xff4444);
            }

            const from =
                conn.from === "internet"
                    ? STATE.internetNode
                    : STATE.services.find((s) => s.id === conn.from);
            const to =
                conn.to === "internet"
                    ? STATE.internetNode
                    : STATE.services.find((s) => s.id === conn.to);
            const fromName =
                conn.from === "internet" ? i18n.t('internet') : from?.config?.name || i18n.t('unknown');
            const toName =
                conn.to === "internet" ? i18n.t('internet') : to?.config?.name || i18n.t('unknown');

            gameUIManager.showTooltip(
                e.clientX + 15,
                e.clientY + 15,
                `<strong class="text-orange-400">${i18n.t('remove_link')}</strong><br>
                <span class="text-gray-300">${fromName}</span> → <span class="text-gray-300">${toName}</span><br>
                <span class="text-red-400 text-xs">${i18n.t('click_to_remove')}</span>`
            );
        } else {
            t.style.display = "none";
        }
        container.style.cursor = cursor;
        return;
    }

    if (i.type === "service") {
        const s = STATE.services.find((s) => s.id === i.id);
        if (s) {
            const load = s.processing.length / s.config.capacity;
            let loadColor =
                load > 0.8
                    ? "text-red-400"
                    : load > 0.4
                        ? "text-yellow-400"
                        : "text-green-400";

            let content = `<strong class="text-blue-300">${i18n.t(s.type)}</strong>`;
            if (s.tier)
                content += ` <span class="text-xs text-yellow-400">T${s.tier}</span>`;

            const healthColor =
                s.health < 40
                    ? "text-red-400"
                    : s.health < 70
                        ? "text-yellow-400"
                        : "text-green-400";
            content += ` <span class="${healthColor}">${Math.round(s.health)}%</span>`;

            if (s.config.tooltip) {
                content += `<br><span class="text-xs text-gray-400">${i18n.t(s.type + '_desc')}</span>`;
                content += `<br><span class="text-xs text-gray-500">${i18n.t('upkeep_label')} <span class="text-gray-300">${i18n.t(s.config.tooltip.upkeep.toLowerCase().replace(' ', '_'))}</span></span>`;
            }

            content += `<div class="mt-1 border-t border-gray-700 pt-1">`;

            if (s.type === "cache") {
                const hitRate = Math.round((s.config.cacheHitRate || 0.35) * 100);
                content += `${i18n.t('queue_label')} <span class="${loadColor}">${s.queue.length}</span><br>
                ${i18n.t('load_label')} <span class="${loadColor}">${s.processing.length}/${s.config.capacity}</span><br>
                ${i18n.t('hit_rate_label')} <span class="text-green-400">${hitRate}%</span>`;
            } else if (s.type === "sqs") {
                const maxQ = s.config.maxQueueSize || 200;
                const fillPercent = Math.round((s.queue.length / maxQ) * 100);
                const status =
                    fillPercent > 80 ? i18n.t('status_critical') : fillPercent > 50 ? i18n.t('status_busy') : i18n.t('status_healthy');
                const statusColor =
                    fillPercent > 80
                        ? "text-red-400"
                        : fillPercent > 50
                            ? "text-yellow-400"
                            : "text-green-400";
                content += `${i18n.t('buffered_label')} <span class="${loadColor}">${s.queue.length}/${maxQ}</span><br>
                ${i18n.t('processing_label')} ${s.processing.length}/${s.config.capacity}<br>
                ${i18n.t('status_label')} <span class="${statusColor}">${status}</span>`;
            } else {
                content += `${i18n.t('queue_label')} <span class="${loadColor}">${s.queue.length}</span><br>
                ${i18n.t('load_label')} <span class="${loadColor}">${s.processing.length}/${s.config.capacity}</span>`;
            }
            content += `</div>`;

            if (
                (STATE.activeTool === "lambda" && s.type === "compute") ||
                (STATE.activeTool === "db" && s.type === "db") ||
                (STATE.activeTool === "cache" && s.type === "cache")
            ) {
                const tiers = CONFIG.services[s.type].tiers;
                if (s.tier < tiers.length) {
                    cursor = "pointer";
                    const nextCost = tiers[s.tier].cost;
                    content += `<div class="mt-1 pt-1 border-t border-gray-700"><span class="text-green-300 text-xs font-bold">${i18n.t('upgrade_label')} $${nextCost}</span></div>`;
                    if (s.mesh.material.emissive)
                        s.mesh.material.emissive.setHex(0x333333);
                } else {
                    content += `<div class="mt-1 pt-1 border-t border-gray-700"><span class="text-gray-500 text-xs">${i18n.t('max_tier')}</span></div>`;
                }
            }

            // Show upgrade indicator for upgradeable services
            if (["compute", "db", "cache"].includes(s.type)) {
                const tiers = CONFIG.services[s.type].tiers;
                if (s.tier < tiers.length) {
                    if (hideUpgradeTimer) {
                        clearTimeout(hideUpgradeTimer);
                        hideUpgradeTimer = null;
                    }

                    hoveredUpgradeService = s;
                    const nextCost = tiers[s.tier].cost;

                    const pos = s.mesh.position.clone();
                    pos.y += 3;
                    pos.project(camera);

                    const x = (pos.x * .5 + .5) * container.clientWidth;
                    const y = (pos.y * -.5 + .5) * container.clientHeight;

                    if (upgradeIndicator && upgradeCostEl) {
                        upgradeIndicator.style.left = `${x}px`;
                        upgradeIndicator.style.top = `${y}px`;
                        upgradeIndicator.classList.remove("hidden");
                        upgradeCostEl.textContent = `$${nextCost}`;

                        if (STATE.money < nextCost) {
                            upgradeCostEl.classList.remove("bg-green-600", "border-green-400");
                            upgradeCostEl.classList.add("bg-red-600", "border-red-400");
                        } else {
                            upgradeCostEl.classList.remove("bg-red-600", "border-red-400");
                            upgradeCostEl.classList.add("bg-green-600", "border-green-400");
                        }
                    }
                } else {
                    if (hoveredUpgradeService === s) {
                        hoveredUpgradeService = null;
                        if (upgradeIndicator) upgradeIndicator.classList.add("hidden");
                    }
                }
            } else {
                if (hoveredUpgradeService && !hideUpgradeTimer) {
                    hideUpgradeTimer = setTimeout(() => {
                        hoveredUpgradeService = null;
                        if (upgradeIndicator) upgradeIndicator.classList.add("hidden");
                        hideUpgradeTimer = null;
                    }, 300);
                }
            }

            gameUIManager.showTooltip(e.clientX + 15, e.clientY + 15, content);

            STATE.services.forEach((svc) => {
                if (svc !== s && svc.mesh.material.emissive)
                    svc.mesh.material.emissive.setHex(0x000000);
            });
        }
    } else {
        t.style.display = "none";
        STATE.services.forEach((svc) => {
            if (svc.mesh.material.emissive)
                svc.mesh.material.emissive.setHex(0x000000);
        });

        if (hoveredUpgradeService && !hideUpgradeTimer) {
            hideUpgradeTimer = setTimeout(() => {
                hoveredUpgradeService = null;
                if (upgradeIndicator) upgradeIndicator.classList.add("hidden");
                hideUpgradeTimer = null;
            }, 300);
        }
    }

    container.style.cursor = cursor;
});

container.addEventListener("mouseup", (e) => {
    if (e.button === 2 || e.button === 1) {
        isPanning = false;
        container.style.cursor = "default";
    }
    if (isDraggingNode && draggedNode) {
        isDraggingNode = false;

        const snapped = snapToGrid(draggedNode.position);
        draggedNode.position.copy(snapped);

        if (draggedNode.mesh) {
            draggedNode.mesh.position.x = snapped.x;
            draggedNode.mesh.position.z = snapped.z;
        } else {
            STATE.internetNode.mesh.position.x = snapped.x;
            STATE.internetNode.mesh.position.z = snapped.z;
            STATE.internetNode.ring.position.x = snapped.x;
            STATE.internetNode.ring.position.z = snapped.z;
        }

        gameServiceManager.updateConnectionsForNode(draggedNode.id);
        draggedNode = null;
        container.style.cursor = "default";
        return;
    }
});

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const menu = document.getElementById("main-menu-modal");
        if (menu.classList.contains("hidden")) {
            gameEngine.openMainMenu();
        } else if (STATE.gameStarted && STATE.isRunning) {
            gameEngine.resumeGame();
        }
        return;
    }
    if (event.key === "H" || event.key === "h") {
        document.getElementById("statsPanel").classList.toggle("hidden");
        document.getElementById("detailsPanel").classList.toggle("hidden");
        document.getElementById("objectivesPanel").classList.toggle("hidden");
    }
    if (event.key === "R" || event.key === "r") {
        resetCamera();
    }
    if (event.key === "T" || event.key === "t") {
        toggleView();
    }
});

// ==================== CAMERA FUNCTIONS ====================

function toggleView() {
    isIsometric = !isIsometric;
    resetCamera();
}

function resetCamera() {
    if (isIsometric) {
        camera.position.set(40, 40, 40);
        cameraTarget.set(0, 0, 0);
        camera.lookAt(cameraTarget);
    } else {
        camera.position.set(0, 50, 0);
        camera.lookAt(0, 0, 0);
    }
}

// ==================== WINDOW RESIZE ====================

window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==================== FAQ MODAL ====================

let faqSource = "menu";

window.showFAQ = (source = "menu") => {
    faqSource = source;
    if (!document.getElementById("main-menu-modal").classList.contains("hidden")) {
        faqSource = "menu";
        document.getElementById("main-menu-modal").classList.add("hidden");
    } else {
        faqSource = "game";
    }
    document.getElementById("faq-modal").classList.remove("hidden");
};

window.closeFAQ = () => {
    document.getElementById("faq-modal").classList.add("hidden");
    if (faqSource === "menu") {
        document.getElementById("main-menu-modal").classList.remove("hidden");
    }
};

window.togglePanel = (contentId, iconId) => {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    if (content) {
        content.classList.toggle('hidden');
        if (icon) {
            icon.innerText = content.classList.contains('hidden') ? '▼' : '▲';
        }
    }
};

// ==================== GAME START ====================

window.startGame = () => {
    gameEngine.startGame();
};

window.resumeGame = () => {
    gameEngine.resumeGame();
};

// ==================== GAME STATE HANDLER (for events) ====================

window.handleGameState = (timeScale) => {
    gameEventManager.handleGameState(timeScale);
};

// ==================== SAVE/LOAD FUNCTIONS ====================

window.saveGameState = () => {
    try {
        const saveData = {
            timestamp: Date.now(),
            version: "2.0",
            ...STATE,
            score: { ...STATE.score },
            trafficDistribution: { ...STATE.trafficDistribution },
            services: STATE.services.map((service) => ({
                id: service.id,
                type: service.type,
                position: [service.position.x, service.position.y, service.position.z],
                connections: [...service.connections],
                tier: service.tier,
                cacheHitRate: service.config.cacheHitRate || null,
            })),
            connections: STATE.connections.map((conn) => ({
                from: conn.from,
                to: conn.to,
            })),
            requests: [],
            internetConnections: [...STATE.internetNode.connections],
        };

        localStorage.setItem("serverSurvivalSave", JSON.stringify(saveData));

        if (window.sessionTracker) {
            window.sessionTracker.markSaveUsed();
        }

        const saveBtn = document.getElementById("btn-save");
        const originalColor = saveBtn.classList.contains("hover:border-green-500")
            ? ""
            : saveBtn.style.borderColor;
        saveBtn.style.borderColor = "#10b981";
        saveBtn.style.color = "#10b981";
        setTimeout(() => {
            saveBtn.style.borderColor = originalColor;
            saveBtn.style.color = "";
        }, 1000);

        STATE.sound.playPlace();
    } catch (error) {
        console.error("Failed to save game:", error);
        alert(i18n.t('save_failed'));
    }
};

function migrateOldSave(saveData) {
    if (saveData.trafficDistribution) {
        const oldDist = saveData.trafficDistribution;
        if ("WEB" in oldDist || "API" in oldDist || "FRAUD" in oldDist) {
            saveData.trafficDistribution = {
                STATIC: oldDist.WEB || 0,
                READ: (oldDist.API || 0) * 0.5,
                WRITE: (oldDist.API || 0) * 0.3,
                UPLOAD: 0.05,
                SEARCH: (oldDist.API || 0) * 0.2,
                MALICIOUS: oldDist.FRAUD || 0,
            };
        }
    }

    if (saveData.score) {
        const oldScore = saveData.score;
        if ("web" in oldScore || "api" in oldScore || "fraudBlocked" in oldScore) {
            saveData.score = {
                total: oldScore.total || 0,
                storage: oldScore.web || 0,
                database: oldScore.api || 0,
                maliciousBlocked: oldScore.fraudBlocked || 0,
            };
        }
    }

    if ("fraudSpikeTimer" in saveData) {
        saveData.maliciousSpikeTimer = saveData.fraudSpikeTimer;
        delete saveData.fraudSpikeTimer;
    }
    if ("fraudSpikeActive" in saveData) {
        saveData.maliciousSpikeActive = saveData.fraudSpikeActive;
        delete saveData.fraudSpikeActive;
    }

    return saveData;
}

window.loadGameState = () => {
    try {
        const saveDataStr = localStorage.getItem("serverSurvivalSave");
        if (!saveDataStr) {
            alert(i18n.t('no_save_found_msg'));
            return;
        }

        let saveData = JSON.parse(saveDataStr);

        if (!saveData.version || saveData.version === "1.0") {
            saveData = migrateOldSave(saveData);
        }

        clearCurrentGame();

        STATE.money = saveData.money || 0;
        STATE.reputation = saveData.reputation || 100;
        STATE.requestsProcessed = saveData.requestsProcessed || 0;
        STATE.score = { ...saveData.score } || {
            total: 0,
            storage: 0,
            database: 0,
            maliciousBlocked: 0,
        };
        STATE.activeTool = saveData.activeTool || "select";
        STATE.selectedNodeId = saveData.selectedNodeId || null;
        STATE.lastTime = performance.now();
        STATE.spawnTimer = saveData.spawnTimer || 0;
        STATE.currentRPS = saveData.currentRPS || 0.5;
        STATE.timeScale = saveData.timeScale || 0;
        STATE.elapsedGameTime = saveData.elapsedGameTime ?? 0;
        STATE.isRunning = saveData.isRunning || false;
        STATE.gameStartTime = performance.now();

        STATE.gameMode = "survival";
        STATE.upkeepEnabled = saveData.upkeepEnabled !== false;
        STATE.trafficDistribution = { ...saveData.trafficDistribution } || {
            STATIC: 0.3,
            READ: 0.2,
            WRITE: 0.15,
            UPLOAD: 0.05,
            SEARCH: 0.1,
            MALICIOUS: 0.2,
        };
        STATE.gameStarted = saveData.gameStarted || true;
        STATE.previousTimeScale = saveData.previousTimeScale || 1;

        STATE.intervention = {
            trafficShiftTimer: 0,
            trafficShiftActive: false,
            currentShift: null,
            originalTrafficDist: null,
            randomEventTimer: 0,
            activeEvent: null,
            eventEndTime: 0,
            currentMilestoneIndex: 0,
            rpsMultiplier: 1.0,
            recentEvents: [],
            warnings: [],
            costMultiplier: 1.0,
            trafficBurstMultiplier: 1.0,
        };
        STATE.maliciousSpikeTimer = 0;
        STATE.maliciousSpikeActive = false;
        STATE.normalTrafficDist = null;
        STATE.autoRepairEnabled = false;

        STATE.finances = {
            income: {
                byType: { STATIC: 0, READ: 0, WRITE: 0, UPLOAD: 0, SEARCH: 0 },
                countByType: { STATIC: 0, READ: 0, WRITE: 0, UPLOAD: 0, SEARCH: 0, blocked: 0 },
                requests: 0,
                blocked: 0,
                total: 0,
            },
            expenses: {
                services: 0,
                upkeep: 0,
                repairs: 0,
                autoRepair: 0,
                mitigation: 0,
                breach: 0,
                byService: { waf: 0, alb: 0, compute: 0, db: 0, s3: 0, cache: 0, sqs: 0 },
                countByService: { waf: 0, alb: 0, compute: 0, db: 0, s3: 0, cache: 0, sqs: 0 },
            },
        };

        restoreServices(saveData.services);
        restoreConnections(saveData.connections, saveData.internetConnections || []);

        gameScoreManager.updateScoreUI();
        document.getElementById("money-display").innerText = `$${Math.floor(STATE.money)}`;
        document.getElementById("rep-bar").style.width = `${Math.max(0, STATE.reputation)}%`;
        document.getElementById("rps-display").innerText = `${STATE.currentRPS.toFixed(1)} ${i18n.t('req_per_sec')}`;

        const sandboxPanel = document.getElementById("sandboxPanel");
        const objectivesPanel = document.getElementById("objectivesPanel");

        if (sandboxPanel) sandboxPanel.classList.add("hidden");
        if (objectivesPanel) objectivesPanel.classList.remove("hidden");

        document.getElementById("main-menu-modal").classList.add("hidden");

        if (!STATE.animationId) {
            gameEngine.animate(performance.now());
        }

        STATE.sound.playPlace();
    } catch (error) {
        console.error("Failed to load game:", error);
        alert(i18n.t('load_failed_corrupted'));
    }
};

function clearCurrentGame() {
    while (serviceGroup.children.length > 0) {
        serviceGroup.remove(serviceGroup.children[0]);
    }
    while (connectionGroup.children.length > 0) {
        connectionGroup.remove(connectionGroup.children[0]);
    }
    while (requestGroup.children.length > 0) {
        requestGroup.remove(requestGroup.children[0]);
    }

    STATE.services.forEach((s) => s.destroy());
    STATE.services = [];
    STATE.requests = [];
    STATE.connections = [];
    STATE.internetNode.connections = [];
}

function restoreServices(savedServices) {
    savedServices.forEach((serviceData) => {
        const position = new THREE.Vector3(
            serviceData.position[0],
            serviceData.position[1],
            serviceData.position[2]
        );
        restoreService(serviceData, position);
    });
}

function restoreConnections(savedConnections, internetConnections) {
    internetConnections.forEach((serviceId) => {
        createConnection("internet", serviceId);
    });

    savedConnections.forEach((connData) => {
        createConnection(connData.from, connData.to);
    });
}

// ==================== INITIALIZATION ====================

// Setup UI tooltips
gameUIManager.setupUITooltips();

// Show main menu on startup (only if not in modular mode)
if (!window.app) {
    setTimeout(() => {
        showMainMenu();
    }, 100);
}
