import * as Cesium from 'cesium';
import { getCylinderEntity } from './entity'
import { getCylinderPrimitive } from './primitive'

/**
 * 添加地球的坐标轴
 * @param {*} viewer
 */
export function addAxisGlobe(viewer) {
  // const width = 40000;
  // const length = 6000*500;

  // const lineX = getCylinderEntity({
  //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  //   length,
  //   topRadius: width,
  //   bottomRadius: width,
  //   color: '#ff0000',
  //   position: new Cesium.Cartesian3(1, 0, 0)
  // })
  // viewer.entities.add(lineX)

  // const lineY = getCylinderEntity({
  //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  //   length,
  //   topRadius: width,
  //   bottomRadius: width,
  //   color: '#00ff00',
  //   position: new Cesium.Cartesian3(0, 1, 0)
  // })
  // viewer.entities.add(lineY)

  // const lineZ = getCylinderEntity({
  //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  //   length,
  //   topRadius: width,
  //   bottomRadius: width,
  //   color: '#0000ff',
  //   position: new Cesium.Cartesian3(0, 0, 1)
  // })
  // viewer.entities.add(lineZ)

  let xAxis = viewer.entities.add({
    name: 'X axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0.000001, 0, 0), new Cesium.Cartesian3(10000000, 0, 0)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(1.0, 0, 0, 0.2))
    }
  });

  let yAxis = viewer.entities.add({
    name: 'Y axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0, 0.000001, 0), new Cesium.Cartesian3(0, 10000000, 0)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 1, 0, 0.2))
    }
  });

  let zAxis = viewer.entities.add({
    name: 'Z axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0, 0, 0.000001), new Cesium.Cartesian3(0, 0, 10000000)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 0, 1, 0.2))
    }
  });
}


/**
 * 绑定在对象的坐标轴
 * @export
 * @class AxisByObject
 */
export class AxisByObject {
  /**
   * Creates an instance of AxisByObject.
   * @param {*} viewer
   * @param {Cesium.Entity|Cesium.Primitive} target 目标对象
   * @memberof AxisByObject
   */
  constructor(viewer, target, scale=1) {
    this.scale = scale;
    this.viewer = viewer;
    this.linePrimitives = []
    this.target = target;

    this._floow = false;
    this.init()
  }

  get floow() {
    return this._floow;
  }

  /**
   * 旋转跟随目标对象
   */
  set floow(v) {
    this._floow = v;
  }

  init() {
    const { viewer } = this;
    const length = 2000000 * this.scale;
    const width = 10000 * this.scale;

    const lineInfos = [
      {
        rotMatrix: new Cesium.Matrix3.fromRotationY(90 * Math.PI / 180),
        translate: { x: length / 2, y: 0, z: 0 },
        color: "#ff0000",
      },
      {
        rotMatrix: new Cesium.Matrix3.fromRotationX(90 * Math.PI / 180),
        translate: { x: 0, y: length / 2, z: 0 },
        color: "#00ff00",
      },
      {
        rotMatrix: new Cesium.Matrix3.fromRotationZ(90 * Math.PI / 180),
        translate: { x: 0, y: 0, z: length / 2 },
        color: "#0000ff",
      },
    ]

    for (let i = 0; i < lineInfos.length; i++) {
      const lineInfo = lineInfos[i];
      const { rotMatrix, translate, color } = lineInfo;

      const modelMatrix = Cesium.Matrix4.multiply(
        Cesium.Matrix4.IDENTITY,
        Cesium.Matrix4.fromRotationTranslation(rotMatrix, new Cesium.Cartesian3(translate.x, translate.y, translate.z)),
        new Cesium.Matrix4());

      const linePrimitive = getCylinderPrimitive({
        topRadius: width,
        bottomRadius: width,
        length,
        modelMatrix,
        color
      })
      this.linePrimitives.push(linePrimitive)
      viewer.scene.primitives.add(linePrimitive)
    }
  }

  update() {
    let modelMatrixTarget;
    if (this.target instanceof Cesium.Entity) {
      let orientation;
      if (this.target.orientation) {
        orientation = this.target.orientation._value;
      } else {
        const headingPitchRoll = new Cesium.HeadingPitchRoll(0, 0, 0);
        orientation = Cesium.Quaternion.fromHeadingPitchRoll(headingPitchRoll, new Cesium.Quaternion());
      }
      modelMatrixTarget = this.computeModelMatrix(orientation, this.target.position._value);
    }

    if (this.target instanceof Cesium.Primitive) {
      modelMatrixTarget = this.target.modelMatrix;
    }

    const translate = new Cesium.Cartesian3()
    Cesium.Matrix4.getTranslation(modelMatrixTarget, translate)

    const rotation = new Cesium.Cartesian3(1,0,0)
    if (this.floow) {
      Cesium.Matrix4.getRotation(modelMatrixTarget, rotation)
    } else {
      Cesium.Matrix4.getRotation(Cesium.Matrix4.IDENTITY, rotation)
    }

    for (let i = 0; i < this.linePrimitives.length; i++){
      const line = this.linePrimitives[i];

      Cesium.Matrix4.multiply(
        Cesium.Matrix4.IDENTITY,
        Cesium.Matrix4.fromRotationTranslation(rotation, new Cesium.Cartesian3(translate.x, translate.y, translate.z)),
        line.modelMatrix);
    }
  }

  computeModelMatrix(quaternion,position) {
    const modelMatrix = new Cesium.Matrix4();
    const rotationMat = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3())
    Cesium.Matrix4.fromRotationTranslation(rotationMat, position, modelMatrix)
    return modelMatrix;
  }
}


function axis(params) {
  let xAxis = viewer.entities.add({
    name: 'X axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0.000001, 0, 0), new Cesium.Cartesian3(10000000, 0, 0)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(1.0, 0, 0, 0.2))
    }
  });

  let yAxis = viewer.entities.add({
    name: 'Y axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0, 0.000001, 0), new Cesium.Cartesian3(0, 10000000, 0)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.GREEN),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 1, 0, 0.2))
    }
  });

  let zAxis = viewer.entities.add({
    name: 'Z axis',
    polyline: {
      positions: [new Cesium.Cartesian3(0, 0, 0.000001), new Cesium.Cartesian3(0, 0, 10000000)],
      width: 10,
      arcType: Cesium.ArcType.NONE,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.BLUE),
      depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(new Cesium.Color(0, 0, 1, 0.2))
    }
  });
}
