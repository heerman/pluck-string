/* global sampleRate */

class KarplusStrongProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{ name: "duration", defaultValue: 1, units: "seconds" }]
    }

    constructor() {
        super()
        this.elapsedTime = 0
        this.isBurstActive = true
        this.isActive = true
    }

    process(inputs, outputs, parameters) {
        // karplus-strong is a noise burst into a feedback delay lpf
        const output = outputs[0]
        const noiseDur = 0.2 // seconds
        const fullDur = 5 * noiseDur
        const sampleDur = 1 / sampleRate

        // TODO implement the feedback delay lpf
        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                if (this.isBurstActive) {
                    const maxAmp = 0.25
                    const ampEnv = 1 - (this.elapsedTime / noiseDur)
                    channel[i] =  maxAmp * ampEnv * (Math.random() * 2 - 1)

                    if (this.elapsedTime >= noiseDur) this.isBurstActive = false

                } else if (this.isActive) {
                    channel[i] =  0.1 * (Math.random() * 2 - 1)
                    if (this.elapsedTime >= fullDur) this.isActive = false

                } else {
                    channel[i] = 0
                }
                this.elapsedTime += sampleDur
            }
        })

        return this.isActive
    }
}

registerProcessor("karplus-strong", KarplusStrongProcessor)
