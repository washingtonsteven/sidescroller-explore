var sidescroller = {
  init:function() {
    this.game = new Phaser.Game(746, 420, Phaser.AUTO, '');
    this.game.state.add('Boot', this.states.boot);
    this.game.state.add('Preload', this.states.preload);
    this.game.state.add('Game', this.states.game);
    this.game.state.start('Boot');
  },
  states:{
    boot:{
      preload:function() {
        this.load.image('preloadbar', window.base_img_dir+"/Request pack/Tiles/laserYellowHorizontal.png");
      },
      create:function() {
        this.game.stage.backgroundColor = "#3598db";
        this.scale.scaleMode = Phaser.Scalemanager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize(true);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('Preload');
      }
    },
    preload:{
      preload:function() {
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
        this.preloadbar.anchor.setTo(0.5);
        //this.preloadBar.scale.setTo(3);
        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('player', window.base_img_dir+"/Player/p1_front.png");
        this.load.image('wall', window.base_img_dir+"/Tiles/castleCenter.png");
        this.load.image('coin', window.base_img_dir+"/Items/coinGold.png");
        this.load.image('enemy', window.base_img_dir+"/Enemies/blockerMad.png");
      },
      create:function() {
        this.state.start('Game')
      }
    }
    game:{
      preload:function() {
        //this.game.time.advancedTiming = true;
      },
      create:function() {
        this.player = this.game.add.sprite(70, 100, 'player');
      }
    }
  }
}

window.onload = function() {
  sidescroller.init();
}
