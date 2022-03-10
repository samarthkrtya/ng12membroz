import { Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';

import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { CommonService } from '../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../..//shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-user-attendance',
  templateUrl: './user-attendance.component.html',
})
export class UserAttendanceComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource;
  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['date', 'check-in', 'check-out', 'Action'];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public _commonService: CommonService,
       ) {
      super();
      this.pagename = "app-user-attendance";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getAttendancedata();
  }

  async getAttendancedata() {

    if (this.dataContent.attendances && this.dataContent.attendances.length > 0) {
      this.dataContent.attendances.forEach(ele => {

        let obj = {
          date: ele.checkin ? new Date(ele.checkin).toLocaleDateString(this._commonService.currentLocale()) : '',
          checkin: ele.checkin ? new Date(ele.checkin).toLocaleString(this._commonService.currentLocale()) : '',
          checkout: ele.checkout ? new Date(ele.checkout).toLocaleString(this._commonService.currentLocale()) : '',
          breaktime: ele.property?.breaktime ? ele.property?.breaktime : '',
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
    return;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  protected onClickbutton(element: any, rowobj: any) {

    swal.fire({
      title: 'Are you sure?',
      //text: 'You will not be able to revert this document !!',
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


  actionlistRecord(id: any, obj: any) {
    this._router.navigate(['/pages/dynamic-forms/form/' + '5c39cc933ed32610b098fac4' + '/' + id]);
  }


}

