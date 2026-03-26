/* ═══════════════════════════════════════════════════════════
   MAZE AI VISUALIZER — BFS vs DFS
   ═══════════════════════════════════════════════════════════
   BFS — Queue (FIFO). Marked visited ON ENQUEUE.
         Always finds the shortest path.
   DFS — Stack (LIFO). Marked visited ON PUSH.
         Fixed direction order — deterministic.
   ═══════════════════════════════════════════════════════════ */

const DIRS = [[-1,0],[0,1],[1,0],[0,-1]]; // N E S W
const ROWS = 12, COLS = 12;
const MAX_CHART_BARS = 30;

let state = {
  maze: [], player: {}, goal: {}, enemyStart: {},
  bfsPos: {}, dfsPos: {},
  bfsVisited: new Set(), dfsVisited: new Set(),
  playerMoves: 0, bfsSteps: 0, dfsSteps: 0,
  started: false, running: false,
  history: [], totalBfsExp: 0, totalDfsExp: 0,
};

/* ── INIT ─────────────────────────────────────── */
function init() {
  state.maze = generateMaze();
  findEntities();
  state.bfsPos = {...state.enemyStart};
  state.dfsPos = {...state.enemyStart};
  state.bfsVisited = new Set();
  state.dfsVisited = new Set();
  state.playerMoves = 0;
  state.bfsSteps    = 0;
  state.dfsSteps    = 0;
  state.started     = false;
  state.running     = false;
  state.history     = [];
  state.totalBfsExp = 0;
  state.totalDfsExp = 0;

  updateStatus("Press Start — Begin the Heist");
  document.getElementById("insight").textContent     = "BFS ninja sweeps streets level by level · DFS ninja dives deep into alleys";
  document.getElementById("bfsExplored").textContent = 0;
  document.getElementById("dfsExplored").textContent = 0;
  clearStructPanels();
  resetAnalysis();
  render(null, null);
}

/* ── MAZE GENERATION ──────────────────────────── */
function generateMaze() {
  let maze;
  do {
    maze = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) row.push(Math.random() < 0.18 ? '#' : '.');
      maze.push(row);
    }
    for (let r = 2; r < ROWS-2; r += 3)
      for (let c = 2; c < COLS-2; c++)
        if (Math.random() < 0.5) maze[r][c] = '#';
    maze[0][0]           = 'P';
    maze[ROWS-1][0]      = 'E';
    maze[ROWS-1][COLS-1] = 'G';
  } while (
    !pathExists({r:0,c:0},      {r:ROWS-1,c:COLS-1}, maze) ||
    !pathExists({r:ROWS-1,c:0}, {r:0,c:0},           maze)
  );
  return maze;
}

function pathExists(start, end, maze) {
  const seen = new Set([`${start.r},${start.c}`]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    if (cur.r===end.r && cur.c===end.c) return true;
    for (const [dr,dc] of DIRS) {
      const nr=cur.r+dr, nc=cur.c+dc, k=`${nr},${nc}`;
      if (!seen.has(k) && passable(nr,nc,maze)) { seen.add(k); queue.push({r:nr,c:nc}); }
    }
  }
  return false;
}

function findEntities() {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    if (state.maze[r][c]==='P') state.player     = {r,c};
    if (state.maze[r][c]==='E') state.enemyStart = {r,c};
    if (state.maze[r][c]==='G') state.goal       = {r,c};
  }
}

function passable(r, c, maze=state.maze) {
  return r>=0 && r<ROWS && c>=0 && c<COLS && maze[r][c]!=='#';
}

/* ══════════════════════════════════════════════════════════
   BFS — Queue (FIFO). Marks visited ON ENQUEUE.
   Returns { path, explored, queueSnapshot }
   ══════════════════════════════════════════════════════════ */
function bfs(start, target) {
  const seen     = new Set([`${start.r},${start.c}`]);
  const explored = new Set();
  const queue    = [{ pos: start, path: [start] }];

  while (queue.length) {
    const { pos, path } = queue.shift();
    explored.add(`${pos.r},${pos.c}`);

    if (pos.r===target.r && pos.c===target.c)
      return { path, explored, queueSnapshot: queue.map(e=>e.pos) };

    for (const [dr,dc] of DIRS) {
      const np = {r:pos.r+dr, c:pos.c+dc};
      const nk = `${np.r},${np.c}`;
      if (!seen.has(nk) && passable(np.r,np.c)) {
        seen.add(nk);  // mark on enqueue ✓
        queue.push({ pos: np, path: [...path, np] });
      }
    }
  }
  return { path: null, explored, queueSnapshot: queue.map(e=>e.pos) };
}

