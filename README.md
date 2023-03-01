
# Fastify SSR

Fastify Server Side Rendering provider for the AstroBuild Framework. This is being built out as a plugin to be used as part of the JuliKhris lowcode framework which is being build on top of AstroBuild. To leverage Data Islands, Minimal JS and Server Side Rendering. 

Although you can use as adapter for AstroBuild. Currently being used for clients on Azure Windows, Azure Linux, Oracle Cloud, and AWS

Coming Soon: 
1) Extraction of viteFastifySSRPlugin into its own repo\vite plugin currently resides in index.ts
2) Test scripts

Special thanks to @matthewp/astro-fastify; this is an extension of that adapter writing in TS with additional parameters for customization. 



## Authors

- [@DinoDon](https://github.com/tifsolus)

## Version0.0.59
1 ) Added ability to pass auth plugin as a parameter. New parameter authPluginProvider?: AuthPluginProvider | AuthPluginProviderFromConfig; Pass a authplugin config file.       
       Example file content of file that can be passed as value
       import { pathToFileURL, URL } from "url";
      const authPluginConfig = {
      "pluginName": "@julikhris/fastify-msal",
      "objectName": "fastifyAuthMsal",
      "pluginPath": pathToFileURL("Path to a plugin"),
      "authActions":pathToFileURL("Path to a file containing actions, must have a function named validate to handle authentication validation, This will be passed to plugin option defined by  "),
      "decorator": "name of plugin decorator to call",
      "functionName": "name of plugin option that the validate function from authActions will be passed to"

See usage below         

## Installation

Install @julikhris/astro-fastify

npm install @julikhris/astro-fastify
    
## Usage

```typescript
//Import the adapter 
// Git Repo Comin Soon!
//import adapter from "@julikhris/astro-fastify";

//create a arrow function to build adapter values
// Parameters to pass:
//client relative: variable for relative path to client files example dist\client
// static routes build a colleciton of statice routes css folder etc
// example const 
// getStaticRoutes = (clientRoot) => {
//   console.log("getting static routes")
//  return [
//    {
//      clientRelative:clientRoot,
//      root: "assets",
//      prefix: "/assets/",
//      setHeaders(res) {
//        res.setHeader("Cache-Control", "max-age=31536000,//immutable");
//      },
//      decorateReply: true,
//    }
//  ]
//  }
// server routes to run in dev only
// server routes to run in prod
// port to listen on Azure windows will default to path as it used named pipes
// plugin hooks that attaches to Fastify onrequest hook: for example inject auth hander

// Example
// const useFastifyAdapter = (
//   clientRelative: string,
//   staticRoutes: ({ clientRelative: any; root: string; prefix: string; setHeaders(res: any): void; decorateReply: boolean; } | { clientRelative: any; root: string; prefix: string; setHeaders(res: any): void; decorateReply?: undefined; })[],
//   devRoutesApi: any,
//   productionRoutesApi: URL,
//   port: number,
//   pluginHooksApi: URL
// ) => {
//   return adapter({
//     clientRelative,
//     staticRoutes,
//     devRoutesApi,
//     productionRoutesApi,
//     port,
//     pluginHooksApi,
//     authPluginProvider:{config:pathToFileURL(resolvedAuthConfigPlugin)}
//   })
// };

// // add adapter to astro.config
//  adapter: useFastifyAdapter(
//     clientRelative,
//     getStaticRoutes(clientRelative),
//     await getServerRoutes(),
//     pathToFileURL(resolvedServerRoutesPath),
//     serverPort,
//     pathToFileURL(resolvedServerHooksPath)
//   ),




## Documentation

Coming Soon


## Support

Coming Soon


## Contributing

Contributions are always welcome!

Coming Soon

