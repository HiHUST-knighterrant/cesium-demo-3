import { saveAs } from 'file-saver'
import { CVT } from './utils'


export class ImportExport {
  constructor(viewer) {
    this._viewer = viewer;
  }

  _coordinates(entity) {
    const time = Cesium.JulianDate;
    let position
    if (entity.position) {
      position = entity.position.getValue(time)
    }
    let positions
    if (entity.positions) {
      positions = entity.positions.getValue(time)
    }

    if (position instanceof Cesium.Cartesian3) {
      const coor = CVT.cartesian2Degrees(position, this._viewer)
      return [coor.lon, coor.lat, coor.height]
    } else if (positions instanceof Array) {
      const pts = []
      for (let p of this.positions) {
        const c = CVT.cartesian2Degrees(p, this._viewer)
        pts.push([c.lon, c.lat, c.height])
      }
      if (this.type === 'POLYLINE') {
        return pts
      } else {
        return [pts]
      }

    }
  }

  toGeoJson(tool) {
    const { children, type } = tool;

    const json = {
      type: "FeatureCollection",
      name: "graphic",
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      features: []
    };


    for (let i = 0; i < children.length; i++) {
      const entity = children[i];
      const itemJson = {
        "type": "Feature",
        "properties": {

        },
        "geometry": {
          "type": type,
          "coordinates": this._coordinates(entity)
        }
      }

      json.features.push(itemJson);
    }

    const blob = new Blob([JSON.stringify(json)], {
      type: ""
    });
    saveAs(blob, type + parseInt(Cesium.getTimestamp()) + '.geojson');
  }

  fromGeoJson() {

  }
}
