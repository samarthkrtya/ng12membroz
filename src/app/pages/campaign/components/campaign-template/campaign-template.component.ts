import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileSaverService } from 'ngx-filesaver';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-campaign-template',
  templateUrl: './campaign-template.component.html',
  styleUrls: ['./campaign-template.component.css']
})
export class CampaignTemplateComponent extends BaseComponemntComponent implements OnInit {

  campaignname: any;
  templateData: any[] = [];

  constructor(private fb: FormBuilder,
    private _FileSaverService: FileSaverService,
    private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {

    if (this.bindId) {
      await this.getCampaignData();
      await this.getTemplates();
    }

  }

  async getCampaignData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectId" });

    var url = "campaigns/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.campaignname = data[0]?.campaignname
        }
        return
      })
  }

  async getTemplates(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "templatetype", "searchvalue": "templategallery", "criteria": "eq"});
    var url = "templates/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.templateData = data;
        }
        return
      })
  }

  onValChange(value) {
  }


}
