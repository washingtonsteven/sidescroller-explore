var hellophaser = {
  init:function() {
    this.game = new Phaser.Game(275,275);
    this.game.state.add('boot', this.bootState);
    this.game.state.add('loading', this.loadingState);
    this.game.state.add('main', this.mainState);
    this.game.state.start('main');
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
      var tilesets = this.level_data.tilesets;
    }
  },
  mainState: {
    preload:function() {
      var game = this.game;
      game.load.image('player', window.base_img_dir+"/Player/p1_front.png");
      game.load.image('wall', window.base_img_dir+"/Tiles/castleCenter.png");
      game.load.image('coin', window.base_img_dir+"/Items/coinGold.png");
      game.load.image('enemy', window.base_img_dir+"/Enemies/blockerMad.png");
    },
    create:function() {
      var game = this.game;
      game.stage.backgroundColor = "#3598db";
      //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.refresh();
      game.physics.startSystem(Phaser.Physics.ARCADE);
      game.world.enableBody = true;
      this.game.world.setBounds(0, 0, 1600, 275);

      this.cursor = game.input.keyboard.createCursorKeys();
      this.player = game.add.sprite(70, 100, 'player');
      this.player.scale.setTo(0.5, 0.5);
      this.player.anchor.setTo(0.5, 0.5);
      this.player.body.gravity.y = 600;
      game.camera.follow(this.player, undefined, 0.05, 0.05);

      this.walls = game.add.group();
      this.coins = game.add.group();
      this.enemies = game.add.group();

      this.level_controller.displayLevel(this, 0);
    },
    update:function() {
      var game = this.game;

      if (this.cursor.left.isDown) {
        this.player.body.velocity.x = -200;
      } else if (this.cursor.right.isDown) {
        this.player.body.velocity.x = 200;
      } else {
        this.player.body.velocity.x = 0;
      }

      game.physics.arcade.collide(this.player, this.walls);
      game.physics.arcade.overlap(this.player, this.coins, this.takeCoin, null, this);
      game.physics.arcade.overlap(this.player, this.enemies, this.restart, null, this);

      if (this.cursor.up.isDown && (this.player.body.onFloor() || this.player.body.touching.down)) {
        this.player.body.velocity.y = -250;
      }
    },
    takeCoin:function(player, coin) {
      coin.kill();
    },
    restart:function() {
      this.game.state.start('main')
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
