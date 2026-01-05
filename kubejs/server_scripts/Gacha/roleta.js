// Configurações da Roleta
const ROLETA_CONFIG = {
    // Lista de pokémons possíveis
    pool: {
        "tezao": [
            "cobblemon:gardevoir", 
            "cobblemon:charizard", 
            "cobblemon:vaporeon", 
            "cobblemon:lopunny", 
            "cobblemon:salazzle",
            "cobblemon:gengar",
            "cobblemon:lucario"
        ],
    },
    // Quantas trocas a roleta faz antes de parar
    totalSpins: 30,
    // Som de "tick" da roleta
    soundTick: "minecraft:block.note_block.hat",
    // Som de vitória
    soundWin: "minecraft:ui.toast.challenge_complete"
};


/**
 * Função recursiva que gerencia a animação e o prêmio
**/
function runRoletaAnimation(
        server, 
        player, 
        delay, 
        currentSpin, 
        oldEntity, 
        pool
    ) {

    // 1. Remove a entidade visual anterior se ela existir
    if (oldEntity && oldEntity.isAlive()) {
        oldEntity.discard();
    }

    // Se o jogador saiu do servidor, para tudo
    if (!player || !player.isAlive()) return;

    // 2. Verifica se a roleta acabou
    if (currentSpin >= ROLETA_CONFIG.totalSpins) {
        giveReward(player, pool);
        return;
    }

    let visualPokemon = spawnPokemonRoleta(getRandomItem(ROLETA_CONFIG.pool[pool]), player);

    // Toca o som de "tick" (Pitch aumenta conforme chega perto do fim)
    let pitch = 0.8 + (currentSpin / ROLETA_CONFIG.totalSpins);
    playSound(player, ROLETA_CONFIG.soundTick, pitch)
    player.playSound(ROLETA_CONFIG.soundTick, 1.0, pitch);

    // 4. Calcula o próximo delay (Fricção: fica mais lento no final)
    // Começa rápido (2 ticks) e aumenta exponencialmente no final
    let nextDelay = delay;
    if (currentSpin > ROLETA_CONFIG.totalSpins - 4) {
        nextDelay += 3; // Desacelera muito no final
    } else if (currentSpin > ROLETA_CONFIG.totalSpins - 8) {
        nextDelay += 2; // Desacelera um pouco
    } else if (currentSpin > ROLETA_CONFIG.totalSpins - 14) {
        nextDelay += 1; // Desacelera um pouco
    }

    // 5. Agenda a próxima rotação
    server.scheduleInTicks(nextDelay, callback => {
        runRoletaAnimation(server, player, nextDelay, currentSpin + 1, visualPokemon, pool);
    });
}

/**
 * Entrega o prêmio final
 */
function giveReward(player, pool) {
    let serverPersistentData = player.server.persistentData

    // Pega o pokemon da lista interna e o remove da lista
    // TODO: parte de remover pode ser dependente de pool
    let finalSpecies = getRandomItem(serverPersistentData.pools[pool]);
    serverPersistentData.pools[pool] = serverPersistentData.pools[pool].filter(pokemon => pokemon != finalSpecies);

    let { x, y, z } = serverPersistentData.roletaCords;

    // Toca som de vitória e partículas
    playSound(player, ROLETA_CONFIG.soundWin, 1.0);
    player.server.runCommandSilent(`particle minecraft:firework ${parseFloat(x)} ${parseFloat(y + 1)} ${parseFloat(z)} 0.5 0.5 0.5 0.1 50`);

    let rewardPokemon = spawnPokemonRoleta(finalSpecies.getAsString(), player);

    player.tell(Text.of(`§aParabéns! Você ganhou um §e${finalSpecies.getAsString().split(':')[1]}§a!`).bold());

    player.server.runCommandSilent(`pokegiveother ${player.name.getString()} ${finalSpecies.getAsString().split(':')[1]} level=5`);

    player.server.scheduleInTicks(100, callback => {
        rewardPokemon.discard();
        player.server.persistentData.roletaRunning = false
    });
}

function spawnPokemonRoleta(species, player){
    // Cria a entidade visual (Holograma)
    let visualPokemon = player.level.createEntity("cobblemon:pokemon");
    
    // Configura o visual
    let { x, y, z } = player.server.persistentData.roletaCords;
    visualPokemon.setPosition( parseFloat(x), parseFloat(y), parseFloat(z));

    let rotation = player.server.persistentData.roletaRotation;

    let pokemonNbt = visualPokemon.getNbt();
    pokemonNbt.silent = true;
    pokemonNbt.NoAI = true;
    pokemonNbt.Pokemon.Species = species;
    pokemonNbt.Rotation = [ rotation.x, rotation.y ];
    visualPokemon.setNbt(pokemonNbt);

    visualPokemon.spawn();

    return visualPokemon;
}

function playSound(player, sound, pitch) {
  player.level["playSound(net.minecraft.world.entity.player.Player,double,double,double,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource,float,float)"]
    (null, player.x, player.y, player.z, sound, "players", pitch, 0.00001)
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}