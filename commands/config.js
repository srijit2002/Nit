import path from "path";
import { Workspace } from "../lib/Workspace.js";
import { printMessage } from "../utils/printMessage.js";
import { parseConfig } from "../utils/parseConfig.js";

export async function config(folderPath, param, value) {
  try {
    const [section, key] = param.split(".");
    const workspace = new Workspace(path.resolve(folderPath, ".nit"));
    await workspace.ensureFile("config");
    const data = (await workspace.readFile("config")).toString("utf8");
    const config = parseConfig(data);
    if (value) {
      if (!config[section]) {
        config[section] = {};
      }
      config[section][key] = value;
      await workspace.writeFile("config", "");
      for (let section in config) {
        await workspace.appendFile("config", `[${section}]\n`);
        for (let key in config[section]) {
          await workspace.appendFile(
            "config",
            `\t${key} = ${config[section][key]}\n`
          );
        }
      }
      printMessage("Configuration changed successfully.");
    }
    if (config[section]) {
      printMessage(config[section][key]);
    }
  } catch (error) {
    console.log(error);
  }
}
