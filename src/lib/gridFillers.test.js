import { describe, it, expect } from 'vitest';
import { buildOccupancy, findEmptyRects, rectToCell } from './gridFillers.js';

// Helper: pretty-print a grid row by row for debug output when an expectation
// fails. Not asserted on — just makes it easier to read failures.
const asString = (occ) => occ.map(row => row.map(c => c ? '#' : '.').join('')).join('\n');

describe('buildOccupancy', () => {
  it('returns an empty grid when no tiles placed and rows=0', () => {
    expect(buildOccupancy([], 6)).toEqual([]);
  });

  it('respects explicit rows argument when placed is empty', () => {
    const occ = buildOccupancy([], 4, 2);
    expect(occ.length).toBe(2);
    expect(occ[0]).toEqual([false, false, false, false]);
  });

  it('marks the cells a single tile occupies', () => {
    const occ = buildOccupancy([{ col: 0, row: 0, colSpan: 2, rowSpan: 3 }], 4);
    // 3 rows tall, 4 cols wide; left 2 cols filled.
    expect(occ).toEqual([
      [true, true, false, false],
      [true, true, false, false],
      [true, true, false, false],
    ]);
  });

  it('combines multiple non-overlapping tiles', () => {
    const occ = buildOccupancy([
      { col: 0, row: 0, colSpan: 3, rowSpan: 3 },
      { col: 3, row: 0, colSpan: 2, rowSpan: 3 },
    ], 6);
    // cols 0-4 full across 3 rows; col 5 empty.
    expect(occ.length).toBe(3);
    occ.forEach(row => {
      expect(row.slice(0, 5).every(Boolean)).toBe(true);
      expect(row[5]).toBe(false);
    });
  });

  it('clips tiles that extend past the column count', () => {
    const occ = buildOccupancy([{ col: 4, row: 0, colSpan: 5, rowSpan: 1 }], 6);
    expect(occ[0]).toEqual([false, false, false, false, true, true]);
  });

  it('derives maxRow from the tallest tile when rows omitted', () => {
    const occ = buildOccupancy([
      { col: 0, row: 0, colSpan: 2, rowSpan: 2 },
      { col: 2, row: 0, colSpan: 2, rowSpan: 5 },
    ], 4);
    expect(occ.length).toBe(5); // row 0 + rowSpan 5
  });

  it('does not mutate its input array', () => {
    const placed = [{ col: 0, row: 0, colSpan: 2, rowSpan: 2 }];
    const snapshot = JSON.parse(JSON.stringify(placed));
    buildOccupancy(placed, 4);
    expect(placed).toEqual(snapshot);
  });
});

describe('findEmptyRects', () => {
  it('returns no rectangles for a fully occupied grid', () => {
    const occ = [
      [true, true],
      [true, true],
    ];
    expect(findEmptyRects(occ)).toEqual([]);
  });

  it('returns a single rectangle covering a fully empty grid', () => {
    const occ = [
      [false, false, false],
      [false, false, false],
    ];
    const rects = findEmptyRects(occ);
    expect(rects).toHaveLength(1);
    expect(rects[0]).toEqual({ col: 0, row: 0, colSpan: 3, rowSpan: 2 });
  });

  it('returns [] for an empty input (no rows)', () => {
    expect(findEmptyRects([])).toEqual([]);
  });

  it('covers a 1-col right-edge gap as a single tall rectangle', () => {
    // 6-col grid, 3 rows. Left 5 cols occupied, col 5 empty.
    const occ = Array.from({ length: 3 }, () =>
      [true, true, true, true, true, false]
    );
    const rects = findEmptyRects(occ);
    expect(rects).toEqual([{ col: 5, row: 0, colSpan: 1, rowSpan: 3 }]);
  });

  it('covers a partial bottom row as a single wide rectangle', () => {
    // 4-col grid, top row full, bottom row: cols 0-1 full, cols 2-3 empty.
    const occ = [
      [true, true, true, true],
      [true, true, false, false],
    ];
    expect(findEmptyRects(occ)).toEqual([
      { col: 2, row: 1, colSpan: 2, rowSpan: 1 },
    ]);
  });

  it('finds multiple rectangles when gaps are disjoint', () => {
    // Two holes: top-right 1×2 and bottom-left 2×1.
    const occ = [
      [true, true, false],
      [true, true, false],
      [false, false, true],
    ];
    const rects = findEmptyRects(occ);
    // Order is top-down / left-right because of the scanning order.
    expect(rects).toEqual([
      { col: 2, row: 0, colSpan: 1, rowSpan: 2 },
      { col: 0, row: 2, colSpan: 2, rowSpan: 1 },
    ]);
  });

  it('prefers wider-first growth: a row-shaped gap becomes one rectangle', () => {
    // Single row of 4 empty cells above a full row.
    const occ = [
      [false, false, false, false],
      [true,  true,  true,  true ],
    ];
    expect(findEmptyRects(occ)).toEqual([
      { col: 0, row: 0, colSpan: 4, rowSpan: 1 },
    ]);
  });

  it('stops vertical growth when any column in the stripe is blocked', () => {
    // cols 0-1 empty rows 0-1, but col 1 row 2 is blocked — the merged
    // rectangle should stop at row 2 (height 2).
    const occ = [
      [false, false, true],
      [false, false, true],
      [false, true,  true],
    ];
    const rects = findEmptyRects(occ);
    // Greedy: first finds (0,0) empty, grows right to cols 0-1 (col 2 blocked).
    // Grows down — row 2 col 1 is blocked → stops at rowSpan=2.
    // Then the leftover (0,2) opens a new 1x1 rect.
    expect(rects).toEqual([
      { col: 0, row: 0, colSpan: 2, rowSpan: 2 },
      { col: 0, row: 2, colSpan: 1, rowSpan: 1 },
    ]);
  });

  it('does not mutate its input grid', () => {
    const occ = [
      [false, true],
      [true, false],
    ];
    const snapshot = JSON.parse(JSON.stringify(occ));
    findEmptyRects(occ);
    expect(occ).toEqual(snapshot);
  });

  it('produced rectangles are non-overlapping and cover every empty cell', () => {
    // Arbitrary irregular grid — use invariant check rather than exact shape.
    const occ = [
      [true,  false, false, true,  false],
      [true,  false, false, true,  false],
      [false, false, false, false, false],
      [true,  true,  false, true,  true ],
    ];
    const rects = findEmptyRects(occ);
    // Re-mark from rectangles into a fresh grid; it must match `!occ`.
    const rebuilt = Array.from({ length: 4 }, () => new Array(5).fill(false));
    for (const r of rects) {
      for (let rr = r.row; rr < r.row + r.rowSpan; rr++) {
        for (let cc = r.col; cc < r.col + r.colSpan; cc++) {
          // Overlap check: should still be false before we write.
          expect(rebuilt[rr][cc]).toBe(false);
          rebuilt[rr][cc] = true;
        }
      }
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        expect(rebuilt[r][c]).toBe(!occ[r][c]);
      }
    }
    // And `asString` is only used if the test fails — hint for the debugger.
    if (process.env.DEBUG_GRID) console.log(asString(occ));
  });
});

