import * as PIXI from 'pixi.js'
import Shape from './shape.js'
import ShapeTypeEnum from './shapeTypes'


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
        this.on('pointerdown', this.onShapeClicked);
        this.setup();
    }

    getCellType(row, column) {
        if (row > -1 && column > -1 && row < this._rowCount && column < this._columnCount) {
            if (this.cells[row][column]) {
                return this.cells[row][column].shapeType;
            }
            return null;
        }
        return null;
    }

    getAllowedShapeTypes(row, column) {
        let disabled = [];
        let top2 = this.getCellType(row - 2, column);
        let top1 = this.getCellType(row - 1, column);
        let bottom1 = this.getCellType(row + 1, column);
        let bottom2 = this.getCellType(row + 2, column);
        let left2 = this.getCellType(row, column - 2);
        let left1 = this.getCellType(row, column - 1);
        let right1 = this.getCellType(row, column + 1);
        let right2 = this.getCellType(row, column + 2);
        if (left1 && left2 && left1 === left2) disabled.push(left1);
        if (left1 && right1 && left1 === right1) disabled.push(left1);
        if (right1 && right2 && right1 === right2) disabled.push(right1);
        if (top2 && top1 && top2 === top1) disabled.push(top2);
        if (top1 && bottom1 && top1 === bottom1) disabled.push(top1);
        if (bottom1 && bottom2 && bottom1 === bottom2) disabled.push(bottom1);
        let allowed = ShapeTypeEnum.ToArray().filter(shapeType =>
            !disabled.some(dis => dis === shapeType));
        return allowed;
    }

    getRandomAllowedShapeType(row, column) {
        let allowedShapeTypes = this.getAllowedShapeTypes(row, column);
        let shapeTypeIndex = Math.floor(Math.random() * allowedShapeTypes.length);
        return allowedShapeTypes[shapeTypeIndex];
    }

    setup() {
        for (let row = 0; row < this._rowCount; row++) {
            for (let column = 0; column < this._columnCount; column++) {
                let shapeType = this.getRandomAllowedShapeType(row, column);
                let shape = new Shape(shapeType, this._cellSizePx, this._borderPx);
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
            //fall down shapes in this.shapesToFall
            for (let shape of this.shapesToFall) {
                let changed = shape.tick();
                if (changed) {
                    isFalling = true;
                }
            }

            if (!isFalling) {
                //all shapes just fallen down, check for matches
                let fallenByRow = this.shapesToFall.reduce((fallenMap, e) =>
                    fallenMap.set(e.row, [...fallenMap.get(e.row) || [], e]),
                    new Map());
                fallenByRow = Array.from(fallenByRow).map(([key, value]) => ({ key, value }))
                    .sort((fallenRow1, fallenRow2) => {
                        fallenRow1.key > fallenRow2.key ? 1 : -1
                    });
                
                let anyDestroyed = false;
                for (let rowGroup of fallenByRow) {
                    let destroyedTotal = [];
                    for (let shape of rowGroup.value) {
                        let destroyed = this.destroyMatches(shape.row, shape.column);
                        if (destroyed) {
                            destroyedTotal = destroyedTotal.concat(destroyed);
                        }
                    }
                    if (destroyedTotal && destroyedTotal.length > 0) {
                        anyDestroyed = true;
                        this.fillEmptyes(destroyedTotal);
                        break;
                    }
                }
                if (!anyDestroyed) {
                    this.shapesToFall = null;
                }
            }

            //generate new
            if (!isFalling && this.shapesToFall === null) {
                this.shapesToFall = new Array();
                for (let row = 0; row < this._rowCount; row++) {
                    let rowConstainsEmpty = false;
                    for (let column = 0; column < this._columnCount; column++) {
                        let shape = this.cells[row][column];
                        if (shape === null) {
                            rowConstainsEmpty = true;
                            let shapeType = this.getRandomAllowedShapeType(row, column);
                            let shape = new Shape(shapeType, this._cellSizePx, this._borderPx);
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
                    new Map());
                shapesToFallByColumn.forEach((g) => g.sort((s1, s2) => (s1.row > s2.row) ? 1 : -1));
                shapesToFallByColumn = Array.from(shapesToFallByColumn).map(([key, value]) => 
                    ({ key, value }));
                for (let shapeGroup of shapesToFallByColumn) {
                    for (let shape of shapeGroup.value) {
                        let row = shape.row;
                        shape.setY(shape.row-shapeGroup.value.length);
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


    onShapeClicked(e) {
        if (this.isAnimating) return;
        if (!e.target || !(e.target instanceof Shape)) return;
        if (this.selected === null) {
            this.selected = e.target;
        }
        else {
            if (this.selected === e.target) {
                this.selected = null;
            }
            else {
                if (this.selected.isNeighbourTo(e.target)) {
                    this.swapShapes(this.selected, e.target);
                    let destroyed1 = this.destroyMatches(this.selected.row, this.selected.column);
                    let destroyed2 = this.destroyMatches(e.target.row, e.target.column);
                    if (!destroyed1.length && !destroyed2.length) {
                        this.swapShapes(this.selected, e.target);
                    } else {
                        let destroyed = destroyed1.concat(destroyed2);
                        this.fillEmptyes(destroyed);
                    }
                }
                this.selected = null;
            }
        }
    }

    swapShapes(shape1, shape2) {
        let row1 = shape1.row;
        let column1 = shape1.column;
        shape1.setX(shape2.column);
        shape1.setY(shape2.row);
        shape2.setX(column1);
        shape2.setY(row1);
        this.cells[shape1.row][shape1.column] = shape1;
        this.cells[shape2.row][shape2.column] = shape2;
    }


    destroyMatches(row, column) {
        let shape = this.cells[row][column];

        let destroyed = [];
        let center = this.getCellType(row, column);

        let top1 = this.getCellType(row - 1, column);
        let bottom1 = this.getCellType(row + 1, column);
        let top2 = this.getCellType(row - 2, column);
        let bottom2 = this.getCellType(row + 2, column);
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

        let left1 = this.getCellType(row, column - 1);
        let right1 = this.getCellType(row, column + 1);
        let left2 = this.getCellType(row, column - 2);
        let right2 = this.getCellType(row, column + 2);
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

        let destroyedShapes = [];
        for (let destroyedShape of destroyed) {
            if (this.cells[destroyedShape.row][destroyedShape.column]) {
                destroyedShapes.push(this.cells[destroyedShape.row][destroyedShape.column]);
                this.cells[destroyedShape.row][destroyedShape.column] = null;
                this.removeChild(destroyedShape);
            }
        }

        if (destroyedShapes.length > 0) {
            let destroyedScore = destroyedShapes.reduce((total, shape) => { 
                return total + ShapeTypeEnum.properties[shape.shapeType].rate }, 0);
            this._scoreCallback(destroyedScore);
        }

        return destroyedShapes;
    }



    fillEmptyes(destroyed) {
        let destroyedByColumn = destroyed.reduce(
            (destroyedMap, e) => destroyedMap.set(e.column, [...destroyedMap.get(e.column) || [], e]),
            new Map());
        destroyedByColumn.forEach((g) => g.sort((s1, s2) => (s1.row > s2.row) ? 1 : -1));
        destroyedByColumn = Array.from(destroyedByColumn).map(([key, value]) => ({ key, value }));

        let shapesToFall = new Array();
        for (let destroyedGroup of destroyedByColumn) {
            let destroyedUpper = destroyedGroup.value[0];
            let shapesUp = new Array();
            for (let row = destroyedUpper.row - 1; row > -1; row--) {
                let shape = this.cells[row][destroyedGroup.key];
                if (!shape) continue;
                shapesUp.push(shape);
                this.cells[row][destroyedGroup.key] = null;
                shape.setYTo(shape.row + destroyedGroup.value.length);
                this.cells[shape.row][destroyedGroup.key] = shape;
                shapesToFall.push(shape);
            }
        }

        if (this.shapesToFall && this.shapesToFall.length > 0) {
            for (let shape of shapesToFall) {
                if (!this.shapesToFall.some((shapeToFall) => (shapeToFall === shape))) {
                    this.shapesToFall.push(shape);
                }
            }
        }
        else
        {
            this.shapesToFall = shapesToFall;
        }
        
        this.isAnimating = true;
    }
}