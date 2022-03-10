import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { FormdataModel } from './../../../../../core/models/formdata/formdata.model';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { WorkflowModel } from './../../../../../core/models/workflow/workflow.model';


declare var $: any

@Component({
  selector: 'app-configureformdetail',
  templateUrl: './configureformdetail.component.html',
})
export class ConfigureformdetailComponent extends BaseComponemntComponent implements OnInit {
  configureform: FormGroup;
  timeScheduleAction: any;
  daysScheduleAction: any;
  monthScheduleAction: any;
  displaynameScheduleAction: any
  fieldnameScheduleAction: any;
  dispalyformname: any;
  occurrenceScheduleAction: any;
  editWorkflowFilterTrigger: boolean = false;
  conditions: any[] = [];
  criteria_pattern: any;
  fieldLists: any[] = [];
  pattern: any;
  editWorkflowTrigger: boolean = false;
  _formdataModel = new FormdataModel();
  _workflowModel = new WorkflowModel();
  isDisable: boolean;
  _formFieldLists: any;
  submittedby: string = 'Member';
  moduleList: any = [];
  surveyfor: any;
  taskDisplay: any[] = [];
  notificationDisplay: any[] = [];
  mailMergeDisplay: any[] = [];
  pushnotificationDisplay: any[] = [];
  whatsappDisplay: any[] = [];
  triggerFieldsLists: any[] = [];
  dateFieldLists: any[] = [];
  selectedOccurance: any;
  selecteddateOfExe: any;
  selectedFieldName: any;
  datalist: any[] = []
  datelist: any[] = []
  datanewlist: any[] = []
  _formdataId: any;
  selectedFormdataList: any[] = [];
  fieldname: FormControl;
  checked: boolean = true;




  constructor(
    private formbuilder: FormBuilder,
    private _route: ActivatedRoute
  ) {
    super();
    this.timeScheduleAction = '1';
    this.daysScheduleAction = 0;
    this.monthScheduleAction = 0;
    this.editWorkflowTrigger = true;
    this.editWorkflowFilterTrigger = true;
    this._route.params.forEach(params => {
      this._formId = params['formid'];
      this._formdataId = params['formdataid'];

      if (this._formdataId) {
        this.getformdata(this._formdataId);
      }

    });

    this.conditions = [];
    this.criteria_pattern = "AND";
    let obj = { fieldname: "", operator: "", fieldvalue: "", fieldvalue2: "", index: 1, rule: this.criteria_pattern, fieldtype: "" };
    this.conditions.push(obj);
    this._workflowModel.criteriaRules = "allRecords";
    //this.criteria_rules_click('allRecords');

    this.triggerFieldsLists = [];
    let objTrigger = { fieldname: "", index: 1 };
    this.triggerFieldsLists.push(objTrigger);

    this.configureform = formbuilder.group({
      'fieldname': [this._formdataModel.fieldname],
      'time': [''],
      'days': [''],
      'months': [''],
      'occurrence': [''],
      'criteriaRules': [''],

    })
  }

