# 🏏 Sandhu Cricket (Updated Edition - Now you can add players)

Live Link: https://freerulecric.vercel.app

V.0.1 
Live Link: https://sandhucricket.vercel.app/ (without players just set rules, add runs, wickets - innings break - repeat)
GitHub Link: https://github.com/karthickpalanivel/sandhuCricketWeb

A professional street cricket scorer application built with **Next.js**. This isn't just a tally counter; it's a logic-driven engine designed for the chaos, arguments, and specific rules of **Gully (Street) Cricket**.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)


## 🚀 What Makes This Special?

Standard cricket apps assume you adhere to strict ICC rules with 11 players. **Sandhu Cricket** adapts to *your* reality.

### 🌟 New: Advanced Roster Management
* **Bulk Import:** Paste a list of names (separated by commas or new lines) and import them instantly.
* **Draft Board:** A drag-and-drop style interface to sort your friends into **Team A**, **Team B**, or keep them in the **Unassigned Pool**.
* **Persistence:** Your squads are saved. One click restores them for the next match.

### 🧠 "Street Legal" Logic
* **Last Man Standing:** Unlike standard apps that declare "All Out" when 1 wicket remains, this engine lets you play until the **very last wicket**. The final batter can play alone if your street rules allow it.
* **Pinpoint Run-Outs:** Run out logic is complex. Now you can specify:
    1. **Who is out?** (Striker vs Non-Striker).
    2. **Runs Completed?** (e.g., ran 1, got out on the 2nd).
* **Smart Player Selection:** The app filters the player list automatically. It won't let you select a player who is already batting or has already been dismissed.

### ⚡ Speed Features
* **History Restore:** Don't waste time setting up rules every game.
    * Click the 🕒 **History Icon** on the Setup screen to load previous rules (Overs, Wides).
    * Click the 🕒 **History Icon** on the Draft screen to reload the previous squads.
* **Auto-Rotation:** Strike rotates automatically on singles, threes, and over completion.

### 📊 Rich Statistics
* **Innings Break Summary:** A beautiful summary card pops up automatically when the 1st innings ends.
* **Match Presentation:** At the end of the game, see the **Top 3 Batsmen** and **Top 2 Bowlers** from both sides.
* **Visual Timeline:** A scrolling ticker showing exactly what happened on every ball.

### ❌ Drawbacks
* **Player Match-type:** Starting match without adding players in Roasters (any team), can't proceed further any actions on Match
* **In-match addings:** Once you start the match you can't add players in between
* **Limited Overs:** You can play only upto 20 over match no more than exceed not designed for test and tournament matches

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Lucide Icons
- **State:** React Hooks + Local Storage Persistence
- **Design:** Mobile-First, Dark Mode Ready

---

## 📖 How to Use

### Phase 1: The Draft (Optional but Recommended)
1. Click **"Advanced Roster"** on the home screen.
2. Click **Upload List** and paste your player names.
3. Use the `+ A` and `+ B` buttons to assign players to teams.
4. Click **Confirm Teams**. 
   *(Tip: Next time, just click the History icon in the header to reload these teams!)*

### Phase 2: Match Setup
1. **Teams:** Names are pre-filled from the Draft.
2. **Overs:** Use the slider to set match length (1-20 overs).
3. **Rules:**
   - **Wide/No-Ball:** Choose if they count as `1 Run`, `Reball`, or `Both`.
4. Click **Start Match**.

### Phase 3: The Match
1. **Select Openers:** The app will prompt you to pick the Striker, Non-Striker, and Bowler.
2. **Scoring:**
   - Tap `0-6` for runs.
   - Tap `WD` or `NB` for extras. You can add runs scored off these balls too.
   - Tap `OUT` for wickets.
     - **Catch/Bowled:** Tap `0`.
     - **Run Out:** Select who got out and how many runs were completed.
3. **End of Over:** The app automatically prompts for the next bowler.

### Phase 4: The Result
1. Click **End Innings** when the overs are done or the team is All Out.
2. View the **Innings Break Summary**.
3. Score the chase in the 2nd Innings.
4. Finish the match to see the **Trophy Screen** and **Top Performers**.

---

## ⚙️ Logic Breakdown Table

| Feature | Standard Apps | Sandhu Cricket |
| :--- | :--- | :--- |
| **All Out** | 10 Wickets (Fixed) | **Total Players** (Dynamic/Last Man Standing) |
| **Run Out** | Just "Wicket" | **Who + Runs Scored** |
| **Overs Finish** | Auto-close Innings | **Manual Close** (Allows disputes/extra balls) |
| **Player List** | Manual Entry every time | **Draft System + History Restore** |

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/sandhu-cricket-web.git](https://github.com/your-username/sandhu-cricket-web.git)
   cd sandhu-cricket-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
