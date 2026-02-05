/**
 * ServiceManager - Handles service-related operations
 * 
 * Responsibilities:
 * - Service placement
 * - Service health management
 * - Dependencies between services
 * - Failures & degradation
 * - Connection management
 * 
 * @module ServiceManager
 */

class ServiceManager {
    constructor() {
        // Manager is stateless - uses STATE directly
    }

    /**
     * Create a new service at the specified position
     * @param {string} type - Service type (waf, alb, compute, db, s3, sqs, cache, cdn)
     * @param {THREE.Vector3} pos - Position to place the service
     * @param {Function} flashMoneyCallback - Callback when insufficient funds
     * @returns {Service|null} The created service or null
     */
    createService(type, pos, flashMoneyCallback) {
        if (STATE.money < CONFIG.services[type].cost) {
            flashMoneyCallback();
            return null;
        }
        if (STATE.services.find((s) => s.position.distanceTo(pos) < 1)) return null;
        
        const cost = CONFIG.services[type].cost;
        STATE.money -= cost;
        if (STATE.finances) {
            STATE.finances.expenses.services += cost;
            STATE.finances.expenses.byService[type] =
                (STATE.finances.expenses.byService[type] || 0) + cost;
            STATE.finances.expenses.countByService[type] =
                (STATE.finances.expenses.countByService[type] || 0) + 1;
        }
        const service = new Service(type, pos);
        STATE.services.push(service);
        STATE.sound.playPlace();
        
        if (window.gameUIManager) {
            window.gameUIManager.updateRepairCostTable();
        }

        // Notify tutorial
        if (window.tutorial?.isActive) {
            window.tutorial.onAction("place", { type });
        }
        
        return service;
    }

    /**
     * Restore a service from saved data
     * @param {Object} serviceData - Saved service data
     * @param {THREE.Vector3} pos - Position to restore at
     * @returns {Service} The restored service
     */
    restoreService(serviceData, pos) {
        const service = Service.restore(serviceData, pos);
        STATE.services.push(service);
        STATE.sound.playPlace();
        return service;
    }

    /**
     * Delete a service
     * @param {string} id - Service ID
     * @param {THREE.Group} connectionGroup - Connection group to clean up visuals
     */
    deleteObject(id, connectionGroup) {
        const svc = STATE.services.find((s) => s.id === id);
        if (!svc) return;

        STATE.services.forEach(
            (s) => (s.connections = s.connections.filter((c) => c !== id))
        );
        STATE.internetNode.connections = STATE.internetNode.connections.filter(
            (c) => c !== id
        );
        const toRemove = STATE.connections.filter(
            (c) => c.from === id || c.to === id
        );
        // Properly dispose geometry and materials to prevent memory leak
        toRemove.forEach((c) => {
            connectionGroup.remove(c.mesh);
            c.mesh.geometry.dispose();
            c.mesh.material.dispose();
        });
        STATE.connections = STATE.connections.filter((c) => !toRemove.includes(c));

        svc.destroy();
        STATE.services = STATE.services.filter((s) => s.id !== id);
        STATE.money += Math.floor(svc.config.cost / 2);
        STATE.sound.playDelete();
        
        if (window.gameUIManager) {
            window.gameUIManager.updateRepairCostTable();
        }
    }

