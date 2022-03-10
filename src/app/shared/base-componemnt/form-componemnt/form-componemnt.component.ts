import { Component, OnInit } from '@angular/core';

import { BaseComponemntComponent } from '../base-componemnt.component';

@Component({
  selector: 'app-form-componemnt',
  templateUrl: './form-componemnt.component.html'
})
export class FormComponemntComponent extends BaseComponemntComponent implements OnInit {

  formlistObj: any;
  formSchemaName: any;

  constructor() {
    super()
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getAllFormlists();
  }

  async getAllFormlists() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": this._formName, "criteria": "eq"});
    return this._commonService
      .AsyncFormListByfilter(postData)
      .then((data: any)=>{
        if(data) {
          if(data[0]) {
            this.formlistObj = data[0];
            this.formSchemaName = this.formlistObj.schemaname;
          }
          return;
        }
      })
  }



}
