import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CommonService } from '../../../../core/services/common/common.service';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BaseComponemntInterface } from '../../../base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-wallet-transaction-debit',
  templateUrl: './wallet-transaction-debit.component.html',
  styles: [
    `.payment-container {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
  }

  img {
          width: 200px;
          min-height: 200px;
          margin: 10px;
      }`
  ]
})
export class WalletTransactionDebitComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  otpCodeVisibility: boolean;
  visibility: boolean;

  cardnumber: any;
  membername: any;
  membernumber: any;
  visitorname: any;
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

  @ViewChild('firstName', { static: true }) firstNameElement: ElementRef;

  constructor(
    private _commonService: CommonService,
    private _route: ActivatedRoute,
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
    this.visitorname = '';
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

  pay() {

    if(this.debitpoint == 0 || this.debitpoint == '') {
      this.showNotification('top', 'right', 'Debit Pts. cannot be blank or 0!!!', 'danger');
    } else {
      if(isNaN(this.debitpoint)){
        this.showNotification('top', 'right', 'Debit Pts. is not a number!!!', 'danger');
      } else {
        if(this.balance < this.debitpoint) {
          this.showNotification('top', 'right', 'Debit Pts must be less than balance!!!', 'danger');
        } else {
          if (this.debitpoint > 0) {
            // if(this.walletTypeLists.length !== 0) {
            //   if(this.wallettype !== '') {
            //     this.walletTxnSave();
            //   } else {
            //     this.showNotification('top', 'right', 'Debit Pts. cannot be blank !!!', 'danger');
            //   }
            // } else {
              this.walletTxnSave();
            //}

          } else {
            this.showNotification('top', 'right', 'Debit Pts. must positive value!!!', 'danger');
          }
        }
      }
    }
  }

  walletTxnSave() {

    if(!this.iswalletotpenable) {


      let method = "POST";
      let url = "wallettxns";

      let postData = {
        txntype : "Dr",
        txnref : this.txnref,
        txndate: Date(),
        cardnumber: this.cardnumber,
        customerid: this.memberDetails._id,
        onModel: "Member",
        value : this.debitpoint,
        createdAt : Date(),
        updatedAt : Date(),
      };


      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            this.showNotification('top', 'right', this.debitpoint + ' Pts. has been debited successfully!!!', 'success');
            this.reset();
          return;
        }
      }, (err) =>{
        console.error("err", err);
      });

    } else {

      if(this.otpCodeVisibility && this.iswalletotpenable) {

        if(this.otpcode == this.generatedOtpCode) {

          let method = "POST";
          let url = "wallettxns";

          let postData = {
            txntype : "Dr",
            txnref : this.txnref,
            txndate: Date(),
            cardnumber: this.cardnumber,
            customerid: this.memberDetails._id,
            onModel: "Member",
            value : this.debitpoint,
            createdAt : Date(),
            updatedAt : Date(),
          };

          return this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData)
            .then((data: any) => {
              if (data) {
                this.showNotification('top', 'right', this.debitpoint + ' Pts. debited successfully!!!', 'success');
                this.reset();
              return;
            }
          }, (err) =>{
            console.error("err", err);
          });

        } else {
          this.showNotification('top', 'right', 'You have enter wrong otp!!!', 'danger');
        }
      } else {
        this.sendOtpApi();
      }
    }
  }

  sendOtpApi() {

    this.otpCodeVisibility = true;
    this.generatedOtpCode = Math.floor(100000 + Math.random() * 900000)
    let tomobile = this.memberDetails.property.mobile;

    //let message = this.generatedOtpCode + " is the OTP for your transaction for an amount of " + this.debitpoint + ". Do not share with anyone.";

    let method = "POST";
    let url = 'public/sendotp';

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

  // modelWalletTypeChanged(value: any) {
  //   this.wallettype = value;
  //   if(value !== '') {
  //     if(this.walletFullDetails.length !== 0) {
  //       let cnt = 0;
  //       this.walletFullDetails.forEach(element => {
  //         if(element._id) {
  //           if(this.wallettype.toLowerCase() == element._id.wallettype.toLowerCase()) {
  //             this.memberDetails = element._id.member;
  //             this.membername = element._id.member.fullname;
  //             this.membernumber = element._id.member.membernumber;
  //             this.balance = element.Balance;
  //             this.visibility = true;
  //             this.getWalletIdByMemberId(this.memberDetails._id);
  //             cnt++;
  //           }
  //         }
  //       });
  //       if(cnt == 0) {
  //         this.memberDetails = this.walletFullDetails[0]._id.member;
  //         this.membername = this.walletFullDetails[0]._id.member.fullname;
  //         this.membernumber = this.walletFullDetails[0]._id.member.membernumber;
  //         this.balance = 0;
  //         this.visibility = true;
  //         this.getWalletIdByMemberId(this.memberDetails._id);
  //         this.showNotification('top', 'right', 'Balance must be more then 0.', 'danger');
  //       }
  //     } else {
  //       this.showNotification('top', 'right', 'oops!! No member exists!!!', 'danger');
  //       this.reset();
  //     }
  //   } else {

  //   }
  // }

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

    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {



          if(data) {
            if(data.length == 0) {
              this.showNotification('top', 'right', 'Card number is invalid!!!', 'danger');
              this.reset();
            } else {
              if(data[0]) {

                this.memberDetails = {};
                this.memberDetails = data[0];

                this.memberDetails.profilepic =  data[0].profilepic ? data[0].profilepic : "https://res.cloudinary.com/dlopjt9le/image/upload/v1620196092/c5d9tdgjltc6uutwzdqe.jpg"

                this.walletFullDetails = data[0]["wallet"];

                this.membername = data[0].fullname;
                this.membernumber = data[0].membernumber;

                this.visitorname = data[0]["wallets"]['holder'];

                this.balance = data[0] && data[0].wallet && data[0].wallet.balance ? data[0].wallet.balance : 0;
                this.visibility = true;

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

  // getWalletIdByMemberId(id: any) {

  //   let method = "POST";
  //   let url = 'walletaccount/filter/';

  //   let postData = {};
  //   postData['search'] = [];
  //   postData['search'].push({"searchfield": "memberid", "searchvalue": id, "criteria": "eq"});
  //   postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});


  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if (data) {
  //         if(data[0]) {
  //           this.walletId = data[0]["_id"];
  //         }
  //         return;
  //       }
  //     }, (err) =>{
  //       console.error("err", err);
  //     });
  // }

}
