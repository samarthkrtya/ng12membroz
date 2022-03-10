import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CompanySettingService } from '../../core/services/admin/company-setting.service';
import { PublicService } from '../../core/services/common/public.service';

declare var $: any;

@Component({
  selector: 'app-resetuserpassword',
  templateUrl: './resetuserpassword.component.html',
})
export class ResetuserpasswordComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;

  bindId: any;
  type: any;

  isLoading: boolean = false;
  hidepasswd: boolean = true;
  disableBtn: boolean = false;

  logoPath: any;
  loginbgPath: any;
  footerimgPath: any;
  language: any;
  currentUser: any;

  loginheader: string = 'Powerful Solutions for your business';
  loginsubheader: string = 'A Complete SaaS Solution Tailored to Your Business Need';
  copyright: string = 'Membroz';
  passstrength: number = 0;

  adminloginimage: any;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private companySettingService: CompanySettingService,
    private _publicService: PublicService,
  ) {
    this._route.params.forEach(params => {
      this.type = params['type'];
      this.bindId = params['id'];
    });

    this.form = this.fb.group({
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])],
      'confirmpassword': ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16)])]
    }, { validator: this.checkIfMatchingPasswords('password', 'confirmpassword') });
  }

  ngOnInit() {
    this.getipath();
    if (this.type) {
      if (this.type == "member") {
        this.getMemberById(this.bindId);
      } else {
        this.getUserById(this.bindId)
      }
    }
  }

  getMemberById(id: any) {
    this._publicService
      .GetMemberById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        if (data) {
          this.currentUser = data;
          if (this.currentUser.firsttimelogin == false) {
            this.showNotification('top', 'right', 'Member already active for further details contact to support!!!', 'warning');
            this._router.navigate(['/login']);
          }
        } else {
          this.showNotification('top', 'right', 'Member already active for further details contact to support!!!', 'warning');
          this._router.navigate(['/login']);
        }
      });
  }

  getUserById(id: any) {
    this._publicService
      .GetUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.currentUser = data;
          if (this.currentUser.firsttimelogin == false) {
            this.showNotification('top', 'right', 'User already active for further details contact to support!!!', 'warning');
            this._router.navigate(['/login']);
          }
        } else {
          this.showNotification('top', 'right', 'User already active for further details contact to support!!!', 'warning');
          this._router.navigate(['/login']);
        }
      });
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

  getipath() {
    this.companySettingService
      .GetAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          if (data[0]['logo']) {
            this.logoPath = data[0]['logo'];
          }
          if (data[0]['adminloginimage'] != undefined) {
            this.loginbgPath = data[0]['adminloginimage'];
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
          if (data[0] != undefined && data[0].copyright != undefined) {
            this.copyright = data[0].copyright;
          }
        }
      });
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

  onStrengthChanged(event: any) {
    this.passstrength = event;
  }

  resetPassword(value: any, valid: boolean) {
    
    if (!valid) {
      this.showNotification('top', 'right', 'Validation failed!!', 'danger');
      return;
    } else if (value && value.password && value.password.length > 16) {
      this.showNotification('top', 'right', 'Password is too long, Password characters cannot greater than 16 !!', 'danger');
      return;
    }
    // if (this.passstrength < 100) {
    //   this.showNotification('top', 'right', 'Password is weak, Please ensure all password strength points!!!', 'danger');
    //   return;
    // }

    this.isLoading = true;
    this.disableBtn = true;
    if (!this.currentUser) {
      if (this.type && this.type == "member") {
        this._router.navigate(['/login/member']);
      } else {
        this._router.navigate(['/login']);
      }
      this.showNotification('top', 'right', this.type == 'member' ? "Member" : "User" + ' already active for further details contact to support!!!', 'danger');
    } else {
      try {
        let postData = {
          newpassword: value.password,
          username: this.currentUser.username
        };
        if (this.type == "member") {
          postData['username'] = this.currentUser.membernumber;


          this._publicService
            .resetMemberPwd(postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              if (data) {
                this._router.navigate(['/login/member']);
                this.showNotification('top', 'right', 'Password has been changed successfully!!!', 'success');
              }
            });
        } else if (this.type == 'user') {
          this._publicService
            .resetUserPwd(postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
              if (data) {
                this._router.navigate(['/login']);
                this.showNotification('top', 'right', 'Password has been changed successfully!!!', 'success');
              }
            });
        } else {
          this._router.navigate(['/login']);
        }
      } catch (e) {
        this.isLoading = false;
        this.disableBtn = false;
      }
    }
  }

  styleObject(): Object {
    if (this.loginbgPath && this.loginbgPath !== "") {
      return { 'background-image': `url(${this.loginbgPath})`, 'background-size': 'cover', 'background-position': 'top center' }
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

}
