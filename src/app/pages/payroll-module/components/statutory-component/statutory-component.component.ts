import { Component, OnInit } from '@angular/core';
import { SalaryComponentModel, PaySlab, SalaryComponentLookups } from '../../../../core/models/salarycomponents/salarycomponent.model';
import { BaseComponemntComponent, BaseComponemntInterface } from "../../../../shared/base-componemnt/base-componemnt.component";
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms'
import { salarycomponentService } from 'src/app/core/services/salarycomponents/salarycomponents.service';
import { ActivatedRoute } from '@angular/router';

import swal from 'sweetalert2';
@Component({
  selector: 'app-statutory-component',
  templateUrl: './statutory-component.component.html'
})
export class StatutoryComponentComponent extends BaseComponemntComponent implements OnInit {
  submitted: boolean = false;
  lookups = new SalaryComponentLookups();

  payHeadList: any = [];

  epfForm: FormGroup;
  esiForm: FormGroup;
  ptForm: FormGroup;

  epfEmployeeDeductionModel = new SalaryComponentModel();
  epfEmployerContributionModel = new SalaryComponentModel();
  epsEmployerContributionModel = new SalaryComponentModel();
  epfAdminChargeModel = new SalaryComponentModel();
  epfEDLIContributionModel = new SalaryComponentModel();

  esiEmployeeContributionModel = new SalaryComponentModel();
  esiEmployerContributionModel = new SalaryComponentModel();

  professionalTaxModel = new SalaryComponentModel();

  epfNumber: string;
  epfEmployeeContributionRate: number;
  epfEmployeeContributionCeiling: number;
  epfEmployerContributionRate: number;
  epfEmployerContributionCeiling: number;
  epsEmployerContributionRate: number;
  epfAdminChargeRate: number;
  epfEDLIContributionRate: number;
  epfEnable: boolean;

  esiNumber: string;
  esiEmployeeContributionRate: number;
  esiEmployerContributionRate: number;
  esiEmployeeContributionCeiling: number;
  esiEmployerContributionCeiling: number;
  esiEnable: boolean;

  ptNumber: string;
  ptSlabsArray: FormArray;
  ptEnable: boolean;

