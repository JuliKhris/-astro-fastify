import { Options, StaticRoutes} from "./types.js";
import config from "./config.js";
const { port, useLogger, clientRelative, host, packageName, serverFile } = config
import { fileURLToPath } from "url";

const initDefaultOptions = (options?: Partial<Options>): Options => {
   const {pluginHooksApi:_pluginHooksApi, staticRoutes,port:_port, 
    host:_host, useLogger:_useLogger,clientRelative:_clientRelative,fastifyPlugins:_fastifyPlugins} = options!

  const clientRoot = new URL(_clientRelative ?? clientRelative, import.meta.url);
  const url = fileURLToPath(new URL('./assets', clientRoot + '/'))
 
  const _staticRoutes:StaticRoutes = staticRoutes ?? [ { 
    clientRelative:_clientRelative?.toString() ?? clientRelative,
    root:'assets',
    prefix:'/assets/',
    decorateReply:true,
    setHeaders(res:any){
      res.setHeader('Cache-Control', 'max-age=31536000,immutable')},
     }]
    
    const portToUse =  process.env.PORT ?? (port ?? _port) 
    const hostToUse =  process.env.HOST ?? (host ?? _host)

    const defaults:Options = {
      clientRelative:clientRoot,
      port: ~~portToUse,
      host: hostToUse,
      useLogger: _useLogger?? useLogger,
      staticRoutes:_staticRoutes,
      serverEntryPoint:`${packageName}/${serverFile}`,
      pluginHooksApi: _pluginHooksApi ?? undefined,
      fastifyPlugins: _fastifyPlugins ?? undefined
    }      
    return {
      ...defaults,
      ...options,
    };

  }
  
  export default initDefaultOptions