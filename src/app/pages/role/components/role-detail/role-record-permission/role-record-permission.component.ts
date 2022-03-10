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
  selector: 'app-role-record-permission',
  templateUrl: './role-record-permission.component.html',
})
export class RoleRecordPermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  recordform: FormGroup;
  btnDisable: boolean = false;
  formList: any[] = [];
  tablist: any[] = []
  tabname: any
  checked: boolean = false;
  selectedtogglevalue = []
  selectedchipvalue: any[] = []
  roleList: any
  permissiondata = []
  finaltab: any[] = []
  finalarray: any[] = []
  recordList: any[] = []
  value: any[] = []
  recordlistnew: any[] = []
  formname: any;
  type: any[] = []
  view: boolean = false;
  edit: boolean = false;
  delete: boolean = false;
  add: boolean = false;
  selectedform: any[] = []
  selectedform1: any[] = []
  recordarray: any[] = []
  typevalue: any;
  viewvalue: any;
  deletevalue: any;
  editvalue: any;
  addvalue: any;
  //branch selection
  viewmy: boolean = false;
  viewmybranch: boolean = false;
  viewall: boolean = false;
  new:any[]=[]
  dataSource = new MatTableDataSource;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }


  //table data
  displayedColumns: string[] = ['formname','view','edit','delete','add','tabname'];
  ELEMENT_DATA: any [] = [];


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
    this.recordform = FormBuilder.group({
      'view': [''],
      'edit': [''],
      'delete': [''],
      'add': ['']

    });
  }

  async ngOnInit() {
    super.ngOnInit();
    this.getFormdata();
    // setTimeout(() => {
    //   this.getRoleData();
    // }, 200);

  }

  getFormdata() {
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

          var filterdta = data.filter(el =>{
            return el.formtype == undefined;
          })
          this.formList = filterdta;
         // console.log("this.formList", this.formList)
           this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.formList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.formList.forEach(ele => {
            let sample = ele.tabs
            this.tablist.push(sample)
            this.tablist.forEach(ele => {
              if (ele != undefined) {
                ele.forEach(e => {
                  this.finaltab = e.tabname;
                });
              }
            })
          })
          this.getRoleData();
        }
      })

    //this.setPage(1);
  }

  changeSelected($event, category): void {
    category.selected = $event.selected;
  }

  toggle(ref, value, tab) {
    //console.log(value); // form record
    //console.log(ref);   //event record
    if (ref._selected == false)  //selected true
    {

      this.selectedchipvalue = this.permissiondata
      //console.log(this.permissiondata);

      var permission = this.permissiondata.find(p => p.formname == value.formname)
      if (permission) {

        if (!permission.tabpermission) {
          permission.tabpermission = [];
        }
        permission.tabpermission.push(tab.tabname)
        this.roletab();
      }
      else {
        let obj = {
          formname: value.formname,
          tabpermission: [tab.tabname],
          recordpermission: [],
          fieldpermission: [],
          dispositionpermission: []

        }
        this.permissiondata.push(obj)
        this.roletab()
      }
    }
    else {
      this.selectedchipvalue = this.permissiondata
      var permission = this.permissiondata.find(p => p.formname == value.formname)
      if (permission) {
        this.remove(tab.tabname, permission.tabpermission)

        //console.log(permission.tabpermission);
        this.roletab()
      }
    }
  }

  public onChange(event: MatSlideToggleChange, value) {
    if (event.checked == true) {
      this.checked = event.checked;
      this.selectedtogglevalue = this.permissiondata
      var permission = this.permissiondata.find(p => p.formname == value.formname)
    
      if (permission) {  
        if (!permission.recordpermission) {
          permission.recordpermission = [];
        }
        this.selectedform = permission.formname;
        this.recordList = []

        if (value.edit == true) {
          this.recordList.push('edit')
        } if (value.view == true) {
          this.recordList.push('view')
        } if (value.delete == true) {
          this.recordList.push('delete')
        } if (value.add == true) {
          this.recordList.push('add')
        }

        permission.recordpermission = [];
        for (let i = 0; i < this.recordList.length; i++) {
          let objnew = {
            type: this.recordList[i],
            datapermission: 'My Branch'
          }
          permission.recordpermission.push(objnew);
       }
         

      } else { 
        this.recordList = []
        this.recordarray = []
        this.selectedform = value.formname;
        if (value.edit == true) {
          //console.log('edit');
          this.recordList.push('edit')

        } else if (value.view == true) {
          //console.log('view');
          this.recordList.push('view')

        } else if (value.delete == true) {
          //console.log('delete');
          this.recordList.push('delete')

        } else if (value.add == true) {
          //console.log('add');
          this.recordList.push('add')
        }

        for (let i = 0; i < this.recordList.length; i++) {

          let objnew1 = {
            type: this.recordList[i],
            datapermission: 'My Branch'
          }
          this.recordarray.push(objnew1)
         
          let obj = {
            recordpermission: this.recordarray,
            formname: this.selectedform,
          }
          this.permissiondata.push(obj) 
        }
      }
    }
    else {
      this.selectedtogglevalue = this.permissiondata
      var permission = this.permissiondata.find(p => p.formname == value.formname);
      if (permission) {
        for (var i = 0; i < permission.recordpermission.length; i++) {

          if (value.edit == false) {
         
            if (permission.recordpermission[i].type == 'edit') {
              this.remove(permission.recordpermission[i], permission.recordpermission)
            }

          } if (value.view == false) {
         
            if (permission.recordpermission[i].type == 'view') {
              this.remove(permission.recordpermission[i], permission.recordpermission)
            }

          } if (value.delete == false) {
             
            if (permission.recordpermission[i].type == 'delete') {
              this.remove(permission.recordpermission[i], permission.recordpermission)
            }

          } if (value.add == false) {
            
            if (permission.recordpermission[i].type == 'add') {
              this.remove(permission.recordpermission[i], permission.recordpermission)
            }
          }
        } 
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

  async getRoleData() {
    this.roleList = this.dataContent;
    this.permissiondata = this.roleList.permissions
    this.formList.forEach(element => {
      this.permissiondata.forEach(ele => {
        if (element.formname == ele.formname) {
          if (ele.recordpermission) {
            //console.log(this.formList);


            ele.recordpermission.forEach(record => {
              if (record.type == 'view') {
                element.view = true

                if (record.datapermission == 'My') {
                  element.viewbtn = 'My'
                }
                if (record.datapermission == 'My Branch') {
                  element.viewbtn = 'My Branch'
                }
                if (record.datapermission == 'All') {
                  element.viewbtn = 'All'
                }
              }
              else if (record.type == 'add') {
                element.add = true

                if (record.datapermission == 'My') {
                  element.addbtn = 'My'
                }
                if (record.datapermission == 'My Branch') {
                  element.addbtn = 'My Branch'
                }
                if (record.datapermission == 'All') {
                  element.addbtn = 'All'
                }
              }
              else if (record.type == 'delete') {
                element.delete = true

                if (record.datapermission == 'My') {
                  element.deletebtn = 'My'
                }
                if (record.datapermission == 'My Branch') {
                  element.deletebtn = 'My Branch'
                }
                if (record.datapermission == 'All') {
                  element.deletebtn = 'All'
                }
              }
              else if (record.type == 'edit') {
                element.edit = true

                if (record.datapermission == 'My') {
                  element.editbtn = 'My'
                }
                if (record.datapermission == 'My Branch') {
                  element.editbtn = 'My Branch'
                }
                if (record.datapermission == 'All') {
                  element.editbtn = 'All'
                }
              }
            });
          }
          this.roletab()
        }
      })
    })

  }
  //for chip value
  roletab() {
    this.roleList = this.dataContent;
    this.permissiondata = this.roleList.permissions
    this.formList.forEach(element => {
      this.permissiondata.forEach(ele => {
        if (element.formname == ele.formname) {
          if (ele.tabpermission) {
            element.tabs.forEach(elementtab => {
              elementtab.selected = false; //bydefault set false
              ele.tabpermission.forEach(roletab => {
                if (elementtab.tabname == roletab) {
                  elementtab.selected = true;
                }

              });


            });
          }
        }

      })
    })
  }

  onFormSubmit(value: any) {
    this.btnDisable = true;

    let obj = {
      recordpermission: this.recordlistnew,
      formname: this.selectedform

    }
    this.finalarray.push(obj)

    let postData = {
      permissions: this.permissiondata
    }
    // console.log("postData",postData);
    var url = "roles/" + this.bindId;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.btnDisable = false;
          this.showNotification('top', 'right', 'Support permission detail updated successfully!!!', 'success');
          this.ngOnInit()
        }


      });



  }

  /* setPage(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this._pagerService.getPager(this.formList.length, page, this.selectedPageSize);
    this.pagedItems = this.formList.slice(this.pager.startIndex, this.pager.endIndex + 1);
    //console.log(this.pagedItems);
  } */

  onValChangeview(value, data) {
    console.log(data)
    this.viewvalue = data;
    var permission = this.permissiondata.find(p => p.formname == data.formname)
    this.selectedform = permission.formname
    //console.log(permission.recordpermission);

    permission.recordpermission.forEach(element => {

      if (value == 'My') {
        if (element.type == 'view') {
          element.datapermission = value
        }
      }

      if (value == 'My Branch') {
        if (element.type == 'view') {
          element.datapermission = value
        }
      }
      if (value == 'All') {
        if (element.type == 'view') {
          element.datapermission = value
        }
      }
    })
    //console.log(permission.recordpermission);


  }

  onValChangeedit(value, data) {
    this.editvalue = data;
    var permission = this.permissiondata.find(p => p.formname == data.formname)
    this.selectedform = permission.formname
    //console.log(permission.recordpermission);

    permission.recordpermission.forEach(element => {

      if (value == 'My') {
        if (element.type == 'edit') {
          element.datapermission = value
        }
      }

      if (value == 'My Branch') {
        if (element.type == 'edit') {
          element.datapermission = value
        }
      }
      if (value == 'All') {
        if (element.type == 'edit') {
          element.datapermission = value
        }
      }
    })
    //console.log(permission.recordpermission);

  }

  onValChangedelete(value, data) {
    this.deletevalue = data;
    var permission = this.permissiondata.find(p => p.formname == data.formname)
    this.selectedform = permission.formname
    //console.log(permission.recordpermission);

    permission.recordpermission.forEach(element => {
      if (value == 'My') {
        if (element.type == 'delete') {
          element.datapermission = value
        }
      }

      if (value == 'My Branch') {
        if (element.type == 'delete') {
          element.datapermission = value
        }
      }
      if (value == 'All') {
        if (element.type == 'delete') {
          element.datapermission = value
        }
      }
    })
    //console.log(permission.recordpermission);

  }

  onValChangeadd(value, data) {
    this.addvalue = data;
    var permission = this.permissiondata.find(p => p.formname == data.formname)
    this.selectedform = permission.formname
    //console.log(permission.recordpermission);

    permission.recordpermission.forEach(element => {
      if (value == '') {
        element.datapermission = 'My Branch'
      }
      if (value == 'My') {
        if (element.type == 'add') {
          element.datapermission = value
        }
      }

      if (value == 'My Branch') {
        if (element.type == 'add') {
          element.datapermission = value
        }
      }
      if (value == 'All') {
        if (element.type == 'add') {
          element.datapermission = value
        }
      }
    })
    //console.log(permission.recordpermission);

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


}
