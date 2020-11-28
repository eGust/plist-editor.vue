<template>
  <DblClickEditor
    v-slot="{ show, stopEditing }"
    class="value number"
    :text="text"
    :editable="editable"
    :editor="refEditor"
  >
    <input
      v-show="show"
      ref="refEditor"
      v-bind="inputAttrs"
      :value="inputValue"
      @keydown.esc.stop="() => stopEditing()"
      @change="onChange"
    >
  </DblClickEditor>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType, ref,
} from 'vue';

import DblClickEditor from './DblClickEditor.vue';

import { PListDataType, PListDateNode, PListNumberNode } from '/@lib/plist';

const LOCAL_DATE_ISO_FORMAT = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });

const LOCAL_TIME_ISO_FORMAT = new Intl.DateTimeFormat('en-GB', {
  hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
});

const toLocalDateISO = (date: Date): string => LOCAL_DATE_ISO_FORMAT.format(date).replace(/\//g, '-');

const toLocalTimeISO = (time: Date): string => LOCAL_TIME_ISO_FORMAT.format(time);

export default defineComponent({
  name: 'PListValueString',
  components: { DblClickEditor },
  props: {
    node: {
      type: Object as PropType<PListNumberNode | PListDateNode>,
      required: true,
    },
    editable: Boolean,
  },

  setup(props) {
    const refEditor = ref<HTMLInputElement | null>(null);

    const text = computed(() => {
      switch (props.node.type) {
        case PListDataType.Number: {
          const n = props.node.value;
          return n.toString();
        }
        case PListDataType.Date: {
          const dt = props.node.value;
          return `${dt.toLocaleString()} (${dt.toISOString()})`;
        }
        default:
          throw new Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
      }
    });

    const inputValue = computed(() => {
      switch (props.node.type) {
        case PListDataType.Number: {
          return props.node.value.toString();
        }
        case PListDataType.Date: {
          const dt = props.node.value;
          return `${toLocalDateISO(dt)}T${toLocalTimeISO(dt)}`;
        }
        default:
          throw new Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
      }
    });

    const inputAttrs = computed(() => {
      switch (props.node.type) {
        case PListDataType.Number:
          return {
            type: 'number',
          };
        case PListDataType.Date:
          return {
            // https://developer.mozilla.org/docs/Web/HTML/Element/input/datetime-local#Browser_compatibility
            // unsupported by desktop Firefox/Safari
            type: 'datetime-local',
            step: 1,
          };
        default:
          throw new Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
      }
    });

    const onChange = (ev: Event) => {
      const { value } = ev.currentTarget as HTMLInputElement;
      const { node } = props;

      switch (props.node.type) {
        case PListDataType.Number: {
          node.value = Number.parseFloat(value);
          break;
        }
        case PListDataType.Date: {
          node.value = new Date(value);
          break;
        }
        default:
          throw new Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
      }
    };

    return {
      refEditor,
      text,
      inputValue,
      inputAttrs,
      onChange,
    };
  },
});
</script>
