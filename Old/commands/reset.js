const Discord = require("discord.js");

exports.run = async (client, message, args, db) => {
  if (message.member.permissions.has("MANAGE_ROLES")) {
    let user = message.mentions.users.first() || client.users.cache.get(args[0]);
    try{
      var warns = await db.ref(`Usuarios/${user.id}/warns`).once("value")
      let warnsA = warns.val()
      db.ref(`Usuarios/${user.id}`).set({
        level: 1,
        xp: 0,
        warns: warnsA
      })
      message.reply("Player " + user.username + " foi resetado pelo " + message.author.username);
    }catch{
      message.reply("Porfavor informe quem eu devo resetar")
    }
  }else {
    message.reply(
      "Calma lá meu amigo, você não é adm para resetar alguem"
    );
  }
};
