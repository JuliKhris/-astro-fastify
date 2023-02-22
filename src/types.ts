
import { SSRManifest } from "astro/app/types.js";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyPluginAsync } from "fastify/types/plugin";
export type {FastifyServerFactory} from 'fastify'
export type { ServerResponse, IncomingMessage } from 'http';
export type { SSRManifest } from "astro/app/types.js";
export type { Plugin as VitePlugin, UserConfig } from 'vite';

export interface Properties {
    manifest: SSRManifest
    options: Options
}

export interface StaticRoute{
    clientRelative: string
    root: string | string[]
    prefix?: string | undefined
    decorateReply?: boolean | undefined
    ,setHeaders?: (...args: any[]) => void;
}

export type StaticRoutes = StaticRoute[]

export interface Options {
    productionRoutesApi?: string | URL | ((instance:FastifyInstance)=> any)
    devRoutesApi?: string | URL | ((instance:FastifyInstance)=> any)     
    pluginHooksApi?: string | URL | ((instance:FastifyInstance)=> any)
    clientRelative: string | URL 
    port?: number 
    host?:string | URL
    useLogger?: boolean
    staticRoutes?:StaticRoutes
    serverEntryPoint?: string
    fastifyPlugins?:FastifyPlugins
}

export type AvailableFastifyRoutes = (fastify: FastifyInstance) => void;

export type FastifyPluginHooks= (fastify: FastifyInstance) => void;

export type FastifyPlugins = FastifyPluginAsync[]




