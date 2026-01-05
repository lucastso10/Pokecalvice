ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(Commands.literal('roleta')
    .requires(source => source.hasPermission(2))
    .then(Commands.literal('rodar')
      .then(Commands.argument('pool', Arguments.STRING.create(event))
        .executes(ctx => {
          const { player, server } = ctx.source;
          let pool = Arguments.STRING.getResult(ctx, 'pool');

          if(!ROLETA_CONFIG.pool[pool]) {
            player.tell(`A pool ${pool} não existe!`);
            return 1;
          }

          if (!server.persistentData.pools[pool][0])
            server.runCommandSilent(`roleta resetar ${pool}`);

          if (server.persistentData.roletaRunning == true) {
            player.tell(Component.red(`Não é possivel rodar roleta enquanto tem outra rodando`));
            return 1;
          }
          else {
            server.persistentData.roletaRunning = true
          }

          // Inicia a animação (Delay inicial, iteração atual, entidade anterior para limpar)
          runRoletaAnimation(server, player, 2, 0, null, pool);

          return 1;
        })
      )
    )
    .then(Commands.literal('resetar')
      .then(Commands.argument('pool a resetar', Arguments.STRING.create(event))
        .executes(ctx => {
          let serverPersistentData = ctx.source.server.persistentData;
          let poolAResetar = Arguments.STRING.getResult(ctx, 'pool a resetar');


          if (!ROLETA_CONFIG.pool[poolAResetar]) {
            ctx.source.player.tell(Component.red(`A pool ${poolAResetar} não foi encontrada na config`));
            return 1;
          }

          if (!serverPersistentData.pools) 
            serverPersistentData.pools = {};

          serverPersistentData.pools[poolAResetar] = ROLETA_CONFIG.pool[poolAResetar];
          ctx.source.player.tell(Component.green(`A pool ${poolAResetar} foi resetada com sucesso!`));
          return 1;
        })
      )
    )
    .then(Commands.literal('print')
      .then(Commands.argument('pool a printar', Arguments.STRING.create(event))
        .executes(ctx => {
          let serverPersistentData = ctx.source.server.persistentData;
          let poolAResetar = Arguments.STRING.getResult(ctx, 'pool a printar');

          ctx.source.player.tell(serverPersistentData.pools[poolAResetar]);

          return 1
        })
      )
    )
    .then(Commands.literal('setPos')
      .executes(ctx => {
        let { player, server } = ctx.source;

        server.persistentData.roletaCords = {
          x: parseInt(player.x) - 0.5,
          y: parseInt(player.y),
          z: parseInt(player.z) - 0.5
        };

        server.persistentData.roletaRotation = {
          x: player.rotationVector.x,
          y: player.rotationVector.y
        };

        ctx.source.player.tell(`Roleta resetado para a posição ${server.persistentData.roletaCords} e rotação ${server.persistentData.roletaRotation}`);
        return 1;
      })
    )
    .then(Commands.literal('liberar')
      .executes(ctx => {
        const { player, server } = ctx.source;

        server.persistentData.roletaRunning = false;

        player.tell(`Roleta liberada!`);

        return 1;
      })
    )
  );
});