module.exports.run = async (client, message, args, db) => {
  var banco = await db.ref(`Usuarios/${message.author.id}`).once("value")
  if(banco.val()){
    return message.reply('já existe')
  }else{
  db.ref(`Usuarios/${message.author.id}`).set({
    level: 1,
    xp: 0,
    warns: 0
  })
    message.channel.send("criado")
  }
}