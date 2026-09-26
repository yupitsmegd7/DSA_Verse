import { XMLParser } from "fast-xml-parser";
import { createHash } from "node:crypto";
export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceUrl: string;
  publishedAt: string | null;
  region: string;
  regionBasis: "title" | "edition" | "unknown";
  mode: "Online" | "In person" | "Unspecified";
  tags: string[];
  kind: "News" | "Community";
  deadline: null;
};
export type FeedStatus = {
  source: string;
  ok: boolean;
  count: number;
  error?: string;
};
export type NewsFeed = {
  items: NewsItem[];
  sources: FeedStatus[];
  fetchedAt: string;
  stale: boolean;
};
const editions = [
  { code: "US", locale: "en-US", ceid: "US:en", region: "North America" },
  { code: "IN", locale: "en-IN", ceid: "IN:en", region: "India" },
  { code: "GB", locale: "en-GB", ceid: "GB:en", region: "Europe" },
  { code: "AU", locale: "en-AU", ceid: "AU:en", region: "Oceania" },
  { code: "SG", locale: "en-SG", ceid: "SG:en", region: "Asia" },
];
export const sources = editions.map((e) => ({
  name: `Google News · ${e.code}`,
  region: e.region,
  url: `https://news.google.com/rss/search?q=hackathon+when:30d&hl=${e.locale}&gl=${e.code}&ceid=${e.ceid}`,
}));
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  processEntities: true,
  parseTagValue: false,
  htmlEntities: true,
});
const plain = (x: unknown) =>
  String(typeof x === "object" && x ? (x as any)["#text"] || "" : x || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function safeLink(input: unknown) {
  try {
    const u = new URL(plain(input));
    return ["https:", "http:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
function classify(title: string, edition: string) {
  let region = edition,
    regionBasis: "title" | "edition" | "unknown" =
      edition === "Worldwide" ? "unknown" : "edition";
  const rules: [RegExp, string][] = [
    [
      /\b(india|indian|bengaluru|bangalore|delhi|mumbai|hyderabad|chennai|pune|bhubaneswar|kolkata)\b/i,
      "India",
    ],
    [
      /\b(singapore|japan|tokyo|korea|seoul|china|hong kong|taiwan|malaysia|indonesia|philippines|vietnam|dubai|uae)\b/i,
      "Asia",
    ],
    [
      /\b(london|uk|europe|berlin|paris|germany|france|amsterdam|switzerland|spain|italy)\b/i,
      "Europe",
    ],
    [
      /\b(africa|kenya|nairobi|nigeria|lagos|ghana|rwanda|cape town)\b/i,
      "Africa",
    ],
    [
      /\b(brazil|buenos aires|argentina|chile|colombia|latin america)\b/i,
      "South America",
    ],
    [/\b(australia|sydney|melbourne|new zealand|auckland)\b/i, "Oceania"],
    [
      /\b(usa|united states|san francisco|new york|canada|toronto|boston|seattle|silicon valley)\b/i,
      "North America",
    ],
  ];
  for (const [re, r] of rules)
    if (re.test(title)) {
      region = r;
      regionBasis = "title";
      break;
    }
  const tags: string[] = [];
  if (
    /\b(ai|ml|llm|agent|artificial intelligence|machine learning)\b/i.test(
      title,
    )
  )
    tags.push("AI / ML");
  if (/web3|blockchain|ethereum|solana|crypto/i.test(title)) tags.push("Web3");
  if (/climate|sustainab|green|energy/i.test(title)) tags.push("Climate");
  if (/health|medical|bio/i.test(title)) tags.push("Health");
  if (/student|campus|university|college/i.test(title)) tags.push("Students");
  if (!tags.length) tags.push("Software");
  return {
    region,
    regionBasis,
    tags,
    mode: (/\b(online|virtual|remote)\b/i.test(title)
      ? "Online"
      : /\b(in.person|on.site)\b/i.test(title)
        ? "In person"
        : "Unspecified") as NewsItem["mode"],
  };
}
export function parseRss(xml: string, edition: string): NewsItem[] {
  if (xml.length > 2500000 || /<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error("Unsupported feed document");
  const root = parser.parse(xml);
  const raw = root.rss?.channel?.item || [];
  return (Array.isArray(raw) ? raw : [raw])
    .map((item: any) => {
      const source = plain(item.source) || "News source";
      const title = plain(item.title)
        .replace(
          new RegExp(
            " - " + source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          ),
          "",
        )
        .slice(0, 240);
      const url = safeLink(item.link);
      const time = Date.parse(plain(item.pubDate));
      return {
        id: createHash("sha256")
          .update(url || title.toLowerCase())
          .digest("hex")
          .slice(0, 20),
        title,
        url,
        source,
        sourceUrl: safeLink(item.source?.["@_url"]),
        publishedAt: Number.isFinite(time)
          ? new Date(time).toISOString()
          : null,
        ...classify(title, edition),
        kind: "News" as const,
        deadline: null,
      };
    })
    .filter(
      (i: NewsItem) =>
        i.title &&
        i.url &&
        /hackathon|hackfest|hack day|hack week|buildathon/i.test(i.title),
    );
}
export function deduplicate(items: NewsItem[]) {
  const seen = new Set<string>();
  return items
    .filter((i) => {
      const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}
async function readLimited(response: Response) {
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty source response");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 2500000) throw new Error("Source response too large");
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(bytes);
}
let cache: NewsFeed | null = null;
let pending: Promise<NewsFeed> | null = null;
export async function fetchHackathons(): Promise<NewsFeed> {
  if (cache && Date.now() - Date.parse(cache.fetchedAt) < 15 * 60000)
    return cache;
  if (pending) return pending;
  pending = (async () => {
    const results = await Promise.all(
      sources.map(async (s) => {
        try {
          const response = await fetch(s.url, {
            headers: {
              "User-Agent": "DSAVerse/2.0 (hackathon news reader)",
              Accept: "application/rss+xml, application/xml, text/xml",
            },
            signal: AbortSignal.timeout(8000),
            next: { revalidate: 900 },
          });
          const items = parseRss(await readLimited(response), s.region);
          return {
            items,
            status: {
              source: s.name,
              ok: true,
              count: items.length,
            } as FeedStatus,
          };
        } catch (e) {
          return {
            items: [],
            status: {
              source: s.name,
              ok: false,
              count: 0,
              error: "This source is temporarily unavailable.",
            } as FeedStatus,
          };
        }
      }),
    );
    try {
      const response = await fetch(
        "https://dev.to/api/articles?tag=hackathon&per_page=30",
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
          next: { revalidate: 900 },
        },
      );
      const raw = JSON.parse(await readLimited(response));
      if (!Array.isArray(raw)) throw new Error("Invalid community response");
      const items: NewsItem[] = raw
        .filter((a) => /hackathon|challenge|buildathon/i.test(a.title))
        .map((a) => ({
          id: `dev-${a.id}`,
          title: plain(a.title).slice(0, 240),
          url: safeLink(a.url),
          source: "DEV Community",
          sourceUrl: "https://dev.to/t/hackathon",
          publishedAt: Number.isFinite(Date.parse(a.published_at))
            ? new Date(a.published_at).toISOString()
            : null,
          ...classify(plain(a.title), "Worldwide"),
          kind: "Community" as const,
          deadline: null,
        }))
        .filter((a) => a.url);
      results.push({
        items,
        status: { source: "DEV Community", ok: true, count: items.length },
      });
    } catch {
      results.push({
        items: [],
        status: {
          source: "DEV Community",
          ok: false,
          count: 0,
          error: "This source is temporarily unavailable.",
        },
      });
    }
    const items = deduplicate(results.flatMap((r) => r.items)).slice(0, 150),
      statuses = results.map((r) => r.status);
    if (!items.length && cache)
      return { ...cache, stale: true, sources: statuses };
    const out = {
      items,
      sources: statuses,
      fetchedAt: new Date().toISOString(),
      stale: false,
    };
    if (items.length) cache = out;
    return out;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}
