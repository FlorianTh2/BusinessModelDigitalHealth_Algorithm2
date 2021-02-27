import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  MaturityModel,
  MaturityModelGQL,
  UserEvaluationMetric,
  UserMaturityModel,
  UserMaturityModelOfUserGQL
} from "../graphql/generated/graphql";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ID_OF_MATURITYMODEL } from "../shared/constants/constants";
import {
  InputMaturityModelSpiderChart,
  InputSubUserPartialModelSpiderChart,
  InputUserPartialModelSpiderChart
} from "../shared/models/InputMaturityModelSpiderChart";

@Component({
  selector: "app-maturity-model",
  templateUrl: "./maturity-model.component.html",
  styleUrls: ["./maturity-model.component.scss"]
})
export class MaturityModelComponent implements OnInit {
  maturityModel_id: string;
  userMaturityModel$: Observable<UserMaturityModel>;
  maturityModel$: Observable<MaturityModel>;

  constructor(
    private route: ActivatedRoute,
    private userMaturityModelOfUserGQL: UserMaturityModelOfUserGQL,
    private maturityModelGQL: MaturityModelGQL
  ) {}

  ngOnInit(): void {
    this.maturityModel_id = this.route.snapshot.paramMap.get(
      "maturitymodel_id"
    );
    this.userMaturityModel$ = this.userMaturityModelOfUserGQL
      .watch({ userMaturityModelId: this.maturityModel_id })
      .valueChanges.pipe(
        map(
          (result) => result.data.userMaturityModelOfUser as UserMaturityModel
        )
      );
    this.maturityModel$ = this.maturityModelGQL
      .watch({ maturityModelId: ID_OF_MATURITYMODEL })
      .valueChanges.pipe(
        map((result) => result.data.maturityModel as MaturityModel)
      );
  }

  // needed since we dont know the dimension of userMaturityModel: how many levels of subUserPartialModels do we have?
  // -> with this function we limit the dimension to 1 level of userPartialModels and 1 level of subUserPartialModels
  transformGraphQlInputUserMaturityModelToSpiderChartDataContract(
    userMaturityModel: UserMaturityModel
  ): InputMaturityModelSpiderChart {
    const tmp: InputMaturityModelSpiderChart = {
      maturityModel: {
        name: userMaturityModel.name,
        userPartialModels: userMaturityModel.userPartialModels.map((a) => {
          return {
            partialModel: a.partialModel,
            maturityLevelEvaluationMetrics: 5,
            subUserPartialModel: a.subUserPartialModels.map((b) => {
              return {
                maturityLevelEvaluationMetrics:
                  b.userEvaluationMetrics.reduce(
                    (c: number, d: UserEvaluationMetric) =>
                      c + d.valueEvaluationMetric,
                    0
                  ) / b.userEvaluationMetrics.length,
                // took simply the first one ([0]) since one must exist at least (like at least: "Aussage trifft zu" with 5 levels (0-4) (but not 5 evaluationMetrics but one))
                maxMaturityLevelEvaluationMetrics:
                  b.userEvaluationMetrics[0].evaluationMetric.maxValue,
                partialModel: b.partialModel
              } as InputSubUserPartialModelSpiderChart;
            })
          } as InputUserPartialModelSpiderChart;
        })
      }
    };
    return tmp;
  }
}
