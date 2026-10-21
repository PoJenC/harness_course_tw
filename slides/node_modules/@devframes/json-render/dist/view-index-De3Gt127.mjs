import { z } from "zod";
//#region src/prop-schemas.ts
/**
* Devframes-authored per-component prop schemas for the base catalog.
*
* Upstream `defineCatalog` collapses a multi-component `propsOf` to
* `Record<string, unknown>`, so it validates component *names* but not
* per-component *props*. These schemas are the one validation Devframes
* adds: element props are parsed against the matching schema at both trust
* boundaries: spec ingress (server) and render time (client).
*
* Each schema validates the types of the documented props and tolerates
* extra keys (upstream directives like `$bindState` resolve to values at
* render time), so validation catches genuine authoring mistakes without
* rejecting valid dynamic expressions.
*/
const dynamic = z.looseObject({}).and(z.record(z.string(), z.unknown()));
function scalar(schema) {
	return z.union([schema, dynamic]);
}
const str = scalar(z.string());
const num = scalar(z.number());
const bool = scalar(z.boolean());
const StackPropsSchema = z.object({
	direction: z.enum(["row", "column"]).optional(),
	gap: num.optional(),
	padding: num.optional(),
	align: z.enum([
		"start",
		"center",
		"end",
		"stretch"
	]).optional(),
	justify: z.enum([
		"start",
		"center",
		"end",
		"between",
		"around"
	]).optional(),
	wrap: bool.optional(),
	flex: scalar(z.union([z.number(), z.string()])).optional()
});
const CardPropsSchema = z.object({
	title: str.optional(),
	border: bool.optional(),
	collapsible: bool.optional(),
	defaultCollapsed: bool.optional(),
	loading: bool.optional()
});
const TextPropsSchema = z.object({
	text: str.optional(),
	variant: z.enum([
		"heading",
		"subheading",
		"body",
		"caption",
		"code"
	]).optional(),
	weight: z.enum([
		"normal",
		"medium",
		"bold"
	]).optional(),
	color: z.enum([
		"base",
		"muted",
		"faint",
		"primary",
		"success",
		"warning",
		"danger"
	]).optional()
});
const BadgePropsSchema = z.object({
	text: str.optional(),
	variant: z.enum([
		"default",
		"success",
		"warning",
		"danger",
		"info"
	]).optional(),
	minWidth: num.optional()
});
const ButtonPropsSchema = z.object({
	label: str.optional(),
	variant: z.enum([
		"primary",
		"secondary",
		"ghost",
		"danger"
	]).optional(),
	icon: str.optional(),
	disabled: bool.optional(),
	loading: bool.optional()
});
const IconPropsSchema = z.object({
	name: str.optional(),
	size: num.optional()
});
const DividerPropsSchema = z.object({ label: str.optional() });
const TextInputPropsSchema = z.object({
	value: str.optional(),
	placeholder: str.optional(),
	label: str.optional(),
	disabled: bool.optional(),
	type: z.enum([
		"text",
		"number",
		"password",
		"email",
		"search"
	]).optional(),
	loading: bool.optional()
});
const SwitchPropsSchema = z.object({
	value: bool.optional(),
	label: str.optional(),
	disabled: bool.optional()
});
const KeyValueTablePropsSchema = z.object({
	data: z.union([z.record(z.string(), z.unknown()), dynamic]).optional(),
	loading: bool.optional()
});
const DataTablePropsSchema = z.object({
	columns: scalar(z.array(z.union([z.string(), z.looseObject({
		key: z.string(),
		label: z.string().optional()
	})]))).optional(),
	rows: scalar(z.array(z.unknown())).optional(),
	height: num.optional(),
	loading: bool.optional()
});
const CodeBlockPropsSchema = z.object({
	code: str.optional(),
	language: str.optional(),
	filename: str.optional(),
	height: num.optional()
});
const ProgressPropsSchema = z.object({
	value: num.optional(),
	max: num.optional(),
	label: str.optional()
});
const TreePropsSchema = z.object({
	data: z.unknown().optional(),
	defaultExpanded: bool.optional()
});
const TabsPropsSchema = z.object({
	/** `children[i]` renders under `tabs[i]`; the two arrays are positional. */
	tabs: scalar(z.array(z.looseObject({
		value: z.string(),
		label: z.string(),
		icon: z.string().optional(),
		badge: z.string().optional(),
		badgeVariant: z.enum([
			"default",
			"info",
			"success",
			"warning",
			"danger"
		]).optional()
	}))).optional(),
	value: str.optional(),
	defaultValue: str.optional(),
	orientation: z.enum(["horizontal", "vertical"]).optional()
});
const LinkPropsSchema = z.object({
	href: str.optional(),
	label: str.optional(),
	icon: str.optional(),
	external: bool.optional()
});
const SelectPropsSchema = z.object({
	value: str.optional(),
	options: scalar(z.array(z.union([z.string(), z.looseObject({
		value: z.string(),
		label: z.string().optional(),
		icon: z.string().optional(),
		description: z.string().optional()
	})]))).optional(),
	placeholder: str.optional(),
	label: str.optional(),
	disabled: bool.optional(),
	searchable: bool.optional(),
	native: bool.optional()
});
/**
* Map of base-catalog component name → Zod prop schema. The keys are the
* canonical component set (catalog v1: the original fourteen plus the
* additive Tabs/Link/Select).
*/
const basePropSchemas = {
	Stack: StackPropsSchema,
	Card: CardPropsSchema,
	Text: TextPropsSchema,
	Badge: BadgePropsSchema,
	Button: ButtonPropsSchema,
	Icon: IconPropsSchema,
	Divider: DividerPropsSchema,
	TextInput: TextInputPropsSchema,
	Switch: SwitchPropsSchema,
	KeyValueTable: KeyValueTablePropsSchema,
	DataTable: DataTablePropsSchema,
	CodeBlock: CodeBlockPropsSchema,
	Progress: ProgressPropsSchema,
	Tree: TreePropsSchema,
	Tabs: TabsPropsSchema,
	Link: LinkPropsSchema,
	Select: SelectPropsSchema
};
/** The ordered list of base-catalog component names (catalog v1). */
const baseComponentNames = Object.keys(basePropSchemas);
//#endregion
//#region src/view-index.ts
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
const JSON_RENDER_INDEX_KEY = "devframe:json-render:index";
//#endregion
export { TextPropsSchema as _, CodeBlockPropsSchema as a, basePropSchemas as b, IconPropsSchema as c, ProgressPropsSchema as d, SelectPropsSchema as f, TextInputPropsSchema as g, TabsPropsSchema as h, CardPropsSchema as i, KeyValueTablePropsSchema as l, SwitchPropsSchema as m, BadgePropsSchema as n, DataTablePropsSchema as o, StackPropsSchema as p, ButtonPropsSchema as r, DividerPropsSchema as s, JSON_RENDER_INDEX_KEY as t, LinkPropsSchema as u, TreePropsSchema as v, baseComponentNames as y };
