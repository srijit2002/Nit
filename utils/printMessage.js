import chalk from "chalk";
import { MESSAGE_TYPES } from "./variables.js";

export function printMessage(message, type) {
  if (type === MESSAGE_TYPES.ERROR) {
    console.log(chalk.red(message));
  }
  if (type === MESSAGE_TYPES.SUCCESS) {
    console.log(chalk.green(message));
  }
  if (type === MESSAGE_TYPES.NEUTRAL) {
    console.log(message);
  }
}