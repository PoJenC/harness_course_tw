import { B as withDirectives, Ct as normalizeProps, D as renderList, O as renderSlot, St as normalizeClass, T as openBlock, Tt as toDisplayString, X as ref, _ as h, b as mergeProps, c as createBlock, f as createTextVNode, g as guardReactiveProps, it as unref, k as resolveComponent, l as createCommentVNode, m as defineComponent, o as computed, p as createVNode, s as createBaseVNode, t as Fragment, tt as toRef, u as createElementBlock, wt as normalizeStyle, z as withCtx } from "./runtime-core.esm-bundler-BdgYK4NT.js";
import { g as useRoute, y as createApp } from "./useApi-CUWMwLLw-DtuAXv9f.js";
import { c as useVirtualList, t as usePayloadStore } from "./payload-Cz8k6Ekx.js";
import { a as PluginName_default, c as isDark, i as Badge_default, s as getPluginColor } from "./QuerySelector-DQYSC0Wa.js";
import { n as DurationDisplay_default, r as NumberWithUnit_default, t as useOptionsStore } from "./options-CPJ4tEah.js";
//#endregion
//#region src/client/components/ByteSizeDisplay.vue
var ByteSizeDisplay_default = /* @__PURE__ */ defineComponent({
	__name: "ByteSizeDisplay",
	props: { bytes: {} },
	setup(__props) {
		const props = __props;
		function byteToHumanReadable(byte) {
			if (byte < 1024) return [byte, "B"];
			if (byte < 1048576) return [(byte / 1024).toFixed(2), "KB"];
			if (byte < 1073741824) return [(byte / 1024 / 1024).toFixed(2), "MB"];
			return [(byte / 1024 / 1024 / 1024).toFixed(2), "GB"];
		}
		const readable = computed(() => byteToHumanReadable(props.bytes));
		return (_ctx, _cache) => {
			const _component_NumberWithUnit = NumberWithUnit_default;
			return openBlock(), createBlock(_component_NumberWithUnit, {
				number: unref(readable)[0],
				unit: unref(readable)[1]
			}, null, 8, ["number", "unit"]);
		};
	}
});
//#endregion
//#region src/client/components/FileIcon.vue
var FileIcon_default = /* @__PURE__ */ defineComponent({
	__name: "FileIcon",
	props: { filename: {} },
	setup(__props) {
		const props = __props;
		const map = {
			angular: "i-catppuccin-angular",
			vue: "i-catppuccin-vue",
			js: "i-catppuccin-javascript",
			mjs: "i-catppuccin-javascript",
			cjs: "i-catppuccin-javascript",
			ts: "i-catppuccin-typescript",
			mts: "i-catppuccin-typescript",
			cts: "i-catppuccin-typescript",
			md: "i-catppuccin-markdown",
			markdown: "i-catppuccin-markdown",
			mdx: "i-catppuccin-mdx",
			jsx: "i-catppuccin-javascript-react",
			tsx: "i-catppuccin-typescript-react",
			svelte: "i-catppuccin-svelte",
			html: "i-catppuccin-html",
			css: "i-catppuccin-css",
			scss: "i-catppuccin-css",
			less: "i-catppuccin-less",
			json: "i-catppuccin-json",
			yaml: "i-catppuccin-yaml",
			toml: "i-catppuccin-toml",
			svg: "i-catppuccin-svg"
		};
		const icon = computed(() => {
			let file = props.filename;
			file = file.replace(/(\?|&)v=[^&]*/, "$1").replace(/\?$/, "");
			if (/[\\/]node_modules[\\/]/.test(file)) return "i-catppuccin-folder-node-open";
			let ext = (file.split(".").pop() || "").toLowerCase();
			let icon = map[ext];
			if (icon) return icon;
			ext = ext.split("?")[0];
			icon = map[ext];
			if (icon) return icon;
			return "i-catppuccin-file";
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				"flex-none": "",
				class: normalizeClass([unref(icon), unref(isDark) ? "" : "brightness-60 hue-rotate-180 invert-100 saturate-200"])
			}, null, 2);
		};
	}
});
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
/**
* Custom positioning reference element.
* @see https://floating-ui.com/docs/virtual-elements
*/
var sides = [
	"top",
	"right",
	"bottom",
	"left"
];
var alignments = ["start", "end"];
var placements$1 = /*#__PURE__*/ sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
var min = Math.min;
var max = Math.max;
var round = Math.round;
var createCoords = (v) => ({
	x: v,
	y: v
});
var oppositeSideMap = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function clamp(start, value, end) {
	return max(start, min(value, end));
}
function evaluate(value, param) {
	return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
	return placement.split("-")[0];
}
function getAlignment(placement) {
	return placement.split("-")[1];
}
function getOppositeAxis(axis) {
	return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
	return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
	const firstChar = placement[0];
	return firstChar === "t" || firstChar === "b" ? "y" : "x";
}
function getAlignmentAxis(placement) {
	return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
	if (rtl === void 0) rtl = false;
	const alignment = getAlignment(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const length = getAxisLength(alignmentAxis);
	let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
	if (rects.reference[length] > rects.floating[length]) mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
	return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
	const oppositePlacement = getOppositePlacement(placement);
	return [
		getOppositeAlignmentPlacement(placement),
		oppositePlacement,
		getOppositeAlignmentPlacement(oppositePlacement)
	];
}
function getOppositeAlignmentPlacement(placement) {
	return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
}
var lrPlacement = ["left", "right"];
var rlPlacement = ["right", "left"];
var tbPlacement = ["top", "bottom"];
var btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
	switch (side) {
		case "top":
		case "bottom":
			if (rtl) return isStart ? rlPlacement : lrPlacement;
			return isStart ? lrPlacement : rlPlacement;
		case "left":
		case "right": return isStart ? tbPlacement : btPlacement;
		default: return [];
	}
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
	const alignment = getAlignment(placement);
	let list = getSideList(getSide(placement), direction === "start", rtl);
	if (alignment) {
		list = list.map((side) => side + "-" + alignment);
		if (flipAlignment) list = list.concat(list.map(getOppositeAlignmentPlacement));
	}
	return list;
}
function getOppositePlacement(placement) {
	const side = getSide(placement);
	return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
	var _padding$top, _padding$right, _padding$bottom, _padding$left;
	return {
		top: (_padding$top = padding.top) != null ? _padding$top : 0,
		right: (_padding$right = padding.right) != null ? _padding$right : 0,
		bottom: (_padding$bottom = padding.bottom) != null ? _padding$bottom : 0,
		left: (_padding$left = padding.left) != null ? _padding$left : 0
	};
}
function getPaddingObject(padding) {
	return typeof padding !== "number" ? expandPaddingObject(padding) : {
		top: padding,
		right: padding,
		bottom: padding,
		left: padding
	};
}
function rectToClientRect(rect) {
	const { x, y, width, height } = rect;
	return {
		width,
		height,
		top: y,
		left: x,
		right: x + width,
		bottom: y + height,
		x,
		y
	};
}
//#endregion
//#region node_modules/.pnpm/@floating-ui+core@1.8.0/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
	let { reference, floating } = _ref;
	const sideAxis = getSideAxis(placement);
	const alignmentAxis = getAlignmentAxis(placement);
	const alignLength = getAxisLength(alignmentAxis);
	const side = getSide(placement);
	const isVertical = sideAxis === "y";
	const commonX = reference.x + reference.width / 2 - floating.width / 2;
	const commonY = reference.y + reference.height / 2 - floating.height / 2;
	const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
	let coords;
	switch (side) {
		case "top":
			coords = {
				x: commonX,
				y: reference.y - floating.height
			};
			break;
		case "bottom":
			coords = {
				x: commonX,
				y: reference.y + reference.height
			};
			break;
		case "right":
			coords = {
				x: reference.x + reference.width,
				y: commonY
			};
			break;
		case "left":
			coords = {
				x: reference.x - floating.width,
				y: commonY
			};
			break;
		default: coords = {
			x: reference.x,
			y: reference.y
		};
	}
	const alignment = getAlignment(placement);
	if (alignment) coords[alignmentAxis] += commonAlign * (alignment === "end" ? 1 : -1) * (rtl && isVertical ? -1 : 1);
	return coords;
}
/**
* Resolves with an object of overflow side offsets that determine how much the
* element is overflowing a given clipping boundary on each side.
* - positive = overflowing the boundary by that number of pixels
* - negative = how many pixels left before it will overflow
* - 0 = lies flush with the boundary
* @see https://floating-ui.com/docs/detectOverflow
*/
async function detectOverflow(state, options) {
	var _await$platform$isEle;
	if (options === void 0) options = {};
	const { x, y, platform, rects, elements, strategy } = state;
	const { boundary = "clippingAncestors", rootBoundary = "viewport", elementContext = "floating", altBoundary = false, padding = 0 } = evaluate(options, state);
	const paddingObject = getPaddingObject(padding);
	const element = elements[altBoundary ? elementContext === "floating" ? "reference" : "floating" : elementContext];
	const clippingClientRect = rectToClientRect(await platform.getClippingRect({
		element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating)),
		boundary,
		rootBoundary,
		strategy
	}));
	const rect = elementContext === "floating" ? {
		x,
		y,
		width: rects.floating.width,
		height: rects.floating.height
	} : rects.reference;
	const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
	const offsetScale = await (platform.isElement == null ? void 0 : platform.isElement(offsetParent)) && await (platform.getScale == null ? void 0 : platform.getScale(offsetParent)) || {
		x: 1,
		y: 1
	};
	const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements,
		rect,
		offsetParent,
		strategy
	}) : rect);
	return {
		top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
		bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
		left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
		right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
	};
}
var MAX_RESET_COUNT = 50;
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*
* This export does not have any `platform` interface logic. You will need to
* write one for the platform you are using Floating UI with.
*/
var computePosition$1 = async (reference, floating, config) => {
	const { placement = "bottom", strategy = "absolute", middleware = [], platform } = config;
	const platformWithDetectOverflow = platform.detectOverflow ? platform : {
		...platform,
		detectOverflow
	};
	const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
	let rects = await platform.getElementRects({
		reference,
		floating,
		strategy
	});
	let { x, y } = computeCoordsFromPlacement(rects, placement, rtl);
	let statefulPlacement = placement;
	let resetCount = 0;
	const middlewareData = {};
	for (let i = 0; i < middleware.length; i++) {
		const currentMiddleware = middleware[i];
		if (!currentMiddleware) continue;
		const { name, fn } = currentMiddleware;
		const { x: nextX, y: nextY, data, reset } = await fn({
			x,
			y,
			initialPlacement: placement,
			placement: statefulPlacement,
			strategy,
			middlewareData,
			rects,
			platform: platformWithDetectOverflow,
			elements: {
				reference,
				floating
			}
		});
		x = nextX != null ? nextX : x;
		y = nextY != null ? nextY : y;
		middlewareData[name] = {
			...middlewareData[name],
			...data
		};
		if (reset && resetCount < MAX_RESET_COUNT) {
			resetCount++;
			if (typeof reset === "object") {
				if (reset.placement) statefulPlacement = reset.placement;
				if (reset.rects) rects = reset.rects === true ? await platform.getElementRects({
					reference,
					floating,
					strategy
				}) : reset.rects;
				({x, y} = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
			}
			i = -1;
		}
	}
	return {
		x,
		y,
		placement: statefulPlacement,
		strategy,
		middlewareData
	};
};
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow$1 = (options) => ({
	name: "arrow",
	options,
	async fn(state) {
		const { x, y, placement, rects, platform, elements, middlewareData } = state;
		const { element, padding = 0 } = evaluate(options, state) || {};
		if (element == null) return {};
		const paddingObject = getPaddingObject(padding);
		const coords = {
			x,
			y
		};
		const axis = getAlignmentAxis(placement);
		const length = getAxisLength(axis);
		const arrowDimensions = await platform.getDimensions(element);
		const isYAxis = axis === "y";
		const minProp = isYAxis ? "top" : "left";
		const maxProp = isYAxis ? "bottom" : "right";
		const clientProp = isYAxis ? "clientHeight" : "clientWidth";
		const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
		const startDiff = coords[axis] - rects.reference[axis];
		const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
		let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
		if (!clientSize || !await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent))) clientSize = elements.floating[clientProp] || rects.floating[length];
		const centerToReference = endDiff / 2 - startDiff / 2;
		const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
		const minPadding = min(paddingObject[minProp], largestPossiblePadding);
		const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
		const max = clientSize - arrowDimensions[length] - maxPadding;
		const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
		const offset = clamp(minPadding, center, max);
		const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < minPadding ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
		const alignmentOffset = shouldAddOffset ? center < minPadding ? center - minPadding : center - max : 0;
		return {
			[axis]: coords[axis] + alignmentOffset,
			data: {
				[axis]: offset,
				centerOffset: center - offset - alignmentOffset,
				...shouldAddOffset && { alignmentOffset }
			},
			reset: shouldAddOffset
		};
	}
});
function getPlacementList(alignment, autoAlignment, allowedPlacements) {
	return (alignment ? [...allowedPlacements.filter((placement) => getAlignment(placement) === alignment), ...allowedPlacements.filter((placement) => getAlignment(placement) !== alignment)] : allowedPlacements.filter((placement) => getSide(placement) === placement)).filter((placement) => {
		if (alignment) return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
		return true;
	});
}
/**
* Optimizes the visibility of the floating element by choosing the placement
* that has the most space available automatically, without needing to specify a
* preferred placement. Alternative to `flip`.
* @see https://floating-ui.com/docs/autoPlacement
*/
var autoPlacement$1 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "autoPlacement",
		options,
		async fn(state) {
			var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
			const { rects, middlewareData, placement, platform, elements } = state;
			const { crossAxis = false, alignment, allowedPlacements = placements$1, autoAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
			const placements$1$1 = alignment !== void 0 || allowedPlacements === placements$1 ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
			const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
			const currentPlacement = placements$1$1[currentIndex];
			if (currentPlacement == null) return {};
			if (placement !== currentPlacement) return { reset: { placement: placements$1$1[0] } };
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)));
			const currentOverflows = [
				overflow[getSide(currentPlacement)],
				overflow[alignmentSides[0]],
				overflow[alignmentSides[1]]
			];
			const allOverflows = [...((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || [], {
				placement: currentPlacement,
				overflows: currentOverflows
			}];
			const nextPlacement = placements$1$1[currentIndex + 1];
			if (nextPlacement) return {
				data: {
					index: currentIndex + 1,
					overflows: allOverflows
				},
				reset: { placement: nextPlacement }
			};
			const placementsSortedByMostSpace = allOverflows.map((d) => {
				const alignment = getAlignment(d.placement);
				return [
					d.placement,
					alignment && crossAxis ? d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0) : d.overflows[0],
					d.overflows
				];
			}).sort((a, b) => a[1] - b[1]);
			const resetPlacement = ((_placementsThatFitOnE = placementsSortedByMostSpace.filter((d) => d[2].slice(0, getAlignment(d[0]) ? 2 : 3).every((v) => v <= 0))[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
			if (resetPlacement !== placement) return {
				data: {
					index: currentIndex + 1,
					overflows: allOverflows
				},
				reset: { placement: resetPlacement }
			};
			return {};
		}
	};
};
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip$1 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "flip",
		options,
		async fn(state) {
			var _middlewareData$arrow, _middlewareData$flip;
			const { placement, middlewareData, rects, initialPlacement, platform, elements } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = true, fallbackPlacements: specifiedFallbackPlacements, fallbackStrategy = "bestFit", fallbackAxisSideDirection = "none", flipAlignment = true, ...detectOverflowOptions } = evaluate(options, state);
			if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
			const side = getSide(placement);
			const initialSideAxis = getSideAxis(initialPlacement);
			const isBasePlacement = getSide(initialPlacement) === initialPlacement;
			const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
			const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
			const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
			if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
			const placements = [initialPlacement, ...fallbackPlacements];
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const overflows = [];
			let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
			if (checkMainAxis) overflows.push(overflow[side]);
			if (checkCrossAxis) {
				const sides = getAlignmentSides(placement, rects, rtl);
				overflows.push(overflow[sides[0]], overflow[sides[1]]);
			}
			overflowsData = [...overflowsData, {
				placement,
				overflows
			}];
			if (!overflows.every((side) => side <= 0)) {
				var _middlewareData$flip2, _overflowsData$filter;
				const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
				const nextPlacement = placements[nextIndex];
				if (nextPlacement) {
					if (!(checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false) || overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) return {
						data: {
							index: nextIndex,
							overflows: overflowsData
						},
						reset: { placement: nextPlacement }
					};
				}
				let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
				if (!resetPlacement) switch (fallbackStrategy) {
					case "bestFit": {
						var _overflowsData$filter2;
						const placement = (_overflowsData$filter2 = overflowsData.filter((d) => {
							if (hasFallbackAxisSideDirection) {
								const currentSideAxis = getSideAxis(d.placement);
								return currentSideAxis === initialSideAxis || currentSideAxis === "y";
							}
							return true;
						}).map((d) => [d.placement, d.overflows.filter((overflow) => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
						if (placement) resetPlacement = placement;
						break;
					}
					case "initialPlacement": resetPlacement = initialPlacement;
				}
				if (placement !== resetPlacement) return { reset: { placement: resetPlacement } };
			}
			return {};
		}
	};
};
var originSides = /*#__PURE__*/ new Set(["left", "top"]);
async function convertValueToCoords(state, options) {
	const { placement, platform, elements } = state;
	const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
	const side = getSide(placement);
	const alignment = getAlignment(placement);
	const isVertical = getSideAxis(placement) === "y";
	const mainAxisMulti = originSides.has(side) ? -1 : 1;
	const crossAxisMulti = rtl && isVertical ? -1 : 1;
	const rawValue = evaluate(options, state);
	let { mainAxis, crossAxis, alignmentAxis } = typeof rawValue === "number" ? {
		mainAxis: rawValue,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: rawValue.mainAxis || 0,
		crossAxis: rawValue.crossAxis || 0,
		alignmentAxis: rawValue.alignmentAxis
	};
	if (alignment && typeof alignmentAxis === "number") crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
	return isVertical ? {
		x: crossAxis * crossAxisMulti,
		y: mainAxis * mainAxisMulti
	} : {
		x: mainAxis * mainAxisMulti,
		y: crossAxis * crossAxisMulti
	};
}
/**
* Modifies the placement by translating the floating element along the
* specified axes.
* A number (shorthand for `mainAxis` or distance), or an axes configuration
* object may be passed.
* @see https://floating-ui.com/docs/offset
*/
var offset$1 = function(options) {
	if (options === void 0) options = 0;
	return {
		name: "offset",
		options,
		async fn(state) {
			var _middlewareData$offse, _middlewareData$arrow;
			const { x, y, placement, middlewareData } = state;
			const diffCoords = await convertValueToCoords(state, options);
			if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) return {};
			return {
				x: x + diffCoords.x,
				y: y + diffCoords.y,
				data: {
					...diffCoords,
					placement
				}
			};
		}
	};
};
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift$1 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "shift",
		options,
		async fn(state) {
			const { x, y, placement, platform } = state;
			const { mainAxis: checkMainAxis = true, crossAxis: checkCrossAxis = false, limiter = { fn: (_ref) => {
				let { x, y } = _ref;
				return {
					x,
					y
				};
			} }, ...detectOverflowOptions } = evaluate(options, state);
			const coords = {
				x,
				y
			};
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const crossAxis = getSideAxis(placement);
			const mainAxis = getOppositeAxis(crossAxis);
			let mainAxisCoord = coords[mainAxis];
			let crossAxisCoord = coords[crossAxis];
			const clampCoord = (axis, coord) => clamp(coord + overflow[axis === "y" ? "top" : "left"], coord, coord - overflow[axis === "y" ? "bottom" : "right"]);
			if (checkMainAxis) mainAxisCoord = clampCoord(mainAxis, mainAxisCoord);
			if (checkCrossAxis) crossAxisCoord = clampCoord(crossAxis, crossAxisCoord);
			const limitedCoords = limiter.fn({
				...state,
				[mainAxis]: mainAxisCoord,
				[crossAxis]: crossAxisCoord
			});
			return {
				...limitedCoords,
				data: {
					x: limitedCoords.x - x,
					y: limitedCoords.y - y,
					enabled: {
						[mainAxis]: checkMainAxis,
						[crossAxis]: checkCrossAxis
					}
				}
			};
		}
	};
};
/**
* Provides data that allows you to change the size of the floating element —
* for instance, prevent it from overflowing the clipping boundary or match the
* width of the reference element.
* @see https://floating-ui.com/docs/size
*/
var size$1 = function(options) {
	if (options === void 0) options = {};
	return {
		name: "size",
		options,
		async fn(state) {
			const { placement, rects, platform, elements } = state;
			const { apply = () => {}, ...detectOverflowOptions } = evaluate(options, state);
			const overflow = await platform.detectOverflow(state, detectOverflowOptions);
			const side = getSide(placement);
			const alignment = getAlignment(placement);
			const isYAxis = getSideAxis(placement) === "y";
			const { width, height } = rects.floating;
			let heightSide;
			let widthSide;
			if (side === "top" || side === "bottom") {
				heightSide = side;
				widthSide = alignment === (await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
			} else {
				widthSide = side;
				heightSide = alignment === "end" ? "top" : "bottom";
			}
			const maximumClippingHeight = height - overflow.top - overflow.bottom;
			const maximumClippingWidth = width - overflow.left - overflow.right;
			const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
			const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
			const shiftData = state.middlewareData.shift;
			const noShift = !shiftData;
			let availableHeight = overflowAvailableHeight;
			let availableWidth = overflowAvailableWidth;
			if (shiftData != null && shiftData.enabled.x) availableWidth = maximumClippingWidth;
			if (shiftData != null && shiftData.enabled.y) availableHeight = maximumClippingHeight;
			if (noShift && !alignment) {
				if (isYAxis) availableWidth = width - 2 * max(overflow.left, overflow.right);
				else availableHeight = height - 2 * max(overflow.top, overflow.bottom);
			}
			await apply({
				...state,
				availableWidth,
				availableHeight
			});
			const nextDimensions = await platform.getDimensions(elements.floating);
			if (width !== nextDimensions.width || height !== nextDimensions.height) return { reset: { rects: true } };
			return {};
		}
	};
};
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function hasWindow() {
	return typeof window !== "undefined";
}
function getNodeName(node) {
	if (isNode(node)) return (node.nodeName || "").toLowerCase();
	return "#document";
}
function getWindow(node) {
	var _node$ownerDocument;
	return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
	var _ref;
	return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
	if (!hasWindow()) return false;
	return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
	if (!hasWindow()) return false;
	return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
	if (!hasWindow()) return false;
	return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
	if (!hasWindow() || typeof ShadowRoot === "undefined") return false;
	return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
	const { overflow, overflowX, overflowY, display } = getComputedStyle$1(element);
	return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
}
function isTableElement(element) {
	return /^(table|td|th)$/.test(getNodeName(element));
}
function isTopLayer(element) {
	try {
		if (element.matches(":popover-open")) return true;
	} catch (_e) {}
	try {
		return element.matches(":modal");
	} catch (_e) {
		return false;
	}
}
var willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
var containRe = /paint|layout|strict|content/;
var isNotNone = (value) => !!value && value !== "none";
var isWebKitValue;
function isContainingBlock(elementOrCss) {
	const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
	return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
}
function getContainingBlock(element) {
	let currentNode = getParentNode(element);
	while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
		if (isContainingBlock(currentNode)) return currentNode;
		else if (isTopLayer(currentNode)) return null;
		currentNode = getParentNode(currentNode);
	}
	return null;
}
function isWebKit() {
	if (isWebKitValue == null) isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
	return isWebKitValue;
}
function isLastTraversableNode(node) {
	return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle$1(element) {
	return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
	if (isElement(element)) return {
		scrollLeft: element.scrollLeft,
		scrollTop: element.scrollTop
	};
	return {
		scrollLeft: element.scrollX,
		scrollTop: element.scrollY
	};
}
function getParentNode(node) {
	if (getNodeName(node) === "html") return node;
	const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
	return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
	const parentNode = getParentNode(node);
	if (isLastTraversableNode(parentNode)) return (node.ownerDocument || node).body;
	if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
	return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
	var _node$ownerDocument2;
	if (list === void 0) list = [];
	if (traverseIframes === void 0) traverseIframes = true;
	const scrollableAncestor = getNearestOverflowAncestor(node);
	const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
	const win = getWindow(scrollableAncestor);
	if (isBody) {
		const frameElement = getFrameElement(win);
		return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
	} else return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
	return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
//#endregion
//#region node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
	const css = getComputedStyle$1(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const hasOffset = isHTMLElement(element);
	const offsetWidth = hasOffset ? element.offsetWidth : width;
	const offsetHeight = hasOffset ? element.offsetHeight : height;
	const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
	if (shouldFallback) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return {
		width,
		height,
		$: shouldFallback
	};
}
function unwrapElement(element) {
	return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
	const domElement = unwrapElement(element);
	if (!isHTMLElement(domElement)) return createCoords(1);
	const rect = domElement.getBoundingClientRect();
	const { width, height, $ } = getCssDimensions(domElement);
	let x = ($ ? round(rect.width) : rect.width) / width;
	let y = ($ ? round(rect.height) : rect.height) / height;
	if (!x || !Number.isFinite(x)) x = 1;
	if (!y || !Number.isFinite(y)) y = 1;
	return {
		x,
		y
	};
}
var noOffsets = /*#__PURE__*/ createCoords(0);
function getVisualOffsets(element) {
	const win = getWindow(element);
	if (!isWebKit() || !win.visualViewport) return noOffsets;
	return {
		x: win.visualViewport.offsetLeft,
		y: win.visualViewport.offsetTop
	};
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
	if (isFixed === void 0) isFixed = false;
	return !!floatingOffsetParent && isFixed && floatingOffsetParent === getWindow(element);
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
	if (includeScale === void 0) includeScale = false;
	if (isFixedStrategy === void 0) isFixedStrategy = false;
	const clientRect = element.getBoundingClientRect();
	const domElement = unwrapElement(element);
	let scale = createCoords(1);
	if (includeScale) {
		if (offsetParent) {
			if (isElement(offsetParent)) scale = getScale(offsetParent);
		} else scale = getScale(element);
	}
	const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
	let x = (clientRect.left + visualOffsets.x) / scale.x;
	let y = (clientRect.top + visualOffsets.y) / scale.y;
	let width = clientRect.width / scale.x;
	let height = clientRect.height / scale.y;
	if (domElement && offsetParent) {
		const win = getWindow(domElement);
		const offsetWin = isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
		let currentWin = win;
		let currentIFrame = getFrameElement(currentWin);
		while (currentIFrame && offsetWin !== currentWin) {
			const iframeScale = getScale(currentIFrame);
			const iframeRect = currentIFrame.getBoundingClientRect();
			const css = getComputedStyle$1(currentIFrame);
			const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
			const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
			x *= iframeScale.x;
			y *= iframeScale.y;
			width *= iframeScale.x;
			height *= iframeScale.y;
			x += left;
			y += top;
			currentWin = getWindow(currentIFrame);
			currentIFrame = getFrameElement(currentWin);
		}
	}
	return rectToClientRect({
		width,
		height,
		x,
		y
	});
}
function getWindowScrollBarX(element, rect) {
	const leftScroll = getNodeScroll(element).scrollLeft;
	if (!rect) return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
	return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
	const htmlRect = documentElement.getBoundingClientRect();
	return {
		x: htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect),
		y: htmlRect.top + scroll.scrollTop
	};
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
	let { elements, rect, offsetParent, strategy } = _ref;
	const isFixed = strategy === "fixed";
	const documentElement = getDocumentElement(offsetParent);
	const topLayer = elements ? isTopLayer(elements.floating) : false;
	if (offsetParent === documentElement || topLayer && isFixed) return rect;
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	let scale = createCoords(1);
	const offsets = createCoords(0);
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	if (isOffsetParentAnElement || !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isOffsetParentAnElement) {
			const offsetRect = getBoundingClientRect(offsetParent);
			scale = getScale(offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		}
	}
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	return {
		width: rect.width * scale.x,
		height: rect.height * scale.y,
		x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
		y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
	};
}
function getClientRects(element) {
	return element.getClientRects ? Array.from(element.getClientRects()) : [];
}
function getDocumentRect(html) {
	const scroll = getNodeScroll(html);
	const body = html.ownerDocument.body;
	const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
	const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
	let x = -scroll.scrollLeft + getWindowScrollBarX(html);
	const y = -scroll.scrollTop;
	if (getComputedStyle$1(body).direction === "rtl") x += max(html.clientWidth, body.clientWidth) - width;
	return {
		width,
		height,
		x,
		y
	};
}
var SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy, rootBoundary) {
	if (rootBoundary === void 0) rootBoundary = "viewport";
	const isLayoutViewport = rootBoundary === "layoutViewport";
	const win = getWindow(element);
	const html = getDocumentElement(element);
	const visualViewport = win.visualViewport;
	let width = html.clientWidth;
	let height = html.clientHeight;
	let x = 0;
	let y = 0;
	if (visualViewport) {
		const layoutRelativeClientCoords = !isWebKit() || strategy === "fixed";
		if (isLayoutViewport) {
			if (!layoutRelativeClientCoords) {
				x = -visualViewport.offsetLeft;
				y = -visualViewport.offsetTop;
			}
		} else {
			width = visualViewport.width;
			height = visualViewport.height;
			if (layoutRelativeClientCoords) {
				x = visualViewport.offsetLeft;
				y = visualViewport.offsetTop;
			}
		}
	}
	if (getWindowScrollBarX(html) <= 0) {
		const doc = html.ownerDocument;
		const body = doc.body;
		const bodyStyles = getComputedStyle(body);
		const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
		const reservedWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
		const gutter = getComputedStyle(html).scrollbarGutter === "stable both-edges" ? reservedWidth / 2 : reservedWidth;
		if (gutter <= SCROLLBAR_MAX) width -= gutter;
	}
	return {
		width,
		height,
		x,
		y
	};
}
function getInnerBoundingClientRect(element, strategy) {
	const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
	const top = clientRect.top + element.clientTop;
	const left = clientRect.left + element.clientLeft;
	const scale = getScale(element);
	return {
		width: element.clientWidth * scale.x,
		height: element.clientHeight * scale.y,
		x: left * scale.x,
		y: top * scale.y
	};
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
	let rect;
	if (clippingAncestor === "viewport" || clippingAncestor === "layoutViewport") rect = getViewportRect(element, strategy, clippingAncestor);
	else if (clippingAncestor === "document") rect = getDocumentRect(getDocumentElement(element));
	else if (isElement(clippingAncestor)) rect = getInnerBoundingClientRect(clippingAncestor, strategy);
	else {
		const visualOffsets = getVisualOffsets(element);
		rect = {
			x: clippingAncestor.x - visualOffsets.x,
			y: clippingAncestor.y - visualOffsets.y,
			width: clippingAncestor.width,
			height: clippingAncestor.height
		};
	}
	return rectToClientRect(rect);
}
function getClippingElementAncestors(element, cache) {
	const cachedResult = cache.get(element);
	if (cachedResult) return cachedResult;
	let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
	let lastKeptComputedStyle = null;
	const elementIsFixed = getComputedStyle$1(element).position === "fixed";
	let currentNode = elementIsFixed ? getParentNode(element) : element;
	while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
		const computedStyle = getComputedStyle$1(currentNode);
		const currentNodeIsContaining = isContainingBlock(currentNode);
		const lastPosition = lastKeptComputedStyle ? lastKeptComputedStyle.position : elementIsFixed ? "fixed" : "";
		if (!currentNodeIsContaining && (lastPosition === "fixed" || lastPosition === "absolute" && computedStyle.position === "static")) result = result.filter((ancestor) => ancestor !== currentNode);
		else lastKeptComputedStyle = computedStyle;
		currentNode = getParentNode(currentNode);
	}
	cache.set(element, result);
	return result;
}
function getClippingRect(_ref) {
	let { element, boundary, rootBoundary, strategy } = _ref;
	const clippingAncestors = [...boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary), rootBoundary];
	const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
	let top = firstRect.top;
	let right = firstRect.right;
	let bottom = firstRect.bottom;
	let left = firstRect.left;
	for (let i = 1; i < clippingAncestors.length; i++) {
		const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
		top = max(rect.top, top);
		right = min(rect.right, right);
		bottom = min(rect.bottom, bottom);
		left = max(rect.left, left);
	}
	return {
		width: right - left,
		height: bottom - top,
		x: left,
		y: top
	};
}
function getDimensions(element) {
	const { width, height } = getCssDimensions(element);
	return {
		width,
		height
	};
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
	const isOffsetParentAnElement = isHTMLElement(offsetParent);
	const documentElement = getDocumentElement(offsetParent);
	const isFixed = strategy === "fixed";
	const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
	let scroll = {
		scrollLeft: 0,
		scrollTop: 0
	};
	const offsets = createCoords(0);
	if (isOffsetParentAnElement || !isFixed) {
		if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) scroll = getNodeScroll(offsetParent);
		if (isOffsetParentAnElement) {
			const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
			offsets.x = offsetRect.x + offsetParent.clientLeft;
			offsets.y = offsetRect.y + offsetParent.clientTop;
		}
	}
	if (!isOffsetParentAnElement && documentElement) offsets.x = getWindowScrollBarX(documentElement);
	const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
	return {
		x: rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x,
		y: rect.top + scroll.scrollTop - offsets.y - htmlOffset.y,
		width: rect.width,
		height: rect.height
	};
}
function isStaticPositioned(element) {
	return getComputedStyle$1(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
	if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") return null;
	if (polyfill) return polyfill(element);
	let rawOffsetParent = element.offsetParent;
	if (getDocumentElement(element) === rawOffsetParent) rawOffsetParent = rawOffsetParent.ownerDocument.body;
	return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
	const win = getWindow(element);
	if (isTopLayer(element)) return win;
	if (!isHTMLElement(element)) {
		let svgOffsetParent = getParentNode(element);
		while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
			if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) return svgOffsetParent;
			svgOffsetParent = getParentNode(svgOffsetParent);
		}
		return win;
	}
	let offsetParent = getTrueOffsetParent(element, polyfill);
	while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) offsetParent = getTrueOffsetParent(offsetParent, polyfill);
	if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) return win;
	return offsetParent || getContainingBlock(element) || win;
}
var getElementRects = async function(data) {
	const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
	const getDimensionsFn = this.getDimensions;
	const floatingDimensions = await getDimensionsFn(data.floating);
	return {
		reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
		floating: {
			x: 0,
			y: 0,
			width: floatingDimensions.width,
			height: floatingDimensions.height
		}
	};
};
function isRTL(element) {
	return getComputedStyle$1(element).direction === "rtl";
}
var platform = {
	convertOffsetParentRelativeRectToViewportRelativeRect,
	getDocumentElement,
	getClippingRect,
	getOffsetParent,
	getElementRects,
	getClientRects,
	getDimensions,
	getScale,
	isElement,
	isRTL
};
/**
* Modifies the placement by translating the floating element along the
* specified axes.
* A number (shorthand for `mainAxis` or distance), or an axes configuration
* object may be passed.
* @see https://floating-ui.com/docs/offset
*/
var offset = offset$1;
/**
* Optimizes the visibility of the floating element by choosing the placement
* that has the most space available automatically, without needing to specify a
* preferred placement. Alternative to `flip`.
* @see https://floating-ui.com/docs/autoPlacement
*/
var autoPlacement = autoPlacement$1;
/**
* Optimizes the visibility of the floating element by shifting it in order to
* keep it in view when it will overflow the clipping boundary.
* @see https://floating-ui.com/docs/shift
*/
var shift = shift$1;
/**
* Optimizes the visibility of the floating element by flipping the `placement`
* in order to keep it in view when the preferred placement(s) will overflow the
* clipping boundary. Alternative to `autoPlacement`.
* @see https://floating-ui.com/docs/flip
*/
var flip = flip$1;
/**
* Provides data that allows you to change the size of the floating element —
* for instance, prevent it from overflowing the clipping boundary or match the
* width of the reference element.
* @see https://floating-ui.com/docs/size
*/
var size = size$1;
/**
* Provides data to position an inner element of the floating element so that it
* appears centered to the reference element.
* @see https://floating-ui.com/docs/arrow
*/
var arrow = arrow$1;
/**
* Computes the `x` and `y` coordinates that will place the floating element
* next to a given reference element.
*/
var computePosition = (reference, floating, options) => {
	const cache = /* @__PURE__ */ new Map();
	const mergedOptions = options != null ? options : {};
	const platformWithCache = {
		...platform,
		...mergedOptions.platform,
		_c: cache
	};
	return computePosition$1(reference, floating, {
		...mergedOptions,
		platform: platformWithCache
	});
};
//#endregion
//#region node_modules/.pnpm/floating-vue@5.4.0_@nuxt+kit@4.6.0_confbox@0.3.1_dotenv@17.4.2_giget@3.2.0_jiti@2.7.0_m_f6c6854e3786e195cec77fb5a11ac4c3/node_modules/floating-vue/dist/floating-vue.mjs
var config = {
	disabled: false,
	distance: 5,
	skidding: 0,
	container: "body",
	boundary: void 0,
	instantMove: false,
	disposeTimeout: 150,
	popperTriggers: [],
	strategy: "absolute",
	preventOverflow: true,
	flip: true,
	shift: true,
	overflowPadding: 0,
	arrowPadding: 0,
	arrowOverflow: true,
	/**
	* By default, compute autohide on 'click'.
	*/
	autoHideOnMousedown: false,
	themes: {
		tooltip: {
			placement: "top",
			triggers: [
				"hover",
				"focus",
				"touch"
			],
			hideTriggers: (events) => [...events, "click"],
			delay: {
				show: 200,
				hide: 0
			},
			handleResize: false,
			html: false,
			loadingContent: "..."
		},
		dropdown: {
			placement: "bottom",
			triggers: ["click"],
			delay: 0,
			handleResize: true,
			autoHide: true
		},
		menu: {
			$extend: "dropdown",
			triggers: ["hover", "focus"],
			popperTriggers: ["hover"],
			delay: {
				show: 0,
				hide: 400
			}
		}
	}
};
/**
* Get default config value depending on theme
*/
function getDefaultConfig(theme, key) {
	let themeConfig = config.themes[theme] || {};
	let value;
	do {
		value = themeConfig[key];
		if (typeof value === "undefined") {
			if (themeConfig.$extend) themeConfig = config.themes[themeConfig.$extend] || {};
			else {
				themeConfig = null;
				value = config[key];
			}
		} else themeConfig = null;
	} while (themeConfig);
	return value;
}
/**
* Theme CSS inheritance
*/
function getThemeClasses(theme) {
	const result = [theme];
	let themeConfig = config.themes[theme] || {};
	do
		if (themeConfig.$extend && !themeConfig.$resetCss) {
			result.push(themeConfig.$extend);
			themeConfig = config.themes[themeConfig.$extend] || {};
		} else themeConfig = null;
	while (themeConfig);
	return result.map((c) => `v-popper--theme-${c}`);
}
function getAllParentThemes(theme) {
	const result = [theme];
	let themeConfig = config.themes[theme] || {};
	do
		if (themeConfig.$extend) {
			result.push(themeConfig.$extend);
			themeConfig = config.themes[themeConfig.$extend] || {};
		} else themeConfig = null;
	while (themeConfig);
	return result;
}
var supportsPassive = (() => {
	if (typeof window === "undefined") return false;
	let supported = false;
	try {
		const opts = Object.defineProperty({}, "passive", { get() {
			supported = true;
		} });
		window.addEventListener("test", null, opts);
	} catch (_unused) {}
	return supported;
})();
var isIOS = typeof window !== "undefined" && typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var placements = [
	"auto",
	"top",
	"bottom",
	"left",
	"right"
].reduce((acc, base) => acc.concat([
	base,
	`${base}-start`,
	`${base}-end`
]), []);
var SHOW_EVENT_MAP = {
	hover: "mouseenter",
	focus: "focus",
	click: "click",
	touch: "touchstart",
	pointer: "pointerdown"
};
var HIDE_EVENT_MAP = {
	hover: "mouseleave",
	focus: "blur",
	click: "click",
	touch: "touchend",
	pointer: "pointerup"
};
function removeFromArray(array, item) {
	const index = array.indexOf(item);
	if (index !== -1) array.splice(index, 1);
}
function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => {
		requestAnimationFrame(resolve);
	}));
}
var shownPoppers = [];
var hidingPopper = null;
var shownPoppersByTheme = {};
function getShownPoppersByTheme(theme) {
	let list = shownPoppersByTheme[theme];
	if (!list) list = shownPoppersByTheme[theme] = [];
	return list;
}
var Element$1 = function() {};
if (typeof window !== "undefined") Element$1 = window.Element;
function defaultPropFactory(prop) {
	return function(props) {
		return getDefaultConfig(props.theme, prop);
	};
}
var PROVIDE_KEY = "__floating-vue__popper";
var createPopper = () => defineComponent({
	name: "VPopper",
	provide() {
		return { [PROVIDE_KEY]: { parentPopper: this } };
	},
	inject: { [PROVIDE_KEY]: { default: null } },
	props: {
		theme: {
			type: String,
			required: true
		},
		targetNodes: {
			type: Function,
			required: true
		},
		referenceNode: {
			type: Function,
			default: null
		},
		popperNode: {
			type: Function,
			required: true
		},
		shown: {
			type: Boolean,
			default: false
		},
		showGroup: {
			type: String,
			default: null
		},
		ariaId: { default: null },
		disabled: {
			type: Boolean,
			default: defaultPropFactory("disabled")
		},
		positioningDisabled: {
			type: Boolean,
			default: defaultPropFactory("positioningDisabled")
		},
		placement: {
			type: String,
			default: defaultPropFactory("placement"),
			validator: (value) => placements.includes(value)
		},
		delay: {
			type: [
				String,
				Number,
				Object
			],
			default: defaultPropFactory("delay")
		},
		distance: {
			type: [Number, String],
			default: defaultPropFactory("distance")
		},
		skidding: {
			type: [Number, String],
			default: defaultPropFactory("skidding")
		},
		triggers: {
			type: Array,
			default: defaultPropFactory("triggers")
		},
		showTriggers: {
			type: [Array, Function],
			default: defaultPropFactory("showTriggers")
		},
		hideTriggers: {
			type: [Array, Function],
			default: defaultPropFactory("hideTriggers")
		},
		popperTriggers: {
			type: Array,
			default: defaultPropFactory("popperTriggers")
		},
		popperShowTriggers: {
			type: [Array, Function],
			default: defaultPropFactory("popperShowTriggers")
		},
		popperHideTriggers: {
			type: [Array, Function],
			default: defaultPropFactory("popperHideTriggers")
		},
		container: {
			type: [
				String,
				Object,
				Element$1,
				Boolean
			],
			default: defaultPropFactory("container")
		},
		boundary: {
			type: [String, Element$1],
			default: defaultPropFactory("boundary")
		},
		strategy: {
			type: String,
			validator: (value) => ["absolute", "fixed"].includes(value),
			default: defaultPropFactory("strategy")
		},
		autoHide: {
			type: [Boolean, Function],
			default: defaultPropFactory("autoHide")
		},
		handleResize: {
			type: Boolean,
			default: defaultPropFactory("handleResize")
		},
		instantMove: {
			type: Boolean,
			default: defaultPropFactory("instantMove")
		},
		eagerMount: {
			type: Boolean,
			default: defaultPropFactory("eagerMount")
		},
		popperClass: {
			type: [
				String,
				Array,
				Object
			],
			default: defaultPropFactory("popperClass")
		},
		computeTransformOrigin: {
			type: Boolean,
			default: defaultPropFactory("computeTransformOrigin")
		},
		/**
		* @deprecated
		*/
		autoMinSize: {
			type: Boolean,
			default: defaultPropFactory("autoMinSize")
		},
		autoSize: {
			type: [Boolean, String],
			default: defaultPropFactory("autoSize")
		},
		/**
		* @deprecated
		*/
		autoMaxSize: {
			type: Boolean,
			default: defaultPropFactory("autoMaxSize")
		},
		autoBoundaryMaxSize: {
			type: Boolean,
			default: defaultPropFactory("autoBoundaryMaxSize")
		},
		preventOverflow: {
			type: Boolean,
			default: defaultPropFactory("preventOverflow")
		},
		overflowPadding: {
			type: [Number, String],
			default: defaultPropFactory("overflowPadding")
		},
		arrowPadding: {
			type: [Number, String],
			default: defaultPropFactory("arrowPadding")
		},
		arrowOverflow: {
			type: Boolean,
			default: defaultPropFactory("arrowOverflow")
		},
		flip: {
			type: Boolean,
			default: defaultPropFactory("flip")
		},
		shift: {
			type: Boolean,
			default: defaultPropFactory("shift")
		},
		shiftCrossAxis: {
			type: Boolean,
			default: defaultPropFactory("shiftCrossAxis")
		},
		noAutoFocus: {
			type: Boolean,
			default: defaultPropFactory("noAutoFocus")
		},
		disposeTimeout: {
			type: Number,
			default: defaultPropFactory("disposeTimeout")
		}
	},
	emits: {
		show: () => true,
		hide: () => true,
		"update:shown": (_shown) => true,
		"apply-show": () => true,
		"apply-hide": () => true,
		"close-group": () => true,
		"close-directive": () => true,
		"auto-hide": () => true,
		resize: () => true
	},
	data() {
		return {
			isShown: false,
			isMounted: false,
			skipTransition: false,
			classes: {
				showFrom: false,
				showTo: false,
				hideFrom: false,
				hideTo: true
			},
			result: {
				x: 0,
				y: 0,
				placement: "",
				strategy: this.strategy,
				arrow: {
					x: 0,
					y: 0,
					centerOffset: 0
				},
				transformOrigin: null
			},
			randomId: `popper_${[Math.random(), Date.now()].map((n) => n.toString(36).substring(2, 10)).join("_")}`,
			shownChildren: /* @__PURE__ */ new Set(),
			lastAutoHide: true,
			pendingHide: false,
			containsGlobalTarget: false,
			isDisposed: true,
			mouseDownContains: false
		};
	},
	computed: {
		popperId() {
			var _this$ariaId;
			return (_this$ariaId = this.ariaId) !== null && _this$ariaId !== void 0 ? _this$ariaId : this.randomId;
		},
		shouldMountContent() {
			return this.eagerMount || this.isMounted;
		},
		slotData() {
			return {
				popperId: this.popperId,
				isShown: this.isShown,
				shouldMountContent: this.shouldMountContent,
				skipTransition: this.skipTransition,
				autoHide: typeof this.autoHide === "function" ? this.lastAutoHide : this.autoHide,
				show: this.show,
				hide: this.hide,
				handleResize: this.handleResize,
				onResize: this.onResize,
				classes: {
					...this.classes,
					popperClass: this.popperClass
				},
				result: this.positioningDisabled ? null : this.result,
				attrs: this.$attrs
			};
		},
		parentPopper() {
			var _this$PROVIDE_KEY;
			return (_this$PROVIDE_KEY = this[PROVIDE_KEY]) === null || _this$PROVIDE_KEY === void 0 ? void 0 : _this$PROVIDE_KEY.parentPopper;
		},
		hasPopperShowTriggerHover() {
			var _this$popperTriggers, _this$popperShowTrigg;
			return ((_this$popperTriggers = this.popperTriggers) === null || _this$popperTriggers === void 0 ? void 0 : _this$popperTriggers.includes("hover")) || ((_this$popperShowTrigg = this.popperShowTriggers) === null || _this$popperShowTrigg === void 0 ? void 0 : _this$popperShowTrigg.includes("hover"));
		}
	},
	watch: {
		shown: "$_autoShowHide",
		disabled(value) {
			if (value) this.dispose();
			else this.init();
		},
		async container() {
			if (this.isShown) {
				this.$_ensureTeleport();
				await this.$_computePosition();
			}
		},
		triggers: {
			handler: "$_refreshListeners",
			deep: true
		},
		positioningDisabled: "$_refreshListeners",
		...[
			"placement",
			"distance",
			"skidding",
			"boundary",
			"strategy",
			"overflowPadding",
			"arrowPadding",
			"preventOverflow",
			"shift",
			"shiftCrossAxis",
			"flip"
		].reduce((acc, prop) => {
			acc[prop] = "$_computePosition";
			return acc;
		}, {})
	},
	created() {
		if (this.autoMinSize) console.warn("[floating-vue] `autoMinSize` option is deprecated. Use `autoSize=\"min\"` instead.");
		if (this.autoMaxSize) console.warn("[floating-vue] `autoMaxSize` option is deprecated. Use `autoBoundaryMaxSize` instead.");
	},
	mounted() {
		this.init();
		this.$_detachPopperNode();
	},
	activated() {
		this.$_autoShowHide();
	},
	deactivated() {
		this.hide();
	},
	beforeUnmount() {
		this.dispose();
	},
	methods: {
		show({ event = null, skipDelay = false, force = false } = {}) {
			var _this$parentPopper;
			if (((_this$parentPopper = this.parentPopper) === null || _this$parentPopper === void 0 ? void 0 : _this$parentPopper.lockedChild) && this.parentPopper.lockedChild !== this) return;
			this.pendingHide = false;
			if (force || !this.disabled) {
				var _this$parentPopper2;
				if (((_this$parentPopper2 = this.parentPopper) === null || _this$parentPopper2 === void 0 ? void 0 : _this$parentPopper2.lockedChild) === this) this.parentPopper.lockedChild = null;
				this.$_scheduleShow(event, skipDelay);
				this.$emit("show");
				this.$_showFrameLocked = true;
				requestAnimationFrame(() => {
					this.$_showFrameLocked = false;
				});
			}
			this.$emit("update:shown", true);
		},
		hide({ event = null, skipDelay = false } = {}) {
			var _this$parentPopper3;
			if (this.$_hideInProgress) return;
			if (this.shownChildren.size > 0) {
				this.pendingHide = true;
				return;
			}
			if (this.hasPopperShowTriggerHover && this.$_isAimingPopper()) {
				if (this.parentPopper) {
					this.parentPopper.lockedChild = this;
					if (this.parentPopper.lockedChildTimer) clearTimeout(this.parentPopper.lockedChildTimer);
					this.parentPopper.lockedChildTimer = setTimeout(() => {
						if (this.parentPopper.lockedChild === this) {
							this.parentPopper.lockedChild.hide({ skipDelay });
							this.parentPopper.lockedChild = null;
						}
					}, 1e3);
				}
				return;
			}
			if (((_this$parentPopper3 = this.parentPopper) === null || _this$parentPopper3 === void 0 ? void 0 : _this$parentPopper3.lockedChild) === this) this.parentPopper.lockedChild = null;
			this.pendingHide = false;
			this.$_scheduleHide(event, skipDelay);
			this.$emit("hide");
			this.$emit("update:shown", false);
		},
		init() {
			var _this$referenceNode, _this$referenceNode2;
			if (!this.isDisposed) return;
			this.isDisposed = false;
			this.isMounted = false;
			this.$_events = [];
			this.$_preventShow = false;
			this.$_referenceNode = (_this$referenceNode = (_this$referenceNode2 = this.referenceNode) === null || _this$referenceNode2 === void 0 ? void 0 : _this$referenceNode2.call(this)) !== null && _this$referenceNode !== void 0 ? _this$referenceNode : this.$el;
			this.$_targetNodes = this.targetNodes().filter((e) => e.nodeType === e.ELEMENT_NODE);
			this.$_popperNode = this.popperNode();
			this.$_innerNode = this.$_popperNode.querySelector(".v-popper__inner");
			this.$_arrowNode = this.$_popperNode.querySelector(".v-popper__arrow-container");
			this.$_swapTargetAttrs("title", "data-original-title");
			this.$_detachPopperNode();
			if (this.triggers.length) this.$_addEventListeners();
			if (this.shown) this.show();
		},
		dispose() {
			if (this.isDisposed) return;
			this.isDisposed = true;
			this.$_removeEventListeners();
			this.hide({ skipDelay: true });
			this.$_detachPopperNode();
			this.isMounted = false;
			this.isShown = false;
			this.$_updateParentShownChildren(false);
			this.$_swapTargetAttrs("data-original-title", "title");
		},
		async onResize() {
			if (this.isShown) {
				await this.$_computePosition();
				this.$emit("resize");
			}
		},
		async $_computePosition() {
			if (this.isDisposed || this.positioningDisabled) return;
			const options = {
				strategy: this.strategy,
				middleware: []
			};
			if (this.distance || this.skidding) options.middleware.push(offset({
				mainAxis: this.distance,
				crossAxis: this.skidding
			}));
			const isPlacementAuto = this.placement.startsWith("auto");
			if (isPlacementAuto) {
				var _this$placement$split;
				options.middleware.push(autoPlacement({ alignment: (_this$placement$split = this.placement.split("-")[1]) !== null && _this$placement$split !== void 0 ? _this$placement$split : "" }));
			} else options.placement = this.placement;
			if (this.preventOverflow) {
				if (this.shift) options.middleware.push(shift({
					padding: this.overflowPadding,
					boundary: this.boundary,
					crossAxis: this.shiftCrossAxis
				}));
				if (!isPlacementAuto && this.flip) options.middleware.push(flip({
					padding: this.overflowPadding,
					boundary: this.boundary
				}));
			}
			options.middleware.push(arrow({
				element: this.$_arrowNode,
				padding: this.arrowPadding
			}));
			if (this.arrowOverflow) options.middleware.push({
				name: "arrowOverflow",
				fn: ({ placement, rects, middlewareData }) => {
					let overflow;
					const { centerOffset } = middlewareData.arrow;
					if (placement.startsWith("top") || placement.startsWith("bottom")) overflow = Math.abs(centerOffset) > rects.reference.width / 2;
					else overflow = Math.abs(centerOffset) > rects.reference.height / 2;
					return { data: { overflow } };
				}
			});
			if (this.autoMinSize || this.autoSize) {
				const autoSize = this.autoSize ? this.autoSize : this.autoMinSize ? "min" : null;
				options.middleware.push({
					name: "autoSize",
					fn: ({ rects, placement, middlewareData }) => {
						var _middlewareData$autoS;
						if ((_middlewareData$autoS = middlewareData.autoSize) === null || _middlewareData$autoS === void 0 ? void 0 : _middlewareData$autoS.skip) return {};
						let width;
						let height;
						if (placement.startsWith("top") || placement.startsWith("bottom")) width = rects.reference.width;
						else height = rects.reference.height;
						this.$_innerNode.style[autoSize === "min" ? "minWidth" : autoSize === "max" ? "maxWidth" : "width"] = width != null ? `${width}px` : null;
						this.$_innerNode.style[autoSize === "min" ? "minHeight" : autoSize === "max" ? "maxHeight" : "height"] = height != null ? `${height}px` : null;
						return {
							data: { skip: true },
							reset: { rects: true }
						};
					}
				});
			}
			if (this.autoMaxSize || this.autoBoundaryMaxSize) {
				this.$_innerNode.style.maxWidth = null;
				this.$_innerNode.style.maxHeight = null;
				options.middleware.push(size({
					boundary: this.boundary,
					padding: this.overflowPadding,
					apply: ({ availableWidth, availableHeight }) => {
						this.$_innerNode.style.maxWidth = availableWidth != null ? `${availableWidth}px` : null;
						this.$_innerNode.style.maxHeight = availableHeight != null ? `${availableHeight}px` : null;
					}
				}));
			}
			const data = await computePosition(this.$_referenceNode, this.$_popperNode, options);
			Object.assign(this.result, {
				x: data.x,
				y: data.y,
				placement: data.placement,
				strategy: data.strategy,
				arrow: {
					...data.middlewareData.arrow,
					...data.middlewareData.arrowOverflow
				}
			});
		},
		$_scheduleShow(_event, skipDelay = false) {
			this.$_updateParentShownChildren(true);
			this.$_hideInProgress = false;
			clearTimeout(this.$_scheduleTimer);
			if (hidingPopper && this.instantMove && hidingPopper.instantMove && hidingPopper !== this.parentPopper) {
				hidingPopper.$_applyHide(true);
				this.$_applyShow(true);
				return;
			}
			if (skipDelay) this.$_applyShow();
			else this.$_scheduleTimer = setTimeout(this.$_applyShow.bind(this), this.$_computeDelay("show"));
		},
		$_scheduleHide(_event, skipDelay = false) {
			if (this.shownChildren.size > 0) {
				this.pendingHide = true;
				return;
			}
			this.$_updateParentShownChildren(false);
			this.$_hideInProgress = true;
			if (this.$_scheduleTimer) clearTimeout(this.$_scheduleTimer);
			if (this.isShown) hidingPopper = this;
			if (skipDelay) this.$_applyHide();
			else this.$_scheduleTimer = setTimeout(this.$_applyHide.bind(this), this.$_computeDelay("hide"));
		},
		$_computeDelay(type) {
			const delay = this.delay;
			return parseInt(delay && delay[type] || delay || 0);
		},
		async $_applyShow(skipTransition = false) {
			if (this.$_disposeTimer) clearTimeout(this.$_disposeTimer);
			if (this.$_scheduleTimer) clearTimeout(this.$_scheduleTimer);
			this.skipTransition = skipTransition;
			if (this.isShown) return;
			this.$_ensureTeleport();
			await nextFrame();
			await this.$_computePosition();
			await this.$_applyShowEffect();
			if (!this.positioningDisabled) this.$_registerEventListeners([...getOverflowAncestors(this.$_referenceNode), ...getOverflowAncestors(this.$_popperNode)], "scroll", () => {
				this.$_computePosition();
			});
		},
		async $_applyShowEffect() {
			if (this.$_hideInProgress) return;
			if (this.computeTransformOrigin) {
				const bounds = this.$_referenceNode.getBoundingClientRect();
				const popperWrapper = this.$_popperNode.querySelector(".v-popper__wrapper");
				const parentBounds = popperWrapper.parentNode.getBoundingClientRect();
				const x = bounds.x + bounds.width / 2 - (parentBounds.left + popperWrapper.offsetLeft);
				const y = bounds.y + bounds.height / 2 - (parentBounds.top + popperWrapper.offsetTop);
				this.result.transformOrigin = `${x}px ${y}px`;
			}
			this.isShown = true;
			this.$_applyAttrsToTarget({
				"aria-describedby": this.popperId,
				"data-popper-shown": ""
			});
			const showGroup = this.showGroup;
			if (showGroup) {
				let popover;
				for (let i = 0; i < shownPoppers.length; i++) {
					popover = shownPoppers[i];
					if (popover.showGroup !== showGroup) {
						popover.hide();
						popover.$emit("close-group");
					}
				}
			}
			shownPoppers.push(this);
			document.body.classList.add("v-popper--some-open");
			for (const theme of getAllParentThemes(this.theme)) {
				getShownPoppersByTheme(theme).push(this);
				document.body.classList.add(`v-popper--some-open--${theme}`);
			}
			this.$emit("apply-show");
			this.classes.showFrom = true;
			this.classes.showTo = false;
			this.classes.hideFrom = false;
			this.classes.hideTo = false;
			await nextFrame();
			this.classes.showFrom = false;
			this.classes.showTo = true;
			if (!this.noAutoFocus) this.$_popperNode.focus();
		},
		async $_applyHide(skipTransition = false) {
			if (this.shownChildren.size > 0) {
				this.pendingHide = true;
				this.$_hideInProgress = false;
				return;
			}
			if (this.$_scheduleTimer) clearTimeout(this.$_scheduleTimer);
			if (!this.isShown) return;
			this.skipTransition = skipTransition;
			removeFromArray(shownPoppers, this);
			if (shownPoppers.length === 0) document.body.classList.remove("v-popper--some-open");
			for (const theme of getAllParentThemes(this.theme)) {
				const list = getShownPoppersByTheme(theme);
				removeFromArray(list, this);
				if (list.length === 0) document.body.classList.remove(`v-popper--some-open--${theme}`);
			}
			if (hidingPopper === this) hidingPopper = null;
			this.isShown = false;
			this.$_applyAttrsToTarget({
				"aria-describedby": void 0,
				"data-popper-shown": void 0
			});
			if (this.$_disposeTimer) clearTimeout(this.$_disposeTimer);
			const disposeTime = this.disposeTimeout;
			if (disposeTime !== null) this.$_disposeTimer = setTimeout(() => {
				if (this.$_popperNode) {
					this.$_detachPopperNode();
					this.isMounted = false;
				}
			}, disposeTime);
			this.$_removeEventListeners("scroll");
			this.$emit("apply-hide");
			this.classes.showFrom = false;
			this.classes.showTo = false;
			this.classes.hideFrom = true;
			this.classes.hideTo = false;
			await nextFrame();
			this.classes.hideFrom = false;
			this.classes.hideTo = true;
		},
		$_autoShowHide() {
			if (this.shown) this.show();
			else this.hide();
		},
		$_ensureTeleport() {
			if (this.isDisposed) return;
			let container = this.container;
			if (typeof container === "string") container = window.document.querySelector(container);
			else if (container === false) container = this.$_targetNodes[0].parentNode;
			if (!container) throw new Error(`No container for popover: ${this.container}`);
			container.appendChild(this.$_popperNode);
			this.isMounted = true;
		},
		$_addEventListeners() {
			const handleShow = (event) => {
				if (this.isShown && !this.$_hideInProgress) return;
				event.usedByTooltip = true;
				!this.$_preventShow && this.show({ event });
			};
			this.$_registerTriggerListeners(this.$_targetNodes, SHOW_EVENT_MAP, this.triggers, this.showTriggers, handleShow);
			this.$_registerTriggerListeners([this.$_popperNode], SHOW_EVENT_MAP, this.popperTriggers, this.popperShowTriggers, handleShow);
			const handleHide = (event) => {
				if (event.usedByTooltip) return;
				this.hide({ event });
			};
			this.$_registerTriggerListeners(this.$_targetNodes, HIDE_EVENT_MAP, this.triggers, this.hideTriggers, handleHide);
			this.$_registerTriggerListeners([this.$_popperNode], HIDE_EVENT_MAP, this.popperTriggers, this.popperHideTriggers, handleHide);
		},
		$_registerEventListeners(targetNodes, eventType, handler) {
			this.$_events.push({
				targetNodes,
				eventType,
				handler
			});
			targetNodes.forEach((node) => node.addEventListener(eventType, handler, supportsPassive ? { passive: true } : void 0));
		},
		$_registerTriggerListeners(targetNodes, eventMap, commonTriggers, customTrigger, handler) {
			let triggers = commonTriggers;
			if (customTrigger != null) triggers = typeof customTrigger === "function" ? customTrigger(triggers) : customTrigger;
			triggers.forEach((trigger) => {
				const eventType = eventMap[trigger];
				if (eventType) this.$_registerEventListeners(targetNodes, eventType, handler);
			});
		},
		$_removeEventListeners(filterEventType) {
			const newList = [];
			this.$_events.forEach((listener) => {
				const { targetNodes, eventType, handler } = listener;
				if (!filterEventType || filterEventType === eventType) targetNodes.forEach((node) => node.removeEventListener(eventType, handler));
				else newList.push(listener);
			});
			this.$_events = newList;
		},
		$_refreshListeners() {
			if (!this.isDisposed) {
				this.$_removeEventListeners();
				this.$_addEventListeners();
			}
		},
		$_handleGlobalClose(event, touch = false) {
			if (this.$_showFrameLocked) return;
			this.hide({ event });
			if (event.closePopover) this.$emit("close-directive");
			else this.$emit("auto-hide");
			if (touch) {
				this.$_preventShow = true;
				setTimeout(() => {
					this.$_preventShow = false;
				}, 300);
			}
		},
		$_detachPopperNode() {
			this.$_popperNode.parentNode && this.$_popperNode.parentNode.removeChild(this.$_popperNode);
		},
		$_swapTargetAttrs(attrFrom, attrTo) {
			for (const el of this.$_targetNodes) {
				const value = el.getAttribute(attrFrom);
				if (value) {
					el.removeAttribute(attrFrom);
					el.setAttribute(attrTo, value);
				}
			}
		},
		$_applyAttrsToTarget(attrs) {
			for (const el of this.$_targetNodes) for (const n in attrs) {
				const value = attrs[n];
				if (value == null) el.removeAttribute(n);
				else el.setAttribute(n, value);
			}
		},
		$_updateParentShownChildren(value) {
			let parent = this.parentPopper;
			while (parent) {
				if (value) parent.shownChildren.add(this.randomId);
				else {
					parent.shownChildren.delete(this.randomId);
					if (parent.pendingHide) parent.hide();
				}
				parent = parent.parentPopper;
			}
		},
		$_isAimingPopper() {
			const referenceBounds = this.$_referenceNode.getBoundingClientRect();
			if (mouseX >= referenceBounds.left && mouseX <= referenceBounds.right && mouseY >= referenceBounds.top && mouseY <= referenceBounds.bottom) {
				const popperBounds = this.$_popperNode.getBoundingClientRect();
				const vectorX = mouseX - mousePreviousX;
				const vectorY = mouseY - mousePreviousY;
				const newVectorLength = popperBounds.left + popperBounds.width / 2 - mousePreviousX + (popperBounds.top + popperBounds.height / 2) - mousePreviousY + popperBounds.width + popperBounds.height;
				const edgeX = mousePreviousX + vectorX * newVectorLength;
				const edgeY = mousePreviousY + vectorY * newVectorLength;
				return lineIntersectsLine(mousePreviousX, mousePreviousY, edgeX, edgeY, popperBounds.left, popperBounds.top, popperBounds.left, popperBounds.bottom) || lineIntersectsLine(mousePreviousX, mousePreviousY, edgeX, edgeY, popperBounds.left, popperBounds.top, popperBounds.right, popperBounds.top) || lineIntersectsLine(mousePreviousX, mousePreviousY, edgeX, edgeY, popperBounds.right, popperBounds.top, popperBounds.right, popperBounds.bottom) || lineIntersectsLine(mousePreviousX, mousePreviousY, edgeX, edgeY, popperBounds.left, popperBounds.bottom, popperBounds.right, popperBounds.bottom);
			}
			return false;
		}
	},
	render() {
		return this.$slots.default(this.slotData);
	}
});
if (typeof document !== "undefined" && typeof window !== "undefined") {
	if (isIOS) {
		const options = supportsPassive ? {
			passive: true,
			capture: true
		} : true;
		document.addEventListener("touchstart", (event) => handleGlobalPointerDown(event, true), options);
		document.addEventListener("touchend", (event) => handleGlobalPointerUp(event, true), options);
	} else {
		window.addEventListener("mousedown", (event) => handleGlobalPointerDown(event, false), true);
		window.addEventListener("click", (event) => handleGlobalPointerUp(event, false), true);
	}
	window.addEventListener("resize", recomputeAllPoppers);
}
function handleGlobalPointerDown(event, touch) {
	if (config.autoHideOnMousedown) handleGlobalClose(event, touch);
	else for (let i = 0; i < shownPoppers.length; i++) {
		const popper = shownPoppers[i];
		try {
			popper.mouseDownContains = popper.popperNode().contains(event.target);
		} catch (_unused) {}
	}
}
function handleGlobalPointerUp(event, touch) {
	if (!config.autoHideOnMousedown) handleGlobalClose(event, touch);
}
function handleGlobalClose(event, touch) {
	const preventClose = {};
	for (let i = shownPoppers.length - 1; i >= 0; i--) {
		const popper = shownPoppers[i];
		try {
			const childrenContains = Array.from(popper.shownChildren).some((id) => {
				const child = shownPoppers.find((p) => p.randomId === id);
				return child && child.popperNode().contains(event.target);
			});
			const contains = popper.containsGlobalTarget = popper.mouseDownContains || popper.popperNode().contains(event.target) || childrenContains;
			popper.pendingHide = false;
			requestAnimationFrame(() => {
				popper.pendingHide = false;
				if (preventClose[popper.randomId]) return;
				if (shouldAutoHide(popper, contains, event)) {
					popper.$_handleGlobalClose(event, touch);
					if (!event.closeAllPopover && event.closePopover && contains) {
						let parent = popper.parentPopper;
						while (parent) {
							preventClose[parent.randomId] = true;
							parent = parent.parentPopper;
						}
						return;
					}
					let parent = popper.parentPopper;
					while (parent) {
						if (shouldAutoHide(parent, parent.containsGlobalTarget, event)) parent.$_handleGlobalClose(event, touch);
						else break;
						parent = parent.parentPopper;
					}
				}
			});
		} catch (_unused2) {}
	}
}
function shouldAutoHide(popper, contains, event) {
	return event.closeAllPopover || event.closePopover && contains || getAutoHideResult(popper, event) && !contains;
}
function getAutoHideResult(popper, event) {
	if (typeof popper.autoHide === "function") {
		const result = popper.autoHide(event);
		popper.lastAutoHide = result;
		return result;
	}
	return popper.autoHide;
}
function recomputeAllPoppers() {
	for (let i = 0; i < shownPoppers.length; i++) shownPoppers[i].$_computePosition();
}
var mousePreviousX = 0;
var mousePreviousY = 0;
var mouseX = 0;
var mouseY = 0;
if (typeof window !== "undefined") window.addEventListener("mousemove", (event) => {
	mousePreviousX = mouseX;
	mousePreviousY = mouseY;
	mouseX = event.clientX;
	mouseY = event.clientY;
}, supportsPassive ? { passive: true } : void 0);
function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
	const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}
