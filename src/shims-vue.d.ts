declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  const src: string;
  const VueComponent: SVGElement;

  export { VueComponent };
  export default src;
}
