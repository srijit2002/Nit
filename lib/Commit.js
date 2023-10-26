export class Commit {
  constructor(parent, tree, author, message) {
    this.tree = tree;
    this.author = author;
    this.message = message;
    this.type = "commit";
    this.oid = null;
    this.parent = parent;
  }
  toString() {
    const lines = [
      `tree ${this.tree}`,
      `author ${this.author}`,
      `committer ${this.author}`,
      `parent ( ${this.parent || "root-commit"} )`,
      this.message,
    ];
    return lines.join("\n");
  }
  static parse(content) {
    const regex =
      /tree\s+(.*?)\nauthor\s+(.*?)\ncommitter\s+(.*?)\nparent\s+\(\s*(.*?)\s*\)\n([\s\S]*)/s;
    const matches = content.match(regex);

    if (matches) {
      const tree = matches[1];
      const author = matches[2];
      const parent = matches[4];
      const commitMessage = matches[5];
      return new Commit(parent, tree, author, commitMessage);
    }
  }
}
