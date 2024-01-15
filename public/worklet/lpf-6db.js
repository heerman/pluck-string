/* global sampleRate */

class Lpf_6db extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{ 
                name: "frequency", defaultValue: 440, minValue: 0,
                maxValue: 0.5 * sampleRate, automationRate: "k-rate",
            }]
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]
        const output = outputs[0]
        const frequency = parameters.frequency[0] // const freq only, for now
            
        this.b1 = Math.exp(-2 * Math.PI * frequency / sampleRate)
        this.a0 = 1.0 - this.b1
        this.z1 = 0

        for (let channel = 0; channel < output.length; ++channel) {
            const inputChannel = input[channel]
            const outputChannel = output[channel]
            for (let i = 0; i < outputChannel.length; ++i) {
                this.z1 = inputChannel[i] * this.a0 + this.z1 * this.b1
                outputChannel[i] = this.z1
            }
        }

        return true
    }
}

registerProcessor("lpf-6db", Lpf_6db)
