import React, { useCallback, useEffect, useState, useRef } from "react"
import { useAppSelector } from "../../app/hooks"
import { store } from "../../app/store"
import { selectIsVibrating, setIsVibrating } from "./vibratingStringSlice"
import "./VibratingString.css"

const VibratingString = () => {
    const VIBRATION_DUR_SEC = 2 // vibration duration
    const KARPLUS_STRONG_DELAY_SEC = 0.0125 // tunes the pitch and timbre

    const CANVAS_WIDTH = 420
    const CANVAS_HEIGHT = 250
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isVibrating = useAppSelector(selectIsVibrating)
    const [lineX, setLineX] = useState(3.14 * 2)

    // useCallback prevents unnecessary re-creations on render by memoizing functions

    // generate a realistic string tone using the karplus-strong algorithm
    const playAudio = useCallback(async () => {
        let audioContext = new window.AudioContext()
        await audioContext.audioWorklet.addModule("worklet/white-noise.js")
        await audioContext.audioWorklet.addModule("worklet/lpf-6db.js")

        // karplus-strong is a noise burst into a feedback delay lpf
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

        // connect the nodes
        whiteNoise.connect(ampEnv)
        ampEnv.connect(audioContext.destination)
        ampEnv.connect(delay)

        delay.connect(lpf)
        lpf.connect(feedbackNode)
        lpf.connect(audioContext.destination)
        feedbackNode.connect(delay)

        store.dispatch(setIsVibrating(true))
        setTimeout(() => store.dispatch(setIsVibrating(false)), 1000 * 0.9 * VIBRATION_DUR_SEC)
    }, [])

    // draw the string
    const drawVibratingString = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!ctx) return
    
        const amplitude = 45
        const yOffset = CANVAS_HEIGHT / 2
        const oscillation = yOffset + amplitude * Math.sin(lineX * 0.05)
    
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        ctx.beginPath()
    
        const startX = 0
        const startY = yOffset
        const endX = CANVAS_WIDTH
        const endY = yOffset
    
        // draw a quadratic curve with fixed ends, moving the center point
        ctx.moveTo(startX, startY)
        ctx.quadraticCurveTo(CANVAS_WIDTH / 2, oscillation, endX, endY)
    
        ctx.strokeStyle = "black"
        ctx.lineWidth = 5
        ctx.stroke()
    }, [lineX, CANVAS_WIDTH, CANVAS_HEIGHT])
    
    useEffect(() => {
        drawVibratingString()
    }, [drawVibratingString])
    
    useEffect(() => {
        if (isVibrating) {
            const animation = setInterval(() => {setLineX(lineX + 20)}, 50)
            return () => clearInterval(animation)
        }
    }, [lineX, isVibrating])

    return <>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="canvas" />
        <br />
        <button className="button" onClick={playAudio}>pluck string</button>
    </>
}

export default VibratingString
