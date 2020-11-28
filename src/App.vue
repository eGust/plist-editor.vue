<template>
  <main class="m-3">
    <label class="btn">
      Select .plist file ...
      <input
        class="hidden"
        type="file"
        @change="onSelectedFile"
      >
    </label>

    <PListEditor
      v-if="data.root"
      :plist="data.root"
      downloadable
      editable
    />
  </main>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';

import PListEditor from './components/PListEditor.vue';

import { parsePList, PListRootNode, escapeXml } from '/@lib/plist';

interface ComponentData {
  root: null | PListRootNode;
  plist: string;
}

export default defineComponent({
  name: 'App',
  components: { PListEditor },

  setup() {
    const data = reactive<ComponentData>({
      root: null,
      plist: '',
    });

    const onSelectedFile = async (ev: Event) => {
      const $input = ev.currentTarget as HTMLInputElement;
      const plistFile = $input.files?.[0];
      if (!plistFile) {
        data.root = null;
        return;
      }

      const plist = await plistFile.text();
      const root = parsePList(plist);

      data.root = root;
      data.plist = plist;
      Object.assign(window, { root, plist, escapeXml });
    };

    return {
      data,
      onSelectedFile,
    };
  },
});
</script>
