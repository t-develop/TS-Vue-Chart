<template>
  <p>{{ greeting }} World!</p>
</template>

<!-- lang="ts"でTypeScriptであることを指定 -->
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data: () => {
    return {
      greeting: "Hello"
    };
  }
});
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
