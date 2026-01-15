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

global.dfailVoices = {
  admin:     'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/admin.mp3',
  botAdmin:  'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/botadmin.mp3',
  private:   'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/private.mp3',
  group:     'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/group.mp3',
  owner:     'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/owner.mp3',
  premium:   'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/premium.mp3',
  restrict:  'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/rectrict.mp3',
  rowner:    'https://raw.githubusercontent.com/Alismbot/Yaemori-info/main/voice/D/rowner.mp3'
}

global.vidmenu = {
vid1 : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Menu/MENU1_1.mp4',
vid2 : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Menu/MENU2_1.mp4',
vid3 : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Menu/MENU3_1.mp4',
vid4 : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Menu/MENU4_1.mp4',
vid5 : 'https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Menu/MENU5_1.mp4'
}

global.yaemo = {
  img1 :    "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori1.jpg",
  img2 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori2.jpg",
  img3 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori3.jpg",
  img4 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori4.jpg",
  img5 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori5.jpg",
  img6 :    "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori6.jpg",
  img7 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori7.jpg",
 img8 :    "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori8.jpg",
 img9 :   "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/images/Yaemori9.jpg"
  }
  
global.yaecome = {
  wel1 : "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Welcome/welcome.mp4"
  }
  
global.yaembye = {
  good1 : "https://raw.githubusercontent.com/Alismbot/Yaemori-info/refs/heads/main/Video/Welcome/goodbye.mp4"
  }