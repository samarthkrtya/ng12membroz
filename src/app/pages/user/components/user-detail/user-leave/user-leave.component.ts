import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { CommonService } from '../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';

@Component({
  selector: 'app-user-leave',
  templateUrl: './user-leave.component.html',
})
export class UserLeaveComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;

  displayedColumns: string[] = ["type", "from", "to", "comment" , "action"];
  ELEMENT_DATA: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-user-leave";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getLeaveData()
    await this.getleaverequests();
  }

  async getLeaveData(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "userid", "searchvalue": this.dataContent._id, "criteria": "eq", "datatype": "objectid" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({ "searchfield": "wfstatus", "searchvalue": "Pending", "criteria": "eq"});

    
    var url = "leaverequests/filter"
    var method = "POST"
    return this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        this.dataContent.leaverequests = data
        return;
      });
  }

  async getleaverequests() {
    this.ELEMENT_DATA  = [];
    if (this.dataContent && this.dataContent.leaverequests && this.dataContent.leaverequests.length > 0) {
      this.dataContent.leaverequests.forEach(ele => {
        let obj = {
          fromdate: ele.property && ele.property.fromdate ? new Date(ele.property.fromdate).toLocaleString(this._commonService.currentLocale()) : '',
          todate: ele.property && ele.property.todate ? new Date(ele.property.todate).toLocaleString(this._commonService.currentLocale())  : '',
          leavetype: ele.leavetype && ele.leavetype.title ? ele.leavetype.title : '---',
          comment: ele.property && ele.property.comment ? ele.property.comment : '---',
          _id: ele._id
        }
        this.ELEMENT_DATA.push(obj);
      });
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;

  }

  protected onClickbutton(element: any, rowobj: any) {

    swal.fire({
      title: 'Are you sure?',
     // text: 'You will not be able to revert this document !!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        var id = rowobj._id;
        this.updatewfstatus(element, id)
      }
    })
  }

  async updatewfstatus(data: any, id: any) {

    let postData = {};
    let url = "common/massupdate";
    let method = "POST";

    postData["schemaname"] = "leaverequests";
    postData["ids"] = [id];
    postData["fieldname"] = "wfstatus";
    postData["fieldvalue"] = data;
    postData["datatype"] = "text";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Leave request update has been done successfully!!!', 'success');
          this.updateRecord.emit(data);
        }
      }, (err) => {

      })

  }

  actionlistRecord(id: any, obj: any) {
    this._router.navigate(['/pages/dynamic-forms/form/' + '5f572d15d0835e16a8371e16' + '/' + id]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
