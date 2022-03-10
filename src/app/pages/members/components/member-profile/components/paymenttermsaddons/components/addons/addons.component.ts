import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-addons',
  templateUrl: './addons.component.html'
})
export class AddonsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  membershipLists: any[] = [];
  selectedPackage: any = {};
  paymentTermsLists: any[] = [];
  existpaymentTermsLists: any[] = [];
  joiningdate: Date;
  expirydate: Date;
  selectedDate: Date;
  minDate: Date;

  btnDisable: boolean = false;
  isLoading: boolean = false;
  hideBtn: boolean = false;

  changeMembershipForm: FormGroup;
  changeMembershipSubmitted: boolean;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
  ) {
    super()
    this.pagename = "app-addons";

    this.changeMembershipForm = fb.group({
      '_id': ['', Validators.required],
      'changeMembershipStartDate': ['', Validators.required],
      'changeMembershipEndDate': ['', Validators.required],
    });
  }

  selectedaddons : any;

  @Input() dataContent: any;
  @Input() schemaname: any;
  @Input() reloadingStr: string;
  @Output() onAdded = new EventEmitter();

  @Output() onAddedData = new EventEmitter();

  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.initializeVariables();
      await this.getMembershipLists();
      await this.setData();
    } catch (error) {
    }

  }


  async ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    if(this.reloadingStr && this.reloadingStr == 'addons'){
      this.setData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    
    this.membershipLists = [];
    this.selectedPackage = {};
    this.paymentTermsLists = [];
    this.existpaymentTermsLists = [];
    this.joiningdate = new Date();
    this.expirydate = new Date;
    return;
  }

  async setData() {
    
    this.existpaymentTermsLists = [];
    if (this.dataContent.addons && this.dataContent.addons.length > 0) {
      let obj = {};
      this.dataContent.addons.forEach(addons => {
        if (addons.paymentterms && addons.paymentterms.length > 0) {
          addons.paymentterms.forEach(paymentterms => {
            
            let amount =  paymentterms.amount;
            let paymenttermsid =  paymentterms._id;
            paymentterms.taxAmount = 0;
            if (paymentterms.discount != undefined && paymentterms.discount != 0) {
              amount -= paymentterms.discount;
            }
            if (paymentterms.taxes && paymentterms.taxes.length !== 0) {
              paymentterms.taxAmount = this._commonService.calTaxes(paymentterms.taxes, amount);
            }

            obj = {
              'membershipstart': addons.membershipstart,
              'membershipend': addons.membershipend,
              'membershipid': addons.membershipid,
              'membershipname': addons.membershipid.membershipname,
              'paymentitem': paymentterms.paymentitem.paymentitemname,
              'period': paymentterms.period,
              'tenure': paymentterms.tenure,
              'amount': paymentterms.amount,
              'taxamount': paymentterms.taxAmount,
              'discount': paymentterms.discount,
              'totalamount': amount + paymentterms.taxAmount,
              'status': addons.status,
              'paymenttermsid': paymenttermsid,
              'paymentterms': addons.paymentterms && addons.paymentterms.length > 0 ? addons.paymentterms.map(a=>a._id) : [],
              'addonsid': addons._id,
            };
            this.existpaymentTermsLists.push(obj);
          });
        }
      });
    }
  }

  async getMembershipLists() {
    var method = "POST";
    var url = "memberships/filter"
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "status", searchvalue: "active", criteria: "eq" });
    postData["search"].push({ searchfield: "property.type", searchvalue: "package", criteria: "eq" });

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.membershipLists = [];
          this.membershipLists = data;
        }
      });
  }

  addPackage(item: any) {
    this.selectedPackage = item;
    this.getPaymentTerms(item._id);
  }

  onPackageSelect(id : any , membershipid : any){
    this.changeMembershipForm.reset();
    this.changeMembershipForm.get('_id').patchValue(id);
    this.selectedaddons = membershipid;
    this.changeMembershipSubmitted = false;
  }

 async onPackageDelete(paymenttermsid : any , membershipid : any ,addonsid : any){
  
  swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to revert this !',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Remove it!',
    cancelButtonText: 'No',
    customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
    },
    buttonsStyling: false
}).then(async(result) => {
    if (result.value) {

        let method = "PATCH";
        let url = this.schemaname+'/'+this.dataContent._id;

        var original  = this.dataContent.addons;
        var dupl  = [], pt;
        
        original.forEach(addon => {
          if(addon._id == addonsid && addon.membershipid._id == membershipid._id){
            pt = addon.paymentterms.findIndex(a=>a._id == paymenttermsid);
            addon.paymentterms.splice(pt,1);
          }
          if(addon.paymentterms && addon.paymentterms.length > 0){
            dupl.push(addon);
          }
        });
              
        var modal = {};
        modal['addons'] = dupl;

        this.btnDisable = true;
        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, modal)
          .then(data => {
            if (data) {
              this.showNotification('top', 'right', `Package Date has been removed successfully!!!`, 'success');
              this.btnDisable = false;
              this.onAddedData.emit({res : data, tabStr : "addons"});
            }
          }).catch((error)=>{
            this.btnDisable = false;
            console.error(error);
            this.showNotification('top', 'right', `Something went wrong !!`, 'danger');
          });
       }
    });
  }
 
  membershipStartDateValueChange(event: any) {

    if (event) {

      var membershipstart = new Date(this.changeMembershipForm.get("changeMembershipStartDate").value);
      var newDate = new Date(membershipstart);
      if (membershipstart != undefined && membershipstart != null) {
          if (this.selectedaddons.periodin != undefined) {
            if (this.selectedaddons.periodin == "Year") {
              newDate.setFullYear(membershipstart.getFullYear() + this.selectedaddons.tenure)
            }
            if (this.selectedaddons.periodin == "Month") {
              var endDateMoment = moment(newDate);                               // ADDED
              endDateMoment.add(this.selectedaddons.tenure, 'months'); // ADDED
              newDate = endDateMoment.toDate();                                  // ADDED
              // newDate.setMonth(membershipstart.getMonth() + this.selectedaddons.tenure)
            }
          } else if (this.selectedaddons.property != undefined && this.selectedaddons.property.tenure_month != undefined) {
            let monthinc: number = 0;
            let ten: number = this.selectedaddons.property.tenure_month;
            monthinc += Number(ten);
            let selectedten: number = membershipstart.getMonth();
            monthinc += Number(selectedten);
            // newDate.setMonth(monthinc);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
          } else if (this.selectedaddons.property != undefined && this.selectedaddons.property.tenure_year != undefined) {
            let yearinc: number = 0;
            let ten: number = this.selectedaddons.property.tenure_year;
            yearinc += Number(ten);
            let selectedten: number = membershipstart.getFullYear();
            yearinc += Number(selectedten);
            newDate.setFullYear(yearinc);
          } else if (this.selectedaddons.property && this.selectedaddons.property.tenure) {
            let monthinc: number = 0;
            let ten: number = this.selectedaddons.property.tenure;
            monthinc += Number(ten);
            let selectedten: number = membershipstart.getMonth();
            monthinc += Number(selectedten);
            // newDate.setMonth(monthinc);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
          }
          newDate.setDate(membershipstart.getDate() - 1);
          this.changeMembershipForm.get('changeMembershipEndDate').setValue(newDate);
      
      }
    }
    
  }

  async onChangeMembershipDateSubmit(value: any, isValid: boolean) {
    
    this.changeMembershipSubmitted = true;

    if (!isValid) {
      this.showNotification('top', 'right', `Validation failed !!`, 'danger');
      return false;
    } else {
      let method = "PATCH";
      let url = this.schemaname + "/" + this.dataContent._id;

      var addons = [];
      addons = this.dataContent['addons'];
      addons.map((add)=>{
        if(add._id == value._id){
          add.membershipstart = value.changeMembershipStartDate && value.changeMembershipStartDate._d ? value.changeMembershipStartDate._d : value.changeMembershipStartDate;
          add.membershipend = value.changeMembershipEndDate && value.changeMembershipEndDate._d ? value.changeMembershipEndDate._d : value.changeMembershipEndDate;
        }
      });
      var modal = {};
      modal['addons'] = addons;

      console.log("modal",modal);

      this.btnDisable = true;
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
          if (data) {
            $("#closeChangeMembershipDate").click();
            this.showNotification('top', 'right', `Package Date has been Change successfully!!!`, 'success');
            this.btnDisable = false;
            this.changeMembershipForm.reset();
            this.onAddedData.emit({res : data, tabStr : "addons"});
          }
        }).catch((error)=>{
          this.btnDisable = false;
          console.error(error);
          this.showNotification('top', 'right', `Something went wrong !!`, 'danger');
        });
    }
  }
 
  getPaymentTerms(id: any) {

    var method = "POST";
    var url = "paymentterms/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "membershipid", searchvalue: id, criteria: "eq" });

    this.isLoading = true;
    this.paymentTermsLists = [];

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.paymentTermsLists = data;
          if (this.paymentTermsLists.length !== 0) {
            this.paymentTermsLists = this.paymentTermsLists.filter(ele => {
              if (ele.memberid != undefined && ele.memberid != this.dataContent._id) {
                return false;
              } else {
                return true;
              }
            });
          }
          this.paymentTermsLists.forEach(elePaymentTerms => {

            elePaymentTerms.selectitem = false;

            elePaymentTerms['payment'] = false;
            let amount = elePaymentTerms.amount;
            if (elePaymentTerms.discount != undefined && elePaymentTerms.discount != 0) {
              amount -= elePaymentTerms.discount;
            }
            elePaymentTerms.taxAmount = 0;
            elePaymentTerms.totalAmount = 0;
            elePaymentTerms.oldtenure = 0;
            elePaymentTerms.oldtenure = JSON.parse(JSON.stringify(elePaymentTerms.tenure));
            if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
              elePaymentTerms.taxAmount = this._commonService.calTaxes(elePaymentTerms.taxes, amount);
            }
            elePaymentTerms.totalAmount = amount + elePaymentTerms.taxAmount;
            if (this.dataContent && this.dataContent.addons && this.dataContent.addons.length !== 0) {
              this.dataContent.addons.forEach(add => {
                add.paymentterms.forEach(element => {
                  if (element._id == elePaymentTerms._id) {
                    elePaymentTerms.isedit = false;
                    elePaymentTerms.selectitem = true;
                  }
                });
              });
            }
          });

          this.isLoading = false;
        }
      }, (e) => {
        this.isLoading = false;
      });
  }

  checkUncheckEvent(e: any, item: any) {
    this.paymentTermsLists.forEach(element => {
      if (element._id == item._id) {
        element.selectitem = false;
        if (e.checked) {
          element.selectitem = true;
        }
      }
    });
  }

  onchangeamountofpaymentterm() {
    this.paymentTermsLists.forEach(elePaymentTerms => {
      let amount = elePaymentTerms.amount;
      if (elePaymentTerms.discount != undefined && elePaymentTerms.discount != 0) {
        amount -= elePaymentTerms.discount;
      }
      elePaymentTerms.taxAmount = 0;
      elePaymentTerms.totalAmount = 0;
      if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
        elePaymentTerms.taxAmount = this._commonService.calTaxes(elePaymentTerms.taxes, amount);
      }
      elePaymentTerms.totalAmount = amount + elePaymentTerms.taxAmount;
    });
  }

  onchangetotalamountofpaymentterm() {
    this.paymentTermsLists.forEach(elePaymentTerms => {
      if (elePaymentTerms.isedit == true) {
        let totalAmount = elePaymentTerms.totalAmount;
        elePaymentTerms.taxAmount = 0;
        elePaymentTerms.amount = 0;
        elePaymentTerms.totalpercent = 0;
        if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
          elePaymentTerms.taxAmount = this._commonService.calTaxes(elePaymentTerms.taxes);
        }
        elePaymentTerms.amount = Math.round(totalAmount / (1 + (elePaymentTerms.totalpercent / 100)));
        elePaymentTerms.taxAmount += totalAmount - elePaymentTerms.amount;
      }
    });
  }

  editElement(obj: any) {
    if (obj) {
      obj.isedit = false;
      this.paymentTermsLists.forEach(ele => {
        if (ele._id == obj._id) {
          ele.isedit = true;
        } else {
          ele.isedit = false;
        }
      });
    }
  }

  get changes() : boolean {
    var val =  this.paymentTermsLists.filter(a=>a.isedit == true);
    return val.length == 0;
  }

  updatePayTerms(obj: any) {
    obj.disablesavebtn = true;
    let item: any;
    item = JSON.parse(JSON.stringify(obj));
    if (item.membershipid != undefined && item.membershipid._id != undefined) {
      item.membershipid = item.membershipid._id;
    }
    if (item.paymentitem != undefined && item.paymentitem._id != undefined) {
      item.paymentitem = item.paymentitem._id;
    }
    if (item.taxes != undefined && item.taxes.length > 0) {
      let txarr: string[] = [];
      item.taxes.forEach(element => {
        if (element._id != undefined) {
          txarr.push(element._id);
        }
      });
      item.taxes = txarr;
    }else{
      item.taxes = [];
    }
    if (item) {
      if (item.amount != undefined && item.amount <= 0) {
        this.showNotification('top', 'right', 'Please enter amount!!!', 'danger');
        return;
      }
      
      var url = "paymentterms";

      if (item.memberid == undefined) {
        item.memberid = this.dataContent._id;

        var method = "POST";
        this.btnDisable = true;
        this._commonService
          .commonServiceByUrlMethodData(url, method, item)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              this.btnDisable = false;
              this.paymentTermsLists.map(ele => ele.isedit = false);
              this.onAddedData.emit({res : data, tabStr : "addons"});
              this.addPackage(data.membershipid);
              this.setData();
            }
          },(e) => {
            this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            this.btnDisable = false;
          });
      } else if (item.memberid != undefined && item.memberid == this.dataContent._id) {

        var method = "PUT";
        this.btnDisable = true;
        this._commonService
          .commonServiceByUrlMethodData(url, method, item, item._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data : any) => {
            if (data) {
              this.paymentTermsLists.map(ele => ele.isedit = false);
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              this.btnDisable = false;
              this.onAddedData.emit({res : data, tabStr : "addons"});
              this.addPackage(data.membershipid);
              this.setData();
            }
          }, (e) => {
            this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            this.btnDisable = false;
          });
      }
    }
  }

  submit() {

    if (this.selectedPackage && this.joiningdate && this.expirydate) {

      var paymentterms = [];
      this.paymentTermsLists.forEach(element => {
        if (element.selectitem) {
          var fnd = this.existpaymentTermsLists.find(a => a._id == element._id);
          if (!fnd) {
            paymentterms.push(element._id);
          }
        }
      });

      if (paymentterms && paymentterms.length == 0) {
        this.showNotification('top', 'right', 'Select at least one payment terms or check package !', 'danger');
        return;
      }

      var method = "POST";
      var url = this.schemaname + "/updatepackages";
      var membershipend = new Date();
      var tenure = this.selectedPackage.property.tenure;
      membershipend.setMonth(membershipend.getMonth() + tenure);

      let postData = {
        _id: this.dataContent._id,
        membershipstart: this.joiningdate,
        membershipend: membershipend,
        paymentterms: paymentterms,
        onModel: this.schemaname == "members"? "Member": "Prospect",
        membershipid: this.selectedPackage._id
      };
      console.log("postData==>",postData);
      this.btnDisable = true;
      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {

            this.showNotification('top', 'right', 'Payment term has been changed successfully!!!', 'success');
            this.btnDisable = false;
            this.onAdded.emit(data);
          }
        }, (e) => {
          console.log("e==>",e);
          this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          this.btnDisable = false;
        });

    } else {
      this.showNotification('top', 'right', 'Validation failed!!', 'danger');
      return;
    }
  }

}
