function TiledReader(state, level_data) {
  this.state = state;
  this.level_data = level_data;
  if (this.level_data) this.initLevelData();

  /*
   * Important props:
   * assets: object of assets keyed on gid (gid found in data table, which is gid + firstgid in tileset)
   *  asset.image is path to image
   *  asset.rotate is rotation indegrees (90, 180, 270)
   *  asset.scaleX is xscale, for flipping vertically
   * level_map: array of layers, each layer a 2d array with cells
   * cell is object: cell.gid and cell.asset
   * this.backgroundColor is bgcolor from tileset
   */
}
TiledReader.prototype = {
  FLIP_H: 0x80000000,
  FLIP_V: 0x40000000,
  FLIP_D: 0x20000000,
  initLevelData:function() {
    if (!this.level_data) throw new Error("Can't init level_data, none provided.");

    this.assets = {};

    for (var i = 0; i < this.level_data.tilesets.length; i++) {
      var tileset = this.level_data.tilesets[i];

      for (tileGid in tileset.tiles) {
        var dataGid = parseInt(tileGid) + tileset.firstgid;
        var path = tileset.tiles[tileGid].image;
        this.assets[dataGid] = {
          image:path.substring(path.indexOf("img/"))
        }
      }
    }

    this.readMap();
  },
  readMap:function(level_data) {
    var i,j;
    var layerIndex = 0;

    if (!level_data) level_data = this.level_data;
    if (!level_data) throw new Error("No level data provided to create map!");

    this.level_map = {};

    this.level_map.backgroundColor = level_data.backgroundcolor || "#ffffff";
    this.level_map.layers = [];

    for (layer of level_data.layers) {
      this.level_map.layers[layerIndex] = {};
      this.level_map.layers[layerIndex].map = [];
      this.level_map.layers[layerIndex].name = layer.name;
      this.level_map.layers[layerIndex].properties = layer.properties;
      var currLayer = this.level_map.layers[layerIndex].map;

      console.log(
        "Reading level: "+layer.name
      );

      for (i = 0; i < layer.height; i++) {
        for (j = 0; j < layer.width; j++) {
          var currCell = layer.data[layer.width*i+j];

          if (!currLayer[i]) currLayer[i] = [];

          var cellData = {
            gid:currCell,
            asset:this.getAssetByGid(currCell)
          }

          if (!this.assets.hasOwnProperty(currCell) && currCell) {
            var converted = this.convertGid(currCell).gid;
            if (this.assets.hasOwnProperty(converted)) {
              cellData.gid = converted;
            } else {
              cellData.gid = 0;
            }
          }

          currLayer[i].push(cellData);
        }
      }

      if (layer.height + layer.width == 0 && layer.type == "objectgroup") {
        this.level_map.layers[layerIndex].type = "objectgroup";
        for (i = 0; i < layer.objects.length; i++) {
          var obj = layer.objects[i];
          var obj_data = {
            x:obj.x,
            y:obj.y,
            gid:obj.gid
          }
          currLayer.push(obj_data);
        }
      }
      layerIndex++;
    }
  },
  getAssetByGid:function(gid) {
    if (this.assets.hasOwnProperty(gid)) {
      return this.assets[gid];
    } else if (gid) { //check if it's flipped
      var orig_gid_obj = this.convertGid(gid);
      var orig_gid = orig_gid_obj.gid;

      if (this.assets.hasOwnProperty(orig_gid)) {
        var asset = this.assets[orig_gid];
        asset.rotate = orig_gid_obj.dflip ? (orig_gid_obj.vflip ? 270 : 90) : (orig_gid_obj.hflip ? 180 : 0);
        asset.scaleX = orig_gid_obj.vlfip && !orig_gid_obj.dflip ? -1 : 1;

        return asset;
      }
    }

    return null;
  },
  convertGid:function(gid) {
    var hflip = gid & this.FLIP_H;
    var vflip = gid & this.FLIP_V;
    var dflip = gid & this.FLIP_D;
    var orig_gid = gid & ~(this.FLIP_H | this.FLIP_V | this.FLIP_D);

    return {
      gid:orig_gid,
      hflip:hflip,
      vflip:vflip,
      dflip:dflip
    };
  }
}
