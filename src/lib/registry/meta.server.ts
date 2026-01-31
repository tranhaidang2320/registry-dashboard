const REGISTRY_URL = process.env.REGISTRY_URL || "http://localhost:5000"

export function getRegistryEndpoint() {
  try {
    const url = new URL(REGISTRY_URL)
    return url.host || url.origin
  } catch {
    return REGISTRY_URL
  }
}
