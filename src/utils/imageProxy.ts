/**
 * Utility for proxying image URLs to avoid CORS issues
 * Converts R2 URLs to proxy endpoint URLs with CORS headers
 */

export function getProxiedImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";

  // If already a proxy URL, return as-is
  if (imageUrl.includes("/api/images/proxy")) {
    return imageUrl;
  }

  // If it's a data URL (base64), return as-is
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  // Extract the R2 path from the full URL
  // e.g., https://pub-c0ddba9f039845bda33be436955187cb.r2.dev/campaigns/28/image.png
  // -> /campaigns/28/image.png
  const r2UrlPattern = /^https?:\/\/[^/]+(\/.*)$/;
  const match = imageUrl.match(r2UrlPattern);

  let r2Path: string | null = null;

  if (match && match[1]) {
    // Full URL - extract the path
    r2Path = match[1];
  } else if (!imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
    // Relative path without leading slash - prepend slash
    r2Path = `/${imageUrl}`;
  } else if (imageUrl.startsWith("/")) {
    // Relative path with leading slash
    r2Path = imageUrl;
  }

  if (r2Path) {
    // Use backend API base URL to create absolute proxy URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blitzed.up.railway.app';
    const proxyUrl = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(r2Path)}`;
    console.log("🔍 getProxiedImageUrl:", { original: imageUrl, proxy: proxyUrl });
    return proxyUrl;
  }

  console.log("⚠️ getProxiedImageUrl: Could not parse URL:", imageUrl);
  return imageUrl;
}
