"use strict";
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var process_streams_1 = require("process-streams");
var VideoConverter = (function () {
    function VideoConverter(options) {
        this.setFfmpegPath = fluent_ffmpeg_1.default.setFfmpegPath;
        this.options = options;
    }
    Object.defineProperty(VideoConverter.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (opt) {
            this._options = opt;
        },
        enumerable: true,
        configurable: true
    });
    VideoConverter.prototype.name = function () {
        return this.options.name;
    };
    VideoConverter.prototype.extName = function () {
        return this.options.ext;
    };
    VideoConverter.prototype.toStrean = function (size) {
        var _this = this;
        var self = this;
        var factory = process_streams_1.default.factory(false, !this.options.streamEncoding, function (input, output, callback) {
            var stream = _this, ffm = self.convert(input, size, output, callback)['start', 'progress', 'error'].forEach(function (event) {
                ffm.on(event, function () {
                    stream.emit.apply(stream, [event].concat(arguments));
                });
            });
        });
        factory.videoConverter = self;
        return factory;
    };
    VideoConverter.prototype.convert = function (input, size, output, callback) {
        var ffm = fluent_ffmpeg_1.default(input).outputOptions(options.args);
        ffm.on('start', function (commandLine) {
            console.warn('Spawned Ffmpeg with command: %o', commandLine);
        });
        if (size) {
            var match = size.match(/(\d+)x(\d+)/);
            if (match) {
                ffm.addOutputOptions('-vf', this.scale(match[1], match[2]));
            }
            else {
                throw new Error("Illegal size specification: " + size);
            }
        }
        ffm.output(output);
        ffm.on('error', function (error, stdout, stderr) {
            error.stderr = stderr;
            callback(error);
        });
        ffm.run();
        if (typeof (output) === 'string') {
            // If 'output' is a file, the callback must be called after ffmpeg has finished (only then is the file ready)
            ffm.on('end', function () {
                callback();
            });
        }
        else {
            callback();
        }
        return ffm;
    };
    VideoConverter.prototype.scale = function (width, height) {
        return "scale=iw*min(" + width + "/iw\\," + height + "/ih):ih*min(" + width + "/iw\\," + height + "/ih)";
    };
    return VideoConverter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoConverter;
//# sourceMappingURL=VideoConverter.js.map