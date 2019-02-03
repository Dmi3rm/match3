import * as PIXI from 'pixi.js'
import ShapeTypeEnum from './shapeTypes.js'

class Shape extends PIXI.Sprite {
    constructor(shapeType, sidePx, borderPx) {
        let shapeTypeProps = ShapeTypeEnum.properties[shapeType];
        super(PIXI.loader.resources[shapeTypeProps.image].texture);
        this.shapeType = shapeType;
        this.width = sidePx;
        this.height = sidePx;
        this._borderPx = borderPx;
        this.interactive = true;
    }

    setY(row) {
        this.row = row;
        this.y = row*(this.height+this._borderPx)+this._borderPx;
    }

    setX(column) {
        this.column = column;
        this.x = column*(this.width+this._borderPx)+this._borderPx;
    }

    isNeighbourTo(shape) {
        let diff = Math.abs(this.row-shape.row)+Math.abs(this.column-shape.column);
        if (diff === 1) 
            return true;
        else
            return false;
    }
}

export default Shape;