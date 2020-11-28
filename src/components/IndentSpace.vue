<template>
  <span>
    <span
      v-for="i in indent"
      :key="i"
      class="indent"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndentSpace',
  props: {
    indent: {
      type: Number,
      default: 0,
    },
  },
});
</script>

<style lang="stylus" scoped>
span
  display inline-block
.indent
  width 1.6em
</style>
