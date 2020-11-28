<template>
  <span class="value array">
    ({{ Object.values(node.value).length }} items ...)
  </span>
</template>

<script lang="ts">
import {
  defineComponent, PropType,
} from 'vue';

import { PListArrayNode } from '/@lib/plist';

export default defineComponent({
  name: 'PListValueCount',
  props: {
    node: {
      type: Object as PropType<PListArrayNode>,
      required: true,
    },
    editable: Boolean,
  },
});
</script>

<style lang="stylus" scoped>
.value
  @apply select-none text-gray-500
</style>
