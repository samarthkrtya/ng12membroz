import { I } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmailEditorComponent } from 'angular-email-editor';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-template-design',
  templateUrl: './template-design.component.html',
  styleUrls: ['./template-design.component.css'],
})
export class TemplateDesignComponent extends BaseComponemntComponent implements OnInit {

  isDisplay: Boolean = false;
  bindId: any;
  content: any;
  template: any;
  id: any;
  @ViewChild('editor') private emailEditor: EmailEditorComponent;
  templateForm: FormGroup;

  constructor(private _route: ActivatedRoute, private fb: FormBuilder) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.id = params["templateid"];

    });
    this.templateForm = fb.group({
      'name': [],
      'type': [],
    });

  }

  async ngOnInit() {
    await this.getTemplateData();
  }

  async getTemplateData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.id || this.bindId, "criteria": "eq" });
    var url = "templates/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.template = data[0];
          this.isDisplay = true;
        }
        return
      })
  }

  editorLoaded(event) {
    console.log('editorLoaded');
    console.log("this.template.property.json", this.template)
    if (this.template) {
      this.emailEditor.editor.loadDesign(this.template.property.json);
    } else {
      this.emailEditor.editor.loadDesign();
    }
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
    let modal = {
      content: content.html,
      property: {
        json: content.design,
        editorindex: 1
      }
    }
    console.log("modal", modal)

    var url = "templates/" + this.bindId
    var method = "PATCH"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, modal)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Template Updated successfully', 'success');
          this._router.navigate(["/pages/dynamic-list/list/template"]);
        }
      })
  }
}
