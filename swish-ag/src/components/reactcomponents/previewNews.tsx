import { useEffect, useState } from "react";
import espnFallback from "../../assets/espn.webp";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

const SwishNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const FEED = "https://www.espn.com/espn/rss/nba/news";
        const proxies = [
          `https://corsproxy.io/?url=${encodeURIComponent(FEED)}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(FEED)}`,
        ];

        let xml = "";
        for (const proxyUrl of proxies) {
          try {
            const res = await fetch(proxyUrl);
            if (!res.ok) continue;
            xml = await res.text();
            if (xml.includes("<rss") || xml.includes("<feed")) break;
          } catch {
            continue;
          }
        }
        if (!xml) throw new Error("All proxies failed");

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
          .map((match) => {
            const item = match[1];
            const title =
              item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? "";
            const rawLink = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s)?.[1]?.trim() ?? "";
            const link = rawLink.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
            const pubDate =
              item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
            const description =
              item
                .match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
                ?.replace(/<[^>]+>/g, "")
                .trim() ?? "";
            return { title, link, pubDate, description, image: undefined as string | undefined };
          })
          .filter((i) => i.title)
          .slice(0, 8);

        setNews(items);
        setLoading(false);

        const withImages = [...items];
        await Promise.all(
          items.slice(0, 4).map(async (item, i) => {
            if (!item.link) return;
            try {
              const mlRes = await fetch(
                `https://api.microlink.io?url=${encodeURIComponent(item.link)}`
              );
              const mlData = await mlRes.json();
              const img = mlData?.data?.image?.url ?? mlData?.data?.logo?.url ?? undefined;
              if (img) withImages[i] = { ...withImages[i], image: img };
            } catch {
              // silently skip
            }
          })
        );
        setNews([...withImages]);
      } catch {
        setError(true);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  return (
    <section className="news-section" id="news">
      <div className="news-container">
        <div className="news-header">
          <h2 className="news-label">
            Latest <span>News</span>
          </h2>
          <div className="news-source">Latest Update</div>
        </div>

        {loading && (
          <div className="news-skeleton">
            <div className="skeleton-main">
              <div className="skeleton-bar" style={{ width: "60px", height: "20px" }} />
              <div className="skeleton-bar" style={{ width: "90%", height: "32px" }} />
              <div className="skeleton-bar" style={{ width: "75%", height: "32px" }} />
              <div className="skeleton-bar" style={{ width: "100%", height: "14px" }} />
              <div className="skeleton-bar" style={{ width: "80%", height: "14px" }} />
              <div className="skeleton-bar" style={{ width: "90%", height: "14px" }} />
            </div>
            <div className="skeleton-side">
              {[...Array(6)].map((_, i) => (
                <div className="skeleton-row" key={i}>
                  <div className="skeleton-bar" style={{ width: "100%", height: "14px", animationDelay: `${i * 0.1}s` }} />
                  <div className="skeleton-bar" style={{ width: "60%", height: "14px", animationDelay: `${i * 0.1 + 0.05}s` }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="news-error">
            Could not load news. Check your connection or try again later.
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="news-grid">
            {/* Featured */}
            <a
              className="news-featured"
              href={news[active]?.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
              backgroundImage: `linear-gradient(to top, rgba(10,10,15,0.97) 40%, rgba(10,10,15,0.5) 100%), url(${
                news[active]?.image ?? espnFallback.src
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            >
              <span className="featured-tag">Top Story</span>
              <p className="featured-date">{formatDate(news[active]?.pubDate)}</p>
              <h3 className="featured-title">{news[active]?.title}</h3>
              <p className="featured-desc">{news[active]?.description}</p>
              <span className="featured-link">
                Read on ESPN
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            {/* List */}
            <div className="news-list">
              {news.map((item, i) => (
                <a
                  key={i}
                  className={`news-item${active === i ? " active" : ""}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="item-title">{item.title}</span>
                  <span className="item-date">{formatDate(item.pubDate)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
       <div className="espn"> 
          <p>
             All information is sourced from ESPN <span className="text-[#db6163]">©</span>
          </p>
        </div>
    </section>
  );
};

export default SwishNews;