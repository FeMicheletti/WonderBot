const Discord = require("discord.js");

exports.run = async (client, message, args, db) => {
  if (message.member.permissions.has("MANAGE_ROLES")) {
    const xpAdd = parseInt(args[0], 10);
    let user = message.mentions.users.first() || client.users.cache.get(args[0]);
    try{
    if (!xpAdd || xpAdd < 1) {
      message.reply("forneça o numero de xp que irá ser concedido (,add-xp 'xp' @user)");
    } else {
      var xpFire = await db.ref(`Usuarios/${user.id}/xp`).once("value")
      var warns = await db.ref(`Usuarios/${user.id}/warns`).once("value")
      var level = await db.ref(`Usuarios/${user.id}/level`).once("value")
      let WarnsA = warns.val()
      let levelA = level.val()
      let xpPlayer = xpFire.val()
      let xpFAdd = xpPlayer + xpAdd;
      db.ref(`Usuarios/${message.author.id}`).set({
        xp: xpFAdd,
        level: levelA,
        warns: WarnsA});
      var xpFinal = await db.ref(`Usuarios/${user.id}/xp`).once("value")
      message.reply("Xp do player " + user.username + " atualizado com sucesso para: " + xpFinal.val());
    }
    }catch{
      message.reply("Porfavor informe quem você deseja aumentar o xp")
    }
  } else {
    message.reply(
      "Calma lá meu amigo, você não é adm para modificar o lvl de alguem"
    );
  }
};
