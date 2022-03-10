import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-wallet-debit',
  templateUrl: './wallet-debit.component.html',
  styles: [
  ]
})
export class WalletDebitComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  //_walletsettingModel = new WalletsettingModel();

  bindId: any;
  memberFormDisplayFormName: any;
  membershipFormDisplayFormName: any;

  cardVisibility: boolean;
  mobileVisibility: boolean;

  cardEnabled: boolean;
  mobileEnabled: boolean;

  
  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute
  ) {
    super()
    this.pagename = "app-wallet-debit";
  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.LoadData();

      } catch (err) {
        console.error(err);
      } finally {
      }
    })

  }

  async initializeVariables() {
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {


    if(this._loginUserBranch && this._loginUserBranch.walletsetting && this._loginUserBranch.walletsetting.paymentType && this._loginUserBranch.walletsetting.paymentType.length > 0 ) {
      this._loginUserBranch.walletsetting.paymentType.forEach(element => {
        if(element == 'card') {
          this.cardEnabled = true;
          $("#cardClick").click();
          $('#cardClick a').addClass('active');
          this.randomValueClick('card');  
        } 

        if(element == 'mobile') {
          this.mobileEnabled = true;
          if(this._loginUserBranch.walletsetting.paymentType.length == 1) {
            setTimeout(() => {
              $("#mobileClick").click();
              $('#mobileClick a').addClass('active');
              this.randomValueClick('mobile');  
            }, 1000);
            
          }
        }
      });
    }


    return;

  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }


  randomValueClick(val: any) {
    if(val == 'card') {
      this.cardVisibility = true;
      this.mobileVisibility = false;
      
    } else if(val == 'pin') {
      this.cardVisibility = false;
      this.mobileVisibility = false;
      
    } else {
      this.cardVisibility = false;
      this.mobileVisibility = true;
      
    }
  }

}
