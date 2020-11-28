<template>
  <span class="value boolean">
    <span
      class="switch"
      @dblclick="onToggle"
    >
      <input
        type="checkbox"
        class="hidden"
        :checked="node.value"
      >
      <span class="bar" />
      <span class="button" />
    </span>
    <span class="text">
      {{ node.value ? 'True' : 'False' }}
    </span>
  </span>
</template>

<script lang="ts">
import {
  defineComponent, PropType,
} from 'vue';

import { PListBooleanNode } from '/@lib/plist';

export default defineComponent({
  name: 'PListValueString',
  props: {
    node: {
      type: Object as PropType<PListBooleanNode>,
      required: true,
    },
    editable: Boolean,
  },

  setup(props) {
    const onToggle = () => {
      if (!props.editable) return;

      const { node } = props;
      node.value = !node.value;
    };

    return { onToggle };
  },
});
</script>

<style lang="stylus" scoped>
.value.boolean
  @apply flex items-center

.switch
  @apply relative cursor-pointer
  width 3em
  height 1.5em

.bar
  @apply inline-block bg-gray-400 rounded-full shadow-inner
  width 2.6em
  height 1.5em

.button
  @apply absolute bg-gray-300 rounded-full
  width 1.2em
  height 1.2em
  top 0.15em
  left 0.1em
  transition all 0.3s ease-in-out

.text
  @apply ml-1

input:checked ~ .bar
  @apply bg-green-400

input:checked ~ .button
  @apply bg-gray-50
  transform translateX(100%)
</style>
