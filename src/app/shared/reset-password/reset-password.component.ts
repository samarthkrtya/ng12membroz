import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent extends BaseLiteComponemntComponent implements OnInit , AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() formObj: any;
  @Input() mySubmitted: boolean;
  @Input() bindId: any;
  @Input() dataContent: any;


  currentpassword : string;
  hidepasswd: boolean = true;
  validpasswd: boolean = true;
  automaticgn: boolean = false;
  disableBtn: boolean = false;
   
  
  constructor(
    protected _commonService: CommonService,
  ) {
    super();
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.initializeVariables()
    } catch (error) {
    }
  }

  ngAfterViewInit(){
    
  }

  clickPP(){
    
    $("#resetBtn").click();
  }

  showPassword() {
    this.hidepasswd = !this.hidepasswd;
    var input = <HTMLInputElement>document.getElementById('newpasswd');
    if (input.getAttribute('type') == "password") {
      input.setAttribute('type', 'text');
    } else {
      input.setAttribute('type', 'password');
    }
  }


  getPassword(checked: boolean) {
    if (checked == true) {
      this.currentpassword = this.ranString();
      this.validatePasswd();
    } else {
      this.currentpassword = '';
    }
  }

  validatePasswd() {
    if (this.currentpassword) {
      // var regex = /^(?=.*[A-Za-z])(?=.*\d){8,}$/;
      // var valid = regex.test(this.currentpassword);
      var valid = false;
      if (this.currentpassword.length >= 8) valid = true
      this.validpasswd = valid;
    }
  }

  ranString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }


 async sendlinkResetPassword() {
    var editurl =  this.formObj.editurl;
    var method =  this.formObj.method;
    editurl = editurl.url.replace(':_id', '');
    var newobject = { firsttimelogin: true }
      
    this.disableBtn = true;
    await this._commonService
        .commonServiceByUrlMethodDataAsync(editurl, "PATCH", newobject, this.bindId)
        .then((data: any) => {
          if (data) {
            this.disableBtn = false;
            this.showNotification('top', 'right', this.formObj.dispalyformname+ ' will receive link shortly!!', 'success');
            $("#resetpwdclose").click();
            this.automaticgn = false;
          }
        });
  }

  close(){
    this.validpasswd = true;
    this.currentpassword = null;
    this.automaticgn = false;
  }
  
 async updatePassword() {
    if (this.currentpassword && this.currentpassword != '' && this.validpasswd) {
      var url = ''
      if (this.formObj.schemaname == 'members') {
        url = `members/${this.bindId}`;
      } else {
        url = `users/${this.bindId}`;
      }
      var newobject = {
        newpassword: this.currentpassword,
        forcelogin: true
      }
      this.disableBtn = true;
     await this._commonService
        .commonServiceByUrlMethodDataAsync(url, "PATCH", newobject)
        .then((data: any) => {
          if (data) {
            this.disableBtn = false;
            this.showNotification('top', 'right', 'Password updated successfully !!', 'success');
            $("#resetpwdclose").click();
            this.close();
          }
        }, (e) => {
          this.disableBtn = false;
          this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          $("#resetpwdclose").click();
        });
    } else {
      this.disableBtn = false;
      this.showNotification('top', 'right', 'Enter valid password !!', 'danger');
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    return;
  }
 
}
