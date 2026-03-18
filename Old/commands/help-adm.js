const Discord = require("discord.js")

exports.run = async (client, message, args) => {
  
 const embed = new Discord.MessageEmbed()
    .setTitle(`Aqui esta algumas coisas que eu sei: `)
    .setColor("#00008B")
    .setThumbnail("https://i.pinimg.com/originals/3e/50/c8/3e50c82d8802a640d1e68cf7a7427d74.gif")
    .setDescription(
      `\n\n**__Comandos que somente staffs pode usar: __**` +
      
      `\n\n<:cat:999321524035129344> ,clear ↣ Limpa as mensagens de 1 a 99` +
      
      `\n\n<:cat:999321524035129344> ,add-xp ↣ adiciona um certo numero de xp ao usuario` +
      
      `\n\n<:cat:999321524035129344> ,add-lvl ↣ adiciona um certo level ao usuario` +
      
      `\n\n<:cat:999321524035129344> ,lock-xp ↣ bloqueia o xp ganho em um chat` +
      
      
      /*Agradecimentos*/
      `\n \n E é isso que eu sei fazer até agora... \nse tiver alguma sugestão ou achar algum bug só marcar um staff e ele verá oque faz`
    )
   .setFooter(`Com amor do seu melhor bot`)
 
  message.delete().catch(O_o => {});
  message.channel.send(embed);
}