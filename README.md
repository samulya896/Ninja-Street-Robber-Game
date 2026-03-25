# 🧠 NinjaMind: BFS vs DFS Visualizer

An interactive **maze-based AI visualization game** that compares **Breadth-First Search (BFS)** and **Depth-First Search (DFS)** in real-time.

🎮 You play as a **robber**, while two AI ninjas (BFS & DFS) chase you through the maze.

---

## 🚀 Features

### 🎮 Interactive Gameplay
- Move using **WASD / Arrow Keys**
- Escape to the **goal 💰**
- Avoid being caught by:
  - 🥷 BFS Ninja
  - 🥷 DFS Ninja
- Random maze generated every time

---

### 🧠 Real-Time Algorithm Visualization
- Two **side-by-side mazes**
  - Left → BFS behavior
  - Right → DFS behavior
- Live visualization of:
  - Explored cells
  - Current path
  - Enemy movement

---

### 📦 Data Structure Visualization
- **BFS Queue (FIFO)** shown live
- **DFS Stack (LIFO)** shown live
- Front/top elements highlighted
- Structure size updates dynamically

---

### 📊 Advanced Analysis Dashboard
- **Last Move Comparison Table**
  - Path length
  - Nodes explored
  - Memory usage
- **Live Bar Chart**
  - Cells explored per move
- **Session Stats**
  - Total explored nodes
  - Average per move
  - Step count
- **Smart AI Insight**
  - Explains what happened after every move

---

## 🧠 Algorithms Explained

### 🔵 Breadth-First Search (BFS)
- Uses **Queue (FIFO)**
- Marks visited **on enqueue**
- Explores level-by-level
- ✅ Always finds **shortest path**

---

### 🟠 Depth-First Search (DFS)
- Uses **Stack (LIFO)**
- Marks visited **on pop**
- Explores deeply before backtracking
- ❌ Does **not guarantee shortest path**

---

## 🎯 What You Learn

- Difference between **BFS vs DFS**
- Queue vs Stack behavior (live!)
- Shortest path vs exploratory search
- Time & space trade-offs
- Real-world AI traversal concepts

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Up |
| S / ↓ | Move Down |
| A / ← | Move Left |
| D / → | Move Right |
| ▶ Start | Start game |
| ↺ Restart | New maze |

---

## 🖥️ Project Structure
NinjaMind/
│
├── index.html # UI structure
├── style.css # Styling & layout
├── script.js # Game logic + BFS/DFS implementation
└── README.md


---

## ⚙️ How to Run

```bash
git clone https://github.com/your-username/ninjamind.git
cd ninjamind
Then open:

index.html

✔ No installation
✔ No dependencies
✔ Runs directly in browser