import _ from 'underscore'
import path from 'path'
import VideoConverter from './VideoConverter.js'
import presets from './presets.js'
import Stream from 'stream'
import magic from 'stream-mmmagic'

magic.config.magicFile = `(null),${path.join(__dirname, '../misc/magic')}`

const _options = {
    programs: {
        // Path to the ffmpeg program
        ffmpeg: 'ffmpeg',
        // Path the the imagemagick convert program
        convert: 'convert'
    },
    videoFormats: ['mp4', 'ogv', 'webm'],
    imageFormats: ['jpeg']
}

export default class MediaConverter {
    private videoConverter = new VideoConverter()
    constructor(options = _options) {
        this.videoConverter.setFfmpegPath(options.programs.ffmpeg)
    }

    public thumbs(size) {
        let input = new Stream.PassThrough(),
            storedCallback
        input.forEach = (callback) => {
            storedCallback = callback
        }
        magic(input, (err, mimeType, stream) => {
            presets.convertersFor(mimeType.type).forEach((converter) => {
                stream.converter = converter;
                stream.pipe(converter.toStream(size));
                storedCallback.call(stream, stream);
            })
        })
        return input
    }
    public mp4Copy(){
        return presets.converters.mp4_copy.toStream()
    }
}