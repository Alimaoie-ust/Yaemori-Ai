import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.info = {
  devali: '657',
  num: '212',
  ali: '621',
  maoie: '240'
}

global.gif = {
rg: 'https://raw.githubusercontent.com/alimaoie-us/Object/refs/heads/main/yaemori/unreg.gif',
ntr: 'https://raw.githubusercontent.com/alimaoie-us/Object/refs/heads/main/yaemori/nature.mp4'
}