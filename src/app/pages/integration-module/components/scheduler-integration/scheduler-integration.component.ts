import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { DynamicSubListComponent } from '../../../../shared/dynamic-sublist/dynamic-sublist.component';
import { CommonService } from '../../../../core/services/common/common.service';
import swal from 'sweetalert2';
import { FormsService } from '../../../../core/services/forms/forms.service';

declare var $: any;
@Component({
  selector: 'app-scheduler-integration',
  templateUrl: './scheduler-integration.component.html',
})
export class SchedulerIntegrationComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy , AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;
  
  selectedUsers: any[] = [];
  selectedFormdata: any = {};
  selectedForm: any = {};
  Integrated: any[] = [];
  NotIntegrated: any[] = [];

  sharedVisibility: boolean;
  disableBtn: boolean = false;
  isLoading: boolean = false;

  constructor(
    private _commonService: CommonService,
    private ref: ChangeDetectorRef,
    private _formsService: FormsService
  ) {
    super();

  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getForms();
      await this.getNotForms();

      this.isLoading = false;
    } catch (error) {
      console.error(error)
    } finally {
    }
  }
  
  ngAfterViewInit() {
    this.ref.detectChanges();
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.selectedUsers = [];
    this.Integrated = [];
    this.selectedFormdata = {};
    this.selectedForm = {};
    this.sharedVisibility = false;
    return;
  }

  async getForms() {

    var url = "forms/filter/view";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "schedule", "criteria": "eq", "datatype": "text" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        
        if (data) {
          this.Integrated = [];
          
          data.forEach((form: any) => {
            form.degnurl = '/pages/setup/form-fields/' + form.formname;
            form.configurl = '/pages/setup/form-fields/' + form.formname;
            if (form.formdata && form.formdata._id) {
              form.configurl = '/pages/integration-module/survey-integration/configuration/' + form._id + '/' + form.formdata._id;
              this.Integrated.push(form);
            }
          });

        }
      })
  }


  async getNotForms() {

    this.isLoading = true;
    
    let postData = {} , i;
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "schedule", "criteria": "eq", "datatype": "text" });
    postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    
    return this._formsService
      .GetByfilterAsyncRefresh(postData)
      .then((data: []) => {

        this.NotIntegrated = [];
        if (data.length > 0) {
           data.forEach((form: any) => {
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

  openModel(value: any) {
    this.selectedForm = value;
    this.selectedFormdata = this.selectedForm && this.selectedForm.formdata ? this.selectedForm.formdata : {};
    if (this.selectedFormdata && this.selectedFormdata.property && this.selectedFormdata.property.shared && this.selectedFormdata.property.shared.length > 0) {
      this.selectedUsers = this.selectedFormdata.property.shared;
    }
    this.sharedVisibility = true;
    this.ref.detectChanges();
  }

  async onActivate(integration: any) {
    
    if (integration.property) {
      var url = "formdatas/";
      var method = "POST";
      var model = {};
      model['formid'] = integration._id;
      model['property'] = integration.property;
      // model['property'] = {
      //   'scheduleaction': integration.workflowid.scheduleaction,
      //   'criteria': integration.workflowid.criteria,
      // };
      //console.log(model)
      try {
        this.disableBtn = true;
        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model)
          .then((data: any) => {
            if (data) {
              
              super.showNotification('top', 'right', "Integration activated !!", 'success');
              this.disableBtn = false;
              this.ngOnInit();
            }
          });
      } catch (e) {
        this.disableBtn = false;
        super.showNotification('top', 'right', "Something went wrong !!", 'danger');
      }
    } else {
      super.showNotification('top', 'right', "No configuration available, please configure workflow !!", 'danger');
    }
  }

  getSubmittedData(postData: any) {

    var url = "formdatas/" + this.selectedFormdata._id;
    var method = "PUT";

    if (this.selectedFormdata.property.shared == undefined) {
      this.selectedFormdata.property.shared = []
    }

    this.selectedFormdata.property.shared = postData;
    this.subCompnt.isDisable = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.selectedFormdata)
      .then((data: any) => {
        if (data) {
          this.subCompnt.isDisable = false;
          $('#myModal').modal('hide');
          this.ngOnInit();
          return;
        }
      });
  }

  
  onClose() {
    this.sharedVisibility = false;
    this.subCompnt.initializeVariable();
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
    }).then(async (result) => {
      if (result.value) {
        try {
          var url = "formdatas/";
          var method = "DELETE";
          varTemp.disableBtn = true;
          await varTemp._commonService
            .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
            .then(async (data) => {
              if (data) {
                varTemp.showNotification('top', 'right', 'Configured integration deleted successfully !!', 'success');
                varTemp.disableBtn = false;
                await varTemp.ngOnInit()
              }
            });
        } catch (e) {
          varTemp.disableBtn = false;
          varTemp.showNotification('top', 'right', 'Error Occured !!', 'danger');
        }
      }
    });
  }


}
