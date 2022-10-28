export class MarkerTool {
  constructor(viewer) {
    this._viewer = viewer
    this._activeMarker = null;
    this._markers = [];
    this._iconPath = "./res/pic/marker.png"
    this.type = "Point";
  }

  get enable() {
    return this._enable;
  }

  set enable(v) {
    this._enable = v;

    if (v === false) {
      this._viewer.entities.remove(this._activeMarker);
      this._activeMarker = null;
    }
  }

  get children() {
    return this._markers;
  }

  addMarker(position) {
    return this._viewer.entities.add({
      position: position,
      billboard: {
        image: this._iconPath,
        scale: 0.5,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM
      }
    });
  }

  mouseMove(position) {
    if (!this._enable) return;

    if (!this._activeMarker) {
      this._activeMarker = this.addMarker(position);
    } else {
      this._activeMarker.position = position;
    }
  }

  mouseClick(position) {
    if (!this._enable) return;

    this._activeMarker = this.addMarker(position);
    this._markers.push(this._activeMarker)
  }
}
