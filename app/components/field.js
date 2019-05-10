import * as PIXI from 'pixi.js';
import Shape from './shape';
import ShapeTypeEnum from './shapeTypes';


export default class Field extends PIXI.Container {
  constructor(cellSizePx, rowCount, columnCount, borderPx, scoreCallback) {
    super();
    this._cellSizePx = cellSizePx;
    this._rowCount = rowCount;
    this._columnCount = columnCount;
    this._borderPx = borderPx;
    this._scoreCallback = scoreCallback;
    this.selected = null;
    this.cells = Array.from(Array(rowCount), () => new Array(columnCount));
    this.interactive = true;
    this.isAnimating = false;
    this.shapesToFall = null;
    this.sortableChildren = true;
    // this.on('pointerdown', this.onShapeClicked);
    this.setup();
  }

  getShape(row, column) {
    if (row > -1 && column > -1 && row < this._rowCount && column < this._columnCount) {
      if (this.cells[row][column]) {
        return this.cells[row][column];
      }
      return null;
    }
    return null;
  }

  getCellType(row, column) {
    const shape = this.getShape(row, column);
    if (!shape) {
      return null;
    }
    return shape.shapeType;
  }

  getAllowedShapeTypes(row, column) {
    const disabled = [];
    const top2 = this.getCellType(row - 2, column);
    const top1 = this.getCellType(row - 1, column);
    const bottom1 = this.getCellType(row + 1, column);
    const bottom2 = this.getCellType(row + 2, column);
    const left2 = this.getCellType(row, column - 2);
    const left1 = this.getCellType(row, column - 1);
    const right1 = this.getCellType(row, column + 1);
    const right2 = this.getCellType(row, column + 2);
    if (left1 && left2 && left1 === left2) disabled.push(left1);
    if (left1 && right1 && left1 === right1) disabled.push(left1);
    if (right1 && right2 && right1 === right2) disabled.push(right1);
    if (top2 && top1 && top2 === top1) disabled.push(top2);
    if (top1 && bottom1 && top1 === bottom1) disabled.push(top1);
    if (bottom1 && bottom2 && bottom1 === bottom2) disabled.push(bottom1);
    const allowed = ShapeTypeEnum.ToArray().filter(shapeType =>
      !disabled.some(dis => dis === shapeType));
    return allowed;
  }

  getRandomAllowedShapeType(row, column) {
    const allowedShapeTypes = this.getAllowedShapeTypes(row, column);
    const shapeTypeIndex = Math.floor(Math.random() * allowedShapeTypes.length);
    return allowedShapeTypes[shapeTypeIndex];
  }

  setup() {
    const checkMatchBind = this.checkMatch.bind(this);
    for (let row = 0; row < this._rowCount; row++) {
      for (let column = 0; column < this._columnCount; column++) {
        const shapeType = this.getRandomAllowedShapeType(row, column);
        const shape = new Shape(shapeType, this._cellSizePx, this._borderPx, checkMatchBind);
        shape.setY(row);
        shape.setX(column);
        this.cells[row][column] = shape;
        this.addChild(shape);
      }
    }
    requestAnimationFrame(this.tick.bind(this));
  }


