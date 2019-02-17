import * as PIXI from 'pixi.js'
import ShapeTypeEnum from './shapeTypes.js'

class Shape extends PIXI.Sprite {
    constructor(shapeType, sidePx, borderPx) {
        let shapeTypeProps = ShapeTypeEnum.properties[shapeType];
        super(PIXI.loader.resources[shapeTypeProps.image].texture);
        this.interactive = true;
        this.shapeType = shapeType;
        this.width = sidePx;
        this.height = sidePx;
        this._borderPx = borderPx;
        this.fallSpeed = 3;
        this.row = 0;
        this.column = 0;
        this.yto = 0;
    }

    setY(row) {
        this.row = row;
        this.y = row*(this.height+this._borderPx)+this._borderPx;
    }

    setX(column) {
        this.column = column;
        this.x = column*(this.width+this._borderPx)+this._borderPx;
    }

    setYTo(row) {
        this.row = row;
        this.yto = row*(this.height+this._borderPx)+this._borderPx;
    }


    tick() {
        if (this.y < this.yto) {
            this.y = (this.y + this.fallSpeed) > this.yto ? this.yto : this.y+this.fallSpeed;
            return true;
        }
        return false;
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