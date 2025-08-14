global.token = "Your_Token"
global.ownername = "izumi"
global.ownerid = ["5967182374"]
global.premid = ""
global.botname = "Kashiwada-san"
global.prefix = ["/", ".", "#", "!"]
global.wib = 7
global.wait = "Please wait..."
global.wm = "© Izuku - mi!"
// Message
global.message = {
  rowner: "This command can only be used by the _*OWNER!*_",
  owner: "This command can only be used by the _*Bot Owner*_!",
  premium: "This command is only for _*Premium*_ members!",
  group: "This command can only be used in groups!",
  private: "This command can only be used in Private Chat!",
  admin: "This command can only be used by group admins!",
  error: "An error occurred, please try again later.",
};

// Port configuration
global.ports = [4000, 3000, 5000, 8000];

// Database configuration
global.limit = 100;

global.apikey = {
  //lann: 'https://api.betabotz.eu.org',
  ryzumi: 'https://api.ryzumi.vip',
  izumi: 'https://izumiiiiiiii.dpdns.org/'
}
global.APIKeys = {
  //'https://api.betabotz.eu.org': 'API_KEY', 
}

import fs from 'fs';
import chalk from 'chalk';

const file = new URL(import.meta.url);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update 'config.js'`));
});
