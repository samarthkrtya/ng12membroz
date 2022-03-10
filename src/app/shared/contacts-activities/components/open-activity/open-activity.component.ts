import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import {MatTableDataSource} from '@angular/material/table';

import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';


declare var $: any;
@Component({
  selector: 'app-open-activity',
  templateUrl: './open-activity.component.html',
  styles: [
    `
    .example-tree-invisible {
  display: none;
}


.example-tree ul,
.example-tree li {
  margin-top: 0;
  margin-bottom: 0;
  list-style-type: none;
}


.cursor-pointer{
        cursor: pointer;
      }
`
  ]
})
export class OpenActivityComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  openActivitieLists: any [] = [];
  dispositionDDTreeList: any [] = [];
  _dispositionPermission: any[] = [];
  dispositionFormList: any[] = [];
  dispositionDDList: any[] = [];
  dispositionDataList: any[] = [];

  selectedDisposition: any = '';

  showdispForm = false;
  isLoading = false;
  viewVisibility = false;

  isfollowup = false;

  checktoallowParams: any;

  form: FormGroup;
  submitted: boolean;

  closeActivityModel: any;
  closeActivityVisibility: boolean = false;

  formVisible: boolean = true;

  fields = {
    fieldname : "assingeeuser",
    fieldtype : "form",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq"},
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "property", value: 1 },
      { fieldname: "fullname", value: 1 }
    ],
    form: {
      apiurl : "users/filter",
      formfield : "_id",
      displayvalue : "fullname",
    },
    required: true,
    method : "POST",
    value: "",
    visible: true
  }


  public scheduledate = new FormControl(new Date());
  assingeeuser: any;
  closeDeal: boolean = false;

  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource;
  disposition: any;

  dispositionAllData: any [] = [];
  dispositonLists: any [] = [];

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()

    this.pagename="app-open-activity";

    this.form = fb.group({
      'disposition': [this.disposition, Validators.required],
      'scheduledate': [this.scheduledate, Validators.required],
      'assingeeuser': [this.assingeeuser, Validators.required]
    });
  }

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() formname: any;
  @Input() onModel: any;

  @Output() onOpenActivityData: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCloseActivityData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      //await this.getDispositionPermission()
      await this.getOpenActivities()
      await this.getDispositionData()
    } catch(error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.openActivitieLists = [];
    this.dispositionDDTreeList = [];
    this._dispositionPermission = [];
    this.disposition = "";
    this.closeActivityModel = {};
    this.closeActivityVisibility = false;
    this.closeDeal = false;
    this.dispositionAllData = [];
    this.dispositonLists = [];
    return;
  }



  async getOpenActivities() {
   
    this.openActivitieLists = this.dataContent.openactivity;
    return;
  }

  async getDispositionData() {

    if(this._organizationsetting && this._organizationsetting.databasetype && this._organizationsetting.databasetype == "branchwise") {

      var method = "POST";
      var url = "dispositions/filter";

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
      postData["search"].push({ "searchfield": "formid", "searchvalue": this.formid, "criteria": "eq" });
      
      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.dispositionAllData = [];
            this.dispositionAllData = data;
            return;
          }
        }, (error)=>{
        console.error(error);
      });
    } else {
      this.dispositionAllData = [];
      this.dispositionAllData = this._loginUserRole.dispositionpermissions ? this._loginUserRole.dispositionpermissions : [];
      return;
    }

  }
  async loadDisposition() {

    this.submitted = false;
    this.formVisible = false;
    this.form.get("disposition").setValue("");

    setTimeout(async () => {
      this.formVisible = true;
      
      this.dispositonLists = [];
      this.dispositonLists = this.dispositionAllData.filter( ele => ele.formid && ele.formid._id ? (ele.formid._id == this.formid) : (ele.formid == this.formid));
      
      var filterdata = await this.list_to_tree(this.dispositonLists)
      this.treeControl = new NestedTreeControl<any>(node => node.children);
      this.dataSource.data = filterdata;
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

  advcQtyClose() {
    this.form.reset();
    $("#close").click();
    setTimeout(() => {
      this.onOpenActivityData.emit();
    }, 500);
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {

      var url = "activities"
      var method = "POST";

      var type: any;
      var dispositonObj = this.dispositionAllData.find( ele => ele._id  == value.disposition);
      if(dispositonObj) {
        type = dispositonObj.action;
      }

      let postData = {
        dispositionid: value.disposition,
        type: type,
        customerid: this.dataContent._id,
        onModel: this.onModel,
        duedate: value.scheduledate.value ? value.scheduledate.value : value.scheduledate,
        assingeeuser: value.assingeeuser._id
      }

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .subscribe( (data: any) => {
          if(data){
            
            $("#close").click();
            this.showNotification('top', 'right', 'Actvity has been submitted successfully', 'success');
            setTimeout(() => {
              this.onOpenActivityData.emit();
            }, 1000);

          }
      }, (error) =>{
        console.error(error);
      });


    }
  }

  viewmore() {
    let postData = {
      panelOpenState: true
    }
    this.onOpenActivityData.emit(postData);
  }

  closeActivity(item: any) {
    this.closeActivityModel = {}
    this.closeActivityVisibility = true;
    this.closeActivityModel = item;
    this.closeDeal = true;
    this.closeActivityModel.dispositionName = this.closeActivityModel && this.closeActivityModel._id && this.closeActivityModel._id.dispositionid && this.closeActivityModel._id.dispositionid.disposition ? this.closeActivityModel._id.dispositionid.disposition : this.closeActivityModel && this.closeActivityModel.dispositionid && this.closeActivityModel.dispositionid.disposition ? this.closeActivityModel.dispositionid.disposition : '---';
    this.closeActivityModel.customFields = this.closeActivityModel && this.closeActivityModel._id && this.closeActivityModel._id.dispositionid && this.closeActivityModel._id.dispositionid.fields ? this.closeActivityModel._id.dispositionid.fields : this.closeActivityModel && this.closeActivityModel.dispositionid && this.closeActivityModel.dispositionid.fields ? this.closeActivityModel.dispositionid.fields : [];
    console.log("closeActivityModel", this.closeActivityModel);
    $("#closeActivityPopup").click();
    setTimeout(() => {
      $("#openActivity").click();
    }, 500);
  }

  getSubmittedData(submit_data: any) {

    if(submit_data) {

      var method = "PATCH";
      var url = "activities/" + (this.closeActivityModel._id._id ? this.closeActivityModel._id._id : this.closeActivityModel._id);

      let postData = {};
      postData['property'] = {};
      postData['property'] = submit_data.value;
      postData['status'] = 'close';

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {


            $("#closeactivitybtn").click();

            this.showNotification('top', 'right', 'Disposition has been submitted successfully!!!', 'success');
            this.onCloseActivityData.emit();

            if(submit_data.reSchedule) {
              setTimeout(() => {
                $("#openActivity").click();
              }, 2000);
            }
          }
        }, (error)=>{
        console.error(error);
      });
    }
  }

}
