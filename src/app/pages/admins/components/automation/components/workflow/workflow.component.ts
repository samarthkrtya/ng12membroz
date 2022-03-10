import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import {  BaseComponemntComponent, BaseComponemntInterface } from '../../../../../../shared/base-componemnt/base-componemnt.component'

import { WorkflowModel } from '../../../../../../core/models/workflow/workflow.model';

import { FormsService } from '../../../../../../core/services/forms/forms.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatRadioChange } from '@angular/material/radio';


import swal from 'sweetalert2';
declare const $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];


}

import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindId: any;

  form: FormGroup;
  submitted: boolean;

  formScheduleAction: FormGroup;
  _workflowModel = new WorkflowModel();


  conditions: any[] = [];
  triggerFieldsLists: any[] = [];

  trigger_process: any;
  pattern: any;
  flowVisibility: boolean = false;

  subformName: any;
  formSchemaName: any;
  formName: any;
  formId: any;
  fieldLists: any[] = [];

  isLoading: boolean = false;

  instanceActionVisibility: boolean = false;
  scheduleActionVisibility: boolean = false;
  isActive: boolean = true;

  public email: any[] = [];
  public mailMerge: any[] = [];
  public sms: any[] = [];
  public whatsapp: any[] = [];
  public notification: any[] = [];
  public _taskdata: any[] = [];

  emailDisplay: any[] = [];
  mailMergeDisplay: any[] = [];
  smsDisplay: any[] = [];
  whatsappDisplay: any[] = [];
  notificationDisplay: any[] = [];
  taskDisplay: any[] = [];

  _selectedAction: string;
  gDateFormat: any = 'dd/MM/yyyy';
  selectedPageSize: number;

  formListforNotifications: any = {};

  isVisibleSubform : Boolean = false;

  timeScheduleAction: any;
  monthScheduleAction: any;
  daysScheduleAction: any;
  submittedScheduleAction: boolean;

  occurrenceScheduleAction: any;
  IsSurveyformVisibility : Boolean = false;

  scheduleActionID: any;
  scheduleActionLists: any[] = [];
  nameAlreadyexists: boolean = false;

  allWorkFlowLists: any[] = [];

  triggerVisibilty: boolean = false;
  scheduleVisibilty: boolean = false;
  dispositionVisibilty: boolean = false;

  criteria_pattern: any;
  deleteobj: any;
  dynamicValueLists: any[] = [];

  dispositionList: any [] = [];
  dispositionDDTreeList: any [] = [];
  selectedDisposition: any;

  checkCounter: number = 1;

  title: any;
  description: any;

  formid = new FormControl();
  filteredFormidOptions: Observable<string[]>;
  _allForms: any[] = [];
  formidisLoadingBox: boolean = false;

  subformid = new FormControl();
  filteredSubFormidOptions: Observable<string[]>;
  _allsurveyForms: any[] = [];
  subformIdisLoadingBox: boolean = false;


  formnameSurvey = new FormControl();
  filteredFormnameSurveyOptions: Observable<string[]>;
  formnameSurveyisLoadingBox: boolean = false;

  fieldnameScheduleAction = new FormControl();
  filteredFieldnameScheduleActionOptions: Observable<string[]>;
  dateFieldLists: any[] = [];
  fieldnameScheduleActionisLoadingBox: boolean = false;

  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource;

  disposition: any;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute
  ) {

      super();

      this._route.params.subscribe(
        (param: any) => {
          this.bindId = param['id'];
      });

      this.pagename = "app-workflow-form";

      this.form = fb.group({
        'title': [this.title, Validators.required],
        'formid': [this.formid, Validators.required],
        'description': [this.description],
        'subformid': [this.subformid],
      });

      this.formScheduleAction = fb.group({
        'formnameSurvey': [this.formnameSurvey],
        'fieldnameScheduleAction': [this.fieldnameScheduleAction, Validators.required],
        'timeScheduleAction': [this.timeScheduleAction, Validators.required],
        'monthScheduleAction': [this.monthScheduleAction, Validators.required],
        'daysScheduleAction': [this.daysScheduleAction, Validators.required],
        'occurrenceScheduleAction': [this.occurrenceScheduleAction, Validators.required],
      });
  }

  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.initializeVariables();
      await this.getAllForms();
      await this.getAllWorkFlowLists();
    } catch (error) {
      console.error(error)
    } finally {

      if(this.bindId) {
        this.isLoading = true;
        console.log("this.bindId", this.bindId)
        await this.getWorkflowDetailById(this.bindId);
      } else {
        this._workflowModel.triggerprocess = "Create";
        $("#createRules").click();
      }
    }

    this.formid.valueChanges.subscribe(ctrl => {
      this.formid.setValidators([this.validateformidData]);
    });

    this.filteredFormidOptions = this.formid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.name),
        map(option => option ? this._formnidfilter(option) : this._allForms.slice())
      );

    this.filteredSubFormidOptions = this.subformid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.name),
        map(option => option ? this._subformidfilter(option) : this._allsurveyForms.slice())
      );

    this.filteredFormnameSurveyOptions = this.formnameSurvey.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.name),
        map(option => option ? this._formnameSurveyfilter(option) : this._allsurveyForms.slice())
      );

    this.filteredFieldnameScheduleActionOptions = this.fieldnameScheduleAction.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.name),
        map(option => option ? this._fieldnameScheduleActionfilter(option) : this.dateFieldLists.slice())
      );

  }

  validateformidData(controller: AbstractControl) {
    if (controller.value !== null) {
      let formid = controller.value;
      if(formid.id) {
        return { formidInvalide: true };
      } else {
        return null;
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  LoadData() {}
  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {

    this._allForms = [];
    this.formidisLoadingBox = false;

    this._allsurveyForms = [];
    this.subformIdisLoadingBox = false;
    this.formnameSurveyisLoadingBox = false;

    this.dateFieldLists = [];
    this.fieldnameScheduleActionisLoadingBox = false;

    this.title = "";
    this.description = "";

    this.email = [];
    this.mailMerge = [];
    this.sms = [];
    this.whatsapp = [];
    this.notification = [];
    this._taskdata = [];

    this.emailDisplay = [];
    this.mailMergeDisplay = [];
    this.smsDisplay = [];
    this.whatsappDisplay = [];
    this.notificationDisplay = [];
    this.taskDisplay = [];

    this.gDateFormat = this._organizationsetting.gDateFormat;
    this.conditions = [];
    this.triggerFieldsLists = [];
    this.scheduleActionLists = [];


    if (this.bindId) {
      this.isLoading = true;
      this.criteria_pattern = this._workflowModel.criteria_pattern;
    } else {

      this.monthScheduleAction = 0;
      this.daysScheduleAction = 0;

      this.criteria_pattern = "AND";

      let obj = { fieldname: "", operator: "", fieldvalue: "", fieldvalue2: "", index: 1, rule: this.criteria_pattern, fieldtype: "" };
      this.conditions.push(obj);

      let objTrigger = { fieldname: "", index: 1 };
      this.triggerFieldsLists.push(objTrigger);

      this._workflowModel.criteriaRules = "filterRecords";
      this._workflowModel.triggerRules = "all";
    }

    return false;
  }

  async getAllForms() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData['sort'] = { 'dispalyformname': 1 };

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any) => {

        this._allForms = [];
        this._allsurveyForms = [];
        data.forEach(element => {
          if (element.isDisplayOnWorkflow) {
            let obj = {
              id: element._id,
              name: element.dispalyformname,
              formname: element.formname,
              schemaname: element.schemaname
            }
            this._allForms.push(obj);
          }
          if(element.formtype == "surveyform" || element.formtype == "document"){
            let obj1 = {
              id: element._id,
              name: element.dispalyformname,
              formname: element.formname,
              schemaname: element.schemaname
            }
            //this._allForms.push(obj1);
            this._allsurveyForms.push(obj1)
          }

          if (element.formname === 'workflow') {
            element.gridaction.forEach(eleg => {
              if (eleg.action === 'delete') {
                this.deleteobj = eleg;
              }
            });
          }
        });


        return;
      });
  }

  async getAllWorkFlowLists() {

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    var url = "workflows/filter";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allWorkFlowLists = data;
          return;
        }
    });
  }

  getDetailByformname(data : any){
    if(data  &&  data.formname == "formdata"){
      this.isVisibleSubform  = true;
    } else {
      this.isVisibleSubform  = false;
    }
  }

  getfieldisplayname(fieldname: any) {
    let obj: any;
    obj = this.fieldLists.find(p => p.fieldname == fieldname);
    if (obj != undefined) {
      return obj.displayname;
    } else {
      return fieldname;
    }
  }

  getformnameById(formname: any) {
    let obj: any;
    obj = this._allForms.find(p => p.id == formname);
    if (obj != undefined) {
      return obj.name;
    } else {
      return "";
    }
  }

  workflowtypeChangeEvent(evt: any) {

    var form = this.getformnameById(this._workflowModel.formid)
    if(!this.bindId){
      this.formnameSurvey.setValue("");
      this.fieldnameScheduleAction.setValue("");
    }

    if (evt == 'trigger') {
      this.triggerVisibilty = true;
      this.scheduleVisibilty = false;
      this.dispositionVisibilty = false;
    } else if (evt == 'schedule'){
      if(form != 'Formdata'){
        this.IsSurveyformVisibility = false;
        this.triggerVisibilty = false;
        this.scheduleVisibilty = true;
        this.dispositionVisibilty = false;
      } else {
        this.IsSurveyformVisibility = false;
        this.triggerVisibilty = false;
        this.scheduleVisibilty = true;
        this.dispositionVisibilty = false;
      }
    } else if (evt == 'disposition') {
      this.triggerVisibilty = false;
      this.scheduleVisibilty = false;
      this.dispositionVisibilty = true;
    } else if (evt == 'surveyandfeedback') {
      if(form != 'Formdata'){
        this.IsSurveyformVisibility = true;
      } else {
        this.IsSurveyformVisibility = true;
      }
      this.triggerVisibilty = false;
      this.dispositionVisibilty = false;
      this.scheduleVisibilty = true;
    }
  }

  async getWorkflowDetailById(id: any) {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" });
    postData['sort'] = { 'dispalyformname': 1 };

    var url = "workflows/filter";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {
          this._workflowModel = data[0];

          if (this._workflowModel.criteriaRules) {
            if (this._workflowModel.criteriaRules == 'filterRecords' && this._workflowModel.criteria) {
              this.conditions = this._workflowModel.criteria;
            }
            this.criteria_rules_click(this._workflowModel.criteriaRules);
          }

          if(this._workflowModel.trigger && this._workflowModel.trigger['fields']) {
            this.triggerFieldsLists = [];
            let cnt = 1;
            this._workflowModel.trigger['fields'].forEach(element => {
              let obj = { fieldname: element, index: cnt}
              this.triggerFieldsLists.push(obj);
              cnt++;
            });
          } else {
            this._workflowModel.trigger = {};
            this._workflowModel.trigger["fields"] = [];
            this.triggerFieldsLists = [];
            let objTrigger = { fieldname: "", index: 1 };
            this.triggerFieldsLists.push(objTrigger);
            this._workflowModel.trigger["fields"].push(objTrigger);
          }

          if(this._workflowModel.subformid && this._allsurveyForms){
            this._allsurveyForms.forEach(element => {
              if(element.id == this._workflowModel.subformid){
                this.formnameSurvey.setValue(element);
                this.subformid.value.name  = element.name;
              }
            });
          }

          if(this._allForms && this._allForms.length > 0) {
            let formid = this._workflowModel && this._workflowModel.formid && this._workflowModel.formid._id ? this._workflowModel.formid._id : this._workflowModel.formid;
            var formObj = this._allForms.find(p=>p.id == formid);
            if(formObj) {
              this.formName = formObj.formname;
              this.formSchemaName = formObj.schemaname;
              this.formId = formObj.id;
              this.formid.setValue(formObj);

              try {
                await this.getFormSchema();
                await this.getAllCommunications();
                await this.getAllTasks();
                await this.getAllDisposition();
              } catch(error) {
                console.error(error)
              } finally {

                this.instanceActionVisibility = true;
                await this.checkCheckbox();
                this.isLoading = false;

              }

            }
          }
        }
    });
  }

  async checkCheckbox() {

    this.emailDisplay = [];
    this.mailMergeDisplay = [];
    this.smsDisplay = [];
    this.whatsappDisplay = [];
    this.notificationDisplay = [];
    this.taskDisplay = [];

    if (this._workflowModel.action['email'] && this.email) {
      this.email.forEach(elementEmail => {
        this._workflowModel.action['email'].forEach(ele => {
          if (ele._id == elementEmail._id) {
            elementEmail.selected = true;
            let obj = { id: elementEmail._id, name: elementEmail.title }
            this.emailDisplay.push(obj);
          }
        });
      });
    }

    if(this._workflowModel.action['mailmerge'] && this.mailMerge) {
      this.mailMerge.forEach(elementMailMerge => {
        this._workflowModel.action['mailmerge'].forEach(ele => {
          if (ele._id == elementMailMerge._id) {
            elementMailMerge.selected = true;
            let obj = { id: elementMailMerge._id, name: elementMailMerge.title }
            this.mailMergeDisplay.push(obj);
          }
        });
      });
    }

    if (this._workflowModel.action['sms'] && this.sms) {
      this.sms.forEach(elementSMS => {
        this._workflowModel.action['sms'].forEach(ele => {
          if (ele._id == elementSMS._id) {
            elementSMS.selected = true;
            let obj = { id: elementSMS._id, name: elementSMS.title }
            this.smsDisplay.push(obj);
          }
        });
      });
    }

    if (this._workflowModel.action['whatsapp'] && this.whatsapp) {
      this.whatsapp.forEach(elementWHATSAPP => {
        this._workflowModel.action['whatsapp'].forEach(ele => {
          if (ele._id == elementWHATSAPP._id) {
            elementWHATSAPP.selected = true;
            let obj = { id: elementWHATSAPP._id, name: elementWHATSAPP.title }
            this.whatsappDisplay.push(obj);
          }
        });
      });
    }

    if (this._workflowModel.action['notification'] && this.notification) {
      this.notification.forEach(elementNOTIFICATION => {
        this._workflowModel.action['notification'].forEach(ele => {
          if (ele._id == elementNOTIFICATION._id) {
            elementNOTIFICATION.selected = true;
            let obj = { id: elementNOTIFICATION._id, name: elementNOTIFICATION.title }
            this.notificationDisplay.push(obj);
          }
        });
      });
    }

    if (this._workflowModel.action['tasks'] && this._taskdata) {
      this._taskdata.forEach(elementTasks => {
        this._workflowModel.action['tasks'].forEach(ele => {
          if (ele._id == elementTasks._id) {
            elementTasks.selected = true;
            let obj = { id: elementTasks._id, name: elementTasks.title }
            this.taskDisplay.push(obj);
          }
        });
      });
    }

    console.log("dispositionList", this.dispositionList);

      if(this._workflowModel['disposition'] && this.dispositionList && this.dispositionList.length > 0) {
        var dispositionid = this._workflowModel['disposition'] && this._workflowModel['disposition']['_id'] ? this._workflowModel['disposition']['_id'] : this._workflowModel['disposition'];
        this.disposition = dispositionid;
        var dispositionObj = this.dispositionList.find(p=>p._id == this.disposition)
        if(dispositionObj) {
          this.selectedDisposition = dispositionObj;
        }
      }


    // if(this._workflowModel['disposition'] && this.dispositionDDTreeList && this.dispositionDDTreeList.length > 0) {
    //   var dispositionid = this._workflowModel['disposition'] && this._workflowModel['disposition']['_id'] ? this._workflowModel['disposition']['_id'] : this._workflowModel['disposition'];
    //   var dispositionObj = this.dispositionDDTreeList.find(p=>p._id == dispositionid)
    //   if(dispositionObj) {
    //     this.selectedDisposition = dispositionObj;
    //   }
    // }

    setTimeout(() => {
      if(this.conditions && this.fieldLists) {
        this.conditions.forEach(element => {
          if(element.fieldtype == 'lookup' || element.fieldtype == 'form' ) {
            this.fieldLists.forEach(ele => {
              if(ele.fieldname == element.fieldname) {
                if(ele.valueLists) {
                  ele.valueLists.forEach(e => {
                    if(e.id == element.fieldvalue) {
                      element.fieldvalue = e;
                    }
                  });
                }
              }
            });
          }
        });
      }
    }, 2500);

    return;
  }

  async getAllTasks() {

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'formid', "searchvalue": this.formId, "criteria": "eq" });

    let url = "activitytemplates/filter";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          if (data.length !== 0) {
            this._taskdata = [];
            this._taskdata = data;
            this._taskdata.forEach(element => {
              element.selected = false;
            });
            setTimeout(() => {
              var table = $('#datatables').DataTable();
              this.isLoading = false;
            }, 100);
          }
          return;
        }
    });
  }

  async getAllCommunications() {

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'formid', "searchvalue": this.formId, "criteria": "eq" , "datatype": "ObjectID"});

    let url = "communications/filter";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          console.log("data",data)
          this.email = [];
          this.mailMerge = [];
          this.sms = [];
          this.whatsapp = [];
          this.notification = [];

          if (data.length !== 0) {
            data.forEach(element => {
              element.selected = false;

              switch (element.messagetype) {
                case "EMAIL":
                  this.email.push(element);
                  break;
                case "MAILMERGE":
                  this.mailMerge.push(element);
                  break;
                case "SMS":
                  this.sms.push(element);
                  break;
                case "WHATSAPP":
                  this.whatsapp.push(element);
                  break;
                case "NOTIFICATION":
                  this.notification.push(element);
                  break;
                default:
              }

            });
            setTimeout(() => {
              var table = $('#datatables').DataTable();
              this.isLoading = false;
            }, 100);
          }
          return false;
        }
      });
  }

  async getAllDisposition() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": this.formId, "criteria": "eq" });

    let url = "dispositions/filter";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {

          this.dispositionList = [];
          this.dispositionList = data;

          var filterdata = await this.list_to_tree(this.dispositionList)
          this.treeControl = new NestedTreeControl<any>(node => node.children);
          this.dataSource.data = filterdata;

          // this.dispositionDDTreeList = JSON.parse(JSON.stringify(this.dispositionList));
          // if(this.dispositionDDTreeList.length > 0){
          //   let i = 0;
          //   this.dispositionDDTreeList.forEach( ele => {
          //     i = i+100;
          //     ele.displayOrder = i;
          //   });
          //   this.dispositionDDTreeList.forEach( ele => {
          //     let stage = 0
          //     ele.displayName = '';
          //     ele.displayNameDD = '';
          //     ele.displayNameSelect = '';

          //     ele.displayNameSelect = ele.disposition;
          //     ele.displayName = ele.disposition;
          //     ele.displayNameDD = ele.disposition;
          //     if(ele.parent != undefined){
          //       this.attachParentName(ele.parent, ele, stage);
          //     }
          //   });
          //   this.dispositionDDTreeList = this.dispositionDDTreeList.sort((n1,n2) => {if (n1.displayOrder > n2.displayOrder){return 1;}if (n1.displayOrder < n2.displayOrder){return -1;}return 0;});
          //   this.selectedDisposition = this.dispositionDDTreeList[0];
          // }
          return;
        }
    });
  }

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;


  async list_to_tree(list) {

    var map = {}, node, roots = [], i;
    for (i = 0; i < list.length; i += 1) {
      map[list[i]._id] = i;
      list[i].children = [];
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parentid !== null) {
        var parentid = node && node.parentid && node.parentid._id ? node.parentid._id : node.parentid;
        if(list[map[parentid]]) {
          list[map[parentid]].children.push(node);
        }
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  attachParentName(parentobj: any, currObj: any, stage:number){
    let tempobj: any;
    stage += 1;
    tempobj = this.dispositionDDTreeList.find(ele1 => ele1._id == parentobj);
    if(tempobj != undefined){
      if(tempobj.disposition != undefined){
        currObj.displayName = tempobj.disposition + ' --> ' + currObj.displayName;
        currObj.displayNameDD = '|---- ' + currObj.displayNameDD;
        currObj.displayOrder = tempobj.displayOrder + stage;
      }
      if(tempobj.parent != undefined){
        this.attachParentName(tempobj.parent, currObj, stage);
      }
    }
  }

  changeDesposition(desp: string){
    if(desp != ''){
      this.selectedDisposition = desp;
    }
  }

  radioChange(event: MatRadioChange) {

    console.log(event.value);


    if(event.value) {
      var disptionobj = this.dispositionList.find(p=>p._id == event.value);
      if(disptionobj) {
        this.selectedDisposition = disptionobj;
      }
    }
    console.log("this.selectedDisposition", this.selectedDisposition);
    // this.filter['property'] = event.value;
    // console.log(this.filter);
  }

  dispositionSubmit() {
    if(this.selectedDisposition !== '') {
      this.showWFRuleStep3();
      this._workflowModel.criteriaRules = 'allRecords';
      this.showWFRuleStep4();
    }
  }

  criteria_rules_click(val: any) {
    if (val == 'allRecords') {
      this.conditions = [];
      $("#trigEditSumMode2 .pT15").hide();
    } else {
      if (this.conditions) {
        if (this.conditions.length == 0) {
          let obj = { fieldname: "", operator: "", fieldvalue: "", fieldvalue2: "", index: 1, rule: this.criteria_pattern, fieldtype: "" };
          this.conditions.push(obj);
        }
      }
      $("#trigEditSumMode2 .pT15").show();
    }
  }

  async onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.formid.markAsDirty();
      return false;
    } else {

      this._workflowModel.formid = null;
      this._workflowModel.subformid = null;

      if (this.formid && this.formid.value && this.formid.value.id) {
        this._workflowModel.formid = this.formid.value['id'];
      } else {
        this.formid.markAsDirty();
        this.formid.setValidators([this.validateformidData]);
      }

      if (this.subformid && this.subformid.value && this.subformid.value.id) {
        this._workflowModel.subformid = this.subformid.value.id;
      }

      this._workflowModel.title = value.title;
      this._workflowModel.description = value.description;

      if (this._workflowModel.formid !== null) {

        $(".close").click();
        var formObj = this._allForms.find(p=>p.id == this._workflowModel.formid);
        if(formObj) {

          this.formName = formObj.formname;
          this.formId = formObj.id;
          this.formSchemaName = formObj.schemaname;
          try {
            await this.getFormSchema();
            await this.getAllCommunications();
            await this.getAllTasks();
            await this.getAllDisposition();
          } catch(error) {
            console.error(error)
          }
        }
      } else {
        this.showNotification('top', 'right', 'Something went wrong. Please try again!!', 'danger');
      }
    }
  }

  onKeyWorkFlowName(event: any) {
    this.nameAlreadyexists = false;
  }

  getFieldsBYsubForm(value :any){
    this.subformName = value;
    if(value && this.subformid && this.subformid.value){
      this.subformid.value.name = value.name
      if(value && this._workflowModel.workflowtype == 'schedule') {
        this.IsSurveyformVisibility = false;
      }
      if(value && this._workflowModel.workflowtype == 'surveyandfeedback') {
        this.IsSurveyformVisibility = true;
      }
      this.formName = value.formname;
      this.formSchemaName = value.schemaname;
      this.getFormSchema();
    }
  }

  async getFormSchema() {

    this.formName = this.formName.toLowerCase();
    this.dateFieldLists = [];
    if(this.formName != 'formdata' && this.formSchemaName != 'formdatas') {

      let url = "common/schemas/" + this.formName;
      let method = "GET";
      let postData =  "";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any)=>{
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

                      let postData = {}
                      postData["search"] = []
                      postData["search"] = [{ searchfield: element['fieldfilter'], searchvalue: element['fieldfiltervalue'], criteria: "eq" }]

                      return this._commonService
                        .commonServiceByUrlMethodDataAsync(url, method, postData)
                        .then((data: any) => {
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

                                let obj = { id: key, name: val };
                                this.dynamicValueLists[element.fieldname].push(obj);
                              });
                            }
                          }
                      });
                    }
                  } else if (element.fieldtype == 'lookup') {

                    let postData = {};
                    postData['search'] = [];
                    postData['search'].push({ "searchfield": '_id', "searchvalue": element.lookupid, "criteria": "eq" });
                    postData['select'] = [];
                    postData['select'].push({ "fieldname": '_id', "value": 1 });
                    postData['select'].push({ "fieldname": 'data', "value": 1 });
                    postData['sort'] = { 'property.first_name': 1 };

                    let url = "lookups/filter";
                    let method = "POST";

                    this._commonService
                      .commonServiceByUrlMethodDataAsync(url, method, postData)
                      .then((data: any) => {
                        if (data) {
                          let len = data.length;
                          let cnt = 1;
                          if (data.length !== 0) {
                            data.forEach(ele => {
                              if (ele['data'].length !== 0) {
                                ele['data'].forEach(e => {
                                  let obj = { id: e.code, name: e.name};
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
                              let obj = { id: eleref._id, name: eleref[reffieldname] }
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

                if(element.formname == this.formName){
                  this.fieldLists.push(element);
                }
                cnt++;

                if (cnt == len) {
                  this.isLoading = false;
                  this.flowVisibility = true;
                  this.dateFieldLists = [];
                  this.fieldLists.forEach(element => {
                    if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker') {
                      let obj = { id: element.fieldname, name: element.displayname}
                      this.dateFieldLists.push(obj);
                    }
                  });
                }
              });

              if (this.bindId) {
                if(this._workflowModel.feedbackformid) {
                  this.IsSurveyformVisibility = true;
                  this._allsurveyForms.forEach(element => {
                    if(element.id == this._workflowModel.feedbackformid){
                      this.formnameSurvey.setValue(element);
                    }
                  });
                }

                if (this._workflowModel.scheduleaction) {
                  this.dateFieldLists.forEach(element => {
                    if (element.id == this._workflowModel.scheduleaction['fieldname']) {
                      this._workflowModel.scheduleaction['fieldname'] = element;
                      this.fieldnameScheduleAction.setValue(element);
                    }
                  });

                  this.formScheduleAction.controls['timeScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['time']);
                  this.formScheduleAction.controls['monthScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['months']);
                  this.formScheduleAction.controls['daysScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['days']);
                  this.formScheduleAction.controls['occurrenceScheduleAction'].setValue(this._workflowModel.scheduleaction['occurrence']);

                  this.timeScheduleAction = this._workflowModel.scheduleaction['executiondate']['time'];
                  this.monthScheduleAction = this._workflowModel.scheduleaction['executiondate']['months'];
                  this.daysScheduleAction = this._workflowModel.scheduleaction['executiondate']['days'];
                  this.occurrenceScheduleAction = this._workflowModel.scheduleaction['occurrence'];


                }
              }
            }
          }
        });

    } else {

      let formname = (this.subformName['formname']).toLowerCase();

      let url = "common/schemas/" + formname;
      let method = "GET";
      let postData =  "";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any)=>{
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

                        let postData = {}
                        postData["search"] = [];
                        postData["search"] = [{ searchfield: element['fieldfilter'], searchvalue: element['fieldfiltervalue'], criteria: "eq" }];

                        this._commonService
                          .commonServiceByUrlMethodDataAsync(url, method, postData)
                          .then((data: any) => {
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
                                  let obj = { id: key, name: val};
                                  this.dynamicValueLists[element.fieldname].push(obj);
                                });
                              }
                            }
                        });
                    }
                  } else if (element.fieldtype == 'lookup') {

                    let postData = {};
                    postData['search'] = [];
                    postData['search'].push({ "searchfield": '_id', "searchvalue": element.lookupid, "criteria": "eq" });
                    postData['select'] = [];
                    postData['select'].push({ "fieldname": '_id', "value": 1 });
                    postData['select'].push({ "fieldname": 'data', "value": 1 });
                    postData['sort'] = { 'property.first_name': 1 };

                    let url = "lookups/filter";
                    let method = "POST";

                    this._commonService
                    .commonServiceByUrlMethodDataAsync(url, method, postData)
                      .then((data: any) => {
                        if (data) {
                          let len = data.length;
                          let cnt = 1;
                          if (data.length !== 0) {
                            data.forEach(ele => {
                              if (ele['data'].length !== 0) {
                                ele['data'].forEach(e => {
                                  let obj = { id: e.code, name: e.name };
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
                              let obj = { id: eleref._id, name: eleref[reffieldname]}
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
                let formname2 = this.subformName['formname'];
                if(element.formname == formname2){
                  this.fieldLists.push(element);
                }
                cnt++;
                if (cnt == len) {
                  this.isLoading = false;
                  this.flowVisibility = true;
                  this.dateFieldLists = [];
                  this.fieldLists.forEach(element => {
                    if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker') {
                      let obj = { id: element.fieldname, name: element.displayname }
                      this.dateFieldLists.push(obj);
                    }
                  });
                }
              });

              if (this.bindId) {

                if(this._workflowModel.feedbackformid) {
                  this.IsSurveyformVisibility = true;
                  var surevtFormObj = this._allsurveyForms.find(p=>p.id == this._workflowModel.feedbackformid);
                  if(surevtFormObj) {
                    this.formnameSurvey.setValue(surevtFormObj);
                  }
                }

                if (this._workflowModel.scheduleaction) {
                  this.dateFieldLists.forEach(element => {
                    if (element.id == this._workflowModel.scheduleaction['fieldname']) {
                      this._workflowModel.scheduleaction['fieldname'] = element;
                      this.fieldnameScheduleAction.setValue(element);
                    }
                  });


                  this.formScheduleAction.controls['timeScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['time']);
                  this.formScheduleAction.controls['monthScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['months']);
                  this.formScheduleAction.controls['daysScheduleAction'].setValue(this._workflowModel.scheduleaction['executiondate']['days']);
                  this.formScheduleAction.controls['occurrenceScheduleAction'].setValue(this._workflowModel.scheduleaction['occurrence']);

                  this.timeScheduleAction = this._workflowModel.scheduleaction['executiondate']['time'];
                  this.monthScheduleAction = this._workflowModel.scheduleaction['executiondate']['months'];
                  this.daysScheduleAction = this._workflowModel.scheduleaction['executiondate']['days'];
                  this.occurrenceScheduleAction = this._workflowModel.scheduleaction['occurrence'];
                }
              }
            }
          }
      });
    }

  }

  toggle() {
    this.isActive = !this.isActive;
  }

  sum_to_edit() {
    $("#trigEditSumMode .editMode").show();
    $("#trigEditSumMode .sumMode").hide();
    $("#trigEditSumMode").removeClass("wf_sec_focus");
    $("#trigEditSumMode .editMode").addClass("wf_sec_focus");
    if (this.bindId) {
      if (this._workflowModel.workflowtype == 'trigger') {
        $("#trigger_workflowtype").click();
        this.workflowtypeChangeEvent('trigger');
      } else if (this._workflowModel.workflowtype == 'schedule') {
        $("#schedule_workflowtype").click();
        this.workflowtypeChangeEvent('schedule');
      } else if (this._workflowModel.workflowtype == 'surveyandfeedback') {
        $("#schedule_workflowtype").click();
        this.workflowtypeChangeEvent('surveyandfeedback');
      } else {
        $("#schedule_workflowtype").click();
        this.workflowtypeChangeEvent('disposition');
      }
    }
  }

  showWFRuleStep3() {
    $("#trigEditSumMode .editMode").hide();
    $("#trigEditSumMode .sumMode").show();
    $("#trigEditSumMode").addClass("wf_sec_focus");
    $(".wf_Container_p .setLine").addClass("nextLine");
    $("#trigEditSumMode .editMode").removeClass("wf_sec_focus");
    $("#condition").show();
  }

  sum_to_edit2() {
    $("#trigEditSumMode2 .editMode").show();
    $("#trigEditSumMode2 .sumMode").hide();
    $("#trigEditSumMode2").removeClass("wf_sec_focus");
    $("#trigEditSumMode2 .editMode").addClass("wf_sec_focus");
  }

  showWFRuleStep4() {
    if (this._workflowModel.criteriaRules == 'allRecords') {
      $("#trigEditSumMode2 .editMode").hide();
      $("#trigEditSumMode2 .sumMode").show();
      $("#trigEditSumMode2").addClass("wf_sec_focus");
      $("#trigEditSumMode2 .editMode").removeClass("wf_sec_focus");
      this.instanceActionVisibility = true;
    } else {
      let cnt = 0;
      let len = this.conditions.length;
      let chk = 0;
      this.conditions.forEach(element => {
        if ((element.fieldname == '') || (element.operator == '') || (element.fieldvalue == '')) {
          chk++;
        }
        cnt++;
        if (cnt == len) {
          if (chk !== 0) {
            this.showNotification('top', 'right', 'Criteria cannot be empty', 'danger');
          } else {
            $("#trigEditSumMode2 .editMode").hide();
            $("#trigEditSumMode2 .sumMode").show();
            $("#trigEditSumMode2").addClass("wf_sec_focus");
            $("#trigEditSumMode2 .editMode").removeClass("wf_sec_focus");
            this._workflowModel.criteria = this.conditions;
            this.instanceActionVisibility = true;
          }
        }
      });
    }
  }

  addTriggerItem(index: number) {
    let nextIndex = this.triggerFieldsLists.length + 1;
    let obj = { fieldname: "", index: nextIndex };
    this.triggerFieldsLists.push(obj);
    this.pattern = "";
  }

  deleteTriggerItem(index: number) {
    for (var i = 0; i < this.triggerFieldsLists.length; i++) {
      var obj = this.triggerFieldsLists[i];
      if (obj['index'] == index) {
        this.triggerFieldsLists.splice(i, 1);
      }
    }
    let cnt = 1;
    this.triggerFieldsLists.forEach(element => {
      element.index = cnt;
      cnt++;
    });
  }

  addItem(index: number) {
    let nextIndex = this.conditions.length + 1;
    let obj = { fieldname: "", operator: "", fieldvalue: "", fieldvalue2: "", index: nextIndex, rule: "AND", fieldtype: "" };
    this.conditions.push(obj);
    this.pattern = "";
  }

  deleteItem(index: number) {
    for (var i = 0; i < this.conditions.length; i++) {
      var obj = this.conditions[i];
      if (obj['index'] == index) {
        this.conditions.splice(i, 1);
      }
    }
    let cnt = 1;
    this.conditions.forEach(element => {
      element.index = cnt;
      cnt++;
    });
  }

  changeText(i: any) {

    if (this.criteria_pattern == "AND") {
      this.criteria_pattern = "OR";
    } else {
      this.criteria_pattern = "AND";
    }
    this.conditions.forEach(element => {
      element.rule = this.criteria_pattern;
    });
  }

  submit() {

    if (this._workflowModel.criteriaRules !== 'allRecords') {
      let cnt = 0;
      let len = this.conditions.length;
      let chk = 0;
      this.conditions.forEach(element => {
        if ((element.fieldname == '') || (element.operator == '') || (element.fieldvalue == '')) {
          chk++;
        }
        cnt++;
        if (cnt == len) {
          if (chk !== 0) {
            this.showNotification('top', 'right', 'Criteria cannot be empty', 'danger');
            return;
          } else {
            if (this._workflowModel.workflowtype == 'trigger') {
              this.checkTrigger();
            } else if (this._workflowModel.workflowtype == 'schedule') {
              this.checkSchedule();
            } else {
              this.submitSuccess();
            }
          }
        }
      });
    } else {
      if (this._workflowModel.workflowtype == 'trigger') {
        this.checkTrigger();
      } else if (this._workflowModel.workflowtype == 'schedule') {
        this.checkSchedule();
      } else {
        this.submitSuccess();
      }
    }
  }

  checkSchedule() {

    let executiondate = {
      time: this.timeScheduleAction,
      months: this.monthScheduleAction,
      days: this.daysScheduleAction
    }

    this._workflowModel.scheduleaction = {
      fieldname: this.fieldnameScheduleAction,
      executiondate: executiondate,
      occurrence: this.occurrenceScheduleAction
    }


    if (this._workflowModel.scheduleaction['fieldname'] !== '' && this._workflowModel.scheduleaction['executiondate']['time'] !== '' && this._workflowModel.scheduleaction['executiondate']['months'] !== '' && this._workflowModel.scheduleaction['executiondate']['days'] !== '' && this._workflowModel.scheduleaction['executiontime'] !== '' && this._workflowModel.scheduleaction['occurrence'] !== '') {
      this.submitSuccess();
    } else {
      this.showNotification('top', 'right', 'Schedule action cannot be empty.', 'danger');
      return;
    }
  }

  checkTrigger() {
    let cnt = 0;
    let len = this.triggerFieldsLists.length;
    let chk = 0;
    this.triggerFieldsLists.forEach(element => {
      if (element.fieldname == '') {
        chk++;
      }
      cnt++;
      if (cnt == len) {
        if (chk !== 0) {
        } else {
        }
        //this.submitSuccess();
      }
    });
    this.submitSuccess();
  }

  async submitSuccess() {

    if (this.emailDisplay.length == 0 && this.mailMergeDisplay.length == 0 && this.smsDisplay.length == 0 && this.whatsappDisplay.length == 0 && this.notificationDisplay.length == 0 && this.taskDisplay.length == 0) {
      this.showNotification('top', 'right', 'You cannot create a workflow rule without any actions. Please associate instant and/or scheduled actions to this rule as needed.', 'danger');
      return;
    } else {

      if(!this._workflowModel.action) {
        this._workflowModel.action = {};
      }

      this._workflowModel.action['email'] = [];
      this._workflowModel.action['mailmerge'] = [];
      this._workflowModel.action['sms'] = [];
      this._workflowModel.action['whatsapp'] = [];
      this._workflowModel.action['notification'] = [];
      this._workflowModel.action['tasks'] = [];
      this._workflowModel.action['disposition'] = '';

      if(this._workflowModel.workflowtype == "disposition") {
        this._workflowModel['disposition'] = this.selectedDisposition && this.selectedDisposition._id ? this.selectedDisposition._id : this.selectedDisposition;
      }

      this.emailDisplay.forEach(element => {
        this._workflowModel.action['email'].push(element.id);
      });

      this.mailMergeDisplay.forEach(element => {
        this._workflowModel.action['mailmerge'].push(element.id);
      });

      this.smsDisplay.forEach(element => {
        this._workflowModel.action['sms'].push(element.id);
      });

      this.whatsappDisplay.forEach(element => {
        this._workflowModel.action['whatsapp'].push(element.id);
      });

      this.notificationDisplay.forEach(element => {
        this._workflowModel.action['notification'].push(element.id);
      });

      this.taskDisplay.forEach(element => {
        this._workflowModel.action['tasks'].push(element.id);
      });

      this.conditions.forEach(element => {
        if(element.fieldtype == 'lookup' || element.fieldtype == 'form') {
          if(element.fieldvalue) {
            if(element.fieldvalue['id']) {
              element.fieldvalue = element.fieldvalue['id'];
            } else {
              this.fieldLists.forEach(eleNew => {
                if(eleNew.fieldname == element.fieldname) {
                  if(eleNew.valueLists && eleNew.valueLists.length !== 0) {
                    eleNew.valueLists.forEach(e => {
                      if(e.name == element.fieldvalue) {
                        element.fieldvalue = e.id;
                      }
                    });
                  }
                }
              });
            }
          }
        }
      });

      this._workflowModel.criteria = [];
      this._workflowModel.criteria = this.conditions;

      this._workflowModel.trigger = {};

      this.triggerFieldsLists.forEach(element => {
        if(element.fieldname !== '') {
          if(!this._workflowModel.trigger['fields']) {
            this._workflowModel.trigger['fields'] = [];
          }
          this._workflowModel.trigger['fields'].push(element.fieldname);
        }

      });

      this._workflowModel.criteria_pattern = this.criteria_pattern;

      if (this._workflowModel.scheduleaction) {
        this._workflowModel.scheduleaction['fieldname'] = this._workflowModel && this._workflowModel.scheduleaction && this._workflowModel.scheduleaction['fieldname'] && this._workflowModel.scheduleaction['fieldname'].value && this._workflowModel.scheduleaction['fieldname'].value['id'] ? this._workflowModel.scheduleaction['fieldname'].value['id'] : this._workflowModel.scheduleaction['fieldname'];
      }

      if(this._workflowModel.workflowtype == "disposition") {
        this._workflowModel.trigger = {};
      }


      if (!this._workflowModel._id) {

        var url = "workflows";
        var method = "POST";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, this._workflowModel)
          .then((data: any) => {
            this.showNotification('top', 'right', 'Workflow has been added successfully!!!', 'success');
            this._router.navigate(['/pages/dynamic-list/list/workflow']);
          });
      } else {

        var url = "workflows/"+ this._workflowModel._id;
        var method = "PUT";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, this._workflowModel)
          .then((data: any) => {
            this.showNotification('top', 'right', 'Workflow has been updated successfully!!!', 'success');
            this._router.navigate(['/pages/dynamic-list/list/workflow']);
          });
      }
    }
  }

  actionModalPopup(action: any) {
    this._selectedAction = action;
    $("#loadActions").click();

    setTimeout(() => {
      var count = 0;
      switch(this._selectedAction) {
        case "email":
          if(this.email && this.email.length > 0 ) count++;
          break;
        case "mailmerge":
          if(this.mailMerge && this.mailMerge.length > 0 ) count++;
          break;
        case "sms":
          if(this.sms && this.sms.length > 0 ) count++;
          break;
        case "whatsapp":
          if(this.whatsapp && this.whatsapp.length > 0 ) count++;
          break;
        case "notification":
          if(this.notification && this.notification.length > 0 ) count++;
          break;
        case "tasks":
          if(this._taskdata && this._taskdata.length > 0 ) count++;
          break;

        default:
      }
      if(count > 0) {
        $('#datatables').DataTable();
        this.isLoading = false;
      }
    }, 1000);
  }

  actionSubmit() {

    this.emailDisplay = [];
    this.mailMergeDisplay = [];
    this.smsDisplay = [];
    this.whatsappDisplay = [];
    this.notificationDisplay = [];
    this.taskDisplay = [];

    if(this.email) {
      this.email.forEach(elementEmail => {
        if (elementEmail.selected) {
          let obj = {
            id: elementEmail._id,
            name: elementEmail?.title
          }
          this.emailDisplay.push(obj);
        }
      });
    }

    if(this.mailMerge) {
      this.mailMerge.forEach(elementNotify => {
        if (elementNotify.selected) {
          let obj = {
            id: elementNotify._id,
            name: elementNotify.title
          }
          this.mailMergeDisplay.push(obj);
        }
      });
    }

    if(this.sms) {
      this.sms.forEach(elementSMS => {
        if (elementSMS.selected) {
          let obj = {
            id: elementSMS._id,
            name: elementSMS?.title
          }
          this.smsDisplay.push(obj);
        }
      });
    }

    if(this.whatsapp) {
      this.whatsapp.forEach(elementWhatsApp => {
        if (elementWhatsApp.selected) {
          let obj = {
            id: elementWhatsApp._id,
            name: elementWhatsApp?.title
          }
          this.whatsappDisplay.push(obj);
        }
      });
    }

    if(this.notification) {
      this.notification.forEach(elementNOTIFY => {
        if (elementNOTIFY.selected) {
          let obj = {
            id: elementNOTIFY._id,
            name: elementNOTIFY?.title
          }
          this.notificationDisplay.push(obj);
        }
      });
    }

    if(this._taskdata) {
      this._taskdata.forEach(elementTasks => {
        if (elementTasks.selected) {
          let obj = {
            id: elementTasks._id,
            name: elementTasks.taskname
          }
          this.taskDisplay.push(obj);
        }
      });
    }

    $("#myModalActionClose").click();
  }

  removeAction(id: any, action: any) {
    let varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
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

        switch (action) {
          case "email":
            var emailObj = varTemp.email.find(p=>p._id == id);
            if(emailObj) {
              emailObj.selected = false;
            }
            break;
          case "mailmerge":
            var mailMergeObj = varTemp.mailMerge.find(p=>p._id == id);
            if(mailMergeObj) {
              mailMergeObj.selected = false;
            }
            break;
          case "sms":
            var smsObj = varTemp.sms.find(p=>p._id == id);
            if(smsObj) {
              smsObj.selected = false;
            }
            break;
          case "whatsapp":
            var whatsappObj = varTemp.whatsapp.find(p=>p._id == id);
            if(whatsappObj) {
              whatsappObj.selected = false;
            }
            break;
          case "notification":
            var notificationObj = varTemp.notification.find(p=>p._id == id);
            if(notificationObj) {
              notificationObj.selected = false;
            }
            break;
          case "tasks":
            var taskObj = varTemp._taskdata.find(p=>p._id == id);
            if(taskObj) {
              taskObj.selected = false;
            }
            break;
        }

        setTimeout(() => {
          varTemp.actionSubmit();
        }, 1000);

        swal.fire({
          title: 'Deleted!',
          text: 'Your imaginary file has been deleted.',
          icon: 'success',
          customClass:{
            confirmButton: "btn btn-success",
          },
          buttonsStyling: false
        });
      } else {
        swal.fire({
            title: 'Cancelled',
            text: 'Your imaginary file is safe :)',
            icon: 'error',
            customClass:{
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
        });
      }
    })
  }

  onFieldChange(newValue: any, item: any) {
    item.operator = "";
    item.fieldvalue = "";
    item.fieldvalue2 = "";
    this.fieldLists.forEach(element => {
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

    this.fieldLists.forEach(element => {
      if (element.fieldname == newValue) {
        item.fieldtype = element.fieldtype;
      }
    });
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.name}  </span>`;
    return html;
  }

  openSchduleAction() {
    if (this.dateFieldLists.length !== 0) {
      this.scheduleActionID = "";
      this.timeScheduleAction = "";
      this.monthScheduleAction = "";
      this.daysScheduleAction = "";
      $("#loadSchdeuleActions").click();
    } else {
    }
  }

  onSubmitScheduleAction(value: any, isValid: boolean) {
    this.submittedScheduleAction = true;

    if (!this.scheduleActionLists) {
      this.scheduleActionLists = [];
    }

    if (!isValid) {
      return false;
    } else {

      var fieldnameScheduleAction = null;

      if (this.fieldnameScheduleAction && this.fieldnameScheduleAction.value && this.fieldnameScheduleAction.value.id) {
        fieldnameScheduleAction = this.fieldnameScheduleAction.value['id'];
      }

      if(fieldnameScheduleAction == null) {
        this.showNotification('top', 'right', 'Something went wrong. Please try again!!', 'danger');
        return;
      }

      this.timeScheduleAction = value.timeScheduleAction;
      this.monthScheduleAction = value.monthScheduleAction;
      this.daysScheduleAction = value.daysScheduleAction;

      let executiondate = {
        time: value.timeScheduleAction,
        months: value.monthScheduleAction,
        days: value.daysScheduleAction
      }

      this._workflowModel.feedbackformid = null;

      if(this.formnameSurvey && this.formnameSurvey.value && this.formnameSurvey.value['id']) {
        this._workflowModel.feedbackformid = this.formnameSurvey.value['id']
      }

      this._workflowModel.scheduleaction = {
        fieldname: fieldnameScheduleAction,
        executiondate: executiondate,
        occurrence: value.occurrenceScheduleAction
      }

      this.occurrenceScheduleAction = value.occurrenceScheduleAction;

      this.showWFRuleStep3();
    }
  }

  editOpenScheduleAction(item: any) {
    this.dateFieldLists.forEach(element => {
      if (element.id == item.fieldname) {
        item.fieldname = element;
        this.fieldnameScheduleAction.setValue(element);
      }
    });

    this.scheduleActionID = item.scheduleActionID;
    this.timeScheduleAction = item.executiondate.time;
    this.monthScheduleAction = item.executiondate.months;
    this.daysScheduleAction = item.executiondate.days;
    $("#loadSchdeuleActions").click();
  }

  deleteScheduleAction(item: any) {
    let varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
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
        varTemp.remove(item.scheduleActionID, varTemp.scheduleActionLists);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  removeToEdit(id: number, array: any, postValue: any) {
    for (let i in array) {
      if (array[i].scheduleActionID == id) {
        array.splice(i, 1);
        this.scheduleActionLists.push(postValue);
      }
    }
  }

  remove(id: number, array: any) {
    for (let i in array) {
      if (array[i].scheduleActionID == id) {
        array.splice(i, 1);
        swal.fire({
          title: 'Deleted!',
          text: 'Your Action has been deleted.',
          icon: 'success',
          customClass:{
            confirmButton: "btn btn-success",
          },
          buttonsStyling: false
        });
      }
    }
  }

  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
      }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  deleteWorkflow() {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
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
        varTemp._commonService
          .commonServiceByUrlMethodIdOrData(varTemp.deleteobj.actionurl, varTemp.deleteobj.method, varTemp.bindId, { 'formname': varTemp.deleteobj.formname })
          .subscribe((data: any) => {
            if (data) {
              var successmessage1 = '';
              var actionmessage1 = '';

              if (data.message !== 'DELETED') {
                actionmessage1 = data.message;
              }

              if (data.message === 'DELETED') {
                successmessage1 = varTemp.deleteobj.successmessage;
              }

              varTemp._router.navigate(['/pages/dynamic-list/list/workflow']);

              swal.fire({
                title: actionmessage1,
                text: successmessage1,
                icon: 'success',
                customClass:{
                  confirmButton: "btn btn-success",
                },
                buttonsStyling: false
              });
            }
          }, data => {
            varTemp._router.navigate(['/pages/dynamic-list/list/workflow']);
          });

      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
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

  private _formnidfilter(value: string): string[] {
    let results;
    if (value) {
      results = this._allForms
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this._allForms.slice();
    }
    return results;
  }

  enterFormid() {
    const controlValue = this.formid.value;
    this.formid.setValue(controlValue);
  }

  preloadFormiddata() {
    if(this._allForms && this._allForms.length == 0) {
      this.getAllForms()
    }
  }

  handleEmptyFormidInput(event: any){
    if(event.target.value === '') {
      this.formid.setValue("");
      this._allForms = [];
      this.getDetailByformname(this.formid.value)
    }
  }

  displayFormidFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  optionFormidSelected(option: any) {
    this.formid.setValue(option.value);
    this.getDetailByformname(this.formid.value)
  }

  private _subformidfilter(value: string): string[] {
    let results;
    if (value) {
      results = this._allsurveyForms
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this._allsurveyForms.slice();
    }
    return results;
  }

  enterSubformid() {
    const controlValue = this.subformid.value;
    this.subformid.setValue(controlValue);
  }

  preloadSubformiddata() {
    if(this._allsurveyForms && this._allsurveyForms.length == 0) {
      this.getAllForms()
    }
  }

  handleEmptySubformidInput(event: any){
    if(event.target.value === '') {
      this.subformid.setValue("");
      this._allsurveyForms = [];
    }
  }

  displaySubformidFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  optionSubformidSelected(option: any) {
    this.subformid.setValue(option.value);
    this.getFieldsBYsubForm(this.subformid.value)
  }

  private _formnameSurveyfilter(value: string): string[] {
    let results;
    if (value) {
      results = this._allsurveyForms
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this._allsurveyForms.slice();
    }
    return results;
  }

  enterformnameSurvey() {
    const controlValue = this.formnameSurvey.value;
    this.formnameSurvey.setValue(controlValue);
  }

  preloadformnameSurveydata() {
    if(this._allsurveyForms && this._allsurveyForms.length == 0) {
      this.getAllForms()
    }
  }

  handleEmptyformnameSurveyInput(event: any){
    if(event.target.value === '') {
      this.formnameSurvey.setValue("");
      this._allsurveyForms = [];
    }
  }

  displayformnameSurveyFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  optionformnameSurveySelected(option: any) {
    this.formnameSurvey.setValue(option.value);
  }

  private _fieldnameScheduleActionfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.dateFieldLists
        .filter(option => {
          if(option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.dateFieldLists.slice();
    }
    return results;
  }

  enterfieldnameScheduleAction() {
    const controlValue = this.fieldnameScheduleAction.value;
    this.fieldnameScheduleAction.setValue(controlValue);
  }

  preloadfieldnameScheduleActiondata() {
    if(this.dateFieldLists && this.dateFieldLists.length == 0) {
      this.getFormSchema()
    }
  }

  handleEmptyfieldnameScheduleActionInput(event: any){
    if(event.target.value === '') {
      this.fieldnameScheduleAction.setValue("");
      this.dateFieldLists = [];
    }
  }

  displayfieldnameScheduleActionFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  optionfieldnameScheduleActionSelected(option: any) {
    this.fieldnameScheduleAction.setValue(option.value);
  }

  cancelCreate() {
    this._router.navigate(['/pages/dynamic-list/list/workflow']);
  }

}
