import { defineStore } from 'pinia'
import type {ChatTurn } from "@/types/chat.types";
import { ChatStatus, Interlocutor } from "@/types/chat.types";
import { reactive, ref } from 'vue';
import OpenAI from 'openai/index.mjs';
import { prompts } from '@/config/prompts';


export const useConversationStore = defineStore('conversation', () => {

    const chatHistory: ChatTurn[] = reactive([]);
    const curChatRequest = ref('');
    const curChatResponse = ref('');
    const curChatStatus = ref(ChatStatus.READY);

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // only for development
    });

    const curBase64image = ref('');
    const curBase64imageFaceVisible = ref(false);

    function init() {
    }

    async function clearChatHistory() {
        chatHistory.length = 0
    }


    async function sendChatRequest(requestText: string, addImage: boolean = true) {

        // update user request
        const msg = requestText.trim();
        curChatRequest.value = msg;
        chatHistory.push({
            id: chatHistory.length,
            interlocutor: Interlocutor.USER,
            text: curChatRequest.value
        });

        // clear current response
        curChatResponse.value = '';

        // server request
        curChatStatus.value = ChatStatus.WAITING
        try {

            // analyze image
            let ferResponse = ""
            if (addImage && curBase64image.value != "") {
                const ferMessage: any[] = [
                    {
                        role: 'system',
                        content: prompts.ferInterpreter
                    }, 
                    {
                        role: 'user',
                        content: [
                        //   { type: 'text', text: 'What's in this image?' },
                          {
                            type: 'image_url',
                            image_url: {
                                url: curBase64image.value
                            }
                          }
                        ]
                    }
                ]

                const ferCompletion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: ferMessage
                });

                ferResponse = ferCompletion.choices[0].message.content || ''
            }


            // ------------------------------------


            // create chat history for OpenAI's completion API (we always send the whole story)
            const convHistory = chatHistory.map(msg => ({
                role: msg.interlocutor === Interlocutor.USER ? 'user' : 'assistant',
                content: msg.text
            }))

            // add fer analysis to last message
            if (convHistory.length > 0) {
                convHistory[convHistory.length - 1].content += (ferResponse != ""  ? "<nonverbalAnalysis>"+ferResponse+"</nonverbalAnalysis>" : "")
            }

            // add system prompt
            const completionMessages: any[] = [
                {
                    role: 'system',
                    content: prompts.empathicAssistant
                }, 
                ...convHistory
            ]

            // send request 
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: completionMessages
            });

            // handle response
            curChatResponse.value = completion.choices[0].message.content || ''
            curChatStatus.value = ChatStatus.READY

            // update history
            chatHistory.push({
                id: chatHistory.length,
                interlocutor: Interlocutor.GPT,
                text: curChatResponse.value
            });

        } catch (error) {
            curChatResponse.value = 'Error';
            curChatStatus.value = ChatStatus.READY;
        }
    }
    
    const setCurrentFaceImage = (base64img: string, faceVisible: boolean) => {
        curBase64image.value = base64img;
        curBase64imageFaceVisible.value = faceVisible;
    }

    const createDummyHistory = () => {
        clearChatHistory()
        const dummyMessages: ChatTurn[] = [
            {
                id: 0,
                interlocutor: Interlocutor.USER,
                text: "Hi"
            },
            {
                id: 1,
                interlocutor: Interlocutor.GPT,
                text: "Hey, you look sad. What's on your mind?"
            },
            {
                id: 2,
                interlocutor: Interlocutor.USER,
                text: "Work has been really stressful, and I feel like I can't keep up with everything."
            },
            {
                id: 3,
                interlocutor: Interlocutor.GPT,
                text: "That sounds really challenging. Can you tell me more about what aspects of work are feeling particularly stressful for you?"
            },
            {
                id: 4,
                interlocutor: Interlocutor.USER,
                text: "There's just so many deadlines, and I feel like I'm always behind."
            },
            {
                id: 5,
                interlocutor: Interlocutor.GPT,
                text: "I see how much pressure you're under. Have you been able to take time for yourself lately?"
            },
            {
                id: 6,
                interlocutor: Interlocutor.USER,
                text: "Not really. I feel guilty whenever I'm not working."
            },
            {
                id: 7,
                interlocutor: Interlocutor.GPT,
                text: "Taking breaks is essential for our wellbeing, and you deserve that time to recharge. The guilt you're feeling is understandable, but rest isn't a luxury - it's necessary for sustainable performance and mental health. What's one small way you could show yourself some kindness today?"
            },
            {
                id: 8,
                interlocutor: Interlocutor.USER,
                text: "Maybe I could take a short walk during lunch tomorrow. I usually work through it."
            },
            {
                id: 9,
                interlocutor: Interlocutor.GPT,
                text: "That's a wonderful idea! A lunch break walk can help clear your mind and give you some needed space to breathe. Small steps like this can make a big difference. How are you feeling about trying that tomorrow?"
            }
        ];

        chatHistory.push(...dummyMessages);
    }


    return {
        init,
        sendChatRequest,
        clearChatHistory,
        setCurrentFaceImage,
        createDummyHistory,
        curChatStatus,
        curChatResponse,
        chatHistory
    }
})
