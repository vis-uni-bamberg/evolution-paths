<script>
import {useProjectStore} from "../stores/project";

export default {
  setup() {
    const projectStore = useProjectStore();
    return {projectStore};
  },
  computed: {
    file: {
      get() {
        return this.projectStore.file;
      },
      set(val) {
        this.projectStore.setFile(val);
      }
    }
  }
};
</script>

<template>
  <div id="dod">
    <form>
      <fieldset>
        <legend>Select Project and Dataset</legend>
        <label for="file">File</label>
        <select name="file" id="file-select" v-model="file">
          <option v-for="file in projectStore.files" :key="file" :value="file">
            {{ file }}
          </option>
        </select>
      </fieldset>
    </form>
    <h2>UMAP Parameters</h2>
    <p>
      This was generated with
      <a
        href="https://umap-learn.readthedocs.io/en/latest/parameters.html#metric"
        target="_blank"
        rel="noopener noreferrer"
        >metric</a
      >
      = <tt>{{ projectStore.umap_params.metric }}</tt
      >,
      <a
        href="https://umap-learn.readthedocs.io/en/latest/parameters.html#n-neighbors"
        target="_blank"
        rel="noopener noreferrer"
        >n_neighbors</a
      >
      = <tt>{{ projectStore.umap_params.n_neighbors }}</tt
      >,
      <a
        href="https://umap-learn.readthedocs.io/en/latest/parameters.html#min-dist"
        target="_blank"
        rel="noopener noreferrer"
        >min_dist</a
      >
      = <tt>{{ projectStore.umap_params.min_dist }}</tt
      >,
      <a
        href="https://umap-learn.readthedocs.io/en/latest/parameters.html#min-dist"
        target="_blank"
        rel="noopener noreferrer"
        >spread</a
      >
      = <tt>{{ projectStore.umap_params.spread }}</tt>
      .
    </p>
  </div>
</template>
