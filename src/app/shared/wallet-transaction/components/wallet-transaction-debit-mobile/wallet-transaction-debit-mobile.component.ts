import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CommonService } from '../../../../core/services/common/common.service';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BaseComponemntInterface } from '../../../base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-wallet-transaction-debit-mobile',
  templateUrl: './wallet-transaction-debit-mobile.component.html',
  styles: [
    `
      img {
          width: 200px;
          min-height: 200px;
          margin: 10px;
      }
    `
  ]
})
export class WalletTransactionDebitMobileComponent  extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

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

  @ViewChild('firstName', { static: false }) firstNameElement: ElementRef;

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

  // getAllWalletTypeLists() {

  //   let method = "POST";
  //   let url = "lookups/filter";

  //   let postData = {};
  //   postData["search"] = [];
  //   postData["search"].push({"searchfield": "lookup", "searchvalue": "Wallet Types", "criteria": "eq"});

  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if (data) {

  //         if(data && data.length != 0) {
  //           this.walletTypeLists = [];
  //           this.walletTypeLists = data[0]['data'];
  //           if(this.walletTypeLists[0] && this.walletTypeLists[0]['code']) {
  //             this.wallettype = this.walletTypeLists[0]['code'];
  //           }
  //         }

  //         return;
  //       }
  //     }, (err) =>{

  //       console.error("err", err);
  //     });
  // }

  // getMemberFormID() {

  
  //   let postData = {};
  //   postData["search"] = [];
  //   postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});


  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if (data) {

  //         if(data.length !== 0) {
  //           data.forEach(element => {
  //             if (element.formname == "member")  {
  //               this.memberFormDisplayFormName= element.dispalyformname;
  //             }
  //             if (element.formname == 'membership') {
  //               this.membershipFormDisplayFormName= element.dispalyformname;
  //             }

  //           });
  //         }

  //         return;
  //       }
  //     }, (err) =>{

  //       console.error("err", err);
  //     });
  // }

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



    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {



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
  }

  // getMemberWalletDetailByMemberId(id: any) {

  //   let method = "POST";
  //   let url = 'walletaccounts/filter';

  //   let postData = {};
  //   postData["search"] = [];
  //   postData["search"].push({"searchfield": "memberid", "searchvalue": id, "criteria": "eq"});
  //   postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

  //   console.log("WalletAccount postDATa", postData)

  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if(data) {

  //         console.log("WalletAccount data", data);

  //         if(data[0]) {
  //           this.walletId = data[0]['_id'];
  //           this.walletnumber= data[0]['walletnumber'];
  //           this.getWalletTransactionDetailsByWalletId(this.walletnumber);
  //         } else {
  //           this.showNotification('top', 'right', 'Member haven't wallet account yet.!!!', 'danger');
  //           this.reset();
  //         }
  //         return
  //       }

  //     }, (err) =>{
  //       console.error("err", err);
  //     });
  // }

  // getWalletTransactionDetailsByWalletId(id: any) {

  //   let method = "GET";
  //   let url = 'wallettxns/wallet/' + id;
  //   let postData: any;

  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if(data) {

  //         this.walletFullDetails = data;
  //         if(data.length !== 0) {
  //           let cnt = 0;
  //           data.forEach(element => {
  //             if(element._id) {

  //               console.log("element", element);

  //               if(this.wallettype.toLowerCase() == element._id.wallettype.toLowerCase()) {
  //                 this.memberDetails = element._id.member;
  //                 this.membername = element._id.member.fullname;
  //                 this.membernumber = element._id.member.membernumber;
  //                 this.balance = element.Balance;
  //                 this.visibility = true;
  //                 cnt++;
  //               }
  //             }
  //           });
  //           if(cnt == 0) {
  //             this.memberDetails = data[0]._id.member;
  //             this.membername = data[0]._id.member.fullname;
  //             this.membernumber = data[0]._id.member.membernumber;
  //             this.balance = 0;
  //             this.visibility = true;
  //             this.showNotification('top', 'right', 'Balance must be more then 0.', 'danger');
  //           }
  //         } else {
  //           this.showNotification('top', 'right', 'oops!! No member exists!!!', 'danger');
  //           this.reset();
  //         }

  //         return;
  //       }

  //     }, (err) =>{
  //       console.error("err", err);
  //     });
  // }

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
  //         this.showNotification('top', 'right', 'Balance must be more then 0.', 'danger');
  //       }
  //     } else {
  //       this.showNotification('top', 'right', 'oops!! No member exists!!!', 'danger');
  //       this.reset();
  //     }
  //   } else {

  //   }
  // }

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
      cardnumber: this.cardnumber,
      txndate: Date(),
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
      if(this.otpCodeVisibility) {
        if(this.otpcode == this.generatedOtpCode) {

          let method = "POST";
          let url = "wallettxns";


          let postData = {
            txntype : "Dr",
            txnref : this.txnref,
            txndate: Date(),
            cardnumber: "",
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
                this.showNotification('top', 'right', 'Pts. debited successfully!!!', 'success');
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
    //let message = this.generatedOtpCode + " is the OTP for your transaction for an amount of " + this.debitpoint + ". Do not share with anyone." + this._loginUserBranch?.branchname;

    let postData = {
      tomobile: tomobile,
      otp: this.generatedOtpCode,
      otptype:"password",
    };

    let method = "POST";
    let url = 'public/sendotp';


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

}
