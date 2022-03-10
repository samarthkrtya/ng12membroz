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
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styles: [
    `.payment-container {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
  }

  .inp {
        border:none;
        border-bottom: 1px solid;
        padding: 5px 10px;
        outline: none;
    }

  `]
})

export class CheckinComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  otpCodeVisibility: boolean;
  visibility: boolean;

  cardnumber: any;
  membername: any;
  visitorname: any;
  membernumber: any;
  balance: any;
  otpcode: any;
  debitpoint: any;
  txnref: any;
  memberDetails: any;
  generatedOtpCode: any;

  memberFormDisplayFormName: any;
  membershipFormDisplayFormName: any;
  sendOtpVisibility: boolean;

  walletFullDetails: any [] = [];

  iswalletotpenable: boolean = false;

  checkIn: boolean = false;
  checkInDateTime: Date
  checkInDate: any;
  checkInTime: any;
  entries: Entry[];
  hours = 0;
  minutes = 0;
  seconds = 0;

  @ViewChild('firstName', { static: true }) firstNameElement: ElementRef;
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
      await this.LoadData()

    } catch {
    } finally {
    }
  }

  ngAfterViewInit() {
    this.firstNameElement.nativeElement.focus();
  }

  async initializeVariables() {

    this.visibility = false;
    this.otpCodeVisibility = false;

    this.cardnumber = '';
    this.membername = '';
    this.membernumber = '';
    this.balance = '';
    this.debitpoint = '';
    this.otpcode = '';
    this.memberDetails = {};
    this.txnref = '';
    this.iswalletotpenable = false;

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
    this.visibility = false;
    this.otpCodeVisibility = false;

    this.cardnumber = '';
    this.membername = '';
    this.membernumber = '';
    this.balance = '';
    this.debitpoint = '';
    this.otpcode = '';
    this.memberDetails = {};
    this.txnref = '';

    setTimeout(()=>{
      this.firstNameElement.nativeElement.focus();
    }, 100);

    return;

  }

  sendOtpApi() {

    this.otpCodeVisibility = true;
    this.generatedOtpCode = Math.floor(100000 + Math.random() * 900000)
    let tomobile = this.memberDetails.property.mobile;

    //let message = this.generatedOtpCode + " is the OTP for your transaction for an amount of " + this.debitpoint + ". Do not share with anyone.";

    let method = "POST";
    var url = "public/sendotp";

    let postData = {
      tomobile: tomobile,
      otp: this.generatedOtpCode,
      otptype:"password",
    };

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

  modelChangedValue(val: any) {
    if(val == '') {
      this.reset();
    }
  }

  modelChanged() {
    if(this.cardnumber !== '') {

      this.visibility = false;

      let method = "POST";
      let url = '/members/filter/wallet/view';

      let postData = {};
      postData["search"] = [];
      postData["search"].push({"searchfield": "wallets.cardnumber", "searchvalue": this.cardnumber, "criteria": "eq"});

      console.log("postData", postData);

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {

            console.log("data", data);

            if(data) {
              if(data.length == 0) {
                this.showNotification('top', 'right', 'Card number is invalid!!!', 'danger');
                this.reset();
              } else {
                if(data[0]) {

                  this.memberDetails = {};
                  this.memberDetails = data[0];

                  console.log("memberDetails", this.memberDetails)

                  this.memberDetails.profilepic =  data[0].profilepic ? data[0].profilepic : "https://res.cloudinary.com/dlopjt9le/image/upload/v1620196092/c5d9tdgjltc6uutwzdqe.jpg"

                  this.walletFullDetails = data[0]["wallet"];

                  this.membername = data[0].fullname;
                  this.membernumber = data[0].membernumber;
                  this.visitorname = data[0]?.wallets?.holder;

                  if(data[0] && data[0].wallets && data[0].wallets.profilepic && data[0].wallets.profilepic.length > 0) {
                    this.memberDetails.profilepic = data[0].wallets.profilepic[0]["attachment"];
                  }
                  this.balance = data[0] && data[0].wallet && data[0].wallet.balance ? data[0].wallet.balance : 0;


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

    } else {
      this.showNotification('top', 'right', 'Something went wrong!!!', 'danger');
      this.reset();
    }
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
         this.showNotification('top', 'right', 'Check in done successfully!!', 'success');

         this.visibility = true;
         this.onAttendanceData.emit();
      }
   })
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
