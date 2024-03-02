import * as vscode from 'vscode'
import path from 'path'
import fs from 'fs'
import axios from "axios";


/**
 * 错误返回错误索引，正确返回-2，未完成输入且无错误返回-1
 */
export function compareWord(word: string, input: string) {
  for (let i = 0; i < word.length; i++) {
    if (typeof input[i] !== 'undefined') {
      if (word[i] !== input[i]) {
        return i
      }
    } else {
      return -1
    }
  }
  return -2
}

export function getConfig(key: string) {
  return vscode.workspace.getConfiguration('qwerty-learner')[key]
}

export async function getDictFile(url: string) {
  // http://127.0.0.1:8000/allWords/Temp/shanbay/111
  if (url.startsWith("http")) {
    const response = await axios.get(url);
    return response.data;
  } else if (url.startsWith("file:///")) {
    const filePath = new URL(url).pathname;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } else {
    const filePath = path.join(__dirname, '..', 'assets/dicts', url)
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
}
