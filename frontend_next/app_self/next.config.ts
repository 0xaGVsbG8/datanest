import type { NextConfig } from "next";


export const base_backend_url = '://localhost:9000/datanest/backend' //must be in this format!
        

export const use_ssl: boolean = false // use only if you have domain with an ssl true if contains https else false


export const lazy_loading_support: boolean = true
export const lazy_loading_offset: number = 3



const nextConfig: NextConfig = {
  basePath: '/datanest',      
  assetPrefix: '/datanest',    
  allowedDevOrigins: [
    'http://localhost:9000',
    'http://localhost:9000'
  ],

  // //hides console logs in production
  compiler: process.env.NODE_ENV === "production"
    ? {
        removeConsole: {
          exclude: ["error", "warn"], 
        },
      }
  : undefined,
  
  
};

export default nextConfig;
