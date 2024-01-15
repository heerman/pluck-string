import React, { useCallback, useEffect, useState, useRef } from "react"
import { useAppSelector } from "../../app/hooks"
import { store } from "../../app/store"
import { selectIsVibrating, setIsVibrating } from "./vibratingStringSlice"
import "./VibratingString.css"

const VibratingString = () => {
    const VIBRATION_DUR_SEC = 2

    const CANVAS_WIDTH = 420
    const CANVAS_HEIGHT = 250
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isVibrating = useAppSelector(selectIsVibrating)
    const [lineX, setLineX] = useState(3.14 * 2)
    
    // generate a realistic string tone using the karplus-strong algorithm
    // useCallback prevents unnecessary re-creations on render by memoizing functions
    const playAudio = useCallback(async () => {
        let audioContext = new window.AudioContext()
        await audioContext.audioWorklet.addModule("worklet/karplus-strong.js")
    
        const ks = new AudioWorkletNode(audioContext, "karplus-strong")        
        const ksDurParam = ks.parameters.get("duration")
        ksDurParam && ksDurParam.setValueAtTime(VIBRATION_DUR_SEC, audioContext.currentTime)

        ks.connect(audioContext.destination)

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
