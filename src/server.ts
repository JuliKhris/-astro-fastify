//server starting
import { NodeApp } from "astro/app/node";
import Fastify from "fastify";
import { polyfill } from "@astrojs/webapi";
import {
  AvailableFastifyRoutes,
  FastifyPluginHooks,
  IncomingMessage,
  Options,
  Properties,
  ServerResponse,
  SSRManifest,
} from "./types.js";
import initDefaultOptions from "./defaults.js";
import { setFastifyStaticRoutes } from "./utils.js";
import { RouteInfo } from "astro/app/types.js";
import { RouteData } from "astro";
import { FastifyReply } from "fastify/types/reply.js";
import Stream, { Readable } from 'node:stream';

polyfill(globalThis, {
  exclude: "window document",
});

const authActions =
  // @ts-ignore
  typeof _authActions != "undefined" ? _authActions : undefined;

const authPlugin =
  // @ts-ignore
  typeof _authPlugin != "undefined" ? _authPlugin : undefined;

const authPluginConfig =
  // @ts-ignore
  typeof _authPluginConfig != "undefined" ? _authPluginConfig : undefined;

const fastifyRoutes: AvailableFastifyRoutes =
  // @ts-ignore
  typeof _fastifyRoutes != "undefined" ? _fastifyRoutes : undefined;
const fastifyPluginHooks: FastifyPluginHooks =
  // @ts-ignore
  typeof _fastifyPluginHooks != "undefined" ? _fastifyPluginHooks : undefined;

export const start = async (manifest: SSRManifest, options: Options) => {
  let defaultArgs = initDefaultOptions(options);
  const app = new NodeApp(manifest);
  const { useLogger, port, host, staticRoutes, fastifyServerOptions } = defaultArgs;

  const fastify = Fastify({
    logger: useLogger,
    ...fastifyServerOptions 
  });

  
  console.log("on start set routes");

  staticRoutes!.forEach((element) => {
    setFastifyStaticRoutes(fastify, element);
  });

  if (fastifyRoutes) {
    fastifyRoutes(fastify);
  }

  if (fastifyPluginHooks) {
    fastifyPluginHooks(fastify);
  }

  const getRouteAuthorityInfo = (routeData: RouteData) => {
    return getAuthorityInfoFromRoute(routeData);
  };

  const getAuthorityInfoFromRoute = (route: RouteData) => {
    if (route) {
      const { params } = route;
      return getAuthorityInfoFromParams(params);
    } else {
      return undefined;
    }
  };

  const getAuthorityInfoFromParams = (parms: string[]) => {
    const authObj = getAuthObjFromJSON(parms);
    return authObj;
  };

  const getAuthObjFromJSON = (obj: any) => {
    try {
      // {"type":"auth","authenticate":true, "roles":[{}]}
      const _obj = JSON.parse(obj);
      if (_obj.type == "auth") {
        return _obj;
      }
    } catch (error) {
      return null;
    }
  };

const processResponseHeaders = (response: any)=>{
  if (
    response.headers.get("content-type") === "text/html" &&
    !response.headers.has("content-encoding")
  ) {
    response.headers.set("content-encoding", "none");
  }
  return response
}  

const generateResponse = async (request: { raw: IncomingMessage | Request; },routeData: RouteData | undefined)=>{
  const response = await app.render(request.raw, routeData);
  const finalResponse = processResponseHeaders(response)
  return finalResponse
}

const processResponse = async(reply:FastifyReply, request: { raw: IncomingMessage | Request; },routeData: RouteData | undefined):Promise<FastifyReply>=>{
  const response = await generateResponse(request, routeData)  
  return await writeWebResponse(reply, response);
}

  if (authPluginConfig) {
    if (authPlugin) { 
      if (authActions) {
        const { decorator, functionName, useRoutesFromManifest } =
          authPluginConfig;
          const { validate } = authActions();         
        if (validate) {
          fastify.register(authPlugin,{[functionName]:validate}).after(()=>{
          if (useRoutesFromManifest) {
            manifest.routes.forEach((element: RouteInfo) => {
              const _routeData = element.routeData;
              const obj = getRouteAuthorityInfo(_routeData);
              if (obj?.authenticate) {
                const { route } = _routeData;
                //@ts-ignore
                fastify.route({
                  method: "GET",
                  url: route,
                  // @ts-ignore
                  preHandler: fastify[`${decorator}`],
                  handler: async (request, reply) => {
                    request.log.info(`${route} generated`);
                    return await processResponse(reply,request,_routeData)                                  
                  },
                });
              }
            });
          } else {
            // @ts-ignore
            fastify.addHook("onRequest", fastify[`${decorator}`]);
          }
        })
        } else {
          console.log("Auth Actions must export validate function");
        }
      }
    }
  }

  fastify.get("/*", async function (request, reply) {
    const routeData = app.match(request.raw, { matchNotFound: true });
    if (routeData) {
      return await processResponse(reply,request,routeData)       
    } else {
      reply.status(404).type("text/plain").send("Not found");
    }
  });

  const envPort = Number(process.env.PORT ?? port);
  const hostToUse = process.env.HOST ?? (host ?? "127.0.0.1").toString();

  fastify.listen(
    {
      host: hostToUse,
      ...(isNaN(envPort)
        ? { path: process.env.PORT }
        : { port: envPort ?? port }),
    },
    function (err, address) {
      if (err) {
        fastify.log.error(err);
        process.exit(1);        
      }
      process.env.SERVER_ACTIVE_ADDRESS = address
      console.log(`Server is now listening on ${process.env.SERVER_ACTIVE_ADDRESS}`);
    }
  );
};

async function writeChunks(chunks: any, res: FastifyReply):Promise<FastifyReply>{
  const s = new Readable();
    s._read = () => {}
    res.send(s)
    for await (const chunk of chunks) {
       s.push(chunk)
    }
    s.push(null)    
    await res
    return res
  }

async function writeWebResponse(
  res: FastifyReply,
  webResponse: Response
):Promise<FastifyReply> {
  const {status, headers, body } = webResponse;
  res.code(status)
  res.headers(Object.fromEntries(headers.entries()));    
  if (body) {
  return await writeChunks(body,res)
  }
  return res
}

export function createExports({ manifest, options }: Properties) {
  return {
    start() {
      return start(manifest, options);
    },
  };
}
