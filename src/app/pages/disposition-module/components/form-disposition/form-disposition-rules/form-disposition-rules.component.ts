import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../core/services/common/common.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DispositionruleModel } from '../../../../../core/models/disposition/dispositionrule.model';
import { FormsService } from '../../../../../core/services/forms/forms.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-disposition-rules',
  templateUrl: './form-disposition-rules.component.html',
  styles: [
  ]
})
export class FormDispositionRulesComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dispositionModel: any;
  @Output() ruleSubmitData: EventEmitter<any> = new EventEmitter<any>();

  trigger: any;

  userList: any [] = [];
  userDDList: any [] = [];
  userPermissionList: any [] = [];
  _rolelists: any [] = [];

  isLoadForms = false;
  formObj: any;
  formDisplayFormName: string;
  membershipFormDisplayFormName: string;
  roleName:string = '';

  dispositionTreeList: any[] = [];
  dispositionDDTreeList: any[] = [];
  dispositionDDList: any[] = [];

  bindId: any;
  isLoading = false;

  _allForms: any[] = [];


  //selectedDisposition: any = '';
  //selectedFromDisposition: any = '';
  //selectedToDisposition: any = '';
  //selectedNewDisposition: any = '';

  recordpermissionList: any[] = [];
  dispositionruledata: any;

  _dispositionruleModel = new DispositionruleModel();

  userTaskDDList: any[] = [];

  _WebhooktabLists: any [] = [];
  conditions: any[] = [];
  WebhookfieldLists: any [] = [];
  WebhookURLVISIBILITY: boolean = false;

  FormfieldList: any[] = [];
  dynamicValueLists: any[] = [];

  WebHookformName: any;
  WebhookformSchemaName: any;

  fieldLists: any[] = [];

  disablesavebtn : boolean = false;
  _WebhookmappingData: any [] = [];

  useridemp : any[] = [];
  roleidemp : any[] = [];

  record_permissiondata : any[] =[];
  record_permissionstatus : boolean = false;

  userTaskList: any[] = [];

  constructor(
    private _commonService: CommonService,
    private _formsService: FormsService,
  ) {
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getAllUserList();
      await this.getAllRoleList();
      if(this.dispositionModel && this.dispositionModel.formid) {
        var formid = this.dispositionModel.formid && this.dispositionModel.formid._id ? this.dispositionModel.formid._id : this.dispositionModel.formid;
        await this.getFormDetails(formid);
        this._dispositionruleModel.formid = formid;
        this.getUserTaskListByDispositionid();
      }
    } catch (error) {
      console.error(error)
    } finally {
      //console.log("dispositionModel", this.dispositionModel);

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.userList = [];
    this.userDDList = [];
    this.userPermissionList = [];
    this._rolelists = [];

    this.isLoadForms = false;
    this.formObj = {};
    this.formDisplayFormName = "";
    this.membershipFormDisplayFormName = "";

    this.roleName = this._authService.auth_role['rolename'];

    this.dispositionTreeList = [];
    this.dispositionDDTreeList = [];
    this.dispositionDDList = [];

    this._allForms = [];


    //this.selectedDisposition = "";
    //this.selectedFromDisposition = "";
    //this.selectedToDisposition = "";
    //this.selectedNewDisposition = "";

    this.recordpermissionList = [];
    this.userTaskDDList = [];
    this._WebhooktabLists = [];
    this.conditions = [];
    this.WebhookfieldLists = [];

    this.WebhookURLVISIBILITY = false;
    this.FormfieldList = [];
    this.dynamicValueLists = [];
    this.fieldLists = [];

    this.disablesavebtn = false;
    this._WebhookmappingData = [];
    this.useridemp = [];
    this.roleidemp = [];

    this._dispositionruleModel = new DispositionruleModel();

    return;

  }

  async getAllUserList() {

    var url = "users/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({searchfield: "status", searchvalue: "active", criteria: "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method,postData)
      .then( (data: any) => {
        if(data) {
          this.userList = data;
          this.userDDList = [];
          this.userPermissionList = [];
          if(this.userList.length > 0){
            this.userList.forEach( element => {
              let obj: any = {};
              let objper: any = {};
              if(!element.permissions && element.permissions != undefined){
                element.permissions = [];
              }
              obj = { id: element._id, name: element.fullname ? element.fullname : element.property.name }
              objper = { id: element._id, itemName: element.fullname ? element.fullname : element.property.name, permissions: element.permissions }
              this.userDDList.push(obj);
              this.userPermissionList.push(objper);
            });
          }
          return;
        }
    });
  }

  async getAllRoleList() {

    var url = "roles/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({searchfield: "status", searchvalue: "active", criteria: "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data.length != undefined) {
          data.forEach(element => {
            let obj = { id: element._id, itemName: element.rolename, roletype: element.roletype, permissions: element.permissions }
            this._rolelists.push(obj);
          });
        }
      }, data =>{
        console.error("error", data);
      });
  }

  async getFormDetails(id: any) {

    this.isLoadForms = true;

    let postData = {};
    postData["search"] = [];
    postData["search"].push({searchfield: "status", searchvalue: "active", criteria: "eq"});

    return this._formsService
      .GetByfilterAsync(postData)
      .then( (data: any) => {
        if(data) {
          if(data.length !== 0) {
            data.forEach(async element => {
              if (element._id == id) {
                this.formDisplayFormName = element.dispalyformname;
                this.formObj = element;
                this.isLoadForms = false;
                await this.getDispositionTreeList(id);
                // if(this.dispositionModel && this.dispositionModel.rules && this.dispositionModel.rules.length > 0) {
                //   await this.getdispositonruledata();
                // }
              }

              if (element.isDisplayOnWorkflow) {
                let obj = { id: element._id, name: element.dispalyformname, formname: element.formname, schemaname: element.schemaname }
                this._allForms.push(obj);
              }

              if (element.formname == 'membership') {
                this.membershipFormDisplayFormName= element.dispalyformname;
              }

            });
          }
        }
    });
  }

  getDispositionTreeList(formid: any) {

    var url = "dispositions/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": formid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if (data) {
          this.dispositionTreeList = data;
          this.dispositionDDTreeList = JSON.parse(JSON.stringify(this.dispositionTreeList));
          if(this.dispositionDDTreeList.length > 0) {
            let i = 0;
            this.dispositionDDTreeList.forEach( ele => {
              i = i+100;
              ele.displayOrder = i;
            });
            this.dispositionDDTreeList.forEach( ele => {
              let stage = 0
              ele.displayName = '';
              ele.displayNameDD = '';
              ele.displayNameSelect = '';

              ele.formdispositionid = '';
              ele.isselected = false;

              ele.displayNameSelect = ele.disposition;
              ele.displayName = ele.disposition;
              ele.displayNameDD = ele.disposition;
              if(ele.parent != undefined){
                this.attachParentName(ele.parent, ele, stage);
              }

              if((this.dispositionDDTreeList.indexOf(ele)+1) == this.dispositionDDTreeList.length) {
                this.dispositionDDTreeList.forEach( ele => {
                  this.fillchildDesposition(ele);
                });
                this.dispositionDDList = this.dispositionDDTreeList.filter( ele => ele.parent == undefined || ele.parent == '');
              }
            });
            this.dispositionDDTreeList = this.dispositionDDTreeList.sort((n1,n2) => {if (n1.displayOrder > n2.displayOrder){return 1;}if (n1.displayOrder < n2.displayOrder){return -1;}return 0;});

            //this.selectedDisposition = 'Any';
            //this.selectedFromDisposition = 'Any';
            //this.selectedToDisposition = 'Any';
            //this.selectedNewDisposition = 'Any';
          }
        }
    });
  }

  async getdispositonruledata(data: any) {

    this.isLoading = true;

    if(data) {

      this.recordpermissionList = [];
      this.isLoading = false;
      this.dispositionruledata = JSON.parse(JSON.stringify(data));

      this._dispositionruleModel = new DispositionruleModel();
      this._dispositionruleModel = data;

      // if(this._dispositionruleModel.disposition != undefined && Object.prototype.toString.call(this._dispositionruleModel.disposition) != '[object Object]'){
      //   let tmpobj: any = this.dispositionDDTreeList.find(ele => ele._id == this._dispositionruleModel.disposition);
      //   if(tmpobj != undefined) {
      //     this.selectedDisposition = tmpobj;
      //   }
      // }

      // if(this._dispositionruleModel.dispositionid != undefined && Object.prototype.toString.call(this._dispositionruleModel.dispositionid) != '[object Object]'){
      //   let tmpobj: any = this.dispositionDDTreeList.find(ele => ele._id == this._dispositionruleModel.dispositionid);

      //   if(tmpobj != undefined){
      //     this.selectedDisposition = tmpobj;

      //   }
      // }

      if(this._dispositionruleModel.trigger == 'Disposition Updated') {
        this.getFormfieldData();
      }

      // if(this._dispositionruleModel.fromdispositionid != undefined && Object.prototype.toString.call(this._dispositionruleModel.fromdispositionid) != '[object Object]'){
      //   let tmpobj: any = this.dispositionDDTreeList.find(ele => ele._id == this._dispositionruleModel.fromdispositionid);
      //   if(tmpobj != undefined) {
      //     this.selectedFromDisposition = tmpobj;
      //   }
      // }

      // if(this._dispositionruleModel.todispositionid != undefined && Object.prototype.toString.call(this._dispositionruleModel.todispositionid) != '[object Object]'){
      //   let tmpobj: any = this.dispositionDDTreeList.find(ele => ele._id == this._dispositionruleModel.todispositionid);
      //   if(tmpobj != undefined) {
      //     this.selectedToDisposition = tmpobj;
      //   }
      // }

      if(this._dispositionruleModel.actionvalue != undefined && Object.prototype.toString.call(this._dispositionruleModel.actionvalue) != '[object Object]'){
        let tmpobj: any = this.userDDList.find(ele => ele.id == this._dispositionruleModel.actionvalue);
        if(tmpobj != undefined){
          //this._dispositionruleModel.actionvalue = tmpobj;
        } else {
          tmpobj = this.dispositionDDTreeList.find(ele => ele._id == this._dispositionruleModel.actionvalue);
          if(tmpobj != undefined){
            //this.selectedNewDisposition = tmpobj;
          } else {
            tmpobj = this.userTaskDDList.find(ele => ele.id == this._dispositionruleModel.actionvalue);
            if(tmpobj != undefined){
              //this._dispositionruleModel.actionvalue = tmpobj;
            } else {
              tmpobj = this._allForms.find(ele => ele.id == this._dispositionruleModel.actionvalue);
              if(tmpobj != undefined){
                //this._dispositionruleModel.actionvalue = tmpobj;
                this.getFieldsBYForm(tmpobj)
              }
            }
          }
        }
      }

      if(data.userid !== 0 && data.userid)  {
        this._dispositionruleModel['seluserid'] = [];
        data.userid.forEach(element => {
          let obj = { id: element._id, itemName: element.fullname }
          this._dispositionruleModel['seluserid'].push(obj)
        });
      }

      if(data.roleid !== 0 && data.roleid)  {
        this._dispositionruleModel['selroleid'] = [];
        data.roleid.forEach(element => {
          let obj = { id: element._id, itemName: element.rolename }
          this._dispositionruleModel['selroleid'].push(obj)
        });
      }

      if(data.permissions) {
        this._dispositionruleModel.permissions = data.permissions;
      }

      if (this._dispositionruleModel.condition && this._dispositionruleModel.condition.length != 0) {
        this.conditions = this._dispositionruleModel.condition;
      }

      if(this._dispositionruleModel.mapobject.length != 0){
        this.WebhookfieldLists = this._dispositionruleModel.mapobject
        this.webHookFieldListsSort();
      }

    } else {
      this.isLoading = false;
    }
  }

  attachParentName(parentobj: any, currObj: any, stage:number){
    let tempobj: any;
    stage += 1;
    tempobj = this.dispositionDDTreeList.find(ele1 => ele1._id == parentobj);
    if(tempobj != undefined) {
      if(tempobj.disposition != undefined) {
        currObj.displayName = tempobj.disposition + ' --> ' + currObj.displayName;
        currObj.displayNameDD = '|---- ' + currObj.displayNameDD;
        currObj.displayOrder = tempobj.displayOrder + stage;
      }
      if(tempobj.parent != undefined) {
        this.attachParentName(tempobj.parent, currObj, stage);
      }
    }
  }

  fillchildDesposition( obj: any){
    obj.childdisp = [];
    this.dispositionDDTreeList.forEach( ele2 => {
      if(ele2.parent == obj._id) {
        this.fillchildDesposition(ele2);
        obj.childdisp.push(ele2);
      }
      if((this.dispositionDDTreeList.indexOf(ele2)+1) == this.dispositionDDTreeList.length) {
        if(obj.childdisp.length > 0){
          obj.isparent = true;
        }
      }
    });
  }

  getFormfieldData() {

    if (this.dispositionModel && this.dispositionModel.fields && this.dispositionModel.fields.length !== 0) {
      this.FormfieldList = [];
      let cnt = 0;
      let len = this.dispositionModel.fields.length;
      this.dispositionModel.fields.forEach(element => {
        if (!this.dynamicValueLists[element.fieldname]) {
          this.dynamicValueLists[element.fieldname] = [];
        }
        if (element.fieldtype == 'lookup' || element.fieldtype == 'form' || element.fieldtype == 'ObjectID') {
          if (element.fieldtype == 'form') {
            if (element['fieldfilter']) {
              let res = element['fieldfilter'].split(".");
              if (res[0]) {
                element['fieldfilter'] = res[0];
              }
              element.formfieldfilterValue = [];
              let url = element['apiurl'];
              let method = element['method'];
              let postData = {}
              postData["search"] = [];
              postData["search"].push({ searchfield: element['fieldfilter'], searchvalue: element['fieldfiltervalue'], criteria: "eq" });
              this._commonService
                .commonServiceByUrlMethodData(url, method, postData)
                .subscribe((data: any) => {
                  if (data) {
                    if (data.length !== 0) {
                      data.forEach(ele => {
                        let val;
                        let displayvalue;
                        if (element['displayvalue'].indexOf('.') !== -1) {
                          let stringValue = element['displayvalue'].split(".");
                          let str1 = stringValue[0];
                          let str2 = stringValue[1];
                          val = ele[str1][str2];
                        } else {
                          displayvalue = element['displayvalue'];
                          val = ele[displayvalue];
                        }

                        let formfield = element['formfield'];
                        let key = ele[formfield];

                        let obj = {
                          id: key,
                          name: val
                        };
                        this.dynamicValueLists[element.fieldname].push(obj);
                      });
                    }
                  }
                });
            }
          } else if (element.fieldtype == 'lookup') {

            var url = "lookups/filter";
            var method = "POST";

            let postData = {};
            postData['search'] = [];
            postData['search'].push({ "searchfield": '_id', "searchvalue": element.lookupid, "criteria": "eq" });
            postData['select'] = [];
            postData['select'].push({ "fieldname": '_id', "value": 1 });
            postData['select'].push({ "fieldname": 'data', "value": 1 });
            postData['sort'] = { 'property.first_name': 1 };

            return this._commonService
              .commonServiceByUrlMethodDataAsync(url, method, postData)
              .then( (data: any) => {

                if (data) {
                    let len = data.length;
                    let cnt = 1;
                    if (data.length !== 0) {
                        data.forEach(ele => {

                          if (ele['data'].length !== 0) {
                            ele['data'].forEach(e => {
                              let obj = {
                                id: e.code,
                                name: e.name
                              };
                              this.dynamicValueLists[element.fieldname].push(obj);
                            });
                          }
                            cnt++;
                        });
                    }
                }
            });
          } else if (element.fieldtype == 'ObjectID') {
            let refcollection: any;
            let reffieldname: any;
            let refschema: any;
            refcollection = element.option.ref;
            refschema = element.option.refschema;
            reffieldname = element.option.reffieldname;
            let postData = {};
            postData['refcollection'] = refcollection;
            postData['refschema'] = refschema;
            postData['refselect'] = reffieldname;

              this._commonService
                .GetByCollection(postData)
                .subscribe((data: any) => {
                  if (data) {
                    cnt = 0;
                    let icnt = 0;
                    data.forEach(eleref => {
                      if (icnt < 2) {
                        let obj = {
                          id: eleref._id,
                          name: eleref[reffieldname]
                        }
                        if (eleref[reffieldname]) {
                          if (eleref[reffieldname] !== '') {
                              this.dynamicValueLists[element.fieldname].push(obj);
                          }
                        }
                      }
                        icnt++;
                    });
                  }
              });
            }
          }
          if(element.fieldtype != 'audio'){
            this.FormfieldList.push(element);
          }
      });
      }


  }

  getFieldsBYForm(value: any) {

    this._WebhooktabLists = [];
    var formOBj = this._allForms.find(p=>p.id == value);
    if(formOBj) {
      this.WebHookformName = formOBj.formname;
      this.WebhookformSchemaName = formOBj.schemaname;
      this.getWebhookForm();
      this.getFormSchema();
    } else {
      this.WebhookURLVISIBILITY = false;
    }
  }

  webHookFieldListsSort() {
    let cnt = 0;
    let len = this.WebhookfieldLists.length;

    this.WebhookfieldLists.forEach(element => {
      if(element.validation) {
        var checkValidation = element.validation.indexOf("isMandatory");
        if(checkValidation !== -1) {
          element.isAsterisk = true;
        }
      } else {
        if(element.isMandatory) {
          element.isAsterisk = true;
        } else if (element.validationData == 'requiredVal') {
          element.isAsterisk = true;
        }
      }
      if(this._dispositionruleModel.mapobject != undefined) {
        this._dispositionruleModel.mapobject.forEach(ele => {
          if(ele.import_field !== '' && ele.fieldname == element.fieldname) {
            element.import_field = ele.import_field;
          }
        });
      }
      cnt++;
      if(cnt == len) {
        this.WebhookURLVISIBILITY = true;
        this._WebhooktabLists = this.groupBy(this.WebhookfieldLists, 'tabname');
      }
    });
  }

  getWebhookForm() {

    this.WebHookformName = this.WebHookformName.toLowerCase();

    var url = this.WebhookformSchemaName + "/schemas/" + this.WebHookformName;
    var method = "GET";
    var postData = {};


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
            if(data.length !== 0) {
                this.WebhookfieldLists = [];
                let cnt = 0;
                let len = data.length;
                data.forEach(element => {
                    element.import_field = "";
                    if (element.id) {
                    if (element.id.indexOf('.') !== -1) {
                        if (element.id.indexOf('property.') !== -1) {
                        this.WebhookfieldLists.push(element);
                        }
                    } else {
                        this.WebhookfieldLists.push(element);
                    }

                    }
                    cnt++;
                    if (cnt == len) {
                    this.webHookFieldListsSort();
                    }
                });
            }
        }
    });
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
    values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  getFormSchema() {

    this.formObj.formname = this.formObj.formname.toLowerCase();

    var url = this.formObj.schemaname + "/schemas/" + this.formObj.formname;
    var method = "GET";
    var postData = {};

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
      if(data) {
          if(data.length !== 0) {
              this.fieldLists = [];
              let cnt = 0;
              let len = data.length;
              data.forEach(element => {
                  if(!this.dynamicValueLists[element.fieldname]) {
                      this.dynamicValueLists[element.fieldname] = [];
                  }
                  if(element.fieldtype == 'lookup' || element.fieldtype == 'form' || element.fieldtype == 'ObjectID' ) {
                      if(element.fieldtype == 'form') {

                          if(element['fieldfilter']) {
                              let res = element['fieldfilter'].split(".");
                              if (res[0]) {
                                  element['fieldfilter'] = res[0];
                              }
                              element.formfieldfilterValue = [];
                              let url = element['apiurl'];
                              let method = element['method'];
                              let postData = {
                                  search: [
                                      {
                                          searchfield: element['fieldfilter'],
                                          searchvalue: element['fieldfiltervalue'],
                                          criteria: "eq"
                                      }
                                  ]
                              };
                              this._commonService
                                  .commonServiceByUrlMethodData(url, method, postData)
                                  .subscribe((data: any) => {
                                      if (data) {
                                          if (data.length !== 0) {
                                              data.forEach(ele => {
                                                  let val;
                                                  let displayvalue;
                                                  if (element['displayvalue'].indexOf('.') !== -1) {
                                                      let stringValue = element['displayvalue'].split(".");
                                                      let str1 = stringValue[0];
                                                      let str2 = stringValue[1];
                                                      val = ele[str1][str2];

                                                  } else {
                                                      displayvalue = element['displayvalue'];
                                                      val = ele[displayvalue];
                                                  }

                                                  let formfield =  element['formfield'];
                                                  let key = ele[formfield];

                                                  let obj = {
                                                      id: key,
                                                      name: val
                                                  };
                                                  this.dynamicValueLists[element.fieldname].push(obj);
                                              });
                                          }
                                      }
                              });
                          }
                      } else if (element.fieldtype == 'lookup') {

                        var url = "lookups/filter";
                        var method = "POST";




                          let postData = {};
                          postData['search'] = [];
                          postData['search'].push({ "searchfield": '_id', "searchvalue": element.lookupid, "criteria": "eq" });
                          postData['select'] = [];
                          postData['select'].push({ "fieldname": '_id', "value": 1 });
                          postData['select'].push({ "fieldname": 'data', "value": 1 });
                          postData['sort'] = { 'property.first_name': 1 };

                          return this._commonService
                            .commonServiceByUrlMethodDataAsync(url, method, postData)
                            .then( (data: any) => {
                              if (data) {
                                  let len = data.length;
                                  let cnt = 1;
                                  if (data.length !== 0) {
                                      data.forEach(ele => {
                                          if (ele['data'].length !== 0) {
                                              ele['data'].forEach(e => {
                                                  let obj = {
                                                      id: e.code,
                                                      name: e.name
                                                  };
                                                  this.dynamicValueLists[element.fieldname].push(obj);
                                              });
                                          }
                                          cnt++;
                                      });
                                  }
                              }
                          });

                      } else if (element.fieldtype == 'ObjectID') {
                          let refcollection: any;
                          let reffieldname: any;
                          let refschema: any;
                          refcollection = element.option.ref;
                          refschema = element.option.refschema;
                          reffieldname = element.option.reffieldname;
                          let postData = {};
                          postData['refcollection'] = refcollection;
                          postData['refschema'] = refschema;
                          postData['refselect'] = reffieldname;
                          this._commonService
                              .GetByCollection(postData)
                              .subscribe((data: any) => {
                                  if (data) {
                                      cnt = 0;
                                      let icnt = 0;
                                      data.forEach(eleref => {
                                          if(icnt < 2)  {
                                              let obj = {
                                                  id: eleref._id,
                                                  name: eleref[reffieldname]
                                              }
                                              if(eleref[reffieldname]) {
                                                  if(eleref[reffieldname] !== '') {
                                                      this.dynamicValueLists[element.fieldname].push(obj);
                                                  }
                                              }
                                          }
                                          icnt++;
                                      });
                                  }
                              });
                          }
                      }
                      this.fieldLists.push(element);
                  });
              }
          }
    });
  }

  async onSubmitDispositionRule() {
    this.disablesavebtn = true

    if(this._dispositionruleModel.trigger == 'Disposition Change') {

      // if(this.selectedFromDisposition != undefined &&  this.selectedFromDisposition._id != undefined){
      //   this._dispositionruleModel.fromdispositionid = this.selectedFromDisposition._id;
      // }

      // if(this.selectedToDisposition != undefined &&  this.selectedToDisposition._id != undefined){
      //   this._dispositionruleModel.todispositionid = this.selectedToDisposition._id;
      // }
    }

    if(this._dispositionruleModel.trigger == 'Repeated Disposition' || this._dispositionruleModel.trigger == 'Disposition Updated') {
      // if(this.selectedDisposition != undefined &&  this.selectedDisposition._id != undefined){
      //   this._dispositionruleModel.disposition = this.selectedDisposition._id;
      //   this._dispositionruleModel.dispositionid = this.selectedDisposition._id;
      // }
      //this.selectedNewDisposition = this.dispositionDDTreeList[0];
    }

    // if(this._dispositionruleModel.action == 'Change Disposition'){
    //   if(this.selectedNewDisposition != undefined &&  this.selectedNewDisposition._id != undefined){
    //     this._dispositionruleModel.actionvalue = this.selectedNewDisposition._id;
    //   }
    // }

    if(this._dispositionruleModel.action == 'Mapped Object'){
      let  fid;
      if(this._dispositionruleModel.actionvalue['id']){
        fid = this._dispositionruleModel.actionvalue['id']
      }else{
        this._allForms.forEach(element1 => {
          if(element1.name == this._dispositionruleModel.actionvalue){
            fid = element1.id;
          }
        });
      }

      if(this._WebhooktabLists.length > 0){
        let count = 0;
        this._WebhooktabLists.forEach(element1 => {
          element1.forEach(element => {
            if(element.isAsterisk && element.import_field == '') {
              count++;
            }
            this._WebhookmappingData.push(element)
          });
        });
        if(count == 0){
          this._dispositionruleModel.actionvalue = fid;
          this._dispositionruleModel.mapobject = this._WebhookmappingData;
        } else {
          this.showNotification('top', 'right', 'Required fields must be mapped!!!', 'danger');
          this._WebhookmappingData = [];
          this.disablesavebtn = false
          return;
        }
      }
    }

    if (Object.prototype.toString.call(this._dispositionruleModel.actionvalue) == '[object Object]') {
      let tmpobj: any = this._dispositionruleModel.actionvalue;
      this._dispositionruleModel.actionvalue= tmpobj.id;
    }

    if(this.conditions.length > 0){
      this._dispositionruleModel.condition = this.conditions;
    }

    if(this._dispositionruleModel.action == 'Permission') {
      if(this._dispositionruleModel['seluserid']){
        if(this._dispositionruleModel['seluserid'] != undefined) {
          this.useridemp = [];
          this._dispositionruleModel['seluserid'].forEach(element => {
            let element1 = element['id'];
            this.useridemp.push(element1);
          });
          this._dispositionruleModel.userid = this.useridemp;
        }
        }
        if(this._dispositionruleModel['selroleid']){
          if(this._dispositionruleModel['selroleid'] != undefined){
              this.roleidemp = [];
            this._dispositionruleModel['selroleid'].forEach(element => {
              let element1 = element['id'];
              this.roleidemp.push(element1);
            });
            this._dispositionruleModel.roleid = this.roleidemp;
          }
        }

        if(this.dispositionruledata){
          if(this.dispositionruledata['permissions']){
              if (this.dispositionruledata['permissions'].length !== 0) {
                  this.dispositionruledata['permissions'].forEach(element => {
                      this.record_permissiondata['permissions'].forEach(elem => {
                          if (element.formname != elem.formname) {
                              this.record_permissiondata['permissions'].push(element);
                          }
                      });
              });
                  this._dispositionruleModel['permissions'] = this.record_permissiondata['permissions'];
              } else {
                  this._dispositionruleModel['permissions'] = this.record_permissiondata['permissions'];
              }
          }
        } else {
          this._dispositionruleModel['permissions'] = this.record_permissiondata['permissions'];
        }
    }


    if(!this.dispositionModel.rules) {
      this.dispositionModel.rules = [];
    }

    //console.log("this._dispositionruleModel", this._dispositionruleModel);

    if(this._dispositionruleModel._id) {
      var ruleObj = this.dispositionModel.rules.find(p=>p._id == this._dispositionruleModel._id);
      if(ruleObj) {
        ruleObj = this._dispositionruleModel;

        var url = "dispositions/" + this.dispositionModel._id;
        var method = "PUT";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, this.dispositionModel)
          .then( async (data: any) => {
            if(data){
              this.showNotification('top','right','Disposition rule has been updated successfully!!!', 'success');
              this.disablesavebtn = false
              await this.ngOnInit()
              this.ruleSubmitData.emit();
            }
        });

      }
    } else {

      var url = "dispositions/" + this.dispositionModel._id;
      var method = "PATCH";

      this._dispositionruleModel._id = this.uuid();

      let postData = {}
      postData["rules"] = this._dispositionruleModel;
      postData["rulesadd"] = true;

      //console.log("_dispositionruleModel", this._dispositionruleModel);

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( async (data: any) => {
          if(data){
            //console.log("data", data);
            this.showNotification('top','right','Disposition rule has been updated successfully!!!', 'success');
            this.disablesavebtn = false
            await this.ngOnInit()
            this.ruleSubmitData.emit();
          }
      });
    }


  }

  async removeRules(item: any) {

    await this.remove(item._id , this.dispositionModel.rules);

    var url = "dispositions/" + this.dispositionModel._id;
    var method = "PUT";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.dispositionModel)
      .then( async (data: any) => {
        if(data){
          this.showNotification('top','right','Disposition rule has been removed successfully!!!', 'success');
          this.disablesavebtn = false
          await this.ngOnInit()
          this.ruleSubmitData.emit();
        }
    });

  }

  async remove(id: any, array: any) {
    for (const i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        return;
      }
    }
  }

  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getUserTaskListByDispositionid() {

    var url = 'activitytemplates/filter';
    var method = "POST";

    var formId = this.dispositionModel.formid && this.dispositionModel.formid._id ? this.dispositionModel.formid._id : this.dispositionModel.formid;

    let postData = {};
    postData["search"] =[];
    postData["search"].push({ "searchfield": "formid", "searchvalue": formId, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.dispositionModel)
      .then( (data: any) => {

        if(data) {
          this.userTaskList = [];
          this.userTaskList = data;

          let cnt = 0;
          let len = data.length;
          if(this.userTaskList.length > 0){
            this.userTaskList.forEach( element => {
              let obj = {id: element._id,  name: element.title ? element.title : '---' }
              this.userTaskDDList.push(obj);
            });

            if(this.userTaskDDList.length > 0){
              if(this._dispositionruleModel.actionvalue != undefined && this._dispositionruleModel.actionvalue != ' ' && Object.prototype.toString.call(this._dispositionruleModel.actionvalue) != '[object Object]'){
                let tmpobj: any;
                tmpobj = this.userTaskDDList.find(ele => ele.id == this._dispositionruleModel.actionvalue);
                if(tmpobj != undefined){
                  this._dispositionruleModel.actionvalue = tmpobj;
                }
              }
            }
        }
      }
    });
  }

  // changeNewDesposition(desp: any) {
  //   this.selectedNewDisposition = {};
  //   if(desp != '') {
  //     this.selectedNewDisposition = desp;
  //     if(desp._id != undefined) {
  //       this._dispositionruleModel.actionvalue = desp._id;
  //     }
  //   }
  // }

  changeDesposition() {

    if(this._dispositionruleModel.trigger == 'Disposition Updated') {
      this.getFormfieldData();
    }

    // this.selectedDisposition = {};
    // if(desp != '') {
    //   this.selectedDisposition = desp;
    //   if(desp._id != undefined) {
    //     this._dispositionruleModel.disposition = desp._id;
    //     this._dispositionruleModel.dispositionid = desp._id;
    //     if(this._dispositionruleModel.trigger == 'Disposition Updated') {
    //       this.getFormfieldData(desp);
    //     }
    //   }
    // }
  }

  // changeFromDesposition(desp: any) {
  //   this.selectedFromDisposition = {};
  //   if(desp != '') {
  //     this.selectedFromDisposition = desp;
  //     if(desp._id != undefined){
  //       this._dispositionruleModel.fromdispositionid = desp._id;
  //     }
  //   }
  // }

  // changeToDesposition(desp: any) {
  //   this.selectedToDisposition = {};
  //   if(desp != '') {
  //     this.selectedToDisposition = desp;
  //     if(desp._id != undefined) {
  //       this._dispositionruleModel.todispositionid = desp._id;
  //     }
  //   }
  // }

  onFieldChange(newValue: any, item: any) {
    item.operator = "";
    item.fieldvalue = "";
    item.fieldvalue2 = "";
    this.FormfieldList.forEach(element => {
      if (element.fieldname == newValue) {
        if (element.fieldtype == 'lookup' || element.fieldtype == 'form') {
          item.valueLists = element.valueLists;
        }
        item.fieldtype = element.fieldtype;
      }
    });
  }

  onFieldTypeChange(newValue: any, item: any) {
    item.fieldvalue = "";
    item.fieldvalue2 = "";
    this.FormfieldList.forEach(element => {
      if (element.fieldname == newValue) {
        item.fieldtype = element.fieldtype;
      }
    });
  }

  addItem(index: number) {
    let nextIndex = this.conditions.length + 1;
    let obj = { fieldname: "", operator: "", fieldvalue: "", fieldvalue2: "", index: nextIndex, rule: "AND", fieldtype: "" };
    this.conditions.push(obj);
    this.conditions = this.conditions.sort((n1,n2) => {if (n1.index > n2.index){return 1;}if (n1.index < n2.index){return -1;}return 0;});
  }

  deleteItem(i: number) {
    for (let index = 0; index < this.conditions.length; index++) {
      const element = this.conditions[index];
      if (element.index == i) {
        this.conditions.splice(index, 1);
      }
    }
    let cnt = 1;
    this.conditions.forEach(element1 => {
      element1.index = cnt;
      cnt++;
    });
  }

  onchangeAction() {
    this.WebhookURLVISIBILITY = false;
    this._dispositionruleModel.mapobject = [];

    this._dispositionruleModel.actionvalue = '';
    if(this.dispositionruledata != undefined && this.dispositionruledata.action != undefined && this.dispositionruledata.action == this._dispositionruleModel.action){
        if(this.dispositionruledata.actionvalue != undefined){
            this._dispositionruleModel.actionvalue = this.dispositionruledata.actionvalue;
        }
    }
  }

  PermissionEnbl() {
    this.record_permissionstatus = true;
  }

  getDispositionName(dispositonid: any) {
    let tmpobj: any = this.dispositionDDTreeList.find(ele => ele._id == dispositonid);
    if(tmpobj != undefined) {
      return tmpobj.disposition;
    } else {
      return dispositonid;
    }
  }

}
