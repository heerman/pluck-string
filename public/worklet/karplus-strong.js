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
        this.writeIndex = 10000 // this is related to the delay time (and pitch)
        this.readIndex = 0

        // Feedback parameters
        this.feedback = 0.99
        this.damping = 0.5 // low-pass filter damping factor
        this.lastSample = 0
    }

    process(inputs, outputs, parameters) {
        // karplus-strong is a noise burst into a feedback delay lpf
        const output = outputs[0]
        const fullDur = 2
        const noiseDur = 0.1 // seconds
        const sampleDur = 1 / sampleRate

        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                this.isBurstActive = this.elapsedTime < noiseDur
                this.isActive = this.elapsedTime < fullDur

                // generate noise
                const newNoise = 0.25 * (1 - (this.elapsedTime / noiseDur)) * (Math.random() * 2 - 1)
                const currNoiseSample = this.isBurstActive ? newNoise : 0
                
                // delay w feedback + lpf
                const currDelaySample = this.buffer[this.readIndex]
                const currFeedbackLpfSample = this.damping * (this.lastSample + currDelaySample) / 2
                this.lastSample = currFeedbackLpfSample
                this.buffer[this.writeIndex] = currNoiseSample + currFeedbackLpfSample // TODO is amplitude less than 1?

                // increment
                this.readIndex = (this.readIndex + 1) % this.bufferSize
                this.writeIndex = (this.writeIndex + 1) % this.bufferSize
                this.elapsedTime += sampleDur
                channel[i] = this.buffer[this.readIndex]
            }
        })

        return this.isActive
    }
}

registerProcessor("karplus-strong", KarplusStrongProcessor)
