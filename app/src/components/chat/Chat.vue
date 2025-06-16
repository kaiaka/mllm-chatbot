<template>
    <div class="chat-wrapper">
        <TransitionGroup class="conversation" tag="div" ref="conversationContainer">
            <template  v-for="turn in sortedChatHistory" :key="turn.id">
                <div v-if="turn.text !== 'PROACTIVE' && turn.text !== 'RESPONSE_REACTION'"
                    :class="turn.interlocutor == Interlocutor.USER ? 'user' : 'gpt'">
                    <div class="bubble">
                        <p class="bubble__title" v-if="turn.interlocutor == Interlocutor.GPT">
                            eLLM
                        </p>
                        <p class="bubble__text">{{ turn.text}}</p>
                    </div>
                </div>
            </template>
            <div class="conversation__anchor" ref="conversationAnchor" :key="-1"></div>
        </TransitionGroup>

        <div :class="'input-container' + (conversationStore.curChatStatus == ChatStatus.WAITING ? ' disabled' : '')">
            <input type="text" placeholder="Ask me anything" ref="textInputField"
                :disabled="conversationStore.curChatStatus == ChatStatus.WAITING"
                v-model="userInputValue" @keyup.enter="handleEnterKey" @input="handleInput"/>
            <div class="buttons">
                <button class="btn-round-icon" @click="onSendBtn"
                    :disabled="conversationStore.curChatStatus == ChatStatus.WAITING">
                    <PaperAirplaneIcon class="icon" />
                </button>
            </div>
            <div class="spinner" v-if="conversationStore.curChatStatus != ChatStatus.READY">
                <font-awesome-icon class="icon" :icon="['fa', 'spinner']" />
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { computed, nextTick, ref, watch } from "vue";
    import { Interlocutor, ChatStatus } from "@/types/chat.types";
    import { useConversationStore } from "@/stores/conversation.store";
    import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'

    const emit = defineEmits(['send', 'received', 'triggerNVC', 'input']);

    const conversationStore = useConversationStore();
    const userInputValue = ref('');
    const conversationAnchor = ref<HTMLDivElement | null>();
    const textInputField = ref<HTMLInputElement | null>();
    const conversationContainer = ref<HTMLElement | null>(null);

    watch(() => conversationStore.curChatResponse, () => {
        // scroll div after relements changed
        nextTick(() => {
            // if(conversationAnchor.value) {
            //     conversationAnchor.value.scrollIntoView(
            //         { behavior: "smooth", block: "start", inline: "nearest" }
            //     );
            // }

            if (conversationContainer.value) {
                conversationContainer.value.scrollTop = conversationContainer.value.scrollHeight;
            }

            // focus input field
            if (textInputField.value) {
                textInputField.value.focus();
            }

            if(conversationStore.curChatResponse !== '') {
                emit('received', {message: conversationStore.curChatResponse})
            }
        })

    });


    const sortedChatHistory = computed(() => {
        return [...conversationStore.chatHistory].sort((a, b) => a.id - b.id);
    });

    // const scrollToBottom = () => {
    //     if (containerRef.value) {
    //         containerRef.value.scrollTop = containerRef.value.scrollHeight
    //     }
    // }
    
    const onSendBtn = () => {
        if (userInputValue.value !== "" && conversationStore.curChatStatus == ChatStatus.READY) {
            emit('send', {text: userInputValue.value})
            conversationStore.sendChatRequest(userInputValue.value);
            userInputValue.value = "";
            setTimeout(() => {
                textInputField.value?.focus()
            }, 0)
        }
    }

    function handleEnterKey(event:any) {
      if (event.keyCode === 13) {
            onSendBtn();
      }
    }

    function handleInput() {
        emit('input', {text: userInputValue.value})
    }


</script>


<style lang="scss" scoped>
    @use "./chat.scss";
</style>