  async ngOnInit() {
    this.isDisable = false
  }
  //retrive selected form of selectedformdata value
  getformdata(id: any) {
    var url = "formdatas/" + this._formdataId;
    var method = "GET";
    let postData = {};
    postData['search'] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.selectedFormdataList = [];
          this.selectedFormdataList = data;
          this.dispalyformname = data.formid.dispalyformname;
          if (data.property && data.property.scheduleaction) {
            this.configureform.get("fieldname").setValue(this.selectedFormdataList['property']['scheduleaction']['fieldname']);
            this.configureform.get("time").setValue(this.selectedFormdataList['property']['scheduleaction']['executiondate']['time']);
            this.configureform.get("days").setValue(this.selectedFormdataList['property']['scheduleaction']['executiondate']['days']);
            this.configureform.get("months").setValue(this.selectedFormdataList['property']['scheduleaction']['executiondate']['months']);
            this.configureform.get("occurrence").setValue(this.selectedFormdataList['property']['scheduleaction']['occurrence']);


          }

          /*   if(data.property && data.property.criteria){
              data.property.criteria.forEach(element => {
                console.log(element);

                this.configureform.get("fieldname1").setValue(element.fieldname)

              });
            } */

          this.getmainData(data.formid.workflowid.formname);
          return;
        }
      })
  }

  onItemSelect(item: any) {
    this.selectedOccurance = item;


  }

  onDateofExecution(item: any) {
    this.selecteddateOfExe = item;

  }

  onFieldName(field: any) {
    this.selectedFieldName = field;


  }

  getmainData(formname: any) {

    var url = "common/schemas/" + formname;
    var method = "GET";
    let postData = {};
    postData['search'] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          data.forEach(ele => {
            if (ele.id) {
              var fieldname = ele.id.split('.');
              if (fieldname.length == 1) {
                if (ele.fieldtype == 'Date') {
                  this.datelist.push(ele)
                }
              }
              else if (fieldname.length == 2 && fieldname[0] == "property") {
                if (ele.fieldtype.toLowerCase() == 'datepicker' || ele.fieldtype.toLowerCase() == 'date') {
                  ele['displayname'] = ele.fieldname.replace("property.","")
                  this.datelist.push(ele)
                }
              }

            }
          })
        }
      })
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.name}  </span>`;
    return html;
  }

  /*
    criteria_rules_click(val: any) {
      if (val == 'allRecords') {
        this.conditions = [];

      } else {

        if (this.conditions) {
          if (this.conditions.length == 0) {
            let obj = { fieldname: "", operator: "", fieldvalue: "", index: 1, rule: this.criteria_pattern, fieldtype: "" };
            this.conditions.push(obj);
            console.log(this.conditions);
          }
        }

      }
    } */

  /*  changeText(i: any) {

     if (this.criteria_pattern == "AND") {
       this.criteria_pattern = "OR";
     } else {
       this.criteria_pattern = "AND";
     }
     this.conditions.forEach(element => {
       element.rule = this.criteria_pattern;
     });
   } */

  //first dp
  /*  onFieldChange(newValue: any, item: any) {
     item.operator = "";
     item.fieldvalue = "";
     this.datanewlist.forEach(element => {
       if (element.fieldname == newValue) {
         if (element.fieldtype == 'lookup' || element.fieldtype == 'form') {
           item.valueLists = element.valueLists;
         }
         item.fieldtype = element.fieldtype;
         console.log(item.fieldtype);

       }
     });
   }
  */
  //second dp
  /*  onFieldTypeChange(newValue: any, item: any) {
     item.fieldvalue = "";
     this.datanewlist.forEach(element => {
       if (element.fieldname == newValue) {
         item.fieldtype = element.fieldtype;
       }
     });
   } */

  /*  addItem(index: number) {
     let nextIndex = this.conditions.length + 1;
     let obj = { fieldname: "", operator: "", fieldvalue: "", index: nextIndex, rule: "AND", fieldtype: "" };
     this.conditions.push(obj);
     console.log(this.conditions);
   this.pattern = "";
   } */

  /*  deleteItem(index: number) {
     for (var i = 0; i < this.conditions.length; i++) {
       var obj = this.conditions[i];
       if (obj['index'] == index) {
         this.conditions.splice(i, 1);
         console.log(this.conditions);

       }
     }
     let cnt = 1;
     this.conditions.forEach(element => {
       element.index = cnt;
       cnt++;
     });
   } */

  onSubmit(value: any) {
    console.log("this.configureform", this.selectedFormdataList['property'])

    this.isDisable = true;

    let postData = {
      property: {
        scheduleaction:
        {
          fieldname: this.configureform.get("fieldname").value,
          executiondate: {
            time: this.configureform.get("time").value,
            months: this.configureform.get("months").value,
            days: this.configureform.get("days").value
          },
          occurrence: this.configureform.get("occurrence").value,
        }
      },
    }
    this.selectedFormdataList['property'] = postData

    var url = "formdatas/" + this._formdataId;
    var method = "PATCH";


    this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {
          this.isDisable = false;
          this.showNotification('top', 'right', 'Trigger detail added successfully!!!', 'success');
        }
      })

  }


  removeTrigger() {
    this._router.navigateByUrl("/pages/integration-module/survey-integration");
  }

}
