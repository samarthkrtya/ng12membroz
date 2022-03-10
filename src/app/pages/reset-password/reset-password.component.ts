import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../core/services/common/common.service';
import { AuthService } from '../../core/services/common/auth.service';
import { CompanySettingService } from '../../core/services/admin/company-setting.service';

declare var $: any;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})

export class ResetPasswordComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;

  forgotform: FormGroup;
  hidepasswd: boolean = true;
  _formDetail: any;
  resetType: string = 'user';

  submitted = false;
  disableBtn: boolean = false;

  step1: boolean = true;
  step2: boolean = false;
  step3: boolean = false;
  step4: boolean = false;
  verifyotpvalue: any;

  generatedOtpCode: any;
  logoPath: any;
  adminloginimage: any;
  footerimgPath: any;
  isLoadimg = false;
  isLoadbackimg = false;
  isLoading: boolean = false;
  currency: any;
  language: any;

  currentUser: any;

  loginheader: string = 'Powerful Solutions for your business';
  loginsubheader: string = 'A Complete SaaS Solution Tailored to Your Business Need';
  copyright: string = 'Membroz';

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _commonService: CommonService,
    private companySettingService: CompanySettingService,
  ) {

    this._route.params.forEach((params) => {
      if (params["type"]) {
        this.resetType = params["type"];
      }
    });

    this.form = this.fb.group({
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])],
      'confirmpassword': ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])]
    }, {
      validator: this.checkIfMatchingPasswords('password', 'confirmpassword')
    });

    this.forgotform = this.fb.group({
      'username': ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isLoading = false;
    this.getipath();
    this.getFormDetails();
    setTimeout(function () {
      $('.card').removeClass('card-hidden');
    }, 700);
  }


  getipath() {
    this.isLoadimg = true;
    this.isLoadbackimg = true;

    this.companySettingService
      .GetAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        if (data && data.length > 0) {
          if (data[0]['logo']) {
            this.logoPath = data[0]['logo'];
          }
          if (data[0]['adminloginimage']) {
            this.adminloginimage = data[0]['adminloginimage'];
          }
          if (data[0] && data[0]['footerimage']) {
            this.footerimgPath = data[0]['footerimage'];
          }
          if (data[0] && data[0]['language']) {
            this.language = data[0]['language'];
          }
          if (data[0] && data[0]['loginheader']) {
            this.loginheader = data[0]['loginheader'];
          }
          if (data[0] && data[0]['loginsubheader']) {
            this.loginsubheader = data[0]['loginsubheader'];
          }
          if (data[0] && data[0]['copyright']) {
            this.copyright = data[0]['copyright'];
          }
          if (data[0] && data[0].copyright) {
            this.copyright = data[0].copyright;
          }
        }
        this.isLoadimg = false;
        this.isLoadbackimg = false;
      }, e => {
        this.isLoadimg = false;
        this.isLoadbackimg = false;
      });
  }

  getFormDetails() {

    var url = 'forms/filter';

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "formname", "searchvalue": this.resetType, "criteria": "eq", "datatype": "text" });

    this._commonService
      .commonServiceByUrlMethodData(url, "POST", postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        if (data.length > 0 && data[0]._id) {
          this._formDetail = data[0];
        }
      });
  }


  checkExist(value: any) {
    var username = value;
    var url;
    if (this.resetType == 'member') {
      url = 'public/checkmember';
    } else {
      url = 'public/checkuser';
    }

    this._commonService
      .commonServiceByUrlMethodData(url, "POST", username)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data && data._id) {
          this.currentUser = data;
          let tomobile = data.property["mobile"];
          this.sendSms(tomobile);
        } else {
          this.showNotification('top', 'right', "Record don't exist !!", 'danger');
          return;
        }
      });
  }

  sendSms(tomobile: any) {
    this.generatedOtpCode = Math.floor(100000 + Math.random() * 900000);
    //let message = this.generatedOtpCode + " is the OTP for your Login, Do not share with anyone.";
    let postData = {
      tomobile: tomobile,
      otp: this.generatedOtpCode,
      otptype:"password",
    };
    // console.log("postData",postData);
    var url = "public/sendotp";

    this._commonService
      .commonServiceByUrlMethodData(url, "POST", postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.step1 = false;
          this.step2 = false;
          this.step3 = true;
          this.step4 = false;
        }
      });
  }

  sendtoreset(value: any) {
    if (value == this.generatedOtpCode) {
      this.step1 = false;
      this.step2 = false;
      this.step3 = false;
      this.step4 = true;
    } else {
      this.verifyotpvalue = "";
      this.showNotification('top', 'right', 'Please check otp & try again !!!', 'danger');
    }
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

  showPassword() {
    this.hidepasswd = !this.hidepasswd;
    var input = <HTMLInputElement>document.getElementById('newpasswd');
    if (input != undefined) {
      if (input.getAttribute('type') == "password") {
        input.setAttribute('type', 'text');
      } else {
        input.setAttribute('type', 'password');
      }
    }
  }

  resetPassword(value: any) {
    if (value && value.password && value.password.length > 16) {
      this.showNotification('top', 'right', 'Password is too long, Password characters cannot greater than 16.!!!', 'danger');
      return;
    }
    let postData = {
      newpassword: value.password,
      username: this.currentUser.username ? this.currentUser.username : this.currentUser.membernumber
    };
    var url = `auth/${this.resetType}/resetpassword`;
    this.disableBtn = true;
    try {
      this._commonService
        .commonServiceByUrlMethodData(url, "POST", postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this._router.navigate([`/login/${this.resetType}`]);
            this.showNotification('top', 'right', 'Password has been changed successfully !!', 'success');
            this.disableBtn = false;
          }
        });
    } catch (e) {

      this.disableBtn = false;
    }
  }

  styleObject(): Object {
    if (this.adminloginimage && this.adminloginimage !== "") {
      return { 'background-image': `url(${this.adminloginimage})`, 'background-size': 'cover', 'background-position': 'top center' }
    }
    return {}
  }

  showNotification(from: any, align: any, msg: any, type: any) {
    $.notify({
      icon: 'notifications',
      message: msg
    }, {
      type: type,
      timer: 1000,
      placement: {
        from: from,
        align: align
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

