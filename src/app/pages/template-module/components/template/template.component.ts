import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html'
})
export class TemplateComponent extends BaseComponemntComponent implements OnInit {

  templateData: any[] = []
  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    await this.getTemplateData();
  }

  async getTemplateData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "templatetype", "searchvalue": "templategallery", "criteria": "eq" });
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

}
