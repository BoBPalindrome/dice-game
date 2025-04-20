class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dice = [];
        this.selectedDice = 0;
        this.score = 0;
        this.remainingDice = 7;
        this.hasRolled = false;  // Track if dice have been rolled
        this.gameOver = false;
        
        // Level system
        this.level = 1;
        this.baseTarget = 100; // Starting target for level 1
        
        // High score tracking
        this.highestLevel = parseInt(localStorage.getItem('highestLevel')) || 1;
        
        // Scoring configuration
        this.scoring = {
            // Base points for combined totals
            combinations: {
                2: 100,  // Snake eyes
                3: 80,   // Three
                4: 60,   // Four
                5: 40,   // Five
                6: 20,   // Six
                7: 10,   // Seven
                8: 20,   // Eight
                9: 40,   // Nine
                10: 60,  // Ten
                11: 80,  // Eleven
                12: 100  // Boxcars
            },
            // Track how many times each number and combination has been played
            playedNumbers: {},
            playedCombinations: {},
            // Base points for individual numbers
            baseNumberPoints: 10
        };
        
        // Initialize tracking arrays
        for (let i = 1; i <= 6; i++) {
            this.scoring.playedNumbers[i] = 0;
        }
        for (let i = 2; i <= 12; i++) {
            this.scoring.playedCombinations[i] = 0;
        }
        
        this.init();
        // Attach the click event listener only once
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    init() {
        // Set canvas size
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;

        // Create initial dice
        this.createDice();

        // Start game loop
        this.gameLoop();

        // Remove event listener setup from here
    }

    createDice() {
        const totalWidth = (CONFIG.dice.size * this.remainingDice) + (CONFIG.dice.spacing * (this.remainingDice - 1));
        const startX = (this.canvas.width - totalWidth) / 2;
        
        // Store current dice values if they exist
        const currentValues = this.dice.map(die => die.value);
        
        // Clear and recreate dice array
        this.dice = [];
        for (let i = 0; i < this.remainingDice; i++) {
            const dice = new Dice();
            dice.x = startX + (i * (CONFIG.dice.size + CONFIG.dice.spacing));
            dice.y = ((this.canvas.height - CONFIG.dice.size) / 3) - 40; // Moved up 40 pixels
            
            // Preserve the value if we have one
            if (currentValues[i] !== undefined) {
                dice.value = currentValues[i];
            }
            
            this.dice.push(dice);
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check for game over: any click restarts the game
        if (this.gameOver) {
            this.resetGame();
            return;
        }

        // Check if click is on roll button
        if (this.isRollButtonClick(x, y)) {
            this.rollAllDice();
            this.hasRolled = true;  // Set flag after rolling
            return;
        }

        // Check if click is on select button
        if (this.isSelectButtonClick(x, y) && this.selectedDice === 2) {
            this.handleSelect();
            return;
        }

        // Only allow dice selection if we've rolled
        if (!this.hasRolled) {
            return;
        }

        // Check if click is on any dice
        for (const die of this.dice) {
            if (die.isPointInside(x, y)) {
                if (!die.isSelected && this.selectedDice < 2) {
                    die.toggleSelection();
                    this.selectedDice++;
                } else if (die.isSelected) {
                    die.toggleSelection();
                    this.selectedDice--;
                }
                break;
            }
        }
    }

    isRollButtonClick(x, y) {
        const buttonX = (this.canvas.width - (CONFIG.button.width * 2 + CONFIG.button.spacing)) / 2;
        const buttonY = (this.canvas.height * 2) / 3 - 160; // Moved up another 80 pixels
        
        return x >= buttonX && x <= buttonX + CONFIG.button.width &&
               y >= buttonY && y <= buttonY + CONFIG.button.height;
    }

    isSelectButtonClick(x, y) {
        const buttonX = (this.canvas.width - (CONFIG.button.width * 2 + CONFIG.button.spacing)) / 2 + CONFIG.button.width + CONFIG.button.spacing;
        const buttonY = (this.canvas.height * 2) / 3 - 160; // Moved up another 80 pixels
        
        return x >= buttonX && x <= buttonX + CONFIG.button.width &&
               y >= buttonY && y <= buttonY + CONFIG.button.height;
    }

    // Calculate target score for current level
    getCurrentLevelTarget() {
        return Math.ceil(this.baseTarget * Math.pow(1.5, this.level - 1));
    }

    resetGame() {
        this.dice = [];
        this.selectedDice = 0;
        this.score = 0;
        this.remainingDice = 7;
        this.hasRolled = false;
        this.gameOver = false;
        this.level = 1;
        
        // Reset scoring trackers
        for (let i = 1; i <= 6; i++) {
            this.scoring.playedNumbers[i] = 0;
        }
        for (let i = 2; i <= 12; i++) {
            this.scoring.playedCombinations[i] = 0;
        }
        
        // Recreate dice
        this.createDice();
    }

    handleSelect() {
        // Find the selected dice
        const selectedDice = this.dice.filter(die => die.isSelected);
        
        // Calculate sum of selected dice
        const sum = selectedDice[0].value + selectedDice[1].value;
        
        // Calculate points for individual numbers
        let numberPoints = 0;
        selectedDice.forEach(die => {
            this.scoring.playedNumbers[die.value]++;
            numberPoints += this.scoring.baseNumberPoints * this.scoring.playedNumbers[die.value];
        });
        
        // Calculate points for combination
        this.scoring.playedCombinations[sum]++;
        const combinationPoints = this.scoring.combinations[sum] * this.scoring.playedCombinations[sum];
        
        // Calculate total points
        const points = numberPoints + combinationPoints;
        
        // Add points to score
        this.score += points;
        
        // Remove selected dice
        this.dice = this.dice.filter(die => !die.isSelected);
        this.selectedDice = 0;
        this.remainingDice -= 2;
        
        // Check if level target is reached AFTER updating dice count
        if (this.score >= this.getCurrentLevelTarget()) {
            this.advanceLevel();
            return; // Exit early since advanceLevel recreates dice
        }

        // Check for game over
        this.checkGameOver();
        
        // Recreate dice with new positions, preserving values
        this.createDice();
        
        // Log the scoring details
        console.log(`Rolled ${sum} for ${points} points!`);
        console.log(`- Individual numbers: ${numberPoints} points`);
        console.log(`- Combination (${sum}): ${combinationPoints} points`);
    }

    advanceLevel() {
        this.level++;
        
        // Update highest level if current level is higher
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('highestLevel', this.highestLevel);
        }
        
        console.log(`Advanced to Level ${this.level}!`);
        
        // Reset score but keep the scoring trackers
        this.score = 0;
        
        // Reset to 7 dice for the new level
        this.remainingDice = 7;
        
        // Recreate dice
        this.createDice();
        
        // Need to roll again
        this.hasRolled = false;
    }

    rollAllDice() {
        this.dice.forEach(die => die.roll());
    }

    drawRollButton() {
        const buttonX = (this.canvas.width - (CONFIG.button.width * 2 + CONFIG.button.spacing)) / 2;
        const buttonY = (this.canvas.height * 2) / 3 - 160; // Moved up another 80 pixels

        // Draw button background
        this.ctx.fillStyle = this.hasRolled ? CONFIG.button.colors.disabled : CONFIG.button.colors.background;
        this.ctx.fillRect(buttonX, buttonY, CONFIG.button.width, CONFIG.button.height);

        // Draw button text
        this.ctx.fillStyle = CONFIG.button.colors.text;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.hasRolled ? 'ROLLED' : 'ROLL',
            buttonX + CONFIG.button.width / 2,
            buttonY + CONFIG.button.height / 2
        );
    }

    drawSelectButton() {
        const buttonX = (this.canvas.width - (CONFIG.button.width * 2 + CONFIG.button.spacing)) / 2 + CONFIG.button.width + CONFIG.button.spacing;
        const buttonY = (this.canvas.height * 2) / 3 - 160; // Moved up another 80 pixels

        // Draw button background
        this.ctx.fillStyle = this.selectedDice === 2 ? CONFIG.button.colors.background : CONFIG.button.colors.disabled;
        this.ctx.fillRect(buttonX, buttonY, CONFIG.button.width, CONFIG.button.height);

        // Draw button text
        this.ctx.fillStyle = CONFIG.button.colors.text;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            'SELECT',
            buttonX + CONFIG.button.width / 2,
            buttonY + CONFIG.button.height / 2
        );
    }

    drawScoreboard() {
        // Draw total score, level, and high score at the top
        this.ctx.fillStyle = CONFIG.scoreboard.color;
        this.ctx.font = `${CONFIG.scoreboard.fontSize}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Level: ${this.level}`, CONFIG.scoreboard.x, CONFIG.scoreboard.y);
        this.ctx.fillText(`Score: ${this.score} / ${this.getCurrentLevelTarget()}`, CONFIG.scoreboard.x + 150, CONFIG.scoreboard.y);
        this.ctx.fillText(`Highest Level: ${this.highestLevel}`, CONFIG.scoreboard.x + 400, CONFIG.scoreboard.y);

        // Calculate Y position below buttons
        const buttonY = (this.canvas.height * 2) / 3 - 160; // Moved up another 80 pixels
        const startY = buttonY + CONFIG.button.height + 20; // Increased padding to 20 pixels

        // Draw two column headers
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#000000';
        
        // Left column header (Individual Numbers)
        const leftColX = 50;
        this.ctx.fillText('Individual Die Points:', leftColX, startY);
        
        // Right column header (Combinations)
        const rightColX = this.canvas.width / 2 + 50;
        this.ctx.fillText('Combination Points:', rightColX, startY);

        // Draw left column (Individual numbers)
        this.ctx.font = '16px Arial';
        for (let i = 1; i <= 6; i++) {
            const timesPlayed = this.scoring.playedNumbers[i];
            const points = this.scoring.baseNumberPoints * (timesPlayed + 1);
            const y = startY + (i * 25);
            this.ctx.fillText(`${i}: ${points}`, leftColX, y);
        }

        // Draw right column (Combinations)
        let row = 0;
        for (let i = 2; i <= 12; i++) {
            const timesPlayed = this.scoring.playedCombinations[i];
            const basePoints = this.scoring.combinations[i];
            const y = startY + (row * 25);
            this.ctx.fillText(`${i}: ${basePoints} × ${timesPlayed + 1}`, rightColX, y + 25);
            row++;
        }

        // Add roll instruction if not rolled yet
        if (!this.hasRolled) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click ROLL to start!', this.canvas.width / 2, this.canvas.height / 3 + 30);
        }
    }

    checkGameOver() {
        if (this.remainingDice === 1 && this.score < this.getCurrentLevelTarget()) {
            this.gameOver = true;
        }
    }

    drawGameOver() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw "GAME OVER" text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

        // Draw final score and highest level
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Level: ${this.level}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`Highest Level: ${this.highestLevel}`, this.canvas.width / 2, this.canvas.height / 2 + 30);

        // Draw restart button
        const buttonX = (this.canvas.width - CONFIG.button.width) / 2;
        const buttonY = (this.canvas.height / 2) + 70;
        
        this.ctx.fillStyle = CONFIG.button.colors.background;
        this.ctx.fillRect(buttonX, buttonY, CONFIG.button.width, CONFIG.button.height);
        
        this.ctx.fillStyle = CONFIG.button.colors.text;
        this.ctx.font = '20px Arial';
        this.ctx.fillText('PLAY AGAIN', this.canvas.width / 2, buttonY + CONFIG.button.height / 2);
    }

    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw scoreboard
        this.drawScoreboard();

        // Draw all dice
        this.dice.forEach(die => die.draw(this.ctx));

        // Draw buttons
        this.drawRollButton();
        this.drawSelectButton();

        // Draw game over screen if game is over
        if (this.gameOver) {
            this.drawGameOver();
        }

        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 