// 外部モジュールの読み込み
import Vue, { VNode } from "vue";
import Test from "../vue/Optimization.vue";

// Vueインスタンスの作成
new Vue({
  el: "#app",
  render: (h): VNode => h(Test)
});
