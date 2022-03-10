import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { FormsService } from 'src/app/core/services/forms/forms.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { element } from 'protractor';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-role-function-permission',
  templateUrl: './role-function-permission.component.html',
  styles: [

    `
    text-decoration { text-decoration: line-through !important; }
    `
  ]

})
export class RoleFunctionPermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  functionform: FormGroup;
  btnDisable: boolean = false;
  formList: any[] = [];
  tablist: any[] = []
  tabname: any
  checked: boolean = false;
  dataSource = new MatTableDataSource;
  roleList: any
  permissiondata = [];
  selectedchipvalue: any[] = [];
  finaltab: any[] = [];
  selectedform: any[] = [];
  recordlistnew: any[] = [];
  finalarray: any[] = []
  isLoading: boolean;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  //table data
  displayedColumns: string[] = ['formname', 'exception_function'];
  ELEMENT_DATA: any[] = [];


  //pagination
  pager: any = {};
  pager1: any = {};
  pagedItems: any[];
  pagedItem1: any[];
  selectedPageSize: number;
  totalPages = 0;


  constructor(
    public FormBuilder: FormBuilder,
    private _formService: FormsService,
    private _pagerService: PagerService,
  ) {
    super();
    this.functionform = FormBuilder.group({

    });
  }

  async ngOnInit() {
    super.ngOnInit();
    this.getFormdata();
  }


  getFormdata() {
    this.isLoading = true;
    this.pager = {};
    this.pagedItems = [];
    this.selectedPageSize = 5;
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    this._formService
      .GetByfilter(postData)
      .subscribe(data => {
        if (data) {

          var filterdta = data.filter(el => {
            return el.formtype == undefined;
          })
          this.formList = filterdta;
          
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.formList);
          this.isLoading = false
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.formList.forEach(ele => {
            let sample = ele.functions
            this.tablist.push(sample)
            this.tablist.forEach(ele => {
              if (ele != undefined) {
                ele.forEach(e => {
                  this.finaltab = e.functionname;
                });
              }
            })
          })
          this.roletab();
        }
      })

    //this.setPage(1);
  }

  toggle(ref, value, tab) {
    if (ref._selected == false)  //selected true
    {
      this.selectedchipvalue = this.permissiondata

      var permission = this.permissiondata.find(p => p.formname == value.formname)
      
      this.selectedform = permission?.formname

      if (permission) {
        if (!permission.functionpermission) {
          permission.functionpermission = [];
        }
        permission.functionpermission.push(tab.functionname)
        this.roletab();
      }
      else {
        let obj = {
          formname: value.formname,
          functionpermission: [tab.functionname],
          recordpermission: [],
          tabpermission: [],
          wfpermission: []
        }
        this.permissiondata.push(obj)
        this.roletab()
      }

    }
    else {
      this.selectedchipvalue = this.permissiondata
      var permission = this.permissiondata.find(p => p.formname == value.formname)
      if (permission) {
        this.remove(tab.functionname, permission.functionpermission)
        this.roletab()
      }
    }

  }

  remove(id: any, array: any) {

    for (const i in array) {
      if (array[i] == id) {
        array.splice(i, 1);
      }
    }
  }

  roletab() {
    this.roleList = this.dataContent;
    this.permissiondata = this.roleList?.permissions
    this.formList.forEach(element => {
      this.permissiondata.forEach(ele => {
        if (element.formname == ele.formname) {
          if (ele.functionpermission && element.functions) {
            element.functions.forEach(elementtab => {
              elementtab.selected = false; //bydefault set false
              ele.functionpermission.forEach(roletab => {
                if (elementtab.functionname == roletab) {
                  elementtab.selected = true;
                }
              });
            });
          }
        }
      })
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onFormSubmit(value: any) {
    this.btnDisable = true;

    let obj = {
      functionpermission: this.recordlistnew,
      formname: this.selectedform
    }
    this.finalarray.push(obj)

    let postData = {
      permissions: this.permissiondata
    }
    
    var url = "roles/" + this.bindId;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.btnDisable = false;
          this.showNotification('top', 'right', 'Function permission detail updated successfully!!!', 'success');
        }
      })
  }
}
