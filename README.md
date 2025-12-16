# 🏏 Sandhu Cricket (Web Edition)

A professional street cricket scorer application built with **Next.js**, ported from the original React Native mobile app. This web application allows users to score gully cricket matches with flexible rules, detailed statistics, and a "Vibe Check" UI.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🎮 Gameplay & Scoring
- **Flexible Rules:** Configure match overs (1-20) and custom rules for Wides and No-Balls (Re-ball vs. Run only).
- **Advanced Scoring Engine:** Handle complex scenarios like "Wide + Runs off bat" or "No Ball + Byes".
- **Undo/Redo System:** Full history stack allows you to undo mistakes and redo them if needed.
- **Timeline:** A visual scrolling ticker showing every ball history (e.g., `1`, `4`, `W`, `WD+2`).

### 🎨 UI/UX (Vibe Check)
- **Dark/Light Mode:** Seamless theme switching with persistent storage.
- **Responsive Design:** Optimized for mobile browsers to feel like a native app.
- **Smooth Animations:** Powered by simple CSS transitions and Tailwind utility classes.
- **Read-Only Mode:** Prevents accidental scoring when viewing past innings data.

### 🧠 Smart Logic
- **Persistence:** Automatically saves match state to Local Storage. Refreshing the page won't lose your score.
- **Auto-Conclusion:** Detects when overs are finished or a target is chased.
- **Innings Management:** Handles the transition between 1st and 2nd innings with a summary view.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useReducer` pattern) + Local Storage

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/sandhu-cricket-web.git](https://github.com/your-username/sandhu-cricket-web.git)
   cd sandhu-cricket-web