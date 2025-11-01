// Game State
let playerCount = 5;
let imposterCount = 2;
let roles = [];
let currentPlayerIndex = 0;
let roleRevealed = false;

// Role Settings
let roleSettings = {
    enableEngineer: false,
    enableScientist: false,
    enableGuardian: false,
    enableShapeshifter: false,
    enableSaboteur: false,
    engineerCount: 1,
    scientistCount: 1,
    guardianCount: 1,
    shapeshifterCount: 1,
    saboteurCount: 1
};

// Role Definitions
const roleData = {
    // Crewmate roles
    'crewmate': {
        name: 'CREWMATE',
        icon: '👨‍🚀',
        description: 'Complete tasks and find the imposters!',
        color: 'crewmate',
        team: 'crew'
    },
    'engineer': {
        name: 'ENGINEER',
        icon: '🔧',
        description: 'Can use vents and fix sabotages faster!',
        color: 'engineer',
        team: 'crew'
    },
    'scientist': {
        name: 'SCIENTIST',
        icon: '🔬',
        description: 'Access vitals anytime to monitor crew health!',
        color: 'scientist',
        team: 'crew'
    },
    'guardian': {
        name: 'GUARDIAN ANGEL',
        icon: '👼',
        description: 'Protect a player from being killed once per round!',
        color: 'guardian',
        team: 'crew'
    },
    // Imposter roles
    'imposter': {
        name: 'IMPOSTER',
        icon: '🔪',
        description: 'Eliminate crewmates without getting caught!',
        color: 'imposter',
        team: 'imposters'
    },
    'shapeshifter': {
        name: 'SHAPESHIFTER',
        icon: '🎭',
        description: 'Transform into other players to deceive the crew!',
        color: 'shapeshifter',
        team: 'imposters'
    },
    'saboteur': {
        name: 'SABOTEUR',
        icon: '⚡',
        description: 'Sabotage cooldown reduced - chaos master!',
        color: 'saboteur',
        team: 'imposters'
    }
};

// Sound Effects (simple audio using Web Audio API)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
}