  isLoadingData: boolean = true;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _salarycomponentService: salarycomponentService
  ) {
    super();

    this.epfForm = this.fb.group({
      'epfNumber': [this.epfEmployeeDeductionModel.statutoryNumber, Validators.required],
      'epfEmployeeContributionRate': ['', Validators.required],
      'epfEmployeeContributionCeiling': ['', Validators.required],
      'epfEmployerContributionRate': ['', Validators.required],
      'epfEmployerContributionCeiling': ['', Validators.required],
      'epsEmployerContributionRate': ['', Validators.required],
      'epfAdminChargeRate': ['', Validators.required],
      'epfEDLIContributionRate': ['', Validators.required],
    })

    this.esiForm = this.fb.group({
      'esiNumber': [this.esiNumber, Validators.required],
      'esiEmployeeContributionCeiling': ['', Validators.required],
      'esiEmployeeContributionRate': ['', Validators.required],
      'esiEmployerContributionCeiling': ['', Validators.required],
      'esiEmployerContributionRate': ['', Validators.required],
    })

    this.ptForm = this.fb.group({
      'ptNumber': [this.ptNumber, Validators.required],
      ptSlabs: this.fb.array([
        this.fb.group({
          amountGreaterThan: this.fb.control(1, Validators.required),
          amountUpTo: this.fb.control(6000, Validators.required),
          valueTypeID: this.fb.control(1001, Validators.required),
          value: this.fb.control(0, Validators.required)
        })
      ])
    })
    let formGroup: FormGroup = this.fb.group({
      amountGreaterThan: this.fb.control(6000, Validators.required),
      amountUpTo: this.fb.control(10000, Validators.required),
      valueTypeID: this.fb.control(1001, Validators.required),
      value: this.fb.control(100, Validators.required)
    });
    let formGroup1: FormGroup = this.fb.group({
      amountGreaterThan: this.fb.control(10000, Validators.required),
      amountUpTo: this.fb.control(null, Validators.required),
      valueTypeID: this.fb.control(1001, Validators.required),
      value: this.fb.control(200, Validators.required)
    });

    this.ptSlabsArray = this.ptForm.get('ptSlabs') as FormArray;
    this.ptSlabsArray.push(formGroup);
    this.ptSlabsArray.push(formGroup1);
  }

  async ngOnInit() {
    super.ngOnInit();
    try {
      this.isLoadingData = false;
      await this.getAllSalaryComponent();
      this.setStatutoryComponent();
    }
    catch (error) {
      //console.log(error);
    }
  }

  async getAllSalaryComponent() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    return this._salarycomponentService
      .AsyncGetByfilterLookupName(postData)
      .then(data => {
        if (data) {
          this.payHeadList = data;
        }
      })
  }

  setStatutoryComponent() {
    this.setProfessionalTaxDetails();
    this.setEmployeesProvidentFundDetails();
    this.setEmployeesStateInsuranceDetails();
  }

  setEmployeesProvidentFundDetails() {
    this.epfEmployeeDeductionModel = this.payHeadList.find(x => x.payHeadTypeID === 103 && x.statutoryPayTypeID === 203);
    this.epfEmployerContributionModel = this.payHeadList.find(x => x.payHeadTypeID === 104 && x.statutoryPayTypeID === 301);
    this.epsEmployerContributionModel = this.payHeadList.find(x => x.payHeadTypeID === 104 && x.statutoryPayTypeID === 302);
    this.epfAdminChargeModel = this.payHeadList.find(x => x.payHeadTypeID === 105 && x.statutoryPayTypeID === 401);
    this.epfEDLIContributionModel = this.payHeadList.find(x => x.payHeadTypeID === 105 && x.statutoryPayTypeID === 402);

    if (this.epfEmployeeDeductionModel) {
      this.epfNumber = this.epfEmployeeDeductionModel.statutoryNumber

      this.epfEmployeeContributionRate = this.epfEmployeeDeductionModel.paySlabs[0].value
      this.epfEmployeeContributionCeiling = this.epfEmployeeDeductionModel.paySlabs[0].amountUpTo
      this.epfEmployerContributionRate = this.epfEmployerContributionModel.paySlabs[0].value
      this.epfEmployerContributionCeiling = this.epfEmployerContributionModel.paySlabs[0].amountUpTo

      this.epsEmployerContributionRate = this.epsEmployerContributionModel.paySlabs[0].value

      this.epfAdminChargeRate = this.epfAdminChargeModel.paySlabs[0].value
      this.epfEDLIContributionRate = this.epfEDLIContributionModel.paySlabs[0].value

      this.epfEnable = true;
    } else {
      this.epfEmployeeDeductionModel = new SalaryComponentModel();
      this.epfEmployerContributionModel = new SalaryComponentModel();
      this.epsEmployerContributionModel = new SalaryComponentModel();
      this.epfAdminChargeModel = new SalaryComponentModel();
      this.epfEDLIContributionModel = new SalaryComponentModel();
      this.epfEnable = false;
    }
    return;
  }

  setEmployeesStateInsuranceDetails() {
    this.esiEmployeeContributionModel = this.payHeadList.find(x => x.payHeadTypeID === 103 && x.statutoryPayTypeID === 205);
    this.esiEmployerContributionModel = this.payHeadList.find(x => x.payHeadTypeID === 104 && x.statutoryPayTypeID === 303);

    if (this.esiEmployeeContributionModel) {
      this.esiNumber = this.esiEmployeeContributionModel.statutoryNumber;
      this.esiEmployeeContributionCeiling = this.esiEmployeeContributionModel.paySlabs[0].amountUpTo
      this.esiEmployerContributionCeiling = this.esiEmployerContributionModel.paySlabs[0].amountUpTo
      this.esiEmployeeContributionRate = this.esiEmployeeContributionModel.paySlabs[0].value;
      this.esiEmployerContributionRate = this.esiEmployerContributionModel.paySlabs[0].value;

      this.esiEnable = true;
    } else {
      this.esiEmployeeContributionModel = new SalaryComponentModel();
      this.esiEmployerContributionModel = new SalaryComponentModel();
      this.esiEnable = false;
    }
    return;
  }

  setProfessionalTaxDetails() {
    this.professionalTaxModel = this.payHeadList.find(x => x.payHeadTypeID === 103 && x.statutoryPayTypeID === 202);

    if (this.professionalTaxModel) {
      this.ptNumber = this.professionalTaxModel.statutoryNumber;

      this.ptEnable = true;
    } else {
      this.professionalTaxModel = new SalaryComponentModel();
      this.ptEnable = false;
    }
    return;
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  addProfessionalTaxSlab() {
    let formGroup: FormGroup = this.fb.group({
      amountGreaterThan: this.fb.control(null),
      amountUpTo: this.fb.control(null),
      valueTypeID: this.fb.control(1001, Validators.required),
      value: this.fb.control(null)
    });
    this.ptSlabsArray.push(formGroup)
  }

  onEnableEPF(value) {
    this.epfEnable = value;

    this.epfEmployeeDeductionModel.payHeadName = "EPF";
    this.epfEmployeeDeductionModel.displayName = "EPF";

    this.epfEmployeeDeductionModel.payHeadTypeID = 103;
    this.epfEmployeeDeductionModel.statutoryPayTypeID = 203;
    this.epfEmployeeDeductionModel.calculationTypeID = 504;
    this.epfEmployeeDeductionModel.calculationPeriodID = 702;

    this.epfEmployeeDeductionModel.affectNetSalaryOn = true;
    this.epfEmployeeDeductionModel.canShowInPayslipOn = true;
    this.epfEmployeeDeductionModel.computationMethodID = 904;
    this.epfEmployeeDeductionModel.considerforEPFContributionOn = false;
    this.epfEmployeeDeductionModel.considerforESIContributionOn = false;
    this.epfEmployeeDeductionModel.considerforGratuityOn = false;
    this.epfEmployeeDeductionModel.taxableComponentOn = false;

    this.epfEmployeeDeductionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: 15000, valueTypeID: 1002, value: 12 }
    ]

    this.epfEmployerContributionModel.payHeadName = "Employer EPF";
    this.epfEmployerContributionModel.displayName = " Employer EPF";

    this.epfEmployerContributionModel.payHeadTypeID = 104;
    this.epfEmployerContributionModel.statutoryPayTypeID = 301;
    this.epfEmployerContributionModel.calculationTypeID = 504;
    this.epfEmployerContributionModel.calculationPeriodID = 702;

    this.epfEmployerContributionModel.affectNetSalaryOn = false;
    this.epfEmployerContributionModel.canShowInPayslipOn = false;
    this.epfEmployerContributionModel.computationMethodID = 904;
    this.epfEmployerContributionModel.considerforEPFContributionOn = false;
    this.epfEmployerContributionModel.considerforESIContributionOn = false;
    this.epfEmployerContributionModel.considerforGratuityOn = false;
    this.epfEmployerContributionModel.taxableComponentOn = false;

    this.epfEmployerContributionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: 15000, valueTypeID: 1002, value: 3.67 }
    ]


    this.epsEmployerContributionModel.payHeadName = "EPS";
    this.epsEmployerContributionModel.displayName = "EPS";

    this.epsEmployerContributionModel.payHeadTypeID = 104;
    this.epsEmployerContributionModel.statutoryPayTypeID = 302;
    this.epsEmployerContributionModel.calculationTypeID = 504;
    this.epsEmployerContributionModel.calculationPeriodID = 702;

    this.epsEmployerContributionModel.affectNetSalaryOn = false;
    this.epsEmployerContributionModel.canShowInPayslipOn = false;
    this.epsEmployerContributionModel.computationMethodID = 904;
    this.epsEmployerContributionModel.considerforEPFContributionOn = false;
    this.epsEmployerContributionModel.considerforESIContributionOn = false;
    this.epsEmployerContributionModel.considerforGratuityOn = false;
    this.epsEmployerContributionModel.taxableComponentOn = false;

    this.epsEmployerContributionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: 8.33 }
    ]

    this.epfAdminChargeModel.payHeadName = "EPF Admin Charge";
    this.epfAdminChargeModel.displayName = "EPF Admin Charge";

    this.epfAdminChargeModel.payHeadTypeID = 105;
    this.epfAdminChargeModel.statutoryPayTypeID = 401;
    this.epfAdminChargeModel.calculationTypeID = 504;
    this.epfAdminChargeModel.calculationPeriodID = 702;

    this.epfAdminChargeModel.affectNetSalaryOn = false;
    this.epfAdminChargeModel.canShowInPayslipOn = false;
    this.epfAdminChargeModel.computationMethodID = 904;
    this.epfAdminChargeModel.considerforEPFContributionOn = false;
    this.epfAdminChargeModel.considerforESIContributionOn = false;
    this.epfAdminChargeModel.considerforGratuityOn = false;
    this.epfAdminChargeModel.taxableComponentOn = false;

    this.epfAdminChargeModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: 0.50 }
    ]

    this.epfEDLIContributionModel.payHeadName = "EPF EDLI Contribution";
    this.epfEDLIContributionModel.displayName = "EPF EDLI Contribution";

    this.epfEDLIContributionModel.payHeadTypeID = 105;
    this.epfEDLIContributionModel.statutoryPayTypeID = 402;
    this.epfEDLIContributionModel.calculationTypeID = 504;
    this.epfEDLIContributionModel.calculationPeriodID = 702;

    this.epfEDLIContributionModel.affectNetSalaryOn = false;
    this.epfEDLIContributionModel.canShowInPayslipOn = false;
    this.epfEDLIContributionModel.computationMethodID = 904;
    this.epfEDLIContributionModel.considerforEPFContributionOn = false;
    this.epfEDLIContributionModel.considerforESIContributionOn = false;
    this.epfEDLIContributionModel.considerforGratuityOn = false;
    this.epfEDLIContributionModel.taxableComponentOn = false;

    this.epfEDLIContributionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: 0.50 }
    ]

    this.epfEmployeeContributionRate = this.epfEmployeeDeductionModel.paySlabs[0].value;
    this.epfEmployeeContributionCeiling = this.epfEmployeeDeductionModel.paySlabs[0].amountUpTo;
    this.epfEmployerContributionRate = this.epfEmployerContributionModel.paySlabs[0].value;
    this.epfEmployerContributionCeiling = this.epfEmployerContributionModel.paySlabs[0].amountUpTo;
    this.epsEmployerContributionRate = this.epsEmployerContributionModel.paySlabs[0].value;
    this.epfAdminChargeRate = this.epfAdminChargeModel.paySlabs[0].value;
    this.epfEDLIContributionRate = this.epfEDLIContributionModel.paySlabs[0].value;
  }

  onDisableEPF(value){
    this.epfEnable = value;

    this.epfEmployeeDeductionModel.subComponents = []
    this.epfEmployeeDeductionModel.subComponents.push(this.epfEmployerContributionModel);
    this.epfEmployeeDeductionModel.subComponents.push(this.epsEmployerContributionModel);
    this.epfEmployeeDeductionModel.subComponents.push(this.epfAdminChargeModel);
    this.epfEmployeeDeductionModel.subComponents.push(this.epfEDLIContributionModel);

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Disable it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async (result) => {
      if (result.value) {
        var url = "salarycomponents/deletemultiple"
        var method = "POST"
        var finalArray: any[] = [];
        finalArray.push(this.epfEmployeeDeductionModel)
        this.epfEmployeeDeductionModel.subComponents.forEach(subcmpnt => {
          finalArray.push(subcmpnt)
        })
        var modal = {};
        modal['salarycomponents'] = [];
        modal['salarycomponents'] = finalArray;
  
        return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
            if(data){
              this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
              this.ngOnInit();
              this.submitted = false;
            }
        })
      }
    });
  }

  onEnableESI(value) {
    this.esiEnable = value;

    this.esiEmployeeContributionModel.payHeadName = "ESI";
    this.esiEmployeeContributionModel.displayName = "ESI";

    this.esiEmployeeContributionModel.payHeadTypeID = 103;
    this.esiEmployeeContributionModel.statutoryPayTypeID = 205;
    this.esiEmployeeContributionModel.calculationTypeID = 504;
    this.esiEmployeeContributionModel.calculationPeriodID = 702;

    this.esiEmployeeContributionModel.affectNetSalaryOn = true;
    this.esiEmployeeContributionModel.canShowInPayslipOn = true;
    this.esiEmployeeContributionModel.computationMethodID = 904;
    this.esiEmployeeContributionModel.considerforEPFContributionOn = false;
    this.esiEmployeeContributionModel.considerforESIContributionOn = false;
    this.esiEmployeeContributionModel.considerforGratuityOn = false;
    this.esiEmployeeContributionModel.taxableComponentOn = false;

    this.esiEmployeeContributionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: 21000, valueTypeID: 1002, value: 0.75 }
    ]
    // this.esiEmployeeContributionModel.paySlabs = [
    //   { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: 0.75 }
    // ]
    this.esiEmployerContributionModel.payHeadName = "Employer ESI";
    this.esiEmployerContributionModel.displayName = "Employer ESI";

    this.esiEmployerContributionModel.payHeadTypeID = 104;
    this.esiEmployerContributionModel.statutoryPayTypeID = 303;
    this.esiEmployerContributionModel.calculationTypeID = 504;
    this.esiEmployerContributionModel.calculationPeriodID = 702;

    this.esiEmployerContributionModel.affectNetSalaryOn = false;
    this.esiEmployerContributionModel.canShowInPayslipOn = false;
    this.esiEmployerContributionModel.computationMethodID = 904;
    this.esiEmployerContributionModel.considerforEPFContributionOn = false;
    this.esiEmployerContributionModel.considerforESIContributionOn = false;
    this.esiEmployerContributionModel.considerforGratuityOn = false;
    this.esiEmployerContributionModel.taxableComponentOn = false;

    this.esiEmployerContributionModel.paySlabs = [
      { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: 21000, valueTypeID: 1002, value: 3.25 }
    ]

    // this.esiEmployerContributionModel.paySlabs = [
    //   { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: 3.25 }
    // ]

    this.esiEmployeeContributionRate = this.esiEmployeeContributionModel.paySlabs[0].value;
    this.esiEmployerContributionRate = this.esiEmployerContributionModel.paySlabs[0].value;
    this.esiEmployeeContributionCeiling = this.esiEmployeeContributionModel.paySlabs[0].amountUpTo;
    this.esiEmployerContributionCeiling = this.esiEmployerContributionModel.paySlabs[0].amountUpTo;
  }

  onDisableESI(value){
    this.esiEnable = value;
    this.esiEmployeeContributionModel.subComponents = []
    this.esiEmployeeContributionModel.subComponents.push(this.esiEmployerContributionModel)

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Disable it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async (result) => {
      if (result.value) {
        var url = "salarycomponents/deletemultiple"
        var method = "POST"
        var finalArray: any[] = [];
        finalArray.push(this.esiEmployeeContributionModel)
        this.esiEmployeeContributionModel.subComponents.forEach(subcmpnt => {
          finalArray.push(subcmpnt)
        })
        var modal = {};
        modal['salarycomponents'] = [];
        modal['salarycomponents'] = finalArray;
  
        return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
            if(data){
              this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
              this.ngOnInit();

              this.submitted = false;
            }
        })
      }
    });
  }

  onEnablePT(value) {
    this.ptEnable = value;

    this.professionalTaxModel.payHeadName = "Professional Tax";
    this.professionalTaxModel.displayName = "Professional Tax";

    this.professionalTaxModel.payHeadTypeID = 103;
    this.professionalTaxModel.statutoryPayTypeID = 202;
    this.professionalTaxModel.calculationTypeID = 504;
    this.professionalTaxModel.calculationPeriodID = 702;

    this.professionalTaxModel.affectNetSalaryOn = true;
    this.professionalTaxModel.canShowInPayslipOn = true;
    this.professionalTaxModel.computationMethodID = 901;
    this.professionalTaxModel.considerforEPFContributionOn = false;
    this.professionalTaxModel.considerforESIContributionOn = false;
    this.professionalTaxModel.considerforGratuityOn = false;
    this.professionalTaxModel.taxableComponentOn = false;

    // this.ptSlabs = [
    //   { id: this.uuidv4(), amountGreaterThan: 1, amountUpTo: 6000, valueTypeID: 1001, value: 0 },
    //   { id: this.uuidv4(), amountGreaterThan: 6000, amountUpTo: 10000, valueTypeID: 1001, value: 100 },
    //   { id: this.uuidv4(), amountGreaterThan: 10000, amountUpTo: null, valueTypeID: 1001, value: 200 }
    // ]
  }

  onDisablePT(value){
    this.ptEnable = value;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Disable it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async (result) => {
      if (result.value) {
        this._salarycomponentService
        .Delete(this.professionalTaxModel._id)
        .subscribe(data => {
          if (data) {
            this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
            this.ngOnInit();
            this.submitted = false;

          }
        })
      }
    });
  }

  async onEPFSubmit(value: any, isValid: boolean) {
  
      if(!value.epfNumber){
        this.showNotification("top", "right", "EPF Number is required !!", "danger");
        return;
      }
      this.submitted = true;
      
      this.epfEmployeeDeductionModel.payHeadName = "EPF";
      this.epfEmployeeDeductionModel.displayName = "EPF";
      this.epfEmployeeDeductionModel.statutoryNumber = value.epfNumber;
  
      this.epfEmployeeDeductionModel.payHeadTypeID = 103;
      this.epfEmployeeDeductionModel.statutoryPayTypeID = 203;
      this.epfEmployeeDeductionModel.calculationTypeID = 501;
      this.epfEmployeeDeductionModel.calculationPeriodID = 702;
  
      this.epfEmployeeDeductionModel.affectNetSalaryOn = true;
      this.epfEmployeeDeductionModel.canShowInPayslipOn = true;
      this.epfEmployeeDeductionModel.computationMethodID = 904;
      this.epfEmployeeDeductionModel.considerforEPFContributionOn = false;
      this.epfEmployeeDeductionModel.considerforESIContributionOn = false;
      this.epfEmployeeDeductionModel.considerforGratuityOn = false;
      this.epfEmployeeDeductionModel.taxableComponentOn = false;
  
      this.epfEmployeeDeductionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: value.epfEmployeeContributionCeiling, valueTypeID: 1002, value: value.epfEmployeeContributionRate },
        { id: this.uuidv4(), amountGreaterThan: value.epfEmployeeContributionCeiling, amountUpTo: null, valueTypeID: 1001, value: value.epfEmployeeContributionCeiling * value.epfEmployeeContributionRate * 0.01 }
      ]
  
      this.epfEmployerContributionModel.payHeadName = "Employer EPF";
      this.epfEmployerContributionModel.displayName = "Employer EPF";
      this.epfEmployerContributionModel.payHeadTypeID = 104;
      this.epfEmployerContributionModel.statutoryPayTypeID = 301;
      this.epfEmployerContributionModel.calculationTypeID = 501;
      this.epfEmployerContributionModel.calculationPeriodID = 702;
  
      this.epfEmployerContributionModel.affectNetSalaryOn = false;
      this.epfEmployerContributionModel.canShowInPayslipOn = false;
      this.epfEmployerContributionModel.computationMethodID = 904;
      this.epfEmployerContributionModel.considerforEPFContributionOn = false;
      this.epfEmployerContributionModel.considerforESIContributionOn = false;
      this.epfEmployerContributionModel.considerforGratuityOn = false;
      this.epfEmployerContributionModel.taxableComponentOn = false;
  
      this.epfEmployerContributionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: value.epfEmployerContributionCeiling, valueTypeID: 1002, value: value.epfEmployerContributionRate },
        { id: this.uuidv4(), amountGreaterThan: value.epfEmployerContributionCeiling, amountUpTo: null, valueTypeID: 1001, value: value.epfEmployerContributionCeiling * value.epfEmployerContributionRate * 0.01 }
      ]
  
      this.epsEmployerContributionModel.payHeadName = "EPS";
      this.epsEmployerContributionModel.displayName = "EPS";
      this.epsEmployerContributionModel.payHeadTypeID = 104;
      this.epsEmployerContributionModel.statutoryPayTypeID = 302;
      this.epsEmployerContributionModel.calculationTypeID = 501;
      this.epsEmployerContributionModel.calculationPeriodID = 702;
  
      this.epsEmployerContributionModel.affectNetSalaryOn = false;
      this.epsEmployerContributionModel.canShowInPayslipOn = false;
      this.epsEmployerContributionModel.computationMethodID = 904;
      this.epsEmployerContributionModel.considerforEPFContributionOn = false;
      this.epsEmployerContributionModel.considerforESIContributionOn = false;
      this.epsEmployerContributionModel.considerforGratuityOn = false;
      this.epsEmployerContributionModel.taxableComponentOn = false;
  
      this.epsEmployerContributionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: value.epsEmployerContributionRate }
      ]
  
      this.epfAdminChargeModel.payHeadName = "EPF Admin Charge";
      this.epfAdminChargeModel.displayName = "EPF Admin Charge";
      this.epfAdminChargeModel.payHeadTypeID = 105;
      this.epfAdminChargeModel.statutoryPayTypeID = 401;
      this.epfAdminChargeModel.calculationTypeID = 501;
      this.epfAdminChargeModel.calculationPeriodID = 702;
  
      this.epfAdminChargeModel.affectNetSalaryOn = false;
      this.epfAdminChargeModel.canShowInPayslipOn = false;
      this.epfAdminChargeModel.computationMethodID = 904;
      this.epfAdminChargeModel.considerforEPFContributionOn = false;
      this.epfAdminChargeModel.considerforESIContributionOn = false;
      this.epfAdminChargeModel.considerforGratuityOn = false;
      this.epfAdminChargeModel.taxableComponentOn = false;
  
      this.epfAdminChargeModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: value.epfAdminChargeRate }
      ]
  
      this.epfEDLIContributionModel.payHeadName = "EPF EDLI Contribution";
      this.epfEDLIContributionModel.displayName = "EPF EDLI Contribution";
      this.epfEDLIContributionModel.payHeadTypeID = 105;
      this.epfEDLIContributionModel.statutoryPayTypeID = 402;
      this.epfEDLIContributionModel.calculationTypeID = 501;
      this.epfEDLIContributionModel.calculationPeriodID = 702;
  
      this.epfEDLIContributionModel.affectNetSalaryOn = false;
      this.epfEDLIContributionModel.canShowInPayslipOn = false;
      this.epfEDLIContributionModel.computationMethodID = 904;
      this.epfEDLIContributionModel.considerforEPFContributionOn = false;
      this.epfEDLIContributionModel.considerforESIContributionOn = false;
      this.epfEDLIContributionModel.considerforGratuityOn = false;
      this.epfEDLIContributionModel.taxableComponentOn = false;
  
      this.epfEDLIContributionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: value.epfEDLIContributionRate }
      ]
  
      this.epfEmployeeDeductionModel.subComponents = []
      this.epfEmployeeDeductionModel.subComponents.push(this.epfEmployerContributionModel);
      this.epfEmployeeDeductionModel.subComponents.push(this.epsEmployerContributionModel);
      this.epfEmployeeDeductionModel.subComponents.push(this.epfAdminChargeModel);
      this.epfEmployeeDeductionModel.subComponents.push(this.epfEDLIContributionModel);
      
      // console.log(this.epfEmployeeDeductionModel)
        if (this.epfEmployeeDeductionModel._id && this.epfEmployeeDeductionModel._id.length > 0) {
          this._salarycomponentService
            .AsyncUpdate(this.epfEmployeeDeductionModel._id, this.epfEmployeeDeductionModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
        } else {
          this._salarycomponentService
            .AsyncAdd(this.epfEmployeeDeductionModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been added successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
          }
     
  }

  async onESISubmit(value: any, isValid: boolean) {
      if(!value.esiNumber){
        this.showNotification("top", "right", "ESI Number is required !!", "danger");
        return;
      }
      this.submitted = true;
  
      this.esiEmployeeContributionModel.payHeadName = "ESI";
      this.esiEmployeeContributionModel.displayName = "ESI";
      this.esiEmployeeContributionModel.statutoryNumber = value.esiNumber;
  
      this.esiEmployeeContributionModel.payHeadTypeID = 103;
      this.esiEmployeeContributionModel.statutoryPayTypeID = 205;
      this.esiEmployeeContributionModel.calculationTypeID = 501;
      this.esiEmployeeContributionModel.calculationPeriodID = 702;
  
      this.esiEmployeeContributionModel.affectNetSalaryOn = true;
      this.esiEmployeeContributionModel.canShowInPayslipOn = true;
      this.esiEmployeeContributionModel.computationMethodID = 904;
      this.esiEmployeeContributionModel.considerforEPFContributionOn = false;
      this.esiEmployeeContributionModel.considerforESIContributionOn = false;
      this.esiEmployeeContributionModel.considerforGratuityOn = false;
      this.esiEmployeeContributionModel.taxableComponentOn = false;
  
      this.esiEmployeeContributionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: value.esiEmployeeContributionCeiling, valueTypeID: 1002, value: value.esiEmployeeContributionRate },
        { id: this.uuidv4(), amountGreaterThan: value.esiEmployeeContributionCeiling, amountUpTo: null, valueTypeID: 1002, value: 0 }
      ]
      // this.esiEmployeeContributionModel.paySlabs = [
      //   { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: value.esiEmployeeContributionRate }
      // ]
  
      this.esiEmployerContributionModel.payHeadName = "Employer ESI";
      this.esiEmployerContributionModel.displayName = "Employer ESI";
  
      this.esiEmployerContributionModel.payHeadTypeID = 104;
      this.esiEmployerContributionModel.statutoryPayTypeID = 303;
      this.esiEmployerContributionModel.calculationTypeID = 501;
      this.esiEmployerContributionModel.calculationPeriodID = 702;
  
      this.esiEmployerContributionModel.affectNetSalaryOn = false;
      this.esiEmployerContributionModel.canShowInPayslipOn = false;
      this.esiEmployerContributionModel.computationMethodID = 904;
      this.esiEmployerContributionModel.considerforEPFContributionOn = false;
      this.esiEmployerContributionModel.considerforESIContributionOn = false;
      this.esiEmployerContributionModel.considerforGratuityOn = false;
      this.esiEmployerContributionModel.taxableComponentOn = false;
  
      this.esiEmployerContributionModel.paySlabs = [
        { id: this.uuidv4(), amountGreaterThan: 0, amountUpTo: value.esiEmployerContributionCeiling, valueTypeID: 1002, value: value.esiEmployerContributionRate },
        { id: this.uuidv4(), amountGreaterThan: value.esiEmployerContributionCeiling, amountUpTo: null, valueTypeID: 1002, value: 0 }
  
      ]
      // this.esiEmployerContributionModel.paySlabs = [
      //   { id: this.uuidv4(), amountGreaterThan: null, amountUpTo: null, valueTypeID: 1002, value: value.esiEmployerContributionRate }
      // ]
  
      this.esiEmployeeContributionModel.subComponents = []
      this.esiEmployeeContributionModel.subComponents.push(this.esiEmployerContributionModel)
  
        if (this.esiEmployeeContributionModel._id && this.esiEmployeeContributionModel._id.length > 0) {
          this._salarycomponentService
            .AsyncUpdate(this.esiEmployeeContributionModel._id, this.esiEmployeeContributionModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
        } else {
          this._salarycomponentService
            .AsyncAdd(this.esiEmployeeContributionModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been added successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
        }
     
  }

  public async onPTSubmit(value: any, isValid: boolean) {
    
      if(!value.ptNumber){
        this.showNotification("top", "right", "PT Number is required !!", "danger");
        return;
      }
  
      this.submitted = true;
  
      this.professionalTaxModel.payHeadName = "Professional Tax";
      this.professionalTaxModel.displayName = "Professional Tax";
      this.professionalTaxModel.statutoryNumber = value.ptNumber;
  
      this.professionalTaxModel.payHeadTypeID = 103;
      this.professionalTaxModel.statutoryPayTypeID = 202;
      this.professionalTaxModel.calculationTypeID = 501;
      this.professionalTaxModel.calculationPeriodID = 702;
  
      this.professionalTaxModel.affectNetSalaryOn = true;
      this.professionalTaxModel.canShowInPayslipOn = true;
      this.professionalTaxModel.computationMethodID = 901;
      this.professionalTaxModel.considerforEPFContributionOn = false;
      this.professionalTaxModel.considerforESIContributionOn = false;
      this.professionalTaxModel.considerforGratuityOn = false;
      this.professionalTaxModel.taxableComponentOn = false;
  
      this.professionalTaxModel.paySlabs = value.ptSlabs
  
      //console.log(this.professionalTaxModel)
        if (this.professionalTaxModel._id && this.professionalTaxModel._id.length > 0) {
          this._salarycomponentService
            .AsyncUpdate(this.professionalTaxModel._id, this.professionalTaxModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been updated successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
        } else {
          this._salarycomponentService
            .AsyncAdd(this.professionalTaxModel)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Salary component has been added successfully!!', 'success');
                this.ngOnInit();
              }
            })
            .catch((e) => { })
            .finally(() => {
              this.submitted = false;
            });
        }
    }
    
}
