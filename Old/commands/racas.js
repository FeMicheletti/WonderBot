const Discord = require("discord.js");

exports.run = async(client, message, args) => {
  var raças = ["Humanos", "Elfos", "Gigantes", "Fadas", "Neko", "\n __**Raças Raras:**__"];
  var did = true;
  var id = 0;
  var textEmbed = `\n\n __**Raças Comum:**__`
  while(did){
    if(raças[id] != null){
      textEmbed = textEmbed + `\n` +raças[id]
      id = id + 1
    }else{
      id = 0
      did = false
    }
  }
  
  let embed = new Discord.MessageEmbed()
    .setTitle(`Pagina Inicial das Raças`)
    .setThumbnail(message.author.displayAvatarURL())
    .setDescription(textEmbed)
    .setFooter(`${message.author.tag}`)
    .setColor("RANDOM")
  message.channel.send(`${message.author}`, embed).then(msg => {
    msg.react("◀️")
    msg.react("❌")
    msg.react("▶")
    let filtro0 = (r, u) => r.emoji.name === '◀️' && u.id === message.author.id;
    let filtro1 = (r, u) => r.emoji.name === '❌' && u.id === message.author.id;
    let filtro2 = (r, u) => r.emoji.name === '▶' && u.id === message.author.id;
    let coletor0 = msg.createReactionCollector(filtro0);
    let coletor = msg.createReactionCollector(filtro1);
    let coletor2 = msg.createReactionCollector(filtro2);
    coletor0.on("collect", c => {
      let ferinha = new Discord.MessageEmbed()
        .setTitle(`Painel de comandos`)
        .setThumbnail(message.author.displayAvatarURL())
        .setDescription(`Veja meus comandos:\n🔗 Utilidade \n⚙ Moderação \n🤣 Diversão \n👑 Outros⠀`)
        .setFooter(`${message.author.tag}`)
        .setColor("YELLOW")   
      msg.edit(`${message.author}`, ferinha)
    })
    coletor.on("collect", c => {
      let fera = new Discord.MessageEmbed()
        .setTitle(`🔗 Utilidade 🔗`)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter(`${message.author.tag}`)
        .setDescription(`Escreva seus comandos de utilidade aqui! \n⠀`)
        .setColor("GREEN")
      msg.edit(`${message.author}`, fera)
    })
    coletor2.on("collect", c => {
      let fera = new Discord.MessageEmbed()
        .setTitle(`⚙ Moderação ⚙`)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter(`${message.author.tag}`)
        .setDescription(`Escreva seus comandos de moderação aqui! \n⠀`)
        .setColor("GREEN")
      msg.edit(`${message.author}`, fera)
    })
  })
}