import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-service-products',
  templateUrl: './service-products.component.html'
})
export class ServiceProductComponent extends BaseLiteComponemntComponent implements OnInit ,OnChanges{

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() productList: any[];
  @Input() bindId: any;
  @Input() formName: any;
  @Input() updatePage : any[] = [];
  @Output() submittedData = new EventEmitter();

  treePostData: any;
  displayedColumns3: string[] = ['item', 'action'];
  isProductOpen: boolean = false;
  disableBtn: boolean = false;
   

  periodList: string[] = ['Package duration', 'Yearly', 'Half-Yearly', 'Quarterly', 'Monthly' ];

  

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-service-products";
  }
 
  async ngOnInit() {
    super.ngOnInit();
    
    this.productList.map(a=>{a.item = a.itemname;a.fromdb = true});
  }


  async ngOnChanges() {
    
    if (this.updatePage && this.updatePage.includes('Product')) {
      if(this.productList.length > 0){
        this.productList.map(a=> {
            if(a && a._id){
                a.item = a.itemname;
                a.fromdb = true;
            }
            });
        }
   }
 } 
  

  onClickPrdt() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.isProductOpen = !this.isProductOpen;
  }

  onSelectTree(event: any[]) {
    this.productList = [];
    if(event.length > 0){
      event.map(a => a.fromdb = false);
      if (event.length > 0) {
        this.productList = event.filter(a=>a.level > 0);
      }
    }
    let dataSource = this.productList;
    let cloned = dataSource.slice();
    this.productList = cloned;
    this.isProductOpen = !this.isProductOpen;
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
    model['items'] = this.dataContent['items'];
    if (model['items'] != []) {
      model['items'] = [];
    }
    
    model['items'] = [...this.productList].map(a => a._id);
    let url = "services/";
    let method = "PUT";
    this.disableBtn = true;

      
    this._commonService
       .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
         .then((data)=>{
             super.showNotification("top", "right", "Product updated successfully !!", "success");
             this.disableBtn = false;
             this.submittedData.emit('success');
       });
    } catch (e) {
      console.log("e",e)
      this.disableBtn = false;
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
          var ind = this.productList.findIndex(a => a._id == item._id);
          this.productList.splice(ind, 1);

          var model = {};
          model = this.dataContent;
          model['items'] = [];

          model['items'] = [...this.productList].map(a => a._id);

          let url = "services/";
          let method = "PUT";

          this.disableBtn = true;
          this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
            .then((data) => {
              super.showNotification("top", "right", "Record deleted successfully !!", "success");
              this.disableBtn = false;
              this.submittedData.emit('success');
            });
        } catch (e) {
          this.disableBtn = false;
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
