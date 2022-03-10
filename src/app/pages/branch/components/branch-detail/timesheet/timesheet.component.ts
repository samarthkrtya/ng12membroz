import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
})
export class TimesheetComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;

  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['Fullname', 'Date', 'Checkin', 'Checkout','Action'];

  constructor(
    public _route: ActivatedRoute,
    public _router: Router
  ) {
    super();
    this.pagename = "app-timesheet";

   }

  async ngOnInit() {
    await super.ngOnInit();
    await this.gettimesheet();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  protected onClickbutton(element: any, rowobj: any) {

    swal.fire({
      title: 'Are you sure?',
    //  text: 'You will not be able to revert this document !!',
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
        this.updatewfstatus(element, id._id)
      }
    })

  }

   async gettimesheet()
   {

    if (this.dataContent.timesheets && this.dataContent.timesheets.length > 0) {
      this.dataContent.timesheets.forEach(ele => {
        var id = ele._id;
        let obj = {
          fullname: id.membrozid.fullname ? id.membrozid.fullname : '---',
          date: ele.checkin ? new Date(ele.checkin).toLocaleDateString(this._commonService.currentLocale()) : '',
          checkin: ele.checkin ? new Date(ele.checkin).toLocaleString(this._commonService.currentLocale()) : '',
          checkout: ele.checkout ? new Date(ele.checkout).toLocaleString(this._commonService.currentLocale())  : '',
          status: ele.status ? ele.status : '---',
          _id: ele._id
        }
        this.ELEMENT_DATA.push(obj);
      });
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
    }

   }

   actionlistRecord(id: any) {
    this._router.navigate(['/pages/dynamic-forms/form/' + '608abdc399e17f2814cb7077' + '/' + id._id]);
  }


  async updatewfstatus(data: any, id: any) {

    let postData = {};
    let url = "common/massupdate";
    let method = "POST";

    postData["schemaname"] = "attendances";
    postData["ids"] = [id];
    postData["fieldname"] = "wfstatus";
    postData["fieldvalue"] = data;
    postData["datatype"] = "text";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Timesheet update has been done successfully!!!', 'success');
          this.updateRecord.emit(data);
        }
      }, (err) => {

      })

  }


   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
