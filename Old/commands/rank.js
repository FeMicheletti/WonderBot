const Discord = require("discord.js");
const canvacord = require("canvacord");

exports.run = async (client, message, args, db) => {
  let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
  let avatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 });
  let nome = user.username;
  let discrim = user.discriminator;
  let id = user.id
  const Color = "#40E0D0";
  
  var levelFire = await db.ref(`Usuarios/${id}/level`).once("value")
  var xpFire = await db.ref(`Usuarios/${id}/xp`).once("value")
  let xpPlayer = xpFire.val()
  let rank = xpPlayer / 100;
  let rankF = levelFire.val()
  let xpNeed = rankF * 100;
  
  
  if (user.username == "Wonder World") {
    message.channel.send(`Seu Rank está sendo gerado, espera só um pouco :p`).then(msg => msg.delete({timeout: 3000}))
    const rank = new canvacord.Rank()
      .setAvatar(avatar)
      .setCurrentXP(100000, Color)
      .setRequiredXP(100000, Color)
      .setStatus("dnd")
      .setRank(1, "rank", false)
      .setLevel(100000, "Level", true)
      .setLevelColor(Color, Color)
      .setBackground("IMAGE","https://wallpapershome.com/images/pages/pic_h/22338.jpg")
      .setProgressBar(Color, "COLOR")
      .setUsername(nome, Color)
      .setDiscriminator(discrim, Color);
    
    rank.build().then(data => {
      const attachment = new Discord.MessageAttachment(data, "RankCard.png");
      message.channel.send(attachment);
    });
    
  } else if (user.bot == true) {
    
    message.channel.send("Opa! Pera aí bots não podem ter level... (Só eu que sou lvl 100k)");
    
  } else if (xpPlayer == null){
    message.channel.send(`Seu Rank está sendo gerado, espera só um pouco :p`).then(msg => msg.delete({timeout: 3000}))
    const rank = new canvacord.Rank()
      .setAvatar(avatar)
      .setCurrentXP(0, Color)
      .setRequiredXP(100, Color)
      .setStatus("dnd")
      .setRank(1, "rank", false)
      .setLevel(1, "Level", true)
      .setLevelColor(Color, Color)
      .setBackground("IMAGE","https://wallpapershome.com/images/pages/pic_h/22338.jpg")
      .setProgressBar(Color, "COLOR")
      .setUsername(nome, Color)
      .setDiscriminator(discrim, Color);
    
    rank.build().then(data => {
      const attachment = new Discord.MessageAttachment(data, "RankCard.png");
      message.channel.send(attachment);
    });
  }else {
    message.channel.send(`Seu Rank está sendo gerado, espera só um pouco :p`).then(msg => msg.delete({timeout: 3000}))
    const rank = new canvacord.Rank()
      .setAvatar(avatar)
      .setCurrentXP(xpPlayer, Color)
      .setRequiredXP(xpNeed, Color)
      .setStatus("dnd")
      .setRank(1, "rank", false)
      .setLevelColor(Color, Color)
      .setBackground("IMAGE","https://wallpapershome.com/images/pages/pic_h/22338.jpg")
      .setLevel(rankF, "Level", true)
      .setProgressBar(Color, "COLOR")
      .setUsername(nome, Color)
      .setDiscriminator(discrim, Color);

    rank.build().then(data => {
      const attachment = new Discord.MessageAttachment(data, "RankCard.png");
      message.channel.send(attachment);
    });
  }
};
