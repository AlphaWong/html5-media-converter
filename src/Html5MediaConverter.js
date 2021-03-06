"use strict";
var path_1 = require("path");
var VideoConverter_js_1 = require("./VideoConverter.js");
var presets_js_1 = require("./presets.js");
var stream_1 = require("stream");
var stream_mmmagic_1 = require("stream-mmmagic");
stream_mmmagic_1.default.config.magicFile = "(null)," + path_1.default.join(__dirname, '../misc/magic');
var _options = {
    programs: {
        // Path to the ffmpeg program
        ffmpeg: 'ffmpeg',
        // Path the the imagemagick convert program
        convert: 'convert'
    },
    videoFormats: ['mp4', 'ogv', 'webm'],
    imageFormats: ['jpeg']
};
var MediaConverter = (function () {
    function MediaConverter(options) {
        if (options === void 0) { options = _options; }
        this.videoConverter = new VideoConverter_js_1.default();
        this.videoConverter.setFfmpegPath(options.programs.ffmpeg);
    }
    MediaConverter.prototype.thumbs = function (size) {
        var input = new stream_1.default.PassThrough(), storedCallback;
        input.forEach = function (callback) {
            storedCallback = callback;
        };
        stream_mmmagic_1.default(input, function (err, mimeType, stream) {
            presets_js_1.default.convertersFor(mimeType.type).forEach(function (converter) {
                stream.converter = converter;
                stream.pipe(converter.toStream(size));
                storedCallback.call(stream, stream);
            });
        });
        return input;
    };
    MediaConverter.prototype.mp4Copy = function () {
        return presets_js_1.default.converters.mp4_copy.toStream();
    };
    return MediaConverter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MediaConverter;
//# sourceMappingURL=Html5MediaConverter.js.map