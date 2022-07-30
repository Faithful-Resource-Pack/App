function animate(mcmeta, canvasId, imageURL) {
  if (mcmeta === null || Object.keys(mcmeta).length === 0) return;

  const tick = Math.max(mcmeta.animation.frametime || 1, 1);
  const frames = [];

  let interval;

  const canvas = document.getElementById(canvasId);
  const context = canvas.getContext("2d");

  canvas.style.width = "100%";
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetWidth;

  const image = new Image();
  image.src = imageURL;

  image.onload = () => {
    if (mcmeta.animation.frames && mcmeta.animation.frames.length > 0) {
      interval =
        mcmeta.animation.interpolate ||
        mcmeta.animation.frames.find(
          (e) => typeof e === "object" && e.time % tick !== 0
        )
          ? 1
          : tick;

      for (let e = 0; e < mcmeta.animation.frames.length; e++) {
        const a = mcmeta.animation.frames[e];
        if (typeof a === "object")
          frames.push({
            index: a.index,
            duration: Math.max(a.time, 1) / interval,
          });
        else
          frames.push({
            index: a,
            duration: tick / interval,
          });
      }
    } else {
      interval = mcmeta.animation.interpolate ? 1 : tick;
      const e = image.height / image.width;
      for (let a = 0; a < e; a++)
        frames.push({ index: a, duration: tick / interval });
    }

    const draw = (frame = 0, ticks = 0) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1;
      context.imageSmoothingEnabled = false;
      context.drawImage(
        image,
        0,
        image.width * frames[frame].index,
        image.width,
        image.width,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (mcmeta.animation.interpolate) {
        context.globalAlpha = ticks / frames[frame].duration;
        context.drawImage(
          image,
          0,
          image.width * frames[(frame + 1) % frames.length].index,
          image.width,
          image.width,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    };

    let ticks = 0;
    let currentFrame = 0;
    const update = () => {
      ticks++;

      if (frames[currentFrame].duration <= ticks) {
        ticks = 0;
        currentFrame++;
        if (currentFrame >= frames.length) currentFrame = 0;
        draw(currentFrame);
      } else if (mcmeta.animation.interpolate) draw(currentFrame, ticks);
    };

    setInterval(() => {
      update();
    }, interval * 50);
  };

  image.onerror = () => {
    canvas.remove();
  };
}
