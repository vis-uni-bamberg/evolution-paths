import {defineStore} from "pinia";
import * as d3 from "d3";

export const useProjectStore = defineStore("project", {
  state: () => {
    return {
      cameraPath: undefined,
      cameraPaths: [],
      colorBy: "timestep",
      device: undefined,
      devices: [],
      extents: {},
      file: "mp-planes-aligned-666-euclidean-1.0-5.0-25-3-0.01",
      files: [
        "mp-droplet-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-laser-ablation-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-liquid-formation-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-phase-change-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-planes-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-streamlines-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "mp-vdb-volume-aligned-666-euclidean-1.0-5.0-25-3-0.01",
        "vv-io-666-euclidean-1000-1.0-5.0-False",
        "vv-lang3-666-euclidean-1000-1.0-5.0-False",
        "vv-text-666-euclidean-1000-1.0-5.0-False"
      ],
      limits: [],
      metric: undefined,
      metrics: [],
      mode: "mp",
      raw: [],
      scaleBy: undefined,
      scaleMode: "squared",
      scaleModes: ["linear", "log", "squared", "cubic"],
      showFiltered: true,
      showLines: true,
      showPoints: false,
      showText: true,
      selectedSequences: [],
      seq: [],
      sequences: [],
      timestep: undefined,
      timesteps: [],
      topnMode: "top",
      umap_params: {},
      version: undefined,
      versions: [],
      viewport: undefined,
      viewports: []
    };
  },
  getters: {
    filtered: state => {
      let result = state.raw;

      if (state.selectedSequences.length > 0) {
        result = result.filter(r => state.selectedSequences.includes(r.seq));
      }

      if (state.timestep !== undefined) {
        result = result.filter(r => r.timestep === state.timestep);
      }

      if (state.mode === "mp") {
        if (state.cameraPath !== undefined) {
          result = result.filter(r => r.camera_path === state.cameraPath);
        }

        if (state.device !== undefined) {
          result = result.filter(r => r.device === state.device);
        }

        if (state.viewport !== undefined) {
          result = result.filter(r => r.viewport === state.viewport);
        }
      }

      const limits = state.limits;
      if (limits.length > 0) {
        let seqWhitelist = new Set();
        for (const limit of limits) {
          let tsWhitelist = state.raw;
          if (!Number.isNaN(limit.min)) {
            tsWhitelist = tsWhitelist.filter(row => row[limit.metric] > limit.min);
          }

          if (!Number.isNaN(limit.max)) {
            tsWhitelist = tsWhitelist.filter(row => row[limit.metric] <= limit.max);
          }
          tsWhitelist.forEach(ts => seqWhitelist.add(ts.seq));
        }
        result = result.filter(r => seqWhitelist.has(r.seq));
      }

      // Update extents based on filtered data
      for (const metric of state.metrics) {
        state.extents[metric] = d3.extent(result.map(row => row[metric]));
      }

      return result;
    }
  },
  actions: {
    load() {
      this.sequences = [];
      Promise.all([
        d3.json(`data/${this.file}.seq.json`, d3.autoType),
        d3.csv(`data/${this.file}.csv`, d3.autoType),
        d3.json(`data/${this.file}.umap-params.json`, d3.autoType)
      ]).then(([seq, raw, umap_params]) => {
        this.seq = seq;
        this.raw = raw;
        this.mode = this.file.substring(0, 2);

        if (this.mode === "vv") {
          this.timesteps = Array.from(new Set(raw.map(r => r.timestep))).sort((a, b) => a - b);
          this.versions = Array.from(new Set(raw.map(r => r.version))).sort((a, b) => {
            const re = /\((.*?)\)/;
            const keyA = a.match(re);
            const keyB = b.match(re);
            return parseInt(keyA[1]) - parseInt(keyB[1]);
          });

          this.metrics = ["selfTime", "totalTime", "invocationCount", "ncss", "ccn", "javadocCount"];
          this.metric = this.metrics[0];
          this.scaleBy = this.metrics[0];
          this.colorBy = this.metrics[0];
          for (const metric of this.metrics) {
            this.extents[metric] = d3.extent(this.raw.map(row => row[metric]));
          }
        } else if (this.mode === "mp") {
          this.timesteps = Array.from(new Set(raw.map(r => r.timestep))).sort((a, b) => a - b);
          this.versions = this.timesteps;
          const trrojanMetrics = ["quad_tess", "geo_quad", "stpa", "quad_inst", "poly_tess"];
          const osprayMetrics = [
            "ao-NA-1-NA",
            "ao-NA-5-NA",
            "pathtracer-NA-NA-10",
            "pathtracer-NA-NA-5",
            "scivis-false-1-NA",
            "scivis-false-5-NA",
            "scivis-true-1-NA",
            "scivis-true-5-NA"
          ];
          const isTrrojan = Object.prototype.hasOwnProperty.call(this.raw[0], "stpa");
          this.metrics = isTrrojan ? trrojanMetrics : osprayMetrics;
          this.metric = this.metrics[0];
          this.scaleBy = this.metrics[0];
          this.colorBy = this.metrics[0];
          for (const metric of this.metrics) {
            this.extents[metric] = d3.extent(this.raw.map(row => row[metric]));
          }

          this.cameraPaths = Array.from(new Set(raw.map(r => r.camera_path))).sort();
          this.devices = Array.from(new Set(raw.map(r => r.device))).sort();
          this.viewports = Array.from(new Set(raw.map(r => r.viewport))).sort();
        }
        this.umap_params = umap_params;
      });
    },
    setColorBy(value) {
      this.colorBy = value;
    },
    setFile(value) {
      this.file = value;
      this.load();
    },
    setScaleBy(value) {
      this.scaleBy = value;
    },
    setScaleMode(value) {
      this.scaleMode = value;
    },
    selectMethods(value) {
      this.selectedMethods = value;
    },
    setMetricAndTopN(metric, n) {
      this.metric = metric;
      this.topN = n;
    },
    selectSequences(metric, n) {
      const sortFns = {
        top: (a, b) => (a[metric] < b[metric] ? 1 : -1),
        bottom: (a, b) => (a[metric] > b[metric] ? 1 : -1)
      };
      if (metric && n) {
        this.selectedSequences = [
          ...new Set([...this.filtered].sort(sortFns[this.topnMode]).map(row => row.seq))
        ].slice(0, n);
      } else {
        this.selectedSequences = [];
      }
    }
  }
});
