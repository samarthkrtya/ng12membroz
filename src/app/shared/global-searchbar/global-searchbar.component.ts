


import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, finalize, map, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

import { CommonService } from '../../core/services/common/common.service';
import { FormsService } from '../../core/services/forms/forms.service';

import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-global-searchbar',
  templateUrl: './global-searchbar.component.html',
  styles: [
    `
      .example-action-buttons {
      padding-bottom: 20px;
    }

    .example-headers-align .mat-expansion-panel-header-title,
    .example-headers-align .mat-expansion-panel-header-description {
      flex-basis: 0;
    }

    .example-headers-align .mat-expansion-panel-header-description {
      justify-content: space-between;
      align-items: center;
    }

    .example-headers-align .mat-form-field + .mat-form-field {
      margin-left: 8px;
    }

    .example-form {
      min-width: 150px;
      max-width: 500px;
      width: 100%;
    }

    .example-full-width {
      width: 100%;
    }

    .example-option-img {
      vertical-align: middle;
      margin-right: 8px;
    }

    [dir='rtl'] .example-option-img {
      margin-right: 0;
      margin-left: 8px;
    }
    `
  ]
})
export class GlobalSearchbarComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  actionLists: any[] = [];
  formLists: any[] = [];
  

  selectedAction: any;

  myControl = new FormControl();
  filteredOptions: any;
  contactLists: string[] = [];
  isLoading: boolean = false;

  @Input() actionListsValue : string[] = [];
  @Output() onSelectOption: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _commonService: CommonService,
    private _formsService: FormsService,
  ) {
    super()
  }

  async ngOnInit() {
    await super.ngOnInit();

    try {
      await this.initializeVariables()
      await this.getFormDetails();
      //await this.getContactLists();
    } catch (error) {
    }

    this.myControl.valueChanges
      .pipe(
        debounceTime(500),
        tap((item)=>{
          this.filteredOptions = [];
          if(item.length > 2) {
            this.isLoading = true;
          } else {
            this.isLoading = false;
          }
        }),
        switchMap((value) => 
          value.length > 2
          ? this._commonService.searchContact(value, 1)
            .pipe(
              finalize(() => {
                this.isLoading = false
              }),
            )
          : []
        )
      )
      .subscribe(data => {
        this.filteredOptions = [];
        this.filteredOptions = data;
      });


  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.actionLists = [];
    // this.actionLists = ["member", "prospect", "user"];

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0 && this.actionListsValue && this.actionListsValue.length > 0) {
      this.actionListsValue.forEach(element => {
        var permissionObj = this._loginUserRole.permissions.find(p => p.formname == element)
        if(permissionObj && permissionObj.recordpermission && permissionObj.recordpermission.length > 0) {
          var recordPermissionObj = permissionObj.recordpermission.find(p => p.type == "view")
          if(recordPermissionObj) {
            this.actionLists.push(element);
          }
        }
      });
    }
    

    
    this.formLists = [];
    this.contactLists = [];
    this.isLoading = false;
    this.selectedAction = this.actionLists && this.actionLists[0] ? this.actionLists[0] : "member";
    
    return;
  }

  async getFormDetails() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "formname", searchvalue: this.actionLists, criteria: "in" });
    postData["search"].push({ searchfield: "status", searchvalue: "active", criteria: "eq" });

    return this._formsService
      .GetByfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.formLists = data;
          if (data && data[0]) {
            this.selectedAction = data[0]["formname"];
          }
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
      });
  }


  changeAction(item: any) {
    this.selectedAction = item.formname;
    this.contactLists = [];
    this.myControl.setValue("");
    //this.getContactLists();
  }

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
    }
  }

  optionSelected(option: any) {
    this.selectedAction = option.value.type == 'M' ? 'member' : option.value.type == 'C' ?  'prospect' : option.value.type == 'U'  ?  'user' :  null;
    option.value['selectedAction'] = this.selectedAction;
    this.myControl.setValue(option.value);
    this.onSelectOption.emit(option.value);
    // this.getRedirect(this.myControl.value._id)
  }

  getformDisplayName(formname: any) {
    var formObj = this.formLists.find(p => p.formname == formname);
    if (formObj && formObj.dispalyformname) return formObj.dispalyformname;
    return formname;
  }

  getRedirect(id: any) {
    if (this.selectedAction == "prospect") {
      this._router.navigate(['/pages/customer-module/profile/' + id]);
    } else if (this.selectedAction == "member") {
      this._router.navigate(['/pages/members/profile/' + id]);
    } else if (this.selectedAction == "user") {
      this._router.navigate(['/pages/user/profile/' + id]);
    }

  }
}
