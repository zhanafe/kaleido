import * as PIXI from 'pixi.js';

const app = new PIXI.Application({
  antialias: true,
  resolution: window.devicePixelRatio,
});

app.renderer.autoResize = true;

let resizeTick = false;

function resizeCanvas() {
  if (!resizeTick) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    resizeTick = true;
    requestAnimationFrame(() => {
      app.renderer.resize(w, h);
      resizeTick = false;
    });
  }
}

function degToRad(degree) {
  return (degree * Math.PI) / 180;
}

resizeCanvas();
// window.addEventListener('resize', resizeCanvas);
document.body.appendChild(app.view);

(async function() {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    const video = document.createElement('video');
    video.autoplay = true;
    video.srcObject = mediaStream;

    const texture = PIXI.Texture.fromVideo(video);

    texture.baseTexture.on('loaded', baseTexture => {
      const aspectRatio = baseTexture.width / baseTexture.height;

      const triangle = new PIXI.Graphics();
      triangle.beginFill();
      if (aspectRatio > 1) {
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

          if (i % 2) {
            group.scale.y = -1;
            group.rotation = degToRad(60 * (i - 1));
          } else {
            group.rotation = degToRad(60 * i);
          }

          group.addChild(sprite, mask);
          mainGroup.addChild(group);
        }
      }

      mainGroup.pivot.set(
        triangle.width / 2,
        triangle.height * (Math.sqrt(3) / 6)
      );
      mainGroup.position.set(app.screen.width / 2, app.screen.height / 2);
      mainGroup.scale.set(0.5);
      app.stage.addChild(mainGroup);
    });
  } catch (error) {
    console.dir(error);
  }
})();
