import { VoiceType } from './../../typings/index'
import { getConfig } from '../../utils'
import axios from 'axios'
interface NativeModule {
  playerPlay(voiceUrl: string, callback: () => void): void
}

let NATIVE: any = null

try {
  NATIVE = require(`node-loader!./rodio/mac-arm.node`) as NativeModule
} catch (error) {
  NATIVE = null
}

if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/win32.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/mac-intel.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  try {
    NATIVE = require(`node-loader!./rodio/linux-x64.node`) as NativeModule
  } catch (error) {
    NATIVE = null
  }
}
if (!(NATIVE && NATIVE.playerPlay)) {
  NATIVE = null
}

type PhoneCallback = (ukphone: string|undefined, usphone: string|undefined) => void

function getMp3ByDictCn(word: string, callback: PhoneCallback) {
  axios.get(`https://dict.cn/search?q=${word}`).then((res) => {
    if (res.status !== 200) {
      callback(undefined, undefined)
      return
    }
    const regex = /<i class="sound fsound" naudio="([^"]+)"/g;  // 女声
    // const regex = /<i class="sound" naudio="([^"]+)"/g;  // 男声
  
    const matches = [];
    let match;
  
    while ((match = regex.exec(res.data)) !== null) {
        matches.push(match[1]);
    }
    if (matches.length >= 2) {
        callback('https://audio.dict.cn/' + matches[0], 'https://audio.dict.cn/' + matches[1]) // 英式在第一二个位置，美式在第三四个位置
    } else {
        callback(undefined, undefined)
    }
  }).catch((err) => {
    console.error(err)
    callback(undefined, undefined)
  })
}

function getMp3ByYoudao(word: string, callback: PhoneCallback) {
  const ukphone = `https://dict.youdao.com/dictvoice?audio=${word}&type=1`
  const usphone = `https://dict.youdao.com/dictvoice?audio=${word}&type=2`
  callback(ukphone, usphone)
}

// 金山词霸
function getMp3ByIciba(word: string, callback: PhoneCallback) {
  const url = `https://www.iciba.com/word?w=${word}`
  axios.get(url).then((res) => {
    const regex = /"ph_en_mp3_bk":"(.*?)","ph_am_mp3_bk":"(.*?)"/;
    const match = res.data.match(regex);
    if (match) {
      callback(match[2], match[1])
    } else {
        callback(undefined, undefined)
    }
  }).catch((err) => {
    console.error(err)
    callback(undefined, undefined)
  })
}

function getMp3ByOxford(word: string, callback: PhoneCallback) {
  const url = `https://www.oxfordlearnersdictionaries.com/definition/english/${word}`
  const headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
  axios.get(url, { headers }).then((res) => {
    const regex = /data-src-mp3="(.*?gb.*?mp3)"[\s\S]*?data-src-mp3="(.*?us.*?.mp3)"/;
    const match = res.data.match(regex);
    if (match) {
      callback(match[1], match[2])
    } else {
      callback(undefined, undefined)
    }
  }).catch((err) => {
    console.error(err)
    callback(undefined, undefined)
  })
}

const voiceSourceFuncMap: Record<string, (word: string, callback: PhoneCallback) => void> = {
  "金山词霸": getMp3ByIciba,
  "牛津词典": getMp3ByOxford,
  "有道词典": getMp3ByYoudao,
  "海词词典": getMp3ByDictCn,
}


export const voicePlayer = (word: string, callback: () => void) => {
  const voiceSource = getConfig('voiceSource')
  const func = voiceSourceFuncMap[voiceSource]
  func(word, (ukphone, usphone)=>{
    if (NATIVE) {
      const url = getConfig('voiceType') === 'uk' ? ukphone : usphone;
      NATIVE.playerPlay(url, callback)
    } else {
      callback()
    }
  })
}