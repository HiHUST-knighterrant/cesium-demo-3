> https://www.saoniuhuo.com/article/detail-483380.html#1-%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BB%8E-viewer-%E8%AE%BF%E9%97%AE-entity-api
https://zhuanlan.zhihu.com/p/389962991


### entity 创建过程
以 `Plane` 举例。

#### 1 起点

从添加一个实体平面开始。
```js
const position = Cesium.Cartesian3.fromDegrees(0, 0, 0);
const redPlane = viewer.entities.add(new Cesium.Entity({
  name: "Red plane with black outline",
  position: position,
  plane: {
    plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
    dimensions: new Cesium.Cartesian2(4000000.0, 3000000.0),
    material: new Cesium.ImageMaterialProperty({
      image: "./res/pic/text.png"
    })
  },
}));
```

添加过程:
```js
// viewer.entities.add()
EntityCollection.add()
  fn fireChangedEvent()
    // 触发事件
    collection._collectionChanged.raiseEvent
```

#### entity 到 Primitive的 建立
1 PlaneGeometry 的建立

```js
[Module CesiumWidget.js]
- fn startRenderLoop {

  widget.render()
    CesiumWidget._clock.tick();
      Clock.tick()
        Clock.onTick.raiseEvent();

        [Module Viewer.js]
        Viewer._onTick()
          Viewer._dataSourceDisplay.update();

          [Module DataSourceDisplay.js]
          DataSourceDisplay.update()

          [Module GeometryVisualizer.js]
          GeometryVisualizer.update()
            GeometryVisualizer._insertUpdaterIntoBatch()
              // updater 是 PlaneGeometryUpdater
              GeometryVisualizer._openMaterialBatches[shadows].add(updater);

              [Module StaticGeometryPerMaterialBatch.js]
              StaticGeometryPerMaterialBatch.add()
                batch.add(time, updater);
                  Batch.geometry.set(id, updater.createFillGeometryInstance());

                    [Module PlaneGeometryUpdater.js]
                    PlaneGeometryUpdater.createFillGeometryInstance()
                      new PlaneGeometry()
            StaticGeometryPerMaterialBatch.update()
              Batch.update()
                new Primitive()
}
```

#### 2
Scene.js 模块内的 render 函数会将控制权交给 WebGL，执行 CesiumJS 自己封装的指令对象，画出每一帧来。

模块内的 render 函数首先会更新一批状态信息，譬如帧状态、雾效、Uniform 值、通道状态、三维场景中的环境信息等，然后就开始更新并执行指令，调用的是 Scene 原型链上的 updateAndExecuteCommands 方法。
```js
[Module CesiumWidget.js]
CesiumWidget.render()
  CesiumWidget._scene.render()
    fn tryAndCatchError()
      fn functionToExecute()
        fn render()

          [Module Scene]
          Scene.updateAndExecuteCommands()
            fn executeCommandsInViewport()
              fn updateAndRenderPrimitives()

                [Module PrimitiveCollection.js]
                PrimitiveCollection.update();
                  primitives[i].update(frameState);

                  [Module Primitive.js]
                    Primitive.update();
                    // 1)如果没有材质程序,则创建
                    fn createCommands
                    // 2) updateAndQueueCommandsFunc
                    fn updateAndQueueCommands();
                      // 为 commandList 赋值

```


####

```js
// https://segmentfault.com/a/1190000041685672?utm_source=sf-similar-article
// https://blog.csdn.net/u010447508/article/details/107469179

[Module Scene.js]
- fn render() {
  - Scene.updateAndExecuteCommands()
    - fn executeCommandsInViewport()
      - fn updateAndRenderPrimitives()

        - Scene._groundPrimitives.update();
          [Module PrimitiveCollection.js]
          - PrimitiveCollection.update();
            - primitives[i].update();
              [Module Primitive.js]
              Primitive.update();

        - Scene._primitives.update();
          [Module PrimitiveCollection.js]
          PrimitiveCollection.update();
            Primitive.update();
              fn loadSynchronous()
                PrimitivePipeline.combineGeometry();
                 fn geometryPipeline()
                  fn transformToWorldCoordinates()
}

```


#### 绘制
```js
executeCommandsInViewport
  fn executeCommands
```
