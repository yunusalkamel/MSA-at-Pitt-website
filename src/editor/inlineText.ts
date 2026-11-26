import type { Run } from "./content";

// Put the caret inside the real page. Restore React's nodes before committing.
export function editText(
  target: HTMLElement,
  previous: Run[] | undefined,
  finish: (runs: Run[]) => void,
) {
  const original = Array.from(target.childNodes);
  const editor = document.createElement("span");
  editor.contentEditable = "true";
  editor.style.whiteSpace = "pre-wrap";
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-label", "Edit text");
  for (const run of previous ?? [{ text: target.textContent ?? "" }]) {
    let node: Node = document.createTextNode(run.text);
    for (const tag of [
      run.bold ? "b" : "",
      run.underline ? "u" : "",
      run.italic ? "i" : "",
      run.size ? "font" : "",
    ]) {
      if (!tag) continue;
      const element = document.createElement(tag);
      if (tag === "font")
        element.setAttribute(
          "size",
          { small: "2", normal: "3", large: "5" }[run.size!],
        );
      element.append(node);
      node = element;
    }
    editor.append(node);
  }
  editor.addEventListener("paste", (e) => {
    e.preventDefault();
    document.execCommand(
      "insertText",
      false,
      e.clipboardData?.getData("text/plain") ?? "",
    );
  });
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertText", false, "\n");
    }
    if (e.key === "Escape") {
      e.preventDefault();
      editor.blur();
    }
  });
  target.replaceChildren(editor);
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    const runs: Run[] = [];
    function walk(node: Node, marks: Omit<Run, "text">) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) runs.push({ ...marks, text: node.textContent });
        return;
      }
      if (!(node instanceof HTMLElement)) return;
      const style = { ...marks };
      if (node.matches("strong,b") || node.style.fontWeight === "bold")
        style.bold = true;
      if (node.matches("i,em") || node.style.fontStyle === "italic")
        style.italic = true;
      if (node.matches("u") || node.style.textDecoration.includes("underline")) style.underline = true;
      if (node.tagName === "FONT")
        style.size = ({ "2": "small", "3": "normal", "5": "large" } as const)[
          node.getAttribute("size") as "2"
        ];
      if (node.tagName === "BR") runs.push({ ...marks, text: "\n" });
      else node.childNodes.forEach((child) => walk(child, style));
    }
    walk(editor, {});
    target.replaceChildren(...original);
    finish(runs);
  };
  editor.addEventListener("blur", commit, { once: true });
  return commit;
}
