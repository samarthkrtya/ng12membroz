import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTab } from '@angular/material/tabs';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';
import { D } from '@angular/cdk/keycodes';
import { MatTableDataSource } from '@angular/material/table';

declare var $: any;

@Component({
  selector: 'app-cancellation-policy',
  templateUrl: './cancellation-policy.component.html',
  styles: []
})
export class CancellationPolicyComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  appointmentform: FormGroup;
  isAppointmentEditMode: boolean;
  appointmentsetting: any[] = [];
  selectedAppointmentSetting: any = {};
  showDiv: boolean;
  lookupDetail: any;

  cancellationform: FormGroup;
  cancellationreasonform: FormGroup;
  cancellationsubmitted: boolean;
  isCancellationEditMode: boolean;
  cancellationpolicy: any[] = [];
  selectedCancellationPolicy: any;
  applyToList: string[] = ['All Customer', 'All Member'];
  cancellationReasonsList: any[] = [];
  cancellationdataSource = new MatTableDataSource;

  paymentform: FormGroup;
  paymentitemform: FormGroup;
  taxform: FormGroup;
  paymentsubmitted: boolean;
  isPaymentEditMode: boolean;
  paymentsetting: any[] = [];
  selectedPaymentSetting: any;
  membershipPaymentItemsList: any;
  taxList: any;
  paymentdataSource = new MatTableDataSource;
  taxdataSource = new MatTableDataSource;
  displayedTaxColumns: string[] = ['taxname', 'taxrate', 'action'];
  displayedTaxWithoutEditColumns: string[] = ['taxname', 'taxrate'];
  displayedPaymentItemColumns: string[] = ['itemname', 'action'];
  displayedPaymentItemWithoutEditColumns: string[] = ['itemname'];

  btnDisable: boolean;
  submitted: boolean;
  isLoadingData: boolean;
  action: any;
  displayedColumns: string[] = ['name', 'action'];

  constructor(private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _lookupService: LookupsService,
  ) {
    super();

    this.appointmentform = this.fb.group({
      'allowAppointmentsToEndAfterYourLocationOfficalClosingTime': ['', Validators.required],
      'overageduration': [],
      'allowAppointmentInThepast': ['', Validators.required],
      'allowResourceOverbooking': ['', Validators.required],
      'allowStaffConcurrency': ['', Validators.required],
      //'requireStaffonAvailabilitySearch': ['', Validators.required],
      'enableAutoPackageDetection': [],
      'enableNoShowAlert': ['', Validators.required],
      'showAlertwhenacustomerhas': ['', Validators.required],
      'enableStaffDependentPricingAndDurations': [],
      // 'enableCheckin': ['', Validators.required],
      'enableLockStafftoRoom': ['', Validators.required],
      //  'enableStaffbookingonoffdays': ['', Validators.required],
    });

    this.cancellationform = this.fb.group({
      'applyto': ['', Validators.required],
      'applycancellationfeewithin': ['', Validators.required],
      'cancellationfee': ['', Validators.required],
      'noshowfee': ['', Validators.required],
      'enablecancellationreasons': ['', Validators.required],
      'cancellationpolicytext': ['', Validators.required],
      'cancellationreasons': [],
    });

    this.paymentform = this.fb.group({
      'acceptchecks': ['', Validators.required],
      'acceptcash': ['', Validators.required],
      'acceptcreditcard': ['', Validators.required],
      'cardtypes': this.fb.group({
        'rupay': [{ value: 'false' }],
        'master': [{ value: 'false' }],
        'visa': [{ value: 'false' }],
      }),
      'mappartner': [],
      'requirebillingaddressforonlinepurchages': [],
      'requirepostalcodeforcardtransactionsequaloraboveacertainamount': [],
      //'requirepostalcodewhenordercontainsagiftcardorgiftcertificate': ['', Validators.required],
      'acceptgiftcards': ['', Validators.required],
      'enablecashbackforgiftcertificatebalance': ['', Validators.required],
      // 'expiregiftcertificates': ['', Validators.required],
      'applytaxon': [],
      'inactivein': [],
      //  'allowrefunds': ['', Validators.required],
      //   'prepaidinactivein': ['', Validators.required],
      'allowdiposit': ['', Validators.required],
      'pmstype': [],
      'enableach': [],
      'enablepaypal': [],
      'paypalmobilepayments': [],
      'utilizeglobalsettings': [],
      // 'allowordertobesplit': ['', Validators.required],
      //'enablepointsminutes': ['', Validators.required],
      'enabletipsgratuityforServices': ['', Validators.required],
      'autotransfertipstopayouts': ['', Validators.required],
      'enableservicecharge': ['', Validators.required],
      //'paymentmethod': ['', Validators.required],
      //'tipscalculatorpercentagebasedon': ['', Validators.required],
      'membershippaymentitems': [],
      'tax': [],
      'creditnote': ['', Validators.required],
    });


    this.cancellationreasonform = new FormGroup({
      ind: new FormControl(),
      name: new FormControl('', Validators.required),
    });

    this.paymentitemform = new FormGroup({
      ind: new FormControl(),
      id: new FormControl(),
      itemname: new FormControl('', Validators.required),
    });

    this.taxform = new FormGroup({
      ind: new FormControl(),
      id: new FormControl(),
      taxname: new FormControl('', Validators.required),
      taxrate: new FormControl('', Validators.required),
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getCancellationReasons();
      await this.getCancellationPolicy();
      await this.getAppointmentSetting();
      await this.getPaymentSetting();
      await this.getPaymentItems();
      await this.getTaxes();
      await this.setCancellationPolicyData();
      this.isLoadingData = false;
    } catch (error) {
      console.error(error);
      this.isLoadingData = false;
    } finally {
    }
  }

  async initializeVariables() {
    this.isCancellationEditMode = false;
    this.isAppointmentEditMode = false;
    this.isPaymentEditMode = false;
    this.showDiv = false;
    this.action = "appointmentsettings";
    return;
  }

  onAppointmentEdit() {
    this.isLoadingData = true;
    this.isLoadingData = false;
    this.isAppointmentEditMode = true;
  }

  onAppointmentCancel() {
    this.isAppointmentEditMode = false;
  }

  onCancellationEdit() {
    this.isLoadingData = true;
    this.isLoadingData = false;
    this.isCancellationEditMode = true;
  }

  onCancellationCancel() {
    this.isCancellationEditMode = false;
  }

  onPaymentEdit() {
    this.isLoadingData = true;
    this.isLoadingData = false;
    this.isPaymentEditMode = true;
  }

  onPaymentCancel() {
    this.isPaymentEditMode = false;
  }

  async onTabChanged(mattab: MatTab) {
    this.action = mattab.textLabel.toLowerCase();
  }

  async getAppointmentSetting() {
    let method = "GET";
    let url = "branches/" + this._loginUserBranchId;

    let postData = {};
    postData["search"] = [];
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.isLoadingData = true;
          this.appointmentsetting = data && data["appointmentsetting"] ? data["appointmentsetting"] : null;
          if (this.appointmentsetting == null) {
            this.isAppointmentEditMode = true;
          }
          else {
            this.isAppointmentEditMode = false;
            this.selectedAppointmentSetting = this.appointmentsetting;
            this.appointmentform.controls['allowAppointmentsToEndAfterYourLocationOfficalClosingTime'].setValue(this.selectedAppointmentSetting?.allowAppointmentsToEndAfterYourLocationOfficalClosingTime ? this.selectedAppointmentSetting?.allowAppointmentsToEndAfterYourLocationOfficalClosingTime : 'Yes');
            this.appointmentform.controls['overageduration'].setValue(this.selectedAppointmentSetting?.overageduration ? this.selectedAppointmentSetting?.overageduration : '5 Hours');
            this.appointmentform.controls['allowAppointmentInThepast'].setValue(this.selectedAppointmentSetting?.allowAppointmentInThepast ? this.selectedAppointmentSetting?.allowAppointmentInThepast : 'Yes');
            this.appointmentform.controls['allowResourceOverbooking'].setValue(this.selectedAppointmentSetting?.allowResourceOverbooking ? this.selectedAppointmentSetting?.allowResourceOverbooking : 'Yes');
            this.appointmentform.controls['allowStaffConcurrency'].setValue(this.selectedAppointmentSetting?.allowStaffConcurrency ? this.selectedAppointmentSetting?.allowStaffConcurrency : 'Yes');
            //this.appointmentform.controls['requireStaffonAvailabilitySearch'].setValue(this.selectedAppointmentSetting?.requireStaffonAvailabilitySearch);
            // this.appointmentform.controls['enableAutoPackageDetection'].setValue(this.selectedAppointmentSetting?.enableAutoPackageDetection);
            this.appointmentform.controls['enableNoShowAlert'].setValue(this.selectedAppointmentSetting?.enableNoShowAlert ? this.selectedAppointmentSetting?.enableNoShowAlert : 'Yes');
            this.appointmentform.controls['showAlertwhenacustomerhas'].setValue(this.selectedAppointmentSetting?.showAlertwhenacustomerhas ? this.selectedAppointmentSetting?.showAlertwhenacustomerhas : '1');
            // this.appointmentform.controls['enableStaffDependentPricingAndDurations'].setValue(this.selectedAppointmentSetting?.enableStaffDependentPricingAndDurations);
            //this.appointmentform.controls['enableCheckin'].setValue(this.selectedAppointmentSetting?.enableCheckin);
            this.appointmentform.controls['enableLockStafftoRoom'].setValue(this.selectedAppointmentSetting?.enableLockStafftoRoom ? this.selectedAppointmentSetting?.enableLockStafftoRoom : 'Yes');
            //this.appointmentform.controls['enableStaffbookingonoffdays'].setValue(this.selectedAppointmentSetting?.enableStaffbookingonoffdays);
            this.isLoadingData = false;

            return;
          }
        }
      }, (error) => {
        console.error(error);
      })
  }

  public async onAppointmentSubmit(value: any, valid: boolean) {
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    } else {

      let postData = {};
      postData["appointmentsetting"] = {};
      postData["appointmentsetting"]["allowAppointmentsToEndAfterYourLocationOfficalClosingTime"] = value.allowAppointmentsToEndAfterYourLocationOfficalClosingTime;
      postData["appointmentsetting"]["overageduration"] = value.overageduration;
      postData["appointmentsetting"]["allowAppointmentInThepast"] = value.allowAppointmentInThepast;
      postData["appointmentsetting"]["allowResourceOverbooking"] = value.allowResourceOverbooking;
      postData["appointmentsetting"]["allowStaffConcurrency"] = value.allowStaffConcurrency;
      //postData["appointmentsetting"]["requireStaffonAvailabilitySearch"] = value.requireStaffonAvailabilitySearch;
      // postData["appointmentsetting"]["enableAutoPackageDetection"] = value.enableAutoPackageDetection;
      postData["appointmentsetting"]["enableNoShowAlert"] = value.enableNoShowAlert;
      postData["appointmentsetting"]["showAlertwhenacustomerhas"] = value.showAlertwhenacustomerhas;
      // postData["appointmentsetting"]["enableStaffDependentPricingAndDurations"] = value.enableStaffDependentPricingAndDurations;
      //postData["appointmentsetting"]["enableCheckin"] = value.enableCheckin;
      postData["appointmentsetting"]["enableLockStafftoRoom"] = value.enableLockStafftoRoom;
      //postData["appointmentsetting"]["enableStaffbookingonoffdays"] = value.enableStaffbookingonoffdays;

      let method = "PATCH";
      let url = "branches/" + this._loginUserBranchId;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            super.showNotification("top", "right", "Appointment Settings Made successfully !!", "success");
            this.ngOnInit();
            return;
          }
        }, (error) => {
          console.error(error);
        })
    }
  }

  protected getCancellationReasons() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": ["cancellation reason"], "criteria": "in", "datatype": "string" });

    this._lookupService
      .GetByfilterLookupName(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lookupData: any[]) => {
        this.lookupDetail = lookupData[0];
        this.cancellationReasonsList = lookupData.find(a => a.lookup == "cancellation reason")['data'];
      });
  }

  async getCancellationPolicy() {
    let method = "GET";
    let url = "branches/" + this._loginUserBranchId;

    let postData = {};
    postData["search"] = [];
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.isLoadingData = true;
          this.cancellationpolicy = data && data["cancellationpolicy"] ? data["cancellationpolicy"] : null;
          if (this.cancellationpolicy == null) {
            this.isCancellationEditMode = true;
          }
          else {
            this.isCancellationEditMode = false;
            this.selectedCancellationPolicy = this.cancellationpolicy;
            this.cancellationform.controls['applyto'].setValue(this.selectedCancellationPolicy?.applyto);
            this.cancellationform.controls['applycancellationfeewithin'].setValue(this.selectedCancellationPolicy?.applycancellationfeewithin);
            this.cancellationform.controls['cancellationfee'].setValue(this.selectedCancellationPolicy?.cancellationfee);
            this.cancellationform.controls['noshowfee'].setValue(this.selectedCancellationPolicy?.noshowfee);
            this.cancellationform.controls['enablecancellationreasons'].setValue(this.selectedCancellationPolicy?.enablecancellationreasons ? this.selectedCancellationPolicy?.enablecancellationreasons : 'Yes');
            this.cancellationform.controls['cancellationpolicytext'].setValue(this.selectedCancellationPolicy?.cancellationpolicytext);
            this.cancellationform.controls['cancellationreasons'].setValue(this.selectedCancellationPolicy?.cancellationreasons);
            this.isLoadingData = false;
            return;
          }
        }
      }, (error) => {
        console.error(error);
      })
  }

  public async onCancellationSubmit(value: any, valid: boolean) {
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    } else {

      let postData = {};
      postData["cancellationpolicy"] = {};
      postData["cancellationpolicy"]["applyto"] = value.applyto;
      postData["cancellationpolicy"]["applycancellationfeewithin"] = value.applycancellationfeewithin;
      postData["cancellationpolicy"]["cancellationfee"] = value.cancellationfee;
      postData["cancellationpolicy"]["noshowfee"] = value.noshowfee;
      postData["cancellationpolicy"]["enablecancellationreasons"] = value.enablecancellationreasons;
      postData["cancellationpolicy"]["cancellationpolicytext"] = value.cancellationpolicytext;
      postData["cancellationpolicy"]["cancellationreasons"] = value.cancellationreasons;

      let method = "PATCH";
      let url = "branches/" + this._loginUserBranchId;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            super.showNotification("top", "right", "Cancellation Policy Made successfully !!", "success");
            this.ngOnInit();
            return;
          }
        }, (error) => {
          console.error(error);
        })
    }
  }

  public async onCancellationReasonSubmit(value: any, valid: boolean) {
    this.submitted = true;
    var operationStr: string = "";
    if (!valid) return;
    if (value['ind'] != null && value['ind'] >= 0) {
      this.cancellationReasonsList.splice(value['ind'], 1, { name: value['name'], code: value['name'] })
      operationStr = "update";
    } else {
      this.cancellationReasonsList.push({ name: value['name'], code: value['name'] });
      operationStr = "added";
    }
    let url = 'lookups';
    let method = 'PATCH';

    var model = {};
    model['data'] = this.cancellationReasonsList;

    this.btnDisable = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.lookupDetail._id)
      .then(async (data: any) => {
        this.btnDisable = false;
        this.submitted = false;
        super.showNotification("top", "right", `${this.capitalizeFirstLetter(this.lookupDetail?.lookup)}  ${operationStr} successfully !!`, "success");
        $("#close").click();
        this.cancellationreasonform.reset();
        await this.getCancellationReasons();
        await this.setCancellationPolicyData();
      }).catch((e) => {
        console.error("e", e);
        this.btnDisable = false;
        this.submitted = false;
        $("#close").click();
      });
  }

  CancellationReasonCancel() {
    this.cancellationreasonform.reset();
    this.submitted = false;
  }

  async setCancellationPolicyData() {
    this.cancellationdataSource = new MatTableDataSource();
    this.cancellationdataSource = new MatTableDataSource(this.cancellationReasonsList);
    return;
  }

  deleteCancellationReasonAction(i: number) {
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

        let url = 'lookups';
        let method = 'PATCH';
        var model = {};

        this.cancellationReasonsList.splice(i, 1);
        model['data'] = this.cancellationReasonsList;

        this.btnDisable = true;
        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, this.lookupDetail._id)
          .then(async (data: any) => {
            this.btnDisable = false;
            super.showNotification("top", "right", `${this.capitalizeFirstLetter(this.lookupDetail?.lookup)} deleted successfully !!`, "success");
            // await this.getCancellationReasons();
            await this.setCancellationPolicyData();
          }).catch((e) => {
            console.error("e", e);
            this.btnDisable = false;
          });
      }
    });
  }

  async getPaymentItems() {
    let method = "POST";
    let url = "paymentitems/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {

        if (data) {
          this.membershipPaymentItemsList = data;
          this.paymentdataSource = new MatTableDataSource();
          this.paymentdataSource = new MatTableDataSource(this.membershipPaymentItemsList);
        }
      }, (error) => {
        console.error(error);
      })
  }

  async getPaymentSetting() {
    let method = "GET";
    let url = "branches/" + this._loginUserBranchId;

    let postData = {};
    postData["search"] = [];
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.isLoadingData = true;
          this.paymentsetting = data && data["paymentsetting"] ? data["paymentsetting"] : null;
          if (this.paymentsetting == null) {
            this.isPaymentEditMode = true;
          }
          else {
            this.isPaymentEditMode = false;
            this.selectedPaymentSetting = this.paymentsetting;

            this.paymentform.controls['acceptchecks'].setValue(this.selectedPaymentSetting?.acceptchecks ? this.selectedPaymentSetting?.acceptchecks : 'Yes');
            this.paymentform.controls['acceptcash'].setValue(this.selectedPaymentSetting?.acceptcash ? this.selectedPaymentSetting?.acceptcash : 'Yes');
            this.paymentform.controls['acceptcreditcard'].setValue(this.selectedPaymentSetting?.acceptcreditcard ? this.selectedPaymentSetting?.acceptcreditcard : 'Yes');

            var cardtypes = this.paymentform.controls['cardtypes'] as FormGroup;
            cardtypes.get('rupay').setValue(this.selectedPaymentSetting?.cardtypes?.rupay);
            cardtypes.get('master').setValue(this.selectedPaymentSetting?.cardtypes?.master);
            cardtypes.get('visa').setValue(this.selectedPaymentSetting?.cardtypes?.visa);
            this.paymentform.controls['mappartner'].setValue(this.selectedPaymentSetting?.mappartner);
            //this.paymentform.controls['requirebillingaddressforonlinepurchages'].setValue(this.selectedPaymentSetting?.requirebillingaddressforonlinepurchages);
            this.paymentform.controls['requirepostalcodeforcardtransactionsequaloraboveacertainamount'].setValue(this.selectedPaymentSetting?.requirepostalcodeforcardtransactionsequaloraboveacertainamount);
            //this.paymentform.controls['requirepostalcodewhenordercontainsagiftcardorgiftcertificate'].setValue(this.selectedPaymentSetting?.requirepostalcodewhenordercontainsagiftcardorgiftcertificate);
            this.paymentform.controls['acceptgiftcards'].setValue(this.selectedPaymentSetting?.acceptgiftcards ? this.selectedPaymentSetting?.acceptgiftcards : 'Yes');
            this.paymentform.controls['enablecashbackforgiftcertificatebalance'].setValue(this.selectedPaymentSetting?.enablecashbackforgiftcertificatebalance ? this.selectedPaymentSetting?.enablecashbackforgiftcertificatebalance : 'Yes');
            // this.paymentform.controls['expiregiftcertificates'].setValue(this.selectedPaymentSetting?.expiregiftcertificates);
            this.paymentform.controls['applytaxon'].setValue(this.selectedPaymentSetting?.applytaxon);
            this.paymentform.controls['inactivein'].setValue(this.selectedPaymentSetting?.inactivein);
            //this.paymentform.controls['allowrefunds'].setValue(this.selectedPaymentSetting?.allowrefunds);
            //this.paymentform.controls['prepaidinactivein'].setValue(this.selectedPaymentSetting?.prepaidinactivein);
            this.paymentform.controls['allowdiposit'].setValue(this.selectedPaymentSetting?.allowdiposit ? this.selectedPaymentSetting?.allowdiposit : 'Yes');
            this.paymentform.controls['pmstype'].setValue(this.selectedPaymentSetting?.pmstype);
            this.paymentform.controls['enableach'].setValue(this.selectedPaymentSetting?.enableach);
            this.paymentform.controls['enablepaypal'].setValue(this.selectedPaymentSetting?.enablepaypal);
            this.paymentform.controls['paypalmobilepayments'].setValue(this.selectedPaymentSetting?.paypalmobilepayments);
            this.paymentform.controls['utilizeglobalsettings'].setValue(this.selectedPaymentSetting?.utilizeglobalsettings);
            //this.paymentform.controls['allowordertobesplit'].setValue(this.selectedPaymentSetting?.allowordertobesplit);
            //this.paymentform.controls['enablepointsminutes'].setValue(this.selectedPaymentSetting?.enablepointsminutes);
            this.paymentform.controls['enabletipsgratuityforServices'].setValue(this.selectedPaymentSetting?.enabletipsgratuityforServices ? this.selectedPaymentSetting?.enabletipsgratuityforServices : 'Yes');
            this.paymentform.controls['autotransfertipstopayouts'].setValue(this.selectedPaymentSetting?.autotransfertipstopayouts ? this.selectedPaymentSetting?.autotransfertipstopayouts : 'Yes');
            this.paymentform.controls['enableservicecharge'].setValue(this.selectedPaymentSetting?.enableservicecharge ? this.selectedPaymentSetting?.enableservicecharge : 'Yes');
            //this.paymentform.controls['paymentmethod'].setValue(this.selectedPaymentSetting?.paymentmethod);
            //this.paymentform.controls['tipscalculatorpercentagebasedon'].setValue(this.selectedPaymentSetting?.tipscalculatorpercentagebasedon);
            this.paymentform.controls['creditnote'].setValue(this.selectedPaymentSetting?.creditnote ? this.selectedPaymentSetting?.creditnote : 'Yes');

            this.isLoadingData = false;
            return;
          }
        }
      }, (error) => {
        console.error(error);
      })
  }

  public async onPaymentSubmit(value: any, valid: boolean) {

    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    } else {

      let postData = {};
      postData["paymentsetting"] = {};
      postData["paymentsetting"]["acceptchecks"] = value.acceptchecks;
      postData["paymentsetting"]["acceptcash"] = value.acceptcash;
      postData["paymentsetting"]["acceptcreditcard"] = value.acceptcreditcard;
      postData["paymentsetting"]["cardtypes"] = value.cardtypes;
      postData["paymentsetting"]["mappartner"] = value.mappartner;
      postData["paymentsetting"]["requirebillingaddressforonlinepurchages"] = value.requirebillingaddressforonlinepurchages;
      postData["paymentsetting"]["requirepostalcodeforcardtransactionsequaloraboveacertainamount"] = value.requirepostalcodeforcardtransactionsequaloraboveacertainamount;
      //postData["paymentsetting"]["requirepostalcodewhenordercontainsagiftcardorgiftcertificate"] = value.requirepostalcodewhenordercontainsagiftcardorgiftcertificate;
      postData["paymentsetting"]["acceptgiftcards"] = value.acceptgiftcards;
      postData["paymentsetting"]["enablecashbackforgiftcertificatebalance"] = value.enablecashbackforgiftcertificatebalance;
      postData["paymentsetting"]["expiregiftcertificates"] = value.expiregiftcertificates;
      postData["paymentsetting"]["applytaxon"] = value.applytaxon;
      postData["paymentsetting"]["inactivein"] = value.inactivein;
      //postData["paymentsetting"]["allowrefunds"] = value.allowrefunds;
      postData["paymentsetting"]["prepaidinactivein"] = value.prepaidinactivein;
      postData["paymentsetting"]["allowdiposit"] = value.allowdiposit;
      postData["paymentsetting"]["pmstype"] = value.pmstype;
      postData["paymentsetting"]["enableach"] = value.enableach;
      postData["paymentsetting"]["enablepaypal"] = value.enablepaypal;
      postData["paymentsetting"]["paypalmobilepayments"] = value.paypalmobilepayments;
      postData["paymentsetting"]["utilizeglobalsettings"] = value.utilizeglobalsettings;
      postData["paymentsetting"]["allowordertobesplit"] = value.allowordertobesplit;
      //postData["paymentsetting"]["enablepointsminutes"] = value.enablepointsminutes;
      postData["paymentsetting"]["enabletipsgratuityforServices"] = value.enabletipsgratuityforServices;
      postData["paymentsetting"]["autotransfertipstopayouts"] = value.autotransfertipstopayouts;
      postData["paymentsetting"]["enableservicecharge"] = value.enableservicecharge;
      //postData["paymentsetting"]["paymentmethod"] = value.paymentmethod;
      //postData["paymentsetting"]["tipscalculatorpercentagebasedon"] = value.tipscalculatorpercentagebasedon;
      postData["paymentsetting"]["creditnote"] = value.creditnote;

      let method = "PATCH";
      let url = "branches/" + this._loginUserBranchId;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            super.showNotification("top", "right", "Payment Settings Made successfully !!", "success");
            this.ngOnInit();
            return;
          }
        }, (error) => {
          console.error(error);
        })
    }
  }

  public async onPaymentItemSubmit(value: any, valid: boolean) {

    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    let url = "paymentitems";
    const id = value.id;
    let method = id ? "PUT" : "POST";

    let postData = {};
    postData["search"] = [];
    postData["paymentitemname"] = value.itemname
    postData["property"] = {};
    postData["property"]["paymentitemname"] = value.itemname;
    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          if (value.id) {
            super.showNotification("top", "right", "Payment item has been update successfully !!", "success");
            this.membershipPaymentItemsList = data;
          } else {
            super.showNotification("top", "right", "Payment item has been add successfully !!", "success");
            this.membershipPaymentItemsList = data;
          }
          this.paymentitemform.reset();
          $("#modalPaymentItemBtn").click();
          this.getPaymentItems();
          this.btnDisable = false;

        }
      }, (error) => {
        console.error(error);
        this.btnDisable = false
      })
  }

  editPaymentItemAction(data) {
    this.paymentitemform.controls['itemname'].setValue(data.paymentitemname);
    this.paymentitemform.controls['id'].setValue(data._id);
    $("#modalPaymentItemBtn").click();
  }

  deletePaymentItemAction(data) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this  file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        let method = "DELETE";
        let url = "paymentitems/";
        this.btnDisable = true;

        this._commonService
          .commonServiceByUrlMethodIdOrDataAsync(url, method, data._id)
          .then(async (data: any) => {
            if (data) {
              this.btnDisable = false;
              super.showNotification("top", "right", "Payment Item has delete successfully !!", "success");
              await this.getPaymentItems();
            }
          }).catch((e) => {
            this.btnDisable = false;
          });
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your  file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }


  PaymentItemCancel() {
    this.paymentitemform.reset();
    this.paymentitemform.controls['itemname'].setValue('');
    this.submitted = false;
  }


  async getTaxes() {
    let method = "POST";
    let url = "taxes/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.taxList = data;
          this.taxdataSource = new MatTableDataSource([]);
          this.taxdataSource = new MatTableDataSource(this.taxList);
        }
      }, (error) => {
        console.error(error);
      })
  }

  public onTaxSubmit(value: any, valid: boolean) {
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }

    let url = "taxes";
    const id = value.id;
    let method = id ? "PUT" : "POST";

    let postData = {};
    postData["search"] = [];
    postData["taxname"] = value.taxname
    postData["amount"] = value.taxrate
    postData["property"] = {};
    postData["property"]["taxname"] = value.taxname;
    postData["property"]["amount"] = value.taxrate;
    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          if (value.id) {
            super.showNotification("top", "right", "Tax has been updated successfully !!", "success");
          } else {
            super.showNotification("top", "right", "Tax has been added successfully !!", "success");
          }
          this.taxform.reset();
          $("#modalTaxBtn").click();
          this.getTaxes();
          this.btnDisable = false;
        }
      }, (error) => {
        console.error(error);
        this.btnDisable = false;
      })
  }

  editTaxesAction(data) {
    this.taxform.controls['id'].setValue(data._id);
    this.taxform.controls['taxname'].setValue(data.taxname);
    this.taxform.controls['taxrate'].setValue(data.amount);
    $("#modalTaxBtn").click();
  }

  async deleteTaxesAction(data) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this  file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        let method = "DELETE";
        let url = "taxes/";
        this.btnDisable = true;

        this._commonService
          .commonServiceByUrlMethodIdOrDataAsync(url, method, data._id)
          .then(async (data: any) => {
            if (data) {
              this.btnDisable = false;
              super.showNotification("top", "right", "Tax  has delete successfully !!", "success");
              await this.getTaxes();
            }
          }).catch((e) => {
            this.btnDisable = false;
          });
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your  file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }


  TaxCancel() {
    this.taxform.reset();
    this.taxform.controls['taxname'].setValue('');
    this.taxform.controls['taxrate'].setValue('');
    this.submitted = false;
  }

  capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
  }

}
