import { PAGE_SIZE, BlogEntry, PagedBlogEntries } from "../types";
import { loadPosts, slugify } from "./utils";

export function getPostBySlug(slug: string): BlogEntry | undefined {
  const posts = loadPosts();
  return posts.find((post) => slugify(post.title) === slug);
}

export async function getAllPosts(
  authorFilter: string,
  sortBy: string,
  page: number,
): Promise<PagedBlogEntries> {
  const posts = loadPosts();

  const filteredPosts = authorFilter
    ? posts.filter((post) =>
        post.author.toLowerCase().includes(authorFilter.toLowerCase()),
      )
    : posts;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "oldest") {
      return a.createdAt - b.createdAt;
    }
    return b.createdAt - a.createdAt;
  });

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slicedPosts = sortedPosts.slice(start, start + PAGE_SIZE);

  return {
    posts: slicedPosts,
    currentPage,
    totalPages,
  };
}

export function createNewPost(newPost: BlogEntry): void {
  const posts = loadPosts();
  newPost.image = "flowers.jpg"; // Assign a default image
  posts.push(newPost);
}

export function updatePost(
  slug: string,
  updatedPost: Partial<BlogEntry>,
): boolean {
  const posts = loadPosts();
  const index = posts.findIndex((post) => slugify(post.title) === slug);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updatedPost };
    return true;
  }
  return false;
}

export function deletePost(slug: string): boolean {
  const posts = loadPosts();
  const index = posts.findIndex((post) => slugify(post.title) === slug);
  if (index !== -1) {
    posts.splice(index, 1);
    return true;
  }
  return false;
}
