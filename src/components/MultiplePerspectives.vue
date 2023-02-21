<script>
import {useProjectStore} from "../stores/project";

export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  }
};
</script>

<template>
  <div class="multiple-perspectives">
    <form>
      <fieldset>
        <legend>Control <em>Multiple Perspectives</em> Input Parameter Space</legend>
        <label for="selectCameraPath">Camera Path</label>
        <select name="selectCameraPath" id="selectCameraPath" v-model="projectStore.cameraPath">
          <option :value="undefined">All</option>
          <option v-for="cameraPath in projectStore.cameraPaths" :key="cameraPath" :value="cameraPath">
            {{ cameraPath }}
          </option>
        </select>
        <label for="selectDevice">Device</label>
        <select name="selectDevice" id="selectDevice" v-model="projectStore.device">
          <option :value="undefined">All</option>
          <option v-for="device in projectStore.devices" :key="device" :value="device">
            {{ device }}
          </option>
        </select>
        <label for="selectViewport">Viewport</label>
        <select name="selectViewport" id="selectViewport" v-model="projectStore.viewport">
          <option :value="undefined">All</option>
          <option v-for="viewport in projectStore.viewports" :key="viewport" :value="viewport">
            {{ viewport }}
          </option>
        </select>
      </fieldset>
    </form>
  </div>
</template>

<style scoped>
form {
  display: flex;
}
</style>
