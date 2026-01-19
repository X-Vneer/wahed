import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"

/**
 * Gets the current locale from the browser's URL path.
 * Extracts locale from paths like /en/... or /ar/...
 */
function getLocaleFromPath(): string {
  if (typeof window === "undefined") {
    return "ar" // Default for SSR
  }

  const pathname = window.location.pathname
  const segments = pathname.split("/").filter(Boolean)

  // Check if first segment is a valid locale
  const potentialLocale = segments[0]
  const validLocales = ["ar", "en"]

  if (potentialLocale && validLocales.includes(potentialLocale)) {
    return potentialLocale
  }

  // Fallback to default
  return "ar"
}

/**
 * Configured axios instance with automatic locale header injection
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add locale header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const locale = getLocaleFromPath()
      if (config.headers) {
        config.headers["Accept-Language"] = locale
      }
    } else {
      const locale = await (await import("next-intl/server")).getLocale()
      if (config.headers) {
        config.headers["Accept-Language"] = locale
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 (Unauthorized) globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
