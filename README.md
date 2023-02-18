
# Fastify SSR

Fastify Server Side Rendering provider for the AstroBuild Framework. This is being built out as a plugin to be used as part of the JuliKhris lowcode framework which is being build on top of AstroBuild. To leverage Data Islands, Minimal JS and Server Side Rendering. 

Although you can use as adapter for AstroBuild. Currently being used for clients on Azure Windows, Azure Linux, Oracle Cloud, and AWS

Coming Soon: 
1) Extraction of viteFastifySSRPlugin into its own repo\vite plugin currently resides in index.ts
2) Test scripts

Special thanks to @matthewp/astro-fastify; this is an extension of that adapter writing in TS with additional parameters for customization. 



## Authors

- [@DinoDon](https://github.com/tifsolus)





## Installation

Install @julikhris/astro-fastify

npm install @julikhris/astro-fastify
    
## Usage/

```typescript
//Import the adapter 
// Git Repo Comin Soon!
import adapter from "@julikhris/astro-fastify";

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

const useFastifyAdapter = (
  clientRelative,
  staticRoutes,
  devRoutesApi,
  productionRoutesApi,
  port,
  pluginHooksApi
) => {
  return adapter({
    clientRelative,
    staticRoutes,
    devRoutesApi,
    productionRoutesApi,
    port,
    pluginHooksApi,
  });
};

// add adapter to astro.config
 adapter: useFastifyAdapter(
    clientRelative,
    getStaticRoutes(clientRelative),
    await getServerRoutes(),
    pathToFileURL(resolvedServerRoutesPath),
    serverPort,
    pathToFileURL(resolvedServerHooksPath)
  ),
```




## Documentation

Coming Soon


## Support

Coming Soon


## Contributing

Contributions are always welcome!

Coming Soon

