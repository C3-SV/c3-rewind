type MediaSource = { provider: "local" | "imagekit"; src: string };

export function resolveMediaSource(media: MediaSource, imageKitEndpoint = ""): string {
  if (media.provider === "local" || !imageKitEndpoint) return media.src;
  const endpoint = imageKitEndpoint.endsWith("/") ? imageKitEndpoint : `${imageKitEndpoint}/`;
  const url = new URL(media.src.replace(/^\/+/, ""), endpoint);
  url.searchParams.set("tr", "w-1600,q-85,f-auto");
  return url.toString();
}
