const Discord = require('discord.js');

module.exports.run = async (client, message, args) => {
  //Climas que ficam negativos
  var tempPerdAs  = Math.floor(Math.random() * (20 - 1) + 1) * (Math.round(Math.random()) * 2 - 1)
  var tempGama    = Math.floor(Math.random() * (20 - 1) + 1) * (Math.round(Math.random()) * 2 - 1)
  var arrayNeg = ["Chovendo", "Nevando"];
  //Climas frios
  var tempAlpha   = Math.floor(Math.random() * (25 - 9) + 9)
  var tempBeta    = Math.floor(Math.random() * (25 - 9) + 9)
  var tempCarmin  = Math.floor(Math.random() * (25 - 9) + 9)
  var arrayFrio = ["Garoando", "Chovendo", "Granito", "Sol Fraco"];
  //Clima Tropical
  var tempPedagio = Math.floor(Math.random() * (30 - 10) + 10)
  var arrayTrop = ["Sol Fraco", "Nublado"];
  //Clima Quente
  var tempCorsair = Math.floor(Math.random() * (33 - 22) + 22)
  var tempDeserto = Math.floor(Math.random() * (33 - 22) + 22)
  var arrayQuente = ["Ensolarado", "Nublado", "Chuva Abafada"];
  
  var canal = message.guild.channels.cache.find(
    ch => ch.id === "1001211757165031454"
  );
  const msg1 = await canal.send("@everyone")
  const msg = await canal.send(
    new Discord.MessageEmbed()
      .setTitle(`Clima atual em cada Região: `)
      .setColor("#00008B")
      .setThumbnail("https://i.pinimg.com/originals/e8/5d/db/e85ddba8a747c4e8c885fa05e4ac3cd7.gif")
      .addField("Reino Carmim:",       "Encontra-se em uma temperatura de " + tempCarmin  + "°C - " + arrayFrio[Math.floor(Math.random() * arrayFrio.length)])
      .addField("Vila Perdida de As:", "Encontra-se em uma temperatura de " + tempPerdAs  + "°C - " + arrayNeg[Math.floor(Math.random() * arrayNeg.length)])
      .addField("Vilarejo Alpha:",     "Encontra-se em uma temperatura de " + tempAlpha   + "°C - " + arrayFrio[Math.floor(Math.random() * arrayFrio.length)])
      .addField("Vilarejo Beta:",      "Encontra-se em uma temperatura de " + tempBeta    + "°C - " + arrayFrio[Math.floor(Math.random() * arrayFrio.length)])
      .addField("Vilarejo Gama:",      "Encontra-se em uma temperatura de " + tempGama    + "°C - " + arrayNeg[Math.floor(Math.random() * arrayNeg.length)])
      .addField("Vilarejo Pedagio",    "Encontra-se em uma temperatura de " + tempPedagio + "°C - " + arrayTrop[Math.floor(Math.random() * arrayTrop.length)])
      .addField("Reino Corsair",       "Encontra-se em uma temperatura de " + tempCorsair + "°C - " + arrayQuente[Math.floor(Math.random() * arrayQuente.length)])
      .addField("Vilarejo Deserto",    "Encontra-se em uma temperatura de " + tempDeserto + "°C - " + arrayQuente[Math.floor(Math.random() * arrayQuente.length)])
      .setFooter(`Com amor do seu melhor bot`)
      .setTimestamp()
  );
  await message.channel.send(
    `${message.author} Clima gerado e enviado com sucesso`
  );
};