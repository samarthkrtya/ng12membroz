import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html'
})
export class TemplateFormComponent extends BaseComponemntComponent implements OnInit {

  templateForm: FormGroup;
  template: any;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
    this.templateForm = fb.group({
      'name': [],
      'type': [],
    });
  }

  async ngOnInit() {
    if (this.bindId)
      await this.getTemplateData()
  }

  async getTemplateData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" });
    var url = "templates/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.template = data[0];
          this.templateForm.controls['name'].setValue(this.template.subject);
          this.templateForm.controls['type'].setValue(this.template.templatetype);
        }
        return
      })
  }

  onSubmit(value) {
    let model = {
      templatetype: value.type,
      subject: value.name,
    }
    if (this.bindId) {
      var url = "templates/" + this.bindId
      var method = "PATCH"
      return this._commonService
        .commonServiceByUrlMethodData(url, method, model)
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Template has been updated successfully!!', 'success');
            if (data.property.editorindex == 0) {
              this._router.navigate(["/pages/template-module/html-editor/" + data._id]);
            } else if (data.property.editorindex == 1) {
              this._router.navigate(["/pages/template-module/angular-editor/" + data._id]);
            } else {
              this._router.navigate(["/pages/template-module/template/" + data._id]);

            }
          }
          return
        })
    } else {
      var url = "templates"
      var method = "POST"
      return this._commonService
        .commonServiceByUrlMethodData(url, method, model)
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Template has been added successfully!!', 'success');
            this._router.navigate(["/pages/template-module/template/" + data._id]);
          }
          return
        })
    }

  }
}
