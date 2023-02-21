<script>
import {useProjectStore} from "../stores/project";
export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  computed: {
    colorBy: {
      get() {
        return this.projectStore.colorBy;
      },
      set(value) {
        this.projectStore.setColorBy(value);
      }
    },
    colorByValues() {
      if (this.projectStore.mode === "mp") {
        return ["timestep", "camera_path", "device", "viewport", ...this.projectStore.metrics];
      }
      return ["timestep", "method", ...this.projectStore.metrics];
    },
    scaleBy: {
      get() {
        return this.projectStore.scaleBy;
      },
      set(value) {
        this.projectStore.setScaleBy(value);
      }
    },
    scaleByValues() {
      if (this.projectStore.mode === "mp") {
        return ["no scaling", "timestep", "camera_path", "device", "viewport", ...this.projectStore.metrics];
      }
      return ["no scaling", ...this.projectStore.metrics.filter(m => !["javadocCount"].includes(m))];
    },
    scaleMode: {
      get() {
        return this.projectStore.scaleMode;
      },
      set(value) {
        this.projectStore.setScaleMode(value);
      }
    },
    scaleModeValues() {
      return this.projectStore.scaleModes;
    }
  }
};
</script>
<template>
  <div>
    <form>
      <fieldset>
        <legend>Control Coloring and Scaling</legend>
        <label for="colorBy-select">Color by</label>
        <select name="colorBy" id="colorBy-select" v-model="colorBy">
          <option v-for="metric in colorByValues" :key="metric" :value="metric">{{ metric }}</option>
        </select>
        <label for="scaleBy-select">Scale by</label>
        <select name="scaleBy" id="scaleBy-select" v-model="scaleBy">
          <option v-for="metric in scaleByValues" :key="metric" :value="metric">{{ metric }}</option>
        </select>
        <label for="scaleMode-select">Scale mode</label>
        <select name="scaleMode" id="scaleMode-select" v-model="scaleMode">
          <option v-for="mode in scaleModeValues" :key="mode" :value="mode">{{ mode }}</option>
        </select>
        <label for="version-select">Show Timestep</label>
        <select name="timestep" id="version-select" v-model="projectStore.timestep">
          <option :value="undefined">All Timesteps</option>
          <option v-for="(timestep, idx) in projectStore.timesteps" :key="timestep" :value="timestep">
            {{ projectStore.versions[idx] }}
          </option>
        </select>
      </fieldset>
    </form>

    <label for="showLines-input">Draw Lines?</label>
    <input type="checkbox" name="showLines" id="showLines-input" v-model="projectStore.showLines" />

    <label for="showPoints-input">Draw Points?</label>
    <input type="checkbox" name="showPoints" id="showPoints-input" v-model="projectStore.showPoints" />

    <label for="showFiltered-input">Draw Points Outside Filters?</label>
    <input type="checkbox" name="showFiltered" id="showFiltered-input" v-model="projectStore.showFiltered" />

    <label for="showText-input">Draw Text Labels?</label>
    <input type="checkbox" name="showText" id="showText-input" v-model="projectStore.showText" />
  </div>
</template>
