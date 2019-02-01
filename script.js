var _slicedToArray = (function() {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
      for (
        var _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return function(arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    }
  };
})();
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
} // console.clear();
var ColorMapper = (function() {
  function ColorMapper(di, vid, cvs) {
    _classCallCheck(this, ColorMapper);
    this.di = di;
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d");
    this.vid = vid;
    this.rgb = new Array(di * di);
    this.report = document.querySelector("header");
    this.avgRGB = null;
    this.avgHSL = null;
    this._initialize();
  }
  _createClass(ColorMapper, [
    {
      key: "start",
      value: function start(stream) {
        try {
          this.vid.srcObject = stream;
        } catch (error) {
          console.log(error);
          this.vid.src = URL.createObjectURL(stream);
        }
        this.vid.play();
        var self = this;
        this.vid.onloadedmetadata = function() {
          self.w =
            (self.vid.videoWidth / self.vid.videoHeight) * self.cvs.width;
          self.vid.width = self.vid.videoWidth;
          self.vid.height = self.vid.videoHeight;
          self.offX = (self.w - self.cvs.width) * -0.5;
          self._animate();
        };
      }
    },
    {
      key: "_animate",
      value: function _animate() {
        window.requestAnimationFrame(this._animate.bind(this));
        this.ctx.drawImage(this.vid, this.offX, 0, this.w, this.di);
        this._processData();
      }
    },
    {
      key: "_initialize",
      value: function _initialize() {
        this.cvs.height = this.di;
        this.cvs.width = this.di;
      }
    },
    {
      key: "_processData",
      value: function _processData() {
        var imgData = this.ctx.getImageData(0, 0, this.di, this.di),
          data = imgData.data,
          len = data.length,
          avg = [0, 0, 0];
        for (var i = 0; i < len; i += 4) {
          var colorIdx = i * 0.25,
            newRgb = [data[i], data[i + 1], data[i + 2]],
            prevRgb = this.rgb[colorIdx],
            easeRgb = this._easeVals(prevRgb, newRgb);
          imgData.data[i + 0] = easeRgb[0];
          imgData.data[i + 1] = easeRgb[1];
          imgData.data[i + 2] = easeRgb[2];
          avg[0] += easeRgb[0];
          avg[1] += easeRgb[1];
          avg[2] += easeRgb[2];
          this.rgb[colorIdx] = easeRgb;
        }
        var colors = len * 0.25;
        avg[0] /= colors;
        avg[1] /= colors;
        avg[2] /= colors;
        this.avgRGB = avg;
        this.avgHSL = this._rgbToHsl(avg);
        document.body.style.backgroundColor =
          "rgb(" + avg.map(Math.round).join(",") + ")";
        this.ctx.putImageData(imgData, 0, 0);
        this.report.innerHTML =
          "\n      " + this._gradientSpan("h", this.avgHSL[0]) + "\n    ";
      }
    },
    {
      key: "_gradientSpan",
      value: function _gradientSpan(type, value) {
        var gradient = [];

        if (type === "h")
          for (var i = 0; i < 7; i++) {
            gradient.push("hsl(" + (i / 7) * 360 + ", 100%, 60%)");
          }
        else if (type === "s")
          for (var _i = 0; _i < 7; _i++) {
            gradient.push("hsl(0, " + (_i / 7) * 100 + "%, 60%)");
          }
        else if (type === "l")
          for (var _i2 = 0; _i2 < 7; _i2++) {
            gradient.push("hsl(0, 0%, " + (_i2 / 7) * 100 + "%)");
          }
        return (
          "\n      <div>\n        " +
          gradient
            .map(function(g) {
              return '<span style="background-color: ' + g + '"></span>';
            })
            .join("") +
          '\n        <span style="left: ' +
          value * 100 +
          '%"></span>\n      </div>\n    '
        );
      }
    },
    {
      key: "_easeVals",
      value: function _easeVals(prev, next) {
        var ease =
          arguments.length > 2 && arguments[2] !== undefined
            ? arguments[2]
            : 0.025;
        if (!prev) return next;
        return next.map(function(n, i) {
          return (n - prev[i]) * ease + prev[i];
        });
      }

      // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    },
    {
      key: "_rgbToHsl",
      value: function _rgbToHsl(rgb) {
        var _rgb = _slicedToArray(rgb, 3),
          r = _rgb[0],
          g = _rgb[1],
          b = _rgb[2];
        (r /= 255), (g /= 255), (b /= 255);
        var max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        var h = void 0,
          s = void 0,
          l = (max + min) / 2;

        if (max == min) h = s = 0;
        else {
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }

          h /= 6;
        }

        return [h, s, l];
      }
    }
  ]);
  return ColorMapper;
})();
var Score = (function() {
  function Score(map) {
    _classCallCheck(this, Score);
    this.map = map;
    this.noteIdx = 0;
    this.tick = 0;
    this._initialize();
  }
  _createClass(Score, [
    {
      key: "toggle",
      value: function toggle() {
        if (this.on) {
          this.on = false;
          Tone.Transport.stop();
          this.tick = 0;
          this.synth.triggerRelease();
          this.mid.triggerRelease();
          this.bass1.triggerRelease();
          this.bass2.triggerRelease();
          document.querySelector("button").classList.remove("active");
        } else {
          this.on = true;
          Tone.Transport.start();
          document.querySelector("button").classList.add("active");
        }
      }
    },
    {
      key: "step",
      value: function step(time) {
        var hsl = this.map.avgHSL,
          safe = function safe(i) {
            return Math.max(0, i - 0.000000001);
          };
        if (!hsl || !this.on) return;
        if (this.tick % 4 === 0) {
          this.noteIdx = Math.floor(safe(hsl[0]) * 7);
          this.hsl = hsl;
        }
        var note = this.note,
          pattern = [2, 0, 1, 0, 2, 1, 2, 0],
          octaves = [5, 5, 4, 4, 4, 5, 4, 4],
          arpNote = note[pattern[this.tick % 8]],
          arpOct = octaves[this.tick % 8];
        arpOct += arpNote[1];
        var arp = "" + arpNote[0] + arpOct;
        var mtd = this.tick === 0 ? "triggerAttack" : "setNote";
        this.synth[mtd](arp, time);
        if (this.tick % 4 === 0) {
          var bass1 = note[0],
            bass2 = note[2],
            mid = note[1];
          this.mid[mtd](mid[0] + (mid[1] + 3), time);
          this.bass1[mtd](bass1[0] + (bass1[1] + 1), time);
          this.bass2[mtd](bass2[0] + (bass2[1] + 1), time);
        }
        this.tick++;
      }
    },
    {
      key: "_initialize",
      value: function _initialize() {
        var _this = this;
        this.synth = new Tone.Synth({
          portamento: 0.00625,
          oscillator: { type: "sine" },
          envelope: { release: 0.07 }
        });

        this.mid = new Tone.Synth({
          portamento: 0.00625,
          oscillator: { type: "triangle" },
          envelope: { release: 0.07 }
        });

        this.bass1 = new Tone.FMSynth({
          portamento: 0.0125
        });

        this.bass2 = new Tone.FMSynth({
          portamento: 0.0125
        });

        var gain1 = new Tone.Gain(0.4),
          gain2 = new Tone.Gain(0.5),
          pan1 = new Tone.Panner(-1),
          pan2 = new Tone.Panner(1);
        this.synth.connect(gain1);
        this.mid.connect(gain1);
        pan1.connect(gain2);
        pan2.connect(gain2);
        this.bass1.connect(pan1);
        this.bass2.connect(pan2);
        gain1.toMaster();
        gain2.toMaster();
        Tone.Transport.scheduleRepeat(function(time) {
          _this.step(time);
        }, "16n");
        Tone.Transport.bpm.value = 120;
      }
    },
    {
      key: "note",
      get: function get() {
        return this.notes[this.noteIdx];
      }
    },
    {
      key: "notes",
      get: function get() {
        return [
          [["G", 0], ["A#", 0], ["C#", 1]],
          [["A#", 0], ["C#", 1], ["F", 1]],
          [["C#", 1], ["F", 1], ["G#", 1]],
          [["F", 1], ["G#", 1], ["C", 2]],
          [["D#", 1], ["G", 1], ["A#", 1]],
          [["C", 1], ["D#", 1], ["G", 1]],
          [["G#", 0], ["C", 1], ["D#", 1]]
        ]; // return [
        //   [['G',  0], ['A#', 0], ['C#', 1]],
        //   [['G#', 0], ['C',  1], ['D#', 1]],
        //   [['A#', 0], ['C#', 1], ['F',  1]],
        //   [['C',  1], ['D#', 1], ['G',  1]],
        //   [['C#', 1], ['F',  1], ['G#', 1]],
        //   [['D#', 1], ['G',  1], ['A#', 1]],
        //   [['F',  1], ['G#', 1], ['C',  2]],
        // ];
      }
    }
  ]);
  return Score;
})();
var vid = document.querySelector("video"),
  cvs = document.querySelector("canvas"),
  map = new ColorMapper(4, vid, cvs),
  score = new Score(map);
navigator.mediaDevices
  .getUserMedia({ audio: false, video: true })
  .then(function(stream) {
    map.start(stream);
    document.querySelector("button").addEventListener("click", function() {
      return score.toggle();
    });
  })
  .catch(function(err) {
    if (window.location.href.match("debug")) {
      alert(
        "Sorry. This wont work on your browser or device. Update or use Chrome/Firefox."
      );
    } else {
      document.querySelector("div.trydebug").classList.remove("hide");
    }
  });

StartAudioContext(Tone.context, "#button");
