<template>
  <div class="plist-editor container">
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
      v-if="downloadable"
      class="btn"
      @click="onDownload"
    >
      Download
    </button>

    <div class="hidden">
      <a
        ref="refDownload"
        :href="data.urlConfigPlist"
        download="config.plist"
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

export default defineComponent({
  name: 'PListEditor',
  components: { PListNodeItem },
  props: {
    plist: {
      type: Object as PropType<PListRootNode>,
      required: true,
    },
    editable: Boolean,
    downloadable: Boolean,
  },

  setup(props) {
    const data = reactive({
      urlConfigPlist: '',
    });

    provide('plistEditable', props.editable || false);

    const refDownload = ref<HTMLAnchorElement | null>(null);

    const plistRoot = toRef(props, 'plist');

    const items = computed(() => Object.entries(plistRoot.value.value)
      .map(([name, node]) => ({
        key: node._id, // eslint-disable-line no-underscore-dangle
        parent: plistRoot.value,
        keyName: name,
      })));

    const onDownload = async () => {
      if (data.urlConfigPlist) {
        URL.revokeObjectURL(data.urlConfigPlist);
        data.urlConfigPlist = '';
      }

      const plist = encodePList(props.plist);
      console.log(plist);
      if (process.env.NODE_ENV === 'development') {
        // return;
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
      refDownload,
      onDownload,
    };
  },
});
</script>
