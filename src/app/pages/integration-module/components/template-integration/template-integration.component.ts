import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { DynamicSubListComponent } from '../../../../shared/dynamic-sublist/dynamic-sublist.component';
import { CommonService } from '../../../../core/services/common/common.service';


import swal from 'sweetalert2';


declare var $: any;
@Component({
  selector: 'app-template-integration',
  templateUrl: './template-integration.component.html',
})
export class TemplateIntegrationComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy, AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  selectedUsers: any[] = [];
  selectedFormdata: any = {};
  selectedForm: any = {};
  Integrated: any[] = [];
  notIntegrated: any[] = [];
  sharedVisibility: boolean;
  isDisable: boolean = false;
  isLoading: boolean = false;

  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;

  constructor(
    private _commonService: CommonService,
    private ref: ChangeDetectorRef
  ) {
    super();
  }

  async ngOnInit() {
    this.isDisable = false;
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getForms();
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
    this.notIntegrated = [];
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
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "document", "criteria": "eq", "datatype": "text" });
    postData['search'].push({ "searchfield": "property", "searchvalue": true, "criteria": "exists", "datatype": "boolean" });
    postData['search'].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
    postData['search'].push({ "searchfield": "branchid", "searchvalue": false, "criteria": "exists", "datatype": "boolean", "cond": "or" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          //console.log("data==>", data);
          this.Integrated = [];
          this.notIntegrated = [];
          data.forEach((form: any) => {
            form.configurl = '/pages/setup/form-fields/' + form.formname;
            form.degnurl = '/pages/document-module/form/' + form.title;
            if (form.formdata && form.formdata._id) {
              this.Integrated.push(form);
            } else {
              this.notIntegrated.push(form);
            }
          });
        }
      })
  }

  openModel(value: any) {

    this.sharedVisibility = false;
    this.selectedForm = value;
    this.selectedFormdata = this.selectedForm && this.selectedForm.formdata ? this.selectedForm.formdata : {};
    if (this.selectedFormdata && this.selectedFormdata.property && this.selectedFormdata.property.shared && this.selectedFormdata.property.shared.length > 0) {
      this.selectedUsers = this.selectedFormdata.property.shared;
    }
    this.sharedVisibility = true;
    this.ref.detectChanges();
  }

  getSubmittedData(postData: any) {

    var url = "formdatas";
    var method = "PUT";

    if (this.selectedFormdata.property.shared == undefined) {
      this.selectedFormdata.property.shared = []
    }

    this.selectedFormdata.property.shared = postData;
    this.subCompnt.isDisable = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.selectedFormdata, this.selectedFormdata._id)
      .then((data: any) => {
        if (data) {
          this.subCompnt.isDisable = false;
          this.showNotification("top", "right", "Data updated successfully !!", "success")
          $('#myModal').modal('hide');
          this.ngOnInit();
          return;
        }
      }).catch((e) => {
        this.subCompnt.isDisable = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger")
        $('#myModal').modal('hide');
      })

  }


  async onActivate(integration: any) {

    // if (integration.workflowid && integration.workflowid._id) {
    var url = "formdatas/";
    var method = "POST";

    var model = {};
    model['formid'] = integration._id;
    model['property'] = integration.property;
    // model['property'] = {
    //   'scheduleaction': integration.workflowid.scheduleaction,
    //   'criteria': integration.workflowid.criteria,
    // };

    this.isDisable = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then((data: any) => {
        if (data) {
          super.showNotification('top', 'right', "Integration activated !!", 'success');
          this.isDisable = false;

          this.ngOnInit();
        }
      }).catch((e) => {

        this.isDisable = false;
        super.showNotification('top', 'right', "Something went wrong !!", 'danger');
      });

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

          varTemp.isDisable = true;

          varTemp._commonService
            .commonServiceByUrlMethodIdOrData(url, method, id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (data) => {
              if (data) {
                varTemp.showNotification('top', 'right', 'Configured integration deleted successfully !!', 'success');
                varTemp.isDisable = false;
                await varTemp.ngOnInit()
              }
            });
        } catch (e) {
          varTemp.isDisable = false;
          varTemp.showNotification('top', 'right', 'Error Occured !!', 'danger');
        }
      }
    });
  }

  onClose() {
    this.sharedVisibility = false;
    this.subCompnt.initializeVariable();
  }


}
