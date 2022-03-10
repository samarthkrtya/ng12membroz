import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DispositionModel } from '../../../../core/models/disposition/disposition.model';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';

import { FormsService } from '../../../../core/services/forms/forms.service';

declare var $: any;
import swal from 'sweetalert2';
@Component({
  selector: 'app-form-disposition',
  templateUrl: './form-disposition.component.html',
  styles: [
    `
      /* Loading Stuff Start */

/* Absolute Center Spinner */
.loading {
    position: fixed;
    z-index: 999;
    height: 2em;
    width: 2em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  
  /* Transparent Overlay */
  .loading:before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
      background: radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0, .8));
  
    background: -webkit-radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0,.8));
  }
  
  /* :not(:required) hides these rules from IE9 and below */
  .loading:not(:required) {
    /* hide "loading..." text */
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
  }
  
  .loading:not(:required):after {
    content: '';
    display: block;
    font-size: 10px;
    width: 1em;
    height: 1em;
    margin-top: -0.5em;
    -webkit-animation: spinner 1500ms infinite linear;
    -moz-animation: spinner 1500ms infinite linear;
    -ms-animation: spinner 1500ms infinite linear;
    -o-animation: spinner 1500ms infinite linear;
    animation: spinner 1500ms infinite linear;
    border-radius: 0.5em;
    -webkit-box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  }
  
  /* Animation */
  
  @-webkit-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-moz-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-o-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  /* Loading Stuff End */


  .mat-tab-label[aria-labelledby='hidden'] {
    display: none;
  }

    `
  ]
})
export class FormDispositionComponent  extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  roleLists: any [] = [];
  formWiseRoles: any [] = [];

  selectedform = new FormControl();
  formLists: any [] = [];
  selectedformfilteredOptions: Observable<string[]>;
  selectedformIsLoadingBox: boolean = false;

  dispositionLists: any [] = [];
  filteredDispositionLists: any [] = [];
  selectedDispositionid: any;

  callback: boolean = false;
  meeting: boolean = false;
  task: boolean = false;
  communication: boolean = false;

  isbranchwise: boolean = false;
  isLoadingData: boolean = false;
  

  _dispositionModel = new DispositionModel();
  disableSubmitBtn: boolean = false;
  dispositionRequiredError: boolean = false;

  generalVisibility: boolean = false;
  formsVisibility: boolean = false;
  rulesVisibility: boolean = false;
  permissionVisibility: boolean = false;

  formfieldEditData: any = {};

  disableBtn: boolean = false;

  dispositionIsDirty: boolean = false;
  callbackIsDirty: boolean = false;
  meetingIsDirty: boolean = false;
  taskIsDirty: boolean = false;
  communicationIsDirty: boolean = false;

  constructor(
    
  ) { 
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.LoadData()
    } catch (error) {
      console.error(error)
    } finally {
    }

    this.selectedformfilteredOptions = this.selectedform.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.formname),
        map(option => option ? this._selectedformfilter(option) : this.formLists.slice())
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    
    this.roleLists = [];
    this.formWiseRoles = [];

    this.formLists = [];
    this.selectedformIsLoadingBox = false;

    this.dispositionLists = [];
    this.filteredDispositionLists = [];
    this.selectedDispositionid = "";

    this.callback = false;
    this.meeting = false;
    this.task = false;
    this.communication = false;

    this.disableSubmitBtn = false;
    this.dispositionRequiredError = false;

    this.generalVisibility = true;
    this.formsVisibility = false;
    this.rulesVisibility = false;
    this.permissionVisibility = false;

    this.formfieldEditData = {};

    this.disableBtn = false;

    this.dispositionIsDirty = false;
    this.callbackIsDirty = false;
    this.meetingIsDirty = false;
    this.taskIsDirty = false;
    this.communicationIsDirty = false;

    this.isbranchwise = false;
    if(this._organizationsetting && this._organizationsetting.databasetype  && this._organizationsetting.databasetype == "branchwise"){
      this.isbranchwise = true;
    }
    return;
  }

  
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async LoadData() {
    try {
      await this.getAllForms()
      await this.getAllRoles()
      await this.getDispositionLists()
    } catch (error) {
      console.error(error)
    } finally {
      this.disableSubmitBtn = false;
      this.dispositionRequiredError = false;
      this.formfieldEditData = {};
      this.disableBtn = false;
    }
  }

  async getAllRoles() {

    var url = "roles/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          this.roleLists = [];
          this.roleLists = data;
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  async getAllForms() {

    
    let url = "forms/filter";
    let method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": ["member", "prospect", "promotion", "user"], "criteria": "in"});

    // return this._formsService
    //   .GetByfilterAsync(postData)
    
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method,postData)
      .then((data: any) => {
        if(data) {
          
          this.formLists = [];
          this.selectedformIsLoadingBox = false;

          if(data && data.length > 0) {
            data.forEach(element => {
              let obj = {
                id: element._id,
                name: element.dispalyformname,
                formname: element.formname
              }
              this.formLists.push(obj);
            });
          }
          
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  selectedformEnter() {
    const controlValue = this.selectedform.value;
    this.selectedform.setValue(controlValue);
  }

  async selectedformPreloaddata() {
    if (this.formLists.length == 0) {
      await this.getAllForms()
    }
  }

  selectedformHandleEmptyInput(event: any){
    if(event.target.value === '') {
      this.selectedform.setValue("");
      this.formLists = [];
    }
  }

  selectedformDisplayFn(user: any): string {
    return user && user.formname ? user.formname : '';
  }

  async selectedformOptionSelected(option: any) {
    
    this.selectedform.setValue(option.value);
    await this.getDispositionLists()
  }

  _selectedformfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.formLists
        .filter(option => {
          if(option.formname) {
            return option.formname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.formLists.slice();
    }
    return results;
  }

  async getDispositionLists() {

    if(this.selectedform && this.selectedform.value && this.selectedform.value.id) {

      var url = "dispositions/filter";
      var method = "POST";
          
      let postData = {};
      postData['search'] = [];
      postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
      postData["search"].push({"searchfield": "formid", "searchvalue": this.selectedform.value.id, "criteria": "eq"});
      
      this.isLoadingData = true;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( async (data: any) => {
          if(data) {

            this.dispositionLists = [];
            this.filteredDispositionLists = [];
            this.formWiseRoles = []; 

            this.dispositionLists = data;

            console.log("data", this.dispositionLists);
            
            if(this.dispositionLists && this.dispositionLists.length > 0) {

              this.dispositionLists.map(p=>p.selected = false);
              this.filteredDispositionLists = await this.list_to_tree(this.dispositionLists);

              console.log("filteredDispositionLists", this.filteredDispositionLists);

              if(this.selectedDispositionid && this.selectedDispositionid !== "") {
                var dispositionObj = this.dispositionLists.find(p=>p._id == this.selectedDispositionid)
                if(dispositionObj) {
                  dispositionObj.selected = true;
                  this._dispositionModel = dispositionObj;
                }
              } else {

                if(this.filteredDispositionLists.length > 0 ) {
                  this.selectedDispositionid = this.filteredDispositionLists[0]._id;
                  this.filteredDispositionLists[0]['selected'] = true;
                  this._dispositionModel = this.filteredDispositionLists[0];
                }
              }
              
              this.callback = false;
              this.meeting = false;
              this.task = false;
              this.communication = false;

              if(this._dispositionModel && this._dispositionModel.action) {
                switch(this._dispositionModel.action) {
                  case "callback":
                    this.callback = true;
                    this.meeting = false;
                    this.task = false;
                    this.communication = false;
                    break;
                  case "meeting":
                    this.callback = false;
                    this.meeting = true;
                    this.task = false;
                    this.communication = false;
                    break;
                  case "task":
                    this.callback = false;
                    this.meeting = false;
                    this.task = true;
                    this.communication = false;
                    break;
                  case "communication":
                    this.callback = false;
                    this.meeting = false;
                    this.task = false;
                    this.communication = true;
                    break;
                  default:
                    this.callback = false;
                    this.meeting = false;
                    this.task = false;
                    this.communication = false;
                }
              }
              await this.getRolesByform();
             
            }
            this.isLoadingData = false;
            return;
          }else{
             this.isLoadingData = false;
          }
        }, (error) =>{
          console.error(error);
          this.isLoadingData = false;
        });
    }
  }

  async list_to_tree(list: any) {

    var map = {}, node, roots = [], i;
    let cnt = 0;
    for (i = 0; i < list.length; i += 1) {
      if (!list[i].parentid) {
        map[list[i]._id] = cnt;
        cnt++;
      }
      list[i].children = [];
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parentid) {
        var j, n;
        for (j = 0; j < list.length; j += 1) {
          n = list[j];
          var parentid = node.parentid && node.parentid._id ? node.parentid._id : node.parentid;
          if (n._id == parentid) {
            n.children.push(node);
          }
        }
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async getRolesByform() {

    this.formWiseRoles = [];
    this.roleLists.forEach(element => {
    var isSelected: boolean = false;

      // if (element.permissions && element.permissions.length !== 0) {
      //   var permissions: any[] = element.permissions;
      //   var permissionObj = permissions.find(p => p.formname == this.selectedform.value.formname);
      //   if (permissionObj) {
      //     if (permissionObj.dispositionpermission && permissionObj.dispositionpermission.length !== 0) {
      //       var dispositionpermission: any[] = permissionObj.dispositionpermission;
      //       var dispositionpermissionObj = dispositionpermission.find(p => p == this.selectedDispositionid);
      //       if (dispositionpermissionObj) {
      //         isSelected = true;
      //       }
      //     }
      //   }
      // }

      if (element.dispositionpermissions && element.dispositionpermissions.length !== 0) {
        var dispositionpermissionObj = element.dispositionpermissions.find(p => p._id == this.selectedDispositionid);
        if (dispositionpermissionObj) {
          isSelected = true;
        }
      }

      let obj = {
        id: element._id, name: element.rolename, selected: isSelected
      }
      this.formWiseRoles.push(obj);
    });
    return;
  }

  showOptions(event:MatCheckboxChange, action: any): void {
    
    this._dispositionModel.action = "";

    this.callback = false;
    this.meeting = false;
    this.task = false;
    this.communication = false;

    if(event.checked) {
      this._dispositionModel.action = action;
      switch(action) {
        case "callback":
          this.callback = true;
          break;
        case "communication":
          this.communication = true;
          break;
        case "meeting":
          this.meeting = true;
          break;
        case "task":
          this.task = true;
          break;
        default:
      }
    }

    switch(action) {
      case "callback":
        this.callbackIsDirty = true;
        break;
      case "communication":
        this.communicationIsDirty = true;
        break;
      case "meeting":
        this.meetingIsDirty = true;
        break;
      case "task":
        this.taskIsDirty = true;
        break;
      default:
    }
    
  }

  dispositionChange(value: any) {
    if (value.dirty) {
      this.dispositionIsDirty = true;
    }
  }


  checkDirty() {
    if(this.callbackIsDirty || this.communicationIsDirty || this.meetingIsDirty || this.taskIsDirty || this.dispositionIsDirty) {
      this.showNotification('top', 'right', 'You have unsaved changes!!!', 'danger');
      return;
    }
  }

  addSubDisposition(item: any) {

    
    this.checkDirty()

    this.disableBtn = true;
    
    let postData = {};
    postData["disposition"] = "New Disposition";
    postData["parentid"] = null;
    postData["parentid"] = item._id;
    postData["action"] = "";
    postData["formid"] = this.selectedform.value.id;
    postData["fields"] = [];
    postData["status"] = "active";
    
    var url = "dispositions";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( async (data: any) => {
        if(data) {
          this.selectedDispositionid = data._id;
          this.LoadData()
          return;
        }
    }, (error) =>{
        console.error(error);
    });
  }

  async edit(item: any) {

    this.checkDirty()

    this.disableBtn = true;

    this.dispositionLists.map(p=>p.selected = false);

    this.filteredDispositionLists = [];
    this.filteredDispositionLists = await this.list_to_tree(this.dispositionLists);

    var dispositionObj = this.dispositionLists.find(p=>p._id == item._id)

    if(dispositionObj) {

      dispositionObj.selected = true;
      this._dispositionModel = dispositionObj;

      this.selectedDispositionid = dispositionObj._id;

      this.callback = false;
      this.meeting = false;
      this.task = false;
      this.communication = false;
      

      if(this._dispositionModel && this._dispositionModel.action) {
        switch(this._dispositionModel.action) {
          case "callback":
            this.callback = true;
            this.meeting = false;
            this.task = false;
            this.communication = false;
            break;
          case "meeting":
            this.callback = false;
            this.meeting = true;
            this.task = false;
            this.communication = false;
            break;
          case "task":
            this.callback = false;
            this.meeting = false;
            this.communication = false;
            this.task = true;
            break;
          case "communication":
            this.callback = false;
            this.meeting = false;
            this.communication = true;
            this.task = false;
            break;
          default:
            this.callback = false;
            this.meeting = false;
            this.task = false;
            this.communication = false;
        }
      }

      await this.getRolesByform()
    }
    setTimeout(() => {
      this.disableBtn = false;  
    }, 100);
    
    document.querySelector('.main-panel').scrollTop = 0;
    return;
  }

  delete(id: any) {

    this.checkDirty()
    
     const varTemp = this;

    swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this  file!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass:{
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.deletefunction(id);
      } else {
        swal.fire({
            title: 'Cancelled',
            text: 'Your  file is safe :)',
            icon: 'error',
            customClass:{
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
        });
      }
    })
  }

  async deletefunction(id: any) {

    this.disableBtn = true;
    
    let url = "dispositions/";
    let method = "DELETE";

    
    return this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, id)
      .subscribe((data: any) => {
        if(data) {
          
          this.showNotification('top', 'right', 'Disposition has been deleted successfully!!!', 'success');
          if (this.selectedform && this.selectedform.value && this.selectedform.value.id) {
            this.ngOnInit();
          }
        }
        
      })
  }

  tabClick(event: MatTabChangeEvent) {
    
    this.generalVisibility = false;
    this.formsVisibility = false;
    this.rulesVisibility = false;
    this.permissionVisibility = false;

    const tab = event.tab.textLabel;
    switch(tab) {
      case "General Setup":
        this.generalVisibility = true;
        break;
      case "Forms":
        this.formsVisibility = true;
        break;
      case "Rules":
        this.rulesVisibility = true;
        break;
      case "Role Permission":
        this.permissionVisibility = true;
        break;
      default:
        this.generalVisibility = true;
    }
  }

  async onDispositionSubmit() {

    if(this._dispositionModel.action !== "" && this._dispositionModel.fields && this._dispositionModel.fields.length == 0) {
      this.showNotification('top', 'right', 'Please Add atleast One Field!!!', 'danger');
      return;
    }

    if (this._dispositionModel.disposition == "") {
      this.dispositionRequiredError = true;
      return;
    }

    this.disableSubmitBtn = true;

    await this.saveRolePermission()
    

    this._dispositionModel.formid = this._dispositionModel.formid['_id'] ? this._dispositionModel.formid['_id'] : this._dispositionModel.formid;

    var url = "dispositions/" + this._dispositionModel._id;
    var method = "PUT";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this._dispositionModel)
      .then( async (data: any) => {
        if(data) {
          this.showNotification('top', 'right', 'Disposition has been updated successfully!!!', 'success');
          this.selectedDispositionid = this._dispositionModel._id;

          this.dispositionIsDirty = false;
          this.callbackIsDirty = false;
          this.meetingIsDirty = false;
          this.taskIsDirty = false;
          this.communicationIsDirty = false;
          await this.LoadData();
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  async saveRolePermission() {

    // if (this.formWiseRoles && this.formWiseRoles.length !== 0) {
    //   this.formWiseRoles.forEach(element => {
    //     this.roleLists.forEach(elementRole => {
    //       if (elementRole._id == element.id) {
    //         if (elementRole.permissions && elementRole.permissions.length !== 0) {
    //           let len = elementRole.permissions.length;
    //           let cnt = 0;
    //           let i = 0;
    //           elementRole.permissions.forEach(elementPermission => {
    //             if (elementPermission.formname == this.selectedform.value.formname) {
    //               i++;
    //               if (element.selected) {
    //                 if (elementPermission.dispositionpermission && elementPermission.dispositionpermission.length !== 0) {
    //                   var dispositionpermission: any[] = elementPermission.dispositionpermission;
    //                   var dispositionpermissionObj = dispositionpermission.find(p => p == this.selectedDispositionid);
    //                   if (!dispositionpermissionObj) {
    //                     elementPermission.dispositionpermission.push(this.selectedDispositionid);
    //                   }
    //                 } else {
    //                   elementPermission.dispositionpermission = [];
    //                   elementPermission.dispositionpermission.push(this.selectedDispositionid);
    //                 }
    //               } else {
    //                 if (elementPermission.dispositionpermission && elementPermission.dispositionpermission.length !== 0) {
    //                   const index = elementPermission.dispositionpermission.indexOf(this.selectedDispositionid);
    //                   if (index > -1) {
    //                     elementPermission.dispositionpermission.splice(index, 1);
    //                   }
    //                 }
    //               }
    //             }
    //             cnt++;
    //             if (cnt == len && i == 0 && element.selected) {
    //               let obj = {
    //                 formname: this.selectedform.value.formname,
    //                 dispositionpermission: [this.selectedDispositionid]
    //               }
    //               elementRole.permissions.push(obj);
    //             }
    //           });
    //         } else {
    //           if (element.selected) {
    //             let obj = {
    //               formname: this.selectedform.value.formname,
    //               dispositionpermission: [this.selectedDispositionid]
    //             }
    //             elementRole.permissions.push(obj);
    //           }
    //         }

    //         this._roleService
    //           .Update(elementRole._id, elementRole)
    //           .subscribe(data => {
    //             if (data) {
    //             }
    //           })
    //       }
    //     });
    //   });
    // }

    if(this.roleLists && this.roleLists.length > 0) {
      this.roleLists.forEach(elementRole => {
        this.formWiseRoles.forEach(element => {
          if(elementRole._id == element.id) {
            
            if(element.selected) {
              if(elementRole.dispositionpermissions && elementRole.dispositionpermissions.length > 0) {
                var dispositionObj = elementRole.dispositionpermissions.find(p=>p._id == this.selectedDispositionid);
                if(!dispositionObj) {
                  elementRole.dispositionpermissions.push(this.selectedDispositionid);  
                }
              } else {
                elementRole.dispositionpermissions = []
                elementRole.dispositionpermissions.push(this.selectedDispositionid);
              }
            } else {
              
              if(elementRole.dispositionpermissions && elementRole.dispositionpermissions.length > 0) {
                elementRole.dispositionpermissions.splice(elementRole.dispositionpermissions.findIndex(a => a._id == this.selectedDispositionid), 1);
              }
            }

            this._roleService
              .Update(elementRole._id, elementRole)
              .subscribe(data => {
                if (data) {
                  elementRole = data;
                }
              })


            
          }
        });
      });
    }
    


  }

  ruleChangeOptions(event:MatCheckboxChange, item: any): void {
    var formWiseRolesObj = this.formWiseRoles.find(p=>p.id == item.id);
    if(formWiseRolesObj) {
      if(event.checked) {
        formWiseRolesObj.selected = true;
      } else {
        formWiseRolesObj.selected = false;
      }
    }
    
  }

  getSubmittedData(submit_data: any) {

    if (submit_data && submit_data.action == "edit") {
      this.edit(submit_data.item);
    } else if (submit_data && submit_data.action == "delete") {
      this.delete(submit_data.item);
    } else if (submit_data && submit_data.action == "add") {
      this.addSubDisposition(submit_data.item);
    } else {
      this.getDispositionLists();
    }
  }

  getformfieldSubmitData(submit_data: any) {
    
    if(submit_data && submit_data.action == "delete") {
      this.LoadData();
    } else if (submit_data && submit_data.action == "edit") {

      this.formsVisibility = false;

      setTimeout(() => {
        this.formsVisibility = true;
        this.formfieldEditData = {}
        this.formfieldEditData = submit_data.data;
        $("#addFormFieldBtn").click();  
      }, 500);
    }
  }

  async addDisposition() {

    this.checkDirty()

    this.disableBtn = true;

    if (this.selectedform && this.selectedform.value && this.selectedform.value.id) {
      this.selectedDispositionid = "";
      this.dispositionRequiredError = false;

      let postData = {};
      postData["disposition"] = "New Disposition";
      postData["parentid"] = null;
      postData["action"] = "";
      postData["formid"] = this.selectedform.value.id;
      postData["fields"] = [];
      postData["status"] = "active";

      var url = "dispositions";
      var method = "POST";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( async (data: any) => {
          if (data) {
            this.selectedDispositionid = data._id;
            this.showNotification('top', 'right', 'Disposition has been Added Successfully!!!', 'success');
            await this.LoadData();
          }
        })
      
    } else {
      this.disableBtn = false;
      this.showNotification('top', 'right', 'Form cannot be empty !!!', 'danger');
    }
  }

  getruleSubmittedData(submit_data: any) {
    this.LoadData();
  }

 async onTabChanged(mattab : MatTab){
    var fndData = this.formLists.find(a=>a.name.toLowerCase() == mattab.textLabel.toLowerCase());
    this.selectedform.setValue(fndData);
    await this.getDispositionLists();
  }


}