var PopperRoot = defineComponent({
	extends: createPopper(),
	render() {
		var _this$$slots$default, _this$$slots;
		return h("div", {
			ref: "reference",
			class: ["v-popper", { "v-popper--shown": this.slotData.isShown }]
		}, (_this$$slots$default = (_this$$slots = this.$slots).default) === null || _this$$slots$default === void 0 ? void 0 : _this$$slots$default.call(_this$$slots, this.slotData));
	}
});
var ThemeClass = (prop = "theme") => ({ computed: { themeClass() {
	return getThemeClasses(this[prop]);
} } });
var PopperContent = defineComponent({
	name: "VPopperContent",
	mixins: [ThemeClass()],
	props: {
		popperId: String,
		theme: String,
		shown: Boolean,
		mounted: Boolean,
		skipTransition: Boolean,
		autoHide: Boolean,
		handleResize: Boolean,
		classes: Object,
		result: Object
	},
	emits: ["hide", "resize"],
	mounted() {
		if (this.handleResize) {
			this.$_resizeObserver = new ResizeObserver(() => this.$emit("resize"));
			this.$_resizeObserver.observe(this.$refs.inner);
		}
	},
	beforeUnmount() {
		var _this$$_resizeObserve;
		(_this$$_resizeObserve = this.$_resizeObserver) === null || _this$$_resizeObserve === void 0 || _this$$_resizeObserve.disconnect();
	},
	methods: { toPx(value) {
		if (value != null && !Number.isNaN(value)) return `${value}px`;
		return null;
	} },
	render() {
		var _this$$slots$default, _this$$slots;
		const { autoHide, classes, result, shown } = this;
		return h("div", {
			id: this.popperId,
			ref: "popover",
			"data-allow-mismatch": "",
			class: [
				"v-popper__popper",
				this.themeClass,
				classes.popperClass,
				{
					"v-popper__popper--shown": shown,
					"v-popper__popper--hidden": !shown,
					"v-popper__popper--show-from": classes.showFrom,
					"v-popper__popper--show-to": classes.showTo,
					"v-popper__popper--hide-from": classes.hideFrom,
					"v-popper__popper--hide-to": classes.hideTo,
					"v-popper__popper--skip-transition": this.skipTransition,
					"v-popper__popper--arrow-overflow": result && result.arrow.overflow,
					"v-popper__popper--no-positioning": !result
				}
			],
			style: result ? {
				position: result.strategy,
				transform: `translate3d(${Math.round(result.x)}px,${Math.round(result.y)}px,0)`
			} : void 0,
			"aria-hidden": shown || autoHide ? "false" : "true",
			tabindex: autoHide ? 0 : void 0,
			"data-popper-placement": result ? result.placement : void 0,
			onKeyup: (event) => {
				if (event.key === "Escape" && autoHide) this.$emit("hide");
			}
		}, [h("div", {
			class: "v-popper__backdrop",
			onClick: () => autoHide && this.$emit("hide")
		}), h("div", {
			class: "v-popper__wrapper",
			style: result ? { transformOrigin: result.transformOrigin } : void 0
		}, [h("div", {
			ref: "inner",
			class: "v-popper__inner"
		}, this.mounted ? [h("div", (_this$$slots$default = (_this$$slots = this.$slots).default) === null || _this$$slots$default === void 0 ? void 0 : _this$$slots$default.call(_this$$slots))] : void 0), h("div", {
			ref: "arrow",
			class: "v-popper__arrow-container",
			style: result ? {
				left: this.toPx(result.arrow.x),
				top: this.toPx(result.arrow.y)
			} : void 0
		}, [h("div", { class: "v-popper__arrow-outer" }), h("div", { class: "v-popper__arrow-inner" })])])]);
	}
});
var PopperMethods = { methods: {
	show(...args) {
		return this.$refs.popper.show(...args);
	},
	hide(...args) {
		return this.$refs.popper.hide(...args);
	},
	dispose(...args) {
		return this.$refs.popper.dispose(...args);
	},
	onResize(...args) {
		return this.$refs.popper.onResize(...args);
	}
} };
var Element$2 = function() {};
if (typeof window !== "undefined") Element$2 = window.Element;
var PopperWrapper = defineComponent({
	name: "VPopperWrapper",
	mixins: [PopperMethods, ThemeClass("finalTheme")],
	props: {
		theme: {
			type: String,
			default: null
		},
		referenceNode: {
			type: Function,
			default: null
		},
		shown: {
			type: Boolean,
			default: false
		},
		showGroup: {
			type: String,
			default: null
		},
		ariaId: { default: null },
		disabled: {
			type: Boolean,
			default: void 0
		},
		positioningDisabled: {
			type: Boolean,
			default: void 0
		},
		placement: {
			type: String,
			default: void 0
		},
		delay: {
			type: [
				String,
				Number,
				Object
			],
			default: void 0
		},
		distance: {
			type: [Number, String],
			default: void 0
		},
		skidding: {
			type: [Number, String],
			default: void 0
		},
		triggers: {
			type: Array,
			default: void 0
		},
		showTriggers: {
			type: [Array, Function],
			default: void 0
		},
		hideTriggers: {
			type: [Array, Function],
			default: void 0
		},
		popperTriggers: {
			type: Array,
			default: void 0
		},
		popperShowTriggers: {
			type: [Array, Function],
			default: void 0
		},
		popperHideTriggers: {
			type: [Array, Function],
			default: void 0
		},
		container: {
			type: [
				String,
				Object,
				Element$2,
				Boolean
			],
			default: void 0
		},
		boundary: {
			type: [String, Element$2],
			default: void 0
		},
		strategy: {
			type: String,
			default: void 0
		},
		autoHide: {
			type: [Boolean, Function],
			default: void 0
		},
		handleResize: {
			type: Boolean,
			default: void 0
		},
		instantMove: {
			type: Boolean,
			default: void 0
		},
		eagerMount: {
			type: Boolean,
			default: void 0
		},
		popperClass: {
			type: [
				String,
				Array,
				Object
			],
			default: void 0
		},
		computeTransformOrigin: {
			type: Boolean,
			default: void 0
		},
		/**
		* @deprecated
		*/
		autoMinSize: {
			type: Boolean,
			default: void 0
		},
		autoSize: {
			type: [Boolean, String],
			default: void 0
		},
		/**
		* @deprecated
		*/
		autoMaxSize: {
			type: Boolean,
			default: void 0
		},
		autoBoundaryMaxSize: {
			type: Boolean,
			default: void 0
		},
		preventOverflow: {
			type: Boolean,
			default: void 0
		},
		overflowPadding: {
			type: [Number, String],
			default: void 0
		},
		arrowPadding: {
			type: [Number, String],
			default: void 0
		},
		arrowOverflow: {
			type: Boolean,
			default: void 0
		},
		flip: {
			type: Boolean,
			default: void 0
		},
		shift: {
			type: Boolean,
			default: void 0
		},
		shiftCrossAxis: {
			type: Boolean,
			default: void 0
		},
		noAutoFocus: {
			type: Boolean,
			default: void 0
		},
		disposeTimeout: {
			type: Number,
			default: void 0
		}
	},
	emits: {
		show: () => true,
		hide: () => true,
		"update:shown": (_shown) => true,
		"apply-show": () => true,
		"apply-hide": () => true,
		"close-group": () => true,
		"close-directive": () => true,
		"auto-hide": () => true,
		resize: () => true
	},
	computed: { finalTheme() {
		var _this$theme;
		return (_this$theme = this.theme) !== null && _this$theme !== void 0 ? _this$theme : this.$options.vPopperTheme;
	} },
	methods: { getTargetNodes() {
		return Array.from(this.$el.children).filter((node) => node !== this.$refs.popperContent.$el);
	} },
	render() {
		return h(PopperRoot, {
			ref: "popper",
			...this.$props,
			theme: this.finalTheme,
			targetNodes: this.getTargetNodes,
			popperNode: () => this.$refs.popperContent.$el,
			class: [this.themeClass],
			onShow: () => this.$emit("show"),
			onHide: () => this.$emit("hide"),
			"onUpdate:shown": (shown) => this.$emit("update:shown", shown),
			onApplyShow: () => this.$emit("apply-show"),
			onApplyHide: () => this.$emit("apply-hide"),
			onCloseGroup: () => this.$emit("close-group"),
			onCloseDirective: () => this.$emit("close-directive"),
			onAutoHide: () => this.$emit("auto-hide"),
			onResize: () => this.$emit("resize")
		}, { default: ({ popperId, isShown, shouldMountContent, skipTransition, autoHide, show, hide, handleResize, onResize, classes, result }) => {
			var _this$$slots$default, _this$$slots;
			return [(_this$$slots$default = (_this$$slots = this.$slots).default) === null || _this$$slots$default === void 0 ? void 0 : _this$$slots$default.call(_this$$slots, {
				shown: isShown,
				show,
				hide
			}), h(PopperContent, {
				ref: "popperContent",
				popperId,
				theme: this.finalTheme,
				shown: isShown,
				mounted: shouldMountContent,
				skipTransition,
				autoHide,
				handleResize,
				classes,
				result,
				onHide: hide,
				onResize
			}, { default: () => {
				var _this$$slots$popper, _this$$slots2;
				return (_this$$slots$popper = (_this$$slots2 = this.$slots).popper) === null || _this$$slots$popper === void 0 ? void 0 : _this$$slots$popper.call(_this$$slots2, {
					shown: isShown,
					hide
				});
			} })];
		} });
	}
});
/**
* A `PopperWrapper` variant with its own name and default theme — same recipe
* as the themed-component guide in the docs.
*/
function createThemedPopperWrapper(name, vPopperTheme) {
	return {
		...PopperWrapper,
		name,
		vPopperTheme
	};
}
var Dropdown = createThemedPopperWrapper("VDropdown", "dropdown");
createThemedPopperWrapper("VMenu", "menu");
createThemedPopperWrapper("VTooltip", "tooltip");
var Popper = createPopper();
var TooltipDirective = defineComponent({
	name: "VTooltipDirective",
	mixins: [PopperMethods],
	inheritAttrs: false,
	props: {
		theme: {
			type: String,
			default: "tooltip"
		},
		html: {
			type: Boolean,
			default: (props) => getDefaultConfig(props.theme, "html")
		},
		content: {
			type: [
				String,
				Number,
				Function
			],
			default: null
		},
		loadingContent: {
			type: String,
			default: (props) => getDefaultConfig(props.theme, "loadingContent")
		},
		targetNodes: {
			type: Function,
			required: true
		}
	},
	data() {
		return { asyncContent: null };
	},
	computed: {
		isContentAsync() {
			return typeof this.content === "function";
		},
		loading() {
			return this.isContentAsync && this.asyncContent == null;
		},
		finalContent() {
			if (this.isContentAsync) return this.loading ? this.loadingContent : this.asyncContent;
			return this.content;
		}
	},
	watch: {
		content: {
			handler() {
				this.fetchContent(true);
			},
			immediate: true
		},
		async finalContent() {
			await this.$nextTick();
			this.$refs.popper.onResize();
		}
	},
	created() {
		this.$_fetchId = 0;
	},
	methods: {
		fetchContent(force) {
			if (typeof this.content === "function" && this.$_isShown && (force || !this.$_loading && this.asyncContent == null)) {
				this.asyncContent = null;
				this.$_loading = true;
				const fetchId = ++this.$_fetchId;
				const result = this.content(this);
				if (result.then) result.then((res) => this.onResult(fetchId, res));
				else this.onResult(fetchId, result);
			}
		},
		onResult(fetchId, result) {
			if (fetchId !== this.$_fetchId) return;
			this.$_loading = false;
			this.asyncContent = result;
		},
		onShow() {
			this.$_isShown = true;
			this.fetchContent();
		},
		onHide() {
			this.$_isShown = false;
		}
	},
	render() {
		return h(Popper, {
			ref: "popper",
			...this.$attrs,
			theme: this.theme,
			targetNodes: this.targetNodes,
			popperNode: () => this.$refs.popperContent.$el,
			onApplyShow: this.onShow,
			onApplyHide: this.onHide
		}, { default: ({ popperId, isShown, shouldMountContent, skipTransition, autoHide, hide, handleResize, onResize, classes, result }) => h(PopperContent, {
			ref: "popperContent",
			class: { "v-popper--tooltip-loading": this.loading },
			popperId,
			theme: this.theme,
			shown: isShown,
			mounted: shouldMountContent,
			skipTransition,
			autoHide,
			handleResize,
			classes,
			result,
			onHide: hide,
			onResize
		}, { default: () => this.html ? h("div", { innerHTML: this.finalContent }) : h("div", { textContent: this.finalContent }) }) });
	}
});
var TARGET_CLASS = "v-popper--has-tooltip";
/**
* Support placement as directive modifier
*/
function getPlacement(options, modifiers) {
	let result = options.placement;
	if (!result && modifiers) {
		for (const pos of placements) if (modifiers[pos]) result = pos;
	}
	if (!result) result = getDefaultConfig(options.theme || "tooltip", "placement");
	return result;
}
function getOptions(el, value, modifiers) {
	let options;
	const type = typeof value;
	if (type === "string") options = { content: value };
	else if (value && type === "object") options = value;
	else options = { content: false };
	options.placement = getPlacement(options, modifiers);
	options.targetNodes = () => [el];
	options.referenceNode = () => el;
	return options;
}
var directiveApp;
var directives;
var uid = 0;
function ensureDirectiveApp() {
	if (directiveApp) return;
	directives = ref([]);
	directiveApp = createApp({
		name: "VTooltipDirectiveApp",
		setup() {
			return { directives };
		},
		render() {
			return this.directives.map((directive) => {
				return h(TooltipDirective, {
					...directive.options,
					shown: directive.shown || directive.options.shown,
					key: directive.id
				});
			});
		},
		devtools: { hide: true }
	});
	const mountTarget = document.createElement("div");
	document.body.appendChild(mountTarget);
	directiveApp.mount(mountTarget);
}
function createTooltip(el, value, modifiers) {
	ensureDirectiveApp();
	const options = ref(getOptions(el, value, modifiers));
	const shown = ref(false);
	const item = {
		id: uid++,
		options,
		shown
	};
	directives.value.push(item);
	if (el.classList) el.classList.add(TARGET_CLASS);
	return el.$_popper = {
		options,
		item,
		show() {
			shown.value = true;
		},
		hide() {
			shown.value = false;
		}
	};
}
function destroyTooltip(el) {
	if (el.$_popper) {
		const index = directives.value.indexOf(el.$_popper.item);
		if (index !== -1) directives.value.splice(index, 1);
		delete el.$_popper;
		delete el.$_popperOldShown;
		delete el.$_popperMountTarget;
	}
	if (el.classList) el.classList.remove(TARGET_CLASS);
}
function bind(el, { value, modifiers }) {
	const options = getOptions(el, value, modifiers);
	if (!options.content || getDefaultConfig(options.theme || "tooltip", "disabled")) destroyTooltip(el);
	else {
		let directive;
		if (el.$_popper) {
			directive = el.$_popper;
			directive.options.value = options;
		} else directive = createTooltip(el, value, modifiers);
		if (typeof value.shown !== "undefined" && value.shown !== el.$_popperOldShown) {
			el.$_popperOldShown = value.shown;
			value.shown ? directive.show() : directive.hide();
		}
	}
}
var vTooltip = {
	beforeMount: bind,
	updated: bind,
	beforeUnmount(el) {
		destroyTooltip(el);
	}
};
//#endregion
//#region node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/shared/pathe.M-eThtNZ.mjs
var _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
var _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
var _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
function cwd() {
	if (typeof process !== "undefined" && typeof process.cwd === "function") return process.cwd().replace(/\\/g, "/");
	return "/";
}
var resolve = function(...arguments_) {
	arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
		const path = index >= 0 ? arguments_[index] : cwd();
		if (!path || path.length === 0) continue;
		resolvedPath = `${path}/${resolvedPath}`;
		resolvedAbsolute = isAbsolute(path);
	}
	resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
	if (resolvedAbsolute && !isAbsolute(resolvedPath)) return `/${resolvedPath}`;
	return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let char = null;
	for (let index = 0; index <= path.length; ++index) {
		if (index < path.length) char = path[index];
		else if (char === "/") break;
		else char = "/";
		if (char === "/") {
			if (lastSlash === index - 1 || dots === 1);
			else if (dots === 2) {
				if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf("/");
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
						}
						lastSlash = index;
						dots = 0;
						continue;
					} else if (res.length > 0) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = index;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					res += res.length > 0 ? "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += `/${path.slice(lastSlash + 1, index)}`;
				else res = path.slice(lastSlash + 1, index);
				lastSegmentLength = index - lastSlash - 1;
			}
			lastSlash = index;
			dots = 0;
		} else if (char === "." && dots !== -1) ++dots;
		else dots = -1;
	}
	return res;
}
var isAbsolute = function(p) {
	return _IS_ABSOLUTE_RE.test(p);
};
var relative = function(from, to) {
	const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
	const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
	if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) return _to.join("/");
	const _fromCopy = [..._from];
	for (const segment of _fromCopy) {
		if (_to[0] !== segment) break;
		_from.shift();
		_to.shift();
	}
	return [..._from.map(() => ".."), ..._to].join("/");
};
//#endregion
//#region src/client/components/ModuleId.vue
var ModuleId_default = /* @__PURE__ */ defineComponent({
	__name: "ModuleId",
	props: {
		id: {},
		badges: { type: Boolean },
		icon: {
			type: Boolean,
			default: true
		},
		module: { type: Boolean }
	},
	setup(__props) {
		const props = __props;
		const payload = usePayloadStore();
		const mod = computed(() => payload.modules.find((i) => i.id === props.id));
		const isVirtual = computed(() => mod.value?.virtual);
		const relativePath = computed(() => {
			if (!props.id) return "";
			let relate = relative(payload.root, props.id);
			if (!relate.startsWith(".")) relate = `./${relate}`;
			if (relate.startsWith("./")) return relate;
			if (/^(?:\.\.\/){1,3}[^.]/.test(relate)) return relate;
			return props.id;
		});
		const HighlightedPath = defineComponent({ render() {
			const parts = relativePath.value.split(/([/?&:])/g);
			let type = "start";
			const classes = parts.map(() => []);
			const nodes = parts.map((part) => {
				return h("span", { class: "" }, part);
			});
			parts.forEach((part, index) => {
				const _class = classes[index];
				if (part === "?") type = "query";
				if (type === "start") {
					if (/^\.+$/.test(part)) _class.push("op50");
					else if (part === "/") _class.push("op50");
					else if (part !== "/") type = "path";
				}
				if (type === "path") {
					if (part === "/" || part === "node_modules" || /^\.\w/.test(part)) _class.push("op75");
					if (part === ".pnpm") {
						classes[index + 2]?.push("op50");
						if (nodes[index + 2]) nodes[index + 2].children = "…";
					}
					if (part === ":") {
						if (nodes[index - 1]) {
							nodes[index - 1].props ||= {};
							nodes[index - 1].props.style ||= {};
							nodes[index - 1].props.style.color = getPluginColor(parts[index - 1]);
						}
						_class.push("op50");
					}
				}
				if (type === "query") {
					if (part === "?" || part === "&") _class.push("text-orange-5 dark:text-orange-4");
					else _class.push("text-orange-9 dark:text-orange-2");
				}
			});
			nodes.forEach((node, index) => {
				if (node.props) node.props.class = classes[index].join(" ");
			});
			return nodes;
		} });
		const gridStyles = computed(() => {
			if (!props.module) return "";
			const gridColumns = [];
			if (props.icon) gridColumns.push("min-content");
			if (props.module) gridColumns.push("minmax(0,1fr)");
			else gridColumns.push("100%");
			if (isVirtual.value) gridColumns.push("min-content");
			return `grid-template-columns: ${gridColumns.join(" ")};`;
		});
		const containerClass = computed(() => {
			return props.module ? "grid grid-rows-1 items-center gap-1" : "flex items-center";
		});
		return (_ctx, _cache) => {
			const _component_FileIcon = FileIcon_default;
			const _component_Badge = Badge_default;
			return __props.id ? withDirectives((openBlock(), createElementBlock("div", {
				key: 0,
				"my-auto": "",
				"text-sm": "",
				"font-mono": "",
				class: normalizeClass(containerClass.value),
				style: normalizeStyle(gridStyles.value)
			}, [
				__props.icon ? (openBlock(), createBlock(_component_FileIcon, {
					key: 0,
					filename: __props.id,
					"mr1.5": ""
				}, null, 8, ["filename"])) : createCommentVNode("", true),
				createBaseVNode("span", { class: normalizeClass({
					"overflow-hidden": __props.module,
					"text-truncate": __props.module
				}) }, [createVNode(unref(HighlightedPath))], 2),
				renderSlot(_ctx.$slots, "default"),
				isVirtual.value ? (openBlock(), createBlock(_component_Badge, {
					key: 1,
					class: "ml1",
					text: "virtual"
				})) : createCommentVNode("", true)
			], 6)), [[
				unref(vTooltip),
				{
					content: props.id,
					triggers: ["hover", "focus"],
					disabled: !__props.module
				},
				void 0,
				{ "bottom-start": true }
			]]) : createCommentVNode("", true);
		};
	}
});
//#endregion
//#region src/client/components/ModuleList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "h-full"
};
var _hoisted_2 = {
	key: 0,
	"px-6": "",
	"py-4": "",
	italic: "",
	op50: ""
};
var _hoisted_3 = { key: 0 };
var _hoisted_4 = { key: 1 };
var _hoisted_5 = {
	key: 0,
	flex: "~ gap-1",
	"text-xs": ""
};
var _hoisted_6 = {
	flex: "~ auto gap-1",
	"of-hidden": ""
};
var _hoisted_7 = {
	key: 0,
	op20: ""
};
var _hoisted_8 = {
	"ws-nowrap": "",
	op50: ""
};
var _hoisted_9 = ["title"];
var _hoisted_10 = { flex: "~ none gap-1 wrap justify-end" };
//#endregion
//#region src/client/components/ModuleList.vue
var ModuleList_default = /* @__PURE__ */ defineComponent({
	__name: "ModuleList",
	props: { modules: {} },
	setup(__props) {
		const props = __props;
		const options = useOptionsStore();
		const payload = usePayloadStore();
		const route = useRoute();
		const { list, containerProps, wrapperProps } = useVirtualList(toRef(props, "modules"), { itemHeight: options.view.listMode === "detailed" ? 53 : 37 });
		return (_ctx, _cache) => {
			const _component_ModuleId = ModuleId_default;
			const _component_PluginName = PluginName_default;
			const _component_ByteSizeDisplay = ByteSizeDisplay_default;
			const _component_DurationDisplay = DurationDisplay_default;
			const _component_RouterLink = resolveComponent("RouterLink");
			return __props.modules ? (openBlock(), createElementBlock("div", _hoisted_1, [!__props.modules.length ? (openBlock(), createElementBlock("div", _hoisted_2, [unref(options).search.text ? (openBlock(), createElementBlock("div", _hoisted_3, " No search result ")) : (openBlock(), createElementBlock("div", _hoisted_4, [..._cache[0] || (_cache[0] = [
				createTextVNode(" No module recorded yet, visit ", -1),
				createBaseVNode("a", {
					href: "/",
					target: "_blank"
				}, "your app", -1),
				createTextVNode(" first and then refresh this page. ", -1)
			])]))])) : (openBlock(), createElementBlock("div", mergeProps({ key: 1 }, unref(containerProps), { class: "h-full" }), [createBaseVNode("div", normalizeProps(guardReactiveProps(unref(wrapperProps))), [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(list), (m) => {
				return openBlock(), createBlock(_component_RouterLink, {
					key: `${unref(payload).query.vite}-${unref(payload).query.env}-${m.data.id}`,
					class: "block border-b border-main px-3 py-2 text-left text-sm font-mono hover:bg-active",
					to: {
						path: "/module",
						query: {
							...unref(route).query,
							id: m.data.id
						}
					}
				}, {
					default: withCtx(() => [createVNode(_component_ModuleId, {
						id: m.data.id,
						badges: "",
						"ws-nowrap": ""
					}, null, 8, ["id"]), unref(options).view.listMode === "detailed" ? (openBlock(), createElementBlock("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(m.data.plugins.slice(1).filter((plugin) => plugin.transform !== void 0), (i, idx) => {
						return openBlock(), createElementBlock(Fragment, { key: i.name }, [idx !== 0 ? (openBlock(), createElementBlock("span", _hoisted_7, "|")) : createCommentVNode("", true), createBaseVNode("span", _hoisted_8, [createVNode(_component_PluginName, {
							name: i.name,
							compact: true
						}, null, 8, ["name"])])], 64);
					}), 128)), m.data.invokeCount > 2 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[1] || (_cache[1] = createBaseVNode("span", { op40: "" }, "·", -1)), createBaseVNode("span", {
						"text-green": "",
						title: `Transform invoked ${m.data.invokeCount} times`
					}, "x" + toDisplayString(m.data.invokeCount), 9, _hoisted_9)], 64)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_10, [m.data.sourceSize && m.data.distSize ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createVNode(_component_ByteSizeDisplay, {
							op75: "",
							bytes: m.data.sourceSize
						}, null, 8, ["bytes"]),
						_cache[2] || (_cache[2] = createBaseVNode("span", {
							"i-carbon-arrow-right": "",
							op50: ""
						}, null, -1)),
						createVNode(_component_ByteSizeDisplay, {
							class: normalizeClass(m.data.distSize > m.data.sourceSize ? "status-yellow" : "status-green"),
							bytes: m.data.distSize
						}, null, 8, ["class", "bytes"]),
						_cache[3] || (_cache[3] = createBaseVNode("span", { op40: "" }, "|", -1))
					], 64)) : createCommentVNode("", true), createBaseVNode("span", null, [createVNode(_component_DurationDisplay, { duration: m.data.totalTime }, null, 8, ["duration"])])])])) : createCommentVNode("", true)]),
					_: 2
				}, 1032, ["to"]);
			}), 128))], 16)], 16))])) : createCommentVNode("", true);
		};
	}
});
//#endregion
export { ModuleId_default as n, Dropdown as r, ModuleList_default as t };
