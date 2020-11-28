<template>
  <DblClickEditor
    v-slot="{ show, stopEditing }"
    :text="node.value"
    :editable="editable"
    :editor="refEditor"
  >
    <textarea
      v-show="show"
      ref="refEditor"
      :rows="rows"
      :value="node.value"
      @keydown.esc.stop="() => stopEditing()"
      @change="onChange"
    />
  </DblClickEditor>
</template>

<script lang="ts">
import {
  computed, defineComponent, PropType, ref,
} from 'vue';

import DblClickEditor from './DblClickEditor.vue';

import {
  PListDataNode,
  PListStringNode,
} from '/@lib/plist';

export default defineComponent({
  name: 'PListValueText',
  components: { DblClickEditor },
  props: {
    node: {
      type: Object as PropType<PListStringNode | PListDataNode>,
      required: true,
    },
    editable: Boolean,
  },

  setup(props) {
    const refEditor = ref<HTMLInputElement | null>(null);

    const rows = computed(() => (props.node.value.includes('\n') ? 3 : 1));

    const onChange = (ev: Event) => {
      const { value } = ev.currentTarget as HTMLInputElement;
      // eslint-disable-next-line vue/no-mutating-props
      props.node.value = value; // eslint-disable-line no-param-reassign
    };

    return { refEditor, rows, onChange };
  },
});
</script>

<style lang="stylus" scoped>
textarea
  @apply px-1 w-full
</style>
