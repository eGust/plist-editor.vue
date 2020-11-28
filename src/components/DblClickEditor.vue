<template>
  <span
    class="wrap"
    :class="{ readonly: !editable }"
    @dblclick="onStartEditing"
  >
    <slot
      v-if="editable"
      :show="isEditing"
      :stopEditing="onStopEditing"
    />
    <span
      v-show="!isEditing"
      class="text w-full"
    >{{ text }}</span>
  </span>
</template>

<script lang="ts">
import {
  defineComponent, PropType, Ref, ref, toRef, watch,
} from 'vue';
import { sleep } from '/@lib/utils';

export default defineComponent({
  name: 'DblClickEditor',
  props: {
    editor: {
      type: Object as PropType<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>,
      default: null,
    },
    text: {
      type: String,
      required: true,
    },
    editable: Boolean,
  },

  setup(props) {
    const refEditor = toRef(props, 'editor');

    const isEditing = ref(false);

    const onStopEditing = () => {
      isEditing.value = false;
    };

    watch(refEditor as Ref<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>, ($editor, $old) => {
      if ($old) {
        $old.removeEventListener('blur', onStopEditing);
        $old.removeEventListener('change', onStopEditing);
      }

      if ($editor) {
        $editor.addEventListener('change', onStopEditing);
        $editor.addEventListener('blur', onStopEditing);
      }
    }, { immediate: true });

    const onStartEditing = async () => {
      if (!(props.editable && refEditor.value)) return;

      isEditing.value = true;
      await sleep();

      refEditor.value.focus();
      if (!(refEditor.value instanceof HTMLSelectElement)) {
        refEditor.value.select();
      }
    };

    return {
      isEditing, refEditor, onStartEditing, onStopEditing,
    };
  },
});
</script>

<style lang="stylus" scoped>
.wrap
  @apply flex flex-row

  & > *
    @apply flex-auto

  &.readonly
    @apply cursor-default select-none
</style>
