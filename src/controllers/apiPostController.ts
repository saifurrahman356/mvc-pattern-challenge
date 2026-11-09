import { Request, Response } from "express";
import {
  formatDate,
  getTrimmedString,
  isValidPostInput,
  isValidSlug,
  isValidUpdateInput,
  renderDuplicateSlug,
  renderInvalidSlug,
  renderPostNotFound,
} from "./utils";
import { sanitizeContent } from "./sanitizeContent";
import { slugify } from "../models/utils";
import {
  createBlogEntry,
  getPostBySlug,
  updatePost as updatePostDB,
  deletePost as deletePostDB,
  getAllPosts,
} from "../models/postModelDB";

export async function showAllPosts(req: Request, res: Response) {
  const authorFilter =
    typeof req.query.author === "string" ? req.query.author.trim() : "";

  const sort = req.query.sort === "oldest" ? "oldest" : "newest";

  const requestedPage =
    typeof req.query.page === "string" &&
    Number.isInteger(Number(req.query.page))
      ? Math.max(1, Number(req.query.page))
      : 1;

  const pagedBlogEntries = await getAllPosts(authorFilter, sort, requestedPage);

  const posts = pagedBlogEntries.posts.map((post) => ({
    ...post,
    createdAt: formatDate(post.createdAt),
  }));

  return res.json({
    posts,
    totalPages: pagedBlogEntries.totalPages,
    currentPage: requestedPage,
  });
}

export async function createPost(req: Request, res: Response) {
  if (req.body === undefined) {
    return res.status(400).send("Request body is missing");
  }
  const title = getTrimmedString(req.body.title);
  const author = getTrimmedString(req.body.author);
  const teaser = getTrimmedString(req.body.teaser);
  const content = getTrimmedString(req.body.content);

  if (!isValidPostInput(title, author, teaser, content)) {
    return res.status(400).send("Invalid input data");
  }

  const newPost = {
    title: title!,
    slug: slugify(title!),
    image: "default-image.jpg",
    author: author!,
    createdAt: Math.floor(Date.now() / 1000),
    teaser: teaser!,
    content: sanitizeContent(content!),
  };

  if (!newPost.slug) {
    return res.status(400).send("Invalid post title");
  }

  const existingPost = await getPostBySlug(newPost.slug);

  if (existingPost) {
    return renderDuplicateSlug(res, "/admin/posts", "Create Post", newPost);
  }

  try {
    const createdPostSlug = await createBlogEntry(newPost);
    return res.status(201).json({ slug: createdPostSlug });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create blog entry.",
    });
  }
}

export async function updatePost(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return res.status(400).json({
      error: "Invalid slug",
    });
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return res.status(404).json({
      error: `No blog post found with slug "${slug}".`,
    });
  }

  const title = getTrimmedString(req.body.title);
  const author = getTrimmedString(req.body.author);
  const teaser = getTrimmedString(req.body.teaser);
  const content = getTrimmedString(req.body.content);
  const image = getTrimmedString(req.body.image);

  const updatedPostData = {
    ...post,
    title: title ?? post.title,
    author: author ?? post.author,
    teaser: teaser ?? post.teaser,
    content: sanitizeContent(content ?? post.content),
    image: image ?? post.image,
    slug: title ? slugify(title) : post.slug,
  };

  if (
    !isValidUpdateInput(
      updatedPostData.title,
      updatedPostData.author,
      updatedPostData.teaser,
      updatedPostData.content,
    )
  ) {
    return res.status(400).json({
      error: "Invalid input data",
    });
  }

  if (!updatedPostData.slug) {
    return res.status(400).json({
      error: "Invalid post title",
    });
  }

  if (slug !== updatedPostData.slug) {
    const existingPost = await getPostBySlug(updatedPostData.slug);

    if (existingPost) {
      return res.status(409).json({
        error: `A post with this slug ${updatedPostData.slug} already exists.`,
      });
    }
  }

  const updated = await updatePostDB(slug, updatedPostData);

  if (!updated) {
    return res.status(404).json({
      error: `No blog post found with slug "${slug}".`,
    });
  }

  return res.status(200).json({
    message: "Post updated successfully",
    slug: updatedPostData.slug,
  });
}

export const deletePost = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return renderInvalidSlug(res);
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return res.status(404).json({
      error: `No blog post found with slug "${slug}".`,
    });
  }

  const deleted = await deletePostDB(slug);

  if (!deleted) {
    return renderPostNotFound(res, slug);
  }
  return res.status(204).send();
};
