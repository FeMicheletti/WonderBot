const Discord = require("discord.js");

exports.run = async (client, message, args, db) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    message.delete().catch(O_o => {});
    var chat = await db.ref(`Chats/${message.channel.id}`).once("value")
    if (!chat.val()) {
      db.ref(`Chats/${message.channel.id}`).set({type: true})
      message.channel.send("Xp do Canal bloqueado");
      
    } else {
      db.ref(`Chats/${message.channel.id}`).set({})
      message.channel.send("Xp do Canal liberado");
      console.log("deslockado");
      
    }
  }else{
    message.channel.send("Você não pode fazer isso seu bobão!");
  }
};
