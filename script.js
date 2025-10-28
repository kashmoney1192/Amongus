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
    enableSaboteur: false
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
}

function adjustimposters(delta) {
    playSound('click');
    const maxImposters = Math.min(99, playerCount - 1);
    imposterCount = Math.max(1, Math.min(maxImposters, imposterCount + delta));
    document.getElementById('imposterCount').value = imposterCount;
    updateCrewmateCount();
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
}

function updateCrewmateCount() {
    const crewmates = playerCount - imposterCount;
    document.getElementById('crewmateCount').textContent = crewmates;
    document.getElementById('imposterDisplay').textContent = imposterCount;
}

function updateRoleSettings() {
    roleSettings.enableEngineer = document.getElementById('enableEngineer').checked;
    roleSettings.enableScientist = document.getElementById('enableScientist').checked;
    roleSettings.enableGuardian = document.getElementById('enableGuardian').checked;
    roleSettings.enableShapeshifter = document.getElementById('enableShapeshifter').checked;
    roleSettings.enableSaboteur = document.getElementById('enableSaboteur').checked;
}

// Role Generation
function generateRoles() {
    roles = [];

    const crewmateCount = playerCount - imposterCount;

    // Build available role arrays based on settings
    const availableImposterRoles = [];
    if (roleSettings.enableShapeshifter) availableImposterRoles.push('shapeshifter');
    if (roleSettings.enableSaboteur) availableImposterRoles.push('saboteur');

    const availableCrewRoles = [];
    if (roleSettings.enableEngineer) availableCrewRoles.push('engineer');
    if (roleSettings.enableScientist) availableCrewRoles.push('scientist');
    if (roleSettings.enableGuardian) availableCrewRoles.push('guardian');

    // Determine number of special roles (1-2 per game)
    let maxSpecialCrew = 0;
    let maxSpecialImposter = 0;

    if (availableCrewRoles.length > 0 && crewmateCount >= 2) {
        // Assign 1-2 special crew roles if enabled
        maxSpecialCrew = Math.min(availableCrewRoles.length, Math.max(1, Math.floor(crewmateCount / 3)));
    }

    if (availableImposterRoles.length > 0 && imposterCount >= 1) {
        // Assign 1 special imposter role if enabled
        maxSpecialImposter = 1;
    }

    // Create imposter roles
    const assignedImposterRoles = [];
    for (let i = 0; i < imposterCount; i++) {
        if (assignedImposterRoles.length < maxSpecialImposter && availableImposterRoles.length > 0) {
            // Assign special imposter role (no duplicates)
            let specialRole;
            do {
                specialRole = availableImposterRoles[Math.floor(Math.random() * availableImposterRoles.length)];
            } while (assignedImposterRoles.includes(specialRole) && assignedImposterRoles.length < availableImposterRoles.length);

            if (!assignedImposterRoles.includes(specialRole)) {
                roles.push(specialRole);
                assignedImposterRoles.push(specialRole);
            } else {
                roles.push('imposter');
            }
        } else {
            roles.push('imposter');
        }
    }

    // Create crewmate roles
    const assignedCrewRoles = [];
    for (let i = 0; i < crewmateCount; i++) {
        if (assignedCrewRoles.length < maxSpecialCrew && availableCrewRoles.length > 0) {
            // Assign special crewmate role (no duplicates)
            let specialRole;
            let attempts = 0;
            do {
                specialRole = availableCrewRoles[Math.floor(Math.random() * availableCrewRoles.length)];
                attempts++;
            } while (assignedCrewRoles.includes(specialRole) && attempts < availableCrewRoles.length * 2);

            if (!assignedCrewRoles.includes(specialRole)) {
                roles.push(specialRole);
                assignedCrewRoles.push(specialRole);
            } else {
                roles.push('crewmate');
            }
        } else {
            roles.push('crewmate');
        }
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
