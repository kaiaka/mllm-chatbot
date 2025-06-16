<template>
  <router-view />
</template>

<script setup lang="ts">
    import { useConversationStore } from './stores/conversation.store';
    const conversationStore = useConversationStore();
    conversationStore.init();
    //conversationStore.createDummyHistory();
</script>


<style lang="scss">
</style>
