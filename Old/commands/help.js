const Discord = require("discord.js")

exports.run = async (client, message, args) => {
  
 const embed = new Discord.MessageEmbed()
    .setTitle(`Aqui esta algumas coisas que eu sei: `)
    .setColor("#00008B")
    .setThumbnail("https://i.pinimg.com/originals/3e/50/c8/3e50c82d8802a640d1e68cf7a7427d74.gif")
    .setDescription(
      /*Comandos dos Membros*/
      `**__Comandos que você pode usar: __**` +
      
      `\n\n<:cat:999321524035129344> ,avatar ↣ Quer ver um Avatar? É só me perguntar` +
      
      `\n\n<:cat:999321524035129344> ,coin ↣ Tá afim de testar sua sorte? Teste no meu coinflip` +
      
      `\n\n<:cat:999321524035129344> ,help ↣ Isso serve para eu te ajudar, mas você ja sabia né?` +
      
      `\n\n<:cat:999321524035129344> ,ideia ↣ Com ele você irá mandar sua ideia para o chat #ideia` +
      
      `\n\n<:cat:999321524035129344> ,kiss ↣ Você pode dar um beijin em alguem UwU` +
      
      `\n\n<:cat:999321524035129344> ,rank ↣ Irei informar seu level atual` +
      
      `\n\n<:cat:999321524035129344> ,report ↣ Usa esse comando caso ache algum erro em mim` +
      
      `\n\n<:cat:999321524035129344> ,ping ↣ Eu vou informar minha latência atual`+
      
      `\n\n<:cat:999321524035129344> ,say ↣ comando usado para eu falar algo por você` + 
      
      `\n\n<:cat:999321524035129344> ,saye ↣ É uma variação do say, só que numa caixinha` +
      
      `\n\n<:cat:999321524035129344> ,uptime ↣ Quer saber quanto tempo estou on?` +
      
      /*Agradecimentos*/
      `\n \n E é isso que eu sei fazer até agora... \nse tiver alguma sugestão ou achar algum bug só marcar um staff e ele verá oque faz`
    )
   .setFooter(`Com amor do seu melhor bot`)
 
  message.delete().catch(O_o => {});
  message.channel.send(embed);
}