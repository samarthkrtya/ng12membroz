import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-leave-policy',
  templateUrl: './leave-policy.component.html'
})

export class LeavePolicyComponent extends BaseLiteComponemntComponent implements OnInit {


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ["type", "allowance", "accrual", "balance", "action"];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;

  subList: any[] = [];
  chsLeave = {};

  leavetypeList: any[] = [];

  dataContent: any;
  isLoadingData: boolean = false;
  isLoading: boolean = false;

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-leave-request";

  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();

  }
  async LoadData() {
    this.isLoadingData = true;

    let api = "users/filter";
    let method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this._loginUser._id, "criteria": "eq", "datatype": "ObjectId" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {
        this.dataContent = data[0]
      });

    await this.getLeaveType();
    await this.setData();
    this.isLoadingData = false;
  }

  async getLeaveType() {

    let api = "leavetypes/filter";
    let method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {
        this.leavetypeList = data;
        this.leavetypeList.map((a) => {
          a.type = a.property && a.property.accrued_pe_ucvu ? a.property.accrued_pe_ucvu : null;
          a.balance = 0;
          a.allowance = a.property && a.property.accrual_amount ? a.property.accrual_amount : 0;
          a.accrual =  (a.allowance/12).toFixed(2);
        });
      });
  }

  async setData() {

    if (this.dataContent.leavecomponents && this.dataContent.leavecomponents.length > 0) {
      this.dataContent.leavecomponents.forEach((ele) => {
        var type = this.leavetypeList.find(a => a._id == ele.leavecomponentid._id);
        if (type) {
          type.balance = ele.balance;
        }
      });
    }
    this.ELEMENT_DATA = [];
    this.leavetypeList.forEach(leave => {
      if (leave.balance) this.ELEMENT_DATA.push(leave);
    });


    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    return;
  }

  async getHistory(obj: any) {

    this.chsLeave = obj;
    let api = "formdatas/filter";
    let method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": "60b7392f99e17f765884f426", "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({ "searchfield": "contextid", "searchvalue": this._loginUserId, "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({ "searchfield": "property.leavecomponentid", "searchvalue": obj._id, "datatype": "ObjectId", "criteria": "eq" });
    postData["sort"] = { "createdAt": -1 };

    this.isLoading = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {
        this.subList = [];
        this.subList = data;
        this.isLoading = false;
      }).catch((e) => {
        console.error("Error", e);
        this.isLoading = false;
      });
  }
}

