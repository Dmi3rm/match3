import * as PIXI from 'pixi.js';
import ShapeTypeEnum from './shapeTypes';

class Shape extends PIXI.Sprite {
  constructor(shapeType, sidePx, borderPx, checkMatch) {
    const shapeTypeProps = ShapeTypeEnum.properties[shapeType];
    const texture = PIXI.Texture.from(shapeTypeProps.image);
    // super(PIXI.loader.resources[shapeTypeProps.image].texture);
    super(texture);
    this.interactive = true;
    this.shapeType = shapeType;
    this.width = sidePx;
    this.height = sidePx;
    this._borderPx = borderPx;
    this._fallSpeed = 0;
    this._acceleration = 0.15;
    this.row = 0;
    this.column = 0;
    this.yto = 0;
    this.data = null;
    this.currX = 0;
    this.currY = 0;
    this.checkMatch = checkMatch;
    this
      .on('mousedown', this.onDragStart)
      .on('touchstart', this.onDragStart)
      .on('mouseup', this.onDragEnd)
      .on('mouseupoutside', this.onDragEnd)
      .on('touchend', this.onDragEnd)
      .on('touchendoutside', this.onDragEnd)
      .on('mousemove', this.onDragMove)
      .on('touchmove', this.onDragMove);
  }

  onDragStart(event) {
    this.zIndex = 1;
    this.data = event.data;
    this.dragging = true;
    this.currX = this.x;
    this.currY = this.y;
  }

  onDragEnd() {
    if (this.dragging) {
      this.zIndex = 0;
      this.dragging = false;
      this.data = null;
      const diffX = this.x - this.currX;
      const diffY = this.y - this.currY;
      if (!this.checkMatch(this, diffX, diffY)) {
        this.x = this.currX;
        this.y = this.currY;
      }
    }
  }

  onDragMove() {
    if (this.dragging) {
      const newPosition = this.data.getLocalPosition(this.parent);
      let newx = newPosition.x - this.width / 2;
      let newy = newPosition.y - this.height / 2;
      const offsetX = Math.abs(newx - this.currX);
      const offsetY = Math.abs(newy - this.currY);
      if (offsetX > offsetY) {
        this.y = this.currY;
        if (offsetX > this.width+this._borderPx) {
          newx = this.currX + Math.sign(newx - this.currX)*(this.width+this._borderPx);
        }
        this.x = newx;
      } else {
        this.x = this.currX;
        if (offsetY > this.height+this._borderPx) {
          newy = this.currY + Math.sign(newy - this.currY)*(this.height+this._borderPx);
        }
        this.y = newy;
      }
    }
  }

  setY(row) {
    this.row = row;
    this.y = row * (this.height + this._borderPx) + this._borderPx;
  }

  setX(column) {
    this.column = column;
    this.x = column * (this.width + this._borderPx) + this._borderPx;
  }

  setYTo(row) {
    this.row = row;
    this.yto = row * (this.height + this._borderPx) + this._borderPx;
  }

  tick() {
    if (this.y < this.yto) {
      this._fallSpeed += this._acceleration;
      this.y = (this.y + this._fallSpeed) > this.yto ? this.yto : this.y + this._fallSpeed;
      return true;
    }
    this._fallSpeed = 0;
    return false;
  }

  isNeighbourTo(shape) {
    const diff = Math.abs(this.row - shape.row) + Math.abs(this.column - shape.column);
    return (diff === 1);
  }
}

export default Shape;
