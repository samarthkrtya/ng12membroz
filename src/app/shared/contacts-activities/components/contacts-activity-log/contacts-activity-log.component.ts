import { Component, OnInit, Input } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import 'rxjs/add/operator/debounceTime';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import { MatRadioChange } from '@angular/material/radio';


import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-contacts-activity-log',
  templateUrl: './contacts-activity-log.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(300, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(300, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
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

    `
  ]
})
export class ContactsActivityLogComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() context: any;
  @Input() schema: any;

  postData: any = {};

  pageSize = 10;
  currentPage: number = 1;
  historyList: any[] = [];
  isLoading: boolean = false;
  disableBtn: boolean = true;

  Object = Object;
  selectedMessage: string = "";
  selectedDispositionDetails: any;
  selectedSection: any;

  myControl = new FormControl();
  options: string[] = ['Meeting', 'Followup', 'Fresh Call'];
  filteredOptions: Observable<string[]>;
  filterSearch = [];

  isLoadingBox: boolean = false;


  disposition: any;

  dispositionFormVisbility: boolean = false;

  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource;

  dispositionLists: any [] = [];
  contentVisible: boolean = false;

  selectedDisposition: any = '';

  dispositionAllData: any [] = [];

  userLists: any [] = [];

  constructor(
    private _commonService: CommonService
  ) {
    super();
    this.pagename="app-contacts-activity-log";
   }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getDispositionData()
      await this.getUserLists()
      await this.loadData()
    } catch(error) {
      console.error(error);
    } finally {
      await this.loadDisposition();
    }

    this.filteredOptions = this.myControl.valueChanges
      .debounceTime(1000)
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.historyList = [];
    this.isLoading = false;
    this.postData = {};
    this.pageSize = 10;
    this.currentPage = 1;
    this.filterSearch = [];
    this.isLoadingBox = false;
    this.dispositionLists = [];
    this.selectedDisposition = {};
    this.disposition = "";
    this.dispositionAllData = [];
    this.dispositionFormVisbility = false;
    this.contentVisible = false;
    this.userLists = [];
    return;
  }

  async getUserLists() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "status", searchvalue: "active", criteria:"eq" });

    var method = "POST";
    var url = "users/filter";

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.postData)
      .then((data: any) => {
        if (data) {
          this.userLists = [];
          this.userLists = data;
          return;
        }
      }, (error)=>{
        console.error(error);
    });


  }

  async loadData() {

    this.postData = {};
    this.postData["search"] = [];
    this.postData["search"].push({ searchfield: "customerid", searchvalue: this.dataContent._id, datatype: "ObjectId", criteria:"eq"  });
    this.postData["search"].push({ searchfield: "status", searchvalue: "close", datatype: "text", criteria:"eq"  });
    this.postData["pageNo"] = this.currentPage;
    this.postData["size"] = this.pageSize;

    if(this.filterSearch && this.filterSearch.length > 0) {
      this.filterSearch.forEach(element => {
        this.postData["search"].push(element);
      });
    }

    var method = "POST";
    var url = this.schema + "/filter/activity/view";
    this.isLoading = true;
    this.disableBtn = true;

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.postData)
      .then((data: any) => {
        if (data) {

          if(this.currentPage == 1) {
            this.historyList = [];
          }

          data.forEach(element => {

            if(element.status = "close") {

              let assingeeuser = "";
              let assingeeuserObj = this.userLists.find(p=>p._id == element.assingeeuser);
              if(assingeeuserObj) {
                assingeeuser = assingeeuserObj.fullname
              }

              
              
              let obj = {
                id: element._id._id,
                disposition: element && element._id && element._id.dispositionid && element._id.dispositionid.disposition ? element._id.dispositionid.disposition : element && element.dispositionid && element.dispositionid.disposition ? element.dispositionid.disposition : element.title,
                type: element.type,
                status: element.status,
                property: element.property,
                addedby: element && element._id && element._id.addedby && element._id.addedby.fullname ? element._id.addedby.fullname : "",
                updatedAt: element.updatedAt,
                updatedby: element.updatedby,
                duedate: element.duedate,
                customername: element.customername,
                assingeeuser: assingeeuser,
                dispositionfields: element && element._id && element._id.dispositionid && element._id.dispositionid.fields ? element._id.dispositionid.fields : element && element.dispositionid && element.dispositionid.fields ? element.dispositionid.fields : []
              }
              obj["fields"] = {};
              var fields = element && element._id && element._id.dispositionid && element._id.dispositionid.fields ? element._id.dispositionid.fields : element && element.dispositionid && element.dispositionid.fields ? element.dispositionid.fields : [];
              if( fields.length > 0) {
                fields.forEach(Fieldelement => {
                  obj["fields"][Fieldelement.displayname ? Fieldelement.displayname : Fieldelement.fieldname] = element && element.property && element.property[Fieldelement.fieldname] ? element.property[Fieldelement.fieldname] : ""
                });
              }
              this.historyList.push(obj);
            }

          });
          this.isLoading = false;
          this.disableBtn = false;
          return;
        }
      }, (error)=>{
        console.error(error);
    });
  }

  getClass(item: any) {
    var classList = '';
    if (item.title == 'Meeting') {
      classList = 'success';
    } else if (item.title == 'Followup') {
      classList = 'info';
    } else if (item.title == 'Fresh Call') {
      classList = 'danger';
    }
    return classList;
  }

  clickMore(item: any) {
    this.selectedMessage = item.title;
    this.selectedDispositionDetails = {};
    this.selectedDispositionDetails = item;
    this.selectedSection = null;
    if (item && item.property && Object.keys(item.property).length > 0) {
      this.selectedSection = item.property;
    }
  }

  changePage(pageNumber: number): void {
    this.currentPage = Math.ceil(pageNumber);
    this.loadData();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  optionSelected(option) {
    this.myControl.setValue(option.value);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "title", searchvalue: this.myControl.value, datatype: "String", criteria:"eq" });
      this.loadData();
    }
  }

  enter() {
    const controlValue = this.myControl.value;
    this.myControl.setValue(controlValue);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "title", searchvalue: this.myControl.value, datatype: "String", criteria:"eq" });
      this.loadData();
    }
  }

  handleEmptyInput(event: any){
    if(event.target.value === '') {
      this.myControl.setValue("");
      this.filterSearch = [];
      this.historyList = [];
      this.currentPage = 1;
      this.loadData();
    }
  }

  async getDispositionData() {

    if(this._organizationsetting && this._organizationsetting.databasetype && this._organizationsetting.databasetype == "branchwise") {

      var method = "POST";
      var url = "dispositions/filter";

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
      postData["search"].push({ "searchfield": "formid", "searchvalue": this.formid, "criteria": "eq" });

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
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
    this.dispositionLists = [];
    this.dispositionLists = this.dispositionAllData.filter( ele => ele.formid && ele.formid._id ? (ele.formid._id == this.formid) : (ele.formid == this.formid));
    var filterdata = await this.list_to_tree(this.dispositionLists)
    this.treeControl = new NestedTreeControl<any>(node => node.children);
    this.dataSource.data = filterdata;
    this.contentVisible = true;
    return;
  }

  radioChange(event: MatRadioChange) {
    this.dispositionFormVisbility = false
    var disposition = event.value;

    setTimeout(() => {
      var dispositionObj = this.dispositionLists.find(p=>p._id == disposition);
      if(dispositionObj) {
        this.selectedDisposition = {};
        this.selectedDisposition = dispositionObj;
        this.dispositionFormVisbility = true
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

  titleCase(str) {
    return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
  }

  getSubmittedData(submit_data: any) {

    if(submit_data) {

      var url = "activities"
      var method = "POST";

      let postData = {};
      postData['dispositionid'] = this.selectedDisposition._id;
      postData['type'] = this.selectedDisposition.action;
      postData['customerid'] = this.dataContent._id;
      postData['onModel'] = this.titleCase(this.context);
      postData['property'] = {};
      postData['property'] = submit_data.value;
      postData['status'] = 'close';

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .subscribe( (data: any) => {
          if(data){
            this.showNotification('top', 'right', 'Actvity has been submitted successfully', 'success');
            this.dispositionFormVisbility = false;
            this.ngOnInit();
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

}
