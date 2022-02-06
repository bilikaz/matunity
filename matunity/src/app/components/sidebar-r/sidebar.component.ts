import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { environment } from '../../../environments/environment';

import { Web3Service } from '../../_services/web3.service';
import { ManagerService } from '../../_services/manager.service';

@Component({
  selector: 'sidebar-right-comp',
  templateUrl: './sidebar.component.html'
})
export class SidebarRightComponent implements OnInit {

  public objectKeys = Object.keys
  public Number = Number

  public environment = environment

  constructor(
    private router: Router,
    public web3Service: Web3Service,
    public managerService: ManagerService,
  ) { }

  public async ngOnInit() {}

  navigate_to_banner(id:any): void {
    if (id) {
      this.router.navigate(['banner', id])
    }
  }

}