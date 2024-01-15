import { useCallback } from "react"
import "./VibratingString.css"

const VibratingString = () => {
    const KARPLUS_STRONG_DELAY_SEC = 0.0125 // tunes the pitch and timbre
    
    // simulate a string sound using the karplus-strong algorithm
    const playAudio = useCallback(async () => {
        let audioContext = new window.AudioContext()
        await audioContext.audioWorklet.addModule("worklet/white-noise.js")
        await audioContext.audioWorklet.addModule("worklet/lpf-6db.js")

        const whiteNoise = new AudioWorkletNode(audioContext, "white-noise")
        const ampEnv = audioContext.createGain()
        const delay = audioContext.createDelay(KARPLUS_STRONG_DELAY_SEC)
        const lpf = new AudioWorkletNode(audioContext, "lpf-6db")
        const feedbackNode = audioContext.createGain()

        delay.delayTime.setValueAtTime(KARPLUS_STRONG_DELAY_SEC, audioContext.currentTime)

        const lpfFreqParam = lpf.parameters.get("frequency")
        lpfFreqParam && lpfFreqParam.setValueAtTime(10000, audioContext.currentTime)

        const gainParam = ampEnv.gain
        gainParam.setValueAtTime(1, audioContext.currentTime)
        gainParam.setValueAtTime(0, audioContext.currentTime + KARPLUS_STRONG_DELAY_SEC)

        const feedbackGainParam = feedbackNode.gain
        feedbackGainParam.setValueAtTime(0.95, audioContext.currentTime)

        // karplus-strong is a noise burst into a feedback delay lpf
        whiteNoise.connect(ampEnv)
        ampEnv.connect(audioContext.destination)
        ampEnv.connect(delay)

        delay.connect(lpf)
        lpf.connect(feedbackNode)
        lpf.connect(audioContext.destination)
        feedbackNode.connect(delay)
    }, [])

    return <>
        <button className="button" onClick={playAudio}>pluck string</button>
    </>
}

export default VibratingString
