import { Config } from "@swc/core";
import { TransformOptions } from "esbuild";
import { TransformOptions as TransformOptions$1 } from "oxc-transform";
import { CompilerOptions } from "typescript";
import { Plugin } from "rollup";

type RollupInlineTsOptions = {
  /**
   * An array of file extensions to process (default: ['.html']).
   */
  extensions?: string[];
  /**
   * Specifies the transpilation engine to use.
   * Supported values are: 'oxc', 'swc', 'esbuild', and 'typescript' (default: 'oxc').
   */
  engine?: Engine;
  /**
   * Engine-specific configuration options for the selected transpiler.
   * These options are passed directly to the corresponding engine:
   *
   * - 'oxc': TransformOptions type from 'oxc-transform' package (default: {})
   * - 'swc': Config type from '@swc/core' package (default: { jsc: {parser: { syntax: 'typescript' } } })
   * - 'esbuild': TransformOptions type from 'esbuild' package (default: { loader: 'ts' })
   * - 'typescript': CompilerOptions type from 'typescript' package (default: { target: ts.ScriptTarget.ESNext })
   */
  options?: EngineOptions;
  /**
   * A string representing the attribute to identify TypeScript scripts (default: 'lang="ts"').
   */
  tsScriptAttr?: string;
  /**
   * A string representing the attribute to replace the script type after transpilation (default: '').
   */
  jsScriptAttr?: string;
  /**
   * Indicates whether to preserve import statements for files with extensions listed in the `extensions` option.
   * These imports will not be removed as unused during the transformation (default: true).
   */
  keepComponentImports?: boolean;
  /**
   * Prefix for log messages (default: '[rollup-plugin-inline-ts]').
   */
  logPrefix?: string;
  /**
   * A boolean to enable debug logging (default: false).
   */
  debug?: boolean;
} & ({
  engine?: 'oxc';
  options?: TransformOptions$1;
} | {
  engine?: 'swc';
  options?: Config;
} | {
  engine?: 'esbuild';
  options?: TransformOptions;
} | {
  engine?: 'typescript';
  options?: CompilerOptions;
});
type Engine = 'oxc' | 'swc' | 'esbuild' | 'typescript';
type EngineOptions = TransformOptions$1 | Config | TransformOptions | CompilerOptions;
/**
 * A Rollup plugin to process inline TypeScript code inside <script lang="ts"> tags.
 *
 * @param {RollupInlineTsOptions} [options] Options to configure the plugin.
 * @returns {object} Rollup plugin instance.
 */
declare function inlineTs(options?: RollupInlineTsOptions): Plugin; export { RollupInlineTsOptions, inlineTs as default };