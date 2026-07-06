/**
 * NEON CLASH: Rock Paper Scissors Game Script
 * Fully client-side application featuring custom canvas confetti,
 * synthesized audio effects, best-of-5 mode, and glassmorphic micro-animations.
 */

// --- Global States ---
let playerScore = 0;
let computerScore = 0;
let drawCount = 0;
let roundsPlayed = 0;
let historyLog = [];

// Match state for Best-of-5
let gameMode = 'endless'; // 'endless' | 'bestof5'
let playerMatchWins = 0;
let computerMatchWins = 0;
const WINS_NEEDED_TO_MATCH = 3;

// Sound and Theme toggles
let soundEnabled = true;
let isAnimating = false;
let isGameOver = false;

// Choice symbols mapping
const CHOICE_EMOJIS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};

// --- Web Audio Synth for Retro Game Sound Effects ---
const synth = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    this.init();
    
    // Resume context if suspended (browser autoplay security policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  },
  
  playSweep(freqStart, freqEnd, type, duration, delay = 0) {
    if (!soundEnabled) return;
    this.init();
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + delay + duration);
    
    gainNode.gain.setValueAtTime(0.12, this.ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  },
  
  playNoise(duration, delay = 0) {
    if (!soundEnabled) return;
    this.init();
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noiseNode.start(this.ctx.currentTime + delay);
    noiseNode.stop(this.ctx.currentTime + delay + duration);
  },
  
  // Game Event Sounds
  playClick() {
    this.playTone(600, 'sine', 0.08);
  },
  
  playTensionTick(pitchOffset = 0) {
    this.playTone(400 + pitchOffset, 'triangle', 0.05);
  },
  
  playClashImpact() {
    this.playNoise(0.2);
    this.playSweep(150, 45, 'triangle', 0.2);
  },
  
  playWinFanfare() {
    this.playTone(523.25, 'triangle', 0.15, 0);   // C5
    this.playTone(659.25, 'triangle', 0.15, 0.1);  // E5
    this.playTone(783.99, 'triangle', 0.15, 0.2);  // G5
    this.playTone(1046.50, 'triangle', 0.45, 0.3); // C6
  },
  
  playLoseSweep() {
    this.playSweep(392.00, 110, 'sawtooth', 0.6); // G4 down slide
  },
  
  playDrawChime() {
    this.playTone(587.33, 'sine', 0.15, 0); // D5
    this.playTone(587.33, 'sine', 0.25, 0.12);
  }
};

