var hellophaser = {
  init:function() {
    this.game = new Phaser.Game(1000,490);
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
    },
    create:function() {
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
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.refresh();
      game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.world.setBounds(0, 0, 3500, 490);

      var td = new TiledDisplay(this, this.tiledReader);
      td.displayLayers();
      this.playerSprite = null;
      if (this.player && this.player.children && this.player.children.length > 0) {
        this.playerSprite = this.player.children[0];
      } else {
        throw new Error("There is no player layer!");
      }

      this.cursor = game.input.keyboard.createCursorKeys();
      this.playerSprite.body.gravity.y = 1000;
      this.playerSprite.scale.setTo(0.75,0.75);
      game.camera.follow(this.playerSprite, undefined, 0.05, 0.05);

      if (this.enemies && this.collision) {
        this.enemies.forEachExists(function(enemy){
          enemy.body.gravity.y = 1000;
        });
      }

      if (this.collision) {
        for (var c in this.collision.children) {
          var cc = this.collision.children[c].body;
          cc.collideWorldBounds = true;
          cc.checkCollision = {
            up:true,
            down:false,
            left:false,
            right:false
          }

        }
      }
    },
    update:function() {
      var game = this.game;

      if (this.cursor.left.isDown) {
        this.playerSprite.body.velocity.x = -400;
      } else if (this.cursor.right.isDown) {
        this.playerSprite.body.velocity.x = 400;
      } else {
        this.playerSprite.body.velocity.x = 0;
      }

      if (this.playerSprite) {
        this.playerSprite.collideWorldBounds = true;

        if (this.collision) {
          game.physics.arcade.collide(this.playerSprite, this.collision);
        }

        if (this.collision_solid) {
          game.physics.arcade.collide(this.playerSprite, this.collision_solid);
        }
        
        if (this.coins) {
          game.physics.arcade.overlap(this.playerSprite, this.coins, this.takeCoin, null, this);
        }
        
        if (this.enemies) {
          game.physics.arcade.overlap(this.playerSprite, this.enemies, this.restart, null, this);
        
          if (this.collision) {
            game.physics.arcade.collide(this.enemies, this.collision);
          }
        }
      }

      if (this.cursor.up.isDown && (this.playerSprite.body.onFloor() || this.playerSprite.body.touching.down)) {
        this.playerSprite.body.velocity.y = -600;
      }
    },
    takeCoin:function(player, coin) {
      coin.kill();
    },
    restart:function() {
      console.log(this.tiled_groups);
      for (var g in this.tiled_groups) {
        this[g] = null;
      }
      this.tiled_groups = null;
      this.game.state.restart(true, false, this.tiledReader);
    }
  },
}

window.onload = function() {
  hellophaser.init();
};

function degtorad(angle) {
  return angle * (Math.PI/180);
}
