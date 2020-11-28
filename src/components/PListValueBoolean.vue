<template>
  <span class="value boolean">
    <span
      class="toggler"
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

.toggler
  @apply relative cursor-pointer
  width 3em
  height 1em

.bar
  @apply inline-block bg-gray-400 rounded-full shadow-inner
  width 2.5em
  height 1em

.button
  @apply absolute bg-gray-600 rounded-full shadow inset-y-0 left-0
  width 1.5em
  height 1.5em
  top -0.15em
  left -0.25em
  transition all 0.3s ease-in-out

.text
  margin-left 0.3em

input:checked ~ .button
  transform translateX(100%)
  background-color #48bb78
</style>
