import sanitizeHtml from "sanitize-html";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "ul",
    "ol",
    "li",
    "img",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "blockquote",
    "code",
    "pre",
    "br",
    "hr",
  ],

  allowedAttributes: {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title", "width", "height"],
  },

  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, sanitizeOptions);
}
