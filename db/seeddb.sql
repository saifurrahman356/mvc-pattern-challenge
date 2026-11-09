
-- seeddb.sql
DROP TABLE IF EXISTS blog_entries;

CREATE TABLE blog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  author TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  image TEXT NOT NULL,
  content TEXT NOT NULL
);

INSERT INTO blog_entries (
  slug, title, teaser, author, createdAt, image, content
) VALUES
(
  'black-the-absence-not-the-presence-of-color',
  'Black: The Absence, Not the Presence, of Color',
  'Scientifically, black is not a color but rather the absence of all colors, occurring when an object absorbs nearly all light wavelengths instead of reflecting them.',
  'Peter Parker',
  unixepoch('2025-03-28'),
  'colorful-umbrella.jpg',
  '<p>When you think about the rainbow, you see a vibrant spectrum of hues. But black does not appear in that spectrum the same way red or blue does.</p><p>From a scientific perspective, black is usually the absence of visible light, not a reflected wavelength.</p>'
),
(
  'flowers-nature-s-muse-for-design',
  'Flowers: Nature''s Muse for Design',
  'Flowers inspire design with their color palettes, structure, and balance between repetition and variation.',
  'Peter Parker',
  unixepoch('2025-04-24'),
  'flowers.jpg',
  '<p>Designers borrow from flowers all the time: layered composition, contrasting accents, and natural hierarchy.</p>'
),
(
  'udesign-s-harmony-core-purpose-and-supporting-details',
  'UDesign''s Harmony: Core Purpose and Supporting Details',
  'Strong design starts with one clear core idea, then adds supporting details that reinforce it.',
  'Peter Parker',
  unixepoch('2025-05-31'),
  'sailing.jpg',
  '<p>A useful mental model is major and minor elements. Major elements communicate the main point, minor elements support it without stealing focus.</p>'
);
