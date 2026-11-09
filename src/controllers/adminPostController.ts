import { Request, Response } from "express";
import { sanitizeContent } from "./sanitizeContent";
import {
  createBlogEntry,
  deletePost,
  getAllPosts,
  getPostBySlug,
  updatePost,
} from "../models/postModelDB";
import { slugify } from "../models/utils";
import {
  formatDate,
  getTrimmedString,
  isValidPostInput,
  isValidSlug,
  renderInvalidSlug,
  renderPostNotFound,
  renderDuplicateSlug,
} from "./utils";

// --------------------
// Show create form
// --------------------

export function showNewPostFormForAdmin(_req: Request, res: Response) {
  res.render("admin/adminForm.html", {
    action: "/admin/posts",
    submitLabel: "Create Post",
  });
}

// --------------------
// Create post
// --------------------

export async function createNewPostForAdmin(req: Request, res: Response) {
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
    await createBlogEntry(newPost);
    return res.redirect("/admin");
  } catch (error) {
    console.error("Failed to create post:", error);

    return res.status(500).render("admin/adminForm.html", {
      action: "/admin/posts",
      submitLabel: "Create Post",
      post: newPost,
      error: "Failed to create blog entry.",
    });
  }
}

// --------------------
// Show edit form
// --------------------

export async function showEditablePostFormForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return renderInvalidSlug(res);
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return renderPostNotFound(res, slug);
  }

  return res.render("admin/adminForm.html", {
    action: `/admin/posts/${slug}`,
    submitLabel: "Update Post",
    post: {
      ...post,
      createdAt: formatDate(post.createdAt),
    },
  });
}

// --------------------
// Update post
// --------------------

export async function updatePostForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return renderInvalidSlug(res);
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return renderPostNotFound(res, slug);
  }

  const title = getTrimmedString(req.body.title);
  const author = getTrimmedString(req.body.author);
  const teaser = getTrimmedString(req.body.teaser);
  const content = getTrimmedString(req.body.content);
  const image = getTrimmedString(req.body.image);

  if (!isValidPostInput(title, author, teaser, content)) {
    return res.status(400).send("Invalid input data");
  }

  const updatedPostData = {
    slug: slugify(title!),
    title: title!,
    image: image || post.image,
    teaser: teaser!,
    author: author!,
    content: sanitizeContent(content!),
  };

  if (!updatedPostData.slug) {
    return res.status(400).send("Invalid post title");
  }

  if (slug !== updatedPostData.slug) {
    const existingPost = await getPostBySlug(updatedPostData.slug);

    if (existingPost) {
      return renderDuplicateSlug(
        res,
        `/admin/posts/${slug}`,
        "Update Post",
        updatedPostData,
      );
    }
  }

  const updated = await updatePost(slug, updatedPostData);

  if (!updated) {
    return renderPostNotFound(res, slug);
  }

  return res.redirect("/admin");
}

// --------------------
// Delete post
// --------------------

export async function deletePostForAdmin(
  req: Request<{ slug: string }>,
  res: Response,
) {
  const { slug } = req.params;

  if (!isValidSlug(slug)) {
    return renderInvalidSlug(res);
  }

  const post = await getPostBySlug(slug);

  if (!post) {
    return renderPostNotFound(res, slug);
  }

  const deleted = await deletePost(slug);

  if (!deleted) {
    return renderPostNotFound(res, slug);
  }

  return res.redirect("/admin");
}

// --------------------
// Show admin posts
// --------------------

export async function showPostsForAdmin(req: Request, res: Response) {
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

  return res.render("admin/admin.html", {
    posts,
    controls: {
      author: authorFilter,
      sort,
      page: pagedBlogEntries.currentPage,
      totalPages: pagedBlogEntries.totalPages,
      hasPrev: pagedBlogEntries.currentPage > 1,
      hasNext: pagedBlogEntries.currentPage < pagedBlogEntries.totalPages,
    },
  });
}
