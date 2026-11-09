export const PAGE_SIZE = 2;

export interface BlogEntry {
  id: number;
  title: string;
  slug: string;
  image: string;
  author: string;
  createdAt: number;
  teaser: string;
  content: string;
}

export type NewBlogEntry = Omit<BlogEntry, "id">;

export interface PagedBlogEntries {
  posts: BlogEntry[];
  currentPage: number;
  totalPages: number;
}

export const seedPosts: NewBlogEntry[] = [
  {
    title: "Black: The Absence, Not the Presence, of Color",
    slug: "black-the-absence-not-the-presence-of-color",
    image: "colorful-umbrella.jpg",
    author: "Peter Parker",
    createdAt: 1743120000,
    teaser:
      "Scientifically, black is not a color but rather the absence of all colors, occurring when an object absorbs nearly all light wavelengths instead of reflecting them.",
    content:
      "<p>When you think about the rainbow, you see a vibrant spectrum of hues. But black does not appear in that spectrum the same way red or blue does.</p><p>From a scientific perspective, black is usually the absence of visible light, not a reflected wavelength.</p>",
  },
  {
    title: "Flowers: Nature's Muse for Design",
    slug: "flowers-natures-muse-for-design",
    image: "flowers.jpg",
    author: "Peter Parker",
    createdAt: 1745452800,
    teaser:
      "Flowers inspire design with their color palettes, structure, and balance between repetition and variation.",
    content:
      "<p>Designers borrow from flowers all the time: layered composition, contrasting accents, and natural hierarchy.</p>",
  },
  {
    title: "UDesign's Harmony: Core Purpose and Supporting Details",
    slug: "udesigns-harmony-core-purpose-and-supporting-details",
    image: "sailing.jpg",
    author: "Peter Parker",
    createdAt: 1748736000,
    teaser:
      "Strong design starts with one clear core idea, then adds supporting details that reinforce it.",
    content:
      "<p>A useful mental model is major and minor elements. Major elements communicate the main point, minor elements support it without stealing focus.</p>",
  },
];
