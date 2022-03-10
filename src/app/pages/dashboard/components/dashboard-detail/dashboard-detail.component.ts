import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

import { DashboardModel } from 'src/app/core/models/dashboard/dashboard.model';
import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styles: [`
  .example-list {
    border: solid 1px #ccc;
    min-height: 60px;
    background: white;
    border-radius: 4px;
    overflow: hidden;
    display: block;
  }
  .cdk-drop-list-dragging .cdk-drag {
    transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
  }

  /* Animate an item that has been dropped. */
  .cdk-drag-animating {
    transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
  }

  .cdk-drag-disabled {
    background: #ccc !important;
    cursor: default;
  }

  ::ng-deep .mat-form-field-underline {
    display: none;
  }
`
  ]
})

export class DashboardDetailComponent extends BaseComponemntComponent implements OnInit {
  
  DashboardModel = new DashboardModel();

  isdisablesavebutton: boolean = false;
  
  webpartList: any [] = [];
  dashboardDetails: any = {};
  webparts: any [] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private router:Router
  ) {

    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];

    })
  }

  async ngOnInit() {
    super.ngOnInit()
    await this.initializeVariables()
    await this.LoadData()
    await this.getwebpartData()
  }

  async initializeVariables() {
    
    this.webpartList = [];
    this.dashboardDetails = {};
    this.webparts = [];
  }

  async LoadData() {

    var url = "dashboard/filter/view/";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.dashboardDetails = {};
          this.webparts = [];
          this.dashboardDetails = data[0];
          this.webparts = this.dashboardDetails['rows'];
          this.webparts.forEach(element => {
            if(element.webparts && element.webparts.length > 0){
              element.webparts.map(p=>p.columns = element.columns);
            }
          });
          return;
        }

      }, (error) => {
        console.error(error);
      });
  }

  async getwebpartData() {

    var url = "webparts/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["sort"] = { "category": 1 };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.webpartList = [];
          this.webpartList = this.groupBy(data, 'webparttype');
          return;
        }
      }, (error) => {
        console.error(error);
      });
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

  getSubmittedAddCol1Data(submitData: any) {
    this.ngOnInit()
  }

  getSubmittedAddCol2Data(submitData: any) {
    this.ngOnInit()
  }

  getSubmittedAddCol4Data(submitData: any) {
    this.ngOnInit()
  }

  delete(index: any, item: any) {
    
    var Temp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this filed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        Temp.remove(index, item);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  async remove(index: any, item: any) {
    try{
      await this.removedata(item._id, this.webparts[index].webparts)
      await this.updateWebpart();
    } catch(error) {
      console.log("error", error);
    }
  }

  async removedata(id: any, array: any) {
    for (const i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
        return;
      }
    }
  }

  async updateWebpart() {

    let postdata = {};
    postdata["rows"] = this.webparts;

    var url = "dashboard/" + this.bindId
    var method = "PATCH";
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postdata)
      .then((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Webpart has been modified successfully!!!', 'success');
          this.ngOnInit();
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async insertWebpart(column: any) {

    let postdata = {};

    let obj = {};
    obj["webparts"] = [];
    obj["roworder"] = this.webparts.length + 1;
    obj["columns"] = column;
    this.webparts.push(obj);

    postdata["rows"] = this.webparts;
    
    var url = "dashboard/" + this.bindId
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postdata)
      .then((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Webpart has been modified successfully!!!', 'success');
          this.ngOnInit();
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async deleteColumn(item: any) {
    
    var Temp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this filed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        Temp.removeColumn(item);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  async removeColumn(item: any) {
    try{
      await this.removedata(item._id, this.webparts)
      await this.updateWebpart();
    } catch(error) {
      console.log("error", error);
    }
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else if(event.previousContainer.id == "single-data" || event.previousContainer.id == "grid-template" || event.previousContainer.id == "grid") {
      if(event.container.data.length == 0) {
        copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        this.updateWebpart();
      } else {
        if(event.container.data.length < event.container.data[0]["columns"]) {
          copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
          this.updateWebpart();
        }
      }
    } else {
      // transferArrayItem(event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex);
    }
  }
  
  noReturnPredicate() {
    return false;
  }

}

