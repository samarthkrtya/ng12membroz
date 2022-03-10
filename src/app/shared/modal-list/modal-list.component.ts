import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
@Component({
  selector: 'app-modal-list',
  templateUrl: './modal-list.component.html',
})
export class ModalListComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() displayTxt: string;
  @Input() postData : any;
  @Input() id: string;
  @Input() headers: string;
  

  @Output() onCancel = new EventEmitter();

  target  : string;
  dataList : any[] =[];

  isLoading : boolean = false;
  
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private _commonService : CommonService, 
    
  ) {
    super()
  }

  async ngOnInit() {
    this.isLoading = true;
    await super.ngOnInit();
    try {
      this.target = this.displayTxt.replace(' ', '');
      await this.initializeVariables();
      await this.getHistory();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
   
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  clickPP() {
    $("#" + this.id).click();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() { 
    
    return;
  }

 async getHistory(){
  const method = "POST";
  const url = "histories/filter/view";

  await this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, this.postData)
    .then((data: any)=>{
      this.dataList = [];
      this.dataList = data;
    });
  }

  cancel(){
    this.onCancel.emit('success');
  }
  

}
