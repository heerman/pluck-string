/* global sampleRate */

class KarplusStrongProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{ name: "duration", defaultValue: 1, units: "seconds" }]
    }

    constructor() {
        super()
        this.elapsedTime = 0
        this.isBurstActive = true
    }

    process(inputs, outputs, parameters) {
        // karplus-strong is a noise burst into a feedback delay lpf
        const output = outputs[0]
        const duration = parameters.duration.length > 1 ? parameters.duration : parameters.duration[0]
        const sampleDuration = 1 / sampleRate

        // TODO implement the feedback delay lpf
        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                if (this.isBurstActive) {
                    const amplitude = 1 - (this.elapsedTime / duration)
                    channel[i] = (Math.random() * 2 - 1) * amplitude
                    this.elapsedTime += sampleDuration

                    if (this.elapsedTime >= duration) {
                        this.isBurstActive = false
                    }
                } else {
                    channel[i] = 0
                }
            }
        })

        return this.isBurstActive
    }
}

registerProcessor("karplus-strong", KarplusStrongProcessor)
