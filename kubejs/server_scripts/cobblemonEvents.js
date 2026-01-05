const $CobblemonEvents = Java.loadClass('com.cobblemon.mod.common.api.events.CobblemonEvents')

const $Priority = Java.loadClass('com.cobblemon.mod.common.api.Priority');

// Load the Java Consumer interface
const $Consumer = Java.loadClass('java.util.function.Consumer');

// Create the logic function first
const captureCallback = (event) => {
    const player = event.getPlayer();
    const pokemon = event.getPokemon();
    console.log(`[KubeJS Direct Subscribe] ${player.getName()} caught a ${pokemon.getSpecies().getName()}.`);
    player.tell(`Direct Subscribe: You caught a ${pokemon.getSpecies().getName()}!`);
};

// Explicitly wrap the JS function in a Java Consumer interface before subscribing
// This removes all ambiguity for the Java compiler.
$CobblemonEvents.POKEMON_CAPTURED.subscribe(
    $Priority.NORMAL,
    new $Consumer({ 
        accept: captureCallback 
    })
);