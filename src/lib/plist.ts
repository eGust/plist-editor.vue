import { isInteger } from './utils';

export enum PListDataType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
  Data = 'Data',
  Array = 'Array',
  Dictionary = 'Dictionary',
}

interface WithInternalId {
  id: number;
}

export type PListValueType = null
  | string | number | boolean | Date | ArrayBufferLike
  | PListNode[] // eslint-disable-line no-use-before-define
  | Record<string, PListNode>; // eslint-disable-line no-use-before-define

export interface PListStringNode {
  type: PListDataType.String;
  value: string;
}

export interface PListNumberNode {
  type: PListDataType.Number;
  value: number;
}

export interface PListBooleanNode {
  type: PListDataType.Boolean;
  value: boolean;
}

export interface PListDateNode {
  type: PListDataType.Date;
  value: Date;
}

export interface PListDataNode {
  type: PListDataType.Data;
  value: string;
}

export interface PListArrayNode {
  type: PListDataType.Array;
  value: PListNode[]; // eslint-disable-line no-use-before-define
}

export interface PListDictNode {
  type: PListDataType.Dictionary;
  value: Record<string, PListNode>; // eslint-disable-line no-use-before-define
}

export type PListNode = (
  PListStringNode |
  PListNumberNode |
  PListBooleanNode |
  PListDateNode |
  PListDataNode |
  PListArrayNode |
  PListDictNode
) & WithInternalId;

const xmlParser = new DOMParser();

export const parseXml = (xml: string): Document => (
  xmlParser.parseFromString(xml, 'text/xml')
);

const xmlEscape = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <node></node>
</plist>`);

const xmlEscapeNode = xmlEscape.children[0].children[0];

export const escapeXml = (s: string): string => {
  xmlEscapeNode.textContent = s;
  return xmlEscapeNode.innerHTML.replace(/(\r\n|\n)/g, '&#13;').replace(/\t/g, '&#9;');
};

class IdAllocator {
  private prevValue = 0;

  public get nextValue(): number {
    this.prevValue += 1;
    return this.prevValue;
  }

  public newItem<T>(x: T): T & WithInternalId {
    return { ...x, id: this.nextValue };
  }
}

export interface PListRootNode extends PListDictNode, WithInternalId {
  allocator: IdAllocator;
}

const parsePListValue = (value: Element, allocator: IdAllocator): PListNode => {
  switch (value.tagName) {
    case 'string':
      return allocator.newItem({
        type: PListDataType.String,
        value: value.textContent || '',
      });
    case 'integer':
    case 'real':
      return allocator.newItem({
        type: PListDataType.Number,
        value: Number.parseFloat(value.textContent || '0'),
      });
    case 'true':
      return allocator.newItem({
        type: PListDataType.Boolean,
        value: true,
      });
    case 'false':
      return allocator.newItem({
        type: PListDataType.Boolean,
        value: false,
      });
    case 'date':
      return allocator.newItem({
        type: PListDataType.Date,
        value: new Date(value.textContent || ''),
      });
    case 'data':
      return allocator.newItem({
        type: PListDataType.Data,
        value: atob(value.textContent || ''),
      });
    case 'array':
      return allocator.newItem({
        type: PListDataType.Array,
        value: Array.from(value.children).map((n) => parsePListValue(n, allocator)),
      });
    case 'dict':
      return allocator.newItem({
        type: PListDataType.Dictionary,
        value: parsePListDictValue(value, allocator), // eslint-disable-line no-use-before-define
      });
    default:
      throw new Error(`Unknown type: '${value.tagName}'`);
  }
};

const parsePListDictValue = (node: Element, allocator: IdAllocator): Record<string, PListNode> => {
  const r: Record<string, PListNode> = {};
  const { children } = node;
  for (let i = 0; i < node.childElementCount; i += 2) {
    const key = children[i];
    const value = children[i + 1];
    r[key.textContent?.trim() || ''] = parsePListValue(value, allocator);
  }
  return r;
};

const parsePListDocument = (rootDict: Element): PListRootNode => {
  const allocator = new IdAllocator();
  return allocator.newItem({
    type: PListDataType.Dictionary,
    value: parsePListDictValue(rootDict, allocator),
    allocator,
  });
};

export const parsePList = (plist: string): PListRootNode => {
  const xml = parseXml(plist);
  const root = xml.documentElement;
  if (!(root.tagName === 'plist'
      && root.getAttribute('version') === '1.0'
      && root.childElementCount === 1
      && root.children[0].tagName === 'dict')) {
    throw new Error('Invalid format');
  }

  return parsePListDocument(root.children[0]);
};

const indentFnCache: Record<number, (s: string) => string> = {};

const withIndent = (indent: number, str: string): string => {
  if (!(indent in indentFnCache)) {
    indentFnCache[indent] = (() => {
      const strIndent = (new Array(indent)).fill('\t').join('');
      return (s: string) => `${strIndent}${s}`;
    })();
  }
  return indentFnCache[indent](str);
};

const encodeKey = (indent: number, key: string): string => withIndent(
  indent,
  `<key>${escapeXml(key)}</key>`,
);

const encodePListNode = (node: Omit<PListNode, keyof WithInternalId>, indent = 0): string => {
  switch (node.type) {
    case PListDataType.String: {
      const n = node as PListStringNode;
      return withIndent(indent, `<string>${escapeXml(n.value)}</string>`);
    }
    case PListDataType.Number: {
      const n = node as PListNumberNode;
      const tag = isInteger(n.value) ? 'integer' : 'real';
      return withIndent(indent, `<${tag}>${escapeXml(n.value.toString(10))}</${tag}>`);
    }
    case PListDataType.Boolean: {
      return withIndent(indent, node.value ? '<true/>' : '<false/>');
    }
    case PListDataType.Date: {
      const n = node as PListDateNode;
      return withIndent(indent, `<date>${escapeXml(n.value.toISOString())}</date>`);
    }
    case PListDataType.Data: {
      const n = node as PListDataNode;
      return withIndent(indent, `<data>${btoa(n.value as string)}</data>`);
    }
    case PListDataType.Array: {
      const n = node as PListArrayNode;
      const curIndent = indent + 1;
      const nodes = n.value.map((value) => encodePListNode(value, curIndent));

      return [
        withIndent(indent, '<array>'),
        ...nodes,
        withIndent(indent, '</array>'),
      ].join('\n');
    }
    case PListDataType.Dictionary: {
      const n = node as PListDictNode;
      const curIndent = indent + 1;
      const nodes = Object.entries(n.value)
        .map(([key, value]) => [
          encodeKey(curIndent, key),
          encodePListNode(value, curIndent),
        ])
        .flatMap((x) => x);

      return [
        withIndent(indent, '<dict>'),
        ...nodes,
        withIndent(indent, '</dict>'),
      ].join('\n');
    }
    default:
      throw new Error(`Unknown type ${node.type}`);
  }
};

export const encodePList = (root: PListRootNode): string => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
${encodePListNode(root)}
</plist>
`;
