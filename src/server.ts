//server starting
import { NodeApp } from 'astro/app/node';
import Fastify from 'fastify';
import { polyfill } from '@astrojs/webapi';
import { AvailableFastifyRoutes, FastifyPluginHooks, IncomingMessage, Options, Properties, ServerResponse, SSRManifest, FastifyPlugins } from './types.js';
import initDefaultOptions from './defaults.js';
import { setFastifyStaticRoutes } from './utils.js';

polyfill(globalThis, {
  exclude: 'window document',
});

const fastifyRoutes: AvailableFastifyRoutes =
  // @ts-ignore
typeof _fastifyRoutes != 'undefined' ? _fastifyRoutes : undefined;
const fastifyPluginHooks: FastifyPluginHooks =
// @ts-ignore
typeof _fastifyPluginHooks != 'undefined' ? _fastifyPluginHooks : undefined;


export const start = async (manifest: SSRManifest, options: Options) => {
  let defaultArgs = initDefaultOptions(options)
  const app = new NodeApp(manifest);
  const { useLogger, port, host, staticRoutes, fastifyPlugins, authPluginProvider} = defaultArgs;
 
  const fastify = Fastify({
    logger: useLogger
  });

  //register plugins

  fastify.register

  console.log("on start set routes")

  staticRoutes!.forEach(element => {
    setFastifyStaticRoutes(fastify, element)
  });

  if (fastifyRoutes) {
    fastifyRoutes(fastify);
  }

  if(fastifyPluginHooks){
		fastifyPluginHooks(fastify)
	}
  
  if (authPluginProvider) {
    console.log('authPlugin found');
    const { authPlugin, validateDecorator } = authPluginProvider;
    fastify.register(authPlugin).after(() => {
        if (fastify.hasDecorator(validateDecorator))
            console.log("found decorator");
        // @ts-ignore  
        fastify.get('/*', fastify[validateDecorator]);
        //fastify[validateDecorator]
    });
}

  fastify.get('/*', async function (request, reply) {
    console.log("request made to fastify")   
    const routeData = app.match(request.raw, { matchNotFound: true });
    if (routeData) {
      const response = await app.render(request.raw, routeData);
      if (response.headers.get('content-type') === 'text/html' && !response.headers.has('content-encoding')) {
        response.headers.set('content-encoding', 'none');
      }
      await writeWebResponse(reply.raw, response);
    } else {
      reply.status(404).type('text/plain').send('Not found');
    }
  });
  
  const envPort = Number(process.env.PORT ?? port)
  const hostToUse = process.env.HOST ?? ( host ?? "127.0.0.1").toString()
   
  fastify.listen({
    host: hostToUse,
    ...(isNaN(envPort) ? { path: process.env.PORT } : { port: envPort ?? port }),
  }, function (err, address) {
    if (err) {
      console.log("fastify error:")
      console.log(err)
      fastify.log.error(err)
      process.exit(1)
    }
     console.log(`Server is now listening on ${address}`)
  });
}

async function writeChunks(chunks: any, res: ServerResponse<IncomingMessage>) {
  for await (const chunk of chunks) {
    res.write(chunk)
  }
}

async function writeWebResponse(res: ServerResponse<IncomingMessage>, webResponse: Response) {
  const { status, headers, body } = webResponse;
  res.writeHead(status, Object.fromEntries(headers.entries()));
  if (body) {
    await writeChunks(body, res)
  }
  res.end();
}

export function createExports({ manifest, options }: Properties) {
  return {
    start() {
      console.log("start")
      return start(manifest, options);
    }
  }
}
