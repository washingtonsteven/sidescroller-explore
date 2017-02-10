# To-Be-Named Sidescroller exploration game

## Purpose
This is really mostly for me to play around and learn new stuff in phaser, but with the goal of creating a large-world sidescroller.

If you want to run this (for whatever reason, this whole repo is just me messing around), just point webroot at this folder, and browse to index.html.

## Notes
(This section is mostly for me to take notes on ideas, thoughts, or just tricky things about Phaser that I should remember in the future)

## Potential Resources
(This section is just for me to list links to new resources, art, tutorials, etc., that I should check out in the future and/or have as a reference)

### Art
- Cartoon Vertical Game Backgrounds: http://opengameart.org/content/cartoon-vertical-game-backgrounds

### Tutorials

#### New
- Platformer Tutorial with Phaser and Tiled: https://gamedevacademy.org/platformer-tutorial-with-phaser-and-tiled/

#### Old
- Phaser (2.6.2) API: http://phaser.io/docs/2.6.2/index
- Phaser Community Tutorials: http://phaser.io/learn/community-tutorials
- Original Platformer Tutorial (accessed 2/10/2017): http://www.lessmilk.com/tutorial/2d-platformer-phaser

### Other
- Plugin for slopes with Arcade Physics: https://github.com/hexus/phaser-arcade-slopes
- Tiled keyboard shortcuts: https://github.com/bjorn/tiled/wiki/Keyboard-Shortcuts
- Tiled json format, esp for flipped tiles:http://doc.mapeditor.org/reference/tmx-map-format/#tile-flipping
  - gid in `data` is greater than the gid in `tileset` by the `firstgid` in the tileset (which is `1`, since we are only using 1 tileset)
    - i.e. if you see `87` in the `data` array, the gid is `86` in tileset 1.
    - How would we deal with multiple tilesets like this?
      - Easy answer, you don't. You use gd spritesheets instead of collections (see point below)
  - In this case, use only 1 tileset. Only use multiple if you are using spritesheets
    - Phaser only loads Tiled JSON if you are [using spritesheets](https://phaser.io/examples/v2/loader/load-tilemap-json), not collections on images
  - See below for if gid is not found in tileset


    var FLIP_H = 0x80000000; //draw a horizontal line, and flip over that
    var FLIP_V = 0x40000000; //draw a vertical line, and flip over that
    var FLIP_D = 0x20000000; //draw a y=x (positive diagonal) line, and flip over that
    var hflip = gid & FLIP_H; //these will return some positive number if flipped in that way
    var vflip = gid & FLIP_V; //if not flipped, will be 0
    var dflip = gid & FLIP_D;
    var orig_gid = gid & ~(FLIP_H | FLIP_V | FLIP_D); //~inverts the bits, and then bitwise AND to the gid in the data
    if (dflip) {
      //rotate 90
      if (vflip) {
        //rotate 270 instead
      }
    }

    if (hflip) {
      //rotate 180
    }


## Credits
Uses [Phaser](https://github.com/photonstorm/phaser) by Photon Storm, which is released under the [MIT License](https://opensource.org/licenses/MIT)

Placeholder (?) art by Kenny Vleugels (http://www.kenney.nl), released under [Creative Commons CC0](http://creativecommons.org/publicdomain/zero/1.0/). Grabbed from [Open Game Art](http://opengameart.org/content/platformer-art-complete-pack-often-updated).
