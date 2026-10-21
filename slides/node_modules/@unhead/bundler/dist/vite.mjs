import unheadDevtools from './chunks/vite.mjs';
import { T as TreeshakeServerComposables, U as UseSeoMetaTransform, r as resolveMinifyTransformOptions, M as MinifyTransform, a as SSRStaticReplace, C as CreateHeadTransform, c as createHeadTransformContext } from './shared/bundler.UsCZRS3d.mjs';
import 'node:fs';
import 'node:path';
import '@vitejs/devtools-kit/node';
import 'magic-string';
import 'node:module';
import 'node:url';
import '@vitejs/devtools-kit';
import 'node:crypto';
import 'node:fs/promises';
import 'oxc-walker';
import 'unhead/minify';
import 'unplugin';
import 'unhead/utils';

function Unhead(options = {}, internal = {}) {
  const plugins = [];
  const ctx = createHeadTransformContext();
  const framework = internal.framework ?? options._framework;
  if (options.treeshake !== false) {
    const treeshakeOpts = typeof options.treeshake === "object" ? options.treeshake : {};
    plugins.push(TreeshakeServerComposables.vite({ filter: options.filter, sourcemap: options.sourcemap, ...treeshakeOpts }));
  }
  if (options.transformSeoMeta !== false) {
    const seoMetaOpts = typeof options.transformSeoMeta === "object" ? options.transformSeoMeta : {};
    plugins.push(UseSeoMetaTransform.vite({ filter: options.filter, sourcemap: options.sourcemap, ...seoMetaOpts }));
  }
  const minifyTransformOptions = resolveMinifyTransformOptions(options);
  if (minifyTransformOptions) {
    plugins.push(MinifyTransform.vite({
      filter: options.filter,
      sourcemap: options.sourcemap,
      ...minifyTransformOptions
    }));
  }
  if (options.validate !== false) {
    const pluginsSource = framework ? `${framework}/plugins` : "unhead/plugins";
    ctx.addRuntimePlugin({
      import: { name: "ValidatePlugin", source: pluginsSource, as: "__unhead_validate" },
      client: "_h.use(__unhead_validate({ root: __ROOT__ }))",
      server: "_h.use(__unhead_validate({ root: __ROOT__ }))"
    });
  }
  if (options.devtools !== false) {
    const devtoolsOpts = typeof options.devtools === "object" ? options.devtools : {};
    plugins.push(unheadDevtools({ ...devtoolsOpts, _ctx: ctx }));
  }
  plugins.push(SSRStaticReplace.vite({}));
  plugins.push(CreateHeadTransform(ctx));
  return plugins;
}

export { Unhead };