function playSound(type) {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'click':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'reveal':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'imposter':
        case 'shapeshifter':
        case 'saboteur':
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 200;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'crewmate':
            oscillator.type = 'sine';
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'engineer':
            oscillator.type = 'triangle';
            oscillator.frequency.value = 700;
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
            break;
        case 'scientist':
            oscillator.type = 'sine';
            oscillator.frequency.value = 900;
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
            break;
        case 'guardian':
            oscillator.type = 'sine';
            oscillator.frequency.value = 1000;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

// Screen Navigation
function showScreen(screenId) {
    playSound('click');
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showTitleScreen() {
    showScreen('titleScreen');
    resetGame();
}

function showSetupScreen() {
    showScreen('setupScreen');
    updateCrewmateCount();
}

function showRoleScreen() {
    showScreen('roleScreen');
}

function showResultsScreen() {
    showScreen('resultsScreen');
}

// Setup Screen Functions
function adjustPlayers(delta) {
    playSound('click');
    playerCount = Math.max(2, Math.min(100, playerCount + delta));
    document.getElementById('playerCount').value = playerCount;

    // Adjust imposters if necessary
    const maxImposters = Math.min(99, playerCount - 1);
    if (imposterCount > maxImposters) {
        imposterCount = maxImposters;
        document.getElementById('imposterCount').value = imposterCount;
    }

    updateCrewmateCount();
    updateRoleAvailability();
}

function adjustimposters(delta) {
    playSound('click');
    const maxImposters = Math.min(99, playerCount - 1);
    imposterCount = Math.max(1, Math.min(maxImposters, imposterCount + delta));
    document.getElementById('imposterCount').value = imposterCount;
    updateCrewmateCount();
    updateRoleAvailability();
}

function handlePlayerInput() {
    let value = parseInt(document.getElementById('playerCount').value);

    // Handle invalid input
    if (isNaN(value) || value < 2) {
        value = 2;
    } else if (value > 100) {
        value = 100;
    }

    playerCount = value;
    document.getElementById('playerCount').value = playerCount;

    // Adjust imposters if necessary
    const maxImposters = Math.min(99, playerCount - 1);
    if (imposterCount > maxImposters) {
        imposterCount = maxImposters;
        document.getElementById('imposterCount').value = imposterCount;
    }

    updateCrewmateCount();
    updateRoleAvailability();
}

function handleImposterInput() {
    let value = parseInt(document.getElementById('imposterCount').value);
    const maxImposters = Math.min(99, playerCount - 1);

    // Handle invalid input
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > maxImposters) {
        value = maxImposters;
    }

    imposterCount = value;
    document.getElementById('imposterCount').value = imposterCount;
    updateCrewmateCount();
    updateRoleAvailability();
}

function updateCrewmateCount() {
    const crewmates = playerCount - imposterCount;
    document.getElementById('crewmateCount').textContent = crewmates;
    document.getElementById('imposterDisplay').textContent = imposterCount;
}

function updateRoleSettings() {
    // Update toggle states
    roleSettings.enableEngineer = document.getElementById('enableEngineer').checked;
    roleSettings.enableScientist = document.getElementById('enableScientist').checked;
    roleSettings.enableGuardian = document.getElementById('enableGuardian').checked;
    roleSettings.enableShapeshifter = document.getElementById('enableShapeshifter').checked;
    roleSettings.enableSaboteur = document.getElementById('enableSaboteur').checked;

    // Update availability of other roles
    updateRoleAvailability();
}

function adjustRoleCount(role, delta) {
    playSound('click');

    const countKey = role + 'Count';
    const countElement = document.getElementById(countKey);

    let currentCount = roleSettings[countKey];
    let newCount = Math.max(1, currentCount + delta);

    // Limit based on team and available slots
    if (role === 'shapeshifter' || role === 'saboteur') {
        // For imposters: calculate remaining slots
        const usedSlots = getRemainingSlots('imposter', role);
        newCount = Math.min(imposterCount - usedSlots, newCount);
    } else {
        // For crew: calculate remaining slots
        const maxCrew = playerCount - imposterCount;
        const usedSlots = getRemainingSlots('crew', role);
        newCount = Math.min(maxCrew - usedSlots, newCount);
    }

    roleSettings[countKey] = newCount;
    countElement.textContent = newCount;

    // Update UI to show which roles can be enabled
    updateRoleAvailability();
}

function getRemainingSlots(team, excludeRole) {
    let used = 0;

    if (team === 'imposter') {
        if (excludeRole !== 'shapeshifter' && roleSettings.enableShapeshifter) {
            used += roleSettings.shapeshifterCount;
        }
        if (excludeRole !== 'saboteur' && roleSettings.enableSaboteur) {
            used += roleSettings.saboteurCount;
        }
    } else {
        if (excludeRole !== 'engineer' && roleSettings.enableEngineer) {
            used += roleSettings.engineerCount;
        }
        if (excludeRole !== 'scientist' && roleSettings.enableScientist) {
            used += roleSettings.scientistCount;
        }
        if (excludeRole !== 'guardian' && roleSettings.enableGuardian) {
            used += roleSettings.guardianCount;
        }
    }

    return used;
}

function updateRoleAvailability() {
    const maxCrew = playerCount - imposterCount;
    const usedCrewSlots = getRemainingSlots('crew', null);
    const usedImposterSlots = getRemainingSlots('imposter', null);

    // Disable crew role toggles if all slots are used
    const crewRoles = ['engineer', 'scientist', 'guardian'];
    crewRoles.forEach(role => {
        const checkbox = document.getElementById('enable' + role.charAt(0).toUpperCase() + role.slice(1));
        const toggleGroup = checkbox.closest('.toggle-group');

        if (!roleSettings['enable' + role.charAt(0).toUpperCase() + role.slice(1)] && usedCrewSlots >= maxCrew) {
            toggleGroup.style.opacity = '0.3';
            toggleGroup.style.pointerEvents = 'none';
        } else {
            toggleGroup.style.opacity = '1';
            toggleGroup.style.pointerEvents = 'all';
        }
    });

    // Disable imposter role toggles if all slots are used
    const imposterRoles = ['shapeshifter', 'saboteur'];
    imposterRoles.forEach(role => {
        const checkbox = document.getElementById('enable' + role.charAt(0).toUpperCase() + role.slice(1));
        const toggleGroup = checkbox.closest('.toggle-group');

        if (!roleSettings['enable' + role.charAt(0).toUpperCase() + role.slice(1)] && usedImposterSlots >= imposterCount) {
            toggleGroup.style.opacity = '0.3';
            toggleGroup.style.pointerEvents = 'none';
        } else {
            toggleGroup.style.opacity = '1';
            toggleGroup.style.pointerEvents = 'all';
        }
    });
}

// Role Generation
function generateRoles() {
    roles = [];

    const crewmateCount = playerCount - imposterCount;

    // Add special imposter roles based on count
    let shapeshiftersToAdd = roleSettings.enableShapeshifter ? Math.min(roleSettings.shapeshifterCount, imposterCount) : 0;
    let saboteursToAdd = roleSettings.enableSaboteur ? Math.min(roleSettings.saboteurCount, imposterCount) : 0;

    // Make sure total special imposters don't exceed imposter count
    const totalSpecialImposters = shapeshiftersToAdd + saboteursToAdd;
    if (totalSpecialImposters > imposterCount) {
        // Scale down proportionally
        const ratio = imposterCount / totalSpecialImposters;
        shapeshiftersToAdd = Math.floor(shapeshiftersToAdd * ratio);
        saboteursToAdd = Math.floor(saboteursToAdd * ratio);
    }

    // Add shapeshifters
    for (let i = 0; i < shapeshiftersToAdd; i++) {
        roles.push('shapeshifter');
    }

    // Add saboteurs
    for (let i = 0; i < saboteursToAdd; i++) {
        roles.push('saboteur');
    }

    // Fill remaining imposters
    const regularImposters = imposterCount - shapeshiftersToAdd - saboteursToAdd;
    for (let i = 0; i < regularImposters; i++) {
        roles.push('imposter');
    }

    // Add special crew roles based on count
    let engineersToAdd = roleSettings.enableEngineer ? Math.min(roleSettings.engineerCount, crewmateCount) : 0;
    let scientistsToAdd = roleSettings.enableScientist ? Math.min(roleSettings.scientistCount, crewmateCount) : 0;
    let guardiansToAdd = roleSettings.enableGuardian ? Math.min(roleSettings.guardianCount, crewmateCount) : 0;

    // Make sure total special crew don't exceed crewmate count
    const totalSpecialCrew = engineersToAdd + scientistsToAdd + guardiansToAdd;
    if (totalSpecialCrew > crewmateCount) {
        // Scale down proportionally
        const ratio = crewmateCount / totalSpecialCrew;
        engineersToAdd = Math.floor(engineersToAdd * ratio);
        scientistsToAdd = Math.floor(scientistsToAdd * ratio);
        guardiansToAdd = Math.floor(guardiansToAdd * ratio);
    }

    // Add engineers
    for (let i = 0; i < engineersToAdd; i++) {
        roles.push('engineer');
    }

    // Add scientists
    for (let i = 0; i < scientistsToAdd; i++) {
        roles.push('scientist');
    }

    // Add guardians
    for (let i = 0; i < guardiansToAdd; i++) {
        roles.push('guardian');
    }

    // Fill remaining crewmates
    const regularCrewmates = crewmateCount - engineersToAdd - scientistsToAdd - guardiansToAdd;
    for (let i = 0; i < regularCrewmates; i++) {
        roles.push('crewmate');
    }

    // Shuffle roles using Fisher-Yates algorithm
    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }
}

