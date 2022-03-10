import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';

import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
    selector: 'app-inventory-table',
    templateUrl: './inventory-table.component.html',
})

export class InventoryTableComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit {
    destroy$: Subject<boolean> = new Subject<boolean>();

    @Input() isSale: boolean;
    @Input() isAdjustment: boolean;
    @Input() paidamount: number = 0;   // need to do with billid
    @Input() balance: number = 0;  // need to do with billid

    public setitemsList: any[] = [];
    public emtyItems: object = {};

    public subtotal: number = 0;
    public discount: number = 0;
    public taxamount: number = 0;
    public grandtotal: number = 0;
    public grandtotaltmp: number = 0;
    public adjustment: number = 0;
    public taxList: any[] = [];

    isLoading: boolean = false;

    billfields = {
        "fieldname": "item",
        "fieldtype": "form",
        "fieldfilter": "status",
        "fieldfiltervalue": "active",
        "method": "POST",
        "modelValue": "item",
        "form": {
            "apiurl": "billitems/filter/view",
            "formfield": "_id",
            "displayvalue": "itemname",
        },
        "search": [
            { searchfield: "status", searchvalue: "active", criteria: "eq" , "datatype" : "text" },
            { searchfield: "enableinventory", searchvalue: true, criteria: "eq" , "datatype"  : "boolean" },
        ],
        "value": "",
        "dbvalue": ""
    }

    constructor(
        private cdr: ChangeDetectorRef,
        private _commonService: CommonService,
    ) {
        super();
        this.pagename = 'inventory-table';
    }

    async ngOnInit() {
        await super.ngOnInit();
    }

    ngAfterViewInit() {
        this.emtyItems = {
            'quantity': 1,
            'index': this.setitemsList.length
        };
        this.setitemsList.push(this.emtyItems);
    }

    protected inputModelChangeValue(emit: any, item: any) {
        if (!item.isdbvalue) {
            if (emit && emit._id) {
                this.setitemsList.map(element => {
                    if (element.index == item.index) {
                        element.item = emit;
                        element.quantity = 1;
                        element.index = item.index;
                        element.itemid = emit._id; 
                        element.isdbvalue = false;
                        element.itemname = emit.itemname;
                        element.cost = this.isSale ? emit.sale.rate : emit.purchase.rate;
                        element.sale = emit.sale;
                        element.purchase = emit.purchase;
                    }
                });
                if (this.setitemsList.length == (item.index + 1)) {
                    this.emtyItems = {
                        'quantity': 1,
                        'index': this.setitemsList.length
                    };
                    this.setitemsList.push(this.emtyItems);
                }
                this.countTblCost();
            }
        } else {
            item.isdbvalue = false;
        }
    }

    protected changeTblQty(event: any, item: any) {
        let ind = item.index;
        this.setitemsList.map(element => {
            if (element.index == ind) {
                element.quantity = event;
            }
        });
        this.countTblCost();
    }

    protected tblDeleteItem(item: any) {
        this.setitemsList.splice(item.index, 1);
        this.setitemsList.map((ai, ind) => ai.index = ind);
        this.countTblCost();
    }

    private countTblCost() {
        let api = this.isSale ? 'bills/billdetail' : 'purchaseinvoices/invoicedetail';
        let method = 'POST';

        var model = {};
        model['items'] = this.setitemsList.filter(a => a.itemid);

        this.isLoading = true;

        this._commonService
            .commonServiceByUrlMethodData(api, method, model)
            .pipe(takeUntil(this.destroy$))
            .subscribe((resData: any) => {
                this.taxamount = resData.taxamount;
                this.subtotal = resData.billamount;
                this.grandtotal = resData.grandtotal;
                this.discount = resData.discount;
                this.isLoading = false;
            });
    }

    protected setAdjustment() {
        setTimeout(() => {
            this.grandtotal = this.grandtotaltmp;
            this.grandtotal += this.adjustment ? this.adjustment : 0;
        }, 1000);
    }

    public setTableWithItem(items: any[]) {
        this.setitemsList = [];
        items.forEach((itemEle, ind) => {
            let obj = {
                'item': itemEle.item,
                'quantity': itemEle.quantity,
                'index': ind,
                'itemid': itemEle.item._id,
                'dbvalue': itemEle.item,
                'isdbvalue': true,
                'itemname': itemEle.item.itemname,
                'cost' :  this.isSale ? itemEle.item.sale.rate : itemEle.item.purchase.rate,
                'sale' : itemEle.item.sale,
                'purchase': itemEle.item.purchase,
            }
            this.setitemsList.push(obj);
        });
        this.setitemsList.push({ quantity: 1, index: this.setitemsList.length });
        this.countTblCost();
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

}