/* ══════════════════════════════════════════════════════════
   DFS — Stack (LIFO). Marks visited ON PUSH.
   Marking on push (same as BFS) prevents duplicate entries
   from accumulating on the stack, which caused the ninja to
   oscillate back and forth between the same two tiles.
   Returns { path, explored, stackSnapshot }
   ══════════════════════════════════════════════════════════ */
function dfs(start, target) {
  const seen     = new Set([`${start.r},${start.c}`]);  // mark on push
  const explored = new Set();
  const stack    = [{ pos: start, path: [start] }];

  while (stack.length) {
    const { pos, path } = stack.pop();
    explored.add(`${pos.r},${pos.c}`);

    if (pos.r===target.r && pos.c===target.c)
      return { path, explored, stackSnapshot: [...stack].reverse().map(e=>e.pos) };

    for (let i=DIRS.length-1; i>=0; i--) {
      const [dr,dc] = DIRS[i];
      const np = {r:pos.r+dr, c:pos.c+dc};
      const nk = `${np.r},${np.c}`;
      if (!seen.has(nk) && passable(np.r,np.c)) {
        seen.add(nk);  // mark on push — prevents duplicates ✓
        stack.push({ pos: np, path: [...path, np] });
      }
    }
  }
  return { path: null, explored, stackSnapshot: [...stack].reverse().map(e=>e.pos) };
}

/* ── PLAYER MOVE ──────────────────────────────── */
function movePlayer(dr, dc) {
  if (!state.started || state.running) return;
  const nr=state.player.r+dr, nc=state.player.c+dc;
  if (!passable(nr,nc)) return;
  state.player = {r:nr, c:nc};
  state.playerMoves++;

  if (nr===state.goal.r && nc===state.goal.c) {
    render(null,null);
    updateStatus("💰 HEIST COMPLETE — YOU ESCAPED!");
    state.started = false;
    return;
  }
  step();
}

/* ── STEP ─────────────────────────────────────── */
function step() {
  state.running = true;

  const bfsResult = bfs(state.bfsPos, state.player);
  bfsResult.explored.forEach(k => state.bfsVisited.add(k));

  const dfsResult = dfs(state.dfsPos, state.player);
  dfsResult.explored.forEach(k => state.dfsVisited.add(k));

  if (bfsResult.path && bfsResult.path.length>1) { state.bfsPos = bfsResult.path[1]; state.bfsSteps++; }
  if (dfsResult.path && dfsResult.path.length>1) { state.dfsPos = dfsResult.path[1]; state.dfsSteps++; }

  const caught =
    (state.bfsPos.r===state.player.r && state.bfsPos.c===state.player.c) ||
    (state.dfsPos.r===state.player.r && state.dfsPos.c===state.player.c);

  state.history.push({ bfsExp: bfsResult.explored.size, dfsExp: dfsResult.explored.size });
  state.totalBfsExp += bfsResult.explored.size;
  state.totalDfsExp += dfsResult.explored.size;

  render(bfsResult, dfsResult);
  updateStructPanels(bfsResult.queueSnapshot, dfsResult.stackSnapshot);
  updateInsight(bfsResult, dfsResult);
  updateAnalysis(bfsResult, dfsResult);

  if (caught) { updateStatus("🥷 NINJA GOT YOU — BUSTED!"); state.started=false; return; }
  setTimeout(() => { state.running=false; }, 120);
}

