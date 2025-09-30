//utils
import { StaticRoute} from "./types";
import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __appRoot = path.join(import.meta.url, '../../../')

// const setFastifyStaticRoutes = (instance:FastifyInstance, staticRoute:StaticRoute)=>
// {
//     const {clientRelative,root,prefix, setHeaders} = staticRoute
//     const clientRoot = new URL(clientRelative, __appRoot);
//     const _root = fileURLToPath(new URL(root.toString(), clientRoot + "/"))
//     const decorateReply = staticRoute.decorateReply ?? false

//     if (!fs.existsSync(_root)) {
//       console.log(`directory ${_root} not found`);
//      // return undefined;
//     }else{
//       console.log(`directory ${_root} found registering static`);
//       instance.register(fastifyStatic, {
//         root:_root, 
//         prefix,
//         setHeaders,
//         decorateReply
//       })
//     }

   
// }

const setFastifyStaticRoutes = (instance: FastifyInstance, staticRoute: StaticRoute) => {
    const { clientRelative, root, prefix, setHeaders } = staticRoute;
    
    // Fix: Handle relative paths properly by resolving against current working directory
    let resolvedClientPath: string;
    
    try {
        // Check if clientRelative is already an absolute path or URL
        if (path.isAbsolute(clientRelative) || clientRelative.startsWith('http')) {
            resolvedClientPath = clientRelative;
        } else {
            // For relative paths, resolve against current working directory
            resolvedClientPath = path.resolve(process.cwd(), clientRelative);
        }
        
        // Construct the final root path using path.join instead of URL
        const _root = path.join(resolvedClientPath, root.toString());
        const decorateReply = staticRoute.decorateReply ?? false;

        if (!fs.existsSync(_root)) {
            console.log(`directory ${_root} not found`);
            // return undefined;
        } else {
            console.log(`directory ${_root} found registering static`);
            instance.register(fastifyStatic, {
                root: _root,
                prefix,
                setHeaders,
                decorateReply
            });
        }
    } catch (error) {
        console.error(`Error resolving static route path for ${clientRelative}:`, error);
        console.log(`Falling back to basic path resolution`);
        
        // Fallback: simple path joining
        const fallbackRoot = path.join(process.cwd(), clientRelative, root.toString());
        const decorateReply = staticRoute.decorateReply ?? false;
        
        if (fs.existsSync(fallbackRoot)) {
            console.log(`fallback directory ${fallbackRoot} found registering static`);
            instance.register(fastifyStatic, {
                root: fallbackRoot,
                prefix,
                setHeaders,
                decorateReply
            });
        } else {
            console.log(`fallback directory ${fallbackRoot} not found`);
        }
    }
  }


export {setFastifyStaticRoutes}