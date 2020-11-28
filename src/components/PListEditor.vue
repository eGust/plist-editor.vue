<template>
  <div class="plist-editor">
    <div class="row header">
      <label class="key">Key</label>
      <label class="type">Type</label>
      <label class="value">Value</label>
    </div>

    <div class="items">
      <PListNodeItem
        v-for="{ key, parent, keyName } in items"
        :key="key"
        :parent="parent"
        :key-name="keyName"
      />
    </div>

    <button
      v-if="download"
      class="btn"
      @click="onDownload"
    >
      Download
    </button>

    <div class="hidden">
      <a
        ref="refDownload"
        :href="data.urlConfigPlist"
        :download="downloadFilename"
      >
        Download
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType, provide, reactive, ref, toRef,
} from 'vue';

import PListNodeItem from './PListNodeItem.vue';

import { encodePList, PListRootNode } from '/@lib/plist';
import { sleep } from '/@lib/utils';
import { PListEditorData } from './types';

export default defineComponent({
  name: 'PListEditor',
  components: { PListNodeItem },
  props: {
    plist: {
      type: Object as PropType<PListRootNode>,
      required: true,
    },
    editable: Boolean,
    download: {
      type: [Boolean, String],
      default: false,
    },
  },

  setup(props) {
    const data = reactive({
      urlConfigPlist: '',
    });

    provide<PListEditorData>('plistEditorData', reactive({
      editable: props.editable || false,
      expanded: new Map(),
    }));

    const refDownload = ref<HTMLAnchorElement | null>(null);

    const plistRoot = toRef(props, 'plist');

    const downloadFilename = computed(() => {
      if (!props.download) return false;
      if (props.download === true) return '*.plist';
      return props.download;
    });

    const items = computed(() => Object.entries(plistRoot.value.value)
      .map(([name, node]) => ({
        key: node.id,
        parent: plistRoot.value,
        keyName: name,
      })));

    const onDownload = async () => {
      if (data.urlConfigPlist) {
        URL.revokeObjectURL(data.urlConfigPlist);
        data.urlConfigPlist = '';
      }

      const plist = encodePList(props.plist);
      if (process.env.NODE_ENV === 'development') {
        console.debug(plist);
      }

      const blob = new Blob([plist], { type: 'octet/stream' });
      data.urlConfigPlist = URL.createObjectURL(blob);

      await sleep();
      if (!refDownload.value) return;

      refDownload.value.click();
      await sleep(1000);
    };

    return {
      data,
      items,
      downloadFilename,
      refDownload,
      onDownload,
    };
  },
});
</script>

<style lang="stylus">
.plist-editor
  @apply w-full
  .header
    @apply sticky top-0 text-center font-semibold mt-1

  .items
    @apply font-mono text-sm mb-2
    .row > span:not(:first-child)
      @apply border-l border-gray-200
    select
      @apply w-full

  .row
    @apply grid grid-cols-12 border-b border-gray-300
    & > span, & > label
      @apply px-2 py-1
    .type
      @apply col-span-2 cursor-default
    .key, .value
      @apply col-span-5

  .items .row > .key
    @apply flex flex-row items-stretch
    & > *
      @apply flex-grow-0 flex-shrink-0
    & > .dictionary
      @apply flex-auto cursor-text
</style>
