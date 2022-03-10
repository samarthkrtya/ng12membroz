import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

declare var $: any;

@Component({
  selector: 'app-reset-pass-setting',
  templateUrl: './reset-pass-setting.component.html'
})

export class ResetPassSettingComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;

  disableButton: boolean;
  submitted: boolean;


  changePasswordObj: any = {
    username: '',
    currentpassword: '',
    password: ''
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonService: CommonService,

  ) {
    super();
    this.form = this.fb.group({
      'username': [this.changePasswordObj.username],
      'currentpassword': [this.changePasswordObj.currentpassword, Validators.required],
      'password': [this.changePasswordObj.password, Validators.compose([Validators.required,  Validators.minLength(8) ,Validators.maxLength(12) ])],
      'confirmpassword': [this.changePasswordObj.confirmpassword, Validators.compose([Validators.required,  Validators.minLength(8) ,Validators.maxLength(12)])],
    }, {
      validator: this.MatchPassword
    });
    

    if (this._authService.auth_email) {
      this.form.controls['username'].setValue(this._authService.auth_email);
    }
  }

  MatchPassword(AC: FormGroup) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('confirmpassword').value; // to get value in input tag
    if (password !== confirmPassword) {
      AC.get('confirmpassword').setErrors({ MatchPassword: true });
    } else {
      return null;
    }
  }

  async ngOnInit() {
    await super.ngOnInit();
  }

  async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    this.disableButton = true;
    var api = "";
    if (this._authService.auth_roletype == "M") {
      api = "members/changepassword";
    } else {
      api = "users/changepassword";
    }

    
    try {
      await this._commonService.
        commonServiceByUrlMethodDataAsync(api, "POST", value)
        .then((res) => {
          this._router.navigate([`/login`]);
          super.showNotification("top", "right", "Reset successfully !!", "success");
          this.disableButton = false;
        });
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

