class Dice {
    constructor(sides = CONFIG.dice.defaultSides, colorScheme = 'default') {
        this.sides = sides;
        this.value = 1;
        this.isRolling = false;
        this.colorScheme = colorScheme;
        this.x = 0;
        this.y = 0;
        this.size = CONFIG.dice.size;
        this.isSelected = false;
    }

    roll() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const rollDuration = CONFIG.dice.rollAnimation.duration;
        const startTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;

            if (elapsed < rollDuration) {
                // During animation, show random values
                this.value = Math.floor(Math.random() * this.sides) + 1;
                requestAnimationFrame(animate);
            } else {
                // Final value
                this.value = Math.floor(Math.random() * this.sides) + 1;
                this.isRolling = false;
            }
        };

        animate();
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.size &&
               y >= this.y && y <= this.y + this.size;
    }

    toggleSelection() {
        this.isSelected = !this.isSelected;
    }

    draw(ctx) {
        const colors = CONFIG.dice.colors[this.isSelected ? 'selected' : this.colorScheme];
        
        // Draw dice background
        ctx.fillStyle = colors.background;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw dice border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        // Draw dice value
        ctx.fillStyle = colors.dots;
        ctx.font = `${this.size/2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.value.toString(),
            this.x + this.size/2,
            this.y + this.size/2
        );
    }
} 