/* ── RENDER ───────────────────────────────────── */
function render(bfsResult, dfsResult) {
  document.getElementById("playerMoves").textContent = state.playerMoves;
  document.getElementById("bfsSteps").textContent    = state.bfsSteps;
  document.getElementById("dfsSteps").textContent    = state.dfsSteps;
  document.getElementById("bfsExplored").textContent = state.bfsVisited.size;
  document.getElementById("dfsExplored").textContent = state.dfsVisited.size;

  const bfsPath = bfsResult && bfsResult.path ? new Set(bfsResult.path.map(p=>`${p.r},${p.c}`)) : new Set();
  const dfsPath = dfsResult && dfsResult.path ? new Set(dfsResult.path.map(p=>`${p.r},${p.c}`)) : new Set();

  const bfsExplored = bfsResult ? bfsResult.explored : new Set();
  const dfsExplored = dfsResult ? dfsResult.explored : new Set();
  draw("mazeBFS", state.bfsPos, bfsExplored, bfsPath, true);
  draw("mazeDFS", state.dfsPos, dfsExplored, dfsPath, false);
}

function draw(id, enemyPos, visited, pathSet, isBFS) {
  const el = document.getElementById(id);
  el.innerHTML = "";
  el.style.gridTemplateColumns = `repeat(${COLS}, 36px)`;

  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const k = `${r},${c}`;

      if (state.maze[r][c]==='#') {
        cell.classList.add("wall");
      } else if (r===state.player.r && c===state.player.c) {
        cell.classList.add("player");
      } else if (r===enemyPos.r && c===enemyPos.c) {
        cell.classList.add("enemy");
      } else if (r===state.goal.r && c===state.goal.c) {
        cell.classList.add("goal");
      } else if (pathSet.has(k)) {
        cell.classList.add(isBFS ? "visited-bfs" : "visited-dfs");
        cell.style.outline = isBFS
          ? "1px solid rgba(56,189,248,0.5)"
          : "1px solid rgba(249,115,22,0.5)";
      } else if (visited.has(k)) {
        cell.classList.add(isBFS ? "visited-bfs" : "visited-dfs");
      }
      el.appendChild(cell);
    }
  }
}

/* ── INSIGHT ──────────────────────────────────── */
function updateInsight(bfsResult, dfsResult) {
  const bfsPath = bfsResult.path ? bfsResult.path.length : 0;
  const dfsPath = dfsResult.path ? dfsResult.path.length : 0;
  const bfsExp  = bfsResult.explored.size;
  const dfsExp  = dfsResult.explored.size;
  let msg;
  if (bfsPath>0 && dfsPath>0) {
    const diff = dfsPath-bfsPath;
    if (diff>0)        msg = `BFS ninja: ${bfsPath} steps (shortest route) · DFS ninja: ${dfsPath} (+${diff}) · BFS scanned ${bfsExp}, DFS ${dfsExp}`;
    else if (diff===0) msg = `Both ninjas found equal routes (${bfsPath} steps) · BFS scanned ${bfsExp}, DFS ${dfsExp}`;
    else               msg = `DFS found a shorter alley this run (${dfsPath} vs ${bfsPath}) · BFS scanned ${bfsExp}, DFS ${dfsExp}`;
  } else {
    msg = `BFS ninja scanned ${bfsExp} streets · DFS ninja scanned ${dfsExp} streets`;
  }
  document.getElementById("insight").textContent = msg;
}

function updateStatus(msg) {
  document.getElementById("status").textContent = msg;
}

/* ════════════════════════════════════════════════
   LIVE STRUCTURE PANELS
   ════════════════════════════════════════════════ */
function clearStructPanels() {
  renderStructList("bfsQueue", [], true);
  renderStructList("dfsStack", [], false);
  document.getElementById("bfsQueueSize").textContent = 0;
  document.getElementById("dfsStackSize").textContent = 0;
}

function updateStructPanels(queueSnapshot, stackSnapshot) {
  document.getElementById("bfsQueueSize").textContent = queueSnapshot.length;
  document.getElementById("dfsStackSize").textContent = stackSnapshot.length;
  renderStructList("bfsQueue", queueSnapshot, true);
  renderStructList("dfsStack", stackSnapshot, false);
}

