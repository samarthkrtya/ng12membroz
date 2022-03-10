import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmailEditorComponent } from 'angular-email-editor';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-template-design',
  templateUrl: './template-design.component.html',
  styleUrls: ['./template-design.component.css'],
})
export class ExampleComponent extends BaseComponemntComponent implements OnInit {
  options = {};
  bindId: any;
  id: any;
  templateid: any;
  templateData: any;
  sampleTemplate: any
  htmlContent: any;
  campaignname: String;
  contentVisibility: boolean = false;
  subjectline: String;
  @ViewChild('editor')private emailEditor: EmailEditorComponent;
  
  constructor(private _route: ActivatedRoute,) {
    super();
    this._route.params.forEach((params) => {
      this.templateid = params["templateid"];
      this.bindId = params["id"];
    });
   
  }

  async ngOnInit() {
    await this.getTemplateData();
    await this.getCampaignData();
  }


  async getTemplateData(){
    this.contentVisibility = true;
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.templateid, "criteria": "eq"});

    var url = "templates/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.templateData = data[0];
          this.sampleTemplate = data[0].property.json;
        }
        return
      })
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
          this.campaignname = data[0]?.campaignname;
          this.subjectline = data[0]?.property?.subjectline;
          this.sampleTemplate = data[0]?.property?.json ? data[0]?.property.json : this.sampleTemplate;
          this.contentVisibility= false;

        }
        return
      })
  }

  editorLoaded(event) {
    console.log('editorLoaded');
    this.emailEditor.editor.loadDesign(this.sampleTemplate);
  }

  editorReady(event) {
    console.log('editorReady');
  }

  saveDesign() {
    this.emailEditor.editor.saveDesign((data) =>
      console.log('saveDesign', data)
    );
  }

  exportHtml() {
    this.emailEditor.editor.exportHtml((data) =>
      console.log('exportHtml', data)
    );
  }

  onClickNext() {
    this.emailEditor.editor.exportHtml((data) =>
      this.updateCampaign(data)
    );


  }

  async updateCampaign(content) {
    let campaignObj = {
      campaignname: this.campaignname,
      campaigntype: 'Digital',
      content: content.html,
      property: {
        json: content.design,
        subjectline: this.subjectline,
        templateid: this.templateid
      }
    }
    var url = "campaigns/" + this.bindId
    var method = "PATCH"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, campaignObj)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Campaign Template Added successfully', 'success');
          this._router.navigate(["/pages/campaign/template-design/" + this.bindId]);

        }
      })
  }
}
