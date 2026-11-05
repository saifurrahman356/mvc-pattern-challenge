import { Request, Response } from "express";
import {
  createNewPost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  slugify,
  updatePost,
} from "../models/postModel";
import { formatDate } from "./utils";

export function showNewPostFormForAdmin(_req: Request, res: Response) {
  res.render("adminForm.html", {
    action: "/admin/posts",
    submitLabel: "Create Post",
  });
}

export function updatePostForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;
  const { title, author, teaser, content } = req.body;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).send("Invalid slug");
    return;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  const updated = updatePost(slug, {
    title: title.trim(),
    teaser: teaser.trim(),
    author: author.trim(),
    content: content.trim(),
  });

  if (!updated) {
    return res.status(404).send("Post not found");
  }

  res.redirect("/admin");
}

export function deletePostForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).send("Invalid slug");
    return;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  deletePost(slug);

  res.redirect("/admin");
}

export function showEditablePostFormForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).send("Invalid slug");
    return;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  res.render("adminForm.html", {
    action: `/admin/posts/${slug}`,
    submitLabel: "Update Post",
    post: { ...post, createdAt: formatDate(post.createdAt) },
  });
}

export function createNewPostForAdmin(req: Request, res: Response) {
  const { title, author, teaser, content } = req.body;

  if (
    typeof title !== "string" ||
    typeof author !== "string" ||
    typeof teaser !== "string" ||
    typeof content !== "string" ||
    title.trim() === "" ||
    author.trim() === "" ||
    teaser.trim() === "" ||
    content.trim() === ""
  ) {
    res.status(400).send("Invalid input data");
    return;
  }

  const newPost = {
    title: title.trim(),
    image: "default-image.jpg",
    author: author.trim(),
    createdAt: Date.now(),
    teaser: teaser.trim(),
    content: content.trim(),
  };

  createNewPost(newPost);

  res.redirect("/admin");
}

export function showPostsForAdmin(req: Request, res: Response) {
  const authorFilter =
    typeof req.query.author === "string" ? req.query.author.trim() : "";
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const page =
    typeof req.query.page === "string" &&
    Number.isInteger(Number(req.query.page))
      ? Math.max(1, Number(req.query.page))
      : 1;

  const pagedPosts = getAllPosts(authorFilter, sort, page);

  const view = pagedPosts.posts.map((post) => ({
    ...post,
    slug: slugify(post.title),
    createdAt: formatDate(post.createdAt),
  }));

  res.render("admin.html", {
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
