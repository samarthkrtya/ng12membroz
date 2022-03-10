import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { FormsService } from '../../../../core/services/forms/forms.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-integration-lists',
  templateUrl: './integration-lists.component.html',
})
export class IntegrationListsComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  Integrated: any[] = [];
  notIntegrated: any[] = [];

  isLoading: boolean = false;
  disableBtn: boolean = false;

  type : string;


  constructor(
    private route: ActivatedRoute,
    private _formService: FormsService,
    private _formdataService: FormdataService,
  ) {
    super();
    this.isLoading = true;

    this.route.params.forEach((param)=>{
      this.type = param['type'];
    })
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
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "integration", "criteria": "eq", "datatype": "text" });
    postData['search'].push({ "searchfield": "property.paymentgateway", "searchvalue": true, "criteria": "eq", "datatype": "boolean" });
    
    await this._formService
      .AsyncGetByfilterView(postData)
      .then((data: []) => {
        this.Integrated = [];
        if (data.length > 0) {
          data.forEach((form: any) => {            
            if(this.type && this.type == 'paymentgateway'){
              if (form.formdata && form.formdata._id && form.property["paymentgateway"]) {
                this.Integrated.push(form);
              }
            }else{
              if (form.formdata && form.formdata._id) {
                this.Integrated.push(form);
              }
            }
          });
          this.Integrated.map(a => a.configurl = '/pages/dynamic-forms/form/' + a._id + '/' + a.formdata._id);
          this.Integrated.map(a => a.readmoreurl = a.property.url);
        }
        this.isLoading = false;
      }).catch((e) => {
        this.isLoading = false;
      });
  }

  async getForms() {

    this.isLoading = true;
    let postData = {} , i;
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "integration", "criteria": "eq", "datatype": "text" });
    //postData['search'].push({ "searchfield": "property.paymentgateway", "searchvalue": true, "criteria": "eq", "datatype": "boolean" });
    
    await this._formService
      .GetByfilterAsyncRefresh(postData)
      .then((data: []) => {
        this.notIntegrated = [];        
        if (data.length > 0) {          
           data.forEach((form: any) => {   
            if(this.type && this.type == 'paymentgateway'){
              if (form.property && form.property["paymentgateway"]) {                
                i = this.Integrated.find(a=>a._id ==  form._id);
                if(!i){  this.notIntegrated.push(form); }
              }
            }else{
              i = this.Integrated.find(a=>a._id ==  form._id);
              if(!i){  this.notIntegrated.push(form); }
            }
          });
          this.notIntegrated.map(a => a.readmoreurl = a.property.url);
        }
        this.isLoading = false;
      }).catch((e) => {
        this.isLoading = false;
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
          varTemp.disableBtn = true;

          varTemp._formdataService
            .Delete(id)
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


  onActivate(integration: any) {

    var model = {};
    model['formid'] = integration._id;
    model['property'] = integration.property;

    this.disableBtn = true
    try {
      this._formdataService
        .Add(model)
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (data: any) => {
          if (data) {
            super.showNotification('top', 'right', "Integration activated !!", 'success');
            this.disableBtn = false;
            await this.ngOnInit();
          }
        });
    } catch (e) {
      this.disableBtn = true;
      super.showNotification('top', 'right', "Something went wrong !!", 'danger');
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
