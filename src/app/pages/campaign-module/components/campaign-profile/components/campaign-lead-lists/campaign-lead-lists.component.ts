import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';


import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../../core/services/common/common.service';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-campaign-lead-lists',
  templateUrl: './campaign-lead-lists.component.html',
  styles: [
    `
      .mat-form-field {
  font-size: 14px;
  width: 100%;
}
    `
  ]
})
export class CampaignLeadListsComponent extends BaseLiteComponemntComponent  implements OnInit {

  leadHeading: string[] = ['select', 'email', 'fullname','handler', 'mobile', 'stage', 'action' ];
  leadLists = [];

  @Input() dataContent: any;
  @Output() onLeadData: EventEmitter<any> = new EventEmitter<any>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  desginationWiseUser: any [] = [];
  isSalesHead: boolean = false;

  isLoading: boolean = false;

  defaultHandler: any;


  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  isButtonEnable: boolean = true;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  constructor(
    private _commonService: CommonService
  ) { 
    super()
    this.pagename = "app-campaign-lead-lists";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.loadData()
      if(this.dataContent.saleschannelteams) await this.getSaleChannelTeams()
    } catch(error) {
      console.error(error);
    } finally {
      
      this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.leadLists = [];
    this.desginationWiseUser = [];
    this.isSalesHead = false;
    this.isLoading = false;
    this.defaultHandler = '';
    return;
  }

  async loadData() {

    if(this.dataContent.teamhead && this.dataContent.teamhead == this._loginUserId) {
      this.leadLists = this.dataContent.leads;
    } else {
      this.dataContent.leads.forEach(element => {
        if(element.handlerid == this._loginUserId) {
          this.leadLists.push(element);
        }
      });
    }


    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.leadLists);
    this.selection = new SelectionModel(true, []);
    this.isButtonEnable = true;
    this.selection.changed.subscribe(item => {
      this.isButtonEnable = this.selection.selected.length == 0;
    });
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    return;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  async getSaleChannelTeams() {

    if(this.dataContent.saleschannelteams && this.dataContent.saleschannelteams.channels && this.dataContent.saleschannelteams.channels.length > 0) {
      this.desginationWiseUser = [];
      await this.makeHierarchy(this.dataContent.saleschannelteams.channels);
    } else {
      let method = "POST";
    let url = "saleschannelteams/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.dataContent.saleschannelteams._id ? this.dataContent.saleschannelteams._id : this.dataContent.saleschannelteams, "datatype": "ObjectId", "criteria":"eq" });

    

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any)=>{
        if(data) {
          this.desginationWiseUser = [];
          if(data[0].channels && data[0].channels.length !== 0) {
            await this.makeHierarchy(data[0].channels)
          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })
    }

    
  }

  async makeHierarchy(channels: any) {

    channels.forEach(element => {

      if(element.head == null) {
        if(element.userid._id == this._authService.currentUser.user._id) {
          this.isSalesHead = true;
        }
      }

      if(element.designationid) {
        if(!this.desginationWiseUser[element.designationid._id]) {
          this.desginationWiseUser[element.designationid._id] = [];
          this.desginationWiseUser[element.designationid._id]['desginationid'] = {};
          this.desginationWiseUser[element.designationid._id]['userid'] = [];
          this.desginationWiseUser[element.designationid._id]['desginationid'] = element.designationid;
        }

        let obj: any;
        obj = this.desginationWiseUser[element.designationid._id]['userid'].find(p => p._id == element.userid._id);
        if (!obj) {
          this.desginationWiseUser[element.designationid._id]['userid'].push(element.userid);
          this.options.push(element.userid.fullname)
        }
      }
    })

    
  }

  async AllocateHandler() {

    this.isLoading = true;

    if(this.defaultHandler == "" || this.defaultHandler.length == 0) {
      this.showNotification('top', 'right', 'please select at least one handler!', 'danger');
      return;
    }

    console.log("this.defaultHandler", this.defaultHandler);

    if(this.selection.selected.length !== 0) {

      var selected = [];

      this.selection.selected.forEach(element  => {
        if(element ['_id']) {
          selected.push(element ['_id']);
        }
      });

      let method = "POST";
      let url = "enquiries/updatemultienquiries";
  
      let postData = {}
      postData['enquiries'] = selected;
      postData['handlerid'] = this.defaultHandler;
      postData['actions'] = "update";
  
      //console.log("postData", postData);
      
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any)=>{
          if(data) {            
            this.isLoading = false;
            this.defaultHandler = [];
            this.showNotification('top', 'right', 'Promotion has been updated successfully!!', 'success');
            this.onLeadData.emit();
            return;
          }
        }, (error)=>{
          console.error(error);
        })

    } else {
      this.showNotification('top', 'right', 'please select at least one promotion!', 'danger');
    }
  }

  redirect(item: any) {
    
    this._router.navigate(['/pages/lead-module/profile/'+ item._id], { queryParams: { tab: 'log' } });
  }

  delete(data) {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this  file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.removepromotion(data._id);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your  file is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  removepromotion(id: any) {

    let method = "DELETE";
    let url = "enquiries/";

    this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
      .then((data: any) => {
        if (data) {
          super.showNotification("top", "right", "Enquiry has delete successfully !!", "success");
          this.onLeadData.emit();
        }
      }).catch((e) => {
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  optionSelected(option: any) {
    this.dataSource.filter = option.value.trim().toLowerCase();
  }

  handleEmptyInput(event: any){
    if(event.target.value === '') {
      this.dataSource.filter = event.target.value.trim().toLowerCase();
    }
  }

  deleteAll() {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
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
        varTemp.action();
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your record is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  action() {
    var selected = [];
    if (this.selection.selected.length !== 0) {

      this.selection.selected.forEach(element => {
        if (element['_id']) {
          selected.push(element['_id']);
        }
      });

      let postData = {};
      let url = "common/massupdate";
      let method = "POST";

      postData["schemaname"] = "enquiries";
      postData["ids"] = selected;
      postData["fieldname"] = "status";
      postData["fieldvalue"] = "deleted";
      postData["datatype"] = "text";

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {
            this.showNotification('top', 'right', 'Mass Delete has been done successfully!!!', 'success');
            this.onLeadData.emit();
          }
        }, (err) => {
        })
    }
  }

  convertToMember(element: any) {

    const varTemp = this;

    swal.fire({
      title: `Are you sure want to convert to Member ?`,
      text: 'You will not be able to recover this Action !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Convert it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {

      if (result.value) {

        let postData =  {};
        let method = "PUT";
        var url = "members/enquiryconverttomember/"+ element._id;

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any)=>{
            if(data) {

              swal.fire({
                title: 'Success',
                text: 'enquiry has been Converted Successfully!!!.',
                icon: 'success',
                customClass:{
                  confirmButton: "btn btn-success",
                },
                buttonsStyling: false
              });

              
              varTemp._router.navigate(['/pages/members/conversion//' + data._id]);
              return;
            }
          }, (error)=>{
            console.error(error);
        })


      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Action is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }

    })

    
    
    

  }
}