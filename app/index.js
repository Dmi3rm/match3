import * as PIXI from 'pixi.js';
import Field from './field';
import ShapeTypeEnum from './shapeTypes';

const cellSizePx = 50;
const borderPx = 2;
const ROW_COUNT_MIN = 5;
const ROW_COUNT_MAX = 30;
const COLUMN_COUNT_MIN = 5;
const COLUMN_COUNT_MAX = 30;

let app = null;
let field = null;

function setup(rowCount, columnCount) {
  if (app != null) {
    appDiv.removeChild(app.view);
  }
  const scoreSpan = document.getElementById('scoreSpan');
  scoreSpan.textContent = 0;
  const canvasHeightPx = rowCount*(cellSizePx+borderPx) + borderPx;
  const canvasWidthPx = columnCount*(cellSizePx+borderPx) + borderPx;
  app = new PIXI.Application(canvasWidthPx, canvasHeightPx, { backgroundColor: 0x222222 });
  appDiv.appendChild(app.view);
  let scoreTotal = 0;
  field = new Field(cellSizePx, rowCount, columnCount, borderPx, (score) => {
    scoreTotal += score;
    scoreSpan.textContent = scoreTotal;
  });
  app.stage.addChild(field);
}

PIXI.loader
  .add(ShapeTypeEnum.properties[ShapeTypeEnum.CIRCLE].image)
  .add(ShapeTypeEnum.properties[ShapeTypeEnum.TRIANGLE].image)
  .add(ShapeTypeEnum.properties[ShapeTypeEnum.SQUARE].image)
  .add(ShapeTypeEnum.properties[ShapeTypeEnum.PENTAGON].image)
  .add(ShapeTypeEnum.properties[ShapeTypeEnum.HEXAGON].image)
  .load(() => {
    const setupBtn = document.getElementById('setupBtn');
    const rowCountInput = document.getElementById('rowCountInput');
    const columnCountInput = document.getElementById('columnCountInput');
    setupBtn.addEventListener('click', () => {
      let rowCount = parseInt(rowCountInput.value);
      let columnCount = parseInt(columnCountInput.value);
      if (rowCount < ROW_COUNT_MIN) {
        rowCount = ROW_COUNT_MIN;
        rowCountInput.value = ROW_COUNT_MIN;
      }
      if (rowCount > ROW_COUNT_MAX) {
        rowCount = ROW_COUNT_MAX;
        rowCountInput.value = ROW_COUNT_MAX;
      }
      if (columnCount < COLUMN_COUNT_MIN) {
        columnCount = COLUMN_COUNT_MIN;
        columnCountInput.value = COLUMN_COUNT_MIN;
      }
      if (columnCount > COLUMN_COUNT_MAX) {
        columnCount = COLUMN_COUNT_MAX;
        columnCountInput.value = COLUMN_COUNT_MAX;
      }
      setup(rowCount, columnCount);
    });
  });
