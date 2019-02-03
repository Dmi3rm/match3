var ShapeTypeEnum = {
    CIRCLE: 1,
    TRIANGLE: 2,
    SQUARE: 3,
    PENTAGON: 4,
    HEXAGON: 5,
    properties: {
        1: { rate: 1, image: 'static/images/circle.png' },
        2: { rate: 2, image: 'static/images/triangle.png' },
        3: { rate: 3, image: 'static/images/square.png' },
        4: { rate: 4, image: 'static/images/pentagon.png' },
        5: { rate: 5, image: 'static/images/hexagon.png' },
    },
    ToArray() {
        return [this.CIRCLE, this.TRIANGLE, this.SQUARE, this.PENTAGON, this.HEXAGON];
    }
}

export default ShapeTypeEnum;