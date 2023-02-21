<script>
import ParCoords from "parcoord-es";
import * as d3 from "d3";
import {useProjectStore} from "../stores/project";
import TableLite from "vue3-table-lite";

export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  components: {TableLite},
  data: () => ({
    margin: {top: 30, right: 0, bottom: 10, left: 100},
    width: 0,
    height: 0,
    pcp: undefined,
    scoped: []
  }),
  computed: {
    sequences: {
      get() {
        return this.projectStore.selectedSequences;
      },
      set(value) {
        this.projectStore.selectedSequences = value;
      }
    },
    tableColumns() {
      if (this.scoped.length > 0) {
        return Object.keys(this.scoped[0])
          .filter(key => !["umap_x", "umap_y"].includes(key))
          .map(column => ({
            isKey: column === "id",
            label: column,
            field: column,
            sortable: true
          }));
      } else {
        return [];
      }
    },
    tableRows() {
      return this.scoped.map(row => Object.values(row));
    }
  },
  mounted() {
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;
  },
  watch: {
    sequences() {
      if (this.sequences.length === 0) {
        d3.select("#pcp").html("");
        return;
      }
      // Parse the Data
      const data = this.projectStore.filtered.filter(r => this.sequences.includes(r.seq));
      let dimensions = [];
      if (this.projectStore.mode === "mp") {
        dimensions = Object.keys(data[0]).filter(k => !["id", "umap_x", "umap_y"].includes(k));
      } else {
        dimensions = ["method", "timestep"];
        dimensions = [
          ...dimensions,
          ...Object.keys(data[0]).filter(
            k => !["id", "umap_x", "umap_y", "version", "seq", "method", "timestep"].includes(k)
          )
        ];
        console.log(dimensions);
      }

      let cDomain;
      let cScale;

      // Use different scales for numbers and strings
      if (typeof data[0][this.projectStore.colorBy] === "string") {
        cDomain = Array.from(new Set(data.map(row => row[this.projectStore.colorBy]))).sort();
        const k = Math.max(3, Math.min(cDomain.length, 9));
        cScale = d3.scaleOrdinal(d3.schemeSpectral[k]).domain(cDomain);
      } else {
        cDomain = d3.extent(this.projectStore.filtered.map(row => row[this.projectStore.colorBy]).flat());
        cScale = d3.scaleSequential(d3.interpolateSpectral).domain(cDomain);
      }

      const color = d => cScale(d[this.projectStore.colorBy]);

      ParCoords()("#pcp")
        .margin(this.margin)
        .width(this.width)
        .height(this.height)
        .data(data)
        .color(color)
        .dimensions(dimensions)
        .render()
        .reorderable()
        .brushMode("1D-axes-multi")
        .alphaOnBrushed(0.1)
        .on("brushend", brushed => {
          this.scoped = brushed;
        });
    }
  }
};
</script>

<template>
  <div class="content">
    <div id="pcp" class="parcoords"></div>
    <div id="table">
      <table-lite :columns="tableColumns" :rows="scoped" :is-static-mode="true" :total="scoped.length" />
    </div>
  </div>
</template>

<style>
@import "parcoord-es/dist/parcoords.css";

#pcp {
  width: 1180px;
  height: 600px;
}

#table {
  padding-top: 1rem;
}

.content {
  font-size: 1rem;
}
</style>