function startGame() {
    playSound('click');
    generateRoles();
    currentPlayerIndex = 0;
    roleRevealed = false;
    showRoleScreen();
    setupRoleReveal();
}

// Role Reveal Functions
function setupRoleReveal() {
    // Update player number
    document.getElementById('currentPlayer').textContent = currentPlayerIndex + 1;

    // Reset card states
    document.getElementById('roleCardHidden').style.display = 'flex';
    document.getElementById('roleCardRevealed').style.display = 'none';

    // Reset buttons
    document.getElementById('revealBtn').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('finishBtn').style.display = 'none';

    roleRevealed = false;
}

function revealRole() {
    if (roleRevealed) return;

    playSound('reveal');
    roleRevealed = true;

    const roleKey = roles[currentPlayerIndex];
    const role = roleData[roleKey];
    const roleCardRevealed = document.getElementById('roleCardRevealed');
    const roleCardHidden = document.getElementById('roleCardHidden');

    // Hide the hidden card
    roleCardHidden.style.display = 'none';

    // Play role-specific sound
    playSound(roleKey);

    // Setup and show revealed card with role data
    roleCardRevealed.className = `role-card revealed-role ${role.color}`;
    document.getElementById('roleName').textContent = role.name;
    document.getElementById('roleIcon').textContent = role.icon;
    document.getElementById('roleDescription').textContent = role.description;

    // Add team badge
    const teamBadge = document.getElementById('teamBadge');
    if (role.team === 'imposters') {
        teamBadge.textContent = '🔴 IMPOSTER TEAM';
        teamBadge.className = 'team-badge imposter-team';
    } else {
        teamBadge.textContent = '🔵 CREWMATE TEAM';
        teamBadge.className = 'team-badge crew-team';
    }

    roleCardRevealed.style.display = 'flex';

    // Show appropriate button
    document.getElementById('revealBtn').style.display = 'none';

    if (currentPlayerIndex < playerCount - 1) {
        document.getElementById('nextBtn').style.display = 'block';
    } else {
        document.getElementById('finishBtn').style.display = 'block';
    }
}

// Alternative: Click card to reveal
document.addEventListener('DOMContentLoaded', function() {
    const hiddenCard = document.getElementById('roleCardHidden');
    if (hiddenCard) {
        hiddenCard.addEventListener('click', function() {
            if (!roleRevealed) {
                revealRole();
            }
        });
    }
});

function nextPlayer() {
    playSound('click');
    currentPlayerIndex++;
    setupRoleReveal();
}

function finishGame() {
    playSound('click');

    // Update final stats
    document.getElementById('finalCrewmates').textContent = playerCount - imposterCount;
    document.getElementById('finalImposters').textContent = imposterCount;

    showResultsScreen();
}

function resetGame() {
    playerCount = 5;
    imposterCount = 2;
    roles = [];
    currentPlayerIndex = 0;
    roleRevealed = false;

    document.getElementById('playerCount').value = playerCount;
    document.getElementById('imposterCount').value = imposterCount;
    updateCrewmateCount();
    showSetupScreen();
}

// Initialize on load
window.addEventListener('load', function() {
    updateCrewmateCount();
});

// Prevent accidental page refresh
window.addEventListener('beforeunload', function(e) {
    if (roles.length > 0 && currentPlayerIndex < playerCount - 1) {
        e.preventDefault();
        e.returnValue = '';
    }
});
