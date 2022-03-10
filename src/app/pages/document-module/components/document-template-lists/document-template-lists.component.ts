import { Component, OnInit } from '@angular/core';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import swal from 'sweetalert2';

@Component({
  selector: 'app-document-template-lists',
  templateUrl: './document-template-lists.component.html',
  styles: [
  ]
})
export class DocumentTemplateListsComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  Integrated: any [] = [];
  NotIntegrated: any [] = [];
  formLists: any [] = [];
  data: any [] = [];
  disableBtn: boolean = false;

  constructor() {
    super();
   }

   async ngOnInit()  {
    try {
      await super.ngOnInit();
      await this.initializeVariabels()
      await this.getForms()
      await this.LoadData()
      await this.getIntegrated()
      await this.getNotIntegrated()
    } catch(error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  Save() {}

  Update() {}

  Delete() {}

  ActionCall() {}

  async initializeVariabels() {
    this.Integrated = [];
    this.NotIntegrated = [];
    this.formLists = [];
    this.data = [];
    this.isLoading = true;
    this.disableBtn = false;
    return;
  }

  async getForms() {

    var url = "forms/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "formtype", "searchvalue": "document", "criteria": "eq"});
    postData["sort"] = { "formorder": -1 };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data && data[0]){
          this.formLists = [];
          this.formLists = data;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  async LoadData() {

    var url = "forms/filter/view"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formtype", "searchvalue": "document", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": "document", "criteria": "ne"});
    postData["sort"] = { "formorder": -1 };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data && data[0]){
          this.data = [];
          this.data = data;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
    
  }

  async getIntegrated() {
    this.Integrated = [];
    this.Integrated = this.data.filter(p=>p.property && p.property.refid);
    return;
  }

  async getNotIntegrated() {
    this.NotIntegrated = [];
    this.data.forEach(element => {
      if(element.property && element.property.refid) {
      } else {
        element.disable = false;
        var formObj = this.Integrated.find(p=>p.property && p.property.refid == element._id);
        if(formObj) {
          element.disable = true;
        }
        this.NotIntegrated.push(element);
      }
    });
  }

  async onActivate(integration: any) {
    
    var formObj = this.formLists.find(p=>p._id == integration._id);
    if(formObj) {

      var newObj = {...formObj};

      if(!newObj.property) {
        newObj.property = {};
      }

      newObj.property["refid"] = integration._id;
      
      newObj.dispalyformname = newObj.formname;
      newObj.formname = newObj.formname + " " + this.makeid(5);

      newObj.dispalyformname = newObj.formname;
      delete newObj._id;

      var url = "forms/";
      var method = "POST";

      try {
        this.disableBtn = true;
        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, newObj)
          .then(async (data: any) => {
            
            if (data) {
              
              super.showNotification('top', 'right', "Document activated !!", 'success');
              this.disableBtn = false;
              await this.createFormField(integration._id, data.formname, data._id)
              await this.createFormData(data._id)
              await this.ngOnInit();
            }
          });
      } catch (e) {
        this.disableBtn = false;
        super.showNotification('top', 'right', "Something went wrong !!", 'danger');
      }

    }
  }

  async createFormField(oldformid: any, newformname: any, newformid: any) {

    var url = "formfields/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formid", "searchvalue": oldformid, "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        
        if(data && data[0]){

          data.forEach(element => {

            element.formid = newformid;
            element.formname = newformname;
            element.formorder = element?.formorder?.toString();
            

            var url = "formfields";
            var method = "POST";

            let postData = {};
            postData = element;
            delete postData["_id"];
            
            return this._commonService
              .commonServiceByUrlMethodDataAsync(url, method, postData)
              .then( (data: any) => {
                if(data) {

                }
            }, (error) =>{
              console.error(error);
            });


          });
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  async createFormData(newformid: any) {

    var url = "formdatas";
    var method = "POST";

    let postData = {};
    postData["onModel"] = "User";
    postData["onModelAddedby"] = "User";
    postData["status"] = "active";
    postData["formid"] = newformid;
    postData["property"] = {};
    postData["property"]["shared"] = [this._loginUserId];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          return;
        }
    }, (error) =>{
      console.error(error);
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
    }).then(async (result) => {
      if (result.value) {
        try {
          this.disableBtn = true;
          await varTemp.deleteFormfield(id)
          await varTemp.deleteFormData(id)
          await varTemp.deleteForm(id)
        } catch(error) {
          console.log("error", error)
          varTemp.disableBtn = false;
          varTemp.showNotification('top', 'right', 'Error Occured !!', 'danger');
        } finally {
          this.showNotification('top', 'right', 'Configured template deleted successfully !!', 'success');
          this.disableBtn = false;
          await varTemp.ngOnInit()
        }
        
      }
    });
  }

  async deleteForm(id: any) {

    var url = "forms/";
    var method = "DELETE";

    return this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
      .then(async (data) => {
        if (data) {
          return;
        }
      }, (error) =>{
          console.error(error);
      });
  }

  async deleteFormfield(formid: any) {

    var url = "formfields/removeall";
    var method = "POST";

    let postData = {};
    postData["formid"] = formid;
    
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  async deleteFormData(formid: any) {


    var url = "formdatas/removeall";
    var method = "POST";

    let postData = {};
    postData["formid"] = formid;
    
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
