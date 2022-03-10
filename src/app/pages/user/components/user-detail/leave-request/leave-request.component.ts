import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
})
export class LeaveRequestComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  displayedColumns: string[] = ["select", "type", "date", "accrual", "balance", "action"];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;

  subList: any[] = [];

  chsLeave = {};

  balanceObj = {};
  current = 10;
  added = 0;
  new = 10;

  disableBtn: boolean = false;
  isLoading: boolean = false;

  leavetypeList: any[] = [];

  effectiveDate: Date = new Date();
  today: Date = new Date();
  fromDate: Date = new Date();
  toDate: Date = new Date();
  notes: string;

  constructor(
    public _commonService: CommonService,
    private datePipe: DatePipe,
  ) {
    super();
    this.pagename = "app-leave-request";
    this.balanceObj = {
      'addays': 0,
      'subdays': 0,
    }
  }

  async ngOnInit() {
    await super.ngOnInit();

    await this.getLeaveType();
    await this.setData();
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
          a.accrual = a.property && a.property.amount_acc_p9uo ? a.property.amount_acc_p9uo : null;
          a.type = a.property && a.property.accrued_pe_ucvu ? a.property.accrued_pe_ucvu : null;
          var leaveamount = 0;
          a.property.accrual_amount = a.property.accrual_amount ? a.property.accrual_amount : 0;
          if (a.property.accrual_type == "Monthly") leaveamount = a.property.accrual_amount * 12
          else leaveamount = a.property.accrual_amount
          a.allowance = leaveamount;
          a.accrual =  (a.allowance/12).toFixed(2);
          a.balance = 0;
          a.checked = false
        });
      });
  }

  async setData() {
    if (this.dataContent.leavecomponents && this.dataContent.leavecomponents.length > 0) {
      this.dataContent.leavecomponents.forEach((ele) => {
        var fnd = this.leavetypeList.find(a => a._id == ele.leavecomponentid._id);
        if (fnd) {
          // if(new Date().getFullYear() == new Date(ele.effectivedate).getFullYear()){
          //   let balance = ele.leavecomponentid.property.accrual_amount - ele.balance
          //   fnd.balance = ele.effectivedate ? ((new Date().getMonth() - new Date(ele.effectivedate).getMonth()) * 1.5) - balance: null;
          // }else{
            fnd.balance = ele.balance;
          //}
          //fnd.accrual = ele.leavecomponentid.property && ele.leavecomponentid.property.accrual_type && ele.leavecomponentid.property.accrual_amount ? `${ele.leavecomponentid.property.accrual_amount}/${ele.leavecomponentid.property.accrual_type}` : null;

          fnd.effectivedate = ele.effectivedate ? ele.effectivedate: null;
          // if(new Date().getFullYear() == new Date(ele.effectivedate).getFullYear()){
          //   fnd.allowance = ele.effectivedate ? (new Date().getMonth() - new Date(ele.effectivedate).getMonth()) * 1.5: null;
          // }
          fnd.checked = true;
        }
      });
      this.effectiveDate = this.dataContent.property && this.dataContent.property.joiningdate ? this.dataContent.property.joiningdate : new Date();
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.leavetypeList);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
  }

  clickChecked(obj: any, event: any) {
    if (event.checked) {
      this.chsLeave = obj;
      $('#divchecked').click();
    } else {
      this.checked(obj);
    }
  }
  unchecked(obj: any){
    var fnd = this.leavetypeList.find(a => a._id == obj._id);
    if (fnd) {
      fnd.checked = false;
    }
  }

  async checked(obj: any) {
    if(this.effectiveDate == null){
      this.showNotification('top', 'right', `Effective Date is Required !!`, 'danger');
      return;
    }
    var effectivedate: Date = this.effectiveDate['_d'] ? this.effectiveDate['_d'] : this.effectiveDate;
    
    var accrual = obj.property.accrual_amount ? obj.property.accrual_amount : 0;
    var addedLeave = 0;
    if (obj.property.accrual_type && obj.property.accrual_type == 'Monthly') {
      accrual = accrual * 12;
    }
    // var totaldays = new Date(effectivedate.getFullYear(), effectivedate.getMonth() + 1, 0).getDate();
    // var remainingdays = totaldays - effectivedate.getDate();
    // var frctn = remainingdays / totaldays;
    // if (effectivedate.getDate() == 1) {
    //   addedLeave = accrual;
    // } else {
    //   addedLeave = frctn * accrual;
    // }
    //} else {
      var currentdate = new Date()
    var monthdiff = currentdate.getMonth() - effectivedate.getMonth() + 1;
    console.log("monthdiff", monthdiff, accrual)
    addedLeave = accrual * monthdiff / 12;
    //}
    addedLeave = parseFloat(addedLeave.toExponential(2));

    console.log("addedLeave", addedLeave)
    let api = "users";
    let method = "PATCH";
    let model = {};
    model['leavecomponents'] = [];
    if (obj.checked == true) {
      if (this.dataContent.leavecomponents && this.dataContent.leavecomponents.length > 0) {
        model['leavecomponents'] = this.dataContent.leavecomponents;
      }
      model['leavecomponents'].push({ leavecomponentid: obj._id, effectivedate: effectivedate, balance: addedLeave });
    } else {
      var leaves = this.dataContent.leavecomponents;
      var ind = leaves.findIndex(a => a.leavecomponentid == obj._id);
      leaves.splice(ind, 1);
      model['leavecomponents'] = leaves;
    }
    // console.log("model",model);

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model, this.bindId)
      .then(async (data: any) => {
        if(data && data._id){

          let leaveapi = "formdatas/";
          let leavemethod = "POST";

          let leave  = {};
          leave['formid'] = "60b7392f99e17f765884f426";
          leave['contextid'] = this.bindId;
          leave['onModel'] = "User";
          leave['property'] = {};
          leave['property']['leavecomponentid'] = obj._id;
          leave['property']['note'] = `Joining ${addedLeave} leave adjustment added`;
          leave['property']['quantity'] = addedLeave;

          await this._commonService
            .commonServiceByUrlMethodDataAsync(leaveapi, leavemethod, leave)
            .then(async (fdata: any) => {
              $('#myModalClschecked').click();
              this.showNotification('top', 'right', 'data updated successfully !!', 'success');
              this.disableBtn = false;
              setTimeout(() => {
                this.updateRecord.emit(fdata);
              }, 500);
            }).catch((e) => {
              this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
              this.disableBtn = false;
              return;
            });
          }else{
            this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            this.disableBtn = false;
            return;
          }
      }).catch((e) => {
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            this.disableBtn = false;
            return;
      });
  }

  clickedAcn(ele: any) {
    console.log("ELE : ",ele)
    this.fromDate = new Date();
    this.toDate = new Date();
    this.chsLeave = ele;
    this.current = ele.balance ? ele.balance : 0;
    this.added = 0;
    this.new = 0;
  }
  actionlistRecord() {

    this.subList = [];
    this.balanceObj = {
      'addays': 0,
      'subdays': 0,
      'date': new Date(),
    };
    this.notes = null;
  }

  async saveAdjst(obj: any) {
    if(!this.new || this.new < 1){
      this.showNotification('top', 'right', `Adjustment amount is not valid, Please correct adjustment amount' !!`, 'danger');
      return;
    }else if(!this.notes || this.notes == '' ){
      this.showNotification('top', 'right', `Enter Notes !!`, 'danger');
      return;
    }
    let api = "users";
    let method = "PATCH";
    let model = {};
    model['leavecomponents'] = [];

    var leaves = this.dataContent.leavecomponents;
    var lvc = leaves.find(a => a.leavecomponentid._id == obj._id);
    lvc.balance = this.new;
    model['leavecomponents'] = leaves;

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model, this.bindId)
      .then(async (data: any) => {
        if(data && data._id){

            let leaveapi = "formdatas/";
            let leavemethod = "POST";

            let leave  = {};
            leave['formid'] = "60b7392f99e17f765884f426";
            leave['contextid'] = this.bindId;
            leave['onModel'] = "User";
            leave['property'] = {};
            leave['property']['leavecomponentid'] = obj._id;
            leave['property']['note'] = "leave adjustment " + this.new + " " + this.notes;
            leave['property']['quantity'] = this.new;


            this.disableBtn = true;
            await this._commonService
              .commonServiceByUrlMethodDataAsync(leaveapi, leavemethod, leave)
              .then(async (fdata: any) => {
                $('#myModalcls1').click();
                this.showNotification('top', 'right', 'data updated successfully !!', 'success');
                this.disableBtn = false;
                setTimeout(() => {
                  this.updateRecord.emit(fdata);
                }, 500);
              }).catch((e) => {
                this.disableBtn = false;
              });
            }else{
              this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
              return;
            }
      }).catch((e) => {
        this.disableBtn = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
        return;
      });
  }

  async saveLeaveReq(obj: any) {
    if (!this.fromDate) {
      this.showNotification('top', 'right', 'From Date is Required !!', 'danger');
      return;
    }
    if(!this.toDate){
      this.showNotification('top', 'right', 'To Date is Required !!', 'danger');
      return;
    }
    if(!this.notes){
      this.showNotification('top', 'right', 'Note is Required !!', 'danger');
      return;
    }
    if((new Date(this.fromDate).getFullYear() == new Date(this.toDate).getFullYear()) && 
    (new Date(this.fromDate).getMonth() == new Date(this.toDate).getMonth())){
      if(new Date(this.fromDate).getDate() > new Date(this.toDate).getDate()){
        this.showNotification('top', 'right', 'From Date must be before To Date !!', 'danger');
        return;
      }
    }

    let api = "leaverequests";
    let method = "POST";
    let model = {
      "userid": this.bindId,
      "leavetype": obj['_id'],
      "status": 'active',
    };
    model['property'] = {};
    model['property']['fromdate'] = this.fromDate['_d'] ? this.fromDate['_d'] : this.fromDate;
    model['property']['todate'] = this.toDate['_d'] ? this.toDate['_d'] : this.toDate;
    model['property']['comment'] = this.notes;
    model['property']['leavetype'] = obj['_id'];

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model)
      .then((data: any) => {
        $('#myModalCls3').click();
        this.showNotification('top', 'right', 'Leave request successfully !!', 'success');
        this.disableBtn = false;
        setTimeout(() => {
          this.updateRecord.emit(data);
        }, 500);

      }).catch((e) => {
        this.disableBtn = false;
      });
  }

  onChangeDay(type: string) {
    this.new = this.current;
    if (type == "plus") {
      this.added = this.balanceObj['addays'] ? this.balanceObj['addays'] : 0;
      this.new += this.added;
      this.balanceObj['subdays'] = 0;
    } else {
      this.added = this.balanceObj['subdays'] ? this.balanceObj['subdays'] : 0;
      this.new -= this.added;
      this.balanceObj['addays'] = 0;
    }
  }

  async getHistory(obj: any) {
    // this.chsLeave = obj;
    // let api = "formdatas/filter";
    // let method = "POST";

    // let postData = {};
    // postData["search"] = [];
    // postData["search"].push({ "searchfield": "formid", "searchvalue": "60b7392f99e17f765884f426", "datatype": "ObjectId", "criteria": "eq" });
    // postData["search"].push({ "searchfield": "contextid", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });
    // postData["search"].push({ "searchfield": "property.leavecomponentid", "searchvalue": obj._id, "datatype": "ObjectId", "criteria": "eq" });
    // postData["sort"] = { "createdAt": -1 };

    // this.isLoading = true;
    // await this._commonService
    //   .commonServiceByUrlMethodDataAsync(api, method, postData)
    //   .then((data: any) => {
    //     // console.log("data",data);
    //     this.subList = [];
    //     this.subList = data;
    //     console.log("SUb list : ",this.subList)
    //     this.isLoading = false;
    //   }).catch((e) => {
    //     console.error("Error", e);
    //     this.isLoading = false;
    //   });

    this.chsLeave = obj;
    let api = "leaverequests/filter";
    let method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "userid", "searchvalue": this.dataContent._id, "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({ "searchfield": "leavetype", "searchvalue": obj._id, "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
   
    postData["sort"] = { "createdAt": -1 };

    this.isLoading = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {
        // console.log("data",data);
        this.subList = [];
        this.subList = data;
        this.isLoading = false;
      }).catch((e) => {
        console.error("Error", e);
        this.isLoading = false;
      });

  }

}
