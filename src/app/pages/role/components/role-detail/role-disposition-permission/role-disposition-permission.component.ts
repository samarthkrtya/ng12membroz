import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-role-disposition-permission',
  templateUrl: './role-disposition-permission.component.html',
})
export class RoleDispositionPermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();
  isChecked = true;
  dispositionform: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource;

  //table data
  displayedColumns: string[] = ['formname', 'disposition'];
  ELEMENT_DATA: any[] = [];

  //fields
  formList: any[] = [];
  disdata = [];
  dispositionList: any[] = [];
  selecteddis: any[] = []
  matcheddid = [];
  newvalue = [];
  roleList: any
  permissiondata = []
  selectedchipvalue: any[] = []
  btnDisable: boolean = false;
  finalarray: any[] = [];
  selectedform: any
  selectedtogglevalue = []



  constructor(
    public FormBuilder: FormBuilder
  ) {
    super();
    this.dispositionform = FormBuilder.group({

    });
  }

  async ngOnInit() {
    
    super.ngOnInit();
    await this.getformdata();
    await this.dispositiondata();
    await this.getRoleData();
  }

  async getformdata() {
    
    let postData = {};
    postData['search'] = [];
    // postData["search"].push({"searchfield": "status", "searchvalue": 'active', "criteria": "eq"});
    postData["search"].push({"searchfield": "schemaname", "searchvalue": ["members", "prospects", "enquiries", "users"], "criteria": "in"});

    // postData["search"].push({ "searchfield": "schemaname", "searchvalue": 'members', "criteria": "eq", "cond": "or" });
    // postData["search"].push({ "searchfield": "schemaname", "searchvalue": 'prospects', "criteria": "eq", "cond": "or" });
    // postData["search"].push({ "searchfield": "schemaname", "searchvalue": 'enquiries', "criteria": "eq", "cond": "or" });
    // postData["search"].push({ "searchfield": "schemaname", "searchvalue": 'users', "criteria": "eq","cond":"or" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync('forms/filter', 'POST' , postData)
      .then((data: any) => {
        // console.log("data=>",data); 
        if (data) {
          this.formList = [];
          this.formList = data;
                 
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.formList);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          return;
        }

      })
  } 

  async dispositiondata() {
    var url = "dispositions/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": 'active', "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.dispositionList = [];
          this.dispositionList = data;
          // console.log(this.formList);

          this.formList.forEach(form => {
            this.dispositionList.forEach(ele => {
              if (ele.formid._id == form._id) {
                this.matcheddid.push(ele)
                //console.log("alldisposition",this.matcheddid);
              }
            })
          })
        }
       this.roledisposition()
      })
  }

  async getRoleData() { 
     
          this.roleList = this.dataContent;
          this.dispositionList.forEach(element => {            
            if (this.roleList["dispositionpermissions"])            
              this.roleList["dispositionpermissions"].forEach(ele => {
              
                if (element._id == ele._id) {
                  element.selected = true
                }
              });
            })
  }

  toggle(value, ref, disposition) {
    
    if (value.selected == false) {
      this.selectedtogglevalue = this.roleList.dispositionpermissions   
      this.selectedtogglevalue.push(disposition._id);
      console.log(this.selectedtogglevalue);
      this.roledisposition();
    } 
    else {
      console.log("hi1");      
      this.selectedtogglevalue = this.roleList.dispositionpermissions
      this.remove(disposition._id, this.selectedtogglevalue)
      console.log(this.selectedtogglevalue);
      this.roledisposition();

    }
  }

  roledisposition() {   //console.log(this.matcheddid);    
    this.roleList = this.dataContent //role table(accoutant)
    this.permissiondata = this.roleList.dispositionpermissions
    this.matcheddid.forEach(element => {
      if(this.permissiondata){
      this.permissiondata.forEach(ele => {
        if (element._id == ele) {          
          if (ele) {
            element.selected = false;           
              if (element._id == ele) {
                element.selected = true;
              }
             }
        }
      })
    }
    })
  }

  remove(id: any, array: any) {
    for (const i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
      }
    }
  }

  onFormSubmit(value: any) {
    this.btnDisable = true;
   this.selectedchipvalue=[];
    this.selectedtogglevalue.forEach(ele=>{
      this.selectedchipvalue.push(ele._id ? ele._id:ele)      
    }) 

     let postData = {
      dispositionpermissions: this.selectedchipvalue,
    }

    console.log(postData);

    var url = "roles/" + this.bindId;
    var method = "PATCH";

     return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.btnDisable = false;
          this.showNotification('top', 'right', 'Disposition permission detail updated successfully!!!', 'success');
         
        }
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
