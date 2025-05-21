import { nextTick, ref, reactive } from 'vue'
import { forEach, random } from 'lodash-es'
import useThree from './useThree'
import TWEEN from 'three/examples/jsm/libs/tween.module.js'
import * as THREE from 'three'
import WidgetLabel from '@/components/WidgetLabel.vue'

// 修改配置：将模型资源和位置调整为湿地监测相关
const CONFIG = {
  MODEL_SOURCES: {
    // 假设新资源地址（实际地址请替换）
    WETLAND: `${import.meta.env.VITE_API_DOMAIN}/models/wetland.glb`,
    PLANE: `${import.meta.env.VITE_API_DOMAIN}/models/plane.glb`,
    VEGETATION: `${import.meta.env.VITE_API_DOMAIN}/models/vegetation.glb`,
  },
  MODEL_SCALES: [0.001, 0.001, 0.001],
  // 这里的位置信息改为湿地场景中的关键监测点位置
  WETLAND_POSITION: {
    水质监测点: {
      LABEL: { x: 1.2, y: 1.5, z: 0.8 },
      COMPOSE: { x: 1000, y: 2000, z: 0 },
      DECOMPOSE: { x: 1000, y: 2100, z: 300 },
    },
    水位监测点: {
      LABEL: { x: 0.8, y: 1.3, z: 0.5 },
      COMPOSE: { x: 1500, y: 2500, z: 0 },
      DECOMPOSE: { x: 1500, y: 2600, z: 300 },
    },
    植被监测点: {
      LABEL: { x: 1.0, y: 1.7, z: 0.6 },
      COMPOSE: { x: 1200, y: 2400, z: 0 },
      DECOMPOSE: { x: 1200, y: 2300, z: 200 },
    },
    // 如有其他监测点，可继续添加……
  },
} as const

