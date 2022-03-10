import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
  selector: 'app-paymentterms',
  templateUrl: './paymentterms.component.html'
})
export class PaymenttermsComponent extends BaseLiteComponemntComponent implements OnInit ,OnChanges {

  destroy$: Subject<boolean> = new Subject<boolean>();

  membershipObj = {
    fieldname: "membershipid",
    fieldtype: "form",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "property.type", searchvalue: false, criteria: "exists" },
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "membershipname", value: 1 },
      { fieldname: "property", value: 1 },
    ],
    method: "POST",
    form: {
      apiurl: "memberships/filter",
      formfield: "_id",
      displayvalue: "membershipname",
    },
    modelValue: {},
    value: "",
    dbvalue: {}
  };

  joiningdate: Date;
  expirydate: Date;

  dataSource: any[] = [];

  paymentTermsLists: any[] = [];

  visibility: boolean = false;
  selectedDate: Date;
  minDate: any;

  selectedMembership: any = {};

  btnDisable: boolean = false;
  disableFields: boolean = false;

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename = "app-paymentterms";
  }

  @Input() dataContent: any;
  @Input() reloadingStr: string;
  @Output() onAdded = new EventEmitter();
  @Output() onAddedData = new EventEmitter();
  

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables();
    } catch (error) {
      console.error("error", error)
    } finally {

    } 
    this.setData();
  }

 setData(){
    this.disableFields = false;
    if (this.dataContent.membershipid && this.dataContent.membershipid._id) {
      this.membershipObj.dbvalue = this.dataContent.membershipid;
      this.selectedMembership = this.dataContent.membershipid;
      this.disableFields = true;
    }
    if (this.dataContent.membershipstart) {
      this.joiningdate = new Date(this.dataContent.membershipstart);
    }

    if (this.dataContent.membershipend) {
      this.expirydate = new Date(this.dataContent.membershipend);
    }
    this.visibility = true;
  }

 async ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    if(this.reloadingStr && this.reloadingStr == 'paymentterms'){
      this.setData();
      this.getPaymentTerms(this.selectedMembership);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.dataSource = [];
    this.paymentTermsLists = [];
    this.visibility = false;
    this.selectedDate = new Date();
    this.minDate;
    this.btnDisable = false;
    return;
  }

  inputModelChangeValue(value: any) {
    if (value.autocomplete_id || value._id) {
      var id = value.autocomplete_id ? value.autocomplete_id : value._id ? value._id : null;
      this.selectedMembership = value;
      if(id)this.getPaymentTerms(this.selectedMembership);
    } else {
      this.selectedMembership = {}
      this.paymentTermsLists = [];
      this.joiningdate = null;
      this.expirydate = null;
    }
  }

  ChangeDate(event: any) {
    if (event) {
      this.selectedDate = event.value['_d'];
      this.minDate = this.selectedDate;
      var newDate = new Date(this.minDate);
      
      
      if (this.selectedDate != undefined && this.selectedDate != null) {
        if (this.selectedMembership == undefined) {
          this.showNotification('top', 'right', 'Please choose any membership', 'danger');
          return;
        } else {
          if (this.selectedMembership.periodin != undefined) {
            if (this.selectedMembership.periodin == "Year") {
              newDate.setFullYear(this.selectedDate.getFullYear() + this.selectedMembership.tenure)
            }
            if (this.selectedMembership.periodin == "Month") {
              var endDateMoment = moment(newDate);                               // ADDED
              endDateMoment.add(this.selectedMembership.tenure, 'months');       // ADDED
              newDate = endDateMoment.toDate();                                  // ADDED
              // newDate.setMonth(this.selectedDate.getMonth() + this.selectedMembership.tenure)
            }
          } else if (this.selectedMembership.property != undefined && this.selectedMembership.property.tenure_month != undefined) {
            let monthinc: number = 0;
            let ten: number = this.selectedMembership.property.tenure_month;
            monthinc += Number(ten);
            let selectedten: number = this.selectedDate.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);        
          } else if (this.selectedMembership.property != undefined && this.selectedMembership.property.tenure_year != undefined) {
            let yearinc: number = 0;
            let ten: number = this.selectedMembership.property.tenure_year;
            yearinc += Number(ten);
            let selectedten: number = this.selectedDate.getFullYear();
            yearinc += Number(selectedten);
            newDate.setFullYear(yearinc);
          } else if (this.selectedMembership.property && this.selectedMembership.property.tenure) {
            let monthinc: number = 0;
            let ten: number = this.selectedMembership.property.tenure;
            monthinc += Number(ten);
            let selectedten: number = this.selectedDate.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);
          }
          newDate.setDate(this.selectedDate.getDate() - 1);
          this.expirydate = newDate;
        }
      }
    }
  }

  getPaymentTerms(membership: any) {
   if(membership && membership._id){
   
    var method = "POST";
    var url = "paymentterms/filter"

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "membershipid", searchvalue: membership._id, criteria: "eq", datatype: 'ObjectId' });

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {

        if (data) {
          this.paymentTermsLists = [];
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

            if (this.dataContent && this.dataContent.paymentterms && this.dataContent.paymentterms.length !== 0) {
              this.dataContent.paymentterms.forEach(element => {
                if (element._id == elePaymentTerms._id) {
                  elePaymentTerms.isedit = false;
                  elePaymentTerms.selectitem = true;
                }
              });
            }

          });
        }
      }, (error) => {
        console.error(error);
      });
    }
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

 async deleteElement(obj: any){
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async (result) => {
      if (result.value) {
        if(obj && obj._id){
          let url = "paymentterms/"
          let method = "DELETE";
          let id = obj._id;

          this.btnDisable = true;
          await  this._commonService
              .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
              .then((data: any) => {
                if (data) {
                  this.btnDisable = false;
                  this.showNotification('top', 'right', 'Payment terms has been deleted successfully !!', 'success');
                  this.onAddedData.emit({res : data, tabStr : "paymentterms"});
                }
              }, (error) => {
                console.error(error);
                this.btnDisable = false;
              });
            }
        }
      });

  }

  get changes() : boolean {
    var val =  this.paymentTermsLists.filter(a=>a.isedit == true);
    return val.length == 0;
  }


  updatePayTerms(obj: any) {

    if(obj.discount > obj.amount) {
      this.showNotification('top', 'right', 'Discount cannot be greater than amount!!!', 'danger');
      return;
    }
    
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
      item.taxes  = [];
    }
    if (item) {
      if (item.amount != undefined && item.amount <= 0) {
        this.showNotification('top', 'right', 'Please enter amount!!!', 'danger');
        return;
      }

      var url = "paymentterms"
      this.btnDisable = true;
      if (item.memberid == undefined) {
        item.memberid = this.dataContent._id;

        var method = "POST";
        this._commonService
          .commonServiceByUrlMethodData(url, method, item)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {
            if (data) {
              this.btnDisable = false;
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              this.onAddedData.emit({res : data, tabStr : "paymentterms"});
            }
          }, (error) => {
            console.error(error);
            this.btnDisable = false;
          });
      } else if (item.memberid != undefined && item.memberid == this.dataContent._id) {

        var method = "PUT";
        this._commonService
          .commonServiceByUrlMethodData(url, method, item, item._id)
          .subscribe(data => {
            if (data) {
              this.btnDisable = false;
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              this.onAddedData.emit({res : data, tabStr : "paymentterms"});
            }
          }, (error) => {
            console.error(error);
            this.btnDisable = false;
          });
      }
    }
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

  submit() {
    this.btnDisable = true;
    if (this.selectedMembership && this.joiningdate && this.expirydate) {

      var paymentterms = [];
      this.paymentTermsLists.forEach(element => {
        if (element.selectitem) {
          paymentterms.push(element._id);
        }
      });

      if (paymentterms && paymentterms.length == 0) {
        this.btnDisable = false;
        this.showNotification('top', 'right', 'Please select at least one payment terms.', 'danger');
        return;
      }

      var method = "POST";
      var url = "members/paymentterms";

      let postData = {
        _id: this.dataContent._id,
        membershipstart: this.joiningdate,
        membershipend: this.expirydate,
        paymentterms: paymentterms,
        membershipid: this.selectedMembership._id
      };

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.btnDisable = false;
            this.showNotification('top', 'right', 'Payment term has been changed successfully!!!', 'success');
            this.onAdded.emit(data);
          }
        }, (error) => {
          this.btnDisable = false;
          console.error(error);
        });

    } else {
      this.btnDisable = false;
      this.showNotification('top', 'right', 'Validation failed!!', 'danger');
      return;
    }
  }


}
