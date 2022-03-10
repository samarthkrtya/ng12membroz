import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CommonService } from '../../../../core/services/common/common.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BaseComponemntInterface } from '../../../base-componemnt/base-componemnt.component';


export interface Entry {
  created: Date;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}


@Component({
  selector: 'app-checkin-otp',
  templateUrl: './checkin-otp.component.html',
  styles: [

    `
      .inp {
        border:none;
        border-bottom: 1px solid;
        padding: 5px 10px;
        outline: none;
    }
    `
  ]
})
export class CheckinOtpComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();


  // memberFormDisplayFormName: any;
  // membershipFormDisplayFormName: any;
  iswalletotpenable: any;
  //walletsymbol: any;

  usergeneratedmembernumber: any;
  mobilenumber: any;
  otpcode: any;
  membername: any;
  membernumber: any;
  balance: any;
  cardnumber: any;
  debitpoint: any;
  txnref: any;

  otpCodeVisibility: boolean;
  generatedOtpCode: any;
  memberDetails: any;
  visibility: boolean;
  otpbtnDisable: boolean;
  otpVerifiedSuccess: boolean;
  //walletnumber: any;
  walletTransactionDetails: any[] = [];
  //walletId: any;
  //wallettype: any;
  //walletTypeLists: any [] = [];
  walletFullDetails: any [] = [];
  walletLists: any [] = [];

  checkIn: boolean = false;
  checkInDateTime: Date
  checkInDate: any;
  checkInTime: any;
  entries: Entry[];
  hours = 0;
  minutes = 0;
  seconds = 0;

  @ViewChild('firstName', { static: false }) firstNameElement: ElementRef;


  @Input() checkindata: any;
  @Output() onAttendanceData = new EventEmitter();

  constructor(
    private _commonService: CommonService,
    private _route: ActivatedRoute,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef
  ) {
    super()
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.initializeVariables();
      await this.reset();
      //await this.getMemberFormID();
      await this.LoadData();
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  ngAfterViewInit() {
    this.firstNameElement.nativeElement.focus();
  }

  async initializeVariables() {

    this.usergeneratedmembernumber = '';
      this.mobilenumber = '';
      this.otpcode = '';
      this.membername = '';
      this.membernumber = '';
      this.balance = '';
      this.debitpoint = '';

      this.otpCodeVisibility = false;
      this.generatedOtpCode = '';
      this.memberDetails = {};
      this.visibility = false;
      this.otpbtnDisable = false;
      this.otpVerifiedSuccess = false;
      //this.walletnumber = '';
      this.walletTransactionDetails = [];
      // this.walletId = '';
      // this.wallettype = '';
      this.txnref = '';
      this.cardnumber = '';
      this.iswalletotpenable = false;
      this.walletLists = [];

    return;
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async LoadData() {

    if(this._loginUserBranch && this._loginUserBranch.walletsetting && this._loginUserBranch.walletsetting.iswalletotpenable) {
      this.iswalletotpenable = this._loginUserBranch.walletsetting.iswalletotpenable
    }

    return;
  }

  async reset() {

    this.walletFullDetails = [];
    this.walletLists = [];

    this.usergeneratedmembernumber = '';
    this.mobilenumber = '';
    this.otpcode = '';
    this.membername = '';
    this.membernumber = '';
    this.balance = '';
    this.debitpoint = '';

    this.otpCodeVisibility = false;
    this.generatedOtpCode = '';
    this.memberDetails = {};
    this.visibility = false;
    this.otpbtnDisable = false;
    this.otpVerifiedSuccess = false;
    //this.walletnumber = '';
    this.walletTransactionDetails = [];
    // this.walletId = '';
    // this.wallettype = '';
    this.txnref = '';
    this.cardnumber = '';
    //this.walletTypeLists = [];

    //this.getAllWalletTypeLists();

    setTimeout(()=>{
      this.firstNameElement.nativeElement.focus();
    }, 100);

    return;

  }

  modelChangedValue(val: any) {
    if(val == '') {
      this.reset();
    }
  }


  modelChanged() {

    let method = "POST";
    let url = '/members/filter/wallet/view';

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "membernumber", "searchvalue": this.usergeneratedmembernumber, "datatype": "text", "criteria": "eq", "cond": "or"});
    postData["search"].push({"searchfield": "property.mobile", "searchvalue": this.usergeneratedmembernumber, "datatype": "text", "criteria": "eq", "cond": "or"});

    console.log("method", method);
    console.log("url", url);
    console.log("postData", postData);

    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {

          console.log("data", data);

          if(data) {
            if(data.length == 0) {
              this.showNotification('top', 'right', 'Member number is invalid!!!', 'danger');
              this.reset();
            } else {
              if(data[0]) {
                console.log(data)

                this.memberDetails = {};
                this.memberDetails = data[0];

                this.memberDetails.profilepic =  data[0].profilepic ? data[0].profilepic : "https://res.cloudinary.com/dlopjt9le/image/upload/v1620196092/c5d9tdgjltc6uutwzdqe.jpg"

                this.mobilenumber = this.memberDetails && this.memberDetails["property"] && this.memberDetails['property']['mobile'] ? this.memberDetails['property']['mobile'] : null;

                this.walletFullDetails = data[0]["wallet"];

                data.forEach(element => {
                  if(element.wallets) {
                    this.walletLists.push(element.wallets)
                  }
                });

                this.membername = data[0].fullname;
                this.membernumber = data[0].membernumber;
                this.balance =  data[0] && data[0].wallet && data[0].wallet.balance ? data[0].wallet.balance : 0;


                if(this.checkindata && this.checkindata.length > 0 ) {
                  var checkindataObj = this.checkindata.find(p=>p.membrozid._id == this.memberDetails._id);
                  if(checkindataObj) {
                    this.showNotification('top', 'right', 'Member already check - IN !!!', 'danger');
                    this.reset();
                    return;
                  } else {
                    await this.makeAttendance()
                  }
                } else {
                  await this.makeAttendance()
                }

                //this.getMemberWalletDetailByMemberId(this.memberDetails._id);
              } else {
                this.showNotification('top', 'right', 'Something went wrong!!!', 'danger');
                this.reset();
              }
            }
            return
          }

        }, (err) =>{
          console.error("err", err);
        });
  }


  async makeAttendance() {


    this.checkIn = true;
    this.checkInDateTime = new Date()
    this.checkInDate = this.datePipe.transform(this.checkInDateTime, 'dd/MM/yyyy')
    this.checkInTime = new Date(this.checkInDateTime).getHours() + " : " + new Date(this.checkInDateTime).getMinutes() + " : " + new Date(this.checkInDateTime).getSeconds();
    this.entries = [
      { created: new Date(new Date().getTime()) }
    ];

    interval(1000).subscribe(() => {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    });

    let attendancecheckinObj = {
      membrozid: this.memberDetails._id,
      checkin: this.checkInDateTime,
      checkout: this.checkInDateTime,
      onModel: "Member"
    }

    var url = "attendances";
    var method = "POST";

    return this._commonService.commonServiceByUrlMethodDataAsync(url, method, attendancecheckinObj)
    .then((data: any) => {

        this.changeDetector.detectChanges();
        if (data) {
          //this.attendanceId = data._id
          this.visibility = true;
          this.showNotification('top', 'right', 'Check in done successfully!!', 'success');
          this.onAttendanceData.emit();
        }
    })
  }

  sendOtpApi() {

    this.otpCodeVisibility = true;
    this.generatedOtpCode = Math.floor(100000 + Math.random() * 900000)

    let tomobile = this.memberDetails.property.mobile;
    //let message = this.generatedOtpCode + " is the OTP for your transaction for an amount of " + this.debitpoint + ". Do not share with anyone.";

    let postData = {
      tomobile: tomobile,
      otp: this.generatedOtpCode,
      otptype:"password",
    };

    let method = "POST";
    var url = "public/sendotp";


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          return;
        }
      }, (err) =>{
        console.error("err", err);
      });

  }

  getElapsedTime(entry: Entry): TimeSpan {

    let totalSeconds = Math.floor((new Date().getTime() - entry.created.getTime()) / 1000);
    if (totalSeconds >= 3600) {
       this.hours = Math.floor(totalSeconds / 3600);
       totalSeconds -= 3600 * this.hours;
    }
    if (totalSeconds >= 60) {
       this.minutes = Math.floor(totalSeconds / 60);
       totalSeconds -= 60 * this.minutes;
    }
    this.seconds = totalSeconds;
    return {
       hours: this.hours,
       minutes: this.minutes,
       seconds: this.seconds
    };
  }

}
