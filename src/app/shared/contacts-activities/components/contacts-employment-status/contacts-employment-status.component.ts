import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import 'rxjs/add/operator/debounceTime';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';

declare var $: any;
@Component({
  selector: 'app-contacts-employment-status',
  templateUrl: './contacts-employment-status.component.html'
})
export class ContactsEmploymentStatusComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  employmentstatus = new FormControl();
  manager = new FormControl();
  employmentstatusList: any[] = [];
  managerList: any[] = [];
  employeeisLoadingBox: boolean = false;
  filteredOptionsEmploymentStatus: Observable<string[]>;
  filteredOptionsManager: Observable<string[]>;

  form: FormGroup;
  submitted: boolean;
  isLoadingBox: boolean = false;
  isLoading: boolean = false;
  btnDisable: boolean = false;
  lookupDetail: any;
  selectedEmploymentStatus: any = {};

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _lookupService: LookupsService) {
    super();
    this.form = fb.group({
      'employmentstatus': [, Validators.required],
      'manager': [],
      'lastworkingdate': [new Date()]
    });
  }

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() formname: any;
  @Output() onCloseEmplymentStatusData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.getUsers();
      await this.getEmploymentStatus();
      await this.getAllEmploymentStatus();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    } finally {
    }

    this.filteredOptionsEmploymentStatus = this.employmentstatus.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._filterEmploymentStatus(option) : this.employmentstatusList.slice())
      );

    this.filteredOptionsManager = this.manager.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._filterManager(option) : this.managerList.slice())
      );
  }

  protected getEmploymentStatus() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "Employment Status", "criteria": "eq", "datatype": "string" });

    this._lookupService
      .GetByfilterLookupName(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lookupData: any[]) => {

        this.lookupDetail = lookupData[0];
        this.employmentstatusList = this.lookupDetail['data'];
      });
  }

  async getAllEmploymentStatus() {
    let method = "GET";
    let url = "users/" + this.dataContent._id;

    let postData = {};
    postData["search"] = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.selectedEmploymentStatus = data;
          if (this.selectedEmploymentStatus?.property?.employmentstatus) {
            this.form.controls['employmentstatus'].setValue({ name: this.selectedEmploymentStatus.property.employmentstatus, code: this.selectedEmploymentStatus.property.employmentstatus });
          }
          this.form.controls['lastworkingdate'].setValue(this.selectedEmploymentStatus.property.lastworkingdate);
          const fullname = this.managerList.find(a => a.fullname == this.selectedEmploymentStatus.property.manager);
          this.form.controls['manager'].setValue(fullname);
        }
      }, (error) => {
        this.btnDisable = false;
        this.isLoading = false;
        console.error(error);
      });
  }

  async getUsers() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.dataContent._id, "criteria": "ne", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.dataContent._id, "criteria": "ne" });

    let url = "users/filter";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {
          this.managerList = [];
          this.managerList = data;
        }
      });
  }

  private _filterEmploymentStatus(value: string): string[] {
    let results;
    if (value) {
      results = this.employmentstatusList
        .filter(option => {
          if (option.name) {
            return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.employmentstatusList.slice();
    }
    return results;
  }

  private _filterManager(value: string): string[] {
    let results;
    if (value) {
      results = this.managerList
        .filter(option => {
          if (option.fullname) {
            return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.managerList.slice();
    }
    return results;
  }

  async onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      super.showNotification("top", "right", "Fill required fields !!", "danger");
      return;
    } else {
      let method = "PATCH";
      let url = "users/" + this.dataContent._id;

      let postData = {};
      postData["property"] = {};
      postData["property"] = this.dataContent.property;
      postData["property"]["employmentstatus"] = value.employmentstatus.name;
      postData["property"]["lastworkingdate"] = value.lastworkingdate;
      postData["property"]["manager"] = value.manager.fullname;
      this.btnDisable = true;
      this.isLoading = true;

      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(data => {
          if (data) {
            this.btnDisable = false;
            this.isLoading = false;
            this.onCloseEmplymentStatusData.emit({ type: "success" });
            this.showNotification('top', 'right', 'Employment Status has been saved successfully!!!', 'success');
          }
        }, (error) => {
          this.btnDisable = false;
          this.isLoading = false;
          console.error(error);
        });
    }
  }

  lastworkingdateChange(date: any) {
    if (!date || !date._d) {
      super.showNotification("top", "right", "Select date !!", "danger");
      return;
    }
    var date1 = new Date(date._d);
  }

  displayEmployeeFn(emp: any): string {
    return emp && emp.name ? emp.name : '';
  }

  displaymanagerFn(emp: any): string {
    return emp && emp.fullname ? emp.fullname : '';
  }

  handleEmptyEmployeeInput(event: any) {
    if (event.target.value === '') {
      this.employmentstatus.setValue("");
      this.employmentstatusList = [];
    }
  }

  handleEmptyManagerInput(event: any) {
    if (event.target.value === '') {
      this.manager.setValue("");
      this.managerList = [];
    }
  }

  async preloaddata() {
    if (this.employmentstatusList.length == 0) {
      await this.getEmploymentStatus()
    }
  }

  async preloadmanagerdata() {
    if (this.managerList.length == 0) {
      await this.getUsers()
    }
  }
}
