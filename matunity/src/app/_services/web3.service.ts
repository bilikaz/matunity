

import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import Web3 from 'web3';
import Web3Modal from "web3modal";
import { AbiItem } from 'web3-utils'
import { environment } from '../../environments/environment';

import { SpinnerService } from './spinner.service';



@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private web3!: Web3
  private web3_modal: Web3Modal
  private banner_contract: any
  private game_contract: any
  private accounts: string[] = []
  private add_listeners: boolean = true

  public  web3_available: boolean = true
  public  show_wallet_connect: boolean = false
  public  is_loading: boolean = false
  public  is_valid_network: boolean = true
  public  ether_balance: any
  public  preview_ether_balance: any
  public  account_address: any = NaN
  public  preview_account_address: any = NaN
  public  last_transaction: any = {}

  public AddressChangedEvent = new EventEmitter()
  public NetworkChangedEvent = new EventEmitter()
  public WalletConnectedEvent = new EventEmitter()
  public BlockDataChangedEvent = new EventEmitter()

  constructor(
    public ng_zone: NgZone,
    public spinnerService: SpinnerService,
  ) {
    this.web3_modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {}
    });
  }

  async init() {
    try {
      if ( ! Web3?.givenProvider?.isMetaMask ) {
        this.web3_available = false
        return
      }
      if (this.web3_modal.cachedProvider) {
        await this.connect_wallet();
      }
      if ( !this.web3 ) {
        this.show_wallet_connect = true
      }
    } catch (error) {
      console.log(error)
      this.web3_available = false
      await this.web3_modal.clearCachedProvider()
    }
  }

  public async init_contracts() {
    if ( await this.web3.eth.net.isListening() && this.is_valid_network ) {
      this.banner_contract =
        new this.web3.eth.Contract(
          environment.banner_abi as AbiItem[],
          environment.banner_address
        )

      this.game_contract =
        new this.web3.eth.Contract(
          environment.matunity_abi as AbiItem[],
          environment.matunity_address
        )
    }
  }

  public async connect_wallet() {
    try {
      const provider = await this.web3_modal.connect()

      this.spinnerService.start_loading()

      this.web3 = new Web3(provider)

      this.is_valid_network = await this.web3.eth.net.getId() === environment.network_id

      await this.handle_events(provider)
      await this.init_contracts()
      await this.get_accounts(false) 
      this.WalletConnectedEvent.emit()

    } catch (error) {
      console.log(error)
      await this.web3_modal.clearCachedProvider()
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async switch_to_polygon() {
    try {
      await (this.web3.currentProvider! as any).request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (error:any) {
      if (error.code === 4902) {
        try {
          await (this.web3.currentProvider! as any).request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon",
                rpcUrls: ["https://polygon-rpc.com/"],
                nativeCurrency: {
                  name: "Matic",
                  symbol: "Matic",
                  decimals: 18,
                }
              },
            ],
          });
        } catch (error:any) {
          alert(error.message);
        }
      }
    }
  }

  public async disconnect_wallet() {
    await this.web3_modal.clearCachedProvider()
    window.location.reload()
  }

  public async get_accounts(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( await this.web3.eth.net.isListening() ) {
        await this.web3.eth.getAccounts().then(async ( accounts: any ) => {
          if ( accounts.length ) {
            this.accounts = accounts
            this.account_address = this.accounts[0]
            this.preview_account_address = this.account_address.substring(0, 6) + '...' + this.account_address.substr(-4)
            this.show_wallet_connect = false
            this.refresh_balance(false)
          } else {
            this.show_wallet_connect = true
            await this.web3_modal.clearCachedProvider()
          }
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async refresh_balance(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.is_valid_network ) {
        this.web3.eth.getBalance(this.accounts[0]).then( (balance: any) => {
          this.ether_balance = this.web3.utils.fromWei(balance, 'ether')
          this.preview_ether_balance = Number(this.ether_balance).toFixed(3)
        } )
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async mint(banner_id: number) {
    try {
      if ( !banner_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        await this.banner_contract.methods.mint(
          banner_id
        ).send({from: this.account_address, value: this.web3.utils.toWei( environment.mint_price, 'ether')})
      }
    } catch (error) {
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
      this.BlockDataChangedEvent.emit()
    }
  } 

  public async mint_nft_block(block_id: number) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        await this.game_contract.methods.mint(
          block_id
        ).send({from: this.account_address, value: this.web3.utils.toWei( environment.mint_price, 'ether')})
      }
    } catch (error) {
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
      this.BlockDataChangedEvent.emit()
    }
  } 

  public async is_owner_of_banner(banner_id: number, loading_indication:boolean=true) { 
    try {
      if ( !banner_id ) { return false }
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return await this.banner_contract.methods.ownerOf(
          banner_id
        ).call().then( async (address: any) => {
          return address == this.account_address 
        } )
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  } 

  public async is_owner_of_block(block_id: number, loading_indication:boolean=true) { 
    try {
      if ( !block_id ) { return false }
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return await this.game_contract.methods.ownerOf(
          block_id
        ).call().then( async (address: any) => {
          return address == this.account_address 
        } )
      } else {
        return false
      }
    } catch (error) {
      console.log(error)
      return false
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  } 

  public async get_banner_data(banner_id:number, loading_indication:boolean=true) {
    try {
      if ( !banner_id ) { return }
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.banner_contract.methods.getAllTokenData(
          banner_id
        ).call().then((content: any) => {
          console.log(content)
          if (Object.keys(content).length)  {
            for (var key in content) {
              if( content.hasOwnProperty(key) && content[key] && content[key].length && this.web3.utils.isHexStrict(content[key]) ) {
                content[key] = this.web3.utils.toAscii(content[key]) 
              }
            }
            return content
          } else {
            return {}
          }
        } )
      } else {
        return {}
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_nft_block_data(block_id:number, loading_indication:boolean=true) {
    try {
      if ( !block_id ) { return }
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.getAllTokenData(
          block_id
        ).call().then((content: any) => {
          console.log(content)
          if (Object.keys(content).length)  {
            for (var key in content) {
              if( content.hasOwnProperty(key) && content[key] && content[key].length && this.web3.utils.isHexStrict(content[key]) ) {
                content[key] = this.web3.utils.toAscii(content[key]) 
              }
            }
            return content
          } else {
            return {}
          }
        } )
      } else {
        return {}
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async set_name(block_id:number, name:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.banner_contract.methods.setTokenName(
          block_id, this.web3.utils.toHex(name)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async set_nft_block_name(block_id:number, name:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.game_contract.methods.setTokenName(
          block_id, this.web3.utils.toHex(name)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async set_description(block_id:number, description:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.banner_contract.methods.setTokenDescription(
          block_id, this.web3.utils.toHex(description)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async set_nft_block_description(block_id:number, description:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.game_contract.methods.setTokenDescription(
          block_id, this.web3.utils.toHex(description)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }


  public async set_data(block_id:number, title:string, description:string, payload:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.game_contract.methods.setTokeData(
          block_id,
          this.web3.utils.toHex(title),
          this.web3.utils.toHex(description),
          this.web3.utils.toHex(payload),
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async set_banner_data(block_id:number, title:string, description:string, payload:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.banner_contract.methods.setTokeData(
          block_id,
          this.web3.utils.toHex(title),
          this.web3.utils.toHex(description),
          this.web3.utils.toHex(payload),
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()
    }
  }

  public async set_source(block_id:number, payload:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.banner_contract.methods.setTokenContent(
          block_id, this.web3.utils.toHex(payload)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()  
    }
  }

  public async set_nft_block_source(block_id:number, payload:string ) {
    try {
      if ( !block_id ) { return }
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.game_contract.methods.setTokenContent(
          block_id, this.web3.utils.toHex(payload)
        ).send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()  
    }
  }

  //--------------------------- Board Game -------------------------------//



  public async get_player_data(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.getPlayerData(
          this.account_address
        ).call().then((content: any) => {
          return content
        } )
      } else {
        return {}
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_roll_price(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.rollPrice().call().then((price: any) => {
          return {
            price : price,
            preview : this.web3.utils.fromWei( String( price ) )
          }
        } )
      } else {
        return NaN
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_game_points(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.pointsPerGame().call().then((points: any) => {
          return points
        } )
      } else {
        return NaN
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_grid_price(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.pointPrice().call().then((price: any) => {
          return price
        } )
      } else {
        return NaN
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_points_for_prize(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.pointsForPrize().call().then((price: any) => {
          return price
        } )
      } else {
        return NaN
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_prize_percentage(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.prizePercentage().call().then((percentage: any) => {
          return percentage
        } )
      } else {
        return NaN
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_prize_pool(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.prizePool().call().then((pool: any) => {
          return {
            pool : pool,
            preview : this.web3.utils.fromWei( String( pool ) )
          }
        } )
      } else {
        return {}
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async get_prize_data(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        return this.game_contract.methods.getPrizeData().call().then((pool: any) => {
          if (Object.keys(pool).length)  {
            return this.web3.utils.fromWei( String( pool[1] ) )
          } else {
            return '0'
          }
        } )
      } else {
        return '0'
      }
    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async roll(loading_indication:boolean=true) {
    try {
      if (loading_indication) this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = 
          await this.get_roll_price(loading_indication).then((price:any) => {
            console.log('Roll PRICE : ' + Number(price.price))
            return this.game_contract.methods.roll(
              Math.floor(Math.random() * 1000000)
            ).send({from: this.account_address, value: Number(price.price)}).then((data: any) => {
              return data
            } )
          }) 
        return this.last_transaction
      }

    } catch (error) {
      console.log(error)
    } finally {
      if (loading_indication) this.spinnerService.stop_loading()
    }
  }

  public async claim_prize() {
    try {
      this.spinnerService.start_loading()
      if ( this.account_address.length && this.is_valid_network ) {
        this.last_transaction = await this.game_contract.methods.claimPrize().send({from: this.account_address})
        this.BlockDataChangedEvent.emit()
      }
    } catch (error) {
      this.last_transaction = {}
      console.log(error)
    } finally {
      this.spinnerService.stop_loading()  
    }
  }



  //--------------------------- Helpers -------------------------------//

  public is_owner_of_resource(address:string ) {
    if ( this.account_address.length ) {
      return this.web3.utils.toChecksumAddress(address) == this.web3.utils.toChecksumAddress(this.account_address)
    } else {
      return false
    }
    
  }


  public async handle_events(provider: any) {

    if (!provider.on || !this.add_listeners) {
      return;
    }
    this.add_listeners = false

    provider.on("close", async () => {
      this.ng_zone.run( async ()=> {
        await this.web3_modal.clearCachedProvider();
      })
      console.log('Closed')
      window.location.reload()
    });
    provider.on("disconnect", async () => {
      this.ng_zone.run( async ()=> {
        await this.web3_modal.clearCachedProvider();
      })
      console.log('Disconnected')
      window.location.reload()
    });
    provider.on("accountsChanged", async (accounts: string[]) => {
      this.ng_zone.run( async ()=> {
        await this.get_accounts()
        this.AddressChangedEvent.emit()
      })
    });
    provider.on("chainChanged", async (chainId: number) => {
      this.ng_zone.run( async ()=> {
        this.connect_wallet()
        console.log('chainChanged')
        this.NetworkChangedEvent.emit()
      })
    });
  };

}