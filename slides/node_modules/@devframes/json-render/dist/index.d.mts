import { Catalog, InferComponentProps, Spec, StateModel, StateStore, UIElement } from "./core.mjs";
import { a as JsonRenderViewRef, i as JsonRenderViewInlineRef, n as DevframeJsonRenderSpec, o as JsonRenderViewStateRef, r as JsonRenderView, t as CatalogUIElement } from "./types-ByXkazOp.mjs";
import { z } from "zod";
//#region src/prop-schemas.d.ts
export declare const StackPropsSchema: z.ZodObject<{
  direction: z.ZodOptional<z.ZodEnum<{
    row: "row";
    column: "column";
  }>>;
  gap: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  padding: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  align: z.ZodOptional<z.ZodEnum<{
    start: "start";
    center: "center";
    end: "end";
    stretch: "stretch";
  }>>;
  justify: z.ZodOptional<z.ZodEnum<{
    start: "start";
    center: "center";
    end: "end";
    between: "between";
    around: "around";
  }>>;
  wrap: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  flex: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const CardPropsSchema: z.ZodObject<{
  title: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  border: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  collapsible: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  defaultCollapsed: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const TextPropsSchema: z.ZodObject<{
  text: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  variant: z.ZodOptional<z.ZodEnum<{
    code: "code";
    heading: "heading";
    subheading: "subheading";
    body: "body";
    caption: "caption";
  }>>;
  weight: z.ZodOptional<z.ZodEnum<{
    bold: "bold";
    normal: "normal";
    medium: "medium";
  }>>;
  color: z.ZodOptional<z.ZodEnum<{
    success: "success";
    base: "base";
    muted: "muted";
    faint: "faint";
    primary: "primary";
    warning: "warning";
    danger: "danger";
  }>>;
}, z.core.$strip>;
export declare const BadgePropsSchema: z.ZodObject<{
  text: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  variant: z.ZodOptional<z.ZodEnum<{
    success: "success";
    default: "default";
    warning: "warning";
    danger: "danger";
    info: "info";
  }>>;
  minWidth: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const ButtonPropsSchema: z.ZodObject<{
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  variant: z.ZodOptional<z.ZodEnum<{
    primary: "primary";
    danger: "danger";
    secondary: "secondary";
    ghost: "ghost";
  }>>;
  icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const IconPropsSchema: z.ZodObject<{
  name: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  size: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const DividerPropsSchema: z.ZodObject<{
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const TextInputPropsSchema: z.ZodObject<{
  value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  placeholder: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  type: z.ZodOptional<z.ZodEnum<{
    number: "number";
    search: "search";
    text: "text";
    password: "password";
    email: "email";
  }>>;
  loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const SwitchPropsSchema: z.ZodObject<{
  value: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const KeyValueTablePropsSchema: z.ZodObject<{
  data: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const DataTablePropsSchema: z.ZodObject<{
  columns: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    key: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
  }, z.core.$loose>]>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  rows: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  height: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const CodeBlockPropsSchema: z.ZodObject<{
  code: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  language: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  filename: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  height: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const ProgressPropsSchema: z.ZodObject<{
  value: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const TreePropsSchema: z.ZodObject<{
  data: z.ZodOptional<z.ZodUnknown>;
  defaultExpanded: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const TabsPropsSchema: z.ZodObject<{
  tabs: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
    value: z.ZodString;
    label: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    badge: z.ZodOptional<z.ZodString>;
    badgeVariant: z.ZodOptional<z.ZodEnum<{
      success: "success";
      default: "default";
      warning: "warning";
      danger: "danger";
      info: "info";
    }>>;
  }, z.core.$loose>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  defaultValue: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  orientation: z.ZodOptional<z.ZodEnum<{
    horizontal: "horizontal";
    vertical: "vertical";
  }>>;
}, z.core.$strip>;
export declare const LinkPropsSchema: z.ZodObject<{
  href: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  external: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
export declare const SelectPropsSchema: z.ZodObject<{
  value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  options: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
    value: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
  }, z.core.$loose>]>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  placeholder: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  searchable: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  native: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
}, z.core.$strip>;
/**
 * Map of base-catalog component name → Zod prop schema. The keys are the
 * canonical component set (catalog v1: the original fourteen plus the
 * additive Tabs/Link/Select).
 */
export declare const basePropSchemas: {
  readonly Stack: z.ZodObject<{
    direction: z.ZodOptional<z.ZodEnum<{
      row: "row";
      column: "column";
    }>>;
    gap: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    padding: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    align: z.ZodOptional<z.ZodEnum<{
      start: "start";
      center: "center";
      end: "end";
      stretch: "stretch";
    }>>;
    justify: z.ZodOptional<z.ZodEnum<{
      start: "start";
      center: "center";
      end: "end";
      between: "between";
      around: "around";
    }>>;
    wrap: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    flex: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Card: z.ZodObject<{
    title: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    border: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    collapsible: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    defaultCollapsed: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Text: z.ZodObject<{
    text: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    variant: z.ZodOptional<z.ZodEnum<{
      code: "code";
      heading: "heading";
      subheading: "subheading";
      body: "body";
      caption: "caption";
    }>>;
    weight: z.ZodOptional<z.ZodEnum<{
      bold: "bold";
      normal: "normal";
      medium: "medium";
    }>>;
    color: z.ZodOptional<z.ZodEnum<{
      success: "success";
      base: "base";
      muted: "muted";
      faint: "faint";
      primary: "primary";
      warning: "warning";
      danger: "danger";
    }>>;
  }, z.core.$strip>;
  readonly Badge: z.ZodObject<{
    text: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    variant: z.ZodOptional<z.ZodEnum<{
      success: "success";
      default: "default";
      warning: "warning";
      danger: "danger";
      info: "info";
    }>>;
    minWidth: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Button: z.ZodObject<{
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    variant: z.ZodOptional<z.ZodEnum<{
      primary: "primary";
      danger: "danger";
      secondary: "secondary";
      ghost: "ghost";
    }>>;
    icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Icon: z.ZodObject<{
    name: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    size: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Divider: z.ZodObject<{
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly TextInput: z.ZodObject<{
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    placeholder: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    type: z.ZodOptional<z.ZodEnum<{
      number: "number";
      search: "search";
      text: "text";
      password: "password";
      email: "email";
    }>>;
    loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Switch: z.ZodObject<{
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly KeyValueTable: z.ZodObject<{
    data: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly DataTable: z.ZodObject<{
    columns: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
      key: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>]>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    rows: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    height: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    loading: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly CodeBlock: z.ZodObject<{
    code: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    language: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    filename: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    height: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Progress: z.ZodObject<{
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Tree: z.ZodObject<{
    data: z.ZodOptional<z.ZodUnknown>;
    defaultExpanded: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Tabs: z.ZodObject<{
    tabs: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
      value: z.ZodString;
      label: z.ZodString;
      icon: z.ZodOptional<z.ZodString>;
      badge: z.ZodOptional<z.ZodString>;
      badgeVariant: z.ZodOptional<z.ZodEnum<{
        success: "success";
        default: "default";
        warning: "warning";
        danger: "danger";
        info: "info";
      }>>;
    }, z.core.$loose>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    defaultValue: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    orientation: z.ZodOptional<z.ZodEnum<{
      horizontal: "horizontal";
      vertical: "vertical";
    }>>;
  }, z.core.$strip>;
  readonly Link: z.ZodObject<{
    href: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    icon: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    external: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
  readonly Select: z.ZodObject<{
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    options: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
      value: z.ZodString;
      label: z.ZodOptional<z.ZodString>;
      icon: z.ZodOptional<z.ZodString>;
      description: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>]>>, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    placeholder: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    label: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    disabled: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    searchable: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
    native: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodIntersection<z.ZodObject<{}, z.core.$loose>, z.ZodRecord<z.ZodString, z.ZodUnknown>>]>>;
  }, z.core.$strip>;
};
/** Canonical base-catalog component name. */
type BaseComponentName = keyof typeof basePropSchemas;
/** The ordered list of base-catalog component names (catalog v1). */
export declare const baseComponentNames: BaseComponentName[];
//#endregion
//#region src/catalog.d.ts
/**
 * The Devframes base-catalog schema. A Devframes spec is an
 * `@json-render/core` `Spec` (flat `root` + `elements` map); the structural
 * fields upstream's Vue schema omits (`state`, `on`, `repeat`, `watch`) pass
 * through unchecked. The one validation Devframes adds is per-component prop
 * validation (see {@link basePropSchemas}).
 */
export declare const baseSchema: import("@json-render/core").Schema<{
  spec: import("@json-render/core").SchemaType<"object", {
    root: import("@json-render/core").SchemaType<"string", unknown>;
    elements: import("@json-render/core").SchemaType<"record", import("@json-render/core").SchemaType<"object", {
      type: import("@json-render/core").SchemaType<"ref", string>;
      props: import("@json-render/core").SchemaType<"propsOf", string>;
      children: import("@json-render/core").SchemaType<"array", import("@json-render/core").SchemaType<"string", unknown>>;
    }>>;
  }>;
  catalog: import("@json-render/core").SchemaType<"object", {
    components: import("@json-render/core").SchemaType<"map", {
      props: import("@json-render/core").SchemaType<"zod", unknown>;
      description: import("@json-render/core").SchemaType<"string", unknown>;
    }>;
    actions: import("@json-render/core").SchemaType<"map", {
      description: import("@json-render/core").SchemaType<"string", unknown>;
    }>;
  }>;
}>;
/**
 * The Devframes base catalog (catalog v1): the seventeen canonical components
 * with their Devframes-authored Zod prop schemas and descriptions, and an
 * empty action set (actions are dispatched dynamically via the bridge, they
 * are not declared here). Reference frontend libraries implement this set.
 */
export declare const baseCatalog: import("@json-render/core").Catalog<{
  spec: import("@json-render/core").SchemaType<"object", {
    root: import("@json-render/core").SchemaType<"string", unknown>;
    elements: import("@json-render/core").SchemaType<"record", import("@json-render/core").SchemaType<"object", {
      type: import("@json-render/core").SchemaType<"ref", string>;
      props: import("@json-render/core").SchemaType<"propsOf", string>;
      children: import("@json-render/core").SchemaType<"array", import("@json-render/core").SchemaType<"string", unknown>>;
    }>>;
  }>;
  catalog: import("@json-render/core").SchemaType<"object", {
    components: import("@json-render/core").SchemaType<"map", {
      props: import("@json-render/core").SchemaType<"zod", unknown>;
      description: import("@json-render/core").SchemaType<"string", unknown>;
    }>;
    actions: import("@json-render/core").SchemaType<"map", {
      description: import("@json-render/core").SchemaType<"string", unknown>;
    }>;
  }>;
}, {
  components: { [K in keyof typeof basePropSchemas]: {
    props: (typeof basePropSchemas)[K];
    description: string;
  }; };
  actions: {};
}>;
//#endregion
//#region src/view-index.d.ts
/**
 * Well-known shared-state key carrying the **view index**: a map of every
 * live JSON-render view registered on a context, keyed by its `stateKey`.
 *
 * A frontend that does not know view ids ahead of time (e.g. the prebuilt
 * standalone SPA in `@devframes/json-render-ui`) subscribes to this one key to
 * discover which views exist, then subscribes to each view's own state. A hub
 * dock, by contrast, is handed a specific {@link JsonRenderViewRef} and needs
 * no index.
 */
export declare const JSON_RENDER_INDEX_KEY = "devframe:json-render:index";
/**
 * One entry in the {@link JSON_RENDER_INDEX_KEY view index}. Fully
 * serializable: it locates a view's live state and carries the display title a
 * multi-view frontend uses to label it.
 */
interface JsonRenderIndexEntry {
  /** Author-supplied stable id, unique within the view's scope. */
  id: string;
  /** The view's scope segment (e.g. `global` or a context namespace). */
  scope: string;
  /** Shared-state key the client subscribes to for the live spec + state. */
  stateKey: string;
  /** Human-facing label for the view (defaults to `id`). */
  title: string;
}
/** The shape of the view-index shared state: entries keyed by `stateKey`. */
type JsonRenderIndex = Record<string, JsonRenderIndexEntry>;
//#endregion
export type { BaseComponentName, Catalog, CatalogUIElement, DevframeJsonRenderSpec, InferComponentProps, JsonRenderIndex, JsonRenderIndexEntry, JsonRenderView, JsonRenderViewInlineRef, JsonRenderViewRef, JsonRenderViewStateRef, Spec, StateModel, StateStore, UIElement };