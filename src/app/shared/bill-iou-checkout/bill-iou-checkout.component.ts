import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { BillService } from '../../core/services/sale/bill.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
    selector: 'app-bill-iou-checkout',
    templateUrl: './bill-iou-checkout.component.html',
})

export class BillIOUCheckoutComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

    destroy$: Subject<boolean> = new Subject<boolean>();

    @Input() outstandingamount: boolean;
    @Input() searchMember: any;
    @Output() onBack = new EventEmitter();
    @Output() onMakePayment = new EventEmitter();

    displayedColumns: string[] = ["docnumber", "billdate", "totalamount", "balance", "status", "action"];
    unpaidbillList: any[] = [];

    isLoading: boolean = false;

    constructor(
        private _billService: BillService,
    ) {
        super();
        this.pagename = 'bill-iou-checkout';
        this.isLoading = true;
    }

    async ngOnInit() {

        await super.ngOnInit();
        this.getunpaidBills()
    }

    getunpaidBills() {

        if (this.searchMember && this.searchMember._id) {
            let postData = {};
            postData['search'] = [];
            postData['search'].push({ "searchfield": "customerid", "searchvalue": this.searchMember._id, "criteria": "eq", "datatype": "ObjectId" });
            postData['search'].push({ "searchfield": "status", "searchvalue": { "$ne": "Paid" }, "criteria": "eq", "datatype": "text" });

            this.isLoading = true;
            this._billService
                .GetByfilter(postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                  console.log("data", data)
                    this.isLoading = false;
                    this.unpaidbillList = data;
                });
        }

    }

    onCancel() {
        this.onBack.emit("back");
    }

    makePayment(item: any) {
        this.onMakePayment.emit(item);
    }


    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }


}
