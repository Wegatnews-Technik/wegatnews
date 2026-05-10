import { Feed } from "feed";
import { writeFileSync } from "fs";
import { getAllPosts } from "../lib/posts.js";

/*Preview
  Autor
  Bild
  (Datum(falsches Format))*/

const SITE_URL = "https://wegatnews.de";
const SITE_TITLE = "WE G(A)T NEWS - Die Schülerzeitung am GAT";
const SITE_DESCRIPTION =
  "Willkommen auf wegatnews, der digitalen Schülerzeitung am Altenforst.";

const posts = getAllPosts();

const feed = new Feed({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  id: SITE_URL,
  link: SITE_URL,
  language: "de",
  feedLinks: {
    rss2: `${SITE_URL}/feed.xml`,
  },
});

posts.forEach((post) => {
  feed.addItem({
    title: post.title,
    id: `${post.slug}`,
    link: `${SITE_URL}/blog/${post.slug}/`,
    description: post.preview,
    image: `${SITE_URL}${post.image}`,
    author: {
      name: post.author,
      email: "wegatnews@outlook.de",
      link: "https://wegatnews.de/",
    },
    date: new Date(post.date),
  });
});

writeFileSync("public/feed.xml", feed.rss2());
console.log("RSS feed generated at public/feed.xml");
