<template>
  <div
    class="plist-node-item"
    tabindex="0"
  >
    <div class="row">
      <span class="key">
        <IndentSpace :indent="indent" />
        <Caret
          v-if="hasChildren"
          :to="statuses.collapsed ? 'right' : 'down'"
          @click="statuses.collapsed = !statuses.collapsed"
        />
        <DblClickEditor
          v-slot="{ show, stopEditing }"
          :class="parent.type.toLowerCase()"
          :text="keyName.toString()"
          :editable="isKeyEditable"
          :editor="refInputKey"
        >
          <input
            v-show="show"
            ref="refInputKey"
            type="text"
            :value="keyName"
            @keydown.esc.stop="() => stopEditing()"
            @change="(ev) => onRenameKey(keyName, ev.currentTarget.value)"
          >
        </DblClickEditor>
      </span>

      <span class="type">{{ node.type }}</span>

      <span class="value">
        <component
          :is="editorType"
          :node="node"
          :editable="isEditable"
        />
      </span>
    </div>

    <div
      v-if="hasChildren && !statuses.collapsed"
      class="children"
    >
      <PListNodeItem
        v-for="{ key, ...binds } in children"
        :key="key"
        v-bind="binds"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, computed, PropType, inject, reactive, ref,
} from 'vue';

import { PListDataType, PListNode, PListDictNode } from '/@lib/plist';

import Caret from './Caret.vue';
import DblClickEditor from './DblClickEditor.vue';
import IndentSpace from './IndentSpace.vue';

import PListValueInput from './PListValueInput.vue';
import PListValueBoolean from './PListValueBoolean.vue';
import PListValueCount from './PListValueCount.vue';
import PListValueText from './PListValueText.vue';

interface Statuses {
  collapsed: boolean;
}

const VALUE_EDITORS = {
  PListValueInput,
  PListValueBoolean,
  PListValueCount,
  PListValueText,
};

type PListValueEditor = keyof typeof VALUE_EDITORS;

const NODE_TYPE_EDITORS: Record<PListDataType, PListValueEditor> = {
  [PListDataType.String]: 'PListValueText',
  [PListDataType.Data]: 'PListValueText',
  [PListDataType.Number]: 'PListValueInput',
  [PListDataType.Date]: 'PListValueInput',
  [PListDataType.Boolean]: 'PListValueBoolean',
  [PListDataType.Array]: 'PListValueCount',
  [PListDataType.Dictionary]: 'PListValueCount',
};

export default defineComponent({
  name: 'PListNodeItem',
  components: {
    Caret,
    DblClickEditor,
    IndentSpace,
    ...VALUE_EDITORS,
  },
  props: {
    parent: {
      type: Object as PropType<PListNode>,
      required: true,
    },
    keyName: {
      type: [Number, String],
      required: true,
    },
    indent: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    const statuses = reactive<Statuses>({
      collapsed: true,
    });

    const refInputKey = ref<HTMLInputElement | null>(null);

    const isEditable = inject('plistEditable', false);

    const isKeyEditable = computed(() => isEditable && props.parent.type === PListDataType.Dictionary);

    const node = computed(() => {
      switch (props.parent.type) {
        case PListDataType.Array: {
          return props.parent.value[props.keyName as number];
        }
        case PListDataType.Dictionary: {
          return props.parent.value[props.keyName as string];
        }
        default:
          throw Error(`Unsupported type ${props.parent.type}`);
      }
    });

    const hasChildren = computed(() => {
      const { type } = node.value;
      return type === PListDataType.Array || type === PListDataType.Dictionary;
    });

    const children = computed(() => {
      if (!hasChildren.value) return [];

      const binds = {
        parent: node.value,
        indent: props.indent + 1,
      };
      switch (node.value.type) {
        case PListDataType.Array: {
          return node.value.value.map((child, keyName) => ({
            key: child._id, // eslint-disable-line no-underscore-dangle
            keyName,
            ...binds,
          }));
        }
        case PListDataType.Dictionary: {
          return Object.entries(node.value.value).map(([keyName, child]) => ({
            key: child._id, // eslint-disable-line no-underscore-dangle
            keyName,
            ...binds,
          }));
        }
        default:
          throw Error(`Invalid node to contain children: ${node.value.type}`);
      }
    });

    const editorType = computed(() => NODE_TYPE_EDITORS[node.value.type]);

    const onRenameKey = (oldKey: string, newKey: string) => {
      const parent = (props.parent as PListDictNode);
      const child = parent.value[oldKey];
      delete parent.value[oldKey];
      parent.value[newKey] = child;
    };

    return {
      statuses,

      isEditable,
      isKeyEditable,
      hasChildren,

      node,
      children,
      editorType,

      refInputKey,

      onRenameKey,
    };
  },
});
</script>

<style lang="stylus">
.plist-node-item:focus
  @apply bg-blue-50
  outline-style dotted
  & > .row
    @apply bg-blue-300

.key
  @apply whitespace-pre-line
  .array
    @apply text-purple-700
    &::before
      content: '['
      @apply text-gray-300
    &::after
      content: ']'
      @apply text-gray-300
</style>
