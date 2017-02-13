var hellophaser = {
  init:function() {
    this.game = new Phaser.Game(800,490);
    this.game.state.add('boot', this.bootState);
    this.game.state.add('loading', this.loadingState);
    this.game.state.add('main', this.mainState);
    this.game.state.start('boot', true, false, "maps/level0.json");
  },
  bootState: {
    init:function(level_file) {
      this.level_file = level_file;
    },
    preload:function() {
      this.load.text('level0', this.level_file);
    },
    create:function() {
      var level_text = this.game.cache.getText('level0');
      var level_data = JSON.parse(level_text);
      this.game.state.start('loading', true, false, level_data);
    }
  },
  loadingState: {
    init:function(level_data) {
      this.level_data = level_data;
    },
    preload:function() {
      this.tiledReader = new TiledReader(this, this.level_data);
      for (gid in this.tiledReader.assets) {
        var asset = this.tiledReader.assets[gid];
        if (asset.image) {
          this.load.image(gid+"", asset.image);
        }
      }
      this.load.json("level0_physics_json", "maps/physics/level0_physics.json");
    },
    create:function() {
      this.load.physics("level0_physics", null, this.game.cache.getJSON("level0_physics_json"));
      this.game.state.start('main', true, false, this.tiledReader);
    }
  },
  mainState: {
    init:function(tiledReader) {
      console.log('main state start: '+tiledReader);
      this.tiledReader = tiledReader;
    },
    create:function() {
      var game = this.game;
      game.stage.backgroundColor = this.tiledReader.level_map.backgroundColor || "#000";
      //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.refresh();
      game.physics.startSystem(Phaser.Physics.P2JS);
      game.physics.p2.gravity.y = 1000;
      //game.world.enableBody = true;
      this.game.world.setBounds(0, 0, 3500, 490);

      var td = new TiledDisplay(this, this.tiledReader);
      td.displayLayers();
      this.playerSprite = null;
      if (this.player && this.player.children && this.player.children.length > 0) {
        this.playerSprite = this.player.children[0];
      } else {
        throw new Error("There is no player layer!");
      }

      //game.physics.p2.enable(this.playerSprite, true);

      this.cursor = game.input.keyboard.createCursorKeys();
      //this.playerSprite.body.gravity.y = 1000;
      game.camera.follow(this.playerSprite, undefined, 0.05, 0.05);

      if (this.enemies && this.collision) {
        this.enemies.forEachExists(function(enemy){
          enemy.body.gravity.y = 1000;
        });
      }

      if (this.collision) {
        this.collision.forEach(function(ch){
          ch.body.static = true;
        });
      }

      if (this.coins) {
        this.coins.forEach(function(ch){
          ch.body.static = true;
        })
      }

      // if (this.background) {
      //   this.background.forEach(function(ch){
      //     ch.body.static = true;
      //     ch.body.collidesWith = [];
      //   })
      // }

      // if (this.collision) {
      //   this.playerSprite.body.collides(this.collision, function(){}, this);
      // }
    },
    update:function() {
      var game = this.game;
      if (!this.lastFrameTime) {
         this.lastFrameTime = Date.now();
       }

       var currTime = Date.now();
       var deltaTime = currTime - this.lastFrameTime;
       deltaTime /= 1000;
       this.lastFrameTime = currTime;

      if (this.cursor.left.isDown) {
        //this.playerSprite.body.rotation -= degtorad(270 * deltaTime);
        this.playerSprite.body.moveLeft(400);

      } else if (this.cursor.right.isDown) {
        //this.playerSprite.body.rotation += degtorad(270 * deltaTime);
        this.playerSprite.body.moveRight(400);
      }

      if (this.playerSprite) {

        // if (this.collision) {
        //   game.physics.arcade.collide(this.playerSprite, this.collision);
        // }
        //
        // if (this.coins) {
        //   game.physics.arcade.overlap(this.playerSprite, this.coins, this.takeCoin, null, this);
        // }
        //
        // if (this.enemies) {
        //   game.physics.arcade.overlap(this.playerSprite, this.enemies, this.restart, null, this);
        //
        //   if (this.collision) {
        //     game.physics.arcade.collide(this.enemies, this.collision);
        //   }
        // }
      }

      // game.physics.arcade.collide(this.player, this.walls);
      // game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);
      // game.physics.arcade.overlap(this.player, this.enemies, this.restart, null, this);

      // if (this.cursor.up.isDown && (this.playerSprite.body.onFloor() || this.playerSprite.body.touching.down)) {
      //   this.playerSprite.body.velocity.y = -600;
      // }
    },
    render:function() {
      var game = this.game;
      if (this.player) {
        this.player.forEachAlive(function(member){
          game.debug.body(member, 'rgba(0,255,0,0.4)');
        }, this);
      }
      if (this.collision) {
        this.collision.forEachAlive(function(member){
          game.debug.body(member,'rgba(0,0,255,0.4)');
        }, this);
      }
      if (this.enemies) {
        this.enemies.forEachAlive(function(member){
          game.debug.body(member,'rgba(255,0,0,0.4)');
        }, this);
      }
      if (this.coins) {
        this.coins.forEachAlive(function(member){
          game.debug.body(member,'rgba(255,0,255,0.4)');
        }, this);
      }
    },
    takeCoin:function(player, coin) {
      coin.kill();
    },
    restart:function() {
      console.log("restarting");
      console.log(this.tiled_groups);
      for (var g in this.tiled_groups) {
        console.log("removing "+g);
        this[g] = null;
      }
      this.tiled_groups = null;
      this.game.state.restart(true, false, this.tiledReader);
    },
    level_controller: {
      displayLevel:function(state, levelIndex) {
        if (!levelIndex) levelIndex = 0;
        var level = this.levels[levelIndex];
        var game = state.game;

        for (var i = 0; i < level.length; i++) {
          for (var j = 0; j < level[i].length; j++) {
            if (level[i][j] == 'x') {
              var wall = game.add.sprite(30+35*j, 30+35*i, 'wall');
              wall.scale.setTo(0.5, 0.5);
              wall.anchor.setTo(0.5, 0.5);
              state.walls.add(wall);
              wall.body.immovable = true;
            } else if (level[i][j] == 'o') {
              var coin = game.add.sprite(30+35*j, 30+35*i, 'coin');
              coin.scale.setTo(0.5, 0.5);
              coin.anchor.setTo(0.5, 0.5);
              state.coins.add(coin);
            } else if (level[i][j] == '!') {
              var enemy = game.add.sprite(30+35*j, 30+35*i, 'enemy');
              enemy.scale.setTo(0.5, 0.5);
              enemy.anchor.setTo(0.5, 0.5);
              state.enemies.add(enemy);
            }
          }
        }
      },
      levels: [
        [
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          '!          !                    o   o      x',
          '!                 o                        x',
          '!          o             o             x   x',
          '!                       o o         x      x',
          '!     ox   !    x    x     x    x   !   x !x',
          'xxxxxxxxxxxxxxxx!!!!!xxxxxxxxxxxxxxxxxxxxxxx'
        ]
      ]
    }
  },
}

window.onload = function() {
  hellophaser.init();
};

function degtorad(angle) {
  return angle * (Math.PI/180);
}
