// Reads the code samples the docs pages and the stories' doc comments show,
// for the tests that check them (`toast.dist.test.ts`, `radio-docs.test.ts`).
// It's a `.ts` file, so the build, which takes `src/components/**/*.tsx` as
// entries, leaves it out.

export type Block = { info: string; code: string; line: number };

// The fenced code blocks in `text`: each one's info string, its code as a
// reader copies it, with the fence's indent removed from each line as
// Markdown removes it, and the line its opening fence is on
export function codeBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  for (let start = 0; start < lines.length; start++) {
    const open = /^( *)```(.*)$/.exec(lines[start]!);
    if (!open) continue;
    const indent = new RegExp(`^ {0,${open[1]!.length}}`);
    let end = start + 1;
    while (end < lines.length && !/^ *```\s*$/.test(lines[end]!)) end++;
    if (end === lines.length)
      throw new Error(`The fence on line ${start + 1} isn't closed`);
    blocks.push({
      info: open[2]!.trim(),
      code: lines
        .slice(start + 1, end)
        .map((line) => line.replace(indent, ""))
        .join("\n"),
      line: start + 1,
    });
    start = end;
  }
  return blocks;
}

// A story file's doc comment, the JSDoc on `meta`, as written in the file
export function metaComment(storyText: string): string {
  const end = storyText.indexOf("\nconst meta = ");
  const start = end === -1 ? -1 : storyText.lastIndexOf("/**", end);
  if (start === -1) throw new Error("The story has no doc comment on `meta`");
  return storyText.slice(start, end).trim();
}

// What a doc comment says: its text without the `/**` and `*/` around it, and
// with each line's leading ` * ` stripped
export const commentText = (comment: string) =>
  comment
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, ""))
    .join("\n");
