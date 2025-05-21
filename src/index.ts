// noinspection JSUnusedGlobalSymbols

import type { Plugin } from 'rollup';
import type { Config as SwcOptions } from '@swc/core';
import type { TransformOptions as OxcOptions } from 'oxc-transform';
import type { TransformOptions as EsbuildOptions } from 'esbuild';
import type { CompilerOptions as TypeScriptOptions } from 'typescript';

export type RollupInlineTsOptions = {
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
} & (
  | { engine?: 'oxc'; options?: OxcOptions }
  | { engine?: 'swc'; options?: SwcOptions }
  | { engine?: 'esbuild'; options?: EsbuildOptions }
  | { engine?: 'typescript'; options?: TypeScriptOptions }
);

type Engine = 'oxc' | 'swc' | 'esbuild' | 'typescript';
type EngineOptions = OxcOptions | SwcOptions | EsbuildOptions | TypeScriptOptions;

const OxcDefaultOptions: OxcOptions = {};
const SwcDefaultOptions: SwcOptions = { jsc: { parser: { syntax: 'typescript' } } };
const EsbuildDefaultOptions: EsbuildOptions = { loader: 'ts' };
const TypeScriptDefaultOptions: TypeScriptOptions = { target: 99 };

async function compilerFactory(engine: Engine, opts: EngineOptions): Promise<(code: string) => string> {
  if (engine == 'oxc') {
    const { transform } = await import('oxc-transform');
    return (code) => transform('_.ts', code, (opts as OxcOptions) ?? OxcDefaultOptions).code;
  } else if (engine == 'swc') {
    const { transformSync } = await import('@swc/core');
    return (code) => transformSync(code, (opts as SwcOptions) ?? SwcDefaultOptions).code;
  } else if (engine == 'esbuild') {
    const { transformSync } = await import('esbuild');
    return (code) => transformSync(code, (opts as EsbuildOptions) ?? EsbuildDefaultOptions).code;
  } else if (engine == 'typescript') {
    const { transpile } = await import('typescript');
    return (code) => transpile(code, (opts as TypeScriptOptions) ?? TypeScriptDefaultOptions);
  } else {
    throw new Error(`Unsupported engine: ${engine}`);
  }
}

/**
 * A Rollup plugin to process inline TypeScript code inside <script lang="ts"> tags.
 *
 * @param {RollupInlineTsOptions} [options] Options to configure the plugin.
 * @returns {object} Rollup plugin instance.
 */
export default function inlineTs(options?: RollupInlineTsOptions): Plugin {
  const config: Required<RollupInlineTsOptions> = Object.assign(
    {
      engine: 'oxc',
      options: null,
      extensions: ['.html'],
      tsScriptAttr: 'lang="ts"',
      jsScriptAttr: '',
      keepComponentImports: true,
      logPrefix: '[rollup-plugin-inline-ts]',
      debug: false,
    },
    options,
  );

  const logPrefix = config.logPrefix ? ` ${config.logPrefix}` : '';
  const escapedTsAttr = config.tsScriptAttr.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const scriptTagsRegex = new RegExp(`(<script.*?\\s+${escapedTsAttr}(?:\\s+.*?|)>)([\\s\\S]*?)<\\/script>`, 'g');
  const keepImportsRegex = /import\s+([\w$]+)\s+from\s+["']([^"']+\.(\w+)(?:\?[^"']*)?)["'];?/g;
  const extensions = config.extensions.map((ext) => ext.replaceAll(/\W/g, ''));

  let compile: (code: string) => string;

  return {
    name: 'inline-ts',
    async buildStart() {
      compile = await compilerFactory(config.engine, config.options);
    },
    transform(code: string, file: string): string {
      try {
        const ext = file.split('.').pop();
        if (!extensions.includes(ext!)) {
          return code;
        }

        const start = config.debug ? performance.now() : 0;
        const result = replace(code);

        if (config.debug) {
          console.info(
            `✅${logPrefix} \u001B[32mDone\u001B[0m: ${file} in ${(performance.now() - start).toFixed(2)} ms`,
          );
        }

        return result;
      } catch (error) {
        console.error(`❌${logPrefix}`, error);
        return code;
      }
    },
  };

  function replace(code: string): string {
    return code.replace(scriptTagsRegex, (_match: string, tag: string, ts: string): string => {
      const voids: string[] = [];

      if (config.keepComponentImports) {
        ts = ts.replaceAll(keepImportsRegex, (match, varName, _fullPath, ext) => {
          match = match.trimEnd().endsWith(';') ? match : `${match};`;
          if (extensions.includes(ext)) {
            const stmt = `void ${varName};`;
            voids.push(stmt);
            return `${match} ${stmt}`;
          }

          return match;
        });
      }

      let js = compile(ts);

      if (config.keepComponentImports) {
        for (const stmt of voids) {
          js = js.replace(stmt, '');
        }
      }

      return `${tag.replace(escapedTsAttr, config.jsScriptAttr)}\n${js}\n</script>`;
    });
  }
}
