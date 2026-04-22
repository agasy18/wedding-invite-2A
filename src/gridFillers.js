// Pure helpers for the gallery mosaic filler system.
//
// The gallery uses a CSS grid with mixed-sized photo tiles. Depending on the
// viewport (column count) and the specific spans in use, the grid can leave
// empty rectangles — typically on the right edge or bottom row. These helpers
// compute where those empty rectangles are, so the React component can render
// floral filler tiles that exactly cover them.
//
// The pure-logic split: DOM measurement lives in the React component; cell
// math lives here and is unit-tested. Everything here works in cell
// coordinates — no pixels, no DOM.

/**
 * Builds a 2D boolean occupancy grid.
 *
 * @param {Array<{col:number,row:number,colSpan:number,rowSpan:number}>} placed
 *   Cell-coordinate rectangles already taken by photos.
 * @param {number} cols  Total column count.
 * @param {number} [rows] Optional explicit row count; if omitted, derived
 *   from the maximum bottom edge of `placed`.
 * @returns {boolean[][]}  `rows × cols` grid; `true` = occupied.
 */
export function buildOccupancy(placed, cols, rows) {
  const maxRow = rows ?? Math.max(0, ...placed.map(p => p.row + p.rowSpan));
  const occ = Array.from({ length: maxRow }, () => new Array(cols).fill(false));
  for (const p of placed) {
    for (let r = p.row; r < p.row + p.rowSpan && r < maxRow; r++) {
      for (let c = p.col; c < p.col + p.colSpan && c < cols; c++) {
        if (r >= 0 && c >= 0) occ[r][c] = true;
      }
    }
  }
  return occ;
}

/**
 * Finds a set of maximal empty rectangles that together cover every empty
 * cell. Greedy algorithm: scan row-by-row, column-by-column; when an empty
 * cell is encountered, grow rightwards along that row while cells stay
 * empty, then grow downwards while the full column range stays empty.
 * Records that rectangle and marks its cells as used before continuing.
 *
 * The rectangles are non-overlapping and their union is exactly the empty
 * area. They are not guaranteed to be the *fewest* possible rectangles
 * (that's a harder exact-cover problem), but they are large and visually
 * coherent, which is what the decorative fillers need.
 *
 * Operates on a copy of `occupancy` so the input is not mutated.
 *
 * @param {boolean[][]} occupancy  Row-major grid as returned by buildOccupancy.
 * @returns {Array<{col:number,row:number,colSpan:number,rowSpan:number}>}
 */
export function findEmptyRects(occupancy) {
  if (!occupancy.length) return [];
  const rows = occupancy.length;
  const cols = occupancy[0].length;
  // Copy so we don't mutate the caller's grid.
  const occ = occupancy.map(row => row.slice());
  const found = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (occ[r][c]) continue;
      // Grow rightward while cells stay empty.
      let cEnd = c;
      while (cEnd < cols && !occ[r][cEnd]) cEnd++;
      // Grow downward: every column from c..cEnd-1 must stay empty.
      let rEnd = r + 1;
      outer: while (rEnd < rows) {
        for (let cc = c; cc < cEnd; cc++) {
          if (occ[rEnd][cc]) break outer;
        }
        rEnd++;
      }
      // Mark + record.
      for (let rr = r; rr < rEnd; rr++) {
        for (let cc = c; cc < cEnd; cc++) {
          occ[rr][cc] = true;
        }
      }
      found.push({ col: c, row: r, colSpan: cEnd - c, rowSpan: rEnd - r });
    }
  }
  return found;
}

/**
 * Converts a pixel-positioned tile into cell coordinates, given the grid's
 * column stride, row stride, and gaps. Extracted so the rounding rules live
 * with the tests that cover them — sub-pixel measurements need to snap
 * sensibly even when the browser rounds fractional track widths.
 *
 * @param {{x:number,y:number,width:number,height:number}} rect  Tile
 *   rectangle relative to the grid's top-left (px).
 * @param {{colStride:number,rowStride:number,gapX:number,gapY:number}} grid
 *   Column + row strides (track + one gap) and gap sizes in px.
 * @returns {{col:number,row:number,colSpan:number,rowSpan:number}}
 */
export function rectToCell(rect, grid) {
  const { colStride, rowStride, gapX, gapY } = grid;
  const col = Math.round(rect.x / (colStride + gapX));
  const row = Math.round(rect.y / rowStride);
  const colSpan = Math.max(1, Math.round((rect.width + gapX) / (colStride + gapX)));
  const rowSpan = Math.max(1, Math.round((rect.height + gapY) / rowStride));
  return { col, row, colSpan, rowSpan };
}
