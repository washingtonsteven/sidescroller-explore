function TiledDisplay(state, tiledReader) {
  this.tiledReader = tiledReader;
  this.state = state;
}

TiledDisplay.prototype = {
  displayLayers:function() {
    if (!this.tiledReader) throw new Error("No valid tiledReader");

    for (var i = 0; i < this.tiledReader.level_map.layers.length; i++) {
      var layer = this.tiledReader.level_map.layers[i];
      if (layer.type === "objectgroup") {
        this.displayObjectLayer(layer);
      } else {
        this.displayTileLayer(layer);
      }
    }
  },
  displayTileLayer:function(layer) {
    if (!layer) throw new Error("Invalid layer index given: "+layerIndex);

    var game = this.state.game;
    var map = layer.map;
    var tileDims = {width:this.tiledReader.level_data.tilewidth, height:this.tiledReader.level_data.tileheight};

    console.log("Display layer: "+layer.name);

    for (var i = 0; i < layer.map.length; i++) {
      for (var j = 0; j < layer.map[i].length; j++) {
        var cell = layer.map[i][j];
        if (!cell.gid) continue; //also skips all those zeroes;
        var sprite = this.state.game.add.sprite(30+tileDims.width*j, 30+tileDims.height*i, cell.gid+"");
        game.physics.p2.enable(sprite, true);
        sprite.anchor.setTo(0.5,0.5);
        if (cell.asset.rotate) {
          sprite.rotation = degtorad(cell.asset.rotate);
        }
        if (!this.state[layer.name]) {
          this.state[layer.name] = this.state.add.group();
          if (!this.state.tiled_groups) this.state.tiled_groups = {};
          if (!this.state.tiled_groups[layer.name]) this.state.tiled_groups[layer.name] = this.state[layer.name];
        }
        this.state[layer.name].add(sprite);
        if (layer.properties && layer.properties.collision) sprite.body.immovable = true;

        console.log("\tadding sprite: "+cell.gid);
      }
    }
  },
  displayObjectLayer:function(layer) {
    var map = layer.map;
    var game = this.state.game;
    var tileDims = {width:this.tiledReader.level_data.tilewidth, height:this.tiledReader.level_data.tileheight};

    console.log("Display layer: "+layer.name);

    for (var i = 0; i < map.length; i++) {
      var sprite_obj = map[i];

      if (sprite_obj.polygon) {
        continue;
        var layerTarget = layer.name.substring(layer.name.indexOf("body_")+"body_".length);
        layerTarget = this.state[layerTarget];
        if (layerTarget && layerTarget.children && layerTarget.children.length > 0) {
          layerTarget.forEach(function(ch){
            if (ch.body.clearShapes) {
              ch.body.clearShapes();
              ch.body.addPolygon({}, sprite_obj.polygon);
            }
          });
        }
      } else {
        var sprite = this.state.game.add.sprite(sprite_obj.x-30, sprite_obj.y-30, sprite_obj.gid+"");
        game.physics.p2.enable(sprite, true);
        sprite.anchor.setTo(0.5,0.5);
        if (!this.state[layer.name]) {
          this.state[layer.name] = this.state.add.group();
          if (!this.state.tiled_groups) this.state.tiled_groups = {};
          if (!this.state.tiled_groups[layer.name]) this.state.tiled_groups[layer.name] = this.state[layer.name];
        }
        this.state[layer.name].add(sprite);

        console.log("\tadding object: "+sprite_obj.gid+" ("+sprite_obj.x+", "+sprite_obj.y+")");
      }
    }
  }
}
