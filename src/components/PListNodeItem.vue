<template>
  <section
    class="plist-node-item"
    tabindex="0"
  >
    <div class="row">
      <span class="key">
        <IndentSpace :indent="indent" />
        <Caret
          v-if="hasChildren"
          :to="collapsed ? 'right' : 'down'"
          @click="onToggleCollapsed"
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
      v-if="hasChildren && !collapsed"
      class="children"
    >
      <PListNodeItem
        v-for="{ key, ...binds } in children"
        :key="key"
        v-bind="binds"
      />
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent, computed, PropType, inject, ref,
} from 'vue';

import { PListDataType, PListNode, PListDictNode } from '/@lib/plist';

import Caret from './Caret.vue';
import DblClickEditor from './DblClickEditor.vue';
import IndentSpace from './IndentSpace.vue';

import PListValueInput from './PListValueInput.vue';
import PListValueBoolean from './PListValueBoolean.vue';
import PListValueCount from './PListValueCount.vue';
import PListValueText from './PListValueText.vue';
import { PListEditorData } from './types';

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
    const refInputKey = ref<HTMLInputElement | null>(null);

    const editor = inject<PListEditorData>('plistEditorData') as PListEditorData;

    const isKeyEditable = computed(() => editor.editable && props.parent.type === PListDataType.Dictionary);

    const node = computed(() => {
      switch (props.parent.type) {
        case PListDataType.Array: {
          return props.parent.value[props.keyName as number];
        }
        case PListDataType.Dictionary: {
          return props.parent.value[props.keyName as string];
        }
        default:
          throw new Error(`Unsupported type ${props.parent.type}`);
      }
    });

    const collapsed = computed(() => !editor.expanded.get(node.value.id));

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
            key: child.id,
            keyName,
            ...binds,
          }));
        }
        case PListDataType.Dictionary: {
          return Object.entries(node.value.value).map(([keyName, child]) => ({
            key: child.id,
            keyName,
            ...binds,
          }));
        }
        default:
          throw new Error(`Invalid node to contain children: ${node.value.type}`);
      }
    });

    const editorType = computed(() => NODE_TYPE_EDITORS[node.value.type]);

    const onToggleCollapsed = () => {
      editor.expanded.set(node.value.id, collapsed.value);
    };

    const onRenameKey = (oldKey: string, newKey: string) => {
      if (oldKey === newKey) return;
      const parentDict = (props.parent as PListDictNode).value;
      if (newKey in parentDict) {
        throw new Error(`Key "${newKey}" already exists`);
      }

      const child = parentDict[oldKey];
      delete parentDict[oldKey];
      parentDict[newKey] = child;
    };

    return {
      collapsed,
      isEditable: editor.editable,
      isKeyEditable,
      hasChildren,

      node,
      children,
      editorType,

      refInputKey,

      onRenameKey,
      onToggleCollapsed,
    };
  },
});
</script>

<style lang="stylus">
.plist-node-item:focus
  @apply bg-blue-50
  outline-style dotted
  & > .row
    @apply bg-blue-200
    *::selection
      @apply text-blue-50 bg-blue-800

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