  tick() {
    let isFalling = false;
    if (this.shapesToFall) {
      // fall down shapes in this.shapesToFall
      for (const shape of this.shapesToFall) {
        const changed = shape.tick();
        if (changed) {
          isFalling = true;
        }
      }
      if (!isFalling) {
        // all shapes just fallen down, check for matches
        let fallenByRow = this.shapesToFall.reduce((fallenMap, e) =>
          fallenMap.set(e.row, [...fallenMap.get(e.row) || [], e]),
          new Map());
        fallenByRow = Array.from(fallenByRow).map(([key, value]) => ({ key, value }))
          .sort((fallenRow1, fallenRow2) => (fallenRow1.key > fallenRow2.key ? 1 : -1));

        let anyDestroyed = false;
        for (const rowGroup of fallenByRow) {
          let destroyingTotal = [];
          for (const shape of rowGroup.value) {
            const destroying = this.getShapesToDestroy(shape.row, shape.column);
            if (destroying) {
              destroyingTotal = destroyingTotal.concat(destroying);
            }
          }
          if (destroyingTotal && destroyingTotal.length > 0) {
            anyDestroyed = true;
            const destroyedTotal = this.destroyShapes(destroyingTotal);
            this.scoreDestroyed(destroyedTotal);
            this.fillEmptyes(destroyedTotal);
            break;
          }
        }
        if (!anyDestroyed) {
          this.shapesToFall = null;
        }
      }

      // generate new
      if (!isFalling && this.shapesToFall === null) {
        this.shapesToFall = [];
        const checkMatchBind = this.checkMatch.bind(this);
        for (let row = 0; row < this._rowCount; row++) {
          let rowConstainsEmpty = false;
          for (let column = 0; column < this._columnCount; column++) {
            let shape = this.cells[row][column];
            if (shape === null) {
              rowConstainsEmpty = true;
              const shapeType = this.getRandomAllowedShapeType(row, column);
              shape = new Shape(shapeType, this._cellSizePx, this._borderPx, checkMatchBind);
              shape.setYTo(row);
              shape.setX(column);
              this.cells[row][column] = shape;
              this.addChild(shape);
              this.shapesToFall.push(shape);
            }
          }
          if (!rowConstainsEmpty) {
            break;
          }
        }

        let shapesToFallByColumn = this.shapesToFall.reduce(
          (shapesMap, e) => shapesMap.set(e.column, [...shapesMap.get(e.column) || [], e]),
          new Map(),
        );
        shapesToFallByColumn.forEach(g => g.sort((s1, s2) => ((s1.row > s2.row) ? 1 : -1)));
        shapesToFallByColumn = Array.from(shapesToFallByColumn).map(([key, value]) =>
          ({ key, value }));
        for (const shapeGroup of shapesToFallByColumn) {
          for (const shape of shapeGroup.value) {
            const { row } = shape;
            shape.setY(shape.row - shapeGroup.value.length);
            shape.setYTo(row);
          }
        }
      }
    }

    if (!isFalling) {
      if (this.isAnimating) {
        this.isAnimating = false;
      }
    }

    requestAnimationFrame(this.tick.bind(this));
  }


  // onShapeClicked(e) {
  //   if (this.isAnimating) return;
  //   if (!e.target || !(e.target instanceof Shape)) return;
  //   if (this.selected === null) {
  //     this.selected = e.target;
  //   } else if (this.selected === e.target) {
  //     this.selected = null;
  //   } else {
  //     if (this.selected.isNeighbourTo(e.target)) {
  //       this.tryProccessMatch(this.selected, e.target);
  //     }
  //     this.selected = null;
  //   }
  // }


  checkMatch(shape, offsetX, offsetY) {
    let shape2 = null;
    if (offsetX > this._cellSizePx/2) {
      shape2 = this.getShape(shape.row, shape.column+1);
    } else if (-offsetX > this._cellSizePx/2) {
      shape2 = this.getShape(shape.row, shape.column-1);
    } else if (offsetY > this._cellSizePx/2) {
      shape2 = this.getShape(shape.row+1, shape.column);
    } else if (-offsetY > this._cellSizePx/2) {
      shape2 = this.getShape(shape.row-1, shape.column);
    }
    if (shape2) {
      return this.tryProccessMatch(shape, shape2);
    }
    return false;
  }


  tryProccessMatch(shape1, shape2) {
    this.swapShapes(shape1, shape2);
    const destroyed1 = this.destroyMatches(shape1.row, shape1.column);
    const destroyed2 = this.destroyMatches(shape2.row, shape2.column);
    if (!destroyed1.length && !destroyed2.length) {
      this.swapShapes(shape1, shape2);
      return false;
    }
    const destroyed = destroyed1.concat(destroyed2);
    this.fillEmptyes(destroyed);
    return true;
  }

  swapShapes(shape1, shape2) {
    const row1 = shape1.row;
    const column1 = shape1.column;
    shape1.setX(shape2.column);
    shape1.setY(shape2.row);
    shape2.setX(column1);
    shape2.setY(row1);
    this.cells[shape1.row][shape1.column] = shape1;
    this.cells[shape2.row][shape2.column] = shape2;
  }


