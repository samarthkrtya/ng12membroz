import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute} from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { FormGroup,FormControl,FormBuilder} from '@angular/forms';
import { InventoriesModel } from 'src/app/core/models/inventories/inventories.model';

@Component({
  selector: 'app-manage-stock',
  templateUrl: './manage-stock.component.html',
  styleUrls: ['./manage-stock.component.css']
})
export class ManageStockComponent extends BaseComponemntComponent implements OnInit {
  stockform:FormGroup;
  inventoriesList:any[]=[];
  _inventoriesModel = new InventoriesModel();
  datalist:any;
  isDisable: boolean = false;

  constructor(public FormBuilder:FormBuilder) 
  {
    super(); 

    this.stockform =  FormBuilder.group({   
      'triggerqty':[this._inventoriesModel.triggerqty],    
  })
   }

  async ngOnInit(){
    this.isDisable = false;
    this.getinventories();
  }

  getinventories()
  {
    var url = "inventories/filter";
    var method = "POST";
    let postData = {};
    this._commonService.commonServiceByUrlMethodData(url,method,postData).subscribe(datas=>{

      if (datas) {
        this.datalist = datas;
        
       this.datalist.forEach(element => {
          let obj = {
            _id: element._id,
            itemid:element.itemid,
            tableId: element._id,
            //invId: element.itemid._id,
            unit: element.itemid.unit,
            name: (element.itemid.itemname).toLowerCase(),
            qty: 1,
            inventoryqty: element.stock,
            maininventoryqty: element.stock,
            rate: element.itemid.sale && element.itemid.sale.rate ? (parseFloat(element.itemid.sale.rate)) : 0,
            totalrate: element.itemid.sale && element.itemid.sale.rate ? (parseFloat(element.itemid.sale.rate)) : 0,
            discount: element.itemid.sale && element.itemid.sale.discount ? (parseFloat(element.itemid.sale.discount)) : 0,
            totaldiscount: element.itemid.sale && element.itemid.sale.discount ? (parseFloat(element.itemid.sale.discount)) : 0,
            image: element.itemid.item_logo ? element.itemid.item_logo : '../../../../../assets/img/noimage.jpg',
            offertype: element.itemid && element.itemid.offertype && element.itemid.offertype._id ? element.itemid.offertype.property.title : '',
            enableinventory: element.itemid.enableinventory,
            category: element.itemid && element.itemid.category && element.itemid.category._id ? element.itemid.category.property.title : '',
            barcode: element.itemid.barcode,
            disable: true,
            triggerqty:element.triggerqty ? element.triggerqty : null,
          }  
          this.inventoriesList.push(obj) 
          
          this.stockform.get("triggerqty").setValue(this.datalist['triggerqty']);

          }) 

        }
    })

  }
 

  onSubmit(value:any)
  {
    
    if(this.inventoriesList && this.inventoriesList.length > 0 ) {
      var cnt = 0;
      var len = this.inventoriesList.length;
      
      this.isDisable = true;

      this.inventoriesList.forEach(element => {

        var url = "inventories/" + element._id;
        var method = "PATCH";

        var postData = {};
        postData["triggerqty"] = element.triggerqty;

        this._commonService
        .commonServiceByUrlMethodData(url,method,postData)
        .subscribe(data=>{
          if(data) {

            cnt++;
            if(cnt == len) {
              
              this.isDisable = false;
              this.showNotification('top', 'right', 'Qty has been updated successfully!!!', 'success');
              this.stockform.reset();
            }
            
          }
        });

      })
    }
  }

 
}
