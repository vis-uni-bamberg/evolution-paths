<script>
import * as d3 from "d3";
import {useProjectStore} from "../stores/project";
import Canvas2Image from "../assets/canvas2image";
import ColorLegend from "./ColorLegend.vue";

export default {
  components: {ColorLegend},
  data: () => ({
    cScale: undefined,
    fillStyles: {
      filtered: (scale, point, colorBy) => scale(point[colorBy]),
      raw: () => "rgba(192, 192, 192, 0.5)",
      selected: () => "gold"
    },
    lastTransform: d3.zoomIdentity,
    lineDashs: {
      filtered: [],
      raw: [],
      selected: []
    },
    lineWidths: {
      filtered: "2",
      raw: "1",
      selected: "2"
    },
    mode: "zoom",
    height: 0,
    quadtree: {},
    strokeStyles: {
      filtered: (scale, val) => {
        return scale(val);
      },
      raw: () => "rgba(192, 192, 192, 0.6)",
      selected: () => "gold"
    },
    sScale: undefined,
    valueLow: 0.0,
    valueHigh: 1.0,
    width: 0,
    xScale: undefined,
    yScale: undefined
  }),
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  computed: {
    colorBy() {
      return this.projectStore.colorBy;
    },
    filtered() {
      return this.projectStore.filtered;
    },
    raw() {
      return this.projectStore.raw;
    },
    scaleBy() {
      return this.projectStore.scaleBy;
    },
    scaleMode() {
      return this.projectStore.scaleMode;
    },
    showFiltered() {
      return this.projectStore.showFiltered;
    },
    showLines() {
      return this.projectStore.showLines;
    },
    showPoints() {
      return this.projectStore.showPoints;
    },
    showText() {
      return this.projectStore.showText;
    },
    sequences() {
      return this.projectStore.seq;
    },
    selectedSequences() {
      return this.projectStore.selectedSequences;
    },
    timestep() {
      return this.projectStore.timestep;
    }
  },
  mounted() {
    this.height = document.querySelector("div.scatter-plot").clientHeight;
    this.width = document.querySelector("div.scatter-plot").clientWidth;
    this.context = d3.select("#rendererCanvas").node().getContext("2d");
    this.setMode("zoom");

    const svg = d3.select("#rendererSvg");
    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [this.width, this.height]
      ])
      .on("end", brush_endEvent)
      .on("start.nokey", function () {
        d3.select(window).on("keydown.brush keyup.brush", null);
      });
    this.brushSvg = svg.append("g").attr("class", "brush").call(this.brush);

    const that = this;
    function isInSelection(selection, point) {
      const [[x0, y0], [x1, y1]] = selection;
      const x = that.scaleX(point.umap_x);
      const y = that.scaleY(point.umap_y);
      return x > x0 && x < x1 && y > y0 && y < y1;
    }

    function brush_endEvent({selection}) {
      if (selection) {
        const selected = that.filtered.filter(f => isInSelection(selection, f));
        const selectedPaths = Array.from(new Set(selected.map(s => s.seq)));
        that.projectStore.selectedSequences = selectedPaths;
      } else {
        that.projectStore.selectedSequences = [];
      }
    }
  },
  watch: {
    colorBy() {
      this.cScale = this.createCScale();
      this.draw();
    },
    filtered() {
      if (Object.keys(this.projectStore.extents).includes(this.colorBy)) {
        this.valueLow = this.projectStore.extents[this.colorBy][0];
        this.valueHigh = this.projectStore.extents[this.colorBy][1];
      }

      const xDomain = d3.extent(this.raw.map(row => row.umap_x).flat());
      const yDomain = d3.extent(this.raw.map(row => row.umap_y).flat());
      const maxRange = Math.min(this.height, this.width);
      const equalDomain = [Math.min(xDomain[0], yDomain[0]), Math.max(xDomain[1], yDomain[1])];
      this.xScale = d3.scaleLinear().domain(equalDomain).range([0, maxRange]);
      this.yScale = d3.scaleLinear().domain(equalDomain).range([0, maxRange]);
      this.cScale = this.createCScale();
      this.sScale = this.createSScale();
      this.draw();

      // Zoom/Drag handler
      this.zoom_function = d3
        .zoom()
        .scaleExtent([1, 1000])
        .on("zoom", event => {
          this.lastTransform = event.transform;
          this.draw();
        });
      d3.select("#rendererCanvas").call(this.zoom_function);
    },
    scaleBy() {
      this.sScale = this.createSScale();
      this.draw();
    },
    scaleMode() {
      this.sScale = this.createSScale();
      this.cScale = this.createCScale();
      this.draw();
    },
    showFiltered() {
      this.draw();
    },
    showLines() {
      this.draw();
    },
    showPoints() {
      this.draw();
    },
    showText() {
      this.draw();
    },
    selectedSequences(newSequences, oldSequences) {
      // if both are [] its initial draw and we must not draw
      if (newSequences.length > 1 || oldSequences.length > 1) {
        this.draw();
      }
    },
    timestep() {
      this.draw();
    }
  },
  methods: {
    createCScale() {
      if (Object.keys(this.projectStore.extents).includes(this.colorBy)) {
        this.valueLow = this.projectStore.extents[this.colorBy][0];
        this.valueHigh = this.projectStore.extents[this.colorBy][1];
      }

      // Use different scales for numbers and strings
      const t = typeof this.filtered[0][this.colorBy];
      if (t === "string") {
        const cDomain = Array.from(new Set(this.filtered.map(row => row[this.colorBy]))).sort();
        const k = Math.max(3, Math.min(cDomain.length, 9));
        return d3.scaleOrdinal(d3.schemeSpectral[k]).domain(cDomain);
      } else {
        const cDomain = d3.extent(this.filtered.map(row => row[this.colorBy]).flat());
        let cScale;

        switch (this.scaleMode) {
          case "log":
            cScale = d3.scaleSequentialLog(d3.interpolateSpectral).domain(cDomain);
            break;
          case "squared":
            cScale = d3.scaleSequentialPow(d3.interpolateSpectral).exponent(2).domain(cDomain);
            break;
          case "cubic":
            cScale = d3.scaleSequentialPow(d3.interpolateSpectral).exponent(3).domain(cDomain);
            break;
          default:
            cScale = d3.scaleSequential(d3.interpolateSpectral).domain(cDomain);
        }
        return cScale;
      }
    },
    createSScale() {
      const t = typeof this.filtered[0][this.scaleBy];
      if (t === "number") {
        const sDomain = d3.extent(this.filtered.map(row => row[this.scaleBy]).flat());
        const range = [1, 6];
        switch (this.scaleMode) {
          case "no scaling":
            return () => 1.0;
          case "log":
            return d3.scaleLog().domain(sDomain).range(range);
          case "squared":
            return d3.scalePow().exponent(2).domain(sDomain).range(range);
          case "cubic":
            return d3.scalePow().exponent(3).domain(sDomain).range(range);
          default:
            return d3.scaleLinear().domain(sDomain).range(range);
        }
      } else if (t === "string") {
        const sDomain = Array.from(new Set(this.filtered.map(row => row[this.scaleBy]))).sort();
        return d3.scaleOrdinal().domain(sDomain).range([1, 6]);
      } else {
        return () => {
          return 0.0;
        };
      }
    },
    draw() {
      this.scaleX = this.lastTransform.rescaleX(this.xScale);
      this.scaleY = this.lastTransform.rescaleY(this.yScale);

      this.context.clearRect(0, 0, this.width, this.height);

      for (const fn of [this.drawRaw, this.drawFiltered, this.drawSelected]) {
        this.context.save();
        fn();
        this.context.restore();
      }
    },
    drawRaw() {
      if (!this.projectStore.showFiltered) {
        return;
      }
      if (this.projectStore.filtered.length !== this.projectStore.raw.length) {
        const filteredIndices = this.projectStore.filtered.map(r => r.id);
        const rowsToDraw = this.projectStore.raw.filter(r => !filteredIndices.includes(r.id));
        const seqIndices = Array.from(new Set(rowsToDraw.map(p => p.seq)));
        const seqsToDraw = [];
        seqIndices.forEach(seq_id => seqsToDraw.push(this.projectStore.seq[seq_id]));
        this.drawSequences(seqsToDraw, "raw");
        this.drawRows(rowsToDraw, "raw");
      }
    },
    drawFiltered() {
      const rowsToDraw = this.projectStore.filtered;
      const seqIndices = Array.from(new Set(rowsToDraw.map(p => p.seq)));
      const seqsToDraw = [];
      seqIndices.forEach(seq_id => seqsToDraw.push(this.projectStore.seq[seq_id]));
      this.drawSequences(seqsToDraw, "filtered");
      this.drawRows(rowsToDraw, "filtered");
    },
    drawSelected() {
      // lets try drawing selected as filtered to avoid the golden highlight
      const rowsToDraw = this.projectStore.filtered.filter(p => this.projectStore.selectedSequences.includes(p.seq));
      const seqIndices = this.projectStore.selectedSequences;
      const seqsToDraw = [];
      seqIndices.forEach(seq_id => seqsToDraw.push(this.projectStore.seq[seq_id]));
      this.drawSequences(seqsToDraw, "filtered");
      this.drawRows(rowsToDraw, "filtered");
    },
    drawRows(points, mode) {
      if (!this.projectStore.showPoints) {
        return;
      }

      for (const point of points) {
        const px = this.scaleX(point.umap_x);
        const py = this.scaleY(point.umap_y);
        this.context.beginPath();
        this.context.fillStyle = this.fillStyles[mode](this.cScale, point, this.colorBy);
        if (mode === "raw") {
          this.context.arc(px, py, 1.2 * this.lastTransform.k, 0, 2 * Math.PI, true);
        } else {
          this.context.arc(px, py, this.sScale(point[this.scaleBy]) + 1.2 * this.lastTransform.k, 0, 2 * Math.PI, true);
        }

        this.context.fill();
        this.context.closePath();
      }
    },
    drawSequences(seqs, mode) {
      if (!this.projectStore.showLines) {
        return;
      }
      seqs.forEach(seq => {
        if (seq === undefined) {
          // Somehow the last seq can be undefined.
          // I suspect some index-based shenanigans prior to this.
          // idk.
          return;
        }

        if (seq.length > 1) {
          const pairs = [];
          for (const i in seq) {
            const current_idx = parseInt(i);
            const next_idx = current_idx + 1;
            if (current_idx + 1 === seq.length) {
              break;
            }
            const start = seq[current_idx];
            const end = seq[next_idx];
            pairs.push([this.raw[start], this.raw[end]]);
          }

          pairs.forEach(([start, end]) => {
            this.context.beginPath();
            this.context.moveTo(this.scaleX(start.umap_x), this.scaleY(start.umap_y));
            this.context.lineTo(this.scaleX(end.umap_x), this.scaleY(end.umap_y));
            this.context.setLineDash(this.lineDashs[mode]);
            this.context.strokeStyle = this.strokeStyles[mode](this.cScale, end[this.colorBy]);
            this.context.lineWidth = mode === "raw" ? 1 : this.sScale(end[this.scaleBy]);
            this.context.stroke();
            this.context.closePath();
          });

          if (["filtered", "selected"].includes(mode) && this.showText) {
            const first_ts = pairs[0][0];
            this.context.fillText(first_ts.timestep, this.scaleX(first_ts.umap_x) + 10, this.scaleY(first_ts.umap_y));
            const last_ts = pairs[pairs.length - 1][1];
            this.context.fillText(last_ts.timestep, this.scaleX(last_ts.umap_x) + 10, this.scaleY(last_ts.umap_y));
          }
        }
      });
    },
    resetPanZoom() {
      const t = d3.zoomIdentity.translate(0, 0).scale(1);
      d3.select("#rendererCanvas").transition().duration(200).ease(d3.easeLinear).call(this.zoom_function.transform, t);
      d3.select("#rendererSvg").select("g").call(this.brush.move, null);
    },
    saveImage() {
      const c = d3.select("#rendererCanvas").node();
      const w = undefined;
      const h = undefined;
      const fname = this.projectStore.file;
      Canvas2Image.saveAsPNG(c, w, h, fname);
    },
    setMode(mode) {
      switch (mode) {
        case "zoom": {
          this.mode = "zoom";
          d3.select("#rendererCanvas").style("z-index", 1);
          d3.select("#rendererSvg").style("z-index", 0);
          break;
        }
        case "brush": {
          this.mode = "brush";
          d3.select("#rendererCanvas").style("z-index", 0);
          d3.select("#rendererSvg").style("z-index", 1);
          break;
        }
        default: {
          this.resetPanZoom();
          this.setMode("zoom");
        }
      }
    }
  }
};
</script>

<template>
  <div class="renderer-area">
    <div class="scatter-plot">
      <canvas id="rendererCanvas" :height="height" :width="width"></canvas>
      <svg id="rendererSvg" :height="height" :width="width"></svg>
    </div>
    <div class="tools">
      <ColorLegend :width="250" :height="35" :valueHigh="valueHigh" :valueLow="valueLow" :ltr="true" />
      <button type="reset" @click="setMode()">Reset</button>
      <button type="button" :class="{inactive: mode !== 'zoom'}" @click="setMode('zoom')">Pan + Zoom</button>
      <button type="button" :class="{inactive: mode !== 'brush'}" @click="setMode('brush')">Brush</button>
      <button @click="saveImage()">Save as PNG</button>
    </div>
  </div>
</template>

<style scoped>
.scatter-plot {
  height: 100vh;
  width: 100vw;
}

#rendererCanvas,
#rendererSvg {
  position: absolute;
}

.tools {
  display: inline-flex;
  z-index: 2;
  position: absolute;
  top: 8px;
  right: 8px;
}

svg {
  margin: 0 20px;
}

button.inactive {
  background-color: #666;
}
</style>
