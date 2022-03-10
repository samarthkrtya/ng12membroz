import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';



@Component({
  selector: 'app-inspection-assets',
  templateUrl: './inspection-assets.component.html',
  styles: [
  ]
})
export class InspectionAssetsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
