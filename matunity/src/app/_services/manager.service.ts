

import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../environments/environment';

import { SpinnerService } from './spinner.service';
import { BannerService } from './banner.service';
import { BlockService } from './block.service';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private interval: any
  private addressChangeSubscriber: any
  private walletConnectionSubscriber: any
  private blockDataChangeSubscriber: any

  public environment = environment
  public banners_l: any = []
  public banners_r: any = []
  public nft_blocks: any = {}
  public nft_block: any = {}
  public banner: any = {}
  public owned_nft_blocks: any = {}
  public contract_owned_nft_blocks: any = []
  public active_block_id: number=NaN
  public active_banner_id: number=NaN
  public active_block_is_owner: boolean = false
  public active_block_is_owned: boolean = true
  public active_banner_is_owner: boolean = false
  public active_banner_is_owned: boolean = true


  public board: any = []
  public player_data: any = {
    last_roll : 0,
    grid : 0,
    points : 0,
    cooldown : 0
  }
  public roll_price: number=NaN
  public game_points: number=NaN
  public grid_price: number=NaN
  public prize: String='0'
  public points_for_prize: number=NaN
  public prize_percentage: number=NaN
  public prize_pool: any = {}

  constructor(
    public ng_zone: NgZone,
    public spinnerService: SpinnerService,
    public web3Service: Web3Service,
    public bannerService: BannerService,
    public blockService: BlockService,
    private route: ActivatedRoute
  ) {}

  async init() {
    await this.web3Service.init()  
    
    this.load_data()
    this.load_initial_data(true)
    this.interval = setInterval(() => {
      this.load_data(false)
    }, this.environment.refresh);

    this.addressChangeSubscriber = this.web3Service.AddressChangedEvent.subscribe(() => {
      this.load_data()
    })
    this.walletConnectionSubscriber = this.web3Service.WalletConnectedEvent.subscribe(() => {
      this.load_data()
    })
    this.blockDataChangeSubscriber = this.web3Service.BlockDataChangedEvent.subscribe(() => {
      this.load_data()
    })
  }

  public async load_initial_data(loading_indication=true) {
    this.get_player_data(loading_indication)
    this.get_roll_price(loading_indication)
    this.get_game_points(loading_indication)
    this.get_grid_price(loading_indication)
    this.get_points_for_prize(loading_indication)
    this.get_prize_percentage(loading_indication)
    this.get_prize_pool(loading_indication)
    this.get_prize_data(loading_indication)
  }

  public async load_data(loading_indication=true) {
    this.get_banners(loading_indication)
    this.get_nft_blocks(loading_indication)
   // this.get_owned_nft_blocks(loading_indication)
  }

  public ngOnDestroy() {
    clearInterval(this.interval);
    this.addressChangeSubscriber.unsubscribe()
    this.walletConnectionSubscriber.unsubscribe()
    this.blockDataChangeSubscriber.unsubscribe()
  }

  public setActivatedBanner(id:number) {
    this.active_banner_id = id
    if (Number.isNaN(id)) this.deactivateBanner()
  }

  public setActivatedBlock(id:number) {
    this.active_block_id = id
    if (Number.isNaN(id)) this.deactivateBlock()
  }

  public deactivateBanner() {
    this.banner = {}
    this.active_banner_is_owner = false
    this.active_banner_is_owned = false
  }

  public deactivateBlock() {
    this.nft_block = {}
    this.active_block_is_owner = false
    this.active_block_is_owned = true
  }

  public async get_banners(loading_indication=true) {

    this.get_banner(loading_indication)
    if (loading_indication) this.spinnerService.start_loading()
    this.bannerService.getAll().subscribe(
      (data: any) => {
        if ( data instanceof Object ) {
          for (let index = 1; index <= environment.banners; index++) {
            if ( index <= environment.banners / 2) {
              if ( data[index] ) {
                this.banners_l[index - 1] = data[index] 
              } else {
                this.banners_l[index - 1] = {}
              }
            } else {
              if ( data[index] ) {
                this.banners_r[index - 1 - (environment.banners / 2)] = data[index]
              } else {
                this.banners_r[index - 1 - (environment.banners / 2)] = {}
              }
            }
          }
        }
        if (loading_indication) this.spinnerService.stop_loading()
      },
      err => {
        if (loading_indication) this.spinnerService.stop_loading()
      }
    )
  }

  public async get_nft_blocks(loading_indication=true) {

    //this.get_banner(loading_indication)
    for (let index = 1; index <= environment.board; index++) {
      this.board[index - 1] = { block_id : index }
    }
    if (loading_indication) this.spinnerService.start_loading()
    this.blockService.getAll().subscribe(
      (data: any) => {
        if ( data instanceof Object ) {
          console.log('--------- API blocks -----------')
          console.log(data)
          let value: any;
          for (value of Object.values(data)) { 
            this.board[value?.block_attributes?.block_id - 1] = value
            this.board[value?.block_attributes?.block_id - 1].block_id = value.block_attributes?.block_id
          }
        }
        if (loading_indication) this.spinnerService.stop_loading()
      },
      err => {
        if (loading_indication) this.spinnerService.stop_loading()
      }
    )
  }

  // public async get_owned_nft_blocks(loading_indication=true) {
  //   if ( this.web3Service.account_address.length && this.web3Service.is_valid_network ) {
  //     this.bannerService.getAll({address : this.web3Service.account_address, with_content : true}).subscribe(
  //       (data: any) => {
  //         this.owned_nft_blocks = data
  //       }
  //     )
  //   } else {
  //     this.owned_nft_blocks = {}
  //   }
  //   this.web3Service.get_owned_blocks(loading_indication).then((v:string) => {
  //     let arr = v.split("|")
  //     arr.shift()
  //     this.contract_owned_nft_blocks = arr
  //   })
  // }

  public async get_banner(loading_indication=true) {
    if (this.active_banner_id) {
      if (loading_indication) this.spinnerService.start_loading()
      this.bannerService.get(this.active_banner_id).subscribe(
        (data: any) => {
          this.banner = data
          this.active_banner_is_owned = data.banner_attributes.timestamp_minted
          this.get_banner_contract_data(loading_indication)
          if (this.active_banner_is_owned) {
            this.web3Service.is_owner_of_banner(this.active_banner_id, loading_indication).then((v:any) => {
              this.active_banner_is_owner = v
            })
          }
          if (loading_indication) this.spinnerService.stop_loading()
        },
        err => {
          if (loading_indication) this.spinnerService.stop_loading()
        }
      )
    }
  }

  public async get_nft_block(loading_indication=true) {
    if (this.active_block_id) {
      if (loading_indication) this.spinnerService.start_loading()
      this.blockService.get(this.active_block_id).subscribe(
        (data: any) => {
          console.log('--------- API Block '+this.active_block_id+' -----------')
          console.log(data)
          this.nft_block = data
          this.active_block_is_owned = data.block_attributes.timestamp_minted
          this.get_nft_block_contract_data(loading_indication)
          if (this.active_block_is_owned) {
            this.web3Service.is_owner_of_block(this.active_block_id, loading_indication).then((v:any) => {
              this.active_block_is_owner = v
            })
          }
          if (loading_indication) this.spinnerService.stop_loading()
        },
        err => {
          if (loading_indication) this.spinnerService.stop_loading()
        }
      )
    }
  }

  public async get_banner_contract_data(loading_indication=true) {
    this.web3Service.get_banner_data(this.active_banner_id).then((data:any) => {
      if ( data ) {
        if (Object.keys(data).length)  {
          this.banner.name = data[0] ? data[0].replace(/\u0000/g,'') : '' 
          this.banner.description = data[1] ? data[1].replace(/\u0000/g,'') : '' 
          this.banner.content = data[2] ? data[2].replace(/\u0000/g,'') : ''
        }
      }
    })
  }

  public async get_nft_block_contract_data(loading_indication=true) {
    this.web3Service.get_nft_block_data(this.active_block_id).then((data:any) => {
      if ( data ) {
        console.log('--------- Contract Block '+this.active_block_id+' -----------')
        console.log(data)
        if (Object.keys(data).length)  {
          this.nft_block.name = data[0] ? data[0].replace(/\u0000/g,'') : '' 
          this.nft_block.description = data[1] ? data[1].replace(/\u0000/g,'') : '' 
          this.nft_block.content = data[2] ? data[2].replace(/\u0000/g,'') : ''
        }
      }
    })
  }

  // public async get_nft_block_contract_data(loading_indication=true) {
  //   this.web3Service.get_data(this.active_block_id).then((data:any) => {
  //     if ( data ) {
  //       if (Object.keys(data).length)  {
  //         this.nft_block.name = data[0] ? data[0] : '' 
  //         this.nft_block.description = data[1] ? data[1] : '' 
  //         this.nft_block.link = data[2] ? data[2] : '' 
  //         this.nft_block.content = data[3] ? data[3] : ''
  //       }
  //     }
  //   })
  // }

  public async get_player_data(loading_indication=true) {
    this.web3Service.get_player_data(loading_indication).then((data:any) => {
      if ( data ) {
        if (Object.keys(data).length)  {
          this.player_data.last_roll = data[0]
          this.player_data.grid = data[1]
          this.player_data.points = data[2]
          this.player_data.last_game = data[3]
          this.player_data.cooldown = Number( data[4] ) * 1000
        } 
      }
      console.log('--------- Contract Matunity getPlayerData -----------')
      console.log(this.player_data)
    })
  }

  public async get_roll_price(loading_indication=true) {
    this.web3Service.get_roll_price(loading_indication).then((data:any) => {
      if ( data.preview ) {
        this.roll_price = data.preview
      }
    })
  }

  public async roll(loading_indication=true) {
    if (this.player_data.cooldown <= new Date().getTime()) {
      this.web3Service.roll(loading_indication).then((data:any) => {
        if (Object.keys(data).length)  {
          if (data.events?.Roll) {
            this.player_data.last_roll = data.events?.Roll?.returnValues?.roll
            this.player_data.grid = data.events?.Roll?.returnValues?.location
            //this.player_data.last_game = data[3]
            //this.player_data.cooldown = Number( data[4] ) * 1000
          }
          if (data.events?.Won) {
            this.player_data.cooldown = new Date().getTime() + Number( environment.cooldown ) * 1000
            this.player_data.points = data.events?.Won?.returnValues?.points
          }
        } 
        console.log('--------- Contract Matunity roll -----------')
        console.log(data)
        console.log(this.player_data)
        console.log('/------------/')
      })
    } else {
      // Show cooldown error
    }
  }

  public async get_game_points(loading_indication=true) {
    this.web3Service.get_game_points(loading_indication).then((value:any) => {
      this.game_points = value
    })
  }

  public async get_grid_price(loading_indication=true) {
    this.web3Service.get_grid_price(loading_indication).then((value:any) => {
      this.grid_price = value
    })
  }

  public async get_points_for_prize(loading_indication=true) {
    this.web3Service.get_points_for_prize(loading_indication).then((value:any) => {
      this.points_for_prize = value
    })
  }

  public async get_prize_percentage(loading_indication=true) {
    this.web3Service.get_prize_percentage(loading_indication).then((value:any) => {
      this.prize_percentage = Math.round(value * 100) / 10000
    })
  }

  public async get_prize_pool(loading_indication=true) {
    this.web3Service.get_prize_pool(loading_indication).then((value:any) => {
      this.prize_pool = value
    })
  }

  public async get_prize_data(loading_indication=true) {
    this.web3Service.get_prize_data(loading_indication).then((value:any) => {
      this.prize = value
    })
  }

  public async claim_prize(loading_indication=true) {
    this.web3Service.claim_prize().then((value:any) => {
      this.load_data()
      this.load_initial_data(true)
    })
  }

  public reverse_row( index:number ) {
    return (Math.floor( index / 7 )%2) == 1
  }

}