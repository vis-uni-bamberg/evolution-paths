<template>
  <div v-if="visible" ref="default">
    <slot name="default" />
    <slot name="headerToolbar" />
  </div>
</template>
<script>
import {jsPanel} from "jspanel4/es6module/jspanel.js";

export default {
  name: "JsPanel",

  props: {
    visible: {
      type: Boolean,
      default: false
    },

    options: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    panelOptions() {
      return Object.assign({onclosed: this.close}, this.options);
    }
  },

  watch: {
    visible(isVisible) {
      if (isVisible) {
        this.createPanel();
      }
    }
  },

  mounted() {
    if (this.visible) {
      this.createPanel();
    }
  },

  methods: {
    async createPanel() {
      await this.$nextTick();

      let options = Object.assign({content: this.$refs.default}, this.panelOptions);

      if (this.$slots.headerToolbar) {
        options = Object.assign({headerToolbar: this.$slots.headerToolbar()[0].el}, options);
      }
      jsPanel.create(options);
    },

    close() {
      this.$emit("close");
      this.$emit("update:visible", false);
    }
  }
};
</script>