  getShapesToDestroy(row, column) {
    const destroyed = [];
    const center = this.getCellType(row, column);

    const top1 = this.getCellType(row - 1, column);
    const bottom1 = this.getCellType(row + 1, column);
    const top2 = this.getCellType(row - 2, column);
    const bottom2 = this.getCellType(row + 2, column);
    if (top1 && top2 && top1 === center && top2 === center) {
      destroyed.push(this.cells[row - 2][column]);
      destroyed.push(this.cells[row - 1][column]);
    }
    if (top1 && bottom1 && top1 === center && bottom1 === center) {
      destroyed.push(this.cells[row - 1][column]);
      destroyed.push(this.cells[row + 1][column]);
    }
    if (bottom1 && bottom2 && bottom1 === center && bottom2 === center) {
      destroyed.push(this.cells[row + 1][column]);
      destroyed.push(this.cells[row + 2][column]);
    }

    const left1 = this.getCellType(row, column - 1);
    const right1 = this.getCellType(row, column + 1);
    const left2 = this.getCellType(row, column - 2);
    const right2 = this.getCellType(row, column + 2);
    if (left1 && left2 && left1 === center && left2 === center) {
      destroyed.push(this.cells[row][column - 2]);
      destroyed.push(this.cells[row][column - 1]);
    }
    if (left1 && right1 && left1 === center && right1 === center) {
      destroyed.push(this.cells[row][column - 1]);
      destroyed.push(this.cells[row][column + 1]);
    }
    if (right1 && right2 && right1 === center && right2 === center) {
      destroyed.push(this.cells[row][column + 1]);
      destroyed.push(this.cells[row][column + 2]);
    }

    if (destroyed.length) {
      destroyed.push(this.cells[row][column]);
    }
    return destroyed;
  }

  destroyShapes(destroying) {
    const destroyedShapes = [];
    for (const destroyedShape of destroying) {
      if (this.cells[destroyedShape.row][destroyedShape.column]) {
        destroyedShapes.push(this.cells[destroyedShape.row][destroyedShape.column]);
        this.cells[destroyedShape.row][destroyedShape.column] = null;
        this.removeChild(destroyedShape);
      }
    }
    return destroyedShapes;
  }

  scoreDestroyed(destroyedShapes) {
    if (destroyedShapes.length > 0) {
      const destroyedScore = destroyedShapes.reduce((total, shapeDstr) => {
        return total + ShapeTypeEnum.properties[shapeDstr.shapeType].rate;
      }, 0);
      this._scoreCallback(destroyedScore);
    }
  }


  destroyMatches(row, column) {
    const destroying = this.getShapesToDestroy(row, column);
    const destroyedShapes = this.destroyShapes(destroying);
    this.scoreDestroyed(destroyedShapes);
    return destroyedShapes;
  }


  fillEmptyes(destroyed) {
    let destroyedByColumn = destroyed.reduce(
      (destroyedMap, e) => destroyedMap.set(e.column, [...destroyedMap.get(e.column) || [], e]),
      new Map(),
    );
    destroyedByColumn.forEach(g => g.sort((s1, s2) => ((s1.row > s2.row) ? 1 : -1)));
    destroyedByColumn = Array.from(destroyedByColumn).map(([key, value]) => ({ key, value }));

    const shapesToFall = [];
    for (const destroyedGroup of destroyedByColumn) {
      const destroyedUpper = destroyedGroup.value[0];
      const shapesUp = [];
      for (let row = destroyedUpper.row - 1; row > -1; row--) {
        const shape = this.cells[row][destroyedGroup.key];
        if (shape) {
          shapesUp.push(shape);
          this.cells[row][destroyedGroup.key] = null;
          shape.setYTo(shape.row + destroyedGroup.value.length);
          this.cells[shape.row][destroyedGroup.key] = shape;
          shapesToFall.push(shape);
        }
      }
    }

    if (this.shapesToFall && this.shapesToFall.length > 0) {
      for (const shape of shapesToFall) {
        if (!this.shapesToFall.some(shapeToFall => (shapeToFall === shape))) {
          this.shapesToFall.push(shape);
        }
      }
    } else {
      this.shapesToFall = shapesToFall;
    }
    this.isAnimating = true;
  }
}
