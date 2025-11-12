/**
 * Dynamically loads Relayer SDK for production mode
 * Prefers window.relayerSDK (CDN injected) over npm package
 * 
 * v0.3.0 Update: Uses UMD format from CDN
 */

declare global {
  interface Window {
    relayerSDK?: any;
  }
}

// SDK CDN URL - v0.3.0-5 UMD format
export const SDK_CDN_URL = "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs";
export const SDK_LOCAL_URL = "/relayer-sdk-js.umd.cjs";

let cachedSDK: any = null;
let loadingPromise: Promise<any> | null = null;

/**
 * Load SDK from CDN via script tag
 */
async function loadFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.relayerSDK) {
      resolve(window.relayerSDK);
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript"; // UMD format needs this, not "module"
    script.async = true;

    // Try local first, then CDN
    script.src = SDK_LOCAL_URL;
    
    script.onload = () => {
      if (window.relayerSDK) {
        console.log("[RelayerSDKLoader] Successfully loaded from local");
        resolve(window.relayerSDK);
      } else {
        reject(new Error("SDK loaded but window.relayerSDK not available"));
      }
    };

    script.onerror = () => {
      // Fallback to CDN
      console.log("[RelayerSDKLoader] Local failed, trying CDN...");
      const cdnScript = document.createElement("script");
      cdnScript.type = "text/javascript";
      cdnScript.async = true;
      cdnScript.src = SDK_CDN_URL;

      cdnScript.onload = () => {
        if (window.relayerSDK) {
          console.log("[RelayerSDKLoader] Successfully loaded from CDN");
          resolve(window.relayerSDK);
        } else {
          reject(new Error("CDN SDK loaded but window.relayerSDK not available"));
        }
      };

      cdnScript.onerror = () => {
        reject(new Error("Failed to load SDK from both local and CDN"));
      };

      document.head.appendChild(cdnScript);
    };

    document.head.appendChild(script);
  });
}

export async function loadRelayerSDK() {
  if (cachedSDK) return cachedSDK;

  // Prevent multiple concurrent loads
  if (loadingPromise) return loadingPromise;

  // Try window.relayerSDK first (already loaded)
  if (typeof window !== "undefined" && window.relayerSDK) {
    cachedSDK = window.relayerSDK;
    return cachedSDK;
  }

  // Load from CDN
  loadingPromise = loadFromCDN()
    .then((sdk) => {
      cachedSDK = sdk;
      loadingPromise = null;
      return sdk;
    })
    .catch((error) => {
      loadingPromise = null;
      console.error("[RelayerSDKLoader] Failed to load SDK:", error);
      throw new Error("Failed to load Relayer SDK from CDN. Please check your internet connection.");
    });

  return loadingPromise;
}

