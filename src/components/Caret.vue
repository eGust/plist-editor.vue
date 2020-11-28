<template>
  <span :class="to">
    <span class="caret" />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'Caret',
  props: {
    to: {
      type: String as PropType<'down' | 'right'>,
      default: 'down',
    },
  },
});
</script>

<style lang="stylus" scoped>
span
  display inline-block
  cursor pointer
  width 1em
  height 1em

.caret
  width 0
  height 0
  border 0.4em solid transparent

span.right
  text-align right
  & > .caret
    border-left-color #78716C

span.down > .caret
  border-top-color #78716C
  vertical-align bottom
</style>
