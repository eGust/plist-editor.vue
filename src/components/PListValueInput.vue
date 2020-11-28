<template>
  <DblClickEditor
    v-slot="{ show, stopEditing }"
    class="value number"
    :text="node.value.toString()"
    :editable="editable"
    :editor="refEditor"
  >
    <input
      v-show="show"
      ref="refEditor"
      v-bind="inputAttrs"
      :value="node.value"
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

    const inputAttrs = computed(() => {
      switch (props.node.type) {
        case PListDataType.Number:
          return {
            type: 'number',
          };
        case PListDataType.Date:
          return {
            type: 'datetime-local',
            step: 1,
          };
        default:
          throw Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
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
          throw Error(`Unknown type: ${(props.node as PListNumberNode).type}`);
      }
    };

    return { refEditor, inputAttrs, onChange };
  },
});
</script>
