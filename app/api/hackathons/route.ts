import { fetchHackathons } from "@/lib/news";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET() {
  try {
    const data = await fetchHackathons();
    return Response.json(data, {
      status: data.items.length ? 200 : 503,
      headers: {
        "Cache-Control": data.items.length
          ? "public, s-maxage=900, stale-while-revalidate=1800"
          : "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      {
        error: "News sources could not be reached. Please try again later.",
        items: [],
        sources: [],
        stale: false,
        fetchedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
