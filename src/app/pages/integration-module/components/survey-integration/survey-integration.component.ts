import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router'

import { FormsService } from '../../../../core/services/forms/forms.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

import swal from 'sweetalert2';

@Component({
  selector: 'app-survey-integration',
  templateUrl: './survey-integration.component.html',
})
export class SurveyIntegrationComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  Integrated: any[] = [];
  NotIntegrated: any[] = [];

  isLoading: boolean = false;
  disableBtn: boolean = false;

  constructor(
    private _formService: FormsService,
    private _commonService: CommonService,
    public _router: Router,
  ) {
    super();
    this.isLoading = true;
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getFormsWithFormdata();
    await this.getForms();
  }

  async getFormsWithFormdata() {

    this.isLoading = true;
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "surveyform", "criteria": "eq", "datatype": "text" });
    
    await this._formService
      .AsyncGetByfilterView(postData)
      .then((data: []) => {
        this.Integrated = [];
        if (data.length > 0) {
          data.forEach((form: any) => {
            form.degnurl = '/pages/setup/form-fields/' + form.formname;
            if (form.formdata && form.formdata._id) {
              form.configurl = '/pages/integration-module/survey-integration/configuration/' + form._id + '/' + form.formdata._id;
              this.Integrated.push(form);
            }
          });
        }
        this.isLoading = false;
      }).catch((e)=>{
        this.isLoading = false;
      });
  }



  async getForms() {

    this.isLoading = true;
    let postData = {} , i;
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "surveyform", "criteria": "eq", "datatype": "text" });
    
    await this._formService
      .GetByfilterAsyncRefresh(postData)
      .then((data: []) => {
        this.NotIntegrated = [];
        if (data.length > 0) {
           data.forEach((form: any) => {
            form.degnurl = '/pages/setup/form-fields/' + form.formname;
            i = this.Integrated.find(a=>a._id ==  form._id);
            if(!i){  this.NotIntegrated.push(form); }
          });
          this.NotIntegrated.map(a => a.readmoreurl = a.property.url);
        }
        this.isLoading = false;
      }).catch((e) => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async onActivate(integration: any) {

    if (integration.workflowid && integration.workflowid._id) {
      var url = "formdatas/";
      var method = "POST";

      var model = {};
      model['formid'] = integration._id;
      model['property'] = {};
      model['property'] = {
        'scheduleaction': integration.workflowid.scheduleaction,
        'criteria': integration.workflowid.criteria,
      };

      try {
        this.disableBtn = true;
        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model)
          .then((data: any) => {
            if (data) {

              super.showNotification('top', 'right', "Integration activated !!", 'success');
              this.disableBtn = false;
            }
          });
          await this.ngOnInit();
      } catch (e) {
        this.disableBtn = false;
        super.showNotification('top', 'right', "Something went wrong !!", 'danger');
      }
    } else {
      super.showNotification('top', 'right', "No configuration available, please configure workflow !!", 'danger');
    }
  }

  onDelete(id: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        try {
          var url = "formdatas/";
          var method = "DELETE";

          varTemp.disableBtn = true;

          varTemp._commonService
            .commonServiceByUrlMethodIdOrData(url, method, id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (data) => {
              if (data) {
                varTemp.showNotification('top', 'right', 'Configured integration deleted successfully !!', 'success');
                varTemp.disableBtn = false;
                await this.ngOnInit();
              }
            });
        } catch (e) {
          varTemp.disableBtn = false;
          varTemp.showNotification('top', 'right', 'Error Occured !!', 'danger');
        }
      }
    });
  }


  redirect() {
    this._router.navigateByUrl("/pages/integration-module/survey-integration/configureform")
  }
}
