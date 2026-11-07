import { relative } from "path";
import copy from "rollup-plugin-copy";
import { fileURLToPath, URL } from "url";
import { AuthPluginProviderFromConfig, Options } from "./types";
import { AstroAdapter, AstroIntegration } from "astro";
import config from "./config.js";
import initDefaultOptions from "./defaults.js";
import Fastify, { FastifyServerFactory } from "fastify";
import { Server, createServer } from "http";

const { packageName, serverFile, viteRoutesPackageName, packageBase } = config;

/**
 * Creates an Astro adapter configuration object for Fastify integration
 * 
 * Astro 4.0+ requires adapters to declare supported features via `supportedAstroFeatures`
 * This adapter is configured for server-side rendering only (SSR)
 * 
 * @param args - Optional adapter configuration options
 * @returns AstroAdapter configuration with Astro 4 feature map
 */
const createAdapterConfig = (args?: Options): AstroAdapter => {
  const serverEntryPoint = `${packageName}/${serverFile}`;
  return {
    name: packageName,
    serverEntrypoint: serverEntryPoint,
    exports: ["createExports"],
    args: args,
    // Astro 4.0+ requires explicit feature map for adapter compatibility
    supportedAstroFeatures: {
     staticOutput: 'unsupported',           // No static export support
      hybridOutput: 'unsupported',     // No hybrid rendering
     serverOutput: 'stable'      // Always SSR
      //sharpImageService: false,        // Uses default image optimization
    },
  };
};

/**
 * Vite plugin that configures Fastify SSR during dev mode
 * Integrates Fastify server with Vite's dev middleware
 * 
 * @param options - Adapter configuration options
 * @returns Vite plugin configuration
 */
const createViteFastifySSRPlugin = (options: Options) => {
  return {
    name: viteRoutesPackageName,
    async configureServer(server: any) {
      const nextSymbol = Symbol("next");
      const { devRoutesApi, useLogger, fastifyServerOptions } = options;

      const serverFactory: FastifyServerFactory = (
        handler: any,
        _opts: any
      ): Server => {
        // Bridge Fastify → Vite: stash Vite's "next" and let Fastify handle the request
        server.middlewares.use((req: any, res: any, next: any) => {
          req[nextSymbol] = next;
          handler(req, res);
        });
        // Return a real Node server so Fastify sees a valid instance
        return createServer((req: any, res: any) => {
          handler(req, res);
        });
      };

      const fastify = Fastify({
        logger: useLogger ?? true,
        serverFactory,
        ...fastifyServerOptions 
      });

      if (devRoutesApi) {
        if (typeof devRoutesApi != "function") {
          throw new Error(
            `astro-fastify: ${devRoutesApi} should be a function`
          );
        }
        devRoutesApi(fastify);
      }

      // Final catch-all route forwards back to the Vite server
      fastify.all("/*", function (request: any) {
        /** @type {import('connect').NextFunction} */
        const next = request.raw[nextSymbol];
        next && next();
      });

      await fastify.ready();
    },
    async transform(code: any, id: any) {
      if (id.includes(`${packageBase}/dist/server.js`)) {
        const { productionRoutesApi, pluginHooksApi, authPluginProvider } =
          options;
        let outCode: string = code;
        if (authPluginProvider) {
          const configPath = getProviderConfigFromFile(
            authPluginProvider as AuthPluginProviderFromConfig
          )
          
          if (configPath) {
            outCode = `import _authPluginConfig from "${configPath}"; \n ${outCode}`
            try {
              const authConfig = await import(configPath)
              const { pluginPath, authActions } = authConfig.default
              
              if (pluginPath?.pathname) {
                outCode = `import _authPlugin from "${pluginPath.pathname}";\n  ${outCode}`;
              }
              if (authActions?.pathname) {
                outCode = `import _authActions from "${authActions.pathname}";\n ${outCode}`;  
              }
            } catch (error) {
              console.error(`[astro-fastify] Failed to load auth config from ${configPath}:`, error)
            }
          } else {
            console.warn("[astro-fastify] AuthPluginProvider type not implemented. Use AuthPluginProviderFromConfig")
          }
        }

        if (productionRoutesApi?.pathname !== null) {
          try {
            code = `import _fastifyRoutes from "${productionRoutesApi?.pathname}";\n ${outCode}`;
            outCode = code;
          } catch (error) {
            console.log(error);
          }
        }
        if (pluginHooksApi?.pathname !== null) {
          try {
            const code = `import _fastifyPluginHooks from "${pluginHooksApi?.pathname}";\n${outCode}`;
            outCode = code;
          } catch (error) {
            console.log(error);
          }
        }
        return outCode;
      }
    },
  };
};

const getProviderConfigFromFile = (
  authPluginConfig: AuthPluginProviderFromConfig
) => {
  try {
    return authPluginConfig["config"].pathname;
  } catch (error) {
    return undefined;
  }
};

/**
 * Main Astro integration for Fastify SSR adapter
 * Configures Fastify server, sets up routes, and manages build output
 * 
 * @param args - Adapter configuration options
 * @returns Astro integration hook configuration
 */
const createFastifyIntegration = (args: Options): AstroIntegration => {
  // Initialize adapter options with defaults
  const defaultArgs = initDefaultOptions(args);
  let _client: globalThis.URL;
  let _server: globalThis.URL;

  return {
    name: packageName,
    hooks: {
  "astro:config:setup"({ updateConfig }: { updateConfig: (config: any) => void }) {
        const config = {
          vite: {
            plugins: [createViteFastifySSRPlugin(defaultArgs)],
          },
        };
        updateConfig(config);
      },
  "astro:build:setup"({ vite, target }: { vite: any; target: string }) {
        if (target === "client") {
          const rollupOptions = vite?.build?.rollupOptions;
          if (rollupOptions) {
            Object.assign(rollupOptions, {
              plugins: [
                copy({
                  targets: [{ src: "public/*", dest: "dist/client/content" }],
                }),
              ],
            });
          }
          const outputOptions = vite?.build?.rollupOptions?.output;
          if (outputOptions && !Array.isArray(outputOptions)) {
            Object.assign(outputOptions, {
              entryFileNames: "assets/[name].[hash].js",
              chunkFileNames: "assets/chunks/[name].[hash].js",
              assetFileNames: "assets/[name].[hash][extname]",
            });
          }
        }
      },
  "astro:build:start": (): void | Promise<void> => {
        defaultArgs.clientRelative = relative(
          fileURLToPath(_server),
          fileURLToPath(_client)
        );
      },
  "astro:config:done": ({ setAdapter, config }: { setAdapter: (adapter: any) => void; config: any }) => {
        _client = config.build.client;
        _server = config.build.server;
        setAdapter(createAdapterConfig(defaultArgs));
        if (config.output === "static") {
          console.warn(
            `[${packageName}] \`output: "server"\` is required to use this adapter.`
          );
        }
      },
    },
  };
};

export default createFastifyIntegration;
