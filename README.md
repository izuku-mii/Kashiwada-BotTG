
<p align="center">
  <img src="https://files.catbox.moe/caaoet.jpg" width="250"/>
</p>

<h1 align="center">Kashiwada-San - Telegram Bot</h1>


---

## 👤 Owner

> GitHub: [izuku-mii](https://github.com/izuku-mii)
> Project: **Kashiwada-San Telegram Bot**

---

> Bot WhatsApp modular yang kuat menggunakan JavaScript, dibuat dengan sistem plugin untuk fleksibilitas maksimal. Terinspirasi oleh **Kashiwada-san** dari *Kao ni Denai Kashiwada-san to Kao ni Deru Oota-kun*, bot ini menghadirkan semangat dan disiplin dalam obrolan Anda!

---

## 📌 Features

- Arsitektur berbasis plugin
- Ditulis dalam JavaScript
- Kompatibel dengan ESModule
- Pembuatan perintah yang mudah
- Terinspirasi oleh karakter anime kashiwada

---

## ⚙️ Install
```bash
$ git clone https://github.com/izuku-mii/Kashiwada-base-tele
$ cd Kashiwada-base-tele
$ npm install
$ npm start
```

---

## 🌐 ECMAScript Module Example File js

## 🧠 Example Plugin (No Regex)

```javascript
let handler = async (m, { conn, text }) => {
  // code
};

handler.command = ['expired', 'exp'];
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
hendler.mods = false
handler.rowner = false;
handler.group = false;
handler.premium = false;
handler.admin = false;
handler.register = false;
handler.botAdmin = false;

export default handler;
```

---

## ⚡ Example Plugin (With Regex)

```javascript
let handler = async (m, { conn, text }) => {
  // code
};

handler.command = /^(expired|exp)$/i;
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
hendler.mods = false
handler.rowner = false;
handler.group = false;
handler.premium = false;
handler.admin = false;
handler.register = false;
handler.botAdmin = false;

export default handler;
```

---

## 💡 Menu Command

```
.menu       - Show main menu
.menu all   - Show all commands
.menu tags  - Show commands by tags
```

---

### Ehhh....
| [![ShirokamiRyzen](https://github.com/ShirokamiRyzen.png?size=100)](https://github.com/ShirokamiRyzen) | [![AndhikaGG](https://github.com/AndhikaGG.png?size=100)](https://github.com/AndhikaGG) |
|:--:|:--:|
| **[ShirokamiRyzen](https://github.com/ShirokamiRyzen)**<br/>Base Original | **[AndhikaGG](https://github.com/AndhikaGG)**<br/>Penyumbang fitur |

> *"Hmmm...."*
