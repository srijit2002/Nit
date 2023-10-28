export const folderList = ["objects", "refs"];
export const IGNORE_LIST = [
  ".gitignore",
  ".",
  "..",
  "node_modules",
  "nit",
  ".git",
];
export const COMMANDS = {
  INIT: "init",
  COMMIT: "commit",
  ADD: "add",
  STATUS: "status",
  CONFIG: "config",
  DIFF: "diff",
  LOG: "log",
  CHECKOUT: "checkout",
};

export const MESSAGE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  NEUTRAL: "neutral",
  INFORMATION: "information",
};

export const DIFF_TYPES = {
  REMOVED: "remove",
  ADDED: "add",
  UNCHANGED: "unchange",
};
