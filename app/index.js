import * as PIXI from 'pixi.js'
import Field from './field.js'
import ShapeTypeEnum from './shapeTypes.js'

const cellSizePx = 50;
const borderPx = 2;

PIXI.loader
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.CIRCLE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.TRIANGLE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.SQUARE].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.PENTAGON].image)
    .add(ShapeTypeEnum.properties[ShapeTypeEnum.HEXAGON].image)
    .load(() => {
        setupBtn.addEventListener('click', () => {
            let rowCount = parseInt(document.getElementsByName("rowCount")[0].value);
            let columnCount = parseInt(document.getElementsByName("columnCount")[0].value);
            setup(rowCount, columnCount);
        });
    });

let app = null;
let field = null;

function setup(rowCount, columnCount) {
    if (app != null) {
        document.body.removeChild(app.view);
    }
    let canvasHeightPx = rowCount*(cellSizePx+borderPx)+borderPx;
    let canvasWidthPx = columnCount*(cellSizePx+borderPx)+borderPx;
    app = new PIXI.Application(canvasWidthPx, canvasHeightPx, {backgroundColor: 0x222222});
    document.body.appendChild(app.view);
    field = new Field(cellSizePx, rowCount, columnCount, borderPx);
    app.stage.addChild(field);
}



