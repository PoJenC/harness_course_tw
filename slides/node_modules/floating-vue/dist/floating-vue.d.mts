import { PropType, Ref } from "vue";
import { Placement as Placement$1, computePosition } from "@floating-ui/dom";
//#region src/directives/v-tooltip.d.ts
export declare function createTooltip(el: any, value: any, modifiers: any): {
  options: Ref<any, any>;
  item: {
    id: number;
    options: Ref<any, any>;
    shown: Ref<boolean, boolean>;
  };
  show(): void;
  hide(): void;
};
export declare function destroyTooltip(el: any): void;
declare function bind(el: any, { value, modifiers }: {
  value: any;
  modifiers: any;
}): void;
export declare const vTooltip: {
  beforeMount: typeof bind;
  updated: typeof bind;
  beforeUnmount(el: any): void;
};
//#endregion
//#region src/config.d.ts
type FloatingVueConfig = any;
//#endregion
//#region src/util/popper.d.ts
type Placement = Placement$1 | 'auto' | 'auto-start' | 'auto-end';
export declare const placements: Placement[];
//#endregion
//#region src/components/PopperWrapper.d.ts
type TriggerEvent = 'hover' | 'click' | 'focus' | 'touch';
declare const PopperWrapper: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: PropType<Placement>;
    default: any;
  };
  delay: {
    type: PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  /**
   * @deprecated
   */
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: PropType<boolean | "min" | "max">;
    default: any;
  };
  /**
   * @deprecated
   */
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>, {}, {}, {
  finalTheme(): string;
}, {
  getTargetNodes(): unknown[];
}, {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
} | {
  computed: {
    themeClass(): string[];
  };
}, import("vue").ComponentOptionsMixin, {
  show: () => true;
  hide: () => true;
  'update:shown': (_shown: boolean) => true;
  'apply-show': () => true;
  'apply-hide': () => true;
  'close-group': () => true;
  'close-directive': () => true;
  'auto-hide': () => true;
  resize: () => true;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: PropType<Placement>;
    default: any;
  };
  delay: {
    type: PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  /**
   * @deprecated
   */
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: PropType<boolean | "min" | "max">;
    default: any;
  };
  /**
   * @deprecated
   */
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>> & Readonly<{
  onShow?: () => any;
  onHide?: () => any;
  "onUpdate:shown"?: (_shown: boolean) => any;
  "onApply-show"?: () => any;
  "onApply-hide"?: () => any;
  "onClose-group"?: () => any;
  "onClose-directive"?: () => any;
  "onAuto-hide"?: () => any;
  onResize?: () => any;
}>, {
  theme: string;
  shift: boolean;
  referenceNode: () => Element;
  shown: boolean;
  showGroup: string;
  ariaId: any;
  disabled: boolean;
  positioningDisabled: boolean;
  placement: Placement;
  delay: string | number | {
    show: number;
    hide: number;
  };
  distance: string | number;
  skidding: string | number;
  triggers: TriggerEvent[];
  showTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  hideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperTriggers: TriggerEvent[];
  popperShowTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperHideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  container: Date;
  boundary: Date;
  strategy: "absolute" | "fixed";
  autoHide: boolean | ((event: Event) => boolean);
  handleResize: boolean;
  instantMove: boolean;
  eagerMount: boolean;
  popperClass: string | Record<string, any> | unknown[];
  computeTransformOrigin: boolean;
  autoMinSize: boolean;
  autoSize: boolean | "min" | "max";
  autoMaxSize: boolean;
  autoBoundaryMaxSize: boolean;
  preventOverflow: boolean;
  overflowPadding: string | number;
  arrowPadding: string | number;
  arrowOverflow: boolean;
  flip: boolean;
  shiftCrossAxis: boolean;
  noAutoFocus: boolean;
  disposeTimeout: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/Dropdown.d.ts
export declare const Dropdown: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>, {}, {}, {
  finalTheme(): string;
}, {
  getTargetNodes(): unknown[];
}, {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
} | {
  computed: {
    themeClass(): string[];
  };
}, import("vue").ComponentOptionsMixin, {
  show: () => true;
  hide: () => true;
  'update:shown': (_shown: boolean) => true;
  'apply-show': () => true;
  'apply-hide': () => true;
  'close-group': () => true;
  'close-directive': () => true;
  'auto-hide': () => true;
  resize: () => true;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>> & Readonly<{
  onShow?: () => any;
  onHide?: () => any;
  "onUpdate:shown"?: (_shown: boolean) => any;
  "onApply-show"?: () => any;
  "onApply-hide"?: () => any;
  "onClose-group"?: () => any;
  "onClose-directive"?: () => any;
  "onAuto-hide"?: () => any;
  onResize?: () => any;
}>, {
  theme: string;
  shift: boolean;
  referenceNode: () => Element;
  shown: boolean;
  showGroup: string;
  ariaId: any;
  disabled: boolean;
  positioningDisabled: boolean;
  placement: Placement;
  delay: string | number | {
    show: number;
    hide: number;
  };
  distance: string | number;
  skidding: string | number;
  triggers: TriggerEvent[];
  showTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  hideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperTriggers: TriggerEvent[];
  popperShowTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperHideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  container: Date;
  boundary: Date;
  strategy: "absolute" | "fixed";
  autoHide: boolean | ((event: Event) => boolean);
  handleResize: boolean;
  instantMove: boolean;
  eagerMount: boolean;
  popperClass: string | Record<string, any> | unknown[];
  computeTransformOrigin: boolean;
  autoMinSize: boolean;
  autoSize: boolean | "min" | "max";
  autoMaxSize: boolean;
  autoBoundaryMaxSize: boolean;
  preventOverflow: boolean;
  overflowPadding: string | number;
  arrowPadding: string | number;
  arrowOverflow: boolean;
  flip: boolean;
  shiftCrossAxis: boolean;
  noAutoFocus: boolean;
  disposeTimeout: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/Menu.d.ts
export declare const Menu: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>, {}, {}, {
  finalTheme(): string;
}, {
  getTargetNodes(): unknown[];
}, {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
} | {
  computed: {
    themeClass(): string[];
  };
}, import("vue").ComponentOptionsMixin, {
  show: () => true;
  hide: () => true;
  'update:shown': (_shown: boolean) => true;
  'apply-show': () => true;
  'apply-hide': () => true;
  'close-group': () => true;
  'close-directive': () => true;
  'auto-hide': () => true;
  resize: () => true;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>> & Readonly<{
  onShow?: () => any;
  onHide?: () => any;
  "onUpdate:shown"?: (_shown: boolean) => any;
  "onApply-show"?: () => any;
  "onApply-hide"?: () => any;
  "onClose-group"?: () => any;
  "onClose-directive"?: () => any;
  "onAuto-hide"?: () => any;
  onResize?: () => any;
}>, {
  theme: string;
  shift: boolean;
  referenceNode: () => Element;
  shown: boolean;
  showGroup: string;
  ariaId: any;
  disabled: boolean;
  positioningDisabled: boolean;
  placement: Placement;
  delay: string | number | {
    show: number;
    hide: number;
  };
  distance: string | number;
  skidding: string | number;
  triggers: TriggerEvent[];
  showTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  hideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperTriggers: TriggerEvent[];
  popperShowTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperHideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  container: Date;
  boundary: Date;
  strategy: "absolute" | "fixed";
  autoHide: boolean | ((event: Event) => boolean);
  handleResize: boolean;
  instantMove: boolean;
  eagerMount: boolean;
  popperClass: string | Record<string, any> | unknown[];
  computeTransformOrigin: boolean;
  autoMinSize: boolean;
  autoSize: boolean | "min" | "max";
  autoMaxSize: boolean;
  autoBoundaryMaxSize: boolean;
  preventOverflow: boolean;
  overflowPadding: string | number;
  arrowPadding: string | number;
  arrowOverflow: boolean;
  flip: boolean;
  shiftCrossAxis: boolean;
  noAutoFocus: boolean;
  disposeTimeout: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/components/Tooltip.d.ts
export declare const Tooltip: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>, {}, {}, {
  finalTheme(): string;
}, {
  getTargetNodes(): unknown[];
}, {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
} | {
  computed: {
    themeClass(): string[];
  };
}, import("vue").ComponentOptionsMixin, {
  show: () => true;
  hide: () => true;
  'update:shown': (_shown: boolean) => true;
  'apply-show': () => true;
  'apply-hide': () => true;
  'close-group': () => true;
  'close-directive': () => true;
  'auto-hide': () => true;
  resize: () => true;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: any;
  };
  referenceNode: {
    type: import("vue").PropType<() => Element>;
    default: any;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: any;
  };
  placement: {
    type: import("vue").PropType<Placement>;
    default: any;
  };
  delay: {
    type: import("vue").PropType<string | number | {
      show: number;
      hide: number;
    }>;
    default: any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  triggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  showTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  hideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperTriggers: {
    type: import("vue").PropType<Array<TriggerEvent>>;
    default: any;
  };
  popperShowTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  popperHideTriggers: {
    type: import("vue").PropType<Array<TriggerEvent> | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>)>;
    default: any;
  };
  container: {
    type: any[];
    default: any;
  };
  boundary: {
    type: any[];
    default: any;
  };
  strategy: {
    type: import("vue").PropType<"absolute" | "fixed">;
    default: any;
  };
  autoHide: {
    type: import("vue").PropType<boolean | ((event: Event) => boolean)>;
    default: any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: any;
  };
  autoMinSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoSize: {
    type: import("vue").PropType<boolean | "min" | "max">;
    default: any;
  };
  autoMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: any;
  };
  flip: {
    type: BooleanConstructor;
    default: any;
  };
  shift: {
    type: BooleanConstructor;
    default: any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: any;
  };
}>> & Readonly<{
  onShow?: () => any;
  onHide?: () => any;
  "onUpdate:shown"?: (_shown: boolean) => any;
  "onApply-show"?: () => any;
  "onApply-hide"?: () => any;
  "onClose-group"?: () => any;
  "onClose-directive"?: () => any;
  "onAuto-hide"?: () => any;
  onResize?: () => any;
}>, {
  theme: string;
  shift: boolean;
  referenceNode: () => Element;
  shown: boolean;
  showGroup: string;
  ariaId: any;
  disabled: boolean;
  positioningDisabled: boolean;
  placement: Placement;
  delay: string | number | {
    show: number;
    hide: number;
  };
  distance: string | number;
  skidding: string | number;
  triggers: TriggerEvent[];
  showTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  hideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperTriggers: TriggerEvent[];
  popperShowTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  popperHideTriggers: TriggerEvent[] | ((triggers: Array<TriggerEvent>) => Array<TriggerEvent>);
  container: Date;
  boundary: Date;
  strategy: "absolute" | "fixed";
  autoHide: boolean | ((event: Event) => boolean);
  handleResize: boolean;
  instantMove: boolean;
  eagerMount: boolean;
  popperClass: string | Record<string, any> | unknown[];
  computeTransformOrigin: boolean;
  autoMinSize: boolean;
  autoSize: boolean | "min" | "max";
  autoMaxSize: boolean;
  autoBoundaryMaxSize: boolean;
  preventOverflow: boolean;
  overflowPadding: string | number;
  arrowPadding: string | number;
  arrowOverflow: boolean;
  flip: boolean;
  shiftCrossAxis: boolean;
  noAutoFocus: boolean;
  disposeTimeout: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/directives/v-close-popper.d.ts
export declare const vClosePopper: {
  beforeMount(el: any, { value, modifiers }: {
    value: any;
    modifiers: any;
  }): void;
  updated(el: any, { value, oldValue, modifiers }: {
    value: any;
    oldValue: any;
    modifiers: any;
  }): void;
  beforeUnmount(el: any): void;
};
//#endregion
//#region src/factories/Popper.d.ts
declare const createPopper: () => import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    required: true;
  };
  targetNodes: {
    type: FunctionConstructor;
    required: true;
  };
  referenceNode: {
    type: FunctionConstructor;
    default: any;
  };
  popperNode: {
    type: FunctionConstructor;
    required: true;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  placement: {
    type: StringConstructor;
    default: (props: any) => any;
    validator: (value: Placement) => boolean;
  };
  delay: {
    type: (StringConstructor | NumberConstructor | ObjectConstructor)[];
    default: (props: any) => any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  triggers: {
    type: ArrayConstructor;
    default: (props: any) => any;
  };
  showTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  hideTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  popperTriggers: {
    type: ArrayConstructor;
    default: (props: any) => any;
  };
  popperShowTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  popperHideTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  container: {
    type: any[];
    default: (props: any) => any;
  };
  boundary: {
    type: any[];
    default: (props: any) => any;
  };
  strategy: {
    type: StringConstructor;
    validator: (value: string) => boolean;
    default: (props: any) => any;
  };
  autoHide: {
    type: (FunctionConstructor | BooleanConstructor)[];
    default: (props: any) => any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  /**
   * @deprecated
   */
  autoMinSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  autoSize: {
    type: (StringConstructor | BooleanConstructor)[];
    default: (props: any) => any;
  };
  /**
   * @deprecated
   */
  autoMaxSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  flip: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  shift: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: (props: any) => any;
  };
}>, {}, {
  isShown: boolean;
  isMounted: boolean;
  skipTransition: boolean;
  classes: {
    showFrom: boolean;
    showTo: boolean;
    hideFrom: boolean;
    hideTo: boolean;
  };
  result: {
    x: number;
    y: number;
    placement: string;
    strategy: string;
    arrow: {
      x: number;
      y: number;
      centerOffset: number;
    };
    transformOrigin: any;
  };
  randomId: string;
  shownChildren: Set<unknown>;
  lastAutoHide: boolean;
  pendingHide: boolean;
  containsGlobalTarget: boolean;
  isDisposed: boolean;
  mouseDownContains: boolean;
}, {
  popperId(): any;
  shouldMountContent(): any;
  slotData(): {
    popperId: any;
    isShown: any;
    shouldMountContent: any;
    skipTransition: any;
    autoHide: any;
    show: any;
    hide: any;
    handleResize: any;
    onResize: any;
    classes: any;
    result: any;
    attrs: any;
  };
  parentPopper(): any;
  hasPopperShowTriggerHover(): any;
}, {
  show({ event, skipDelay, force }?: {
    event?: any;
    skipDelay?: boolean;
    force?: boolean;
  }): void;
  hide({ event, skipDelay }?: {
    event?: any;
    skipDelay?: boolean;
  }): void;
  init(): void;
  dispose(): void;
  onResize(): Promise<void>;
  $_computePosition(): Promise<void>;
  $_scheduleShow(_event: any, skipDelay?: boolean): void;
  $_scheduleHide(_event: any, skipDelay?: boolean): void;
  $_computeDelay(type: "show" | "hide"): number;
  $_applyShow(skipTransition?: boolean): Promise<void>;
  $_applyShowEffect(): Promise<void>;
  $_applyHide(skipTransition?: boolean): Promise<void>;
  $_autoShowHide(): void;
  $_ensureTeleport(): void;
  $_addEventListeners(): void;
  $_registerEventListeners(targetNodes: Element[], eventType: string, handler: (event: Event) => void): void;
  $_registerTriggerListeners(targetNodes: Element[], eventMap: Record<string, string>, commonTriggers: any, customTrigger: any, handler: (event: Event) => void): void;
  $_removeEventListeners(filterEventType?: string): void;
  $_refreshListeners(): void;
  $_handleGlobalClose(event: any, touch?: boolean): void;
  $_detachPopperNode(): void;
  $_swapTargetAttrs(attrFrom: any, attrTo: any): void;
  $_applyAttrsToTarget(attrs: any): void;
  $_updateParentShownChildren(value: any): void;
  $_isAimingPopper(): boolean;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
  show: () => true;
  hide: () => true;
  'update:shown': (_shown: boolean) => true;
  'apply-show': () => true;
  'apply-hide': () => true;
  'close-group': () => true;
  'close-directive': () => true;
  'auto-hide': () => true;
  resize: () => true;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    required: true;
  };
  targetNodes: {
    type: FunctionConstructor;
    required: true;
  };
  referenceNode: {
    type: FunctionConstructor;
    default: any;
  };
  popperNode: {
    type: FunctionConstructor;
    required: true;
  };
  shown: {
    type: BooleanConstructor;
    default: boolean;
  };
  showGroup: {
    type: StringConstructor;
    default: any;
  };
  ariaId: {
    default: any;
  };
  disabled: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  positioningDisabled: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  placement: {
    type: StringConstructor;
    default: (props: any) => any;
    validator: (value: Placement) => boolean;
  };
  delay: {
    type: (StringConstructor | NumberConstructor | ObjectConstructor)[];
    default: (props: any) => any;
  };
  distance: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  skidding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  triggers: {
    type: ArrayConstructor;
    default: (props: any) => any;
  };
  showTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  hideTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  popperTriggers: {
    type: ArrayConstructor;
    default: (props: any) => any;
  };
  popperShowTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  popperHideTriggers: {
    type: (FunctionConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  container: {
    type: any[];
    default: (props: any) => any;
  };
  boundary: {
    type: any[];
    default: (props: any) => any;
  };
  strategy: {
    type: StringConstructor;
    validator: (value: string) => boolean;
    default: (props: any) => any;
  };
  autoHide: {
    type: (FunctionConstructor | BooleanConstructor)[];
    default: (props: any) => any;
  };
  handleResize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  instantMove: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  eagerMount: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  popperClass: {
    type: (StringConstructor | ObjectConstructor | ArrayConstructor)[];
    default: (props: any) => any;
  };
  computeTransformOrigin: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  /**
   * @deprecated
   */
  autoMinSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  autoSize: {
    type: (StringConstructor | BooleanConstructor)[];
    default: (props: any) => any;
  };
  /**
   * @deprecated
   */
  autoMaxSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  autoBoundaryMaxSize: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  preventOverflow: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  overflowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  arrowPadding: {
    type: (StringConstructor | NumberConstructor)[];
    default: (props: any) => any;
  };
  arrowOverflow: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  flip: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  shift: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  shiftCrossAxis: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  noAutoFocus: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  disposeTimeout: {
    type: NumberConstructor;
    default: (props: any) => any;
  };
}>> & Readonly<{
  onShow?: () => any;
  onHide?: () => any;
  "onUpdate:shown"?: (_shown: boolean) => any;
  "onApply-show"?: () => any;
  "onApply-hide"?: () => any;
  "onClose-group"?: () => any;
  "onClose-directive"?: () => any;
  "onAuto-hide"?: () => any;
  onResize?: () => any;
}>, {
  shift: boolean;
  referenceNode: Function;
  shown: boolean;
  showGroup: string;
  ariaId: any;
  disabled: boolean;
  positioningDisabled: boolean;
  placement: string;
  delay: string | number | Record<string, any>;
  distance: string | number;
  skidding: string | number;
  triggers: unknown[];
  showTriggers: Function | unknown[];
  hideTriggers: Function | unknown[];
  popperTriggers: unknown[];
  popperShowTriggers: Function | unknown[];
  popperHideTriggers: Function | unknown[];
  container: Date;
  boundary: Date;
  strategy: string;
  autoHide: boolean | Function;
  handleResize: boolean;
  instantMove: boolean;
  eagerMount: boolean;
  popperClass: string | Record<string, any> | unknown[];
  computeTransformOrigin: boolean;
  autoMinSize: boolean;
  autoSize: string | boolean;
  autoMaxSize: boolean;
  autoBoundaryMaxSize: boolean;
  preventOverflow: boolean;
  overflowPadding: string | number;
  arrowPadding: string | number;
  arrowOverflow: boolean;
  flip: boolean;
  shiftCrossAxis: boolean;
  noAutoFocus: boolean;
  disposeTimeout: number;
}, {}, {}, {}, string, () => {
  "__floating-vue__popper": {
    parentPopper: any;
  };
}, true, {}, any>;
export declare function recomputeAllPoppers(): void;
export declare function hideAllPoppers(): void;
//#endregion
//#region src/components/PopperContent.d.ts
export declare const PopperContent: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  popperId: StringConstructor;
  theme: StringConstructor;
  shown: BooleanConstructor;
  mounted: BooleanConstructor;
  skipTransition: BooleanConstructor;
  autoHide: BooleanConstructor;
  handleResize: BooleanConstructor;
  classes: ObjectConstructor;
  result: ObjectConstructor;
}>, {}, {}, {}, {
  toPx(value: any): string;
}, {
  computed: {
    themeClass(): string[];
  };
}, import("vue").ComponentOptionsMixin, ("hide" | "resize")[], "hide" | "resize", import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  popperId: StringConstructor;
  theme: StringConstructor;
  shown: BooleanConstructor;
  mounted: BooleanConstructor;
  skipTransition: BooleanConstructor;
  autoHide: BooleanConstructor;
  handleResize: BooleanConstructor;
  classes: ObjectConstructor;
  result: ObjectConstructor;
}>> & Readonly<{
  onResize?: (...args: any[]) => any;
  onHide?: (...args: any[]) => any;
}>, {
  shown: boolean;
  autoHide: boolean;
  handleResize: boolean;
  mounted: boolean;
  skipTransition: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/mixins/PopperMethods.d.ts
export declare const PopperMethods: {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
};
//#endregion
//#region src/mixins/ThemeClass.d.ts
export declare const ThemeClass: (prop?: string) => {
  computed: {
    themeClass(): string[];
  };
};
//#endregion
//#region src/components/TooltipDirective.d.ts
export declare const TooltipDirective: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: string;
  };
  html: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  content: {
    type: (StringConstructor | FunctionConstructor | NumberConstructor)[];
    default: any;
  };
  loadingContent: {
    type: StringConstructor;
    default: (props: any) => any;
  };
  targetNodes: {
    type: FunctionConstructor;
    required: true;
  };
}>, {}, {
  asyncContent: string;
}, {
  isContentAsync(): boolean;
  loading(): boolean;
  finalContent(): string;
}, {
  fetchContent(force: boolean): void;
  onResult(fetchId: any, result: any): void;
  onShow(): void;
  onHide(): void;
}, {
  methods: {
    show(...args: any[]): any;
    hide(...args: any[]): any;
    dispose(...args: any[]): any;
    onResize(...args: any[]): any;
  };
}, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
  theme: {
    type: StringConstructor;
    default: string;
  };
  html: {
    type: BooleanConstructor;
    default: (props: any) => any;
  };
  content: {
    type: (StringConstructor | FunctionConstructor | NumberConstructor)[];
    default: any;
  };
  loadingContent: {
    type: StringConstructor;
    default: (props: any) => any;
  };
  targetNodes: {
    type: FunctionConstructor;
    required: true;
  };
}>> & Readonly<{}>, {
  theme: string;
  html: boolean;
  content: string | number | Function;
  loadingContent: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
//#endregion
//#region src/util/events.d.ts
export declare const SHOW_EVENT_MAP: {
  hover: string;
  focus: string;
  click: string;
  touch: string;
  pointer: string;
};
export declare const HIDE_EVENT_MAP: {
  hover: string;
  focus: string;
  click: string;
  touch: string;
  pointer: string;
};
//#endregion
//#region src/index.d.ts
export declare const options: any;
/**
 * @deprecated Import `vTooltip` instead.
 */
export declare const VTooltip: {
  beforeMount: typeof bind;
  updated: typeof bind;
  beforeUnmount(el: any): void;
};
/**
 * @deprecated Import `vClosePopper` instead.
 */
export declare const VClosePopper: {
  beforeMount(el: any, { value, modifiers }: {
    value: any;
    modifiers: any;
  }): void;
  updated(el: any, { value, oldValue, modifiers }: {
    value: any;
    oldValue: any;
    modifiers: any;
  }): void;
  beforeUnmount(el: any): void;
};
export declare function install(app: any, options?: FloatingVueConfig): void;
declare const plugin: {
  version: string;
  install: typeof install;
  options: any;
};
//#endregion
export { type Placement, createPopper as Popper, PopperWrapper, type TriggerEvent, plugin as default };