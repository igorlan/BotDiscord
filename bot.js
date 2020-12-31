require("dotenv").config();


const Discord = require("discord.js"),
  DisTube = require("distube"),
  client = new Discord.Client(),
  config = {
    prefix: "!",
    token: process.env.TOKEN,
  };

const giphy = require("giphy-api")(process.env.giphy);


// Create a new DisTube
const distube = new DisTube(client, {
  searchSongs: false,
  emitNewSongOnly: true,
});

const neverPlaysThisSongs = [
  "BTS",
  "KPOP",
  "K POP",
  "EXO",
  "BLACKPINK",
  "BLACK PINK",
  "SEVEN TEEN",
  "TWICE",
  "RED VEVELT",
  "REDVEVELT",
];

client.on("ready", () => {
  console.log(`Logado como ${client.user.tag}!`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift();

  // const toUpperMsg = message.content.toUpperCase();
  // if (contains(toUpperMsg, neverPlaysThisSongs)) {
  //   message.channel.send("TA PROIBIDO KAPOPI PORRA");
  //   return;
  // }

  if (command == "jump") distube.jump(message, parseInt(args[0]));

  if (["tocaesselixoae", "play"].includes(command))
  console.log('play: ', message);
  console.log("args", args.join(" "));
  for( let i = 0; i < neverPlaysThisSongs; i ++ ){
    if (neverPlaysThisSongs[i] == args.join(" ")) {
      message.channel.send(
        "Só tocamos musica boa aqui.",
      );
      distube.stop(message);
      return;
    }
  }
    distube.play(message, args.join(" "));

  if (command == "loop") distube.setRepeatMode(message, parseInt(args[0]));

  if(command =="pausar") {
      distube.pause(message);
  message.channel.send("Musica pausada, para retomar a música use o comando !retomar");
  }

  if(command == "retomar"){ 
      distube.resume(message);
    message.channel.send("Musica retomada.");
  }

  if (command == "stop") {
    distube.stop(message);
    message.channel.send("Parei esse lixo");
  }

  if(command == "avancar"){
    // const numb = message.match(/\d/g)
    console.log("avancar: ", message, Number(args[0]));
    distube.seek(message, Number(args[0]));
      message.channel.send(`Música avançada em ${Number(args[0])}.`);
  }
  

  if (command == "repeat") {
    let mode = distube.setRepeatMode(message, parseInt(args[0]));
    mode = mode
      ? mode == 2
        ? "Repetindo a lista"
        : "Repetindo a musica"
      : "Off";
    message.channel.send("Setando o modo de repetição para `" + mode + "`");
  }
  if (command == "autoplay") {
    let mode = distube.toggleAutoplay(message);
    message.channel.send(
      "Set autoplay mode to `" + (mode ? "On" : "Off") + "`",
    );
  }

  if (command == "skip") {
    distube.skip(message);
    message.channel.send("`Musica skipada`");
  }

  if (command == "volume") {
    if (args[0] <= 100) {
      distube.setVolume(message, args[0]);
      message.channel.send("Novo volume: " + args[0] + "%");
      return;
    } else {
      message.channel.send("Volume tem que ser abixo de 100 sua mula fdp");
    }
  }

  if (["queue", "playlist"].includes(command)) {
    let queue = distube.getQueue(message);
    message.channel.send(
      "Lista de Reprodução:\n" +
        queue.songs
          .map(
            (song, id) =>
              `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``,
          )
          .slice(0, 10)
          .join("\n"),
    );
  }
   if (command === "samae"){
     const author =  message.author.username
     message.reply(` ${author} sa mãe`)
   }

     if (command === "pijas") {
       try {
         giphy
           .id("xUn3ClY96QtTHGMl6U")
           .then(async (res) => {
             await message.reply("É o PIJAS", {
               files: [`${res.data.image_url}`],
             });
           })
           .catch((err) => {
             message.channel.send(`
            ### Deu ruim sua mula

            ---

            ${err}
            `);
           });
       } catch (error) {
         message.channel.send(`
            ### Deu ruim sua mula

            ---

            ${error}
            `);
       }
     }

  // gif
   if (command === "gif") {
     const messageForGifSearch = message.content.replace("!gif", "");

     giphy.random(
       {
         tag: `${messageForGifSearch}`,
         rating: "r",
       },
       async (err, res) => {
         try {
           console.log(res.data);
           await message.reply("Toma ai animal", {
             files: [`${res.data.image_url}`],
           });
         } catch (err) {
           console.log(err);
         }
       },
     );
   }
   if (command === "help") {
     message.channel.send(`
      Comandos de Musica
      **
        !play 
        !stop
        !skip
        !playlist
        !pausar
        !retomar
      **
      Comandos Gifs
      **
        !gif <-nome do gif->
      **
      `);
   }
   // end
});

client.on("message", (message) => {
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift();

  if (
    [
      `3d`,
      `bassboost`,
      `echo`,
      `karaoke`,
      `nightcore`,
      `vaporwave`,
      `surround`,
    ].includes(command)
  ) {
    let filter = distube.setFilter(message, command);
    message.channel.send("Filtro Atual: " + (filter || "Off"));
  }

  distube.on("empty", (message) =>
    message.channel.send("Canal está vazio, falo"),
  );
});

// Queue status template
const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filtro: \`${
    queue.filter || "Off"
  }\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode == 2
        ? "All Queue"
        : "This Song"
      : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
  .on("playSong", (message, queue, song) =>
    message.channel.send(
      `Tocando \`${song.name}\` - \`${
        song.formattedDuration
      }\`\nAdicionado por: ${song.user}\n${status(queue)}`,
    ),
  )
  .on("addSong", (message, queue, song) =>
    message.channel.send(
      `Adicionado ${song.name} - \`${song.formattedDuration}\` para a lista por ${song.user}`,
    ),
  )
  .on("playList", (message, queue, playlist, song) =>
    message.channel.send(
      `Play \`${playlist.name}\` playlist (${
        playlist.songs.length
      } musicas).\nAdicionado por: ${song.user}\nReproduzindo agora \`${
        song.name
      }\` - \`${song.formattedDuration}\`\n${status(queue)}`,
    ),
  )
  .on("addList", (message, queue, playlist) =>
    message.channel.send(
      `Adicionado \`${playlist.name}\` playlist (${
        playlist.songs.length
      } songs) para a lista\n${status(queue)}`,
    ),
  )
  // DisTubeOptions.searchSongs = true
  .on("searchResult", (message, result) => {
    let i = 0;
    message.channel.send(
      `**Choose an option from below**\n${result
        .map(
          (song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``,
        )
        .join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`,
    );
  })
  // DisTubeOptions.searchSongs = true
  .on("searchCancel", (message) => message.channel.send(`Pesquisa cancelada`))
  .on("error", (message, e) => {
    console.error(e);
    message.channel.send("Um erro foi encontrado: " + e);
  });

client.login(config.token);
