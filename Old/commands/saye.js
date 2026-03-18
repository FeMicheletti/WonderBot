const Discord = require('discord.js');

module.exports.run = async (client, message, args) => {
  const sayMessage = args.join(" ");
  const embed = new Discord.MessageEmbed()
    .setColor("#4cd8b2")
    .setTitle(sayMessage)
  
  message.delete().catch(O_o => {});
  message.channel.send(embed);
};