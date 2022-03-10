import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { UserModel } from 'src/app/core/models/auth/user.model';
import { MenuService } from 'src/app/core/services/menu/menu.service';
import { RollModel } from 'src/app/core/models/role/roll.model';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { ReportViewComponent } from 'src/app/pages/dynamic-reports/components/report-view/report-view.component';
import { ReportViewService } from 'src/app/core/services/reports/reportView.service';
import { ReportsService } from 'src/app/core/services/reports/reports.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-role-report-permission',
  templateUrl: './role-report-permission.component.html',
})
export class RoleReportPermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  isChecked = true;
  reportform: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource;


  userModel = new UserModel();
  RollModel = new RollModel();

  btnDisable: boolean = false;
  reportList: any;
  view: boolean = false;
  roleList: any
  checked: boolean = false;
  selectedtogglevalue = []
  finaldata = []
  reportpermissions = []
  displayedColumns: string[] = ['title','category','view'];
  ELEMENT_DATA: any [] = [];



  constructor(
    public FormBuilder: FormBuilder,
    private _menuService: MenuService,
    private _reportservice: ReportsService
  ) {
    super();
    this.reportform = FormBuilder.group({
      'reportpermissions': [''],

    });
  }



  async ngOnInit() {
    super.ngOnInit();

    setTimeout(() => {
      this.getRoleData()

    }, 500);
    this.getReportData();
  }

  async getReportData() {
    var url = "reports/filter/view";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "schemaname", "searchvalue": "reports", "criteria": "eq" });


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.reportList = [];
          this.reportList = data;

          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.reportList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          return;

        }

      })
  }

  async getRoleData() {
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" });
    this._roleService
      .getbyfilter(postData)
      .subscribe(data => {
        if (data) {
          this.roleList = [];
          this.roleList = data[0];

          if(this.reportList){
          this.reportList.forEach(element => {
            if (this.roleList["reportpermissions"])
              this.roleList["reportpermissions"].forEach(ele => {
                if (element._id == ele) {
                  element.checked = true
                }
              });
          })
        }
        }
      })
  }

  public onChange(event: MatSlideToggleChange, value) {
    if (event.checked == true) {
      this.checked = event.checked.valueOf();
      this.selectedtogglevalue = this.roleList.reportpermissions
      this.selectedtogglevalue.push(value._id);
    } 
    else {
      this.selectedtogglevalue = this.roleList.reportpermissions
      this.remove(value._id, this.selectedtogglevalue)
    }

  }


  remove(id: any, array: any) {


    for (const i in array) {
      if (array[i] == id) {
        array.splice(i, 1);
      }
    }
  }

  onFormSubmit(value: any) {


    this.btnDisable = true;

    let postData = {
      reportpermissions: this.selectedtogglevalue
    }



    var url = "roles/" + this.bindId;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.btnDisable = false;
          this.showNotification('top', 'right', 'Support permission detail updated successfully!!!', 'success');
        }

      })

    // }



  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
