<template>
  <main>
    <div
      v-if="data.root"
      class="editor"
    >
      <h1>Property List Editor</h1>
      <PListEditor
        editable
        :plist="data.root"
        download="config.plist"
      >
        <button
          class="close btn"
          @click="onClickClose"
        >
          Close
        </button>
      </PListEditor>
    </div>

    <FileDropper
      v-else
      @dropFile="onDropFile"
    >
      <button
        class="open btn"
        autofocus
        @click="onClickOpen"
      >
        Select .plist file ...
        <input
          ref="refInputFile"
          type="file"
          class="hidden"
          @change="onSelectedFile"
        >
      </button>
    </FileDropper>
  </main>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

import FileDropper from './components/FileDropper.vue';
import PListEditor from './components/PListEditor.vue';

import { parsePList, PListRootNode } from '/@lib/plist';

interface ComponentData {
  root: null | PListRootNode;
  plist: string;
}

export default defineComponent({
  name: 'App',
  components: { PListEditor, FileDropper },

  setup() {
    const refInputFile = ref<HTMLInputElement | null>(null);

    const data = reactive<ComponentData>({
      root: null,
      plist: '',
    });

    const onClickOpen = () => {
      if (!refInputFile.value) return;

      refInputFile.value.click();
    };

    const onClickClose = () => {
      data.root = null;
      if (!refInputFile.value) return;

      refInputFile.value.value = '';
    };

    const openFile = async (file: File) => {
      const plist = await file.text();
      try {
        const root = parsePList(plist);

        data.root = root;
        data.plist = plist;
      } catch (e) {
        console.error(e);
        onClickClose();
      }
    };

    const onDropFile = openFile;

    const onSelectedFile = (ev: Event) => {
      const $input = ev.currentTarget as HTMLInputElement;
      const plistFile = $input.files?.[0];
      if (!plistFile) {
        return;
      }

      openFile(plistFile);
    };

    return {
      data,
      refInputFile,
      onDropFile,
      onSelectedFile,
      onClickOpen,
      onClickClose,
    };
  },
});
</script>

<style lang="stylus">
main
  @apply relative overflow-hidden flex
  width 100vw
  height 100vh

  h1
    @apply text-center font-bold text-2xl py-3 border-b border-indigo-100

  .editor
    @apply flex flex-col m-3 w-full relative
    & > .plist-editor
      @apply flex-1 flex flex-col relative overflow-hidden
      & > .items
        @apply flex-1 overflow-x-hidden overflow-y-auto
      & > .footer
        @apply flex pt-3 justify-evenly border-t border-indigo-100
        .btn
          width 8em

  .open.btn
    @apply rounded-2xl text-gray-50 bg-purple-700 text-4xl px-20 py-10

  .close.btn
    @apply border border-purple-300 ml-3 text-purple-700
</style>
