[npm]: https://img.shields.io/npm/v/rollup-plugin-inline-ts
[npm-url]: https://www.npmjs.com/package/rollup-plugin-inline-ts
[size]: https://packagephobia.now.sh/badge?p=rollup-plugin-inline-ts
[size-url]: https://packagephobia.now.sh/result?p=rollup-plugin-inline-ts

[![npm][npm]][npm-url]
[![size][size]][size-url]

# rollup-plugin-inline-ts

⚡ A Rollup plugin to process TypeScript code inside `<script lang="ts">` tags.

Supports compilation using one of four engines: oxc, swc, esbuild, or typescript.  
Only transpile, without type checking and diagnostics.

## Requirements

This plugin requires Node.js v14.16.1+ ([LTS](https://github.com/nodejs/Release) recommended).

## Install

```sh
npm install rollup-plugin-inline-ts --save-dev
```

#### Optional: Install one of the transpiler engines as needed

[`oxc`](https://www.npmjs.com/package/oxc-transform)

```sh
npm install oxc-transform --save-dev
```

[`swc`](https://www.npmjs.com/package/@swc/core)

```sh
npm install @swc/core --save-dev
```

[`esbuild`](https://www.npmjs.com/package/esbuild)

```sh
npm install esbuild --save-dev
```

[`typescript`](https://www.npmjs.com/package/typescript)

```sh
npm install typescript --save-dev
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the
plugin:

```js
import inlineTs from 'rollup-plugin-inline-ts';

export default {
  // ...
  plugins: [
    // ...
    inlineTs(),
  ],
};
```

Example with all available options:

```js
import inlineTs from 'rollup-plugin-inline-ts';

export default {
  // ...
  plugins: [
    // ...
    inlineTs({
      extensions: ['.html', '.xht'], // Files to process
      engine: 'swc', // Transpiler engine
      options: { jsc: { parser: { syntax: 'typescript' } } }, // Engine specific options
      tsScriptAttr: 'lang="ts"', // Match attribute
      jsScriptAttr: '', // Replacement attribute
      logPrefix: '[inline-ts]', // Log prefix
      debug: false, // Debug logging
    }),
  ],
};
```

## Options

### `extensions`

Type: `Array<string>`  
Default: `['.html']`

File extensions for `<script lang="ts">` blocks processing.

### `engine`

Type: `'oxc' | 'swc' | 'esbuild' | 'typescript'`  
Default: `'oxc'`

Transpilation engine to use.

### `options`

Type: `object` (depends on specified `engine`)  
Default: engine-specific  
Passed directly to the underlying transpiler.

| Engine       | Type                                                                          | Package                                                        | Default                                         |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `oxc`        | [`TransformOptions`](https://oxc.rs/docs/guide/usage/transformer)             | [`oxc-transform`](https://www.npmjs.com/package/oxc-transform) | `{}`                                            |
| `swc`        | [`Config`](https://swc.rs/docs/usage/core#transform)                          | [`@swc/core`](https://www.npmjs.com/package/@swc/core)         | `{ jsc: { parser: { syntax: 'typescript' } } }` |
| `esbuild`    | [`TransformOptions`](https://esbuild.github.io/api/#transform)                | [`esbuild`](https://www.npmjs.com/package/esbuild)             | `{ loader: 'ts' }`                              |
| `typescript` | [`CompilerOptions`](https://www.typescriptlang.org/tsconfig/#compilerOptions) | [`typescript`](https://www.npmjs.com/package/typescript)       | `{ target: ts.ScriptTarget.ESNext }`            |

### `tsScriptAttr`

Type: `string`  
Default: `'lang="ts"'`

Attribute used to detect TypeScript `<script>` tags.

### `jsScriptAttr`

Type: `string`  
Default: `''`

Attribute to replace `tsScriptAttr` with after transpilation.

### `keepComponentImports`

Type: `boolean`  
Default: `true`

If set to `true`, the plugin will preserve import statements for files with extensions listed in the `extensions` option.  
These imports will not be removed as unused during the transformation.

### `logPrefix`

Type: `string`  
Default: `'[inline-ts]'`

Prefix for plugin logs.

### `debug`

Type: `boolean`  
Default: `false`

Enable debug logging.

## How it works

1. Scans input files with configured extensions (e.g., `.html`).
2. Detects `<script lang="ts">` blocks.
3. Transpiles TypeScript code using the specified engine.
4. Replaces the script content and removes or updates the tag’s `lang` attribute.
5. Preserves imports with extensions from `extensions` option to avoid them being removed as unused.

## Meta

[LICENSE (MIT)](/LICENSE)
