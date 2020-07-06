import Population from "./Population";
import TestFunctions from "./TestFunctions";
import IResult from "./IResult";

export default class OptimizationEngine {
  public OptimizationStart(
    popSize: number,
    varSize: number,
    maxGen: number,
    crossRate: number,
    scalling: number
  ): Array<IResult> {
    let populationSize = popSize;
    let variableSize = varSize;
    let maxGeneration = maxGen;
    console.log("最適化開始");
    const result = this.DifferentialEvolution(
      populationSize,
      variableSize,
      maxGeneration,
      crossRate,
      scalling
    );
    console.log("最適化終了");
    return result;
  }

  private DifferentialEvolution(
    init_popSize: number,
    init_varSIze: number,
    init_generation: number,
    init_crossRate: number,
    init_scallingFactor: number
  ): Array<IResult> {
    const popSize = init_popSize;
    const varSize = init_varSIze;
    const maxGeneration = init_generation;
    const cr = init_crossRate;
    let scallingFactor = init_scallingFactor;
    const lowerBound = -5.2;
    const upperBound = 5.2;
    const TF = new TestFunctions();

    let population: Array<Population> = []; // 母集団
    let bestIndivArray: Array<Population> = []; // ベスト解履歴

    // 母集団の初期化
    population = this.Initialization(
      popSize,
      varSize,
      cr,
      scallingFactor,
      lowerBound,
      upperBound
    );

    // 評価
    population = this.PopulationEvaluation(population, TF);

    // ベスト個体の保存
    bestIndivArray.push(this.UpdateBest(population));

    let result: Array<IResult> = [];
    for (let i = 0; i < maxGeneration; i++) {
      population = this.OptimizationOperation(population, bestIndivArray, TF);

      const bestIndiv = this.UpdateBest(population);

      result.push({
        generation: String(i),
        evaluationValue: bestIndiv.evaluationValue,
        variable: bestIndiv.variable,
      });
    }

    return result;
  }

  private OptimizationOperation(
    population: Array<Population>,
    bestIndivArray: Array<Population>,
    TF: TestFunctions
  ): Array<Population> {
    // 子個体集団の生成
    const childPop: Array<Population> = this.CreateChildren(population);

    // 評価
    const evaluatedChildPop: Array<Population> = this.PopulationEvaluation(
      childPop,
      TF
    );

    // 母集団の更新
    const updatePop: Array<Population> = this.UpdatePopulation(
      population,
      evaluatedChildPop
    );

    // ベスト解の更新
    bestIndivArray.push(this.UpdateBest(updatePop));

    return updatePop;
  }

  private Initialization(
    popSize: number,
    varSize: number,
    cr: number,
    scallingFactor: number,
    lowerBound: number,
    upperBound: number
  ): Array<Population> {
    let population: Array<Population> = [];
    for (let pop = 0; pop < popSize; pop++) {
      population.push(
        new Population(
          varSize,
          99999999,
          cr,
          scallingFactor,
          pop,
          lowerBound,
          upperBound
        )
      );

      // 各個体の設計変数を初期化
      for (let varNum = 0; varNum < varSize; varNum++) {
        population[pop].variable[varNum] = this.GetRandomArbitrary(
          lowerBound,
          upperBound
        );
      }
    }
    return population;
  }

  private CreateChildren(population: Array<Population>): Array<Population> {
    const popSize = population.length;
    const varSize = population[0].variable.length;
    const tmpChild = this.DeepCopyObject(population);

    // 母集団のループ
    for (let popNum = 0; popNum < popSize; popNum++) {
      tmpChild[popNum].generation = population[popNum].generation + 1;

      let cross_varNum = this.GetIntegerRandomNumber(0, varSize + 1); // 交差する変数の選択

      // 交叉のための個体番号を取得
      let rNum = this.SelectPopulationNumber(popSize);

      // 交叉による変数の変更
      tmpChild[popNum].variable = this.DeepCopy(population[popNum].variable); // 親個体の変数を引継ぎ
      tmpChild[popNum].variable = this.CrossOver(
        population,
        tmpChild,
        popNum,
        cross_varNum,
        rNum
      );
    }
    return this.DeepCopyObject(tmpChild);
  }

