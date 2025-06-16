<template>
    <div class="webcam-capture">
        <div class="controls">
            <button class="btn" @click="startWebcam" :disabled="isStreaming">Start Cam</button>
            <button class="btn" @click="stopWebcam" :disabled="!isStreaming">Stop Cam</button>
        </div>

        <div v-if="error" class="error">
            {{ error }}
        </div>

        <div class="video-container">
            <video ref="video" autoplay playsinline @loadedmetadata="onLoadedVideoMetaData">
            </video>
            
            <canvas 
                ref="canvas" 
                :width="FRAME_W" 
                :height="FRAME_H" 
                style="display:none;">
            </canvas>

            <canvas 
                ref="canvasBuffer" 
                class="canvas-buffer"
                :width="FRAME_W * CAPTURE_COLS" 
                :height="FRAME_H * CAPTURE_ROWS" >
            </canvas>
        </div>
    </div>
</template>



<script setup lang="ts">
    import { ref, onUnmounted } from 'vue'
    import { useConversationStore } from "@/stores/conversation.store";

    const CAPTURE_INTERVAL = 200
    const CAPTURE_COLS = 5
    const CAPTURE_ROWS = 4
    const MAX_FRAMES = CAPTURE_ROWS * CAPTURE_COLS
    const FRAME_W = 90
    const FRAME_H = 120

    const video = ref<HTMLVideoElement | undefined>(undefined)
    const canvas = ref<HTMLCanvasElement | undefined>(undefined)
    const canvasBuffer = ref<HTMLCanvasElement | undefined>(undefined)
    const stream = ref<MediaStream | null>(null)
    const isStreaming = ref(false)
    const error = ref("")
    let captureInterval: ReturnType<typeof setInterval> | null = null;

    const frameBuffer =  ref<ImageData[]>([])
    const frameBufferBool = ref<Boolean[]>([])
    const conversationStore = useConversationStore();

    onUnmounted(() => {
        stopWebcam()
        stopCapturing()
    })

    const onLoadedVideoMetaData = () => {
        if (video.value) {
            video.value.play()
        }
    }

    const startWebcam = async () => {
        try {
            stream.value = await navigator.mediaDevices.getUserMedia({
                video: {  
                    width: { ideal: 240 },    
                    height: { ideal: 320 },   
                    facingMode: 'user',             // 'user' for front camera, 'environment' for back camera
                    aspectRatio: { ideal: 0.75 },
                    frameRate: { ideal: 30 }
                }
            })

            if (video.value) {
                video.value.srcObject = stream.value
                isStreaming.value = true
                error.value = ""
                startCapturing()
            }
        } catch (err: any) {
            error.value = 'Error accessing webcam: ' + err.message
            console.error('Error accessing webcam:', err)
        }
    }

    const stopWebcam = () => {
        stopCapturing();
        if (stream.value && video.value) {
            stream.value.getTracks().forEach(track => track.stop())
            stream.value = null
            isStreaming.value = false
            video.value.srcObject = null
        }
    }

    const captureFrame = () => {
        if (!canvas.value || !video.value || !isStreaming.value) return

        const ctx = canvas.value.getContext('2d')
        const w = FRAME_W
        const h = FRAME_H
        canvas.value.width = w
        canvas.value.height = h

        // draw current frame
        if (ctx) {
            ctx.save();
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
        
            // get frame as data URL
            //const frameData = canvas.value.toDataURL('image/jpeg')
            const imageData = ctx.getImageData(0, 0, w, h);

            frameBuffer.value.push(imageData);
            if (frameBuffer.value.length > MAX_FRAMES) {
                frameBuffer.value.shift();
            }
            frameBufferBool.value.push(true);
            if (frameBufferBool.value.length > MAX_FRAMES) {
                frameBufferBool.value.shift();
            }

            if (canvasBuffer.value) {

                // draw buffer grid
                const gridCtx = canvasBuffer.value.getContext('2d')
                if (gridCtx) {
                    const gridW = w * CAPTURE_COLS
                    const gridH = h * CAPTURE_ROWS
                    canvasBuffer.value.width = gridW
                    canvasBuffer.value.height = gridH
                    gridCtx.save();
                    gridCtx.clearRect(0, 0, gridW, gridH);
                    gridCtx.fillStyle = '#000000';
                    gridCtx.fillRect(0, 0, gridW, gridH);
                    
                    frameBuffer.value.forEach((f, i) => {
                        const col = i % CAPTURE_COLS;
                        const row = Math.floor(i / CAPTURE_COLS);
                        // console.log(`index: ${i} .... col ${col} ... row ${row} ... w ${w} x h ${h}`)
                        gridCtx.putImageData(f, col * w, row * h);
                    });

                    // update store, once buffer is filled (OR directly also when buffer is not filleD?)
                    if (frameBuffer.value.length >= MAX_FRAMES || frameBuffer.value.length > 0) {
                        const faceVisible = frameBufferBool.value.includes(true)
                        const b64 = canvasBuffer.value.toDataURL('image/jpeg');
                        conversationStore.setCurrentFaceImage(b64, faceVisible);
                    }
                }
            }
        }
    }

    const startCapturing = () => {
        stopCapturing()
        captureInterval = setInterval(captureFrame, CAPTURE_INTERVAL)
    }

    const stopCapturing = () => {
        if (captureInterval) {
            clearInterval(captureInterval)
            captureInterval = null
        }
    }
</script>



<style lang="scss" scoped>
  @use "./webcamCapture.scss";
</style>
