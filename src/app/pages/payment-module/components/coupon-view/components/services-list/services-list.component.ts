import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html'
})
export class ServiceListComponent extends BaseLiteComponemntComponent implements OnInit ,OnChanges{

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() servicesList: any[];
  @Input() bindId: any;
  @Input() formName: any;
  @Input() updatePage : any[] = [];
  @Output() submittedData = new EventEmitter();

  treePostData: any;
  displayedColumns3: string[] = ['item', 'action'];
  isProductOpen: boolean = false;
  disableBtn: boolean = false;
  isLoadingData: boolean = false;
  selectedAll: boolean = false;

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-service-asset";
  }
 
  async ngOnInit() {
    super.ngOnInit();
    this.servicesList.map(a=>{a.item = a.title;a.fromdb = true});
    this.disableBtn = !!this.dataContent?.property?.allservices;
    this.disableBtn = !!this.dataContent?.property?.applyonbill;
  }

  async ngOnChanges() { 
    if (this.updatePage && this.updatePage.includes('Service')) {
      if(this.servicesList.length > 0){
        this.servicesList.map(a=> {
          if(a && a._id){
              a.item = a.title;
              a.fromdb = true;
          }
        });
      }
      this.selectedAll  = !!this.dataContent?.property?.allservices;
   }
 }
  

  onClickPrdt() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    
    this.isProductOpen = !this.isProductOpen;
  }

  onSelectTree(event: any[]) {
    if(event.length > 0){
      event.map(a => a.fromdb = false);
      if (event.length >= this.servicesList.length) {
        event.forEach(prd => {
          var ind = this.servicesList.findIndex(a => a._id == prd._id);
          if (prd.level > 0 && ind == -1) {
            this.servicesList.push(prd);
          }
        });
      } else {
        this.servicesList.forEach((prd, i) => {
          var ind = event.findIndex(a => a._id == prd._id);
          if (prd.level > 0) {
            if (ind != -1) {
              prd = event[ind];
            } else {
              this.servicesList.splice(i, 1);
            }
          }
        });
      }
    }else{
      this.servicesList = [];
    }
    let dataSource = this.servicesList;
    let cloned = dataSource.slice();
    this.servicesList = cloned;
    this.isProductOpen = !this.isProductOpen;
  }

  async setAll(checked : boolean){
    this.servicesList = []; 
    try {
      var model = {};
      model = this.dataContent;
      model['services'] = [];
      model['property']['allservices'] = checked; 
      
      let url = "coupons/";
      let method = "PUT";
      this.disableBtn = true;
      this.isLoadingData = true;
      this._commonService
         .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
           .then((data)=>{
               super.showNotification("top", "right", "Services updated successfully !!", "success");
               this.disableBtn = false;
               this.isLoadingData = false;
               this.submittedData.emit('success');
         });
      } catch (e) {
        console.log("e",e)
        this.disableBtn = false;
        this.isLoadingData = false;
      }
  }

 async onSaveTree() {
    this.treechecklist.onSave();
    $("#close_" + this.treechecklist.for).click();
    await this.onSaveProduct();
  }

  async onSaveProduct() {
    try {
      var model = {};
      model = this.dataContent;
    
      if (model['services'] != []) {
        model['services'] = [];
      }
    
      model['services'] = [...this.servicesList].map(a => a._id);
      model['property']['allservices'] = false;
      let url = "coupons/";
      let method = "PUT";
      this.disableBtn = true;
      this.isLoadingData = true;
      this._commonService
        .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
          .then((data)=>{
              super.showNotification("top", "right", "Services updated successfully !!", "success");
              this.disableBtn = false;
              this.isLoadingData = false;
              this.submittedData.emit('success');
          });
    } catch (e) {
      console.log("e",e)
      this.disableBtn = false;
      this.isLoadingData = false;
    }
  }

  async onDelete(item: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure to Delete?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes,Delete it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        try {
          var ind = this.servicesList.findIndex(a => a._id == item._id);
          this.servicesList.splice(ind, 1);

          var model = {};
          model = this.dataContent;
          model['services'] = [];

          model['services'] = [...this.servicesList].map(a => a._id);

          let url = "coupons/";
          let method = "PUT";

          this.disableBtn = true;
          this.isLoadingData = true;
          this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
            .then((data) => {
              super.showNotification("top", "right", "Record deleted successfully !!", "success");
              this.disableBtn = false;
              this.isLoadingData = false;
              this.submittedData.emit('success');
            });
        } catch (e) {
          this.disableBtn = false;
          this.isLoadingData = false;
        }
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your event is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

}