function renderStructList(elId, items, isBFS) {
  const list    = document.getElementById(elId);
  const emptyEl = document.getElementById(elId + "Empty");
  list.innerHTML = "";

  // deduplicate for display
  const seen = new Set(), unique = [];
  for (const pos of items) {
    const k = `${pos.r},${pos.c}`;
    if (!seen.has(k)) { seen.add(k); unique.push(pos); }
  }

  if (unique.length === 0) {
    if (emptyEl) emptyEl.classList.add("visible");
    return;
  }
  if (emptyEl) emptyEl.classList.remove("visible");

  unique.slice(0, 20).forEach((pos, i) => {
    const node = document.createElement("div");
    const isHead = i === 0;
    node.className = isBFS
      ? (isHead ? "struct-node bfs-node head-node" : "struct-node bfs-node")
      : (isHead ? "struct-node dfs-node top-node"  : "struct-node dfs-node");
    const tag = isHead ? (isBFS ? "FRONT" : "TOP") : `#${i+1}`;
    node.innerHTML = `
      <span class="node-index">${i}</span>
      <span class="node-label">(${pos.r},${pos.c})</span>
      <span class="node-tag">${tag}</span>`;
    list.appendChild(node);
  });

  if (unique.length > 20) {
    const more = document.createElement("div");
    more.style.cssText = "font-size:0.6rem;color:#334155;padding:3px 6px;";
    more.textContent = `+ ${unique.length-20} more…`;
    list.appendChild(more);
  }
}

/* ════════════════════════════════════════════════
   COMPARATIVE ANALYSIS
   ════════════════════════════════════════════════ */
function resetAnalysis() {
  ["cmpBfsPath","cmpDfsPath","cmpPathWinner",
   "cmpBfsExp","cmpDfsExp","cmpExpWinner",
   "cmpBfsStruct","cmpDfsStruct","cmpStructWinner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = "—"; el.className = ""; }
  });
  document.getElementById("totalBfsExp").textContent   = 0;
  document.getElementById("totalDfsExp").textContent   = 0;
  document.getElementById("totalBfsSteps").textContent = 0;
  document.getElementById("totalDfsSteps").textContent = 0;
  document.getElementById("avgBfs").textContent        = "—";
  document.getElementById("avgDfs").textContent        = "—";
  document.getElementById("chartBars").innerHTML       = "";
  document.getElementById("chartYAxis").innerHTML      = "";
  document.getElementById("chartNote").textContent     = "Move to populate";
  document.getElementById("analysisCallout").textContent = "Move the robber to see ninja analysis.";
}

function updateAnalysis(bfsResult, dfsResult) {
  const bfsPath = bfsResult.path ? bfsResult.path.length : null;
  const dfsPath = dfsResult.path ? dfsResult.path.length : null;
  const bfsExp  = bfsResult.explored.size;
  const dfsExp  = dfsResult.explored.size;
  const bfsQ    = bfsResult.queueSnapshot.length;
  const dfsS    = dfsResult.stackSnapshot.length;
  const moves   = state.history.length;

  // path row
  document.getElementById("cmpBfsPath").textContent = bfsPath ?? "—";
  document.getElementById("cmpDfsPath").textContent = dfsPath ?? "—";
  const pw = document.getElementById("cmpPathWinner");
  if (bfsPath && dfsPath) {
    if (bfsPath < dfsPath)      { pw.textContent="BFS ✓"; pw.className="bfs-winner winner-cell"; }
    else if (dfsPath < bfsPath) { pw.textContent="DFS";   pw.className="dfs-winner winner-cell"; }
    else                        { pw.textContent="Tie";   pw.className="tie-winner winner-cell"; }
  }

  // explored row
  document.getElementById("cmpBfsExp").textContent = bfsExp;
  document.getElementById("cmpDfsExp").textContent = dfsExp;
  const ew = document.getElementById("cmpExpWinner");
  if (bfsExp < dfsExp)      { ew.textContent="BFS ✓"; ew.className="bfs-winner winner-cell"; }
  else if (dfsExp < bfsExp) { ew.textContent="DFS ✓"; ew.className="dfs-winner winner-cell"; }
  else                      { ew.textContent="Equal";  ew.className="tie-winner winner-cell"; }

  // structure size row
  document.getElementById("cmpBfsStruct").textContent = bfsQ;
  document.getElementById("cmpDfsStruct").textContent = dfsS;
  const sw = document.getElementById("cmpStructWinner");
  if (bfsQ < dfsS)      { sw.textContent="BFS ✓"; sw.className="bfs-winner winner-cell"; }
  else if (dfsS < bfsQ) { sw.textContent="DFS ✓"; sw.className="dfs-winner winner-cell"; }
  else                  { sw.textContent="Equal";  sw.className="tie-winner winner-cell"; }

  // totals
  document.getElementById("totalBfsExp").textContent   = state.totalBfsExp;
  document.getElementById("totalDfsExp").textContent   = state.totalDfsExp;
  document.getElementById("totalBfsSteps").textContent = state.bfsSteps;
  document.getElementById("totalDfsSteps").textContent = state.dfsSteps;
  document.getElementById("avgBfs").textContent = (state.totalBfsExp/moves).toFixed(1);
  document.getElementById("avgDfs").textContent = (state.totalDfsExp/moves).toFixed(1);

  renderChart();
  renderCallout(bfsPath, dfsPath, bfsExp, dfsExp);
}

