export class BudgetGovernor { constructor(public maxTokens=12000){} canSpend(estimate=0){return estimate<=this.maxTokens;} consume(tokens:number){this.maxTokens=Math.max(0,this.maxTokens-tokens);} }

