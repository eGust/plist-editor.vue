<template>
  <select
    :value="modelValue"
    @change="(ev) => $emit('update:modelValue', ev.currentTarget.value)"
  >
    <option
      v-for="opt in typeOptions"
      :key="opt"
    >
      {{ opt }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { PListDataType } from '/@lib/plist';

const TYPE_OPTIONS = Object.keys(PListDataType);

export default defineComponent({
  name: 'PListTypeDropdown',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],

  setup() {
    return { typeOptions: TYPE_OPTIONS };
  },
});
</script>