// --- Custom Canvas Confetti Celebration System ---
class ConfettiParticle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 6 - 3;
    // Premium neon gradient colors
    this.color = ['#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#fbbf24'][Math.floor(Math.random() * 5)];
    this.width = Math.random() * 8 + 6;
    this.height = Math.random() * 12 + 8;
    this.velocityX = Math.random() * 4 - 2;
    this.velocityY = Math.random() * 5 + 4;
  }
  
  update() {
    this.y += this.velocityY;
    this.x += this.velocityX;
    this.rotation += this.rotationSpeed;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

class ConfettiSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.active = false;
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  start() {
    this.resizeCanvas();
    this.particles = [];
    for (let i = 0; i < 150; i++) {
      this.particles.push(new ConfettiParticle(this.canvas));
    }
    this.active = true;
    if (!this.animationId) {
      this.loop();
    }
  }
  
  stop() {
    this.active = false;
  }
  
  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let alive = false;
    this.particles.forEach((p, idx) => {
      p.update();
      p.draw(this.ctx);
      
      // Respawn or let fall off
      if (p.y > this.canvas.height) {
        if (this.active) {
          this.particles[idx] = new ConfettiParticle(this.canvas);
          alive = true;
        }
      } else {
        alive = true;
      }
    });
    
    if (alive) {
      this.animationId = requestAnimationFrame(() => this.loop());
    } else {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiSystem('confetti-canvas');

// --- Document Elements Setup ---
const soundBtn = document.getElementById('sound-btn');
const themeBtn = document.getElementById('theme-btn');
const soundOnPath = soundBtn.querySelector('.sound-on-path');
const soundOffPath = soundBtn.querySelector('.sound-off-path');
const themeSunPath = themeBtn.querySelector('.theme-sun-path');
const themeMoonPath = themeBtn.querySelector('.theme-moon-path');

const modeEndless = document.getElementById('mode-endless');
const modeBestof5 = document.getElementById('mode-bestof5');
const matchStatus = document.getElementById('match-status');
const playerDotsRow = document.getElementById('player-dots-row');
const computerDotsRow = document.getElementById('computer-dots-row');

const playerScoreEl = document.getElementById('player-score');
const drawScoreEl = document.getElementById('draw-score');
const computerScoreEl = document.getElementById('computer-score');

const cardPlayerScore = document.getElementById('card-player-score');
const cardDrawScore = document.getElementById('card-draw-score');
const cardComputerScore = document.getElementById('card-computer-score');

const statWinrate = document.getElementById('stat-winrate');
const statRounds = document.getElementById('stat-rounds');

const choiceCards = document.querySelectorAll('.choice-card');

const arenaPlayer = document.getElementById('arena-player');
const arenaPlayerBubble = document.getElementById('arena-player-bubble');
const arenaPlayerEmoji = document.getElementById('arena-player-emoji');
const arenaPlayerName = document.getElementById('arena-player-name');

const arenaComputer = document.getElementById('arena-computer');
const arenaComputerBubble = document.getElementById('arena-computer-bubble');
const arenaComputerEmoji = document.getElementById('arena-computer-emoji');
const arenaComputerName = document.getElementById('arena-computer-name');

const clashEffects = document.querySelector('.clash-effects');
const roundResultText = document.getElementById('round-result-text');

const resetBtn = document.getElementById('reset-btn');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const historyCount = document.getElementById('history-count');

// Modal Elements
const winnerModal = document.getElementById('winner-modal');
const modalTitle = document.getElementById('modal-title');
const modalScore = document.getElementById('modal-score');
const modalWinrate = document.getElementById('modal-winrate');
const modalMessage = document.getElementById('modal-message');
const modalRestartBtn = document.getElementById('modal-restart-btn');


// --- UI / Theme Toggle Functions ---
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundOnPath.classList.remove('hidden');
    soundOffPath.classList.add('hidden');
  } else {
    soundOnPath.classList.add('hidden');
    soundOffPath.classList.remove('hidden');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  if (newTheme === 'light') {
    themeSunPath.classList.add('hidden');
    themeMoonPath.classList.remove('hidden');
  } else {
    themeSunPath.classList.remove('hidden');
    themeMoonPath.classList.add('hidden');
  }
  
  synth.playClick();
}

function updateMode(mode) {
  if (isAnimating) return;
  gameMode = mode;
  
  if (mode === 'bestof5') {
    modeBestof5.classList.add('active');
    modeEndless.classList.remove('active');
    matchStatus.classList.remove('hidden');
  } else {
    modeBestof5.classList.remove('active');
    modeEndless.classList.add('active');
    matchStatus.classList.add('hidden');
  }
  
  resetScores(false); // Reset matching scores when changing modes
  synth.playClick();
}


// --- Game Core Mechanics ---

// Trigger a bounce animation on score values when they increment
function bounceScore(element) {
  element.classList.add('score-pop');
  setTimeout(() => {
    element.classList.remove('score-pop');
  }, 200);
}

function calculateWinRate() {
  if (roundsPlayed === 0) return '0%';
  const winRate = Math.round((playerScore / roundsPlayed) * 100);
  return `${winRate}%`;
}

function updateStatsUI() {
  playerScoreEl.textContent = playerScore;
  drawScoreEl.textContent = drawCount;
  computerScoreEl.textContent = computerScore;
  
  statWinrate.textContent = calculateWinRate();
  statRounds.textContent = roundsPlayed;
  historyCount.textContent = `${historyLog.length} round${historyLog.length === 1 ? '' : 's'}`;
}

// Get computer random select choice
function getComputerChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

// Compare selections to find winner
function getRoundWinner(player, computer) {
  if (player === computer) return 'draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'player';
  }
  return 'computer';
}

