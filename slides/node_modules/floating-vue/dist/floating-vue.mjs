import { createApp, defineComponent, h, ref } from "vue";
import { arrow, autoPlacement, computePosition, flip, getOverflowAncestors, offset, shift, size } from "@floating-ui/dom";
//#region package.json
var version = "5.4.0";
//#endregion
//#region src/util/assign-deep.ts
function assign(to, from) {
	for (const key in from) if (Object.hasOwn(from, key)) {
		if (typeof from[key] === "object" && to[key]) assign(to[key], from[key]);
		else to[key] = from[key];
	}
}
//#endregion
//#region src/config.ts
const config = {
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
//#endregion
//#region src/util/env.ts
const supportsPassive = (() => {
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
const isIOS = typeof window !== "undefined" && typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//#endregion
//#region src/util/popper.ts
const placements = [
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
//#endregion
//#region src/util/events.ts
const SHOW_EVENT_MAP = {
	hover: "mouseenter",
	focus: "focus",
	click: "click",
	touch: "touchstart",
	pointer: "pointerdown"
};
const HIDE_EVENT_MAP = {
	hover: "mouseleave",
	focus: "blur",
	click: "click",
	touch: "touchend",
	pointer: "pointerup"
};
//#endregion
//#region src/util/lang.ts
function removeFromArray(array, item) {
	const index = array.indexOf(item);
	if (index !== -1) array.splice(index, 1);
}
//#endregion
//#region src/util/frame.ts
function nextFrame() {
	return new Promise((resolve) => requestAnimationFrame(() => {
		requestAnimationFrame(resolve);
	}));
}
//#endregion
//#region src/factories/Popper.ts
const shownPoppers = [];
let hidingPopper = null;
const shownPoppersByTheme = {};
function getShownPoppersByTheme(theme) {
	let list = shownPoppersByTheme[theme];
	if (!list) list = shownPoppersByTheme[theme] = [];
	return list;
}
let Element$1 = function() {};
if (typeof window !== "undefined") Element$1 = window.Element;
function defaultPropFactory(prop) {
	return function(props) {
		return getDefaultConfig(props.theme, prop);
	};
}
const PROVIDE_KEY = "__floating-vue__popper";
const createPopper = () => defineComponent({
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
function hideAllPoppers() {
	for (let i = 0; i < shownPoppers.length; i++) shownPoppers[i].hide();
}
let mousePreviousX = 0;
let mousePreviousY = 0;
let mouseX = 0;
let mouseY = 0;
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
//#endregion
//#region src/components/internals/PopperRoot.ts
const PopperRoot = defineComponent({
	extends: createPopper(),
	render() {
		var _this$$slots$default, _this$$slots;
		return h("div", {
			ref: "reference",
			class: ["v-popper", { "v-popper--shown": this.slotData.isShown }]
		}, (_this$$slots$default = (_this$$slots = this.$slots).default) === null || _this$$slots$default === void 0 ? void 0 : _this$$slots$default.call(_this$$slots, this.slotData));
	}
});
//#endregion
//#region src/mixins/ThemeClass.ts
const ThemeClass = (prop = "theme") => ({ computed: { themeClass() {
	return getThemeClasses(this[prop]);
} } });
//#endregion
//#region src/components/PopperContent.ts
const PopperContent = defineComponent({
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
//#endregion
//#region src/mixins/PopperMethods.ts
const PopperMethods = { methods: {
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
//#endregion
//#region src/components/PopperWrapper.ts
let Element = function() {};
if (typeof window !== "undefined") Element = window.Element;
const PopperWrapper = defineComponent({
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
				Element,
				Boolean
			],
			default: void 0
		},
		boundary: {
			type: [String, Element],
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
//#endregion
//#region src/factories/ThemedPopperWrapper.ts
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
//#endregion
//#region src/components/Dropdown.ts
const Dropdown = createThemedPopperWrapper("VDropdown", "dropdown");
//#endregion
//#region src/components/Menu.ts
const Menu = createThemedPopperWrapper("VMenu", "menu");
//#endregion
//#region src/components/Tooltip.ts
const Tooltip = createThemedPopperWrapper("VTooltip", "tooltip");
//#endregion
//#region src/components/TooltipDirective.ts
const Popper = createPopper();
const TooltipDirective = defineComponent({
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
//#endregion
//#region src/directives/v-tooltip.ts
const TARGET_CLASS = "v-popper--has-tooltip";
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
let directiveApp;
let directives;
let uid = 0;
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
const vTooltip = {
	beforeMount: bind,
	updated: bind,
	beforeUnmount(el) {
		destroyTooltip(el);
	}
};
//#endregion
//#region src/directives/v-close-popper.ts
function addListeners(el) {
	el.addEventListener("mousedown", addEventProps);
	el.addEventListener("click", addEventProps);
	el.addEventListener("touchstart", onTouchStart, supportsPassive ? { passive: true } : false);
}
function removeListeners(el) {
	el.removeEventListener("mousedown", addEventProps);
	el.removeEventListener("click", addEventProps);
	el.removeEventListener("touchstart", onTouchStart);
	el.removeEventListener("touchend", onTouchEnd);
	el.removeEventListener("touchcancel", onTouchCancel);
}
function addEventProps(event) {
	const el = event.currentTarget;
	event.closePopover = !el.$_vclosepopover_touch;
	event.closeAllPopover = el.$_closePopoverModifiers && !!el.$_closePopoverModifiers.all;
}
function onTouchStart(event) {
	if (event.changedTouches.length === 1) {
		const el = event.currentTarget;
		el.$_vclosepopover_touch = true;
		el.$_vclosepopover_touchPoint = event.changedTouches[0];
		el.addEventListener("touchend", onTouchEnd);
		el.addEventListener("touchcancel", onTouchCancel);
	}
}
function onTouchEnd(event) {
	const el = event.currentTarget;
	el.$_vclosepopover_touch = false;
	if (event.changedTouches.length === 1) {
		const touch = event.changedTouches[0];
		const firstTouch = el.$_vclosepopover_touchPoint;
		event.closePopover = Math.abs(touch.screenY - firstTouch.screenY) < 20 && Math.abs(touch.screenX - firstTouch.screenX) < 20;
		event.closeAllPopover = el.$_closePopoverModifiers && !!el.$_closePopoverModifiers.all;
	}
}
function onTouchCancel(event) {
	const el = event.currentTarget;
	el.$_vclosepopover_touch = false;
}
const vClosePopper = {
	beforeMount(el, { value, modifiers }) {
		el.$_closePopoverModifiers = modifiers;
		if (typeof value === "undefined" || value) addListeners(el);
	},
	updated(el, { value, oldValue, modifiers }) {
		el.$_closePopoverModifiers = modifiers;
		if (value !== oldValue) {
			if (typeof value === "undefined" || value) addListeners(el);
			else removeListeners(el);
		}
	},
	beforeUnmount(el) {
		removeListeners(el);
	}
};
//#endregion
//#region src/index.ts
const options = config;
/**
* @deprecated Import `vTooltip` instead.
*/
const VTooltip = vTooltip;
/**
* @deprecated Import `vClosePopper` instead.
*/
const VClosePopper = vClosePopper;
function install(app, options = {}) {
	if (app.$_vTooltipInstalled) return;
	app.$_vTooltipInstalled = true;
	assign(config, options);
	app.directive("tooltip", vTooltip);
	app.directive("close-popper", vClosePopper);
	for (const component of [
		Tooltip,
		Dropdown,
		Menu
	]) app.component(component.name, component);
}
const plugin = {
	version,
	install,
	options: config
};
//#endregion
export { Dropdown, HIDE_EVENT_MAP, Menu, createPopper as Popper, PopperContent, PopperMethods, PopperWrapper, SHOW_EVENT_MAP, ThemeClass, Tooltip, TooltipDirective, VClosePopper, VTooltip, createTooltip, plugin as default, destroyTooltip, hideAllPoppers, install, options, placements, recomputeAllPoppers, vClosePopper, vTooltip };
