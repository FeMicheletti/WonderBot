const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  message.delete();
  const content = args.join(" ");

  if (!args[0]) {
    return message.channel.send(
      `${message.author.username}, Escreva qual o erro encontrado, e em qual comando.`
    );
  } else if (content.length > 1000) {
    return message.channel.send(
      `${message.author.username}, essa mensagem ta muito grande, dá uma resumida ai :p.`
    );
  } else {
    var canal = message.guild.channels.cache.find(
      ch => ch.id === "999318917526863964"
    );
    const msg = await canal.send(
      new Discord.MessageEmbed()
        .setColor("#FFFFF1")
        .addField("Autor:", message.author)
        .addField("Descrição", content)
        .setFooter("ID do Autor: " + message.author.id)
        .setTimestamp()
    );
    await message.channel.send(
      `${message.author} a mensagem foi enviada com sucesso!`
    );
  }
};
