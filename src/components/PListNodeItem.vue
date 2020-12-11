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
            @keydown.enter.stop="() => stopEditing()"
            @keydown.esc.stop="() => stopEditing({ cancel: true })"
            @change="(ev) => onRenameKey(keyName, ev.currentTarget.value)"
          >
        </DblClickEditor>
      </span>

      <span class="type">
        <span class="text">{{ node.type }}</span>
        <IconDotsCircle
          v-if="isEditable"
          class="icon"
          @click="onClickMenuIcon"
        />
        <div
          ref="refMenu"
          :class="{ block: showMenu }"
          class="menu"
          tabindex="1"
        >
          <div class="py-1">
            <a
              v-if="hasChildren"
              class="menu-item"
              @click="() => onMenuAction('addChild')"
            >Add Child</a>
            <a
              class="menu-item"
              @click="() => onMenuAction('insertBefore')"
            >Insert Before</a>
            <a
              class="menu-item"
              @click="() => onMenuAction('insertAfter')"
            >Insert After</a>
          </div>
          <div class="py-1">
            <a
              class="menu-item"
              @click="() => onMenuAction('removeSelf')"
            >Delete</a>
          </div>
          <div class="py-1">
            <a
              class="menu-item"
              @click="() => onMenuAction('moveToTop')"
            >Move to Top</a>
            <a
              class="menu-item"
              @click="() => onMenuAction('moveToBottom')"
            >Move to Bottom</a>
            <a
              class="menu-item"
              @click="() => onMenuAction('moveUp')"
            >Move Up</a>
            <a
              class="menu-item"
              @click="() => onMenuAction('moveDown')"
            >Move Down</a>
          </div>
        </div>
      </span>

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

import { VueComponent as IconDotsCircle } from '../icons/dots-circle-horizontal.svg';

import {
  PListDataType, PListNode, PListDictNode, PListArrayNode,
} from '/@lib/plist';

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

enum MenuAction {
  AddChild = 'addChild',
  InsertBefore = 'insertBefore',
  InsertAfter = 'insertAfter',
  RemoveSelf = 'removeSelf',
  MoveToTop = 'moveToTop',
  MoveToBottom = 'moveToBottom',
  MoveUp = 'moveUp',
  MoveDown = 'moveDown',
}

export default defineComponent({
  name: 'PListNodeItem',
  components: {
    Caret,
    DblClickEditor,
    IndentSpace,
    IconDotsCircle,
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
    const refMenu = ref<HTMLDivElement | null>(null);
    const showMenu = ref(false);

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

      const parent = props.parent as PListDictNode;
      const parentDict = parent.value;
      if (newKey in parentDict) {
        throw new Error(`Key "${newKey}" already exists`);
      }

      const map = new Map([[oldKey, newKey]]);
      parent.value = Object.fromEntries(
        Object.entries(parentDict)
          .map(([k, v]) => [
            map.get(k) || k,
            v,
          ]),
      );
    };

    const onClickMenuIcon = () => {
      if (!refMenu.value) return;

      showMenu.value = true;
      const menu = refMenu.value;
      setTimeout(() => {
        menu.focus();
        showMenu.value = false;
      }, 0);
    };

    const actionOnArray = (action: MenuAction) => {
      refMenu.value?.blur();
      const parent = props.parent as PListArrayNode;
      const parentArray = parent.value;
      const index = props.keyName as number;
      const item = node.value;

      switch (action) {
        case MenuAction.RemoveSelf: {
          parent.value = [...parentArray.slice(0, index), ...parentArray.slice(index + 1)];
          break;
        }
        case MenuAction.MoveToTop: {
          if (index === 0) return;
          parent.value = [item, ...parentArray.slice(0, index), ...parentArray.slice(index + 1)];
          break;
        }
        case MenuAction.MoveToBottom: {
          if (index === parentArray.length - 1) return;
          parent.value = [...parentArray.slice(0, index), ...parentArray.slice(index + 1), item];
          break;
        }
        case MenuAction.MoveUp: {
          if (index === 0) return;
          parent.value = [
            ...parentArray.slice(0, index - 1),
            item,
            ...parentArray.slice(index - 1, index),
            ...parentArray.slice(index + 1),
          ];
          break;
        }
        case MenuAction.MoveDown: {
          if (index === parentArray.length - 1) return;
          parent.value = [
            ...parentArray.slice(0, index),
            ...parentArray.slice(index + 1, index + 2),
            item,
            ...parentArray.slice(index + 2),
          ];
          break;
        }
        default:
          throw new Error(`Unknown action ${action}`);
      }
    };

    const actionOnDictionary = (action: MenuAction) => {
      refMenu.value?.blur();
      const parent = props.parent as PListDictNode;
      const parentDict = parent.value;
      const key = props.keyName as string;
      const item = node.value;

      switch (action) {
        case MenuAction.RemoveSelf: {
          delete parentDict[key];
          break;
        }
        case MenuAction.MoveToTop: {
          delete parentDict[key];
          parent.value = Object.fromEntries(
            [
              [key, item],
              ...Object.entries(parentDict),
            ],
          );
          break;
        }
        case MenuAction.MoveToBottom: {
          delete parentDict[key];
          parentDict[key] = item;
          break;
        }
        case MenuAction.MoveUp:
        case MenuAction.MoveDown: {
          const index = Object.keys(parentDict).indexOf(key) + (action === MenuAction.MoveUp ? -1 : 1);
          delete parentDict[key];
          const self = [key, item];
          const items = Object.entries(parentDict);
          parent.value = Object.fromEntries(
            [
              ...items.slice(0, index),
              self,
              ...items.slice(index),
            ],
          );
          break;
        }
        default:
          throw new Error(`Unknown action ${action}`);
      }
    };

    const onMenuAction = props.parent.type === PListDataType.Array ? actionOnArray : actionOnDictionary;

    return {
      collapsed,
      isEditable: editor.editable,
      isKeyEditable,
      hasChildren,
      showMenu,

      node,
      children,
      editorType,

      refInputKey,
      refMenu,

      onRenameKey,
      onToggleCollapsed,
      onClickMenuIcon,
      onMenuAction,
    };
  },
});
</script>

<style scoped>
.menu:focus {
  @apply outline-none;
}
</style>

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
      content '['
      @apply text-gray-300
    &::after
      content ']'
      @apply text-gray-300

.type
  @apply flex relative
  .text
    @apply flex-1
  svg.icon
    @apply block text-blue-800 cursor-pointer h-full
    min-width 1em
  .menu
    @apply origin-top-right absolute z-10 min-w-max
    @apply rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200
    top 0.3em
    right 0.4em
    width calc(100% - 2em)
    &:not(.block):not(:focus-within)
      @apply hidden
    .menu-item
      @apply block px-4 py-2 text-sm text-gray-700 cursor-pointer select-none min-w-min
      &:hover
        @apply bg-gray-100 text-gray-900

.value .text
  @apply whitespace-nowrap overflow-ellipsis overflow-x-hidden
</style>