function renderChart() {
  const barsEl = document.getElementById("chartBars");
  const yEl    = document.getElementById("chartYAxis");
  const noteEl = document.getElementById("chartNote");
  barsEl.innerHTML = ""; yEl.innerHTML = "";

  const history = state.history.slice(-MAX_CHART_BARS);
  if (!history.length) return;
  noteEl.textContent = `Last ${history.length} move${history.length>1?"s":""}`;

  const maxVal = Math.max(...history.map(h=>Math.max(h.bfsExp,h.dfsExp)), 1);
  const chartH = 90;

  for (let i=4; i>=0; i--) {
    const tick = document.createElement("div");
    tick.textContent = Math.round(maxVal*i/4);
    yEl.appendChild(tick);
  }

  history.forEach((h,i) => {
    const group = document.createElement("div");
    group.className = "bar-group";
    const pair = document.createElement("div");
    pair.className = "bar-pair";

    const bBar = document.createElement("div");
    bBar.className = "bar bfs-bar";
    bBar.style.height = `${Math.max(2,(h.bfsExp/maxVal)*chartH)}px`;
    bBar.title = `Move ${i+1} BFS:${h.bfsExp}`;

    const dBar = document.createElement("div");
    dBar.className = "bar dfs-bar";
    dBar.style.height = `${Math.max(2,(h.dfsExp/maxVal)*chartH)}px`;
    dBar.title = `Move ${i+1} DFS:${h.dfsExp}`;

    pair.appendChild(bBar); pair.appendChild(dBar);
    const lbl = document.createElement("div");
    lbl.className = "bar-label";
    lbl.textContent = i+1;
    group.appendChild(pair); group.appendChild(lbl);
    barsEl.appendChild(group);
  });
  barsEl.scrollLeft = barsEl.scrollWidth;
}

function renderCallout(bfsPath, dfsPath, bfsExp, dfsExp) {
  const moves  = state.history.length;
  const avgBfs = (state.totalBfsExp/moves).toFixed(1);
  const avgDfs = (state.totalDfsExp/moves).toFixed(1);
  let v = "";
  if (bfsPath && dfsPath) {
    if (bfsPath < dfsPath) v += `BFS ninja found the shortest chase route (${bfsPath} vs ${dfsPath} steps). `;
    else if (bfsPath===dfsPath) v += `Both ninjas matched route length (${bfsPath} steps). `;
  }
  if (bfsExp < dfsExp)      v += `BFS scanned fewer streets (${bfsExp} vs ${dfsExp}). `;
  else if (dfsExp < bfsExp) v += `DFS scanned fewer streets (${dfsExp} vs ${bfsExp}). `;
  else                      v += `Same streets scanned by both ninjas. `;
  if (moves > 1) v += `Averages: BFS ${avgBfs}/move, DFS ${avgDfs}/move.`;
  document.getElementById("analysisCallout").textContent = v || "Move the robber to generate analysis.";
}

/* ── CONTROLS ─────────────────────────────────── */
document.getElementById("startBtn").onclick = () => {
  state.started = true; updateStatus("🦹 Robber on the run — Ninjas closing in!");
};
document.getElementById("restartBtn").onclick = init;

document.addEventListener("keydown", e => {
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
  if (e.key==="ArrowUp"    || e.key==="w") movePlayer(-1,  0);
  if (e.key==="ArrowDown"  || e.key==="s") movePlayer( 1,  0);
  if (e.key==="ArrowLeft"  || e.key==="a") movePlayer(0,  -1);
  if (e.key==="ArrowRight" || e.key==="d") movePlayer(0,   1);
});

init();
