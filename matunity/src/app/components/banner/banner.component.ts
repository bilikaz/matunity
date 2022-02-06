import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from "@angular/router";
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';


import { BannerService } from '../../_services/banner.service';
import { Web3Service } from '../../_services/web3.service';
import { ManagerService } from '../../_services/manager.service';
import { SpinnerService } from '../../_services/spinner.service';

@Component({
  selector: 'banner-comp',
  templateUrl: './banner.component.html'
})
export class BannerComponent {

  private walletConnectionSubscriber: any

  public no_cache: number = Math.floor(Math.random() * 999999)

  public environment = environment
  public is_loading: boolean = false
  public is_owner: boolean = false
  public is_owned: boolean = true
  public show_cropper: boolean = false
  public imageChangedEvent: any = ''
  public croppedImageSrc: any = ''
  public croppedImage: any
  public block_form: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public ng_zone: NgZone, 
    public web3Service: Web3Service,
    public managerService: ManagerService,
    private bannerService: BannerService,
    public spinnerService: SpinnerService,
  ) {

    this.route.paramMap.subscribe(params => {
      this.managerService.setActivatedBanner( NaN )
      this.init()
    })
  }

  public async init() {
    this.block_form = new FormGroup({
      source: new FormControl(''),
      name: new FormControl(''),
      description: new FormControl(''),
    });
    
    this.web3Service.last_transaction = {}
    this.managerService.setActivatedBanner( Number(this.route.snapshot.paramMap.get('id')) )
    this.managerService.get_banner()

    this.walletConnectionSubscriber = this.web3Service.WalletConnectedEvent.subscribe(() => {
      this.managerService.get_banner()
    })
  } 

  public ngOnDestroy() {
    this.managerService.setActivatedBanner( NaN )  
    this.walletConnectionSubscriber.unsubscribe()
  }

  public set_name() {
    this.web3Service.set_name(this.managerService.active_banner_id, this.block_form.value.name )  
  }

  public set_description() {
    this.web3Service.set_description(this.managerService.active_banner_id, this.block_form.value.description)  
  }

  public set_data() {
    this.web3Service.set_banner_data(
      this.managerService.active_banner_id, 
      this.block_form.value.name,
      this.block_form.value.description,
      this.block_form.value.source
    ) 
    this.closeCropper()
  }

  public async mint() {
    this.web3Service.mint(this.managerService.active_banner_id)
  }

  public block_close() {
    this.router.navigate([''])
  }

  public closeCropper(): void {
    this.show_cropper = false
    this.block_form.controls.source.reset()
    this.croppedImageSrc = ''
  }

  public fileChangeEvent(event: any): void {
    this.show_cropper = true
    this.imageChangedEvent = event;
  }
  public imageCropped(event: ImageCroppedEvent) {
    this.croppedImageSrc = event.base64 
    this.block_form.controls.source.setValue(event.base64 )
  }
  public submitSrc() {
    this.web3Service.set_source(this.managerService.active_banner_id, this.block_form.value.source)  
    this.closeCropper()
  }
  public imageLoaded() {}
  public cropperReady() {}
  public loadImageFailed() {}

}