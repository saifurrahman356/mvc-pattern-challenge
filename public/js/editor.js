const editorElement = document.querySelector("#editor");
const contentInput = document.querySelector("#content");

if (editorElement && contentInput) {
  const form = editorElement.closest("form");

  if (form) {
    const quill = new Quill(editorElement, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    if (contentInput.value) {
      quill.clipboard.dangerouslyPasteHTML(contentInput.value);
    }

    form.addEventListener("submit", () => {
      contentInput.value = quill.root.innerHTML;
    });
  }
}