function addHistoryEntry(playerChoice, computerChoice, result) {
  // Hide empty state indicator
  if (historyLog.length === 0) {
    historyEmpty.classList.add('hidden');
  }
  
  const roundNumber = roundsPlayed;
  const historyItem = document.createElement('div');
  historyItem.classList.add('history-item');
  
  const statusClass = result === 'player' ? 'win' : result === 'computer' ? 'lose' : 'draw';
  const statusLabel = result === 'player' ? 'win' : result === 'computer' ? 'lose' : 'draw';
  
  historyItem.innerHTML = `
    <div class="history-item-left">
      <span class="history-round-num">#${roundNumber}</span>
      <span class="history-choices">
        You: ${CHOICE_EMOJIS[playerChoice]} vs CPU: ${CHOICE_EMOJIS[computerChoice]}
      </span>
    </div>
    <span class="history-status-tag ${statusClass}">${statusLabel}</span>
  `;
  
  // Prepend so latest rounds show at top
  historyList.insertBefore(historyItem, historyList.firstChild);
  
  // Track state
  historyLog.unshift({
    round: roundNumber,
    playerChoice,
    computerChoice,
    result
  });
}

function updateBestOf5Dots() {
  const playerDots = playerDotsRow.querySelectorAll('.dot');
  const computerDots = computerDotsRow.querySelectorAll('.dot');
  
  // Clear classes
  playerDots.forEach(dot => dot.className = 'dot');
  computerDots.forEach(dot => dot.className = 'dot');
  
  // Apply wins
  for (let i = 0; i < playerMatchWins; i++) {
    if (playerDots[i]) playerDots[i].classList.add('won');
  }
  for (let i = 0; i < computerMatchWins; i++) {
    if (computerDots[i]) computerDots[i].classList.add('lost');
  }
}

// Clash sequence containing visual shake animation and collision
function playRound(playerChoice) {
  if (isAnimating || isGameOver) return;
  isAnimating = true;
  synth.init(); // Initialize synth on user action
  
  // Reset arena styles
  arenaPlayerBubble.className = 'fighter-bubble';
  arenaComputerBubble.className = 'fighter-bubble';
  arenaPlayerName.className = 'fighter-name';
  arenaComputerName.className = 'fighter-name';
  clashEffects.classList.remove('active');
  
  // Set preparing fists
  arenaPlayerEmoji.textContent = '✊';
  arenaComputerEmoji.textContent = '✊';
  arenaPlayerName.textContent = 'CLASHING';
  arenaComputerName.textContent = 'CLASHING';
  roundResultText.textContent = 'Fist shake...';
  roundResultText.className = 'result-text';
  
  // Add shake classes
  arenaPlayer.classList.add('shake');
  arenaComputer.classList.add('shake');
  
  // Tension ticking sweep
  setTimeout(() => synth.playTensionTick(0), 100);
  setTimeout(() => synth.playTensionTick(100), 300);
  setTimeout(() => synth.playTensionTick(200), 500);
  
  // Run clash resolution
  setTimeout(() => {
    arenaPlayer.classList.remove('shake');
    arenaComputer.classList.remove('shake');
    
    const computerChoice = getComputerChoice();
    
    // Reveal choices
    arenaPlayerEmoji.textContent = CHOICE_EMOJIS[playerChoice];
    arenaComputerEmoji.textContent = CHOICE_EMOJIS[computerChoice];
    
    arenaPlayerName.textContent = playerChoice.toUpperCase();
    arenaComputerName.textContent = computerChoice.toUpperCase();
    
    // Activate collision sparks
    clashEffects.classList.add('active');
    synth.playClashImpact();
    
    const winner = getRoundWinner(playerChoice, computerChoice);
    roundsPlayed++;
    
    if (winner === 'draw') {
      drawCount++;
      arenaPlayerBubble.classList.add('draw');
      arenaComputerBubble.classList.add('draw');
      
      arenaPlayerName.classList.add('draw-text');
      arenaComputerName.classList.add('draw-text');
      
      roundResultText.textContent = 'IT\'S A TIE!';
      roundResultText.classList.add('draw');
      
      synth.playDrawChime();
      bounceScore(drawScoreEl);
      
    } else if (winner === 'player') {
      playerScore++;
      arenaPlayerBubble.classList.add('winner');
      arenaComputerBubble.classList.add('loser');
      
      arenaPlayerName.classList.add('winner-text');
      arenaComputerName.classList.add('loser-text');
      
      roundResultText.textContent = 'YOU WIN THE ROUND!';
      roundResultText.classList.add('win');
      
      synth.playWinFanfare();
      bounceScore(playerScoreEl);
      
      if (gameMode === 'bestof5') {
        playerMatchWins++;
      }
      
    } else {
      computerScore++;
      arenaPlayerBubble.classList.add('loser');
      arenaComputerBubble.classList.add('winner');
      
      arenaPlayerName.classList.add('loser-text');
      arenaComputerName.classList.add('winner-text');
      
      roundResultText.textContent = 'COMPUTER WINS ROUND!';
      roundResultText.classList.add('lose');
      
      synth.playLoseSweep();
      bounceScore(computerScoreEl);
      
      if (gameMode === 'bestof5') {
        computerMatchWins++;
      }
    }
    
    addHistoryEntry(playerChoice, computerChoice, winner);
    updateStatsUI();
    
    if (gameMode === 'bestof5') {
      updateBestOf5Dots();
      checkBestOf5Match();
    }
    
    isAnimating = false;
  }, 600); // Shaking animation duration
}

