import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "posts");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPostFileNames() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"));
}

function readPostFile(fileName) {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    fileName,
    data,
    content,
  };
}

function resolvePostSlug(fileName, data) {
  if (data.slug) return data.slug;
  if (data.title) return slugify(data.title);
  return fileName.replace(/\.md$/, "");
}

export function getAllPostSlugs() {
  return getPostFileNames().map((fileName) => {
    const { data } = readPostFile(fileName);
    return resolvePostSlug(fileName, data);
  });
}

export function getAllPosts() {
  return getPostFileNames()
    .map((fileName) => {
      const { data } = readPostFile(fileName);

      return {
        slug: resolvePostSlug(fileName, data),
        ...data,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPostBySlug(slug) {
  const matchingPost = getPostFileNames()
    .map((fileName) => {
      const parsedPost = readPostFile(fileName);

      return {
        ...parsedPost,
        slug: resolvePostSlug(fileName, parsedPost.data),
      };
    })
    .find((post) => post.slug === slug);

  if (!matchingPost) {
    return null;
  }

  const processedContent = await remark()
    .use(html)
    .process(matchingPost.content);

  return {
    slug: matchingPost.slug,
    contentHtml: processedContent.toString(),
    ...matchingPost.data,
  };
}

export function getPostsByTag(tag) {
  const posts = getAllPosts();
  var tagged_posts;
  for (var i = 0; i < posts.length; i++) {
    console.log(posts[i].title);
    console.log(posts[i].tags);
    if (posts[i].tags.includes(tag, 0)) {
      tagged_posts += posts[i];
    }
  }
  return tagged_posts;
}
