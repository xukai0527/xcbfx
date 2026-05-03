let diskCount = 3;
let towers = [[], [], []];
let moveCount = 0;
let selectedDisk = null;
let autoSolving = false;

const DISK_COLORS = [
    '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', 
    '#3498db', '#9b59b6', '#1abc9c', '#34495e'
];

function startGame() {
    diskCount = parseInt(document.getElementById('diskCount').value);
    resetGame();
    document.getElementById('app').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
}

function goHome() {
    autoSolving = false;
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
}

function resetGame() {
    autoSolving = false;
    towers = [[], [], []];
    moveCount = 0;
    
    for (let i = diskCount; i >= 1; i--) {
        towers[0].push(i);
    }
    
    updateMoveCount();
    updateMinMoves();
    renderDisks();
}

function updateMoveCount() {
    document.getElementById('moveCount').textContent = moveCount;
}

function updateMinMoves() {
    const minMoves = Math.pow(2, diskCount) - 1;
    document.getElementById('minMoves').textContent = minMoves;
    document.getElementById('finalMinMoves').textContent = minMoves;
}

function renderDisks() {
    const gameArea = document.querySelector('.game-area');
    gameArea.innerHTML = '';
    
    for (let t = 0; t < 3; t++) {
        const tower = document.createElement('div');
        tower.className = 'tower';
        tower.id = `tower${t}`;
        tower.addEventListener('click', () => handleTowerClick(t));
        
        const peg = document.createElement('div');
        peg.className = 'peg';
        tower.appendChild(peg);
        
        const indicator = document.createElement('span');
        indicator.className = 'drop-indicator';
        tower.appendChild(indicator);
        
        const diskHeight = 30;
        const baseWidth = 40;
        const widthIncrement = 25;
        
        towers[t].forEach((diskSize, index) => {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.dataset.size = diskSize;
            disk.dataset.tower = t;
            disk.style.width = `${baseWidth + diskSize * widthIncrement}px`;
            disk.style.backgroundColor = DISK_COLORS[diskSize - 1];
            disk.style.bottom = `${10 + index * diskHeight}px`;
            disk.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDiskClick(disk);
            });
            tower.appendChild(disk);
        });
        
        gameArea.appendChild(tower);
    }
}

function handleDiskClick(disk) {
    if (autoSolving) return;
    
    const towerIndex = parseInt(disk.dataset.tower);
    const disksOnTower = towers[towerIndex];
    
    if (disksOnTower[disksOnTower.length - 1] !== parseInt(disk.dataset.size)) {
        return;
    }
    
    if (selectedDisk) {
        selectedDisk.classList.remove('selected');
    }
    
    selectedDisk = disk;
    selectedDisk.classList.add('selected');
    
    updateDropIndicators();
}

function handleTowerClick(towerIndex) {
    if (autoSolving || !selectedDisk) return;
    
    const fromTower = parseInt(selectedDisk.dataset.tower);
    const diskSize = parseInt(selectedDisk.dataset.size);
    
    if (canMove(fromTower, towerIndex)) {
        moveDisk(fromTower, towerIndex);
    }
    
    selectedDisk.classList.remove('selected');
    selectedDisk = null;
    clearDropIndicators();
    
    checkWin();
}

function canMove(fromTower, toTower) {
    const fromDisks = towers[fromTower];
    const toDisks = towers[toTower];
    
    if (fromDisks.length === 0) return false;
    
    const movingDisk = fromDisks[fromDisks.length - 1];
    
    if (toDisks.length === 0) return true;
    
    const topDisk = toDisks[toDisks.length - 1];
    
    return movingDisk < topDisk;
}

function moveDisk(fromTower, toTower) {
    const disk = towers[fromTower].pop();
    towers[toTower].push(disk);
    moveCount++;
    updateMoveCount();
    renderDisks();
}

function updateDropIndicators() {
    clearDropIndicators();
    
    if (!selectedDisk) return;
    
    const fromTower = parseInt(selectedDisk.dataset.tower);
    
    for (let t = 0; t < 3; t++) {
        if (t === fromTower) continue;
        
        const tower = document.getElementById(`tower${t}`);
        
        if (canMove(fromTower, t)) {
            tower.classList.add('can-drop');
            tower.querySelector('.drop-indicator').textContent = '✓';
        } else {
            tower.classList.add('cannot-drop');
            tower.querySelector('.drop-indicator').textContent = '✗';
        }
    }
}

function clearDropIndicators() {
    const towers = document.querySelectorAll('.tower');
    towers.forEach(tower => {
        tower.classList.remove('can-drop', 'cannot-drop');
        tower.querySelector('.drop-indicator').textContent = '';
    });
}

function checkWin() {
    if (towers[2].length === diskCount) {
        document.getElementById('finalMoves').textContent = moveCount;
        document.getElementById('winModal').style.display = 'flex';
        createConfetti();
    }
}

function closeWinModal() {
    document.getElementById('winModal').style.display = 'none';
    goHome();
}

function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

function createConfetti() {
    const colors = ['#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
    const container = document.getElementById('winModal');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.animationDuration = `${3 + Math.random() * 2}s`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        const confettis = document.querySelectorAll('.confetti');
        confettis.forEach(c => c.remove());
    }, 5000);
}

function autoSolve() {
    if (autoSolving || towers[2].length === diskCount) return;
    
    autoSolving = true;
    selectedDisk = null;
    clearDropIndicators();
    
    const moves = [];
    generateHanoiMoves(diskCount, 0, 2, 1, moves);
    
    let moveIndex = 0;
    const interval = setInterval(() => {
        if (!autoSolving || moveIndex >= moves.length) {
            clearInterval(interval);
            autoSolving = false;
            return;
        }
        
        const [from, to] = moves[moveIndex];
        moveDisk(from, to);
        moveIndex++;
        
        if (moveIndex >= moves.length) {
            clearInterval(interval);
            autoSolving = false;
            checkWin();
        }
    }, 300);
}

function generateHanoiMoves(n, from, to, aux, moves) {
    if (n === 1) {
        moves.push([from, to]);
        return;
    }
    
    generateHanoiMoves(n - 1, from, aux, to, moves);
    moves.push([from, to]);
    generateHanoiMoves(n - 1, aux, to, from, moves);
}
