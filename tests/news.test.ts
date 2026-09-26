import test from "node:test";
import assert from "node:assert/strict";
import { parseRss, deduplicate, safeLink } from "../lib/news";

const feed = `<rss><channel><item><title><![CDATA[Online AI hackathon comes to Bengaluru - Example News]]></title><link>https://example.com/article</link><pubDate>Fri, 25 Sep 2026 12:00:00 GMT</pubDate><source url="https://example.com">Example News</source></item><item><title>Other story</title><link>https://example.com/other</link></item></channel></rss>`;

test("RSS parsing preserves attribution and distinguishes publication from event dates", () => {
  const items = parseRss(feed, "Europe");
  assert.equal(items.length, 1);
  const a = items[0];
  assert.equal(a.title, "Online AI hackathon comes to Bengaluru");
  assert.equal(a.source, "Example News");
  assert.equal(a.region, "India");
  assert.equal(a.regionBasis, "title");
  assert.equal(a.mode, "Online");
  assert.deepEqual(a.tags, ["AI / ML"]);
  assert.equal(a.deadline, null);
  assert.equal(a.publishedAt, "2026-09-25T12:00:00.000Z");
});

test("unsafe URL schemes and entity declarations are rejected", () => {
  assert.equal(safeLink("javascript:alert(1)"), "");
  assert.equal(safeLink("data:text/html,test"), "");
  assert.equal(safeLink("/relative"), "");
  assert.throws(() =>
    parseRss(
      '<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>',
      "Worldwide",
    ),
  );
  assert.throws(() => parseRss("x".repeat(2500001), "Worldwide"));
});

test("duplicate coverage collapses and edition-based regions stay labelled", () => {
  const [a] = parseRss(feed.replace(" comes to Bengaluru", ""), "Europe");
  assert.equal(a.regionBasis, "edition");
  assert.equal(a.region, "Europe");
  assert.equal(
    deduplicate([a, { ...a, id: "other", title: a.title.toUpperCase() }])
      .length,
    1,
  );
});
