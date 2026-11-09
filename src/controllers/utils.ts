import { Response } from "express";

export function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export function renderInvalidSlug(res: Response) {
  return res.status(400).send("Invalid slug");
}

export function renderPostNotFound(res: Response, slug: string) {
  return res.status(404).render("errors/error.html", {
    title: "Post Not Found",
    error: `No blog post found with slug "${slug}".`,
    backUrl: "/admin",
    backLabel: "Back to Posts",
  });
}

export function renderDuplicateSlug(
  res: Response,
  action: string,
  submitLabel: string,
  post: object,
) {
  return res.status(409).render("admin/adminForm.html", {
    action,
    submitLabel,
    post,
    error: "A post with this slug already exists. Please choose another title.",
  });
}

export function getTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

export function isValidPostInput(
  title: unknown,
  author: unknown,
  teaser: unknown,
  content: unknown,
): boolean {
  return [title, author, teaser, content].every(
    (value) => typeof value === "string" && value.trim() !== "",
  );
}

export function isValidUpdateInput(
  title: unknown,
  author: unknown,
  teaser: unknown,
  content: unknown,
): boolean {
  return [title, author, teaser, content].every(
    (value) =>
      value === undefined || (typeof value === "string" && value.trim() !== ""),
  );
}
