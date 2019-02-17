import * as PIXI from 'pixi.js'
import Field from './field.js'
import ShapeTypeEnum from './shapeTypes.js'

const cellSizePx = 50;
const borderPx = 2;
const ROW_COUNT_MIN = 5;
const ROW_COUNT_MAX = 15;
const COLUMN_COUNT_MIN = 5;
const COLUMN_COUNT_MAX = 15;

PIXI.loader
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.CIRCLE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.TRIANGLE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.SQUARE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.PENTAGON].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.HEXAGON].image)
    .load(() => {
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

let app = null;
let field = null;

function setup(rowCount, columnCount) {
    if (app != null) {
        document.body.removeChild(app.view);
    }
    scoreSpan.textContent = 0;
    let canvasHeightPx = rowCount*(cellSizePx+borderPx)+borderPx;
    let canvasWidthPx = columnCount*(cellSizePx+borderPx)+borderPx;
    app = new PIXI.Application(canvasWidthPx, canvasHeightPx, {backgroundColor: 0x222222});
    document.body.appendChild(app.view);
    let scoreTotal = 0;
    field = new Field(cellSizePx, rowCount, columnCount, borderPx, (score) => {
        scoreTotal += score;
        scoreSpan.textContent = scoreTotal;
    });
    app.stage.addChild(field);
}