    /**
     * Create a connection between two entities
     * @param {string} fromId - Source entity ID
     * @param {string} toId - Target entity ID
     * @param {THREE.Group} connectionGroup - Connection group for visuals
     * @returns {boolean} Whether the connection was created
     */
    createConnection(fromId, toId, connectionGroup) {
        if (fromId === toId) return false;
        
        const getEntity = (id) =>
            id === "internet"
                ? STATE.internetNode
                : STATE.services.find((s) => s.id === id);
        const from = getEntity(fromId),
            to = getEntity(toId);
        if (!from || !to || from.connections.includes(toId)) return false;

        let valid = false;
        const t1 = from.type,
            t2 = to.type;

        if (t1 === "internet" && (t2 === "waf" || t2 === "alb")) valid = true;
        else if (t1 === "waf" && t2 === "alb") valid = true;
        else if (t1 === "waf" && t2 === "sqs") valid = true;
        else if (t1 === "sqs" && t2 === "alb") valid = true;
        else if (t1 === "alb" && t2 === "sqs") valid = true;
        else if (t1 === "sqs" && t2 === "compute") valid = true;
        else if (t1 === "alb" && t2 === "compute") valid = true;
        else if (t1 === "compute" && t2 === "cache") valid = true;
        else if (t1 === "cache" && (t2 === "db" || t2 === "s3")) valid = true;
        else if (t1 === "compute" && (t2 === "db" || t2 === "s3")) valid = true;
        else if (t1 === "internet" && t2 === "cdn") valid = true;
        else if (t1 === "cdn" && t2 === "s3") valid = true;

        if (!valid) {
            new Audio("/sounds/click-9.mp3").play();
            console.error(i18n.t('invalid_topology_detailed'));
            return false;
        }

        new Audio("/sounds/click-5.mp3").play();

        from.connections.push(toId);
        const pts = [from.position.clone(), to.position.clone()];
        pts[0].y = pts[1].y = 1;
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: CONFIG.colors.line });
        const line = new THREE.Line(geo, mat);
        connectionGroup.add(line);
        STATE.connections.push({ from: fromId, to: toId, mesh: line });
        STATE.sound.playConnect();

        // Notify tutorial
        if (window.tutorial?.isActive) {
            window.tutorial.onAction("connect", {
                from: fromId,
                fromType: t1,
                toType: t2,
            });
        }
        
        return true;
    }

    /**
     * Delete a connection between two entities
     * @param {string} fromId - Source entity ID
     * @param {string} toId - Target entity ID
     * @param {THREE.Group} connectionGroup - Connection group for visuals
     * @returns {boolean} Whether the connection was deleted
     */
    deleteConnection(fromId, toId, connectionGroup) {
        const getEntity = (id) =>
            id === "internet"
                ? STATE.internetNode
                : STATE.services.find((s) => s.id === id);
        const from = getEntity(fromId);
        if (!from) return false;

        // Check if connection exists
        if (!from.connections.includes(toId)) return false;

        // Remove from service connections array
        from.connections = from.connections.filter((c) => c !== toId);

        // Find and remove the visual mesh
        const conn = STATE.connections.find(
            (c) => c.from === fromId && c.to === toId
        );
        if (conn) {
            connectionGroup.remove(conn.mesh);
            conn.mesh.geometry.dispose();
            conn.mesh.material.dispose();
            STATE.connections = STATE.connections.filter((c) => c !== conn);
        }

        STATE.sound.playDelete();
        return true;
    }

    /**
     * Get connection at a specific point (for unlink tool)
     * @param {number} clientX - Mouse X position
     * @param {number} clientY - Mouse Y position
     * @param {THREE.Raycaster} raycaster - Raycaster for hit testing
     * @param {THREE.Camera} camera - Camera for raycasting
     * @param {THREE.Plane} plane - Ground plane
     * @returns {Object|null} Connection object or null
     */
    getConnectionAtPoint(clientX, clientY, raycaster, camera, plane) {
        const mouse = new THREE.Vector2();
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Get the click point on the ground plane
        const clickPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, clickPoint);
        clickPoint.y = 1; // Lines are at y=1

        // Check each connection for proximity to click
        const threshold = 2; // Distance threshold for clicking on a line

        for (const conn of STATE.connections) {
            const from =
                conn.from === "internet"
                    ? STATE.internetNode
                    : STATE.services.find((s) => s.id === conn.from);
            const to =
                conn.to === "internet"
                    ? STATE.internetNode
                    : STATE.services.find((s) => s.id === conn.to);

            if (!from || !to) continue;

            const p1 = new THREE.Vector3(from.position.x, 1, from.position.z);
            const p2 = new THREE.Vector3(to.position.x, 1, to.position.z);

            // Calculate distance from point to line segment
            const line = new THREE.Line3(p1, p2);
            const closestPoint = new THREE.Vector3();
            line.closestPointToPoint(clickPoint, true, closestPoint);

            const distance = clickPoint.distanceTo(closestPoint);

            if (distance < threshold) {
                return conn;
            }
        }

        return null;
    }

    /**
     * Update connection visuals when a node is moved
     * @param {string} nodeId - ID of the moved node
     */
    updateConnectionsForNode(nodeId) {
        STATE.connections.forEach((c) => {
            if (c.from === nodeId || c.to === nodeId) {
                const from =
                    c.from === "internet"
                        ? STATE.internetNode
                        : STATE.services.find((s) => s.id === c.from);
                const to =
                    c.to === "internet"
                        ? STATE.internetNode
                        : STATE.services.find((s) => s.id === c.to);

                if (!from || !to) return;

                const pts = [
                    new THREE.Vector3(from.position.x, 1, from.position.z),
                    new THREE.Vector3(to.position.x, 1, to.position.z),
                ];

                c.mesh.geometry.dispose();
                c.mesh.geometry = new THREE.BufferGeometry().setFromPoints(pts);
            }
        });
    }

    /**
     * Process auto-repair for all services
     * @param {number} dt - Delta time in seconds
     */
    processAutoRepair(dt) {
        if (!STATE.autoRepairEnabled || STATE.gameMode !== "survival") return;

        const config = CONFIG.survival.degradation;
        if (!config?.enabled) return;

        STATE.services.forEach((service) => {
            if (service.health < 100) {
                // Gradually heal - 5 health per second when auto-repair is on
                service.health = Math.min(100, service.health + 5 * dt);
                service.updateHealthVisual();
            }
        });
    }

    /**
     * Toggle auto-repair mode
     */
    toggleAutoRepair() {
        STATE.autoRepairEnabled = !STATE.autoRepairEnabled;
        const btn = document.getElementById("auto-repair-toggle");
        if (btn) {
            if (STATE.autoRepairEnabled) {
                btn.textContent = i18n.t('upkeep_on');
                btn.classList.remove("text-gray-400");
                btn.classList.add("text-green-400");
                if (window.gameEventManager) {
                    window.gameEventManager.addInterventionWarning(i18n.t('auto_repair_hint'), "info", 2000);
                }
            } else {
                btn.textContent = i18n.t('upkeep_off');
                btn.classList.remove("text-green-400");
                btn.classList.add("text-gray-400");
                if (window.gameEventManager) {
                    window.gameEventManager.addInterventionWarning(i18n.t('event_ended'), "info", 2000);
                }
            }
        }
        if (window.gameUIManager) {
            window.gameUIManager.updateRepairCostTable();
        }
    }

    /**
     * Update service health indicators in UI
     */
    updateServiceHealthIndicators() {
        if (STATE.gameMode !== "survival") return;
        if (!CONFIG.survival.degradation?.enabled) return;

        const healthContainer = document.getElementById("service-health-list");
        if (!healthContainer) return;

        const criticalServices = STATE.services.filter(
            (s) => s.health < (CONFIG.survival.degradation?.criticalHealth || 30)
        );

        if (criticalServices.length === 0) {
            healthContainer.innerHTML =
                `<div class="text-green-400 text-xs">${i18n.t('all_services_healthy')}</div>`;
            return;
        }

        healthContainer.innerHTML = criticalServices
            .map(
                (s) => `
            <div class="flex justify-between items-center text-xs mb-1">
                <span class="text-red-400">${i18n.t(s.type).toUpperCase()}</span>
                <span class="text-red-300">${i18n.t('hp_display', { hp: Math.round(s.health) })}</span>
            </div>
        `
            )
            .join("");
    }

    /**
     * Calculates the percentage of failure based on the load of the node.
     * @param {number} load - Fractions of 1 (0 to 1) of how loaded the node is
     * @returns {number} Chance of failure (0 to 1)
     */
    calculateFailChanceBasedOnLoad(load) {
        if (load <= 0.5) return 0;
        return 2 * (load - 0.5);
    }
}

// Export for use by other modules and global access
window.ServiceManager = ServiceManager;
