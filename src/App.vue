<script>
import {JsPanel} from "vue3-js-panel";
import CanvasRenderer from "./components/CanvasRenderer.vue";
import {useProjectStore} from "./stores/project";
import DetailsOnDemand from "./components/DetailsOnDemand.vue";
import MultiplePerspectives from "./components/MultiplePerspectives.vue";
import SequenceComponent from "./components/SequenceComponent.vue";
import LimitsComponent from "./components/LimitsComponent.vue";
import ParallelCoordinates from "./components/ParallelCoordinatesES.vue";
import AestheticsComponent from "./components/AestheticsComponent.vue";

export default {
  components: {
    CanvasRenderer,
    JsPanel,
    DetailsOnDemand,
    MultiplePerspectives,
    SequenceComponent,
    LimitsComponent,
    ParallelCoordinates,
    AestheticsComponent
  },
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  data: () => ({
    options: {
      contentSize: {
        width: "800px",
        height: "400px"
      },
      headerControls: {
        close: "remove",
        maximize: "remove"
      },
      setStatus: "minimized",
      theme: "light filled"
    }
  }),
  computed: {
    optionsAE() {
      return {
        config: this.options,
        headerTitle: "Look and Feel",
        setStatus: undefined
      };
    },
    optionsDoD() {
      return {
        config: this.options,
        headerTitle: "Select Project",
        setStatus: undefined,
        position: {
          my: "right-center",
          at: "right-center"
        }
      };
    },
    optionsMP() {
      return {
        config: this.options,
        headerTitle: "Multiple Perspectives"
      };
    },
    optionsSC() {
      return {
        config: this.options,
        headerTitle: "Highlight Sequences"
      };
    },
    optionsLC() {
      return {
        config: this.options,
        headerTitle: "Configure Limits",
        contentSize: {
          width: "1200px",
          height: "600px"
        }
      };
    },
    optionsPCP() {
      return {
        config: this.options,
        headerTitle: "Parallel Coordinates Plot",
        contentSize: "1200 1000"
      };
    }
  },
  created() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (prefersDarkScheme.matches) {
      this.options.theme = "dark filled";
    }
  },
  mounted() {
    this.projectStore.load();
  }
};
</script>

<template>
  <div>
    <CanvasRenderer />
    <JsPanel :visible="true" :options="optionsDoD">
      <DetailsOnDemand />
    </JsPanel>
    <JsPanel :visible="projectStore.mode === 'mp'" :options="optionsMP">
      <MultiplePerspectives />
    </JsPanel>
    <JsPanel :visible="true" :options="optionsSC">
      <SequenceComponent />
    </JsPanel>
    <JsPanel :visible="true" :options="optionsLC">
      <LimitsComponent />
    </JsPanel>
    <JsPanel :visible="true" :options="optionsPCP">
      <ParallelCoordinates />
    </JsPanel>
    <JsPanel :visible="true" :options="optionsAE">
      <AestheticsComponent />
    </JsPanel>
  </div>
</template>

<style>
@import "normalize.css/normalize.css";
@import "jspanel4/dist/jspanel.css";
@import "concrete.css/concrete.css";

body {
  margin: 0;
  overflow: hidden;
}

.jsPanel-content {
  font-size: 2rem;
  padding: 0 1rem;
}
</style>
