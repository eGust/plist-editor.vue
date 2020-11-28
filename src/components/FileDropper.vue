<template>
  <div
    class="file-dropper"
    :class="{ dragging }"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover.prevent.stop="onDragOver"
    @drop.prevent.stop="onDrop"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'FileDropper',
  emits: ['dropFile'],

  setup(_, { emit }) {
    const dragging = ref(false);

    const onDragEnter = () => {
      dragging.value = true;
    };

    const onDragLeave = () => {
      dragging.value = false;
    };

    const onDragOver = (ev: DragEvent) => {
      dragging.value = true;
      if (ev.dataTransfer) {
        // eslint-disable-next-line no-param-reassign
        ev.dataTransfer.dropEffect = 'copy';
      }
    };

    const onDrop = (ev: DragEvent) => {
      dragging.value = false;
      if (!ev.dataTransfer) return;

      emit('dropFile', ev.dataTransfer.files[0]);
    };

    return {
      dragging,
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop,
    };
  },
});

</script>

<style lang="stylus" scoped>
.file-dropper
  @apply flex flex-1 m-3 p-2 border-4 border-dashed border-gray-200 rounded-xl justify-center items-center
.dragging
  @apply bg-blue-100 border-4 border-dashed border-blue-500
</style>
