<template>
  <div class="plist-editor">
    <div class="header row">
      <label class="key">Key</label>
      <label class="type">Type</label>
      <label class="value">Value</label>
    </div>

    <div
      class="items"
      @keydown="onItemsKeyDown"
    >
      <PListNodeItem
        v-for="{ key, parent, keyName } in items"
        :key="key"
        :parent="parent"
        :key-name="keyName"
      />
    </div>

    <div class="footer">
      <button
        v-if="download"
        class="success btn"
        @click="onDownload"
      >
        Download
      </button>

      <slot />

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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  provide,
  computed, reactive, ref, toRef,
  PropType,
} from 'vue';

import PListNodeItem from './PListNodeItem.vue';

import { encodePList, PListRootNode } from '/@lib/plist';
import { sleep } from '/@lib/utils';
import { PListEditorData } from './types';

const getPrevItem = ($item: HTMLDivElement): HTMLDivElement | undefined => {
  const $prev = $item.previousElementSibling;
  if ($prev) {
    const $children = $prev.querySelectorAll('section:last-of-type');
    return ($children.length ? $children[$children.length - 1] : $prev) as HTMLDivElement;
  }

  return $item.parentElement?.closest('.plist-node-item') as HTMLDivElement;
};

const getNextItem = ($item: HTMLDivElement): HTMLDivElement | undefined => {
  const $next = $item.querySelector('.children > .plist-node-item') || $item.nextElementSibling;
  if ($next) return $next as HTMLDivElement;

  for (let $current = $item, $parent = $item; $current; $current = $parent) {
    $parent = $current.parentElement?.closest('.plist-node-item') as HTMLDivElement;
    if (!$parent) return undefined;

    const $n = $parent.nextElementSibling;
    if ($n) {
      return $n as HTMLDivElement;
    }
  }
  return undefined;
};

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

    const refItems = ref<HTMLDivElement | null>(null);

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

    const onItemsKeyDown = (ev: KeyboardEvent) => {
      if (!ev.target) return;

      const $target = ev.target as HTMLDivElement;
      if (!($target.matches('.plist-node-item'))) return;

      switch (ev.code) {
        case 'ArrowUp': {
          getPrevItem($target)?.focus();
          break;
        }
        case 'ArrowDown': {
          getNextItem($target)?.focus();
          break;
        }
        case 'ArrowLeft': {
          const $caret = ($target.firstElementChild as HTMLDivElement).querySelector('.down > .caret');
          if ($caret) {
            ($caret as HTMLDivElement).click();
          } else {
            ($target.parentElement?.closest('.plist-node-item') as HTMLDivElement)?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          const $caret = ($target.firstElementChild as HTMLDivElement).querySelector('.right > .caret');
          if ($caret) {
            ($caret as HTMLDivElement).click();
          }
          break;
        }
        case 'Space': {
          // edit key
          $target.firstElementChild
            ?.querySelector?.('.key > .dbl-click-editor')
            ?.dispatchEvent(new Event('dblclick'));
          break;
        }
        case 'Tab': {
          // edit value
          $target.firstElementChild
            ?.querySelector?.('.value > .dbl-click-editor, .value > .boolean.value > .switch')
            ?.dispatchEvent(new Event('dblclick'));
          break;
        }
        default: {
          console.debug(ev);
          return;
        }
      }
      ev.preventDefault();
      ev.stopImmediatePropagation();
    };

    return {
      data,
      items,
      downloadFilename,

      refDownload,
      refItems,
      onItemsKeyDown,

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
    @apply font-mono text-sm
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
