import { Component, OnInit } from "@angular/core";
import { MatTab } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import { BaseComponemntComponent } from "../../shared/base-componemnt/base-componemnt.component";
@Component({
  selector: "app-myprofile",
  templateUrl: "./myprofile.component.html",
})
export class MyprofileComponent extends BaseComponemntComponent implements OnInit {

  action: string;
  isAvailabilityPermission: boolean;
  isLoadingdata : boolean = true;

  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this._formName = params["formname"];
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    try {
      this.isLoadingdata = true;
      await super.ngOnInit();

      this.isAvailabilityPermission = false;

      if(this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0) {
        var permission =  this._loginUserRole.permissions.find(p=>p.formname == this._formName);
        if(permission && permission.functionpermission && permission.functionpermission.length > 0) {
          var functionPermission = permission.functionpermission.find(per=>per == "Availability")
          if(functionPermission) {
            this.isAvailabilityPermission = true;
          }
        }
      }
      this.isLoadingdata = false
    } catch (error) {
    } finally {
    }
  }

  async onTabChanged(mattab : MatTab){
    this.action = mattab.textLabel.toLowerCase();
  }
}
