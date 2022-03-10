import { Component, OnInit, ViewChild } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styles: [
    `.documents-list .list-group-item.collapsed > .list-group-item-action[data-toggle].collapsed:before {
      content: " ▾";
      margin-left: -15px;
      margin-right: 5px;
  }
  .documents-list .list-group-item.collapsed > .list-group-item-action[data-toggle]:not(.collapsed):before {
      content: " ▴";
      margin-left: -15px;
      margin-right: 5px;
  }
  .documents-list .list-group-item.collapsed > .collapse:not(.show) {
      padding-left:15px;
  }
  .documents-list .list-group-item.collapsed > .collapse.show {
    padding-left:15px;
}
.no-transition {
  -webkit-transition: height 0.001s;
  -moz-transition: height 0.001s;
  -ms-transition: height 0.001s;
  -o-transition: height 0.001s;
  transition: height 0.001s;
}
.mat-badge-medium.mat-badge-overlap.mat-badge-after .mat-badge-content {
  right: 0;
}
  `
  ]
})
export class DocumentsComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  allData: any [] = [];
  mydriveData: any [] = [];
  sharedData: any [] = [];
  trashData: any [] = [];
  folders: any [] = [];
  recent: any [] = [];
  forms: any [] = [];
  formSortLists: any [] = [];
  signedDocument: any [] = [];
  acknoweldgeDocument: any [] = [];

  contentVisibility: boolean = false;

  folderFormVisibility: boolean;
  documentFormVisibility: boolean;

  formsData: any [] = [];
  formVisibility: boolean;

  constructor() {
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.LoadData()
    } catch( error ) {
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
    this.allData = [];
    this.mydriveData = [];
    this.sharedData = [];
    this.trashData = [];
    this.folders = [];
    this.recent = [];
    this.forms = [];
    this.formSortLists = [];
    this.contentVisibility = false;
    this.folderFormVisibility = false;
    this.documentFormVisibility = false;
    this.formsData = [];
    this.signedDocument = [];
    this.acknoweldgeDocument = [];
    this.formVisibility = false;
    return;
  }

  async LoadData() {

    this.contentVisibility = false;

    if(this.allData && this.allData.length !== 0) {
      setTimeout(() => {
        this.contentVisibility = true;
      });

    } else {
      var url = "documents/filter/view";
      var method = "POST";

      let postData = {};
      postData['search'] = [];
      postData["search"].push({"searchfield": "userid", "searchvalue": this._loginUserId, "datatype": "ObjectId",  "criteria": "eq"});

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( (data: any) => {
          if(data) {

            console.log("data", data);
            
            if(data[0]) {

              this.allData = data[0];
              this.mydriveData = data[0]["mydrive"];
              this.sharedData = data[0]["shared"];
              this.trashData = data[0]["trash"];
              this.folders = data[0]["folder"];
              this.recent = data[0]["recent"];
              this.forms = data[0]["forms"];
              this.signedDocument = data[0]["signed"];
              this.acknoweldgeDocument = data[0]["acknowledged"];

              this.formSortLists = this.groupBy(this.forms, "category");

            }

            this.contentVisibility = true;
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }


  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
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

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  getSubmittedData(data: any) {
    // console.log("data",data);
    this.ngOnInit()
  }

  createDocument() {
    this.documentFormVisibility = true
  }

  getSubmittedDataDocument(postData: any) {
    this.documentFormVisibility = false;
    $("#DocumentCloseBtn").click();
    this.ngOnInit();
  }

  createFolder() {
    this.folderFormVisibility = true;
  }

  getSubmittedDataFolder(postData: any) {
    this.folderFormVisibility = false;
    $("#closeBtn").click();
    this.ngOnInit()
  }

  formClick(datas: any) {
    this.formVisibility = false;
    setTimeout(() => {
      this.formsData = [];
      this.formsData = datas;
      this.formVisibility = true;

    });

  }


}
