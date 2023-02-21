<script>
import {useProjectStore} from "../stores/project";

export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  computed: {
    extents() {
      return this.projectStore.extents;
    },
    metrics() {
      return this.projectStore.metrics.filter(m => m !== "javadocCount");
    }
  },
  methods: {
    toggleLimitsForMetric(metric) {
      if (this.projectStore.limits.map(l => l.metric).includes(metric)) {
        this.projectStore.limits = this.projectStore.limits.filter(l => l.metric !== metric);
      } else {
        const min = document.getElementById(`${metric}-min`).valueAsNumber;
        const max = document.getElementById(`${metric}-max`).valueAsNumber;
        const limit = {metric: metric, min: min, max: max};
        this.projectStore.limits.push(limit);
      }
    }
  }
};
</script>

<template>
  <div class="limits">
    <h2>Set Limits per metric to filter the dataset</h2>
    <table>
      <thead>
        <tr>
          <th>Enable?</th>
          <th>Min</th>
          <th>Metric</th>
          <th>Max</th>
          <th>Extent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="metric in metrics" :key="metric">
          <td>
            <input
              type="checkbox"
              :name="`${metric}-enabled`"
              :id="`${metric}-enabled`"
              @click="toggleLimitsForMetric(metric)"
            />
          </td>
          <td>
            <input type="number" :name="`${metric}-min`" :id="`${metric}-min`" />
          </td>
          <td>
            {{ metric }}
          </td>
          <td>
            <input type="number" :name="`${metric}-max`" :id="`${metric}-max`" />
          </td>
          <td>
            <code>{{ extents[metric] }}</code>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
