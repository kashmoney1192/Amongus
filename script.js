// Game State
let playerCount = 5;
let imposterCount = 2;
let roles = [];
let currentPlayerIndex = 0;
let roleRevealed = false;

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

// Role Generation
function generateRoles() {
    roles = [];

    // Create array with imposters and crewmates
    for (let i = 0; i < imposterCount; i++) {
        roles.push('imposter');
    }
    for (let i = 0; i < playerCount - imposterCount; i++) {
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

    const role = roles[currentPlayerIndex];
    const roleCardRevealed = document.getElementById('roleCardRevealed');
    const roleCardHidden = document.getElementById('roleCardHidden');

    // Hide the hidden card
    roleCardHidden.style.display = 'none';

    // Setup and show revealed card
    if (role === 'imposter') {
        playSound('imposter');
        roleCardRevealed.className = 'role-card revealed-role imposter';
        document.getElementById('roleName').textContent = 'IMPOSTER';
        document.getElementById('roleIcon').textContent = '🔪';
        document.getElementById('roleDescription').textContent = 'Eliminate the crewmates without getting caught!';
    } else {
        playSound('crewmate');
        roleCardRevealed.className = 'role-card revealed-role crewmate';
        document.getElementById('roleName').textContent = 'CREWMATE';
        document.getElementById('roleIcon').textContent = '👨‍🚀';
        document.getElementById('roleDescription').textContent = 'Complete tasks and find the imposters!';
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