  private SelectPopulationNumber(popSize: number): Array<number> {
    let rNum = [0, 0, 0];
    // 交叉のための個体番号を取得
    rNum[0] = this.GetIntegerRandomNumber(0, popSize);
    rNum[1] = this.GetIntegerRandomNumber(0, popSize);
    rNum[2] = this.GetIntegerRandomNumber(0, popSize);
    while (rNum[0] === rNum[1] || rNum[1] === rNum[2] || rNum[2] === rNum[0]) {
      rNum[0] = this.GetIntegerRandomNumber(0, popSize);
      rNum[1] = this.GetIntegerRandomNumber(0, popSize);
      rNum[2] = this.GetIntegerRandomNumber(0, popSize);
    }
    return rNum;
  }

  private CrossOver(
    population: Array<Population>,
    childPopulation: Array<Population>,
    popNum: number,
    cross_varNum: number,
    rNum: Array<number>
  ): Array<number> {
    let variable = this.DeepCopy(childPopulation[popNum].variable);

    // 交叉による変数の変更
    for (
      let varNum = 0;
      varNum < population[popNum].variable.length;
      varNum++
    ) {
      if (
        varNum === cross_varNum ||
        population[popNum].cr > this.GetRandomArbitrary(0, 1)
      ) {
        variable[varNum] =
          population[rNum[0]].variable[varNum] +
          population[popNum].scallingFactor *
            (population[rNum[1]].variable[varNum] -
              population[rNum[2]].variable[varNum]);

        // 上下限値の修正
        if (variable[varNum] < population[popNum].lowerBound) {
          variable[varNum] = population[popNum].lowerBound;
        }
        if (variable[varNum] > population[popNum].upperBound) {
          variable[varNum] = population[popNum].upperBound;
        }
      }
    }

    return this.DeepCopy(variable);
  }

  private PopulationEvaluation(
    population: Array<Population>,
    TF: TestFunctions
  ): Array<Population> {
    const tmpPopulation: Array<Population> = this.DeepCopyObject(population);
    tmpPopulation.forEach((population) => {
      // 評価
      population.evaluationValue = TF.Rastrign(population.variable);
    });
    return this.DeepCopyObject(tmpPopulation);
  }

  // 母集団の解更新
  private UpdatePopulation(
    population: Array<Population>,
    childPopulation: Array<Population>
  ): Array<Population> {
    let tmpPopulation = [];
    for (let popNum = 0; popNum < population.length; popNum++) {
      let tmpPop: Population;
      if (
        childPopulation[popNum].evaluationValue <
        population[popNum].evaluationValue
      ) {
        tmpPop = childPopulation[popNum];
      } else {
        tmpPop = population[popNum];
      }
      tmpPopulation.push(tmpPop);
    }
    return this.DeepCopyObject(tmpPopulation);
  }

  // ベスト個体の保存
  private UpdateBest(population: Array<Population>): Population {
    let bestPopNumber = this.GetBestPopulationNumber(population);
    return population[bestPopNumber];
  }

  // ベスト解の番号を取得
  private GetBestPopulationNumber(population: Array<Population>): number {
    let bestPopNumber = 0;
    for (let popNum = 1; popNum < population.length; popNum++) {
      if (
        population[popNum].evaluationValue <
        population[bestPopNumber].evaluationValue
      ) {
        bestPopNumber = popNum;
      }
    }
    return bestPopNumber;
  }

  private GetRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private GetIntegerRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  private DeepCopy(array: Array<number>): Array<number> {
    return JSON.parse(JSON.stringify(array));
  }

  private DeepCopyObject(arrayObject: Array<Population>): Array<Population> {
    return JSON.parse(JSON.stringify(arrayObject));
  }
}
