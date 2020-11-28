<template>
  <span
    class="value boolean"
    @dblclick="onToggle"
  >
    <input
      type="checkbox"
      class="hidden"
      :checked="modelValue"
    >
    <span class="button" />
    <span class="bar" />
    <span class="text">
      {{ modelValue ? 'True' : 'False' }}
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'Toggle',
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue', 'onSetRefInput'],

  setup(props, context) {
    const refInput = ref<HTMLInputElement | null>(null);

    watch(refInput, ($input) => {
      context.emit('onSetRefInput', $input);
    });

    const onToggle = () => {
      context.emit('update:modelValue', !props.modelValue);
    };

    return { onToggle };
  },
});
</script>

<style lang="stylus" scoped>
.value.boolean
  @apply flex items-center cursor-pointer relative

.bar
  @apply w-10 h-4 bg-gray-400 rounded-full shadow-inner

.button
  @apply absolute w-6 h-6 bg-gray-600 rounded-full shadow inset-y-0 left-0
  top -0.15em;
  left -0.25em;
  transition all 0.3s ease-in-out

.text
  @apply ml-2

input:checked ~ .button
  transform translateX(100%)
  background-color #48bb78
</style>
