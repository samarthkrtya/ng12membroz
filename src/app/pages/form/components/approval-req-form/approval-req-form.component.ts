import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-approval-req-form',
  templateUrl: './approval-req-form.component.html'
})
export class ApprovalReqFormComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  isLoadingdata: boolean;

  schemaname: any;

  today: Date = new Date();

  bindIdData: any;
  status: string;

  formFields: any[] = [];

  disableBtn: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    super();

    this._route.params.forEach((params) => {
      this._formName = params["formname"];
      this.schemaname = params["schemaname"];
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    try {
      this.isLoadingdata = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getDataById();
      await this.LoadFormFields();
      this.isLoadingdata = false;
    } catch (error) {
      this.isLoadingdata = false;
      console.error(error);
    }
  }


  async getDataById() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "_id", searchvalue: this.bindId, criteria: "eq", "datatype": "ObjectId" });


    var url = `${this.schemaname}/filter`;
    var method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data.length > 0) {
          this.bindIdData = data[0];
          this.disableBtn = this.bindIdData.status != 'active';
        }
      });
  }


  async LoadFormFields() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "formid", searchvalue: this.formObj._id, criteria: "eq", "datatype": "ObjectId" });
    postData["sort"] = "formorder";

    var url = "formfields/filter";
    var method = "POST";
    const group = {};

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data.length > 0) {
          this.formFields = [];
          data.forEach((element) => {
            for (let key in this.bindIdData["property"]) {
              if (element.fieldname == key.toLowerCase()) {
                if (element.fieldtype == "datepicker") {
                  if (this.bindIdData["property"][key] == null || this.bindIdData["property"][key] == "") {
                    element.value = null;
                  } else {
                    element.value = new Date(this.bindIdData["property"][key]);
                  }
                } if (element.fieldtype == "gallery") {
                    element.value = this.bindIdData["property"][key];
                    element.isArray =  Array.isArray(this.bindIdData["property"][key])
                } else {
                  element.value = this.bindIdData["property"][key];
                }
                group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
                this.formFields.push(element);
              }
            }
          });
          group['declinereason'] = new FormControl('');
          this.form = this.fb.group(group);
          
        }
      }, (err) => {
        console.error("err", err);
      });
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.formFields = [];
    return;
  }

  async onSubmit() {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${this.status} it!`,
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {

        this.disableBtn = true;

        var model = {};
        model["wfstatus"] = this.status;

        var url = `${this.schemaname}/workflow`;
        var method = "POST";

        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
          .then((data: any) => {
            this.disableBtn = false;
            var str = this.formObj.dispalyformname;
            this.showNotification("top", "right", `${str}  ${this.status} successfully!!!`, "success");
            this._router.navigate(['/pages/dynamic-list/list/'+this._formName])
          }).catch((e)=>{
            console.error(e);
            this.disableBtn = false;
            this.showNotification("top", "right", `Something went wrong !!`, "danger");
          });
      }
    });
  }



 async onDecline(value : any, valid : boolean){
    this.disableBtn = true;

    var model = {};
    model["wfstatus"] = this.status;
    model["declinereason"] = value.declinereason ? value.declinereason : null;

    var url = `${this.schemaname}/workflow`;
    var method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data: any) => {
        this.disableBtn = false;
        this._router.navigate(['/pages/dynamic-list/list/'+this._formName])
        var str = this.formObj.dispalyformname;
        this.showNotification("top", "right", `${str}  ${this.status} successfully!!!`, "success");
      }).catch((e)=>{
        console.error(e);
        this.disableBtn = false;
        this.showNotification("top", "right", `Something went wrong !!`, "danger");
      });
  }



  viewDetail(){
    
    var id  = this.bindIdData.contextid._id;
    var formid  = this.bindIdData.formid._id;
    var url ,finalurl;
    if(this.bindIdData.onModel == 'User' && id){
      url = `/pages/user/profile/${id}/${formid}`;
    }
    finalurl = `${window.location.origin}/#${url}`
    if(url && finalurl){
      // this._router.navigate([finalurl]);
      window.open(finalurl, '_blank');
    }
  }

}
