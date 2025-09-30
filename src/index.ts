import { relative } from "path";
import copy from "rollup-plugin-copy";
import { fileURLToPath, URL } from "url";
import { AuthPluginProviderFromConfig, Options } from "./types";
import { AstroAdapter, AstroIntegration } from "astro";
import config from "./config.js";
const { packageName, serverFile, viteRoutesPackageName, packageBase } = config;

import initDefaultOptions from "./defaults.js";
import Fastify, { FastifyServerFactory } from "fastify";
import { Server, createServer } from "http";

const getAdapter = (args?: Options): AstroAdapter => {
  const serverEntryPoint = `${packageName}/${serverFile}`;
  return {
    name: packageName,
    serverEntrypoint: serverEntryPoint,
    exports: ["createExports"],
    args: args,
  };
};

const viteFastifySSRPlugin = (options: Options) => {
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
          const _configPathFromFile = getProviderConfigFromFile(
            authPluginProvider as AuthPluginProviderFromConfig
          )
          
          if (_configPathFromFile) {
            outCode = `import _authPluginConfig from "${_configPathFromFile}"; \n ${outCode}`
            await import(_configPathFromFile).then(async item=>{
              const _authPluginConfig = item.default
              const {pluginPath,authActions,validateFunctionName, actionsName} = _authPluginConfig; 
              if(pluginPath){
                const plugIn = await import(pluginPath.pathname).then( 
                  async (item)=> { 
                  if(pluginPath.pathname){
                      outCode = `import _authPlugin from "${pluginPath.pathname}";\n  ${outCode}`;
                  }
                  if(authActions.pathname){
                      outCode = `import _authActions from "${authActions.pathname}";\n ${outCode}`;  
                  }                                                                
                })
              }
          }); 
          }
          else{
            //try authplugin provider object
            console.log("AuthPluginProvider type not implemented yet. Please use AuthPluginProviderFromConfig")
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

const adapter = (args: Options): AstroIntegration => {
  // initilize options
  let defaultArgs = initDefaultOptions(args);
  let _client: globalThis.URL;
  let _server: globalThis.URL;

  return {
    name: packageName,
    hooks: {
  "astro:config:setup"({ updateConfig }: { updateConfig: (config: any) => void }) {
        const config = {
          vite: {
            plugins: [viteFastifySSRPlugin(defaultArgs)],
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
        setAdapter(getAdapter(defaultArgs));
        if (config.output === "static") {
          console.warn(
            `[${packageName}] \`output: "server"\` is required to use this adapter.`
          );
        }
      },
    },
  };
};

export default adapter;
