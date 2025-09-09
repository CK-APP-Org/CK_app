import axios from "axios";
import store from "../store/index";

const FETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes

export default {
  startBackgroundFetch() {
    this.fetchNews();
    setInterval(() => this.fetchNews(), FETCH_INTERVAL);
  },

  async fetchNews() {
    const originalUrls = [
      "https://www.ck.tp.edu.tw/nss/main/feeder/5abf2d62aa93092cee58ceb4/KG5mY0d9355?f=normal&%240=hhyrNQJ0110&vector=private&static=false",
      "https://www.ck.tp.edu.tw/nss/main/feeder/5abf2d62aa93092cee58ceb4/IXZld9j7619?f=normal&%240=kpenVCJ9015&vector=private&static=false",
    ];

    // Convert URLs to use corsproxy.io
    const proxiedUrls = originalUrls.map(
      (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
    );

    try {
      const promises = proxiedUrls.map((url) => axios.get(url));

      const responses = await Promise.all(promises);
      let allNews = [];

      responses.forEach((response) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, "text/xml");
        const items = Array.from(xml.querySelectorAll("item"));
        const newsData = items.map((item) => ({
          title: item.querySelector("title").textContent,
          pubDate: new Date(item.querySelector("pubDate").textContent),
          link: item.querySelector("link").textContent,
        }));
        allNews = allNews.concat(newsData);
      });

      allNews.sort((a, b) => b.pubDate - a.pubDate);

      store.dispatch("setFetchedNews", allNews);
      store.dispatch("setLastFetchTime", new Date());
      console.log("News fetched");
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  },
};
