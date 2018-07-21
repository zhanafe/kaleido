import * as PIXI from 'pixi.js';

const splashScreen = document.getElementById('splashScreen');
const launchBtn = document.getElementById('launchBtn');
const downloadBtn = document.getElementById('downloadBtn');
let resizeTick = false;

function degToRad(degree) {
  return (degree * Math.PI) / 180;
}

async function launch() {
  launchBtn.removeEventListener('click', launch);

  const app = new PIXI.Application({
    preserveDrawingBuffer: true,
    antialias: true,
    resolution: window.devicePixelRatio,
  });

  app.renderer.autoResize = true;

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });

    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = mediaStream;

    const texture = PIXI.Texture.fromVideo(video);

    texture.baseTexture.on('loaded', baseTexture => {
      const textureAspectRatio = baseTexture.width / baseTexture.height;

      const triangle = new PIXI.Graphics();
      triangle.beginFill();
      if (textureAspectRatio > 1) {
        triangle.drawPolygon([
          0,
          0,
          (baseTexture.height / Math.sqrt(3)) * 2,
          0,
          baseTexture.height / Math.sqrt(3),
          baseTexture.height,
        ]);
      } else {
        triangle.drawPolygon([
          0,
          0,
          baseTexture.width,
          0,
          baseTexture.width / 2,
          (baseTexture.width / 2) * Math.sqrt(3),
        ]);
      }
      triangle.endFill();

      const mainGroup = new PIXI.Container();

      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 6; i++) {
          const mask = triangle.clone();
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.position.set(mask.width / 2, mask.height / 2);
          sprite.mask = mask;

          const group = new PIXI.Container();

          if (i % 2) {
            group.scale.y = -1;
            group.rotation = degToRad(60 * (i - 1));
          } else {
            group.rotation = degToRad(60 * i);
          }

          switch (j) {
            case 1:
              group.pivot.set(mask.width, 0);
              group.position.set(mask.width, 0);
              break;
            case 2:
              group.pivot.set(mask.width / 2, mask.height);
              group.position.set(mask.width / 2, mask.height);
              break;
          }

          group.addChild(sprite, mask);
          mainGroup.addChild(group);
        }
      }

      mainGroup.pivot.set(
        triangle.width / 2,
        triangle.height * (Math.sqrt(3) / 6)
      );

      app.stage.addChild(mainGroup);

      const mainGroupWidth = mainGroup.width;
      const mainGroupHeight = mainGroup.height;

      function resizeCanvas() {
        if (!resizeTick) {
          resizeTick = true;
          const innerWidth = window.innerWidth;
          const innerHeight = window.innerHeight;
          const screenAspectRatio = innerWidth / innerHeight;

          requestAnimationFrame(() => {
            app.renderer.resize(innerWidth, innerHeight);
            mainGroup.position.set(app.screen.width / 2, app.screen.height / 2);
            if (screenAspectRatio > 1) {
              mainGroup.scale.set((innerWidth / mainGroupWidth) * 1.7);
            } else {
              mainGroup.scale.set((innerHeight / mainGroupHeight) * 1.4);
            }
            resizeTick = false;
          });
        }
      }

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.setAttribute('href', app.renderer.extract.base64(app.stage));
        link.setAttribute('download', `screenshot-${Date.now()}.png`);
        link.click();
      });

      downloadBtn.classList.remove('hidden');

      splashScreen.parentNode.replaceChild(app.view, splashScreen);
    });
  } catch (error) {
    console.dir(error);
    alert("I can't launch without camera @@");
  }
}

launchBtn.addEventListener('click', launch);
