import { createDirectory } from "../utils/createDirectory.js";
import { folderList } from "../utils/variables.js";
import path from "path";

export async function init(folderPath) {
  const repoFolderPath = path.resolve(folderPath, ".nit");
  const { success: rootFolderSuccess, rootFolderMessage } =
    await createDirectory(repoFolderPath);
  if (rootFolderSuccess) {
    folderList.forEach(async (folder) => {
      const { success, message } = await createDirectory(
        path.resolve(repoFolderPath, folder)
      );
      if (!success) {
        console.log(message);
      }
    });
  } else {
    console.log("Root folder creatiion failed -> -> ", rootFolderMessage);
  }
}
