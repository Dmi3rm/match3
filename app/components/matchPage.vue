<template>
  <div id="appDiv" ref="appDiv">
    <div id="headerDiv">
      <div id="settingsDiv">
        <div>
          <label for="rowCount">Число строк</label>
          <input name="rowCount" type="number" :value="rowCount">
        </div>
        <div>
          <label for="columnCount">Число столбцов</label>
          <input name="columnCount" type="number" :value="columnCount">
        </div>
        <div>
          <button id="setupBtn" @click="setup">Применить и начать</button>
        </div>
      </div>
      <div id="scoreDiv">
        <div>
          <label>Набрано очков</label>
          <br>
          <span id="scoreSpan">{{scoreSpan}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./mpCommonStyles.css";
</style>

<script>
import * as PIXI from "pixi.js";
import Field from "./field";
import ShapeTypeEnum from "./shapeTypes";

const cellSizePx = 50;
const borderPx = 2;
const ROW_COUNT_MIN = 5;
const ROW_COUNT_MAX = 30;
const COLUMN_COUNT_MIN = 5;
const COLUMN_COUNT_MAX = 30;

export default {
  data() {
    return {
      rowCount: 10,
      columnCount: 10,
      scoreSpan: 0,
      app: null,
    };
  },
  methods: {
    setup() {
      if (this.rowCount < ROW_COUNT_MIN) {
        this.rowCount = ROW_COUNT_MIN;
      }
      if (this.rowCount > ROW_COUNT_MAX) {
        this.rowCount = ROW_COUNT_MAX;
      }
      if (this.columnCount < COLUMN_COUNT_MIN) {
        this.columnCount = COLUMN_COUNT_MIN;
      }
      if (this.columnCount > COLUMN_COUNT_MAX) {
        this.columnCount = COLUMN_COUNT_MAX;
      }
      if (this.app != null) {
        this.$refs.appDiv.removeChild(this.app.view);
      }
      this.scoreSpan = 0;
      const canvasHeightPx = this.rowCount * (cellSizePx + borderPx) + borderPx;
      const canvasWidthPx = this.columnCount * (cellSizePx + borderPx) + borderPx;
      this.app = new PIXI.Application(canvasWidthPx, canvasHeightPx, {
        backgroundColor: 0x222222
      });
      this.$refs.appDiv.appendChild(this.app.view);
      const field = new Field(
        cellSizePx,
        this.rowCount,
        this.columnCount,
        borderPx,
        score => {
          this.scoreSpan += score
        }
      );
      this.app.stage.addChild(field);
    }
  },
  mounted() {
    PIXI.loader
      .add(ShapeTypeEnum.properties[ShapeTypeEnum.CIRCLE].image)
      .add(ShapeTypeEnum.properties[ShapeTypeEnum.TRIANGLE].image)
      .add(ShapeTypeEnum.properties[ShapeTypeEnum.SQUARE].image)
      .add(ShapeTypeEnum.properties[ShapeTypeEnum.PENTAGON].image)
      .add(ShapeTypeEnum.properties[ShapeTypeEnum.HEXAGON].image)
      .load(() => {
        
      });
  }
};
</script>