import { relative } from "path";
import copy from "rollup-plugin-copy";
import { fileURLToPath, URL } from "url";
import { Options } from "./types";
import { AstroAdapter, AstroIntegration} from "astro";
import config from "./config.js";
const {  packageName,
  serverFile,
  viteRoutesPackageName,
  packageBase, } = config

import initDefaultOptions from "./defaults.js";
import Fastify, { FastifyServerFactory } from "fastify";
import { Server } from "http";

const getAdapter = (args?: Options): AstroAdapter =>{
  const serverEntryPoint = `${packageName}/${serverFile}`;
  return {
    name: packageName,
    serverEntrypoint: serverEntryPoint,
    exports: ["createExports"],
    args: args,
  };
}

const viteFastifySSRPlugin=(options: any)=>{
  return {
    name: viteRoutesPackageName,
    async configureServer(server: any) {
      const nextSymbol = Symbol("next");
      const { devRoutesApi, logger } = options;

      const serverFactory: FastifyServerFactory = (handler: any, opts: any):Server => {
        server.middlewares.use((req: any, res: any, next: any) => {
          req[nextSymbol] = next;
          handler(req, res);
        });
        return server.httpServer;
      };

      const fastify = Fastify({
        logger: logger ?? true,
        serverFactory,
      });

      if (devRoutesApi) {
        if (typeof devRoutesApi != "function") {
          throw new Error(
            `astro-fastify: ${devRoutesApi.toString()} should be a function`
          );
        }
        devRoutesApi(fastify);
      }

      // Final catch-all route forwards back to the Vite server
      fastify.all("/*", function (request: any) {
        /** @type {import('connect').NextFunction} */
        const next = request.raw[nextSymbol];
        next();
      });

      await fastify.ready();
    },
    transform(code: any, id: any) {
      if (id.includes(`${packageBase}/dist/server.js`)) {        
         const { productionRoutesApi, pluginHooksApi } = options;
         let outCode:string = code
        if (productionRoutesApi.pathname !== null) {
          try {
            code = `import _fastifyRoutes from "${productionRoutesApi.pathname}";\n ${outCode}`;     
            outCode = code;
          } catch (error) {
            console.log(error);
          }
        }
        if (pluginHooksApi.pathname !== null) {
          try {
            const code = `import _fastifyPluginHooks from "${pluginHooksApi.pathname}";\n${outCode}`;
            outCode = code ;        
          } catch (error) {
            console.log(error);
          }
        }
        return outCode;
      }      
    },
  };
}

const adapter = (args: Options): AstroIntegration=>{
  // initilize options
  let defaultArgs = initDefaultOptions(args);
  let _client: globalThis.URL;
  let _server: globalThis.URL;

  return {
    name: packageName,
    hooks: {
      "astro:config:setup"({ updateConfig }) {
        const config = {
          vite: {
            plugins: [viteFastifySSRPlugin(defaultArgs)],
          },
        };
        updateConfig(config);
      },
      "astro:build:setup"({ vite, target }) {
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
      "astro:config:done": ({ setAdapter, config }) => {
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
}

export default adapter