import { requestAnimFrame } from './animation';

var Clock = (function () {
  function Clock(callback, fps) {
    var _ = this;
    var now;
    var delta;
    var interval;
    var then = performance.now ? performance.now() : Date.now();

    var frames;
    var oldtime = 0;

    _.running = false;

    _.loop = function (time) {
      if (!_.running) return;

      requestAnimFrame(_.loop);

      interval = 1000 / (_.fps || fps || 60);
      now = performance.now ? performance.now() : Date.now();
      delta = now - then;

      if (delta > interval) {
        then = now - (delta % interval);
        frames = 1000 / (time - oldtime);
        oldtime = time;
        callback(frames, delta, now);
      }
    };
  }

  return Clock;
}());

Clock.prototype = {
  start: function () {
    this.running = true;
    this.loop();
    return this;
  },

  stop: function () {
    this.running = false;
    return this;
  }
}

export default Clock;