function checkBestOf5Match() {
  if (playerMatchWins === WINS_NEEDED_TO_MATCH || computerMatchWins === WINS_NEEDED_TO_MATCH) {
    isGameOver = true;
    
    // Delay modal display to let the round result settle
    setTimeout(() => {
      winnerModal.classList.remove('hidden');
      modalScore.textContent = `${playerMatchWins} - ${computerMatchWins}`;
      modalWinrate.textContent = calculateWinRate();
      
      if (playerMatchWins === WINS_NEEDED_TO_MATCH) {
        winnerModal.className = 'modal-overlay';
        modalTitle.textContent = 'VICTORY!';
        modalMessage.textContent = 'Stunning work! You clobbered the computer and secured the Best of 5 Arena Title!';
        confetti.start();
        // Play final celebration sound
        setTimeout(() => synth.playWinFanfare(), 200);
      } else {
        winnerModal.className = 'modal-overlay lost';
        modalTitle.textContent = 'DEFEAT.';
        modalMessage.textContent = 'The computer calculated your moves and conquered the Best of 5. Try another clash!';
        synth.playLoseSweep();
      }
    }, 1200);
  }
}

// Reset Scoreboard
function resetScores(fullReset = true) {
  if (isAnimating) return;
  
  if (fullReset) {
    playerScore = 0;
    computerScore = 0;
    drawCount = 0;
    roundsPlayed = 0;
    historyLog = [];
    
    // Clear list display
    historyList.innerHTML = '';
    historyEmpty.classList.remove('hidden');
  }
  
  playerMatchWins = 0;
  computerMatchWins = 0;
  isGameOver = false;
  
  // Hide modal and stop confetti
  winnerModal.classList.add('hidden');
  confetti.stop();
  
  // Reset arena visuals
  arenaPlayerBubble.className = 'fighter-bubble';
  arenaComputerBubble.className = 'fighter-bubble';
  arenaPlayerEmoji.textContent = '❓';
  arenaComputerEmoji.textContent = '❓';
  arenaPlayerName.textContent = 'READY';
  arenaComputerName.textContent = 'WAITING';
  arenaPlayerName.className = 'fighter-name';
  arenaComputerName.className = 'fighter-name';
  
  clashEffects.classList.remove('active');
  roundResultText.textContent = 'Make your move!';
  roundResultText.className = 'result-text';
  
  updateBestOf5Dots();
  updateStatsUI();
  
  if (fullReset) {
    synth.playClick();
  }
}


// --- Event Bindings ---

// Setup choice inputs
choiceCards.forEach(card => {
  card.addEventListener('click', (e) => {
    const playerChoice = card.getAttribute('data-choice');
    playRound(playerChoice);
  });
});

// Settings & Controls
soundBtn.addEventListener('click', toggleSound);
themeBtn.addEventListener('click', toggleTheme);

modeEndless.addEventListener('click', () => updateMode('endless'));
modeBestof5.addEventListener('click', () => updateMode('bestof5'));

resetBtn.addEventListener('click', () => resetScores(true));
modalRestartBtn.addEventListener('click', () => resetScores(false));

// Initialize standard page
updateStatsUI();
updateBestOf5Dots();