export function useWetland() {
  // 从 useThree 中获取 3D 场景相关的功能
  const {
    container,
    scene,
    camera,
    ocontrol,
    outlinePass,
    hexPass,
    loadGltf,
    loadAnimationMixer,
    loadCSS2DByVue,
    addModelPick,
    addModelHoverPick,
    addOutlineEffect,
    transitionAnimation,
    planeClippingAnimation,
  } = useThree()

  // 当前选中的监测点名称
  const current = ref('')

  // 是否正在执行动画（比如开场动画）
  const isAnimation = ref(false)

  // 用于存放所有标签的组
  const labelGroup = new THREE.Group()

  // 模型集合：这里用湿地模型替换设备模型
  const models = {
    wetland: null as any,
    plane: null as any,
    vegetation: null as any,
  }

  // 如果需要，可以保留其他数据（例如植被动画等）
  const vegetationData = {
    color: null as any,
    wireframe: null as any,
  }

  // 加载状态
  const loading = reactive({
    total: 2, // 全部需要加载的模型数量
    loaded: 0, // 已加载数量
    isLoading: true,
  })

  // 初始化湿地场景
  const boostrap = async () => {
    await loadModels()  // 加载湿地场景模型
    loadLights()        // 加载灯光
    await openingAnimation()  // 开场动画

    // 监测点点击拾取：选中后高亮显示，并更新当前监测点名称
    addModelPick(models.wetland, (intersects) => {
      if (intersects.length > 0) {
        const obj = intersects[0]['object']
        current.value = obj.name
        outlinePass.value!.selectedObjects = [obj]
      } else {
        current.value = ''
        outlinePass.value!.selectedObjects = []
      }
    })
    // 监测点悬浮拾取：悬停时改变高亮颜色
    addModelHoverPick(models.wetland, (intersects) => {
      if (intersects.length > 0) {
        const obj = intersects[0]['object']
        hexPass.value!.selectedObjects = [obj]
      } else {
        hexPass.value!.selectedObjects = []
      }
    })
  }

  // 加载湿地模型与植被模型
  const loadModels = async () => {
    const loadWetland = async () => {
      const gltf = await loadGltf(CONFIG.MODEL_SOURCES.WETLAND)
      const model = gltf.scene
      model.scale.set(...CONFIG.MODEL_SCALES)
      models.wetland = model
      loading.loaded += 1
      model.name = 'wetland'
      scene.value!.add(model)
    }
    const loadVegetation = async () => {
      const gltf = await loadGltf(CONFIG.MODEL_SOURCES.VEGETATION)
      const model = gltf.scene
      loadAnimationMixer(model, gltf.animations, gltf.animations[0].name)
      model.scale.set(...CONFIG.MODEL_SCALES)
      models.vegetation = model
      loading.loaded += 1
      model.name = 'vegetation'
      scene.value!.add(model)
      vegetationData.color = models.vegetation.getObjectByName('颜色材质')
      vegetationData.wireframe = models.vegetation.getObjectByName('线框材质')
    }
    await Promise.all([loadWetland(), loadVegetation()])
    loading.isLoading = false
    loading.loaded = 2
  }

  // 加载灯光：可以根据湿地场景需求调整灯光位置和强度
  const loadLights = () => {
    const LIGHT_LIST = [
      [0, 0, 0],
      [-100, 100, 100],
      [100, -100, 100],
      [100, 100, -100],
    ]
    forEach(LIGHT_LIST, ([x, y, z]) => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
      directionalLight.position.set(x, y, z)
      scene.value?.add(directionalLight)
    })
  }

  // 开场动画：例如镜头平移到湿地全景，并逐步展示监测点数据
  const openingAnimation = () => {
    return new Promise((resolve) => {
      isAnimation.value = true
      // 此处可添加湿地场景特有的动画，比如平移、旋转镜头
      transitionAnimation({
        from: camera.value!.position,
        to: { x: 1, y: 2.8, z: 1 },
        duration: 2000,
        easing: TWEEN.Easing.Quintic.InOut,
        onUpdate: ({ x, y, z }: any) => {
          camera.value!.position.set(x, y, z)
          ocontrol.value?.update()
        },
        onComplete() {
          isAnimation.value = false
          resolve(void 0)
        },
      }).start()
    })
  }

  // “分解”动画：在这里可以理解为展开湿地各监测点信息（例如传感器位置分离、显示数据标签）
  const wetlandDecomposeAnimation = () => {
    return new Promise((resolve) => {
      // 假设我们让湿地模型中的各个监测点逐渐“分离”，显示标签信息
      isAnimation.value = true
      // 隐藏原始植被颜色（如需）
      vegetationData.color.visible = false

      const from: any = {}
      const to: any = {}

      // 遍历湿地模型的子对象，假设每个子对象代表一个监测模块
      forEach(models.wetland.children, (mesh, index) => {
        const name = mesh.name as keyof typeof CONFIG.WETLAND_POSITION
        const decompose = CONFIG.WETLAND_POSITION[name]['DECOMPOSE']
        const compose = CONFIG.WETLAND_POSITION[name]['COMPOSE']
        from[`x${index}`] = compose.x
        from[`y${index}`] = compose.y
        from[`z${index}`] = compose.z
        to[`x${index}`] = decompose.x
        to[`y${index}`] = decompose.y
        to[`z${index}`] = decompose.z
      })

      const decomposeAnimate = transitionAnimation({
        from,
        to,
        duration: 2000,
        easing: TWEEN.Easing.Quintic.InOut,
        onUpdate(data) {
          forEach(models.wetland.children, (mesh, index) => {
            mesh.position.set(
              data[`x${index}`],
              data[`y${index}`],
              data[`z${index}`]
            )
          })
        },
        onComplete: () => {
          isAnimation.value = false
          createWetlandLabel()
          resolve(void 0)
        },
      })
      decomposeAnimate.start()
    })
  }

  // “组合”动画：合并各监测点信息，隐藏标签
  const wetlandComposeAnimation = () => {
    return new Promise((resolve) => {
      isAnimation.value = true
      removeWetlandLabel()

      const from: any = {}
      const to: any = {}

      forEach(models.wetland.children, (mesh, index) => {
        const name = mesh.name as keyof typeof CONFIG.WETLAND_POSITION
        const decompose = CONFIG.WETLAND_POSITION[name]['DECOMPOSE']
        const compose = CONFIG.WETLAND_POSITION[name]['COMPOSE']
        from[`x${index}`] = decompose.x
        from[`y${index}`] = decompose.y
        from[`z${index}`] = decompose.z
        to[`x${index}`] = compose.x
        to[`y${index}`] = compose.y
        to[`z${index}`] = compose.z
      })

      const composeAnimate = transitionAnimation({
        from,
        to,
        duration: 2000,
        easing: TWEEN.Easing.Quintic.InOut,
        onUpdate(data) {
          forEach(models.wetland.children, (mesh, index) => {
            mesh.position.set(
              data[`x${index}`],
              data[`y${index}`],
              data[`z${index}`]
            )
          })
        },
        onComplete: () => {
          isAnimation.value = false
          resolve(void 0)
        },
      })
      composeAnimate.start()
    })
  }

  // 生成湿地监测点标签（例如传感器信息）
  const createWetlandLabel = () => {
    forEach(CONFIG.WETLAND_POSITION, (point, name) => {
      const label = loadCSS2DByVue(WidgetLabel, { name })
      label.position.set(point.LABEL.x, point.LABEL.y, point.LABEL.z)
      labelGroup.add(label)
    })
    scene.value!.add(labelGroup)
  }

  // 移除湿地监测点标签
  const removeWetlandLabel = () => {
    while (labelGroup.children.length > 0) {
      const child: any = labelGroup.children[0]
      labelGroup.remove(child)
      child.geometry && child.geometry.dispose()
      child.material && child.material.dispose()
    }
    scene.value!.remove(labelGroup)
  }

  const warningTimer = ref()

  // 开始模拟湿地告警：例如随机高亮某个监测点，模拟数据异常
  const startWarning = () => {
    models.wetland.children.forEach((mesh: any) => {
      mesh.material = mesh.material.clone()
      mesh.hex = mesh.material.emissive.getHex()
    })

    const handle = () => {
      const currentIndex = random(0, models.wetland.children.length - 1)
      models.wetland.children.forEach((mesh: any, index: number) => {
        if (index === currentIndex) {
          mesh.material.emissive.setHex(0xff0000)
        } else {
          mesh.material.emissive.setHex(mesh.hex)
        }
      })
      transitionAnimation({
        from: camera.value!.position,
        to: { x: 1, y: 2.8, z: 0.5 },
        duration: 2000,
        easing: TWEEN.Easing.Linear.None,
        onUpdate(data) {
          camera.value!.position.set(data.x, data.y, data.z)
          ocontrol.value?.update()
        },
      }).start()
    }
    handle()
    warningTimer.value = setInterval(handle, 2000)
  }

  // 停止模拟湿地告警
  const stopWarning = () => {
    clearInterval(warningTimer.value)
    models.wetland.children.forEach((mesh: any) => {
      mesh.material.emissive.setHex(mesh.hex)
    })

    transitionAnimation({
      from: camera.value!.position,
      to: { x: 1, y: 2.8, z: 1 },
      duration: 2000,
      easing: TWEEN.Easing.Linear.None,
      onUpdate(data) {
        camera.value!.position.set(data.x, data.y, data.z)
        ocontrol.value?.update()
      },
    }).start()
  }

  nextTick(async () => {
    await boostrap()
  })

  return {
    container,
    loading,
    current,
    wetlandDecomposeAnimation,
    wetlandComposeAnimation,
    startWarning,
    stopWarning,
  }
}

export default useTurbine
