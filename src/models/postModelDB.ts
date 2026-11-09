import { getDB } from "../db/database";
import { PAGE_SIZE, PagedBlogEntries, BlogEntry } from "../types";

export async function getPostBySlug(
  slug: string,
): Promise<BlogEntry | undefined> {
  const db = getDB();
  console.log("slug:", slug);
  return db.get<BlogEntry>(`SELECT * FROM blog_entries WHERE slug = ?`, [slug]);
}

export async function getAllPosts(
  authorFilter: string,
  sortBy: string,
  page: number,
): Promise<PagedBlogEntries> {
  const offset = (page - 1) * PAGE_SIZE;

  const db = getDB();

  // 1. Filter by author and count matching posts
  const countResult = await db.get<{ total: number }>(
    `SELECT COUNT(*) AS total
   FROM blog_entries
   WHERE (? IS NULL OR LOWER(author) LIKE LOWER(?))`,
    [authorFilter || null, `%${authorFilter}%`],
  );

  const totalPosts = countResult?.total ?? 0;

  // 2. Calculate pagination
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const currentPage = Math.max(1, Math.min(page, totalPages));

  // 3. Sort and retrieve only the requested page
  const orderBy = sortBy === "oldest" ? "ASC" : "DESC";

  const posts = await db.all(
    `SELECT * FROM blog_entries
   WHERE (? IS NULL OR LOWER(author) LIKE LOWER(?))
   ORDER BY createdAt ${orderBy}
   LIMIT ? OFFSET ?`,
    [authorFilter || null, `%${authorFilter}%`, PAGE_SIZE, offset],
  );

  return {
    posts,
    currentPage,
    totalPages,
  };
}

export async function createBlogEntry(
  entry: Omit<BlogEntry, "id">,
): Promise<string> {
  const db = getDB();
  await db.run(
    `INSERT INTO blog_entries (title, slug, image, author, createdAt, teaser, content)
     VALUES (@title,@slug, @image, @author, @createdAt, @teaser, @content)`,
    {
      "@title": entry.title,
      "@slug": entry.slug,
      "@image": entry.image,
      "@author": entry.author,
      "@createdAt": entry.createdAt,
      "@teaser": entry.teaser,
      "@content": entry.content,
    },
  );
  return entry.slug!;
}

export async function updatePost(
  slug: string,
  updatedPost: Partial<BlogEntry>,
): Promise<boolean> {
  const db = getDB();
  const result = await db.run(
    `UPDATE blog_entries
     SET title = COALESCE(@title, title),
         slug = COALESCE(@slug, slug),
         image = COALESCE(@image, image),
         author = COALESCE(@author, author),
         createdAt = COALESCE(@createdAt, createdAt),
         teaser = COALESCE(@teaser, teaser),
         content = COALESCE(@content, content)
     WHERE slug = @slugParam`,
    {
      "@title": updatedPost.title,
      "@slug": updatedPost.slug,
      "@image": updatedPost.image,
      "@author": updatedPost.author,
      "@createdAt": updatedPost.createdAt,
      "@teaser": updatedPost.teaser,
      "@content": updatedPost.content,
      "@slugParam": slug,
    },
  );

  return result.changes! > 0;
}

export async function deletePost(slug: string): Promise<boolean> {
  const db = getDB();
  const result = db.run(`DELETE FROM blog_entries WHERE slug = ?`, [slug]);
  return (await result).changes! > 0;
}
