import { Component, OnInit, Input } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contacts-timeline',
  templateUrl: './contacts-timeline.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(300, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(300, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
})
export class ContactsTimelineComponent extends BaseLiteComponemntComponent implements OnInit{

  destroy$: Subject<boolean> = new Subject<boolean>();

  postData: any = {};

  pageSize = 10;
  currentPage: number = 1;
  historyList: any[] = [];
  isLoading: boolean = false;
  disableBtn: boolean = true;


  Object = Object;
  selectedMessage: string = "";
  selectedSection: any;

  myControl = new FormControl();
  options: string[] = ['Membership', 'Enquiry', 'Member', 'Payment', 'Wallet', 'Appointment'];
  filteredOptions: Observable<string[]>;
  filterSearch = [];

  selectedUpdate: any = {};

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename="app-member-timeline";
  }

  @Input() dataContent: any;
  @Input() context: any;
  @Input() schema: any;
  
  
  async ngOnInit() {

    await super.ngOnInit();

    try {
      await this.initVariables()
      await this.getActivities();
    } catch(error) {
      console.error(error)
    } finally {
    }

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initVariables() {
    this.historyList = [];
    this.isLoading = false;
    this.postData = {};
    this.pageSize = 10;
    this.currentPage = 1;
    this.filterSearch = [];
    this.selectedUpdate = {};
    return;
  }

  async getActivities() {

    this.postData = {};
    this.postData["search"] = [];
    this.postData["search"].push({ searchfield: "customerid", searchvalue: this.dataContent._id, datatype: "ObjectId", criteria:"eq"  });
    this.postData["pageNo"] = this.currentPage;
    this.postData["size"] = this.pageSize;

    if(this.filterSearch && this.filterSearch.length > 0) {
      this.filterSearch.forEach(element => {
        this.postData["search"].push(element);
      });
    }

    var method = "POST";
    var url = this.schema + "/filter/timeline/view";

    this.isLoading = true;
    this.disableBtn = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.postData)
      .then((data: any) => {
        if (data) {
          
          data.forEach(element => {
            this.historyList.push(element);
          });
          this.isLoading = false;
          this.disableBtn = false;
          return;
        }
      }, (error)=>{
        console.error(error);
    });
  }

  changePage(pageNumber: number): void {
    this.currentPage = Math.ceil(pageNumber);
    this.getActivities();
  }

  onSelectValue(selectPageSize: number) {
    this.pageSize = selectPageSize;
    if (this.historyList.length != 0) {
      this.currentPage = 1;
      this.getActivities();
    }
  }

  getClass(preclass: any, item: any) {
    var classList = '';
    if (item.messagetype == 'memberships' ||item.messagetype == 'enquiries' ) {
      classList = 'success';
    } else if (item.messagetype == 'members') {
      classList = 'info';
    } else if (item.messagetype == 'payments') {
      classList = 'danger';
    } else if (item.messagetype == 'wallets') {
      classList = 'warning';
    } else if (item.messagetype == 'appointments') {
      classList = 'success';
    }
    return preclass + classList;
  }

  clickMore(item: any) {
    this.selectedMessage = item.message;
    this.selectedUpdate = {};
    this.selectedUpdate = item;
    this.selectedSection = null;
    if (Object.keys(item.section).length > 0) {
      this.selectedSection = item.section;
    }
  }

  onClickbutton() {
    var skp = this.postData['matches'].find(a => a.searchfield == 'skip');
    var limit = this.postData['matches'].find(a => a.searchfield == 'limit');
    skp['searchvalue'] += limit['searchvalue'];
    this.getActivities();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  optionSelected(option) {
    this.myControl.setValue(option.value);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "messagetype", searchvalue: this.myControl.value, datatype: "String", criteria:"eq" });
      this.getActivities();
    }
  }

  enter() {
    const controlValue = this.myControl.value;
    this.myControl.setValue(controlValue);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "messagetype", searchvalue: this.myControl.value, datatype: "String", criteria:"eq" });
      this.getActivities();
    }
  }

  handleEmptyInput(event: any){
    if(event.target.value === '') {
      this.myControl.setValue("");
      this.filterSearch = [];
      this.historyList = [];
      this.currentPage = 1;
      this.getActivities();
    }
  }

}
