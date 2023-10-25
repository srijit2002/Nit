import { ensureDir } from "fs-extra";

export async function createDirectory(directory) {
  try {
    await ensureDir(directory);
    return {
      success: true,
      message: "Directory has been created successfully",
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
}
