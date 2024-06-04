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

        // initialize the delay buffer
        this.bufferSize = Math.floor(sampleRate / 55) // sampleRate / freq
        this.buffer = new Float32Array(this.bufferSize)
        this.writeIndex = 0
        this.readIndex = Math.floor(this.bufferSize / 4) // pitch is a combo of this and bufferSize

        // feedback parameters
        this.feedback = 0.99999 // best bewteen 0.99 and 0.99999
        this.damping = 0.995 // best between 0.990 and 0.999
        this.lastSample = 0
    }

    process(inputs, outputs, parameters) {
        // Karplus-Strong is a noise burst into a feedback delay LPF
        const output = outputs[0]
        const fullDur = 2 // TODO use parameter
        const noiseDur = 0.02 // best bewteen 0.01 and 0.10
        const sampleDur = 1 / sampleRate

        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                this.isBurstActive = this.elapsedTime < noiseDur
                this.isActive = this.elapsedTime < fullDur

                // generate noise
                const newNoise = this.isBurstActive ? 0.9 * (Math.random() * 2 - 1) : 0 // TODO max amp 0.9 ok?
                
                // delay w feedback + lpf
                const currDelaySample = this.buffer[this.readIndex]
                const currFeedbackLpfSample = this.damping * (this.lastSample + currDelaySample) / 2
                this.lastSample = currFeedbackLpfSample
                this.buffer[this.writeIndex] = newNoise + this.feedback * currFeedbackLpfSample

                // increment
                this.readIndex = (this.readIndex + 1) % this.bufferSize
                this.writeIndex = (this.writeIndex + 1) % this.bufferSize
                this.elapsedTime += sampleDur
                channel[i] = currFeedbackLpfSample // TODO use buffer[writeIndex] here?
            }
        })

        return this.isActive
    }
}

registerProcessor("karplus-strong", KarplusStrongProcessor)
