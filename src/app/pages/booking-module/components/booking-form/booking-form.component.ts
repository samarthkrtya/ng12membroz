import { Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { BookingModel } from '../../../../core/models/service/booking';
import { ResortService } from '../../../../core/services/resort/resort.service';
import { BookingService } from '../../../../core/services/service/booking.service';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { TaxesService } from '../../../../core/services/payment/taxes.service';

import * as moment from 'moment';
declare var $: any;

export interface StateGroup {
  letter: string;
  names: string[];
}

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styles: [
    `.example-option-img {
      vertical-align: middle;
      margin-right: 8px;
    }
    [dir='rtl'] .example-option-img {
      margin-right: 0;
      margin-left: 8px;
    }`
  ]
})

export class BookingFormComponent extends BaseComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bookingModel = new BookingModel()

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  customerIds: any;

  today: Date = new Date();

  totalrooms: number[] = [];
  totaloccupants: number[] = [0, 1, 2, 3, 4, 5, 6];

  resortList: any[] = [];
  resortidisLoadingBox: boolean = false;
  resortfilteredOptions: Observable<any[]>;

  taxesList: any[] = [];

  selectedCustomer: any;
  currentRoleDetail: any;
  isMemberLogin: boolean = false;
  currUserid: any;
  status: string;

  allResortLists: any[] = [];
  filteredOptions: Observable<string[]>;
  contactLists: any[] = [];
  
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter<any>();

  locationfields = {
    "fieldname": "locationid",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "locationname", "value": 1 },
      { "fieldname": "property", "value": 1 },
    ],
    "form": {
      "apiurl": "resortlocations/filter",
      "formfield": "_id",
      "displayvalue": "locationname",
    },
    "method": "POST",
    "dbvalue": ""
  };

  roomtypes_fieldsArray: any[] = [];
  roomtypes_fields = {
    "fieldname": "occupanttype",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": "60a2238648c98c3638e8b2ae", "criteria": "eq", "datatype": "ObjectId" },
    ],
    "form": {
      "apiurl": "billitems/filter",
      "formfield": "_id",
      "displayvalue": "itemname",
    },
    "method": "POST",
    "dbvalue": {}
  }

  reservationtypes_fields = {
    "fieldname": "reservation",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "Reservation Types", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "dbvalue": {},
    "visible": true
  }

  bindIdData: any = {};
  visible: boolean = false;
  resortTypeLists: any[] = [];
  
  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _bookingService: BookingService,
    private _resortService: ResortService,
    private _taxesService: TaxesService,
  ) {
    super();
    this.totalrooms = [];
    for (let i = 1; i <= 4; i++) {
      this.totalrooms.push(i);
    }

    if (this._authService.currentUser != undefined && this._authService.currentUser.role != undefined) {
      this.currentRoleDetail = this._authService.currentUser.role;
      if (this.currentRoleDetail) {
        if (this.currentRoleDetail.roletype != undefined) {
          if (this.currentRoleDetail.roletype == 'M') {
            this.isMemberLogin = true;
          } else {
            this.isMemberLogin = false;
          }
        }
      }
    }

    this.form = this.fb.group({
      'customerid': ['', Validators.compose([Validators.required])],
      'locationid': [],
      'resortid': [],
      'bookingdate': [new Date(), Validators.required],
      'checkin': ['', Validators.required],
      'checkout': ['', Validators.required],
      'totalrooms': [, Validators.required],
      'occupants': this.fb.array([]),
      'reservation': [],
      'guest': [],
      'status': ['active'],
      'charges': [],
      'taxes': [[]],
      'notes': [],
    });
    

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.customerIds = params["cid"];
      this._formName = 'booking';
      this.pagename = 'booking-form';
    });
    this.chooseRoom(1);
  }

  async ngOnInit() {

    await super.ngOnInit();
    await this.LoadData();

    this.filteredOptions = this.form.controls['customerid'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.nickname),
        map(option => option ? this.filter(option) : this.contactLists.slice())
      );
    this.resortfilteredOptions = this.form.controls['resortid'].valueChanges.pipe(
      startWith(''),
      map(option => typeof option === 'string' ? option : option.nickname),
      map(option => option ? this._resortfilter(option) : this.resortList.slice())
    );
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.contactLists
        .filter(option => {
          if (option.nickname) {
            //return option.nickname.toLowerCase().indexOf(value.toLowerCase()) === 0
            return option.nickname.toLowerCase().includes(value.toLowerCase())
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.contactLists.slice();
    }
    return results;
  }

async getContactLists() {
    
    var url = "common/contacts/filter";
    var method = "POST";
    
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "branchid", searchvalue: this._loginUserBranchId, criteria: "eq", datatype: "ObjectId" });

   await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.contactLists = data;
          this.contactLists.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          if (this.customerIds) {
            var custobj = this.contactLists.find(p => p._id == this.customerIds);
            if (custobj) {
              this.form.get('customerid').setValue(custobj);
              this.selectedCustomer = custobj;
            }
          }
        }
      }, (error) => {
        console.error(error);
      });
  }

  customerSelected(event: any) {
    if (event && event.value) {
      this.selectedCustomer = event.value;
      this.form.controls['guest'].setValue('');
      if (this.selectedCustomer && this.selectedCustomer.fullname)
        this.form.controls['guest'].setValue(this.selectedCustomer.fullname);
    }
  }

  createItem() {
    return this.fb.group({
      itemid: [],
      occupanttype: [, !this.isMemberLogin  ? Validators.required : null],
      adults: [],
      childrens: [],
      cost: [],
      totalcost: [''],
      quantity: ['']
    })
  }

  resortSelected(option: any) {

    this.resortTypeLists = [];
    if (option) {
      var resortObj = this.form.get("resortid").value;
      if (resortObj && resortObj.tariff && resortObj.tariff.length > 0) {
        this.resortTypeLists = [];
        this.resortTypeLists = resortObj.tariff;
      } else {
        this.disableButton = true;
        super.showNotification("top", "right", "Room Tarif is not setup, Please setup Tarif first!!", "danger");
        this._router.navigate(['/pages/package-booking/resort-view/' + resortObj._id]);
      }
      this.form.get("totalrooms").setValue(1);
      let control = <FormArray>this.form.controls.occupants;
      control.clear();
      control.push(this.createItem());
    }
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.form.get("resortid").setValue("");
      this.resortTypeLists = [];
      this.form.get("totalrooms").setValue(1);
      let control = <FormArray>this.form.controls.occupants;
      control.clear();
      control.push(this.createItem());
      this.roomtypes_fieldsArray = [];
      this.roomtypes_fieldsArray = [this.roomtypes_fields];
    }
  }

  dateValueChange() {

    var checkins = this.form.get("checkin").value && this.form.get("checkin").value._d ? this.form.get("checkin").value._d : this.form.get("checkin").value;
    var checkouts = this.form.get("checkout").value && this.form.get("checkout").value._d ? this.form.get("checkout").value._d : this.form.get("checkout").value;
    var checkin = new Date(checkins);
    var checkout = new Date(checkouts);
    if (checkin && checkout) {

      // if ((Date.parse(checkout.toString()) <= Date.parse(checkin.toString()))) {
      //   super.showNotification("top", "right", "End date should be greater than Start date !!", "danger");
      //   this.form.get("checkout").setValue(null);
      //   return;
      // }
      if (this.form.get("occupants")["controls"] && this.form.get("occupants")["controls"].length > 0) {
        var index = 0;
        this.form.get("occupants")["controls"].forEach(element => {
          if (element && element.value && element.value.occupanttype) {

            var startDate = moment(checkin, "DD.MM.YYYY");
            var endDate = moment(checkout, "DD.MM.YYYY");
            var daydiff = endDate.diff(startDate, 'days');
            var obj = this.resortTypeLists.find(p => p.roomtype.toLowerCase() == element.value.occupanttype.toLowerCase())
            if (obj) {
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('itemid').patchValue(obj.itemid._id);
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('adults').patchValue(obj.adults);
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('childrens').patchValue(obj.childrens);
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('cost').patchValue(obj.cost);
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('quantity').patchValue(daydiff);

              var totalcost = Number(obj.cost) * Number(daydiff);
              ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('totalcost').patchValue(totalcost);
            }
          }
          index++;
        });
      }
    }
  }

  changeValue(item : FormGroup , i){
    console.log("item",item);
    ((this.form.get('occupants') as FormArray).at(i) as FormGroup).get('totalcost').patchValue(( item.value.cost * item.value.quantity));
  }

  resortTypeChange(item: any, index: any) {
    var checkins = this.form.get("checkin").value && this.form.get("checkin").value._d ? this.form.get("checkin").value._d : this.form.get("checkin").value;
    var checkouts = this.form.get("checkout").value && this.form.get("checkout").value._d ? this.form.get("checkout").value._d : this.form.get("checkout").value;
    var checkin = new Date(checkins);
    var checkout = new Date(checkouts);

    if (!checkin) {
      this.form.get("checkin").setValue(new Date())
      checkin = new Date();
    }

    if (!checkout) {
      var date = new Date();
      date.setDate(date.getDate() + 1);
      this.form.get("checkin").setValue(date)
      checkout = date;
    }

    var startDate = moment(checkin, "DD.MM.YYYY");
    var endDate = moment(checkout, "DD.MM.YYYY");

    var daydiff = endDate.diff(startDate, 'days');

    var obj = this.resortTypeLists.find(p => p.roomtype.toLowerCase() == item.value.toLowerCase())

    if (obj) {
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('itemid').patchValue(obj.itemid._id);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('adults').patchValue(obj.adults);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('childrens').patchValue(obj.childrens);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('cost').patchValue(obj.cost);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('quantity').patchValue(daydiff);
      var totalcost = Number(obj.cost) * Number(daydiff);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('totalcost').patchValue(totalcost);
    }
  }

  private _resortfilter(value: string): any[] {

    let results, filterresults;
    if (value) {
      results = this.allResortLists.filter(option => {
        if (option.resortname || (option.location && option.location.locationname)) {
          return option.resortname.toLowerCase().indexOf(value.toLowerCase()) === 0 || option.location.locationname.toLowerCase().indexOf(value.toLowerCase()) === 0
        } else {
          return;
        }
      });

      filterresults = this.groupBy(results, "location", "locationname");
      if (results.length < 1) {
        filterresults = [];
      }
    } else {
      filterresults = this.resortList.slice();
    }
    return filterresults;
  }



  ngAfterViewInit() {
  }

  async LoadData() {
    this.isLoading = true;

    if(this.isMemberLogin){
      this.customerIds = this._loginUserId;
      this.form.get('customerid').disable();
      this.form.get('locationid').setValidators([Validators.required]);
      this.form.get('locationid').updateValueAndValidity();
    }else{
      this.form.get('resortid').setValidators([Validators.required]);
      this.form.get('resortid').updateValueAndValidity();
    }
    this.getResort();
    await this.getContactLists();
    await this.getTaxes();

    if (this.bindId) {
      this.visible = false;
      await this.getBookingByid(this.bindId);
    } else {
      this.visible = true;
    }
    this.isLoading = false;
  }

  async getTaxes() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    await this._taxesService
      .getByAsyncFilter(postData)
      .then((data: any[]) => {
        this.taxesList = data;
      });
  }

  async getResort(id?: any) {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    if (id)
      postData["search"].push({ "searchfield": "location", "searchvalue": id, "criteria": "eq", "datatype": 'ObjectId' });

     this._resortService
      .GetByfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resort: any[]) => {
        this.resortList = [];
        this.resortfilteredOptions = of([]);

        if (resort && resort.length > 0) {
          resort.map(a => a.img = a.property.images.length > 0 && a.property.images[0]["attachment"] ? a.property.images[0]["attachment"] : "../../assets/img/default-avatar.png");
          this.allResortLists = [];
          this.allResortLists = resort;
          this.resortList = [];
          this.resortList = this.groupBy(resort, "location", "locationname");
          this.resortfilteredOptions = of(this.resortList);
        }
      },(e) => {
        console.error(e);
      });
  }

  async getBookingByid(id: any) {
    await this._bookingService
      .AsyncGetById(id)
      .then((data: any) => {
        if (data.customerid) {
          var customeid = data.customerid && data.customerid._id ? data.customerid._id : data.customerid;
          var customerObj = this.contactLists.find(p => p._id == customeid);
          if (customerObj) {
            this.form.get('customerid').setValue(customerObj);
            this.selectedCustomer = customerObj;
          }
        }

        if (data.locationid) {
          this.form.controls['locationid'].setValue(data.locationid);
          this.locationfields.dbvalue = data.locationid;
        }
        
        if (data.resortid) {
          this.resortTypeLists = [];
          this.resortTypeLists = data.resortid.tariff && data.resortid.tariff.length > 0 ? data.resortid.tariff : [];
          this.form.controls['resortid'].setValue(data.resortid);
        }
        if (data.property && data.property) {
          this.bindIdData = {};
          this.bindIdData = data.property;
        }

        this.form.controls['checkin'].setValue(data.checkin);
        this.form.controls['checkout'].setValue(data.checkout);
        this.form.controls['totalrooms'].setValue(data.bookingdetail.totalrooms);

        this.roomtypes_fieldsArray = [];
        if (data.bookingdetail.occupants && data.bookingdetail.occupants.length > 0) {
          let control = <FormArray>this.form.controls.occupants;
          control.clear();

          for (let i = 0; i < data.bookingdetail.occupants.length; i++) {
            var id = data.bookingdetail.occupants[i].itemid && data.bookingdetail.occupants[i].itemid._id ? data.bookingdetail.occupants[i].itemid._id : null;
            control.push(
              this.fb.group({
                'itemid': [id],
                'occupanttype': [data.bookingdetail.occupants[i].occupanttype, !this.isMemberLogin  ? Validators.required : null],
                'adults': [data.bookingdetail.occupants[i].adults],
                'childrens': [data.bookingdetail.occupants[i].childrens],
                'cost': [data.bookingdetail.occupants[i].cost],
                'quantity': [data.bookingdetail.occupants[i].quantity],
                'totalcost': [data.bookingdetail.occupants[i].totalcost]
              })
            );
            if (!data.resortid) {
              var obj = Object.assign({}, this.roomtypes_fields)
              // obj['dbvalue'] = data.bookingdetail.occupants[i].occupanttype;
              obj['dbvalue'] = id;
              this.roomtypes_fieldsArray[i] = obj;
            }
          }
        }
        if (data.property && data.property.reservation) {
          this.form.controls['reservation'].setValue(data.property.reservation);

          this.reservationtypes_fields.visible = false

          setTimeout(() => {
            this.reservationtypes_fields.dbvalue = data.property.reservation;
            this.reservationtypes_fields.visible = true
          });

        }
        if (data.property && data.property.guest) {
          this.form.controls['guest'].setValue(data.property.guest);
        }

        if (data.property && data.property.taxes) {
          this.form.controls['taxes'].setValue(data.property.taxes);
        }
        this.form.controls['charges'].setValue(data.charges);

        if (data.status && (data.status == 'confirmed' || data.status == 'cancelled')) {
          this.disableButton = true;
        }
        this.visible = true;
      });
  }

  chooseRoom(room: number) {
    let control = <FormArray>this.form.controls.occupants;
    var tempArray = [];
    if (control.value.length < room) {
      for (let i = 1; i <= room; i++) {
        if (i > control.value.length) {
          control.push(
            this.fb.group({
              itemid: [],
              occupanttype: [, !this.isMemberLogin  ? Validators.required : null],
              adults: [],
              childrens: [],
              cost: [],
              quantity: [],
              totalcost: []
            })
          );
        }
        var obj = Object.assign({}, this.roomtypes_fields)
        tempArray.push(obj);
      }
    } else {
      for (let i = control.value.length; i > room; i--) {
        control.removeAt(i - 1);
        var obj = Object.assign({}, this.roomtypes_fields)
        tempArray.push(obj);
      }
    }
    this.roomtypes_fieldsArray = [];
    this.roomtypes_fieldsArray = tempArray;
  }

  displayFn(pkg: any): string {
    return pkg && pkg.resortname ? pkg.resortname : '';
  }

  async Save(model?: BookingModel) {
    return await this._bookingService.AsyncAdd(model);
  }

  async Update(id?: any, model?: BookingModel) {
    return await this._bookingService.AsyncUpdate(id, model);
  }

  ActionCall() { }
  Delete() { }

  cancelBooking() {

    var model = {};
    model['status'] = 'cancelled';
    this.disableButton = true;
    this._bookingService
      .AsyncUpdatePT(this.bindId, model)
      .then((data) => {
        super.showNotification("top", "right", "Booking cancelled successfully !!", "success");
        this.disableButton = false;
        this.cancelbookingform();
      }).catch((e) => {
        console.log("e", e);
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        this.disableButton = false;
      });
  }


  async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }

    value = this.form.getRawValue();
    this.bookingModel = value;

    this.bookingModel.customerid = value.customerid._id;

    if (this.selectedCustomer.type == 'M') {
      this.bookingModel.onModel = "Member";
    } else if (this.selectedCustomer.type == 'C') {
      this.bookingModel.onModel = "Prospect";
    } else if (this.selectedCustomer.type == 'U') {
      this.bookingModel.onModel = "User";
    } else {
      this.bookingModel.onModel = "Member";
    }

    this.bookingModel.bookingdetail = {};
    this.bookingModel.bookingdetail['occupants'] = [];
    this.bookingModel.bookingdetail['occupants'] = value.occupants;

    if (value.resortid && value.resortid._id) {
        this.bookingModel.locationid = value.resortid.location._id;
        this.bookingModel.resortid = value.resortid;
    } else {
      this.bookingModel.resortid = null;
      this.bookingModel.locationid = value.locationid._id;
      this.bookingModel.bookingdetail['occupants'].map((a) => {
        a.itemid = a.occupanttype && a.occupanttype.autocomplete_id ? a.occupanttype.autocomplete_id : null;
        a.occupanttype = a.occupanttype && a.occupanttype.itemname ? a.occupanttype.itemname : null;
      });
    }

    if (this.bookingModel.property) {
      this.bookingModel.property['taxes'] = value.taxes;
      if (value.reservation && value.reservation.autocomplete_id) {
        this.bookingModel.property['reservation'] = value.reservation.autocomplete_id;
      }
      this.bookingModel.property['guest'] = value.guest;
      this.bookingModel.property['notes'] = value.notes;
    } else {
      this.bookingModel.property = {};
      this.bookingModel.property['taxes'] = value.taxes;
      if (value.reservation && value.reservation.autocomplete_id) {
        this.bookingModel.property['reservation'] = value.reservation.autocomplete_id;
      }
      this.bookingModel.property['guest'] = value.guest;
      this.bookingModel.property['notes'] = value.notes;
    }


    this.bookingModel.charges = value.charges;

    this.bookingModel.bookingdetail['totalrooms'] = value.occupants.length;
    this.bookingModel.bookingdetail['bookingcost'] = value.occupants.map(item => item.totalcost).reduce((prev, next) => prev + next);
    this.bookingModel.bookingdetail['totaladults'] = value.occupants.map(item => item.adults).reduce((prev, next) => prev + next);
    this.bookingModel.bookingdetail['totalchildrens'] = value.occupants.map(item => item.childrens).reduce((prev, next) => prev + next);
    this.bookingModel.bookingdetail['totalnights'] = value.occupants.map(item => item.quantity).reduce((prev, next) => prev + next);

    this.bookingModel.status = this.status;
    this.disableButton = true;
    // console.log("this.bookingModel",this.bookingModel);
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.bookingModel);
      } else {
        res = await this.Update(this.bindId, this.bookingModel);
      }
      // console.log("res",res);
      $("#qtyClose").click();
      if (this.status == 'confirmed') {
        var billid = res.billid._id;
        this._router.navigate(['/pages/event/booking-payment/' + billid]);
      } else {
        if (this.isMemberLogin) {
          this._router.navigate(['/pages/dynamic-list/list/mybooking']);
        } else {
          this._router.navigate(['/pages/dynamic-list/list/booking']);
        }
      }
      super.showNotification("top", "right", "Booking saved successfully  !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
      this._router.onSameUrlNavigation = 'reload';
    }
  }
  cancelbookingform() {
    if (this.isMemberLogin) {
      this._router.navigate(['/pages/dynamic-list/list/mybooking']);
    } else {
      this._router.navigate(['/pages/dynamic-list/list/booking']);
    }
  }


  onlinePay() {
    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?bookingid=${this.bindId}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }
 
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  displayCusFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }


  groupBy(collection: any, property: any, property1: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property][property1];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

}
