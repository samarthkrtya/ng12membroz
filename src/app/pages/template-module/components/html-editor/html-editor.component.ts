import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html'
})
export class HtmlEditorComponent extends BaseComponemntComponent implements OnInit {

  templateForm: FormGroup;
  template: any;
  id: any;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.id = params["templateid"];
    });
    this.templateForm = fb.group({
      'htmlContent': []
    });
  }

  async ngOnInit() {
    await this.getTemplateData();
  }

  async getTemplateData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.id, "criteria": "eq" });
    var url = "templates/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.template = data[0];
          this.templateForm.controls['htmlContent'].setValue(this.template.content);
        }
        return
      })
  }

  onSubmit(value) {
    let model = {
      content: value.htmlContent,
      property: {
        editorindex: 0
      }
    }

    var url = "templates/" + this.bindId;
    var method = "PATCH";
    return this._commonService
      .commonServiceByUrlMethodData(url, method, model)
      .subscribe((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Template has been updated successfully!!', 'success');
          this._router.navigate(["/pages/dynamic-list/list/template"]);
        }
        return
      })
  }
}
