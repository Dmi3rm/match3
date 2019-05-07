<template>
  <div id="appDiv" ref="appDiv">
    <div id="stretchDiv" ref="stretchDiv">
      <div id="headerDiv" ref="headerDiv">
        <div>
          <span class="importantSpan">Match 3</span>
        </div>
        <div>
          <label>Score:</label>
          <span class="importantSpan">{{scoreSpan}}</span>
        </div>
        <div id="settingsBtnDiv">
          <span @click="openSettings" class="importantSpan">
            <i class="fa fa-bars"></i>
          </span>
        </div>
      </div>
    </div>
    <modal name="settingsModal" :width="200" :height="140">
      <div id="settingsDiv">
        <div id="settingsHeaderDiv">
          <span>Settings</span>
        </div>
        <div>
          <label for="rowCount">Rows</label>
          <input name="rowCount" type="number" v-model.number="rowCount">
        </div>
        <div>
          <label for="columnCount">Columns</label>
          <input name="columnCount" type="number" v-model.number="columnCount">
        </div>
        <div>
          <button id="setupBtn" @click="setup">Ok</button>
        </div>
      </div>
    </modal>
  </div>
</template>

<style scoped>
@import "./mpCommonStyles.css";
</style>

<script>
import * as PIXI from "pixi.js";
import Field from "./field";
import ShapeTypeEnum from "./shapeTypes";
import "font-awesome/css/font-awesome.min.css";

let cellSizePx = 45;
const borderPx = 2;
const ROW_COUNT_MIN = 5;
const COLUMN_COUNT_MIN = 5;

export default {
  data() {
    return {
      rowCount: 10,
      columnCount: 10,
      scoreSpan: 0,
      app: null
    };
  },
  methods: {
    openSettings() {
      this.$modal.show("settingsModal");
    },
    closeSettings() {
      this.$modal.hide('settingsModal');
    },
    verifyInput() {
      if (this.rowCount < ROW_COUNT_MIN) {
        this.rowCount = ROW_COUNT_MIN;
      }
      if (this.columnCount < COLUMN_COUNT_MIN) {
        this.columnCount = COLUMN_COUNT_MIN;
      }
    },
    setOptimalParams() {
      //debugger;
      const appDivHeight = this.$refs.appDiv.offsetHeight;
      const navHeight = this.$refs.headerDiv.offsetHeight;
      const freeHeight = appDivHeight - navHeight - 4;
      const freeWidth = this.$refs.appDiv.offsetWidth - 4;
      const rows = Math.floor(freeHeight / (cellSizePx+borderPx));
      const columns = Math.floor(freeWidth / (cellSizePx+borderPx));
      this.rowCount = rows;
      this.columnCount = columns;
    },
    setup() {
      this.verifyInput();
      if (this.app != null) {
        this.$refs.stretchDiv.removeChild(this.app.view);
      }
      this.scoreSpan = 0;
      const canvasHeightPx = this.rowCount * (cellSizePx + borderPx) + borderPx;
      const canvasWidthPx = this.columnCount * (cellSizePx + borderPx) + borderPx;
      this.app = new PIXI.Application(canvasWidthPx, canvasHeightPx, {
        backgroundColor: 0x404040
      });
      this.$refs.stretchDiv.appendChild(this.app.view);
      const field = new Field(
        cellSizePx,
        this.rowCount,
        this.columnCount,
        borderPx,
        score => {
          this.scoreSpan += score;
        }
      );
      this.app.stage.addChild(field);
      this.closeSettings();
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
        this.setOptimalParams();
        this.setup();
      });
  }
};
</script>