<template>
  <div id="appDiv" ref="appDiv">
    <div id="stretchDiv" ref="stretchDiv">
      <div id="headerDiv" ref="headerDiv">
        <div>
          <span class="importantSpan">MATCH 3</span>
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
    <modal name="settingsModal" :width="210" :height="210">
      <div id="settingsDiv">
        <div id="settingsHeaderDiv">
          <span>Settings</span>
        </div>
        <div>
          <label for="cellSizePx">Shape size (px)</label>
          <input name="cellSizePx" type="number" v-model.number="cellSizePx" />
        </div>
        <div>
          <label>Set board size automatically</label>
          <input type="checkbox" v-model="autoBoardSize" />
        </div>
        <div>
          <label for="rowCount">Rows</label>
          <span v-if="autoBoardSize">{{rowCount}}</span>
          <input v-else name="rowCount" type="number" v-model.number="rowCount" />
        </div>
        <div>
          <label for="columnCount">Columns</label>
          <span v-if="autoBoardSize">{{columnCount}}</span>
          <input v-else name="columnCount" type="number" v-model.number="columnCount" />
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

const borderPx = 2;
const ROW_COUNT_MIN = 5;
const COLUMN_COUNT_MIN = 5;
const CELL_SIZE_MIN = 5;
const ROW_COUNT_MAX = 30;
const COLUMN_COUNT_MAX = 30;

export default {
  data() {
    return {
      rowCount: 10,
      columnCount: 10,
      scoreSpan: 0,
      cellSizePx: 45,
      autoBoardSize: true,
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
      if (this.cellSizePx < CELL_SIZE_MIN) {
        this.cellSizePx = CELL_SIZE_MIN;
      }
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
    },
    setOptimalParams() {
      //debugger;
      const appDivHeight = this.$refs.appDiv.offsetHeight;
      const navHeight = this.$refs.headerDiv.offsetHeight;
      const freeHeight = appDivHeight - navHeight - 4;
      const freeWidth = this.$refs.appDiv.offsetWidth - 4;
      const rows = Math.floor(freeHeight / (this.cellSizePx+borderPx));
      const columns = Math.floor(freeWidth / (this.cellSizePx+borderPx));
      this.rowCount = rows;
      this.columnCount = columns;
    },
    setup() {
      if (this.autoBoardSize)
      {
        this.setOptimalParams();
        this.verifyInput();
      }
      else
      {
        this.verifyInput();
      }
      if (this.app != null) {
        this.$refs.stretchDiv.removeChild(this.app.view);
      }
      this.scoreSpan = 0;
      const canvasHeightPx = this.rowCount * (this.cellSizePx + borderPx) + borderPx;
      const canvasWidthPx = this.columnCount * (this.cellSizePx + borderPx) + borderPx;
      this.app = new PIXI.Application({
        width: canvasWidthPx,
        height: canvasHeightPx,
        backgroundColor: 0x404040
      });
      this.$refs.stretchDiv.appendChild(this.app.view);
      const field = new Field(
        this.cellSizePx,
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
    this.setup();
  }
};
</script>