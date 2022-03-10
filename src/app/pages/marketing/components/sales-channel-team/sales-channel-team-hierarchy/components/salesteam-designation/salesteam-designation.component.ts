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
	@Output() updateSalesChannelNd: EventEmitter<any> = new EventEmitter<any>();
	userList: any[] = ['user1', 'user2'];
	addSTeamUser(tempid: any) {
		this.updateSalesChannelNd.emit(tempid);
	}
}
