import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html'
})
export class TemplateFormComponent extends BaseComponemntComponent implements OnInit {
  
  form: FormGroup;


  constructor( private fb: FormBuilder,) {
    super();
    
    this.form = this.fb.group({
      'subject': ['', Validators.required],
      'content': ['', Validators.required],
    });
   
   }

  async ngOnInit() {
  }

  public onSubmit(value: any, valid: Boolean) {
    let model = {
      templatetype: "templategallery",
      subject: value.subject,
      content: value.content,
    };
    var url="templates"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, model)
      .subscribe((data: any) => {
        if (data) {
          this.showNotification('top', 'right', 'Template has been added successfully!!', 'success');
          this._router.navigate(["pages/dynamic-list/list/campaign"]);
        }
        return
      })

  }

}
