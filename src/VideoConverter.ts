import ffmpeg from 'fluent-ffmpeg'
import ps from 'process-streams'

export default class VideoConverter {
    private _options
    public setFfmpegPath = ffmpeg.setFfmpegPath

    set options(opt) {
        this._options = opt
    }

    get options() {
        return this._options
    }

    constructor(options) {
        this.options = options
    }

    name() {
        return this.options.name
    }

    extName() {
        return this.options.ext
    }

    toStrean(size) {
        let self = this
        let factory = ps.factory(false, !this.options.streamEncoding, (input, output, callback) => {
            let stream = this,
                ffm = self.convert(input, size, output, callback)
                ['start', 'progress', 'error'].forEach((event) => {
                    ffm.on(event, () => {
                        stream.emit.apply(stream, [event].concat(arguments))
                    })
                })
        })
        factory.videoConverter = self
        return factory;
    }
    convert(input, size, output, callback) {
        let ffm = ffmpeg(input).outputOptions(options.args);
        ffm.on('start', (commandLine) => {
            console.warn('Spawned Ffmpeg with command: %o', commandLine)
        })
        if (size) {
            var match = size.match(/(\d+)x(\d+)/);
            if (match) {
                ffm.addOutputOptions('-vf', this.scale(match[1], match[2]));
            } else {
                throw new Error(`Illegal size specification: ${size}`)
            }
        }
        ffm.output(output)
        ffm.on('error', (error, stdout, stderr) => {
            error.stderr = stderr
            callback(error)
        });
        ffm.run()
        if (typeof (output) === 'string') {
            // If 'output' is a file, the callback must be called after ffmpeg has finished (only then is the file ready)
            ffm.on('end', () => {
                callback()
            });
        } else {
            callback()
        }
        return ffm
    }
    scale(width, height): string {
        return "scale=iw*min(" + width + "/iw\\," + height + "/ih):ih*min(" + width + "/iw\\," + height + "/ih)"
    }
}