describe('rectToCell', () => {
  const grid = { colStride: 100, rowStride: 120, gapX: 10, gapY: 10 };
  // colStride + gapX = 110, rowStride includes its own gap at 120 (the row
  // height is therefore 110). Matches how the React hook reads the grid.

  it('maps a 1×1 tile at the origin', () => {
    const r = rectToCell({ x: 0, y: 0, width: 100, height: 110 }, grid);
    expect(r).toEqual({ col: 0, row: 0, colSpan: 1, rowSpan: 1 });
  });

  it('maps a tile in the second column, second row', () => {
    // col 1 starts at x = 110; row 1 starts at y = 120.
    const r = rectToCell({ x: 110, y: 120, width: 100, height: 110 }, grid);
    expect(r).toEqual({ col: 1, row: 1, colSpan: 1, rowSpan: 1 });
  });

  it('computes multi-cell spans', () => {
    // 3 cols wide: width = 3*100 + 2*10 = 320. 2 rows tall: height = 2*110 + 1*10 = 230.
    const r = rectToCell({ x: 0, y: 0, width: 320, height: 230 }, grid);
    expect(r).toEqual({ col: 0, row: 0, colSpan: 3, rowSpan: 2 });
  });

  it('rounds fractional pixel positions sensibly (sub-pixel layout)', () => {
    const r = rectToCell({ x: 109.6, y: 120.3, width: 100.2, height: 109.8 }, grid);
    expect(r).toEqual({ col: 1, row: 1, colSpan: 1, rowSpan: 1 });
  });

  it('clamps colSpan and rowSpan to at least 1', () => {
    const r = rectToCell({ x: 0, y: 0, width: 0, height: 0 }, grid);
    expect(r.colSpan).toBeGreaterThanOrEqual(1);
    expect(r.rowSpan).toBeGreaterThanOrEqual(1);
  });
});

describe('buildOccupancy + findEmptyRects — integration', () => {
  it('locates the known right-edge gap for the production gallery layout', () => {
    // 6-col desktop grid, photo spans as shipped:
    //   08 hero  3×3 at col 0, row 0
    //   02 tall  2×3 at col 3, row 0
    //   (gap expected at col 5, rows 0-2 — 1×3)
    //   03 tall  2×3 at col 0, row 3
    //   04 sq    2×2 at col 2, row 3
    //   05 wide  4×2 at col 2, row 5  (approx — dense packing)
    //   ...
    // This test uses a simplified placement just to exercise the join:
    const placed = [
      { col: 0, row: 0, colSpan: 3, rowSpan: 3 },
      { col: 3, row: 0, colSpan: 2, rowSpan: 3 },
    ];
    const occ = buildOccupancy(placed, 6);
    const rects = findEmptyRects(occ);
    expect(rects).toEqual([
      { col: 5, row: 0, colSpan: 1, rowSpan: 3 },
    ]);
  });
});
