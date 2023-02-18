//utils
import { StaticRoute} from "./types.js";
import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __appRoot = path.join(import.meta.url, '../../../')

const setFastifyStaticRoutes = (instance:FastifyInstance, staticRoute:StaticRoute)=>
{
    const {clientRelative,root,prefix, setHeaders} = staticRoute
    const clientRoot = new URL(clientRelative, __appRoot);
    const _root = fileURLToPath(new URL(root.toString(), clientRoot + "/"))
    const decorateReply = staticRoute.decorateReply ?? false

    if (!fs.existsSync(_root)) {
      console.log(`directory ${_root} not found`);
     // return undefined;
    }else{
      console.log(`directory ${_root} found registering static`);
      instance.register(fastifyStatic, {
        root:_root, 
        prefix,
        setHeaders,
        decorateReply
      })
    }

   
}
export {setFastifyStaticRoutes}