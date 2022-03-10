import { Component, OnInit } from '@angular/core';
import { salarycomponentService } from './../../../../core/services/salarycomponents/salarycomponents.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from "../../../../shared/base-componemnt/base-componemnt.component";
import { SalaryComponentModel } from "../../../../core/models/salarycomponents/salarycomponent.model";
import { SalaryComponentLookups } from "../../../../core/models/salarycomponents/salarycomponent.model";

import { MatSelectChange } from '@angular/material/select';


@Component({
  selector: 'app-salary-component',
  templateUrl: './salary-component.component.html'
})
export class SalaryComponentComponent extends BaseComponemntComponent implements OnInit {
  submitted: boolean = false;

  salaryComponentForm: FormGroup;
  salaryComponentModel = new SalaryComponentModel();
  lookups = new SalaryComponentLookups();

  calculationPeriodName: String;
  bindid: any;

  isLoadingData: boolean = true;

  constructor(
    private fb: FormBuilder,
    private _salarycomponentService: salarycomponentService,
    private _route: ActivatedRoute,
  ) {
    super();
    this.salaryComponentForm = fb.group({
      'payHeadName': [this.salaryComponentModel.payHeadName, Validators.required],
      'displayName': [this.salaryComponentModel.displayName, Validators.required],
      'payHeadTypeID': [this.salaryComponentModel.payHeadTypeID, Validators.required],
      'calculationTypeID': [this.salaryComponentModel.calculationTypeID, Validators.required],
      'attendanceTypeID': [this.salaryComponentModel.attendanceTypeID],
      'productionUnitID': [this.salaryComponentModel.productionUnitID],
      'calculationPeriodID': [this.salaryComponentModel.calculationPeriodID],
      'perDayCalculationBasisID': [this.salaryComponentModel.perDayCalculationBasisID],
      'userdefinedDays': [this.salaryComponentModel.userdefinedDays],
      'computationMethodID': [this.salaryComponentModel.computationMethodID],
      'affectNetSalaryOn': [this.salaryComponentModel.affectNetSalaryOn],
      'canrecurringSubequentPayrollsOn': [this.salaryComponentModel.canrecurringSubequentPayrollsOn],
      'taxableComponentOn': [this.salaryComponentModel.taxableComponentOn],
      'considerforEPFContributionOn': [this.salaryComponentModel.considerforEPFContributionOn],
      'considerforESIContributionOn': [this.salaryComponentModel.considerforESIContributionOn],
      'considerforGratuityOn': [this.salaryComponentModel.considerforGratuityOn],
      'canShowInPayslipOn': [this.salaryComponentModel.canShowInPayslipOn],
      'isPrimary': [this.salaryComponentModel.isPrimary]
    });

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });

  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();

  }
  async LoadData() {
    if (this.bindid) {
      await this._salarycomponentService
        .AsyncGetById(this.bindid)
        .then(data => {
          if (data) {
            this.salaryComponentModel = data;
          }
        })
    }
    this.isLoadingData = false;

  }

  async onSubmit(value: any) {
    this.submitted = true;

    if (this.bindid) {
      this._salarycomponentService
        .AsyncUpdate(this.bindid, this.salaryComponentModel)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Salary Component has been Updated Successfully!!', 'success');
            this._router.navigate(['pages/dynamic-list/list/salarycomponent']);
          }
        })
        .catch((e) => { })
        .finally(() => {
          this.submitted = false;
        });
    } else {
      this._salarycomponentService
        .AsyncAdd(this.salaryComponentModel)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Salary component has been added successfully!!', 'success');
            this._router.navigate(['pages/dynamic-list/list/salarycomponent']);
          }
        })
        .catch((e) => { })
        .finally(() => {
          this.submitted = false;
        });
    }
  }

  async onCalculationTypeChange(event: MatSelectChange) {
    this.salaryComponentModel.calculationTypeID = event.value;
  }

  async onPayTypeChange(event: MatSelectChange) {
    this.salaryComponentModel.payHeadTypeID = event.value;
  }

  async onAttendanceTypeChange(event: MatSelectChange) {
    this.salaryComponentModel.attendanceTypeID = event.value;
  }

  async onCalculationPeriodChange(event: MatSelectChange) {
    this.salaryComponentModel.calculationPeriodID = event.value;
    this.calculationPeriodName = this.lookups.calculationPeriods.find(x => x.id == event.value).name
    //console.log(this.calculationPeriodName)
  }

  async onCalBasisChange(event: MatSelectChange) {
    this.salaryComponentModel.perDayCalculationBasisID = event.value;
  }

  async onComputationChange(event: MatSelectChange) {
    this.salaryComponentModel.computationMethodID = event.value;
  }
}
