const Discord = require("discord.js");

exports.run = async (client, message, args, db) => {
  if (message.member.permissions.has("MANAGE_ROLES")) {
    const levelAdd = parseInt(args[0], 10);
    let user =
      message.mentions.users.first() ||
      client.users.cache.get(args[0]);
    try{
    if (!levelAdd || levelAdd < 1) {
      message.reply("forneça o numero de levels que irá ser concedido (,add-lvl lvl @user)");
    } else {
      var xp = await db.ref(`Usuarios/${user.id}/xp`).once("value")
      var warns = await db.ref(`Usuarios/${user.id}/warns`).once("value")
      var levelFire = await db.ref(`Usuarios/${user.id}/level`).once("value")
      let WarnsA = warns.val()
      let xpA = xp.val()
      let levelPlayer = levelFire.val()
      let levelFAdd = levelPlayer + levelAdd;
      db.ref(`Usuarios/${user.id}`).set({
        xp: xpA,
        level: levelFAdd,
        warns: WarnsA});
      var levelFinal = await db.ref(`Usuarios/${user.id}/level`).once("value")
      message.reply("Level do player " + user.username + " atualizado com sucesso para: " + levelFinal.val());
    }
    }catch{
      message.reply("Porfavor informe quem você deseja aumentar o level")
    }
  } else {
    message.reply(
      "Calma lá meu amigo, você não é adm para modificar o lvl de alguem"
    );
  }
};
