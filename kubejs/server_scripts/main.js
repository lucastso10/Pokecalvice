/** @type {typeof import("net.neoforged.neoforge.client.event.sound.SoundEvent$SoundSourceEvent").$SoundEvent$SoundSourceEvent } */
let $SoundEvent$SoundSourceEvent  = Java.loadClass("net.neoforged.neoforge.client.event.sound.SoundEvent$SoundSourceEvent")
// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded server example script)')

ServerEvents.loaded(event => {
  event.server.scheduleRepeatingInTicks(300, callback => {
    var playerList = event.server.players

    playerList.forEach(player => {
      if (parseInt(player.persistentData.ticksPlayed) >= 0) {
        //player.tell("Captcha!!!!")
        //event.server.runCommand('captcha forceCaptcha ' + players[i].name.getString() + ' image')
      } else {
        player.persistentData.ticksPlayed = parseInt(player.persistentData.ticksPlayed) + 300
      }
    })

  })
})

PlayerEvents.decorateChat(event => {
  event.server.tell("Trigger warning: dan dan")
  event.setComponent("...")
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  event.register(Commands.literal('starterSelect') // The name of the command
  .executes(ctx => {
    ctx.source.server.runCommand('execute as u/a[tag=!firstjoin] run pokemonrestart false')
    ctx.source.server.runCommand('tag @a[tag=!firstjoin] add firstjoin')
    return 1
  }) // Toggle flight for the player that ran the command if the `target` argument isn't included
  )

  event.register(Commands.literal('clearTimePlayed') // The name of the command
  .executes(ctx => {
    ctx.source.player.persistentData.ticksPlayed = 0
    return 1
  }) // Toggle flight for the player that ran the command if the `target` argument isn't included
  )

})
