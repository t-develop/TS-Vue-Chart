<template>
  <div class="chartVue">
    <div>
      <span>母集団数:</span>
      <input v-model="population" />
    </div>
    <div>
      <span>変数数:</span>
      <input v-model="variable" />
    </div>
    <div>
      <span>最大世代数:</span>
      <input v-model="generation" />
    </div>
    <div>
      <span>交叉率:</span>
      <input v-model="crossOverRate" />
    </div>
    <div>
      <span>スケーリングファクター:</span>
      <input v-model="scallingFactor" />
    </div>
    <button v-on:click="optimize">Optimization</button>
    <input v-model="chartData" id="result" value hidden />
    <div>
      <p>最適化結果</p>
      <line-chart :chartData="chartData" :options="options" />
    </div>
    <div>
      <p>変数の相関関係</p>
      <line-chart :chartData="varChartData" :options="varOptions" />
    </div>
  </div>
</template>


<!-- lang="ts"でTypeScriptであることを指定 -->
<script lang="ts">
import Vue from "vue";
import Optimization from "../ts/OptimizationEngine";
import LineChart from "../vue/Render.vue"; // vue-chartjsの読み込み

const optimizationEngine = new Optimization();

export default Vue.extend({
  components: {
    LineChart
  },
  data: function() {
    return {
      population: 100,
      variable: 10,
      generation: 100,
      crossOverRate: 0.5,
      scallingFactor: 0.5,
      chartData: {},
      varChartData: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true
        }
      },
      varOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false
        }
      }
    };
  },
  methods: {
    optimize: function() {
      /* 最適化エンジンの実行 */
      const result = optimizationEngine.OptimizationStart(
        this.population,
        this.variable,
        this.generation,
        this.crossOverRate,
        this.scallingFactor
      );

      let labelArray: Array<string> = [];
      let dataArray: Array<number> = [];
      let varDataSet = [];

      for (let i = 0, len = result.length; i < len; i++) {
        labelArray.push(result[i].generation);
        dataArray.push(result[i].evaluationValue);
        varDataSet.push({
          data: result[i].variable,
          lineTension: 0,
          pointBackgroundColor:"rgba(255, 0, 0, 1)"
        });
      }

      let variableLabel: Array<string> = [];
      for (let i = 0, len = result[0].variable.length; i < len; i++) {
        variableLabel.push("var_" + String(i + 1));
      }

      this.chartData = {
        labels: labelArray,
        datasets: [
          {
            data: dataArray,
            label: "Optimization Result",
            borderWidth: 1,
            lineTension: 0
          }
        ]
      };

      this.varChartData = {
        labels: variableLabel,
        datasets: varDataSet
      };
    }
  }
});
</script>

<style scoped>
div {
  font-size: 1em;
  text-align: center;
}
</style>
