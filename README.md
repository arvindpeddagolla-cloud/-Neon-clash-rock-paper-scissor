# Neon Clash: Rock Paper Scissors Game

Welcome to **Neon Clash**, a modern, responsive, and visually stunning client-side Rock Paper Scissors web application. Built purely with Vanilla HTML, CSS, and JavaScript, the game features a premium arcade theme with glassmorphic cards, custom animations, synthesized sound effects, dynamic statistics, and multiple play modes.

## 🚀 Live Demo & Repository
- **Repository**: [https://github.com/arvindpeddagolla-cloud/-Neon-clash-rock-paper-scissor](https://github.com/arvindpeddagolla-cloud/-Neon-clash-rock-paper-scissor)

---

## 🌟 Key Features

*   **Dual Gameplay Modes**:
    *   **Endless Mode**: Play matches indefinitely to rack up high scores and test your win rate.
    *   **Best of 5 Match**: A tournament-style duel. The first player to win 3 rounds is crowned the Arena Champion, unlocking a custom victory or defeat screen.
*   **Aesthetics & Theme**:
    *   **Glassmorphic Interface**: Semi-transparent card components featuring fine glowing borders, backdrop-filters, and soft drop shadows.
    *   **Dynamic Theme Toggle**: Instantly switch between **Neon Dark Mode** (default) and **Sleek Light Mode**.
    *   **Collision Sparks & Glows**: Choice cards shake to build tension before clashing. Spark bursts and color-coded neon borders indicate round outcomes (Win: Green, Lose: Red, Draw: Amber).
*   **Web Audio Synth**:
    *   Synthesizes sound effects (button clicks, tension ticks, clash impacts, win fanfares, draw chimes, and lose sweeps) dynamically using the browser's built-in `AudioContext`. No audio file downloads required.
*   **Canvas Confetti Celebration**:
    *   Custom, lightweight confetti system drawn dynamically on a full-screen HTML5 Canvas to celebrate match-level victories.
*   **Scoreboard & Stats Dashboard**:
    *   Track your Player Score, Draws, and Computer Score in real time, alongside overall rounds played and computed Win Rate percentage.

---

## 🛠️ Technology Stack
- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom Grid, Flexbox, Keyframes, Custom Variables)
- **Logic & Effects**: ES6+ JavaScript, Web Audio API, Canvas API

---

## 📂 Project Structure
```text
rock-paper-scissor/
├── index.html     # Page layout, settings, scoreboard, battlefield, and overlays
├── style.css      # Core style variables, glassmorphic layout, and collision keyframes
├── script.js      # Game state engines, Web Audio synth, and Canvas confetti particles
└── README.md      # Project overview and run instructions
```

---

## 💻 How to Run Locally

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/arvindpeddagolla-cloud/-Neon-clash-rock-paper-scissor.git
    cd -Neon-clash-rock-paper-scissor
    ```
2.  **Open in Browser**:
    *   Simply double-click `index.html` to run it in your default web browser.
    *   Alternatively, run a simple local web server:
        ```bash
        # Python 3
        python -m http.server 8000
        ```
        Then, navigate to `http://localhost:8000` in your browser.

---

## 🛡️ License
Distributed under the MIT License. Feel free to copy, modify, and build upon this project.
