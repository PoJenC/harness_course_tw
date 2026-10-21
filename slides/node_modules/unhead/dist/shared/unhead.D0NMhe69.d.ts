import { H as HeadTag } from './unhead.DC0v7nqS.js';

interface RenderDomHeadOptions {
    /**
     * Document to use for rendering. Allows stubbing for testing.
     */
    document?: Document;
    /**
     * Custom tag weight function for sorting.
     */
    tagWeight?: (tag: HeadTag) => number;
}

export type { RenderDomHeadOptions as R };
