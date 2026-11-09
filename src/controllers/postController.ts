import { Request, Response } from "express";

import { formatDate } from "./utils";
import { slugify } from "../models/utils";
import { getAllPosts, getPostBySlug } from "../models/postModelDB";

export async function showPosts(req: Request, res: Response) {
  const authorFilter =
    typeof req.query.author === "string" ? req.query.author.trim() : "";
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const page =
    typeof req.query.page === "string" &&
    Number.isInteger(Number(req.query.page))
      ? Math.max(1, Number(req.query.page))
      : 1;

  const pagedPosts = await getAllPosts(authorFilter, sort, page);

  const view = pagedPosts.posts.map((post) => ({
    ...post,
    slug: slugify(post.title),
    createdAt: formatDate(post.createdAt),
  }));

  res.render("index.html", {
    posts: view,
    controls: {
      author: authorFilter,
      sort,
      page: pagedPosts.currentPage,
      totalPages: pagedPosts.totalPages,
      hasPrev: pagedPosts.currentPage > 1,
      hasNext: pagedPosts.currentPage < pagedPosts.totalPages,
    },
  });
}

export async function showPost(req: Request<{ slug: string }>, res: Response) {
  const slug = req.params.slug;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).send("Invalid slug");
    return;
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  res.render("admin/post.html", {
    post: { ...post, createdAt: formatDate(post.createdAt) },
  });
}
