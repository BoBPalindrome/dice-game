const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    dice: {
        // Default dice configuration
        defaultSides: 6,
        size: 60, // Size in pixels
        spacing: 20, // Space between dice
        colors: {
            default: {
                background: '#ffffff',
                dots: '#000000'
            },
            selected: {
                background: '#e0e0e0',
                dots: '#000000'
            },
            // Add more color schemes here
            red: {
                background: '#ff0000',
                dots: '#ffffff'
            },
            blue: {
                background: '#0000ff',
                dots: '#ffffff'
            }
        },
        // Animation settings
        rollAnimation: {
            duration: 1000, // milliseconds
            frames: 20
        }
    },
    button: {
        width: 120,
        height: 40,
        spacing: 20, // Space between buttons
        colors: {
            background: '#4CAF50',
            text: '#ffffff',
            disabled: '#cccccc'
        }
    },
    scoreboard: {
        x: 20,
        y: 20,
        fontSize: 24,
        color: '#000000'
    }
}; 