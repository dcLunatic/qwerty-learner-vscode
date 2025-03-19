// const wavPlayer = require('node-wav-player')
import path from 'path'
import { getConfig } from './utils'
const fs = require('fs');
const wav = require('wav');
const Speaker = require('speaker');

type SoundType = 'click' | 'wrong' | 'success'

// export const soundPlayer = (type: SoundType) => {
//   if (getConfig('keySound')) {
//     let soundPath
//     switch (type) {
//       case 'click':
//         soundPath = path.join(__dirname, '..', 'assets/sounds', 'click.wav')
//         break
//       case 'wrong':
//         soundPath = path.join(__dirname, '..', 'assets/sounds', 'beep.wav')
//         break
//       case 'success':
//         soundPath = path.join(__dirname, '..', 'assets/sounds', 'hint.wav')
//         break
//       default:
//         break
//     }
//     // wavPlayer.stop()
//     wavPlayer.play({ path: soundPath })
//   }
// }

interface WavFormat {
  audioFormat: number;
  endianness: string;
  channels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitDepth: number;
  signed: boolean;
}

export const soundPlayer = (type: SoundType) => {
  if (getConfig('keySound')) {
    let soundPath
    
    switch (type) {
      case 'click':
        soundPath = path.join(__dirname, '..', 'assets/sounds', 'click.wav')
        break
      case 'wrong':
        soundPath = path.join(__dirname, '..', 'assets/sounds', 'beep.wav')
        break
      case 'success':
        soundPath = path.join(__dirname, '..', 'assets/sounds', 'hint.wav')
        break
      default:
        break
    }
    const file = fs.createReadStream(soundPath);
    const reader = new wav.Reader();
    reader.on('format', (format: WavFormat) => {
      const speaker = new Speaker(format);
      speaker.on('error', (err: any) => console.error("Speaker error:", err));
      reader.pipe(speaker); 
    });
    file.on('error', (err: any) => console.error("File read error:", err));
    reader.on('error', (err: any) => console.error("WAV decode error:", err));
    file.pipe(reader);
  }
}