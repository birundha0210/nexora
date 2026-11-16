const blockedEmbedHosts = ["courses.supersimple.dev"];
const knownEmbedHosts = [
  "youtube.com",
  "youtube-nocookie.com",
  "vimeo.com",
  "dailymotion.com",
  "loom.com",
  "codepen.io",
];

function safeHttpUrl(value) {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

function hostMatches(hostname, domain) {
  return hostname === domain || hostname.endsWith("." + domain);
}

function youtubeVideoId(url) {
  if (
    !hostMatches(url.hostname, "youtube.com") &&
    !hostMatches(url.hostname, "youtube-nocookie.com") &&
    url.hostname !== "youtu.be"
  )
    return null;
  if (url.hostname === "youtu.be")
    return url.pathname.split("/").filter(Boolean)[0] || null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const parts = url.pathname.split("/").filter(Boolean);
  return ["embed", "shorts", "live"].includes(parts[0])
    ? parts[1] || null
    : null;
}

export function getVideoEmbed(value) {
  const url = safeHttpUrl(value);
  if (!url) return null;

  if (blockedEmbedHosts.some((host) => hostMatches(url.hostname, host))) {
    return { type: "fallback", originalUrl: url.href };
  }

  const videoId = youtubeVideoId(url);
  if (videoId && /^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
    return {
      type: "iframe",
      url: "https://www.youtube-nocookie.com/embed/" + videoId,
      title: "YouTube video",
    };
  }

  if (/\.mp4$/i.test(url.pathname)) {
    return { type: "video", url: url.href };
  }

  const isKnownProvider = knownEmbedHosts.some((host) =>
    hostMatches(url.hostname, host),
  );
  const hasEmbedPath = /\/(embed|player|video|iframe)(\/|$)/i.test(
    url.pathname,
  );
  if (isKnownProvider || hasEmbedPath) {
    return { type: "iframe", url: url.href, title: "Embedded video" };
  }

  return null;
}

export function createVideoEmbedNode(document, embed) {
  if (embed.type === "fallback") {
    const fallback = document.createElement("div");
    fallback.className = "embed-fallback";
    const message = document.createElement("p");
    message.textContent =
      "This content cannot be embedded. Open the original website to view it.";
    const link = document.createElement("a");
    link.href = embed.originalUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open original website";
    fallback.append(message, link);
    return fallback;
  }

  const figure = document.createElement("figure");
  figure.className = "article-video";
  if (embed.type === "video") {
    const video = document.createElement("video");
    video.src = embed.url;
    video.controls = true;
    video.preload = "metadata";
    figure.append(video);
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = embed.url;
    iframe.title = embed.title || "Embedded video";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    figure.append(iframe);
  }
  return figure;
}
