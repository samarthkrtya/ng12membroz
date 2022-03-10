import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-html-template',
  templateUrl: './html-template.component.html',
  styleUrls: ['./html-template.component.css']
})

export class HtmlTemplateComponent extends BaseComponemntComponent implements OnInit {

  bindId: any;
  campaignForm: FormGroup;
  isLoading: boolean = true;
  campaignData: any[] = [];

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute) {
    super();
    this.campaignForm = fb.group({
      'content': [],
    });
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
   }

  async ngOnInit() {
    await this.getCampaignData()
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
          this.campaignData = data[0];
          this.campaignForm.controls['content'].setValue(data[0].content);

        }
        return
      })
  }

  onSubmit(value: any){

    let model = {
      content: value.content
    }
    var url = "campaigns/"+this.bindId
    var method = "PATCH"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, model)
      .subscribe((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Campaign Template Added successfully', 'success');
          this._router.navigate(["/pages/campaign/template-design/"+this.bindId]);
        }
        return
      })
  }

}
