import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from "@angular/router";

import { ManagerService } from '../_services/manager.service';
import { SpinnerService } from '../_services/spinner.service';
import { Web3Service } from '../_services/web3.service';

@Component({
  selector: 'site-comp',
  templateUrl: './site.component.html'
})
export class SiteComponent {

  public environment = environment
  public no_cache: number = Math.floor(Math.random() * 999999)

  constructor(
    private router: Router,
    public web3Service: Web3Service,
    public managerService: ManagerService,
    public spinnerService: SpinnerService,
  ) {}

  navigate_to_block(id:any): void {
    if (id) {
      this.router.navigate(['block', id])
    }
  }

}