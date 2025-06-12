// Usage examples for API client interceptors and abort/cancel support
// Place this file in your project as needed (e.g., docs/apiClient-usage-examples.ts)

import {
  apiGet,
  apiPost,
  addRequestInterceptor,
  addResponseInterceptor,
} from "@/lib/apiClient";

// --- Example 1: Logging Interceptors (Console) ---
addRequestInterceptor(async (input, init) => {
  // You can send logs to a log management tool here
  // e.g., Sentry, Datadog, LogRocket, custom API, etc.
  console.log("[API Request]", input, init);
  // Example: send to a log management tool
  // logTool.logRequest({ url: input, ...init });
  return { input, init };
});

addResponseInterceptor(async (response) => {
  // You can send logs to a log management tool here
  console.log("[API Response]", response.status, response.url);
  // Example: send to a log management tool
  // logTool.logResponse({ status: response.status, url: response.url });
  return response;
});

// --- Example 2: Auth Refresh Interceptor (pseudo-code) ---
// addResponseInterceptor(async (response) => {
//   if (response.status === 401) {
//     // Attempt token refresh logic here
//     // Optionally retry the request
//   }
//   return response;
// });

// --- Example 3: Aborting a Request ---
async function fetchWithAbort() {
  const controller = new AbortController();
  const promise = apiGet("/flags", {}, { signal: controller.signal });
  // To cancel the request:
  // controller.abort();
  try {
    const data = await promise;
    console.log("Flags:", data);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.log("Request was aborted");
    } else {
      console.error("API error:", err);
    }
  }
}

// --- Example 4: Using abort in a React hook (pattern) ---
// useEffect(() => {
//   const controller = new AbortController();
//   apiGet("/flags", {}, { signal: controller.signal })
//     .then(setFlags)
//     .catch((err) => {
//       if (err.name !== "AbortError") setError(err.message);
//     });
//   return () => controller.abort();
// }, []);

// --- Extending for Log Management Tools ---
// Replace console.log with your log management tool's API:
// import * as Sentry from "@sentry/nextjs";
// addRequestInterceptor(async (input, init) => {
//   Sentry.addBreadcrumb({
//     category: "api-request",
//     message: String(input),
//     data: { ...init },
//     level: "info",
//   });
//   return { input, init };
// });
//
// addResponseInterceptor(async (response) => {
//   Sentry.addBreadcrumb({
//     category: "api-response",
//     message: response.url,
//     data: { status: response.status },
//     level: response.ok ? "info" : "error",
//   });
//   return response;
// });
