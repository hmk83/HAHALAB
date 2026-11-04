(function () {
  'use strict';

  const LAB_ID = 'number-cross-math-puzzle';
  const LAB_TITLE = '가로세로 연산 퍼즐';
  const PUZZLES_PER_STAGE = 5;
  const COLORS = ['#2563eb', '#0891b2', '#16a34a', '#f97316', '#8b5cf6', '#e11d48'];

  const STAGES = [
    { order: 1, id: 'add-basic', title: '덧셈 퍼즐 입문', desc: '8x8 격자에서 +만 풀어요.', ops: ['+'], gridSize: 8, maxOperand: 9, maxResult: 18, questionCount: PUZZLES_PER_STAGE },
    { order: 2, id: 'sub-basic', title: '뺄셈 퍼즐 입문', desc: '8x8 격자에서 -만 풀어요.', ops: ['-'], gridSize: 8, maxOperand: 18, maxResult: 9, questionCount: PUZZLES_PER_STAGE },
    { order: 3, id: 'mixed-1digit-basic', title: '덧셈 뺄셈 퍼즐', desc: '8x8 격자에서 +와 -를 함께 풀어요.', ops: ['+', '-'], gridSize: 8, maxOperand: 9, maxResult: 20, questionCount: PUZZLES_PER_STAGE },
    { order: 4, id: 'mixed-1digit-expanded', title: '혼합 연산 확장', desc: '8x8 격자에서 여러 연산 흐름을 따라가요.', ops: ['+', '-'], gridSize: 8, maxOperand: 12, maxResult: 30, questionCount: PUZZLES_PER_STAGE },
    { order: 5, id: 'add-2digit-basic', title: '두자리 덧셈 퍼즐', desc: '9x9 격자에서 최대 두자리 수까지 더해요.', ops: ['+'], gridSize: 9, minOperand: 10, maxOperand: 49, maxResult: 99, questionCount: PUZZLES_PER_STAGE },
    { order: 6, id: 'sub-2digit-basic', title: '두자리 뺄셈 퍼즐', desc: '9x9 격자에서 최대 두자리 수에서 빼요.', ops: ['-'], gridSize: 9, minOperand: 10, maxOperand: 99, maxResult: 99, questionCount: PUZZLES_PER_STAGE },
    { order: 7, id: 'times-table-basic', title: '구구단 곱셈 퍼즐', desc: '10x10 격자에서 한자리 x 한자리 구구단을 풀어요.', ops: ['×'], gridSize: 10, minOperand: 1, maxOperand: 9, maxResult: 81, questionCount: PUZZLES_PER_STAGE },
    { order: 8, id: 'mixed-with-times', title: '연산 종합 퍼즐', desc: '10x10 격자에서 +, -, x를 함께 풀어요.', ops: ['+', '-', '×'], gridSize: 10, minOperand: 1, maxOperand: 30, maxResult: 99, questionCount: PUZZLES_PER_STAGE }
  ];

  const state = {
    stage: null,
    puzzleIndex: 0,
    puzzle: null,
    activeBlankId: '',
    entry: '',
    correct: 0,
    wrong: 0,
    responseTimes: [],
    startedAt: 0,
    puzzleStartedAt: 0,
    saved: false,
    questionHistory: []
  };

  const els = {};
  const audioCache = {};
  const lastPuzzleSignatureByStage = new Map();
  const LEVEL_POOL = Array.isArray(window.NumberCrossMathPuzzleLevels) ? window.NumberCrossMathPuzzleLevels : [];

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[randomInt(0, items.length - 1)];
  const shuffle = (items) => {
    const next = items.slice();
    for (let index = next.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(0, index);
      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;
    }
    return next;
  };

  const calc = (left, op, right) => {
    if (op === '+') return left + right;
    if (op === '-') return left - right;
    if (op === '×') return left * right;
    return NaN;
  };

  const isValidEquation = (left, op, right, answer, stage) => {
    if (!Number.isInteger(left) || !Number.isInteger(right) || !Number.isInteger(answer)) return false;
    if (left < 0 || right < 0 || answer < 0) return false;
    if (answer !== calc(left, op, right)) return false;
    if (op === '×') return left >= 1 && left <= 9 && right >= 1 && right <= 9 && answer <= 81;
    return answer <= Number(stage.maxResult || 99);
  };

  const makeEquation = (stage, op) => {
    const min = Number(stage.minOperand || 1);
    const max = Number(stage.maxOperand || 9);
    for (let attempt = 0; attempt < 400; attempt += 1) {
      let left = randomInt(min, max);
      let right = randomInt(op === '×' ? 1 : min, op === '×' ? 9 : max);
      if (op === '-') {
        if (right > left) {
          const temp = left;
          left = right;
          right = temp;
        }
      }
      const answer = calc(left, op, right);
      if (isValidEquation(left, op, right, answer, stage)) {
        return { left, op, right, answer };
      }
    }
    return op === '-' ? { left: 9, op, right: 4, answer: 5 } : op === '×' ? { left: 3, op, right: 4, answer: 12 } : { left: 4, op, right: 5, answer: 9 };
  };

  const makeEquationWithFixed = (stage, fixedRole, fixedValue) => {
    const min = Number(stage.minOperand || 1);
    const max = Number(stage.maxOperand || 9);
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const op = pick(stage.ops);
      let left = fixedValue;
      let right = randomInt(op === '×' ? 1 : min, op === '×' ? 9 : max);
      let answer = fixedValue;
      if (fixedRole === 'left') {
        left = fixedValue;
        right = randomInt(op === '×' ? 1 : min, op === '×' ? 9 : max);
        answer = calc(left, op, right);
      } else if (fixedRole === 'right') {
        right = fixedValue;
        left = randomInt(op === '×' ? 1 : min, op === '×' ? 9 : max);
        if (op === '-' && left < right) continue;
        answer = calc(left, op, right);
      } else {
        answer = fixedValue;
        if (op === '+') {
          if (answer < 2) continue;
          left = randomInt(Math.max(1, min), Math.min(max, answer - 1));
          right = answer - left;
        } else if (op === '-') {
          right = randomInt(Math.max(1, min), max);
          left = answer + right;
        } else if (op === '×') {
          const factors = [];
          for (let factor = 1; factor <= 9; factor += 1) {
            if (answer % factor === 0 && answer / factor >= 1 && answer / factor <= 9) {
              factors.push([factor, answer / factor]);
            }
          }
          if (!factors.length) continue;
          [left, right] = pick(factors);
        }
      }
      if (isValidEquation(left, op, right, answer, stage)) return { left, op, right, answer };
    }
    return makeEquation(stage, pick(stage.ops));
  };

  const solveMissingRight = (left, op, answer) => {
    if (op === '+') return answer - left;
    if (op === '-') return left - answer;
    if (op === '×') return left ? answer / left : NaN;
    return NaN;
  };

  const createEmptyPuzzle = (mode, gridSize) => ({
    mode,
    gridSize: clamp(Number(gridSize || 6), 6, 10),
    cells: new Map(),
    blanks: [],
    equations: []
  });

  const cellKey = (row, col) => `${row}:${col}`;

  const addCell = (puzzle, row, col, data) => {
    const key = cellKey(row, col);
    const existing = puzzle.cells.get(key);
    if (existing) {
      if (existing.type !== data.type) {
        throw new Error(`Conflicting cell ${key}`);
      }
      if (existing.type === 'number' && Number(existing.value) !== Number(data.value)) {
        throw new Error(`Conflicting cell ${key}`);
      }
      if (existing.type === 'operator' && existing.text !== data.text) {
        throw new Error(`Conflicting cell ${key}`);
      }
      return existing;
    }
    const cell = Object.assign({ row, col }, data);
    puzzle.cells.set(key, cell);
    return cell;
  };

  const markBlank = (puzzle, row, col, label) => {
    const cell = puzzle.cells.get(cellKey(row, col));
    if (!cell || cell.type !== 'number') return;
    if (cell.blankId) return;
    cell.blankId = `blank-${puzzle.blanks.length + 1}`;
    cell.label = label || `${puzzle.blanks.length + 1}번 빈칸`;
    cell.userValue = '';
    cell.solved = false;
    puzzle.blanks.push(cell);
  };

  const canPlaceCell = (puzzle, row, col, data) => {
    if (row < 1 || row > puzzle.gridSize || col < 1 || col > puzzle.gridSize) return false;
    const existing = puzzle.cells.get(cellKey(row, col));
    if (!existing) return true;
    if (existing.type !== data.type) return false;
    if (existing.type === 'number') return Number(existing.value) === Number(data.value);
    return existing.text === data.text;
  };

  const addHorizontalEquation = (puzzle, row, col, equation, prefix) => {
    if (puzzle.equations.some((item) => item.orientation === 'row' && item.startRow === row && item.startCol === col)) {
      throw new Error('Duplicate horizontal equation');
    }
    const items = [
      [row, col, { type: 'number', value: equation.left }],
      [row, col + 1, { type: 'operator', text: equation.op }],
      [row, col + 2, { type: 'number', value: equation.right }],
      [row, col + 3, { type: 'operator', text: '=' }],
      [row, col + 4, { type: 'number', value: equation.answer }]
    ];
    if (!items.every(([nextRow, nextCol, data]) => canPlaceCell(puzzle, nextRow, nextCol, data))) {
      throw new Error('Cannot place horizontal equation');
    }
    const left = addCell(puzzle, row, col, { type: 'number', value: equation.left });
    addCell(puzzle, row, col + 1, { type: 'operator', text: equation.op });
    const right = addCell(puzzle, row, col + 2, { type: 'number', value: equation.right });
    addCell(puzzle, row, col + 3, { type: 'operator', text: '=' });
    const answer = addCell(puzzle, row, col + 4, { type: 'number', value: equation.answer });
    puzzle.equations.push({ orientation: 'row', startRow: row, startCol: col, cells: [left, right, answer], expression: `${equation.left} ${equation.op} ${equation.right} = ${equation.answer}` });
    return { left, right, answer, prefix };
  };

  const addVerticalEquation = (puzzle, row, col, equation, prefix) => {
    if (puzzle.equations.some((item) => item.orientation === 'col' && item.startRow === row && item.startCol === col)) {
      throw new Error('Duplicate vertical equation');
    }
    const items = [
      [row, col, { type: 'number', value: equation.left }],
      [row + 1, col, { type: 'operator', text: equation.op }],
      [row + 2, col, { type: 'number', value: equation.right }],
      [row + 3, col, { type: 'operator', text: '=' }],
      [row + 4, col, { type: 'number', value: equation.answer }]
    ];
    if (!items.every(([nextRow, nextCol, data]) => canPlaceCell(puzzle, nextRow, nextCol, data))) {
      throw new Error('Cannot place vertical equation');
    }
    const left = addCell(puzzle, row, col, { type: 'number', value: equation.left });
    addCell(puzzle, row + 1, col, { type: 'operator', text: equation.op });
    const right = addCell(puzzle, row + 2, col, { type: 'number', value: equation.right });
    addCell(puzzle, row + 3, col, { type: 'operator', text: '=' });
    const answer = addCell(puzzle, row + 4, col, { type: 'number', value: equation.answer });
    puzzle.equations.push({ orientation: 'col', startRow: row, startCol: col, cells: [left, right, answer], expression: `${equation.left} ${equation.op} ${equation.right} = ${equation.answer}` });
    return { left, right, answer, prefix };
  };

  const getEquationStart = (cell, orientation, fixedRole) => {
    const offset = fixedRole === 'left' ? 0 : fixedRole === 'right' ? 2 : 4;
    return orientation === 'row'
      ? { row: cell.row, col: cell.col - offset }
      : { row: cell.row - offset, col: cell.col };
  };

  const addConnectedEquation = (puzzle, stage, cell, orientation, fixedRole, label) => {
    const start = getEquationStart(cell, orientation, fixedRole);
    const equation = makeEquationWithFixed(stage, fixedRole, Number(cell.value));
    return orientation === 'row'
      ? addHorizontalEquation(puzzle, start.row, start.col, equation, `${label}-row`)
      : addVerticalEquation(puzzle, start.row, start.col, equation, `${label}-col`);
  };

  const addExtraEquations = (puzzle, stage, limit) => {
    let placed = 0;
    for (let attempt = 0; attempt < 120 && placed < limit; attempt += 1) {
      const numberCells = shuffle(Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number'));
      const cell = numberCells[0];
      if (!cell) break;
      for (const fixedRole of shuffle(['left', 'right', 'answer'])) {
        for (const orientation of shuffle(['row', 'col'])) {
        try {
            addConnectedEquation(puzzle, stage, cell, orientation, fixedRole, `extra-${placed}`);
          placed += 1;
            break;
        } catch (_error) {}
      }
        if (placed >= limit) break;
      }
    }
  };

  const isPuzzleConnected = (puzzle) => {
    const keys = new Set(Array.from(puzzle.cells.keys()));
    const first = keys.values().next().value;
    if (!first) return false;
    const seen = new Set([first]);
    const queue = [first];
    while (queue.length) {
      const key = queue.shift();
      const [row, col] = key.split(':').map(Number);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
        const nextKey = cellKey(row + dr, col + dc);
        if (keys.has(nextKey) && !seen.has(nextKey)) {
          seen.add(nextKey);
          queue.push(nextKey);
        }
      });
    }
    return seen.size === keys.size;
  };

  const chooseClearBlankCells = (puzzle, targetCount) => {
    const equationIndexesByCell = new Map();
    puzzle.equations.forEach((equation, equationIndex) => {
      equation.cells.forEach((cell) => {
        const key = cellKey(cell.row, cell.col);
        if (!equationIndexesByCell.has(key)) equationIndexesByCell.set(key, []);
        equationIndexesByCell.get(key).push(equationIndex);
      });
    });
    const counts = Array(puzzle.equations.length).fill(0);
    const chosen = [];
    const chosenKeys = new Set();
    const canChoose = (cell) => {
      const key = cellKey(cell.row, cell.col);
      const indexes = equationIndexesByCell.get(key) || [];
      return !chosenKeys.has(key) && indexes.length && indexes.every((index) => counts[index] === 0);
    };
    const choose = (cell) => {
      const key = cellKey(cell.row, cell.col);
      chosen.push(cell);
      chosenKeys.add(key);
      (equationIndexesByCell.get(key) || []).forEach((index) => {
        counts[index] += 1;
      });
    };
    shuffle(puzzle.equations.map((_, index) => index)).forEach((equationIndex) => {
      if (chosen.length >= targetCount) return;
      const cell = shuffle(puzzle.equations[equationIndex].cells).find(canChoose);
      if (cell) choose(cell);
    });
    shuffle(Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number')).forEach((cell) => {
      if (chosen.length >= targetCount) return;
      if (canChoose(cell)) choose(cell);
    });
    return chosen;
  };

  const buildCrossPuzzle = (stage) => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const gridSize = clamp(Number(stage.gridSize || 6), 6, 10);
      const puzzle = createEmptyPuzzle('crossword', gridSize);
      const baseRow = clamp(Math.floor(gridSize / 2), 3, gridSize - 2);
      const startCol = gridSize >= 9 ? 2 : 1;
      const baseEquation = makeEquation(stage, pick(stage.ops));
      try {
        const base = addHorizontalEquation(puzzle, baseRow, startCol, baseEquation, 'base');
        [
          [startCol, base.left.value],
          [startCol + 2, base.right.value],
          [startCol + 4, base.answer.value]
        ].forEach(([col, fixedValue], index) => {
          for (let crossAttempt = 0; crossAttempt < 20; crossAttempt += 1) {
            try {
              const topRow = clamp(baseRow - 2, 1, gridSize - 4);
              const fixedRole = fixedValue <= 9 ? 'right' : 'answer';
              addVerticalEquation(puzzle, topRow, col, makeEquationWithFixed(stage, fixedRole, fixedValue), `cross-${index}`);
              return;
            } catch (_error) {
              try {
                addVerticalEquation(puzzle, baseRow, col, makeEquationWithFixed(stage, 'left', fixedValue), `cross-down-${index}`);
                return;
              } catch (_downError) {}
            }
          }
        });
        addExtraEquations(puzzle, stage, 0);
        const blankTarget = clamp(Math.round(Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number').length * 0.36), 4, gridSize >= 9 ? 8 : 6);
        chooseClearBlankCells(puzzle, blankTarget).forEach((cell, index) => {
          markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
        });
        if (puzzle.equations.length >= 4 && puzzle.blanks.length >= 4 && isPuzzleConnected(puzzle)) return puzzle;
      } catch (_error) {}
    }
    return buildLinkedPuzzle(stage);
  };

  const buildTimesCrossPuzzle = (stage) => {
    const gridSize = clamp(Number(stage.gridSize || 10), 10, 10);
    const puzzle = createEmptyPuzzle('crossword', gridSize);
    const left = randomInt(2, 9);
    const right = randomInt(2, 9);
    const answer = left * right;
    const row = 5;
    const col = 3;
    addHorizontalEquation(puzzle, row, col, { left, op: '×', right, answer }, 'times-base');
    addVerticalEquation(puzzle, 3, col, makeEquationWithFixed(stage, 'right', left), 'times-left');
    addVerticalEquation(puzzle, 3, col + 2, makeEquationWithFixed(stage, 'right', right), 'times-right');
    addVerticalEquation(puzzle, 1, col + 4, makeEquationWithFixed(stage, 'answer', answer), 'times-answer');
    chooseClearBlankCells(puzzle, 4).forEach((cell, index) => {
      markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
    });
    return puzzle;
  };

  const getMatrixOpPairs = (stage) => {
    const ops = stage.ops;
    if (ops.length === 1) return [[ops[0], ops[0]]];
    if (ops.includes('+') && ops.includes('-') && !ops.includes('×')) {
      return shuffle([['+', '-'], ['-', '+'], ['+', '+'], ['-', '-']]);
    }
    return shuffle([['+', '-'], ['-', '+'], ['×', '×'], ['+', '+'], ['-', '-']].filter(([rowOp, colOp]) => ops.includes(rowOp) && ops.includes(colOp)));
  };

  const pickMatrixOperands = (stage, rowOp, colOp) => {
    const min = rowOp === '×' || colOp === '×' ? 1 : Number(stage.minOperand || 1);
    const max = rowOp === '×' || colOp === '×' ? 3 : Math.min(Number(stage.maxOperand || 9), 24);
    const maxCellValue = Math.max(Number(stage.maxOperand || 9), Number(stage.maxResult || 99));
    for (let attempt = 0; attempt < 1200; attempt += 1) {
      const a = randomInt(min, max);
      const b = randomInt(min, max);
      const c = randomInt(min, max);
      const d = randomInt(min, max);
      const n00 = a;
      const n01 = b;
      const n10 = c;
      const n11 = d;
      const n02 = calc(n00, rowOp, n01);
      const n12 = calc(n10, rowOp, n11);
      const n20 = calc(n00, colOp, n10);
      const n21 = calc(n01, colOp, n11);
      const n22 = calc(n20, rowOp, n21);
      if (n22 !== calc(n02, colOp, n12)) continue;
      const matrix = [
        [n00, n01, n02],
        [n10, n11, n12],
        [n20, n21, n22]
      ];
      if (matrix.flat().some((value) => !Number.isInteger(value) || value < 0 || value > maxCellValue)) continue;
      const equations = [
        [n00, rowOp, n01, n02],
        [n10, rowOp, n11, n12],
        [n20, rowOp, n21, n22],
        [n00, colOp, n10, n20],
        [n01, colOp, n11, n21],
        [n02, colOp, n12, n22]
      ];
      const valid = equations.every(([left, nextOp, right, answer]) => isValidEquation(left, nextOp, right, answer, stage));
      if (valid) return matrix;
    }
    return null;
  };

  const buildVerifiedCrossMatrixPuzzle = (stage) => {
    const gridSize = clamp(Number(stage.gridSize || 6), 6, 10);
    const opPairs = getMatrixOpPairs(stage);
    for (const [rowOp, colOp] of opPairs) {
      const matrix = pickMatrixOperands(stage, rowOp, colOp);
      if (!matrix) continue;
      const puzzle = createEmptyPuzzle('cross-matrix', gridSize);
      const startRow = Math.floor((gridSize - 5) / 2) + 1;
      const startCol = Math.floor((gridSize - 5) / 2) + 1;
      const rows = [startRow, startRow + 2, startRow + 4];
      const cols = [startCol, startCol + 2, startCol + 4];
      rows.forEach((row, index) => {
        addHorizontalEquation(puzzle, row, startCol, {
          left: matrix[index][0],
          op: rowOp,
          right: matrix[index][1],
          answer: matrix[index][2]
        }, `matrix-row-${index}`);
      });
      cols.forEach((col, index) => {
        addVerticalEquation(puzzle, startRow, col, {
          left: matrix[0][index],
          op: colOp,
          right: matrix[1][index],
          answer: matrix[2][index]
        }, `matrix-col-${index}`);
      });
      const blankCells = shuffle([
        puzzle.cells.get(cellKey(rows[0], cols[0])),
        puzzle.cells.get(cellKey(rows[1], cols[1])),
        puzzle.cells.get(cellKey(rows[2], cols[2]))
      ].filter(Boolean));
      blankCells.forEach((cell, index) => {
        markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
      });
      if (validatePuzzle(puzzle)) return puzzle;
    }
    return buildLinkedPuzzle(stage);
  };

  const getPuzzleBounds = (puzzle) => {
    const cells = Array.from(puzzle.cells.values());
    if (!cells.length) return { minRow: 1, maxRow: 1, minCol: 1, maxCol: 1, rowSpan: 1, colSpan: 1 };
    const minRow = Math.min(...cells.map((cell) => cell.row));
    const maxRow = Math.max(...cells.map((cell) => cell.row));
    const minCol = Math.min(...cells.map((cell) => cell.col));
    const maxCol = Math.max(...cells.map((cell) => cell.col));
    return { minRow, maxRow, minCol, maxCol, rowSpan: maxRow - minRow + 1, colSpan: maxCol - minCol + 1 };
  };

  const getIrregularTargetEquationCount = (stage) => {
    const gridSize = Number(stage.gridSize || 6);
    if (gridSize >= 10) return 8;
    if (gridSize >= 9) return 7;
    if (gridSize >= 8) return 6;
    return 5;
  };

  const getBlankTargetCount = (stage, puzzle) => {
    const numberCount = Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number').length;
    const stageLimit = Number(stage.gridSize || 6) >= 10 ? 7 : Number(stage.gridSize || 6) >= 8 ? 6 : 5;
    return clamp(Math.round(numberCount * 0.34), 3, stageLimit);
  };

  const getSpreadScore = (puzzle, cell) => {
    const bounds = getPuzzleBounds(puzzle);
    const edgeDistance = Math.max(
      Math.abs(cell.row - bounds.minRow),
      Math.abs(cell.row - bounds.maxRow),
      Math.abs(cell.col - bounds.minCol),
      Math.abs(cell.col - bounds.maxCol)
    );
    return edgeDistance + Math.random();
  };

  const addIrregularBranch = (puzzle, stage) => {
    const numberCells = shuffle(Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number'))
      .sort((a, b) => getSpreadScore(puzzle, b) - getSpreadScore(puzzle, a));
    for (const cell of numberCells) {
      const roles = Number(cell.value) > Number(stage.maxOperand || 9)
        ? shuffle(['answer', 'left'])
        : shuffle(['left', 'right', 'answer']);
      for (const fixedRole of roles) {
        for (const orientation of shuffle(['row', 'col'])) {
          try {
            addConnectedEquation(puzzle, stage, cell, orientation, fixedRole, `maze-${puzzle.equations.length}`);
            return true;
          } catch (_error) {}
        }
      }
    }
    return false;
  };

  const hasUsefulIrregularSpread = (puzzle) => {
    const bounds = getPuzzleBounds(puzzle);
    const usedRows = new Set(Array.from(puzzle.cells.values()).map((cell) => cell.row));
    const usedCols = new Set(Array.from(puzzle.cells.values()).map((cell) => cell.col));
    const minimumSpan = Number(puzzle.gridSize || 6) >= 8 ? Math.min(Number(puzzle.gridSize || 6), 8) : 5;
    return bounds.rowSpan >= minimumSpan &&
      bounds.colSpan >= minimumSpan &&
      usedRows.size >= 5 &&
      usedCols.size >= 5 &&
      isPuzzleConnected(puzzle);
  };

  const buildIrregularMazePuzzle = (stage) => {
    const gridSize = clamp(Number(stage.gridSize || 6), 6, 10);
    const targetEquations = getIrregularTargetEquationCount(stage);
    for (let attempt = 0; attempt < 160; attempt += 1) {
      const puzzle = createEmptyPuzzle('irregular-maze', gridSize);
      const baseRow = randomInt(1, gridSize - 4);
      const baseCol = randomInt(1, gridSize - 4);
      try {
        addHorizontalEquation(puzzle, baseRow, baseCol, makeEquation(stage, pick(stage.ops)), 'maze-main-row');
        const baseNumberCells = Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number');
        const firstCross = pick(baseNumberCells);
        addConnectedEquation(puzzle, stage, firstCross, 'col', pick(['left', 'right', 'answer']), 'maze-main-col');
      } catch (_error) {
        continue;
      }
      for (let branchAttempt = 0; branchAttempt < 260 && puzzle.equations.length < targetEquations; branchAttempt += 1) {
        addIrregularBranch(puzzle, stage);
      }
      for (let spreadAttempt = 0; spreadAttempt < 120 && !hasUsefulIrregularSpread(puzzle); spreadAttempt += 1) {
        if (!addIrregularBranch(puzzle, stage)) break;
      }
      if (puzzle.equations.length < targetEquations || !hasUsefulIrregularSpread(puzzle)) continue;
      chooseClearBlankCells(puzzle, getBlankTargetCount(stage, puzzle)).forEach((cell, index) => {
        markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
      });
      if (validatePuzzle(puzzle)) return puzzle;
    }
    return buildVerifiedCrossMatrixPuzzle(stage);
  };

  const buildLinkedPuzzle = (stage) => {
    const ops = stage.ops.filter((op) => op !== '×');
    const min = Number(stage.minOperand || 1);
    const max = Number(stage.maxOperand || 9);
    for (let attempt = 0; attempt < 1400; attempt += 1) {
      const gridSize = clamp(Number(stage.gridSize || 6), 6, 10);
      const puzzle = createEmptyPuzzle('linked', gridSize);
      const startRow = randomInt(1, gridSize - 4);
      const startCol = randomInt(1, gridSize - 4);
      const topOp = pick(ops);
      const leftOp = pick(ops);
      const rightOp = pick(ops);
      const bridgeOp = pick(ops);
      const base = randomInt(min, max);
      const topRight = randomInt(min, max);
      const leftRight = randomInt(min, max);
      const rightRight = randomInt(min, max);
      const topAnswer = calc(base, topOp, topRight);
      const leftAnswer = calc(base, leftOp, leftRight);
      const rightAnswer = calc(topAnswer, rightOp, rightRight);
      const bridgeRight = solveMissingRight(leftAnswer, bridgeOp, rightAnswer);
      if (!isValidEquation(base, topOp, topRight, topAnswer, stage)) continue;
      if (!isValidEquation(base, leftOp, leftRight, leftAnswer, stage)) continue;
      if (!isValidEquation(topAnswer, rightOp, rightRight, rightAnswer, stage)) continue;
      if (!Number.isInteger(bridgeRight)) continue;
      if (!isValidEquation(leftAnswer, bridgeOp, bridgeRight, rightAnswer, stage)) continue;
      if (bridgeRight < 0 || bridgeRight > Number(stage.maxResult || 99)) continue;
      try {
        const top = addHorizontalEquation(puzzle, startRow, startCol, { left: base, op: topOp, right: topRight, answer: topAnswer }, 'top');
        const left = addVerticalEquation(puzzle, startRow, startCol, { left: base, op: leftOp, right: leftRight, answer: leftAnswer }, 'left');
        const right = addVerticalEquation(puzzle, startRow, startCol + 4, { left: topAnswer, op: rightOp, right: rightRight, answer: rightAnswer }, 'right');
        const bridge = addHorizontalEquation(puzzle, startRow + 4, startCol, { left: leftAnswer, op: bridgeOp, right: bridgeRight, answer: rightAnswer }, 'bridge');
        chooseClearBlankCells(puzzle, clamp(stage.ops.length === 1 ? 4 : 5, 4, 5)).forEach((cell, index) => {
          markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
        });
        if (puzzle.blanks.length >= 4) return puzzle;
      } catch (_error) {
        continue;
      }
    }
    return buildIndependentPuzzle(stage);
  };

  const buildIndependentPuzzle = (stage) => {
    const gridSize = clamp(Number(stage.gridSize || 10), 6, 10);
    const puzzle = createEmptyPuzzle('independent', gridSize);
    const rows = gridSize >= 7 ? [1, 3, 5, 7] : [1, 2, 4, 6];
    rows.forEach((row, index) => {
      const op = pick(stage.ops);
      const equation = makeEquation(stage, op);
      const col = randomInt(1, Math.max(1, gridSize - 4));
      const placed = addHorizontalEquation(puzzle, row, col, equation, `row-${index}`);
    });
    chooseClearBlankCells(puzzle, 4).forEach((cell, index) => {
      markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
    });
    return puzzle;
  };

  const getPuzzleSignature = (puzzle) => puzzle.equations
    .map((equation) => equation.expression)
    .sort()
    .join('|');

  const getStaticStageLevels = (stage) => LEVEL_POOL.filter((level) => Number(level.stage) === Number(stage.order));

  const buildPuzzleFromStaticLevel = (stage, level) => {
    const puzzle = createEmptyPuzzle('static-level-pool', level.gridSize || stage.gridSize);
    puzzle.staticLevelId = level.id;
    level.matrix.forEach((rowItems, rowIndex) => {
      rowItems.forEach((value, colIndex) => {
        if (value === '.') return;
        const row = rowIndex + 1;
        const col = colIndex + 1;
        if (['+', '-', '×', '='].includes(value)) {
          addCell(puzzle, row, col, { type: 'operator', text: value });
          return;
        }
        addCell(puzzle, row, col, { type: 'number', value: Number(value) });
      });
    });
    const registerEquation = (orientation, equation) => {
      const row = Number(equation.start[0]) + 1;
      const col = Number(equation.start[1]) + 1;
      const cells = orientation === 'row'
        ? [
          puzzle.cells.get(cellKey(row, col)),
          puzzle.cells.get(cellKey(row, col + 2)),
          puzzle.cells.get(cellKey(row, col + 4))
        ]
        : [
          puzzle.cells.get(cellKey(row, col)),
          puzzle.cells.get(cellKey(row + 2, col)),
          puzzle.cells.get(cellKey(row + 4, col))
        ];
      if (cells.every(Boolean)) {
        puzzle.equations.push({
          orientation,
          startRow: row,
          startCol: col,
          cells,
          expression: equation.expr
        });
      }
    };
    (level.equations?.horizontal || []).forEach((equation) => registerEquation('row', equation));
    (level.equations?.vertical || []).forEach((equation) => registerEquation('col', equation));
    (level.blanks || []).forEach((blank, index) => {
      const cell = puzzle.cells.get(cellKey(Number(blank.row) + 1, Number(blank.col) + 1));
      if (cell && Number(cell.value) === Number(blank.answer)) {
        markBlank(puzzle, cell.row, cell.col, `${index + 1}번 빈칸`);
      }
    });
    return puzzle;
  };

  const generatePuzzle = (stage) => {
    let puzzle = null;
    let signature = '';
    const staticLevels = getStaticStageLevels(stage);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      puzzle = staticLevels.length
        ? buildPuzzleFromStaticLevel(stage, pick(staticLevels))
        : buildIrregularMazePuzzle(stage);
      if (puzzle.mode === 'independent' && attempt < 11) continue;
      signature = getPuzzleSignature(puzzle);
      if (signature !== lastPuzzleSignatureByStage.get(stage.id)) break;
    }
    lastPuzzleSignatureByStage.set(stage.id, signature);
    puzzle.id = `${stage.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    puzzle.blanks.forEach((blank, index) => {
      blank.label = `${index + 1}번 빈칸`;
    });
    return puzzle;
  };

  const validatePuzzle = (puzzle) => {
    const values = Array.from(puzzle.cells.values()).filter((cell) => cell.type === 'number');
    const validNumbers = values.every((cell) => Number.isInteger(Number(cell.value)) && Number(cell.value) >= 0);
    const validBlanks = puzzle.blanks.length >= 3 && puzzle.blanks.every((blank) => Number.isInteger(Number(blank.value)));
    const validEquations = puzzle.equations.every((equation) => {
      const [left, right, answer] = equation.cells.map((cell) => Number(cell.value));
      const operatorCell = equation.orientation === 'row'
        ? puzzle.cells.get(cellKey(equation.startRow, equation.startCol + 1))
        : puzzle.cells.get(cellKey(equation.startRow + 1, equation.startCol));
      const op = operatorCell?.text || '+';
      return Number.isInteger(left) && Number.isInteger(right) && Number.isInteger(answer) && calc(left, op, right) === answer;
    });
    const blanksByEquation = new Map();
    puzzle.equations.forEach((equation, index) => {
      const count = equation.cells.filter((cell) => cell.blankId).length;
      blanksByEquation.set(index, count);
    });
    const unambiguousBlanks = Array.from(blanksByEquation.values()).every((count) => count <= 1);
    const validGrid = Number.isInteger(puzzle.gridSize) &&
      puzzle.gridSize >= 6 &&
      puzzle.gridSize <= 10 &&
      Array.from(puzzle.cells.values()).every((cell) => cell.row >= 1 && cell.row <= puzzle.gridSize && cell.col >= 1 && cell.col <= puzzle.gridSize);
    return Boolean(validGrid && validNumbers && validBlanks && validEquations && unambiguousBlanks && puzzle.equations.length >= 4);
  };

  const setView = (viewId) => {
    ['stageView', 'gameView', 'resultView'].forEach((id) => {
      els[id].classList.toggle('is-active', id === viewId);
    });
    const inStage = viewId === 'stageView';
    els.stageButton.classList.toggle('shell-hidden', inStage);
    els.stageLabel.classList.toggle('shell-hidden', inStage);
  };

  const playSound = (kind) => {
    const path = kind === 'correct' ? '../sound/correct.mp3' : '../sound/error.mp3';
    try {
      const audio = audioCache[kind] || new Audio(path);
      audioCache[kind] = audio;
      audio.volume = kind === 'correct' ? 0.56 : 0.48;
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_error) {}
  };

  const showFeedback = (kind, message) => {
    playSound(kind);
    if (window.HahaFeedbackOverlay && typeof window.HahaFeedbackOverlay.showQuestionComplete === 'function') {
      window.HahaFeedbackOverlay.showQuestionComplete(kind, { sound: false, durationMs: 820 });
    }
    els.feedbackText.textContent = message;
    els.feedbackText.classList.toggle('is-correct', kind === 'correct');
    els.feedbackText.classList.toggle('is-wrong', kind === 'wrong');
    if (kind === 'wrong' && navigator.vibrate) {
      try { navigator.vibrate(90); } catch (_error) {}
    }
  };

  const renderStages = () => {
    els.stageGrid.innerHTML = STAGES.map((stage, index) => `
      <button type="button" class="crossmath-stage-card" data-stage-id="${stage.id}" style="--stage-color:${COLORS[index % COLORS.length]}">
        <span>${String(index + 1).padStart(2, '0')}단계</span>
        <strong>${stage.title}</strong>
        <p>${stage.desc}</p>
      </button>
    `).join('');
  };

  const renderKeypad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '삭제', '확인'];
    els.keypad.innerHTML = keys.map((key) => {
      const className = key === '삭제' ? 'crossmath-key is-delete' : key === '확인' ? 'crossmath-key is-confirm' : 'crossmath-key';
      return `<button type="button" class="${className}" data-key="${key}">${key}</button>`;
    }).join('');
  };

  const updateEntry = () => {
    els.entryDisplay.textContent = state.entry;
    const active = state.puzzle?.blanks.find((blank) => blank.blankId === state.activeBlankId);
    els.activeSlotLabel.textContent = active ? active.label : '빈칸 선택';
  };

  const selectBlank = (blankId) => {
    if (!state.puzzle) return;
    const blank = state.puzzle.blanks.find((item) => item.blankId === blankId && !item.solved);
    if (!blank) return;
    state.activeBlankId = blank.blankId;
    state.entry = String(blank.userValue || '');
    renderBoard();
    updateEntry();
  };

  const getNextUnsolvedBlank = () => state.puzzle?.blanks.find((blank) => !blank.solved) || null;

  const autoFocusNextBlank = () => {
    const next = getNextUnsolvedBlank();
    if (next) {
      window.setTimeout(() => selectBlank(next.blankId), 180);
      return;
    }
    window.setTimeout(nextPuzzle, 720);
  };

  const renderBoard = () => {
    if (!state.puzzle) return;
    const filledCells = Array.from(state.puzzle.cells.values());
    const minRow = state.puzzle.renderFullGrid ? 1 : Math.min(...filledCells.map((cell) => cell.row));
    const maxRow = state.puzzle.renderFullGrid ? state.puzzle.gridSize : Math.max(...filledCells.map((cell) => cell.row));
    const minCol = state.puzzle.renderFullGrid ? 1 : Math.min(...filledCells.map((cell) => cell.col));
    const maxCol = state.puzzle.renderFullGrid ? state.puzzle.gridSize : Math.max(...filledCells.map((cell) => cell.col));
    const displayRows = maxRow - minRow + 1;
    const displayCols = maxCol - minCol + 1;
    els.puzzleBoard.style.setProperty('--cross-grid-cols', String(displayCols));
    els.puzzleBoard.style.setProperty('--cross-grid-rows', String(displayRows));
    const largestDimension = Math.max(displayRows, displayCols);
    const cellSize = largestDimension <= 7
      ? 'min(8.8vh, 5.8vw, 86px)'
      : largestDimension === 8
        ? 'min(7.4vh, 5vw, 76px)'
        : 'min(6.2vh, 4.2vw, 60px)';
    els.puzzleBoard.style.setProperty('--cross-cell', cellSize);
    const cells = [];
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const cell = state.puzzle.cells.get(cellKey(row, col));
        if (!cell) {
          cells.push('<div class="crossmath-cell crossmath-empty-cell" aria-hidden="true"></div>');
          continue;
        }
        if (cell.type === 'operator') {
          cells.push(`<div class="crossmath-cell is-operator">${cell.text}</div>`);
          continue;
        }
        const isBlank = Boolean(cell.blankId);
        const classes = [
          'crossmath-cell',
          isBlank ? 'is-blank' : '',
          cell.blankId === state.activeBlankId ? 'is-active' : '',
          cell.userValue ? 'is-filled' : '',
          cell.solved ? 'is-correct' : '',
          cell.wrongFlash ? 'is-wrong' : ''
        ].filter(Boolean).join(' ');
        const text = isBlank ? (cell.userValue || '?') : String(cell.value);
        const attrs = isBlank && !cell.solved
          ? ` role="button" tabindex="0" data-blank-id="${cell.blankId}" aria-label="${cell.label} 답 입력"`
          : '';
        cells.push(`<div class="${classes}"${attrs}>${text}</div>`);
      }
    }
    els.puzzleBoard.innerHTML = cells.join('');
    els.blankChip.textContent = `빈칸 ${Math.min(state.puzzle.blanks.filter((blank) => blank.solved).length + 1, state.puzzle.blanks.length)} / ${state.puzzle.blanks.length}`;
  };

  const renderPuzzle = () => {
    state.puzzle = generatePuzzle(state.stage);
    if (!validatePuzzle(state.puzzle)) {
      state.puzzle = generatePuzzle(state.stage);
    }
    state.activeBlankId = '';
    state.entry = '';
    state.puzzleStartedAt = performance.now();
    state.questionHistory.push({
      stageId: state.stage.id,
      puzzleId: state.puzzle.id,
      equations: state.puzzle.equations.map((equation) => equation.expression),
      answers: state.puzzle.blanks.map((blank) => ({ label: blank.label, answer: blank.value }))
    });
    els.roundChip.textContent = `${state.puzzleIndex + 1} / ${state.stage.questionCount}`;
    els.scoreChip.textContent = `정답 ${state.correct}`;
    renderBoard();
    const first = getNextUnsolvedBlank();
    if (first) selectBlank(first.blankId);
  };

  const nextPuzzle = () => {
    if (state.puzzleIndex + 1 >= state.stage.questionCount) {
      finishStage();
      return;
    }
    state.puzzleIndex += 1;
    renderPuzzle();
  };

  const commitAnswer = () => {
    if (!state.puzzle || !state.activeBlankId) return;
    const blank = state.puzzle.blanks.find((item) => item.blankId === state.activeBlankId);
    if (!blank || blank.solved) return;
    const userValue = Number(state.entry);
    if (!state.entry || !Number.isInteger(userValue)) {
      showFeedback('wrong', '숫자를 입력한 뒤 확인을 눌러요.');
      return;
    }
    blank.userValue = state.entry;
    if (userValue === Number(blank.value)) {
      blank.solved = true;
      state.correct += 1;
      state.responseTimes.push(performance.now() - state.puzzleStartedAt);
      state.entry = '';
      showFeedback('correct', '맞았어요. 다음 빈칸으로 이동해요.');
      renderBoard();
      updateEntry();
      autoFocusNextBlank();
    } else {
      state.wrong += 1;
      blank.wrongFlash = true;
      showFeedback('wrong', '틀렸어요. 식을 다시 확인해요.');
      renderBoard();
      window.setTimeout(() => {
        blank.wrongFlash = false;
        blank.userValue = '';
        state.entry = '';
        renderBoard();
        updateEntry();
      }, 420);
    }
    els.scoreChip.textContent = `정답 ${state.correct}`;
  };

  const pressKey = (key) => {
    if (!state.activeBlankId) return;
    if (/^\d$/.test(key)) {
      state.entry = (state.entry + key).slice(0, 3).replace(/^0+(\d)/, '$1');
    } else if (key === '삭제') {
      state.entry = state.entry.slice(0, -1);
    } else if (key === '확인') {
      commitAnswer();
      return;
    }
    const blank = state.puzzle?.blanks.find((item) => item.blankId === state.activeBlankId);
    if (blank && !blank.solved) blank.userValue = state.entry;
    renderBoard();
    updateEntry();
  };

  const startStage = (stageId) => {
    const stage = STAGES.find((item) => item.id === stageId) || STAGES[0];
    state.stage = stage;
    state.puzzleIndex = 0;
    state.correct = 0;
    state.wrong = 0;
    state.responseTimes = [];
    state.questionHistory = [];
    state.startedAt = performance.now();
    state.saved = false;
    els.taskTitle.textContent = stage.title;
    els.taskSubtitle.textContent = stage.desc;
    els.stageLabel.textContent = `${STAGES.indexOf(stage) + 1}단계`;
    setView('gameView');
    renderPuzzle();
  };

  const buildGuardianSummary = (accuracy) => {
    return `이번 숫자 활동에서는 ${state.stage.title} 단계의 연산 퍼즐 수행 흐름이 기록되었습니다. 보호자 공유 화면에서는 정답률과 참여 흐름을 중심으로 간단히 확인합니다.`;
  };

  const buildTeacherReviewNote = (accuracy, avgSeconds) => {
    return `가로세로 연산 퍼즐은 산술 사실 인출, 시공간 위치 추적, 작업기억, 오류 점검 전략을 함께 관찰하는 참고 기록입니다. 정확도 ${accuracy}%와 평균 반응 ${avgSeconds.toFixed(1)}초를 내담자의 컨디션, 읽기 부담, 연산 범위와 함께 해석합니다.`;
  };

  const recordResult = (result) => {
    if (state.saved) return;
    state.saved = true;
    if (!window.HahaLabLearningHarness || typeof window.HahaLabLearningHarness.recordSession !== 'function') return;
    const guardianSummary = buildGuardianSummary(result.accuracy);
    const teacherReviewNote = buildTeacherReviewNote(result.accuracy, result.avgSeconds);
    const actionPlanSummary = '다음 숫자 활동은 자동 확정하지 않고 선생님 검토 후 조정합니다.';
    const reportDisplayModes = {
      guardian: { label: '보호자 공유', summary: guardianSummary },
      teacher: { label: '전문가 분석', summary: teacherReviewNote }
    };
    window.HahaLabLearningHarness.recordSession({
      labKind: 'numberlab',
      reportScope: 'numberlab',
      saveToClientReport: true,
      curriculumKey: LAB_ID,
      stageKey: state.stage.id,
      stageTitle: state.stage.title,
      labTitle: `NumberLab ${LAB_TITLE}`,
      totalQuestions: result.total,
      correctCount: result.correct,
      wrongCount: result.wrong,
      score: result.accuracy,
      accuracyScore: result.accuracy,
      durationSeconds: result.durationSeconds,
      startedAtMs: Date.now() - Math.round(result.durationSeconds * 1000),
      reportType: 'number',
      summary: `${LAB_TITLE} ${state.stage.title} 단계에서 빈칸 연산 퍼즐을 수행했습니다.`,
      overview: `${LAB_TITLE}은 가로와 세로 연산식을 번갈아 확인하며 산술 사실 유창성, 작업기억, 선택적 주의, 시공간 위치 추적을 함께 보는 숫자랩 과제입니다.`,
      guardianSummary,
      teacherReviewNote,
      actionPlanSummary,
      actionPlanPolicy: 'teacher-review-required',
      reportDisplayModes,
      recommendations: [
        result.accuracy >= 80 ? '현재 단계의 연산 범위는 비교적 안정적으로 수행되어 다음 난이도를 검토할 수 있습니다.' : '같은 범위의 퍼즐을 반복하며 식의 방향과 빈칸 위치를 천천히 확인하세요.',
        '오답 문항은 답만 알려주기보다 어떤 가로식 또는 세로식에서 확인했는지 말로 설명하게 해주세요.',
        '두자리 단계에서는 받아올림과 받아내림 여부보다 식 구조를 정확히 추적하는지 함께 관찰하세요.'
      ],
      focusKey: LAB_ID,
      focusLabel: '산술 사실 유창성, 작업기억, 시공간 위치 추적, 문제해결',
      metadata: {
        stage_id: state.stage.id,
        operation_set: state.stage.ops.join(','),
        puzzle_history: state.questionHistory
      },
      details: {
        category_id: LAB_ID,
        category_title: '가로세로 연산',
        stage_order: STAGES.indexOf(state.stage) + 1,
        average_response_seconds: Number(result.avgSeconds.toFixed(2)),
        passed: result.accuracy >= 75,
        report_domain: '산술 사실 유창성, 작업기억, 시공간 위치 추적, 문제해결',
        report_guardian_summary: guardianSummary,
        report_teacher_review_note: teacherReviewNote,
        report_action_plan_summary: actionPlanSummary,
        report_action_plan_policy: 'teacher-review-required',
        report_display_modes: reportDisplayModes,
        operation_set: state.stage.ops,
        puzzle_history: state.questionHistory
      }
    });
  };

  const finishStage = () => {
    const total = state.correct + state.wrong;
    const accuracy = total ? Math.round((state.correct / total) * 100) : 0;
    const avgSeconds = state.responseTimes.length
      ? state.responseTimes.reduce((sum, value) => sum + value, 0) / state.responseTimes.length / 1000
      : 0;
    const durationSeconds = Math.max(1, (performance.now() - state.startedAt) / 1000);
    els.resultTitle.textContent = `${state.stage.title} 완료`;
    els.resultSummary.textContent = `${total}개 빈칸 중 ${state.correct}개를 정확하게 입력했어요.`;
    els.resultStats.innerHTML = [
      ['정확도', `${accuracy}%`],
      ['정답', state.correct],
      ['오답', state.wrong],
      ['평균 반응', `${avgSeconds.toFixed(1)}초`]
    ].map(([label, value]) => `<div class="crossmath-result-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
    els.reportOpinion.textContent = accuracy >= 80
      ? '식의 방향과 빈칸 위치를 비교적 안정적으로 추적했습니다. 다음 단계에서는 연산 범위나 혼합 연산을 확장해 볼 수 있습니다.'
      : '빈칸 위치와 연산 기호를 동시에 확인하는 부담이 보입니다. 같은 단계에서 식을 손으로 짚어가며 다시 풀어보는 방식이 좋습니다.';
    recordResult({ total, correct: state.correct, wrong: state.wrong, accuracy, avgSeconds, durationSeconds });
    setView('resultView');
  };

  const bindEvents = () => {
    els.stageGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-id]');
      if (!button) return;
      startStage(button.dataset.stageId);
    });
    els.stageButton.addEventListener('click', () => setView('stageView'));
    els.retryButton.addEventListener('click', () => startStage(state.stage?.id || STAGES[0].id));
    els.otherStageButton.addEventListener('click', () => setView('stageView'));
    els.keypad.addEventListener('click', (event) => {
      const button = event.target.closest('[data-key]');
      if (!button) return;
      pressKey(button.dataset.key);
    });
    els.puzzleBoard.addEventListener('click', (event) => {
      const node = event.target.closest('[data-blank-id]');
      if (node) selectBlank(node.dataset.blankId);
    });
    els.puzzleBoard.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const node = event.target.closest('[data-blank-id]');
      if (node) {
        event.preventDefault();
        selectBlank(node.dataset.blankId);
      }
    });
    window.addEventListener('keydown', (event) => {
      if (!els.gameView.classList.contains('is-active')) return;
      if (/^\d$/.test(event.key)) pressKey(event.key);
      if (event.key === 'Backspace') pressKey('삭제');
      if (event.key === 'Enter') pressKey('확인');
    });
  };

  const init = () => {
    ['stageView', 'gameView', 'resultView', 'stageGrid', 'stageButton', 'stageLabel', 'taskTitle', 'taskSubtitle', 'roundChip', 'blankChip', 'scoreChip', 'puzzleBoard', 'keypad', 'activeSlotLabel', 'entryDisplay', 'feedbackText', 'resultTitle', 'resultSummary', 'resultStats', 'reportOpinion', 'retryButton', 'otherStageButton'].forEach((id) => {
      els[id] = $(id);
    });
    renderStages();
    renderKeypad();
    bindEvents();
  };

  window.NumberCrossMathPuzzle = {
    stages: STAGES,
    generatePuzzle,
    validatePuzzle,
    debugSnapshot() {
      return {
        stageId: state.stage?.id || '',
        puzzleIndex: state.puzzleIndex,
        activeBlankId: state.activeBlankId,
        activeAnswer: state.puzzle?.blanks.find((blank) => blank.blankId === state.activeBlankId)?.value ?? null,
        unsolvedCount: state.puzzle?.blanks.filter((blank) => !blank.solved).length || 0,
        correct: state.correct,
        wrong: state.wrong
      };
    },
    validateMany(iterations) {
      const count = Number(iterations || 100);
      const failures = [];
      STAGES.forEach((stage) => {
        for (let index = 0; index < count; index += 1) {
          const puzzle = generatePuzzle(stage);
          if (!validatePuzzle(puzzle)) failures.push({ stage: stage.id, index });
        }
      });
      return { ok: failures.length === 0, checked: STAGES.length * count, failures };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
