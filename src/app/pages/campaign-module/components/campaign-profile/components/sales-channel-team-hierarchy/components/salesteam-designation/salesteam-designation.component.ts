import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ISalesTeam } from '../../sales-channel-team-hierarchy.component';


@Component({
	selector: 'oc-salesteam-designation',
	templateUrl: './salesteam-designation.component.html',
	styleUrls: ['./salesteam-designation.component.css']
})
export class SalesteamdesignationComponent {
	@Input() salesDesignation: ISalesTeam;
	@Input() hasManager = false;
	
}
