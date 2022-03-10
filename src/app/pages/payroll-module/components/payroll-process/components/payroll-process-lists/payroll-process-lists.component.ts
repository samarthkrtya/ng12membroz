import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { PayrollModel } from 'src/app/core/models/payroll/payroll.model';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { salarycomponentService } from 'src/app/core/services/salarycomponents/salarycomponents.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import swal from 'sweetalert2';
import { AnyARecord } from 'dns';
declare var $: any;
// export interface PeriodicElement {
//   month: String;
//   year: number;
//   employeesalary: number;
//   total: number;
// }
@Component({
  selector: 'app-payroll-process-lists',
  templateUrl: './payroll-process-lists.component.html'
})

export class PayrollProcessListsComponent extends BaseComponemntComponent implements OnInit {
  isLoadingResults: boolean = true;

  pagedItems: any[];

  payrollLists: any;
  pager: any = {};
  selectedPageSize: number;
  displayedColumns: string[] = ['month', 'year', 'employeesalary', 'workingdays', 'weeklyoffdays', 'holidays', 'paymentdate', 'payrollnetpay', 'action'];
  dataSource = new MatTableDataSource();
  system_salarycomponentLists: any;
  userLists: any[] = [];
  //employeesalary: any[] = []

  //@ViewChild(MatSort) sort: MatSort; 

  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort
  constructor(
    public _payrollService: PayrollService,
    private _usersService: UsersService,
    private _salarycomponentService: salarycomponentService
  ) {
    super();
    this.pagename = "payroll-lists";
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async ngOnInit() {
    await this.getPayrollLists();
  }

  async getPayrollLists() {
    //this.pagedItems = [];
    this.isLoadingResults = true;

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": ["active", "paid"], "criteria": "in" });
    postData["sort"] = { "createdAt": -1 };

    return this._payrollService
      .GetByfilterLookupNameAsync(postData)
      .then(data => {
        if (data) {
          this.payrollLists = [];
          this.payrollLists = data;

          let checkNextPayRollProcess: boolean = false;
          checkNextPayRollProcess = this.payrollLists.some(x => x.status === "active")

          if (checkNextPayRollProcess == false) {
            this.getNextPayrollProcess();
          }

          this.dataSource = new MatTableDataSource()
          this.dataSource = new MatTableDataSource(this.payrollLists);
          this.dataSource.sort = this.sort;

          if (this.payrollLists && this.payrollLists.length !== 0) {
            this.setPage(1);
          }

          this.isLoadingResults = false;
          return;
        }
      })
  }


  getNextPayrollProcess() {
    var now = new Date();
    var current = new Date();
    var lastMonth;
    var lastYear;

    if (this.payrollLists && this.payrollLists[0] && this.payrollLists[0]['month'] && this.payrollLists[0]['year']) {
      lastMonth = this.payrollLists[0]['month'];
      lastYear = this.payrollLists[0]['year'];
    } else {
      lastMonth = now.getMonth();
      lastYear = now.getFullYear();
    }
    now.setDate(1);
    now.setMonth(lastMonth - 1);
    now.setFullYear(lastYear);

    if (now.getMonth() == 11) {
      current = new Date(now.getFullYear() + 1, 0, 1);
    } else {
      current = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    var newMonth = current.getMonth();
    var newYear = current.getFullYear();

    let obj = {
      month: newMonth + 1,
      year: newYear,
      status: "active"
    }

    this.payrollLists.splice(0, 0, obj);
    //this.setPage(1);
  }

  setPage(page: number) {

    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    //this.payrollLists = this.employeesalary.slice(0, this.payrollLists);
    //console.log(this.payrollLists)
    //this.pagedItems = this.payrollLists.slice(this.pager.startIndex, this.pager.endIndex + 1);
    //this.dataSource = new MatTableDataSource(this.pagedItems);
  }

  async deletePayRoll(item: any) {

    var varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this file!',
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
        varTemp._payrollService
          .Delete(item._id)
          .subscribe(data => {
            if (data) {
              varTemp.getPayrollLists();
              swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                customClass: {
                  confirmButton: "btn btn-success",
                },
                buttonsStyling: false
              });
            } 
          })
      }
      else 
      {
        swal.fire({
          title: 'Cancelled',
          text: 'Your file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  getMonth(month: any) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month - 1];
  }

  createPayRoll(item: any) {
    let payroll = new PayrollModel();

    payroll.month = item.month;
    payroll.year = item.year;
    payroll.paymentdate = new Date();
    payroll.workingdays = 0;
    payroll.weeklyoffdays = 0;
    payroll.holidays = 0;
    payroll.payrollcost = 0;
    payroll.payrollnetpay = 0;
    payroll.taxes = 0;
    payroll.pretaxdeductions = 0;
    payroll.posttaxdeductions = 0;
    payroll.employeesalary = []

    this._payrollService
      .Add(payroll)
      .subscribe(data => {
        if (data) {
          this._router.navigate(['/pages/payroll-module/payroll-process/begin/' + data['_id']]);
        }
      })
  }
}
