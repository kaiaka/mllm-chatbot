<template>
    <div class="wrapper">
            
        <div class="main-container" ref="mainContainer" :style="'height: '+viewportHeight+'px'">
            <div class="topbar">
                <h1>Empathic LLM</h1>
                <button @click="toggleSettings" class="btn-round-icon">
                    <Cog6ToothIcon class="icon" v-show="!settingsVisible" />
                    <XCircleIcon class="icon" v-show="settingsVisible" />
                </button>
            </div>

            <Transition>
                <div class="settings" v-show="settingsVisible">
                    <!-- <input class="apikey-input" type="text" placeholder="Enter your OpenAI key"/> -->
                    <WebcamCapture >
                    </WebcamCapture>
                </div>
            </Transition>

            <div class="conv-container"  v-show="!settingsVisible">
                <Chat>
                </Chat>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
    import Chat from '@/components/chat/Chat.vue'
    import WebcamCapture from '@/components/webcamcapture/WebcamCapture.vue'
    import { XCircleIcon, Cog6ToothIcon } from '@heroicons/vue/24/solid'
    import { onMounted, ref, onUnmounted} from 'vue';

    const mainContainer = ref();
    const settingsVisible = ref(false);
    const viewportHeight = ref(window.innerHeight)

    onMounted(() => {
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateViewportHeight)
        }
    })

    onUnmounted(() => {
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', updateViewportHeight)
        }
    })

    const updateViewportHeight = () => {
        if (window.visualViewport) {
            viewportHeight.value = window.visualViewport.height
        }
    }

    const toggleSettings = () => {
        settingsVisible.value = !settingsVisible.value;
    };

</script>

<style lang="scss" scoped>

.wrapper {
    width: 100%;
    max-height: 100vh;
    max-height: 100dvh;
    max-height: -webkit-fill-available;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
}

.main-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    color: $fg-col;
    box-sizing: border-box;
    transition: height .4s ease-in-out;

    .settings {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        padding: 0 16px;

        .apikey-input {
            width: 100%;
            max-width: 400px;
        }
    }

    .topbar {
        width: 100%;
        height: 60px;
        flex: 0 0 60px; // Fixed size, won't grow or shrink
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;

        h1 {
            font-size: 1.6rem;
        }

    }

    .conv-container {
        width: 100%;
        max-width: 800px;
        flex: 1 1 0%; 
        min-height: 0; 
        overflow-y: auto;
        position: relative;
    }
}

</style>
