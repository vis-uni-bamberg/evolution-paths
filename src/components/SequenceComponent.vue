<script>
import {useProjectStore} from "../stores/project";

export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  data: () => ({
    metricProxy: undefined,
    topNProxy: undefined
  }),
  methods: {
    resetSequences() {
      this.projectStore.selectSequences();
    },
    selectSequences() {
      this.resetSequences();
      this.projectStore.selectSequences(this.metricProxy, this.topNProxy);
    }
  }
};
</script>

<template>
  <div>
    <h2>Highlight Top N sequences by metric</h2>
    <form @submit.prevent="selectSequences" @reset.prevent="resetSequences">
      <fieldset>
        <label for="metric-select">Metric</label>
        <select name="metric" id="metric-select" v-model="metricProxy">
          <option v-for="metric in projectStore.metrics" :key="metric" :value="metric">{{ metric }}</option>
        </select>
      </fieldset>
      <fieldset>
        <label for="topN-select">N</label>
        <input type="number" name="topN-select" id="topN-select" v-model="topNProxy" min="1" max="100" step="1" />
      </fieldset>
      <fieldset>
        <label for="topN-Mode">Top or Bottom</label>
        <select name="topN-Mode" id="topN-Mode" v-model="projectStore.topnMode">
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
      </fieldset>
      <fieldset>
        <button type="submit">Highlight</button>
        <button type="reset">Remove Highlighting</button>
      </fieldset>
    </form>
  </div>
</template>
