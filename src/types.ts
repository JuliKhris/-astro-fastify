
import { SSRManifest } from "astro/app/types.js";
import { FastifyInstance } from "fastify/types/instance";
import { FastifyPluginAsync } from "fastify/types/plugin";
import { Url } from "url";
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
    productionRoutesApi?: URL 
    devRoutesApi?: (fastify:FastifyInstance)=>any
    pluginHooksApi?: URL 
    clientRelative: string | URL 
    port?: number 
    host?:string | URL
    useLogger?: boolean
    staticRoutes?:StaticRoutes
    serverEntryPoint?: string
    fastifyPlugins?:FastifyPlugins
    authPluginProvider?: AuthPluginProvider | AuthPluginProviderFromConfig 
}

export type AvailableFastifyRoutes = (fastify: FastifyInstance) => void;

export type FastifyPluginHooks= (fastify: FastifyInstance) => void;

export type AuthPluginProvider = {authPlugin:FastifyPluginAsync, validateDecorator:string, options:{} }

export type AuthPluginProviderFromConfig = {config:Url}

export type FastifyPlugins = FastifyPluginAsync[]






