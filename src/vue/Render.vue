<script>
import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: [
    "options"
  ] /* chartDataプロパティはreactivePropによって自動的に定義される */,
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
};
</script>
