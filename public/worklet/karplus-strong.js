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

        // Initialize the delay buffer
        this.bufferSize = sampleRate * 0.5
        this.buffer = new Float32Array(this.bufferSize)
        this.writeIndex = 7000 // this is related to the delay time (and pitch)
        this.readIndex = 0
    }

    process(inputs, outputs, parameters) {
        // karplus-strong is a noise burst into a feedback delay lpf
        const output = outputs[0]
        const noiseDur = 0.2 // seconds
        const fullDur = 10 * noiseDur
        const sampleDur = 1 / sampleRate

        // TODO implement the feedback delay lpf
        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                let currNoiseSample = 0
                if (this.isBurstActive) {
                    const maxAmp = 0.25
                    const ampEnv = 1 - (this.elapsedTime / noiseDur)
                    currNoiseSample =  maxAmp * ampEnv * (Math.random() * 2 - 1)

                    if (this.elapsedTime >= noiseDur) this.isBurstActive = false                    
                }
                                
                let currDelaySample = this.buffer[this.readIndex]
                this.readIndex = (this.readIndex + 1) % this.bufferSize

                if (this.isActive) {    
                    this.buffer[this.writeIndex] = currNoiseSample + currDelaySample
                    this.writeIndex = (this.writeIndex + 1) % this.bufferSize

                    if (this.elapsedTime >= fullDur) this.isActive = false                    
                } else {
                    currDelaySample = 0
                }

                channel[i] = this.buffer[this.readIndex]
                this.elapsedTime += sampleDur
            }
        })

        return this.isActive
    }
}

registerProcessor("karplus-strong", KarplusStrongProcessor)
