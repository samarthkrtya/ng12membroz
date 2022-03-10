import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { OrganizationSettingsRoutes } from 'src/app/pages/admins/components/organization-settings/organization-settings.routing';

@Component({
  selector: 'app-function-role-permission',
  templateUrl: './function-role-permission.component.html',
  styles: [`
  table {
    font-family: arial, sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
  
  td, th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }
  
  tr:nth-child(even) {
    background-color: #dddddd;
  }
`
  ]
})
export class FunctionRolePermissionComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  functionform: FormGroup;
  functionArray: any[] = [];
  permissionData :any[] = [];

  constructor(public FormBuilder: FormBuilder) { 
    super();
    this.functionform = FormBuilder.group({
      'functionPermission':[]
    });
  }

  async ngOnInit() {
    this._authService.organizationsetting.functionpermissions.forEach(element => {
      this.functionArray.push({functionname: element})
    });;
    await this.getRolePermission()
  }

   async getRolePermission(){
    let postData = {};
    postData["search"] = [];
    postData["select"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" });
    var url = "roles/filter";
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.permissionData = data[0].functionpermissions;
        if (data) {
          if(data[0].functionpermissions){
          this.functionArray.forEach(element => {
            data[0].functionpermissions.forEach(ele => {
              if(element.functionname == ele){
                element.checked = true;
              }
            });
          })
        }
        }
      })

  }

  onValueChanged(value, item){
    if(value){
      this.permissionData.push(item.functionname)
    }else{
      for( var i = 0; i < this.permissionData.length; i++){ 
        if ( this.permissionData[i] === item.functionname) { 
            this.permissionData.splice(i, 1); 
        }
      }
    }
  }

  onFormSubmit(value: any) {
    let postData = {
      functionpermissions: this.permissionData
    }
    var url = "roles/" + this.bindId;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Global permission detail updated successfully!!!', 'success');
        }
    })

  }

}
