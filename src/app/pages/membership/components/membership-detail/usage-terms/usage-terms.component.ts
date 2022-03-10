import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { OnlyPositiveNumberValidator } from 'src/app/shared/components/basicValidators';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


@Component({
  selector: 'app-usage-terms',
  templateUrl: './usage-terms.component.html'
})
export class UsageTermsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Input() bindId: any;

  @Output() submittedData = new EventEmitter();


  form: FormGroup;
  disableBtn: boolean;
  submitted: boolean;

  duration: string[] = ['Yearly', 'Monthy'];

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-usage-terms";

    this.form = fb.group({
      'eligiblenight': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'eligiblepernight': [, Validators.required],
      'minnight': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'minperbooking': [, Validators.required],
      'maxnight': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'maxperbooking': [, Validators.required],
      'advancenight': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'advancebookingnoticemin': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'advancebookingnoticemax': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber])],
    });
  }

  async ngOnInit() {
    super.ngOnInit();
    this.onLoad();
  }
  onLoad() {
    if (this.dataContent && this.dataContent.usageterms) {
      this.form.controls['eligiblenight'].setValue(this.dataContent.usageterms.eligiblenight);
      this.form.controls['eligiblepernight'].setValue(this.dataContent.usageterms.eligiblepernight);
      this.form.controls['minnight'].setValue(this.dataContent.usageterms.minnight);
      this.form.controls['minperbooking'].setValue(this.dataContent.usageterms.minperbooking);
      this.form.controls['maxnight'].setValue(this.dataContent.usageterms.maxnight);
      this.form.controls['maxperbooking'].setValue(this.dataContent.usageterms.maxperbooking);
      this.form.controls['advancenight'].setValue(this.dataContent.usageterms.advancenight);
      this.form.controls['advancebookingnoticemin'].setValue(this.dataContent.usageterms.advancebookingnoticemin);
      this.form.controls['advancebookingnoticemax'].setValue(this.dataContent.usageterms.advancebookingnoticemax);
    }
  }

  async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Fill required fields !!", "success");
      return;
    }
    let url = 'memberships';
    let method = 'PATCH';
    let model = {};
    model['usageterms'] = value;
    this.disableBtn = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data) => {
        this.disableBtn = false;
        super.showNotification("top", "right", "Usage terms added successfully !!", "success");
        this.submittedData.emit(data);
      }).catch((e) => {
        console.error("e", e);
        this.disableBtn = false;
      });

  }

}
