import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-global-confirmation',
  templateUrl: './global-confirmation.component.html',
})
export class GlobalConfirmationComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() myForm: FormGroup;
  @Input() mySubmitted: boolean;
  @Input() bindIdData: any;

  @Input() displayTxt: string;
  @Input() fieldTxt: string;

  myModal: string;
  @Input() id: string;
  
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super()
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.initializeVariables();
    } catch (error) {
    }
  }

  ngAfterViewInit() {
    if (!this.fieldTxt) {
      this.fieldTxt = 'notes';
    }
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
    this.myModal = this.displayTxt;
    return;
  }

}
